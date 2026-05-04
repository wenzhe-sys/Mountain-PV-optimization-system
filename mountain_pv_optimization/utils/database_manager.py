import sqlite3
import json
import os
from typing import Dict, Optional, List, Any
import functools
from collections import OrderedDict
import threading

class DatabaseManager:
    """
    数据库管理类，用于存储和检索算例优化结果
    """
    def __init__(self, db_path: str = "optimization_results.db"):
        """
        初始化数据库管理器
        
        Args:
            db_path: 数据库文件路径
        """
        self.db_path = db_path
        self._create_tables()
        # 使用OrderedDict实现LRU缓存，优先保留最近使用的缓存项
        self._cache = OrderedDict()
        # 缓存大小限制，默认存储100个结果
        self._cache_size = 100
        # 线程锁，确保缓存操作的线程安全
        self._cache_lock = threading.Lock()
        # 数据库连接池，避免频繁创建和销毁连接
        self._conn_pool = []
        self._max_connections = 5
        self._conn_lock = threading.Lock()
    
    def _create_tables(self):
        """
        创建数据库表
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            # 创建算例结果表
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS optimization_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                instance_id TEXT NOT NULL,
                use_dqn BOOLEAN NOT NULL,
                max_iter INTEGER NOT NULL,
                result TEXT NOT NULL,
                total_cost REAL,
                efficiency REAL,
                reliability REAL,
                lcoe REAL,
                coverage_rate REAL,
                trench_optimization_rate REAL,
                constraint_satisfaction REAL,
                civil_cost REAL,
                operation_cost REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # 迁移旧数据库：添加可能缺失的列
            try:
                cursor.execute("SELECT total_cost FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                # total_cost 列不存在，添加它
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN total_cost REAL")
                print("数据库迁移：已添加 total_cost 列")
            
            try:
                cursor.execute("SELECT efficiency FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN efficiency REAL")
                print("数据库迁移：已添加 efficiency 列")
            
            try:
                cursor.execute("SELECT reliability FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN reliability REAL")
                print("数据库迁移：已添加 reliability 列")
            
            try:
                cursor.execute("SELECT lcoe FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN lcoe REAL")
                print("数据库迁移：已添加 lcoe 列")
            
            try:
                cursor.execute("SELECT coverage_rate FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN coverage_rate REAL")
                print("数据库迁移：已添加 coverage_rate 列")
            
            try:
                cursor.execute("SELECT trench_optimization_rate FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN trench_optimization_rate REAL")
                print("数据库迁移：已添加 trench_optimization_rate 列")
            
            try:
                cursor.execute("SELECT constraint_satisfaction FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN constraint_satisfaction REAL")
                print("数据库迁移：已添加 constraint_satisfaction 列")
            
            try:
                cursor.execute("SELECT civil_cost FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN civil_cost REAL")
                print("数据库迁移：已添加 civil_cost 列")
            
            try:
                cursor.execute("SELECT operation_cost FROM optimization_results LIMIT 1")
            except sqlite3.OperationalError:
                cursor.execute("ALTER TABLE optimization_results ADD COLUMN operation_cost REAL")
                print("数据库迁移：已添加 operation_cost 列")
            # 创建索引，加快查询速度
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_instance_id 
            ON optimization_results (instance_id, use_dqn, max_iter)
            ''')
            # 创建时间索引，加快按时间查询速度
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_created_at 
            ON optimization_results (created_at)
            ''')
            # 创建成本索引，加快按成本查询速度
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_total_cost 
            ON optimization_results (total_cost)
            ''')
            # 创建效率索引，加快按效率查询速度
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_efficiency 
            ON optimization_results (efficiency)
            ''')
            # 创建可靠性索引，加快按可靠性查询速度
            cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_reliability 
            ON optimization_results (reliability)
            ''')
            conn.commit()
    
    def _get_cache_key(self, instance_id: str, use_dqn: bool, max_iter: int) -> str:
        """
        生成缓存键
        
        Args:
            instance_id: 算例ID
            use_dqn: 是否使用DQN
            max_iter: 最大迭代次数
        
        Returns:
            str: 缓存键
        """
        return f"{instance_id}_{use_dqn}_{max_iter}"
    
    def _get_connection(self):
        """
        从连接池中获取数据库连接
        
        Returns:
            sqlite3.Connection: 数据库连接
        """
        with self._conn_lock:
            if self._conn_pool:
                return self._conn_pool.pop()
        # 如果连接池为空，创建新连接
        return sqlite3.connect(self.db_path)
    
    def _release_connection(self, conn):
        """
        释放数据库连接到连接池
        
        Args:
            conn: 数据库连接
        """
        with self._conn_lock:
            if len(self._conn_pool) < self._max_connections:
                self._conn_pool.append(conn)
            else:
                # 如果连接池已满，关闭连接
                conn.close()
    
    def _close_all_connections(self):
        """
        关闭所有数据库连接
        """
        with self._conn_lock:
            for conn in self._conn_pool:
                try:
                    conn.close()
                except:
                    pass
            self._conn_pool.clear()
    
    def _update_cache(self, key: str, result: Dict):
        """
        更新缓存
        
        Args:
            key: 缓存键
            result: 优化结果
        """
        with self._cache_lock:
            # 如果缓存已满，删除最旧的条目
            if len(self._cache) >= self._cache_size:
                self._cache.popitem(last=False)
            # 如果键已存在，先删除再添加，保证最新使用
            if key in self._cache:
                del self._cache[key]
            # 添加新条目到缓存
            self._cache[key] = result
    
    def store_result(self, instance_id: str, use_dqn: bool, max_iter: int, result: Dict) -> bool:
        """
        存储优化结果到数据库
        
        Args:
            instance_id: 算例ID
            use_dqn: 是否使用DQN
            max_iter: 最大迭代次数
            result: 优化结果
        
        Returns:
            bool: 存储是否成功
        """
        try:
            # 提取关键指标
            metrics = result.get('metrics', {})
            total_cost = metrics.get('total_cost')
            efficiency = metrics.get('efficiency')
            reliability = metrics.get('reliability')
            lcoe = metrics.get('lcoe')
            coverage_rate = metrics.get('coverage_rate')
            trench_optimization_rate = metrics.get('trench_optimization_rate')
            constraint_satisfaction = metrics.get('constraint_satisfaction')
            civil_cost = metrics.get('civil_cost')
            operation_cost = metrics.get('operation_cost')
            
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                # 先删除已有的相同条件的结果
                cursor.execute('''
                DELETE FROM optimization_results 
                WHERE instance_id = ? AND use_dqn = ? AND max_iter = ?
                ''', (instance_id, use_dqn, max_iter))
                # 插入新结果，包括关键指标字段
                cursor.execute('''
                INSERT INTO optimization_results (instance_id, use_dqn, max_iter, result, total_cost, efficiency, reliability, lcoe, coverage_rate, trench_optimization_rate, constraint_satisfaction, civil_cost, operation_cost)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (instance_id, use_dqn, max_iter, json.dumps(result), total_cost, efficiency, reliability, lcoe, coverage_rate, trench_optimization_rate, constraint_satisfaction, civil_cost, operation_cost))
                conn.commit()
            finally:
                self._release_connection(conn)
            # 更新缓存
            cache_key = self._get_cache_key(instance_id, use_dqn, max_iter)
            self._update_cache(cache_key, result)
            return True
        except Exception as e:
            print(f"存储结果失败: {e}")
            return False
    
    def get_result(self, instance_id: str, use_dqn: bool, max_iter: int) -> Optional[Dict]:
        """
        从数据库中获取优化结果
        
        Args:
            instance_id: 算例ID
            use_dqn: 是否使用DQN
            max_iter: 最大迭代次数
        
        Returns:
            Optional[Dict]: 优化结果，如果不存在则返回None
        """
        # 先从缓存中获取
        cache_key = self._get_cache_key(instance_id, use_dqn, max_iter)
        with self._cache_lock:
            if cache_key in self._cache:
                # 标记为最近使用
                result = self._cache.pop(cache_key)
                self._cache[cache_key] = result
                return result
        
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT result FROM optimization_results 
                WHERE instance_id = ? AND use_dqn = ? AND max_iter = ?
                ''', (instance_id, use_dqn, max_iter))
                row = cursor.fetchone()
                if row:
                    result = json.loads(row[0])
                    # 更新缓存
                    self._update_cache(cache_key, result)
                    return result
                return None
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"获取结果失败: {e}")
            return None
    
    def delete_result(self, instance_id: str, use_dqn: bool, max_iter: int) -> bool:
        """
        从数据库中删除优化结果
        
        Args:
            instance_id: 算例ID
            use_dqn: 是否使用DQN
            max_iter: 最大迭代次数
        
        Returns:
            bool: 删除是否成功
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                DELETE FROM optimization_results 
                WHERE instance_id = ? AND use_dqn = ? AND max_iter = ?
                ''', (instance_id, use_dqn, max_iter))
                conn.commit()
            finally:
                self._release_connection(conn)
            # 从缓存中删除
            cache_key = self._get_cache_key(instance_id, use_dqn, max_iter)
            with self._cache_lock:
                if cache_key in self._cache:
                    del self._cache[cache_key]
            return True
        except Exception as e:
            print(f"删除结果失败: {e}")
            return False
    
    def list_results(self) -> list:
        """
        列出所有优化结果
        
        Returns:
            list: 所有优化结果的列表
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT id, instance_id, use_dqn, max_iter, created_at FROM optimization_results
                ORDER BY created_at DESC
                ''')
                rows = cursor.fetchall()
                return [{
                    "id": row[0],
                    "instance_id": row[1],
                    "use_dqn": row[2],
                    "max_iter": row[3],
                    "created_at": row[4]
                } for row in rows]
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"列出结果失败: {e}")
            return []
    
    def clear_results(self) -> bool:
        """
        清空所有优化结果
        
        Returns:
            bool: 清空是否成功
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('DELETE FROM optimization_results')
                conn.commit()
            finally:
                self._release_connection(conn)
            # 清空缓存
            with self._cache_lock:
                self._cache.clear()
            return True
        except Exception as e:
            print(f"清空结果失败: {e}")
            return False
    
    def get_results_by_instance(self, instance_id: str) -> list:
        """
        获取指定算例的所有优化结果
        
        Args:
            instance_id: 算例ID
        
        Returns:
            list: 优化结果列表
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT result FROM optimization_results 
                WHERE instance_id = ?
                ORDER BY created_at DESC
                ''', (instance_id,))
                rows = cursor.fetchall()
                return [json.loads(row[0]) for row in rows]
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"获取算例结果失败: {e}")
            return []
    
    def get_results_by_cost_range(self, min_cost: float, max_cost: float) -> list:
        """
        根据成本范围查询结果
        
        Args:
            min_cost: 最小成本
            max_cost: 最大成本
        
        Returns:
            list: 优化结果列表
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT result FROM optimization_results 
                WHERE total_cost BETWEEN ? AND ?
                ORDER BY total_cost ASC
                ''', (min_cost, max_cost))
                rows = cursor.fetchall()
                return [json.loads(row[0]) for row in rows]
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"根据成本范围查询结果失败: {e}")
            return []
    
    def get_results_by_efficiency_range(self, min_efficiency: float, max_efficiency: float) -> list:
        """
        根据效率范围查询结果
        
        Args:
            min_efficiency: 最小效率
            max_efficiency: 最大效率
        
        Returns:
            list: 优化结果列表
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT result FROM optimization_results 
                WHERE efficiency BETWEEN ? AND ?
                ORDER BY efficiency DESC
                ''', (min_efficiency, max_efficiency))
                rows = cursor.fetchall()
                return [json.loads(row[0]) for row in rows]
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"根据效率范围查询结果失败: {e}")
            return []
    
    def get_results_by_reliability_range(self, min_reliability: float, max_reliability: float) -> list:
        """
        根据可靠性范围查询结果
        
        Args:
            min_reliability: 最小可靠性
            max_reliability: 最大可靠性
        
        Returns:
            list: 优化结果列表
        """
        try:
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute('''
                SELECT result FROM optimization_results 
                WHERE reliability BETWEEN ? AND ?
                ORDER BY reliability DESC
                ''', (min_reliability, max_reliability))
                rows = cursor.fetchall()
                return [json.loads(row[0]) for row in rows]
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"根据可靠性范围查询结果失败: {e}")
            return []
    
    def get_best_results(self, sort_by: str = 'total_cost', limit: int = 10) -> list:
        """
        获取最优结果
        
        Args:
            sort_by: 排序字段 (total_cost, efficiency, reliability)
            limit: 返回结果数量限制
        
        Returns:
            list: 优化结果列表
        """
        try:
            # 验证排序字段
            valid_sort_fields = ['total_cost', 'efficiency', 'reliability']
            if sort_by not in valid_sort_fields:
                sort_by = 'total_cost'
            
            # 确定排序方向
            order_direction = 'ASC' if sort_by == 'total_cost' else 'DESC'
            
            conn = self._get_connection()
            try:
                cursor = conn.cursor()
                cursor.execute(f'''
                SELECT result FROM optimization_results 
                ORDER BY {sort_by} {order_direction}
                LIMIT ?
                ''', (limit,))
                rows = cursor.fetchall()
                return [json.loads(row[0]) for row in rows]
            finally:
                self._release_connection(conn)
        except Exception as e:
            print(f"获取最优结果失败: {e}")
            return []

# 创建全局数据库管理器实例
db_manager = DatabaseManager()
