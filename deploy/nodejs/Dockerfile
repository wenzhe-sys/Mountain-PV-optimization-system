# Node.js 后端服务Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制package.json
COPY backend/package.json ./
RUN npm install --production

# 复制源代码
COPY backend/ ./

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["node", "server.js"]