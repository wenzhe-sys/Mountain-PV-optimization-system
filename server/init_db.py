import sys
sys.path.insert(0, '/app')

from server.database import SessionLocal, engine, Base
from server.models import Instance, ModuleResult
from server.routers.instances import load_instances_from_directory
import os
import glob

def init_database():
    print("正在初始化数据库...")

    # 创建表
    Base.metadata.create_all(bind=engine)
    print("✓ 数据库表已创建")

    db = SessionLocal()

    try:
        # 检查是否已有数据
        existing = db.query(Instance).count()
        if existing > 0:
            print(f"✓ 数据库已有 {existing} 个算例，跳过初始化")
            return

        # 获取算例数据目录
        data_dir = os.environ.get('ALGORITHM_REPO_PATH', '/app/mountain_pv_optimization')
        instances_dir = os.path.join(data_dir, 'data', 'instances')

        if not os.path.exists(instances_dir):
            print(f"✗ 算例目录不存在: {instances_dir}")
            return

        # 加载所有算例
        instance_files = glob.glob(os.path.join(instances_dir, '*.json'))
        print(f"找到 {len(instance_files)} 个算例文件")

        loaded = 0
        for file_path in instance_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                instance_id = data.get('instance_id', os.path.splitext(os.path.basename(file_path))[0])

                instance = Instance(
                    instance_id=instance_id,
                    name=data.get('name', instance_id),
                    n_nodes=data.get('n_nodes', 0),
                    status='uploaded'
                )

                db.add(instance)
                loaded += 1

            except Exception as e:
                print(f"  加载算例失败 {file_path}: {e}")

        db.commit()
        print(f"✓ 成功加载 {loaded} 个算例")

        # 标记预置算例
        preloaded_ids = ['r1', 'r2', 'r3', 'r10', 'r11', 'r18', 'r19', 'r20', 'r28', 'r50', 'r54', 'r55', 'r65', 'r95', 'r97', 'r98', 'r99', 'r100', 'r101']
        for pid in preloaded_ids:
            inst = db.query(Instance).filter(Instance.instance_id == pid).first()
            if inst:
                inst.status = 'preloaded'
                print(f"  标记预置算例: {pid}")

        db.commit()
        print("✓ 预置算例标记完成")

    except Exception as e:
        print(f"✗ 初始化失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import json
    init_database()