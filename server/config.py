import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")
DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'db.sqlite3')}"

# 算法仓库路径 - 与 server 目录同级
ALGORITHM_REPO_PATH = os.path.join(os.path.dirname(BASE_DIR), "mountain_pv_optimization")
ALGORITHM_REPO_PATH = os.path.abspath(ALGORITHM_REPO_PATH)

SECRET_KEY = "mountain-pv-system-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

os.makedirs(UPLOAD_DIR, exist_ok=True)
