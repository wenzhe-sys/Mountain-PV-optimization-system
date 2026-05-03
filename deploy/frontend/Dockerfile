# 前端构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制package.json
COPY app/package.json ./
RUN npm install

# 复制源代码
COPY app/ ./

# 构建生产版本
RUN npm run build

# 生产阶段 - 使用Nginx
FROM nginx:alpine

# 复制构建产物到Nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
