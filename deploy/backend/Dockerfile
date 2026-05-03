# 后端服务Dockerfile - FastAPI
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制Python依赖文件
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY server/ ./server/

# 复制算法仓库代码
COPY mountain_pv_optimization/ ./mountain_pv_optimization/

# 创建必要的目录
RUN mkdir -p /app/server/data \
    /app/mountain_pv_optimization/data/results/module1 \
    /app/mountain_pv_optimization/data/results/module2 \
    /app/mountain_pv_optimization/data/results/module3 \
    /app/mountain_pv_optimization/outputs/visualizations

# 设置环境变量
ENV PYTHONPATH=/app
ENV ALGORITHM_REPO_PATH=/app/mountain_pv_optimization

# 暴露端口
EXPOSE 8003

# 启动命令
CMD ["python", "server/main.py"]