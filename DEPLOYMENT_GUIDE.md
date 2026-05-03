# GitHub 上传和服务器部署指南

## 第一步：上传项目到 GitHub

### 在本地项目目录执行 (PowerShell):

```powershell
# 进入项目目录
cd "C:\Users\er\OneDrive\桌面\pv-optimization-backup\pv-optimization"

# 清理 Git 锁文件
Remove-Item .git\index.lock -Force -ErrorAction SilentlyContinue

# 添加远程仓库
git remote add origin git@github.com:wenzhe-sys/Mountain-PV-optimization-system.git

# 添加文件并提交
git add -A
git commit -m "Initial commit: Complete mountain PV optimization system"

# 推送到 GitHub (创建 main 分支)
git branch -M main
git push -u origin main
```

**注意**：如果您的 SSH key 没有配置，可能需要使用 HTTPS:
```powershell
git remote set-url origin https://github.com/wenzhe-sys/Mountain-PV-optimization-system.git
git push -u origin main
```

---

## 第二步：在服务器上部署新实例

### 连接服务器:
```bash
ssh root@120.55.244.253
# 密码: 060927ljz.
```

### 检查当前部署状态:
```bash
# 查看当前运行的容器
docker ps -a

# 查看当前目录
ls -la /opt/

# 如果有旧部署，保留它
cd /opt/pv-optimization  # 旧实例目录
docker-compose ps        # 检查旧实例状态
```

### 部署新实例 (v2):
```bash
# 创建新实例目录
mkdir -p /opt/pv-optimization-v2
cd /opt/pv-optimization-v2

# 从 GitHub 克隆项目
git clone https://github.com/wenzhe-sys/Mountain-PV-optimization-system.git .

# 或者使用 SSH:
# git clone git@github.com:wenzhe-sys/Mountain-PV-optimization-system.git .

# 使用新的配置文件启动
cp docker-compose-v2.yml docker-compose.yml

# 构建并启动新实例
docker-compose up -d --build

# 检查状态
docker-compose ps
```

---

## 两个实例的访问地址

| 服务 | 原有实例 (保留) | 新实例 (v2) |
|------|----------------|------------|
| 前端 | http://120.55.244.253 | http://120.55.244.253:8080 |
| 后端API | http://120.55.244.253:8003 | http://120.55.244.253:8004 |
| API文档 | http://120.55.244.253:8003/docs | http://120.55.244.253:8004/docs |

---

## 阿里云安全组配置

请确保安全组开放以下端口:
- 80 (HTTP - 旧实例前端)
- 8080 (HTTP - 新实例前端)
- 8003 (后端API - 旧实例)
- 8004 (后端API - 新实例)
- 22 (SSH)

---

## 常用管理命令

### 旧实例 (原部署):
```bash
cd /opt/pv-optimization
docker-compose ps        # 查看状态
docker-compose logs -f   # 查看日志
docker-compose restart   # 重启
```

### 新实例 (v2):
```bash
cd /opt/pv-optimization-v2
docker-compose ps        # 查看状态
docker-compose logs -f   # 查看日志
docker-compose restart   # 重启
```

---

## 数据隔离

两个实例完全独立:
- 数据库分离 (MongoDB 独立容器)
- 数据目录隔离
- 配置和结果分开存储