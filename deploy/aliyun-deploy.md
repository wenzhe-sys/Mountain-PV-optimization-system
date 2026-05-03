# 阿里云服务器部署指南

## 一、准备工作

### 1. 购买阿里云服务器
- 推荐配置：2核4G内存，带宽2Mbps以上
- 操作系统：Ubuntu 22.04 LTS 或 CentOS 8
- 开放端口：80（HTTP）、443（HTTPS）、8003（后端API）

### 2. 准备域名（可选）
- 在阿里云购买域名
- 配置DNS解析到服务器IP

## 二、服务器环境配置

### 1. 连接服务器
```bash
ssh root@你的服务器IP
```

### 2. 安装Docker和Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 验证安装
```bash
docker --version
docker-compose --version
```

## 三、项目部署

### 1. 上传项目文件
```bash
# 在本地项目根目录执行，将项目上传到服务器
scp -r . root@你的服务器IP:/opt/pv-optimization/
```

或者使用Git克隆：
```bash
# 在服务器上执行
cd /opt
git clone 你的Git仓库地址 pv-optimization
cd pv-optimization
```

### 2. 启动服务
```bash
cd /opt/pv-optimization

# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. 验证部署
- 前端访问：http://你的服务器IP
- 后端API：http://你的服务器IP:8003/api/health
- WebSocket：ws://你的服务器IP:8003/ws/{client_id}

## 四、配置HTTPS（推荐）

### 1. 安装Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 2. 申请SSL证书（使用Certbot）
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名.com
```

### 3. 配置Nginx反向代理
编辑 `/etc/nginx/sites-available/pv-optimization`：
```nginx
server {
    listen 80;
    server_name 你的域名.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 你的域名.com;

    ssl_certificate /etc/letsencrypt/live/你的域名.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/你的域名.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8003/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /ws/ {
        proxy_pass http://localhost:8003/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/pv-optimization /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 五、常用运维命令

### 查看服务状态
```bash
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 重启服务
```bash
docker-compose restart
docker-compose restart backend
```

### 更新部署
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

### 备份数据
```bash
# 备份结果数据
tar -czvf backup-$(date +%Y%m%d).tar.gz data/results outputs/visualizations
```

### 监控资源使用
```bash
docker stats
```

## 六、故障排查

### 1. 服务无法启动
```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
sudo netstat -tlnp | grep 80
sudo netstat -tlnp | grep 8003
```

### 2. 前端无法访问API
- 检查Nginx配置是否正确
- 确认后端服务是否正常运行
- 查看浏览器开发者工具的Network面板

### 3. WebSocket连接失败
- 确认防火墙是否开放相应端口
- 检查Nginx WebSocket代理配置
- 查看后端日志是否有连接记录

## 七、安全建议

1. **修改默认端口**：将SSH默认22端口改为其他端口
2. **配置防火墙**：只开放必要的端口
3. **定期更新**：及时更新系统和Docker镜像
4. **数据备份**：定期备份重要数据
5. **监控告警**：配置服务器监控和告警

## 八、联系支持

如有问题，请查看项目文档或联系开发团队。
