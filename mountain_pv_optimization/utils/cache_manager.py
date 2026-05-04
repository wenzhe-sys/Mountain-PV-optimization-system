import json
import os
from typing import Dict, Optional, Any
import hashlib

class CacheManager:
    """
    缓存管理类，用于缓存算例数据、模块中间结果和指标计算结果
    """
    def __init__(self, cache_dir: str = None):
        if cache_dir is None:
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            cache_dir = os.path.join(project_root, "data", "cache")
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # 内存缓存，用于快速访问
        self._memory_cache = {
            'instance_data': {},  # 缓存算例数据
            'module1_output': {},  # 缓存模块一输出
            'module2_output': {},  # 缓存模块二输出
            'module3_output': {},  # 缓存模块三输出
            'metrics': {}  # 缓存指标计算结果
        }
        
        # 缓存过期时间（秒）
        self._cache_ttl = 3600  # 1小时
    
    def _get_cache_key(self, prefix: str, *args) -> str:
        """
        生成缓存键
        
        Args:
            prefix: 缓存前缀
            *args: 缓存参数
        
        Returns:
            str: 缓存键
        """
        key_str = f"{prefix}_{'_'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _get_cache_file(self, key: str) -> str:
        """
        获取缓存文件路径
        
        Args:
            key: 缓存键
        
        Returns:
            str: 缓存文件路径
        """
        return os.path.join(self.cache_dir, f"{key}.json")
    
    def get(self, category: str, *args) -> Optional[Any]:
        """
        获取缓存数据
        
        Args:
            category: 缓存类别
            *args: 缓存参数
        
        Returns:
            Optional[Any]: 缓存数据，如果不存在返回None
        """
        # 先从内存缓存中获取
        key = self._get_cache_key(category, *args)
        if category in self._memory_cache and key in self._memory_cache[category]:
            return self._memory_cache[category][key]
        
        # 从文件缓存中获取
        cache_file = self._get_cache_file(key)
        if os.path.exists(cache_file):
            # 检查缓存是否过期
            if os.path.getmtime(cache_file) + self._cache_ttl > os.path.getctime(cache_file):
                try:
                    with open(cache_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    # 存入内存缓存
                    if category not in self._memory_cache:
                        self._memory_cache[category] = {}
                    self._memory_cache[category][key] = data
                    return data
                except Exception as e:
                    print(f"读取缓存文件失败: {e}")
        
        return None
    
    def set(self, category: str, data: Any, *args) -> bool:
        """
        设置缓存数据
        
        Args:
            category: 缓存类别
            data: 缓存数据
            *args: 缓存参数
        
        Returns:
            bool: 缓存是否成功
        """
        try:
            # 存入内存缓存
            key = self._get_cache_key(category, *args)
            if category not in self._memory_cache:
                self._memory_cache[category] = {}
            self._memory_cache[category][key] = data
            
            # 存入文件缓存
            cache_file = self._get_cache_file(key)
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            return True
        except Exception as e:
            print(f"写入缓存文件失败: {e}")
            return False
    
    def clear(self, category: str = None) -> bool:
        """
        清除缓存
        
        Args:
            category: 缓存类别，如果为None则清除所有缓存
        
        Returns:
            bool: 清除是否成功
        """
        try:
            if category:
                # 清除指定类别的内存缓存
                if category in self._memory_cache:
                    self._memory_cache[category] = {}
                
                # 清除指定类别的文件缓存
                for file in os.listdir(self.cache_dir):
                    if file.startswith(self._get_cache_key(category, '')):
                        os.remove(os.path.join(self.cache_dir, file))
            else:
                # 清除所有内存缓存
                self._memory_cache = {
                    'instance_data': {},
                    'module1_output': {},
                    'module2_output': {},
                    'module3_output': {},
                    'metrics': {}
                }
                
                # 清除所有文件缓存
                for file in os.listdir(self.cache_dir):
                    os.remove(os.path.join(self.cache_dir, file))
            
            return True
        except Exception as e:
            print(f"清除缓存失败: {e}")
            return False
    
    def get_cache_size(self) -> Dict[str, int]:
        """
        获取缓存大小
        
        Returns:
            Dict[str, int]: 各缓存类别的大小
        """
        size = {}
        for category, items in self._memory_cache.items():
            size[category] = len(items)
        return size

# 创建全局缓存管理器实例
cache_manager = CacheManager()