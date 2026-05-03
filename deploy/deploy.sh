#!/bin/bash

# 阿里云部署脚本
# 用法: ./deploy.sh [服务器IP]

set -e

SERVER_IP=$1
PROJECT_NAME="pv-optimization"
REMOTE_DIR="/opt/$PROJECT_NAME"

if [ -z "$SERVER_IP" ]; then
    echo "用法: ./deploy.sh [服务器IP]"
    echo "例如: ./deploy.sh 123.45.67.89"
    exit 1
fi

echo "=========================================="
echo "开始部署到阿里云服务器: $SERVER_IP"
echo "=========================================="

# 1. 上传项目文件
echo "[1/5] 上传项目文件到服务器..."
ssh -o StrictHostKeyChecking=no root@$SERVER_IP "mkdir -p $REMOTE_DIR"

# 使用rsync上传（排除node_modules和.git）
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='.venv' \
    --exclude='venv' \
    ./ root@$SERVER_IP:$REMOTE_DIR/

echo "[2/5] 在服务器上安装Docker和Docker Compose..."
ssh root@$SERVER_IP << 'EOF'
    # 安装Docker（如果未安装）
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com | sh
        systemctl start docker
        systemctl enable docker
    fi
    
    # 安装Docker Compose（如果未安装）
    if ! command -v docker-compose &> /dev/null; then
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
EOF

echo "[3/5] 构建并启动服务..."
ssh root@$SERVER_IP << EOF
    cd $REMOTE_DIR
    
    # 停止旧服务
    docker-compose down 2>/dev/null || true
    
    # 构建并启动新服务
    docker-compose up -d --build
    
    # 等待服务启动
    sleep 10
EOF

echo "[4/5] 检查服务状态..."
ssh root@$SERVER_IP << EOF
    cd $REMOTE_DIR
    docker-compose ps
    
    # 检查健康状态
    echo "检查后端API健康状态..."
    curl -s http://localhost:8003/api/health || echo "后端服务可能还未完全启动"
EOF

echo "[5/5] 配置防火墙..."
ssh root@$SERVER_IP << 'EOF'
    # 开放端口
    if command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 8003/tcp
        ufw reload
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=8003/tcp
        firewall-cmd --reload
    fi
EOF

echo ""
echo "=========================================="
echo "部署完成!"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  前端: http://$SERVER_IP"
echo "  后端API: http://$SERVER_IP:8003"
echo "  健康检查: http://$SERVER_IP:8003/api/health"
echo ""
echo "常用命令:"
echo "  查看日志: ssh root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose logs -f'"
echo "  重启服务: ssh root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose restart'"
echo "  停止服务: ssh root@$SERVER_IP 'cd $REMOTE_DIR && docker-compose down'"
echo ""
