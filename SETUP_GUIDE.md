# Singapore Tourist Guide - 完整设置指南

## 快速启动

### 1. 基本配置

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑.env文件,添加必要的API密钥
nano .env
```

### 2. 配置Google Maps API Key (Map功能需要)

Map前端需要Google Maps API Key才能正常工作。

**获取API Key:**
1. 访问 [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. 创建新项目或选择现有项目
3. 启用以下API:
   - Maps JavaScript API
   - Places API (可选)
4. 创建API密钥
5. 将API密钥添加到`.env`文件:

```bash
VITE_GOOGLE_MAPS_API_KEY=你的API密钥
```

**或者**在`apps/map-frontend/.env`中单独配置:

```bash
cd apps/map-frontend
cp .env.example .env
# 编辑.env添加API密钥
```

### 3. 启动服务

```bash
# 清理旧环境(如果之前运行过)
docker-compose down -v
docker builder prune -a -f

# 构建并启动所有服务
docker-compose up --build
```

### 4. 验证服务

等待所有服务启动后(大约1-2分钟),检查服务状态:

```bash
docker-compose ps
```

所有服务应该显示"Up"状态。

## 访问服务

### 后端API (通过Gateway)

| 端点 | URL | 说明 |
|------|-----|------|
| Gateway健康检查 | http://localhost:4000/healthz | 网关状态 |
| 认证 - 登录 | http://localhost:4000/api/auth/login | POST |
| 认证 - 注册 | http://localhost:4000/api/auth/register | POST |
| 奖励 | http://localhost:4000/api/rewards/show | GET |
| 天气 | http://localhost:4000/api/weather | GET |
| 热力图 | http://localhost:4000/api/heatmap | GET |
| 预订 | http://localhost:4000/api/booking | GET |
| 酒店排名 | http://localhost:4000/api/ranking | GET |
| 聊天机器人 | http://localhost:4000/api/chat | POST |

### 前端应用

| 应用 | URL | 说明 |
|------|-----|------|
| 酒店地图 | http://localhost:5173 | Google Maps显示酒店位置 |

### 直接访问后端服务

| 服务 | URL | 说明 |
|------|-----|------|
| Auth API | http://localhost:4011 | 认证和奖励 |
| Weather API | http://localhost:4013 | 天气服务 |
| Heatmap API | http://localhost:4014 | 热力图数据 |
| Booking API | http://localhost:4015 | 预订服务 |
| Hotel Ranking API | http://localhost:4016 | 酒店排名 |
| Chatbot API | http://localhost:4017 | 聊天机器人 |

## 测试命令

### 测试认证

```bash
# 注册新用户
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# 登录
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 测试其他服务

```bash
# 奖励
curl http://localhost:4000/api/rewards/show

# 酒店排名
curl http://localhost:4000/api/ranking

# 聊天机器人
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" -d '{}'

# 热力图API
curl http://localhost:4014
curl http://localhost:4014/stations
curl http://localhost:4014/crowd
curl http://localhost:4014/taxi
```

### 测试Map前端

在浏览器中打开:
```
http://localhost:5173
```

**注意:** 如果看到"This page can't load Google Maps correctly",说明需要配置Google Maps API Key。

## 热力图功能

### 可用端点

- `GET /` - API信息和可用端点列表
- `GET /stations` - MRT/LRT站点位置数据(CSV)
- `GET /crowd` - 实时人流密度数据(CSV)
- `GET /taxi` - 出租车位置数据(CSV)
- `GET /merged` - 合并的热力图数据(CSV)
- `GET /data/*` - 访问原始数据文件

### 数据文件

位于`apps/heatmap-api/data/`:
- `mrt_stations.csv` - MRT站点数据
- `final_data.csv` - 人流数据
- `taxi_data.csv` - 出租车位置
- `merged_data.csv` - 合并数据
- `mrt_lrt_heatmap.py` - Python数据处理脚本

## 常见问题

### 1. Map前端显示"This page can't load Google Maps correctly"

**原因:** 缺少Google Maps API Key

**解决:**
1. 获取Google Maps API Key (见上文)
2. 添加到`.env`文件:
   ```
   VITE_GOOGLE_MAPS_API_KEY=你的API密钥
   ```
3. 重启map-frontend服务:
   ```bash
   docker-compose restart map-frontend
   ```

### 2. Auth API无法启动 - CORS错误

**原因:** 已修复,确保使用最新版本

**验证:** 检查LoginController.java中的CORS配置应该是:
```java
@CrossOrigin(origins = "*")
```
而不是:
```java
@CrossOrigin(origins = "*", allowCredentials = "true")
```

### 3. 端口冲突

**症状:** 服务无法启动,提示端口被占用

**解决:**
```bash
# 查看占用端口的进程
lsof -i :4000  # 或其他端口号

# 停止占用端口的进程
kill -9 <PID>

# 或修改docker-compose.yml中的端口映射
```

### 4. Docker构建缓存问题

**症状:** 代码修改后没有生效

**解决:**
```bash
docker-compose down
docker builder prune -a -f
docker-compose up --build --no-cache
```

### 5. Map前端无法访问

**原因:** Vite服务器没有暴露到Docker外部

**已修复:** 
- vite.config.js中添加了`server: { host: '0.0.0.0' }`
- package.json中添加了`--host 0.0.0.0`参数

## 开发说明

### 修改Heatmap API

```bash
# 编辑代码
nano apps/heatmap-api/src/index.js

# 重启服务
docker-compose restart heatmap-api

# 查看日志
docker-compose logs -f heatmap-api
```

### 修改Map前端

```bash
# 编辑代码
nano apps/map-frontend/src/app.tsx

# Vite会自动热重载,无需重启
# 如需重启:
docker-compose restart map-frontend
```

### 本地开发(不使用Docker)

**Heatmap API:**
```bash
cd apps/heatmap-api
npm install
npm run dev
```

**Map Frontend:**
```bash
cd apps/map-frontend
npm install
npm start
```

## 架构说明

```
┌─────────────────────────────────────────────────┐
│              Gateway (4000)                     │
├─────────────────────────────────────────────────┤
│  /api/auth      → Auth API (4011)              │
│  /api/rewards   → Auth API (4011)              │
│  /api/weather   → Weather API (4013)            │
│  /api/heatmap   → Heatmap API (4014)            │
│  /api/booking   → Booking API (4015)            │
│  /api/ranking   → Hotel Ranking API (4016)      │
│  /api/chat      → Chatbot API (4017)            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         Map Frontend (5173)                     │
│         独立前端应用                             │
│         需要Google Maps API Key                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         MySQL (3307) + Redis (6379)             │
│         数据库和缓存服务                         │
└─────────────────────────────────────────────────┘
```

## 生产部署注意事项

1. **API密钥安全**
   - 不要将API密钥提交到Git
   - 使用环境变量或密钥管理服务
   - 限制API密钥的使用范围和域名

2. **CORS配置**
   - 生产环境应该限制允许的来源
   - 不要使用`origins = "*"`

3. **数据库**
   - 修改默认密码
   - 配置数据持久化
   - 定期备份

4. **监控和日志**
   - 配置日志收集
   - 设置健康检查
   - 监控服务状态

## 获取帮助

如果遇到问题:
1. 查看服务日志: `docker-compose logs <service-name>`
2. 检查服务状态: `docker-compose ps`
3. 查看详细文档: `FIXES_APPLIED.md`, `NEW_FEATURES.md`
