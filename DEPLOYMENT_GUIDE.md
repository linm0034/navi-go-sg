# NAVI-GO SG - 部署指南

## ⚠️ 重要提示

如果API返回404错误,说明Gateway没有使用最新代码。**必须重新构建Gateway容器!**

## 🚀 完整部署步骤

### 1. 停止并清理旧容器

```bash
# 停止所有容器
docker-compose down

# 删除旧的Gateway镜像(重要!)
docker rmi $(docker images | grep gateway | awk '{print $3}')

# 或者清理所有项目镜像
docker-compose down --rmi all
```

### 2. 重新构建所有服务

```bash
# 强制重新构建(不使用缓存)
docker-compose build --no-cache

# 或者只重新构建Gateway
docker-compose build --no-cache gateway
```

### 3. 启动所有服务

```bash
# 启动所有服务
docker-compose up

# 或者后台运行
docker-compose up -d
```

### 4. 等待服务启动

等待30-60秒,让所有Java服务完全启动。

### 5. 验证服务状态

```bash
# 查看所有服务状态
docker-compose ps

# 应该看到所有服务都是"Up"状态
```

## ✅ 测试API

### 直接测试后端服务(绕过Gateway)

```bash
# Weather API
curl http://localhost:4013/

# Hotel Ranking API  
curl http://localhost:4016/

# Heatmap API
curl http://localhost:4014/

# Chatbot API
curl -X POST http://localhost:4017/ -H "Content-Type: application/json" -d '{}'

# Auth API
curl -X POST http://localhost:4011/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

### 通过Gateway测试

```bash
# Weather
curl http://localhost:4000/api/weather

# Hotels
curl http://localhost:4000/api/ranking

# Heatmap
curl http://localhost:4000/api/heatmap

# Chatbot
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'

# Auth
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# Rewards
curl http://localhost:4000/api/rewards/show
```

## 🌐 访问前端

打开浏览器访问:

- **主应用**: http://localhost:3000
- **酒店地图**: http://localhost:5173

## 🔧 常见问题

### 问题1: API返回404

**原因**: Gateway容器使用了旧代码

**解决方案**:
```bash
docker-compose down
docker-compose build --no-cache gateway
docker-compose up
```

### 问题2: API返回504 Gateway Timeout

**原因**: 后端服务还没有完全启动

**解决方案**:
- 等待1-2分钟
- 检查服务日志: `docker-compose logs [service-name]`

### 问题3: Auth API无法启动

**原因**: CORS配置错误

**解决方案**:
- 检查日志: `docker-compose logs auth-api`
- 确保使用最新的zip文件
- 重新构建: `docker-compose build --no-cache auth-api`

### 问题4: 前端无法连接后端

**原因**: CORS或网络配置问题

**解决方案**:
- 检查浏览器控制台错误
- 确保所有服务都在运行: `docker-compose ps`
- 检查Gateway日志: `docker-compose logs gateway`

## 📊 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| Gateway | 4000 | 统一网关 |
| NAVI-GO Frontend | 3000 | 主前端应用 |
| Auth API | 4011 | 认证和奖励 |
| Weather API | 4013 | 天气服务 |
| Heatmap API | 4014 | 热力图 |
| Booking API | 4015 | 预订服务 |
| Hotel Ranking API | 4016 | 酒店排名 |
| Chatbot API | 4017 | 聊天机器人 |
| Map Frontend | 5173 | 酒店地图 |
| MySQL | 3307 | 数据库 |
| Redis | 6379 | 缓存 |

## 🐛 调试命令

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs gateway
docker-compose logs weather-api
docker-compose logs hotel-ranking-api

# 实时查看日志
docker-compose logs -f gateway

# 进入容器检查
docker-compose exec gateway sh
docker-compose exec weather-api sh

# 重启特定服务
docker-compose restart gateway
```

## 🔄 完全重置

如果遇到无法解决的问题,完全重置:

```bash
# 停止并删除所有容器、网络、卷
docker-compose down -v

# 删除所有相关镜像
docker rmi $(docker images | grep sg-tourist-guide | awk '{print $3}')

# 清理Docker缓存
docker system prune -a

# 重新开始
docker-compose up --build
```

## ✨ 成功标志

当所有服务正常运行时:

1. ✅ `docker-compose ps` 显示所有服务状态为"Up"
2. ✅ `curl http://localhost:4000/api/weather` 返回JSON数据
3. ✅ `curl http://localhost:4000/api/ranking` 返回酒店列表
4. ✅ 浏览器访问 http://localhost:3000 显示完整页面
5. ✅ 所有前端页面都能加载数据

祝您部署顺利! 🎉
