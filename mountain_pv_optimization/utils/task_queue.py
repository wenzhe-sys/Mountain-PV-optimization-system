import asyncio
import uuid
import time
from typing import Dict, Any, Optional
import threading

class Task:
    """
    任务类，用于表示优化任务
    """
    def __init__(self, task_id: str, instance_id: str, use_dqn: bool, max_iter: int, verbose: bool, fast_mode: bool):
        self.task_id = task_id
        self.instance_id = instance_id
        self.use_dqn = use_dqn
        self.max_iter = max_iter
        self.verbose = verbose
        self.fast_mode = fast_mode
        self.status = "pending"  # pending, running, completed, failed, cancelled
        self.result = None
        self.error = None
        self.start_time = None
        self.end_time = None
        self.progress = 0
        self.stage = "等待中"

class TaskQueue:
    """
    任务队列管理类，用于管理和处理优化任务
    """
    def __init__(self, max_concurrent_tasks: int = 2):
        self.tasks: Dict[str, Task] = {}
        self.queue = asyncio.Queue()
        self.max_concurrent_tasks = max_concurrent_tasks
        self.running_tasks = 0
        self.lock = threading.Lock()
        self.loop = asyncio.get_event_loop()
        self.is_running = False
        self.worker_thread = None
    
    def start(self):
        """
        启动任务队列
        """
        if not self.is_running:
            self.is_running = True
            self.worker_thread = threading.Thread(target=self._run_worker, daemon=True)
            self.worker_thread.start()
    
    def stop(self):
        """
        停止任务队列
        """
        self.is_running = False
        if self.worker_thread:
            self.worker_thread.join()
    
    def _run_worker(self):
        """
        运行工作线程，处理任务队列
        """
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self._process_tasks())
    
    async def _process_tasks(self):
        """
        处理任务队列中的任务
        """
        while self.is_running:
            try:
                # 等待任务，超时1秒
                task_id = await asyncio.wait_for(self.queue.get(), timeout=1.0)
                if task_id in self.tasks:
                    task = self.tasks[task_id]
                    if task.status == "pending":
                        # 检查是否可以运行新任务
                        with self.lock:
                            if self.running_tasks < self.max_concurrent_tasks:
                                self.running_tasks += 1
                                task.status = "running"
                                task.start_time = time.time()
                                # 异步执行任务
                                asyncio.create_task(self._execute_task(task))
                            else:
                                # 任务队列已满，重新放回队列
                                await self.queue.put(task_id)
            except asyncio.TimeoutError:
                # 超时，继续循环
                pass
            except Exception as e:
                print(f"处理任务时出错: {e}")
    
    async def _execute_task(self, task: Task):
        """
        执行优化任务
        """
        try:
            # 导入run_optimization函数
            from main import main as run_optimization
            
            # 定义进度更新回调函数
            async def update_progress(progress: int, stage: str, stage_progress: float):
                task.progress = progress
                task.stage = stage
            
            # 执行优化
            result = await asyncio.to_thread(run_optimization,
                instance_id=task.instance_id,
                use_dqn=task.use_dqn,
                max_iter=task.max_iter,
                verbose=task.verbose,
                fast_mode=task.fast_mode,
                progress_callback=update_progress
            )
            
            # 更新任务状态
            task.status = "completed"
            task.result = result
            task.end_time = time.time()
        except Exception as e:
            # 更新任务状态
            task.status = "failed"
            task.error = str(e)
            task.end_time = time.time()
        finally:
            # 减少运行任务计数
            with self.lock:
                self.running_tasks -= 1
    
    def submit_task(self, instance_id: str, use_dqn: bool, max_iter: int, verbose: bool, fast_mode: bool) -> str:
        """
        提交新任务
        
        Args:
            instance_id: 算例ID
            use_dqn: 是否使用DQN
            max_iter: 最大迭代次数
            verbose: 是否打印详细日志
            fast_mode: 是否使用快速模式
        
        Returns:
            str: 任务ID
        """
        # 生成任务ID
        task_id = str(uuid.uuid4())
        
        # 创建任务
        task = Task(
            task_id=task_id,
            instance_id=instance_id,
            use_dqn=use_dqn,
            max_iter=max_iter,
            verbose=verbose,
            fast_mode=fast_mode
        )
        
        # 添加到任务字典
        with self.lock:
            self.tasks[task_id] = task
        
        # 添加到队列
        self.loop.call_soon_threadsafe(self.queue.put_nowait, task_id)
        
        return task_id
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """
        获取任务信息
        
        Args:
            task_id: 任务ID
        
        Returns:
            Optional[Task]: 任务对象
        """
        with self.lock:
            return self.tasks.get(task_id)
    
    def cancel_task(self, task_id: str) -> bool:
        """
        取消任务
        
        Args:
            task_id: 任务ID
        
        Returns:
            bool: 取消是否成功
        """
        with self.lock:
            if task_id in self.tasks:
                task = self.tasks[task_id]
                if task.status == "pending":
                    task.status = "cancelled"
                    return True
        return False
    
    def list_tasks(self) -> list:
        """
        列出所有任务
        
        Returns:
            list: 任务列表
        """
        with self.lock:
            return [{
                "task_id": task.task_id,
                "instance_id": task.instance_id,
                "status": task.status,
                "progress": task.progress,
                "stage": task.stage,
                "start_time": task.start_time,
                "end_time": task.end_time
            } for task in self.tasks.values()]

# 创建全局任务队列实例
task_queue = TaskQueue(max_concurrent_tasks=2)
# 启动任务队列
task_queue.start()