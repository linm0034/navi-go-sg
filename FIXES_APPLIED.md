# 修复说明文档

## 问题诊断

### 原始问题
1. **Chatbot和HotelRanking**: 直接访问正常,但通过统一网关访问失败 ✅ 已修复
2. **Login(Auth)和Rewards**: 直接访问和通过统一网关访问都失败 ✅ 已修复

### 根本原因

**Chatbot和HotelRanking问题:**
1. Controller使用了完整路径前缀,导致路径重复
2. Dockerfile使用单阶段构建,无法在Docker中编译

**Login和Rewards问题:**
1. **Gateway路径处理**: Express的`app.use(path, middleware)`会自动去掉路径前缀
2. **正确方案**: 使用http-proxy-middleware的`context`选项
3. **CORS配置错误**: Auth API的Controller使用了`@CrossOrigin(origins = "*", allowCredentials = "true")`,在新版Spring Boot中不允许

## 修复内容

### 1. Chatbot API ✅

#### Dockerfile
改为多阶段构建:
```dockerfile
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY . /app
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
```

#### Controller
移除`@RequestMapping`中的路径前缀,监听根路径。

### 2. Hotel Ranking API ✅

#### Controller
移除`@RequestMapping("/api")`和`@GetMapping("/ranking")`,监听根路径。

### 3. Auth API ✅

#### CORS配置修复 (关键)

**问题**: Spring Boot 3.x不允许同时使用`origins = "*"`和`allowCredentials = "true"`

**修改前:**
```java
@CrossOrigin(origins = "*", allowCredentials = "true")
```

**修改后:**
```java
@CrossOrigin(origins = "*")
```

**影响的文件:**
- LoginController.java
- RegisterController.java
- RewardsController.java

**说明**: 
- 移除了`allowCredentials = "true"`参数
- 保持`origins = "*"`允许所有来源访问
- 如果需要credentials支持,应该明确指定允许的origins列表

### 4. Gateway配置 ✅

#### 使用context而不是Express path参数

**错误方案:**
```javascript
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-api:4011'
}));
```
问题: Express会去掉`/api/auth`前缀,导致后端收到的路径不完整

**正确方案:**
```javascript
app.use(createProxyMiddleware({
  target: 'http://auth-api:4011',
  changeOrigin: true,
  context: ['/api/auth', '/api/rewards']
}));
```
优点: middleware直接处理路径匹配,保持完整路径

#### 完整的Gateway配置

```javascript
import express from 'express';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuid } from 'uuid';

const app = express();

app.use((req, res, next) => {
  const id = req.header('x-request-id') || uuid();
  req.headers['x-request-id'] = id;
  res.setHeader('x-request-id', id);
  next();
});

app.use(morgan('combined'));

// Auth and rewards: use context to preserve full path
app.use(createProxyMiddleware({
  target: `http://auth-api:${process.env.AUTH_PORT || 4011}`,
  changeOrigin: true,
  context: ['/api/auth', '/api/rewards']
}));

// Other services: use path parameter with pathRewrite
app.use('/api/weather', createProxyMiddleware({
  target: `http://weather-api:${process.env.WEATHER_PORT || 4013}`,
  changeOrigin: true,
  pathRewrite: { '^/api/weather': '' }
}));

app.use('/api/heatmap', createProxyMiddleware({
  target: `http://heatmap-api:${process.env.HEATMAP_PORT || 4014}`,
  changeOrigin: true,
  pathRewrite: { '^/api/heatmap': '' }
}));

app.use('/api/booking', createProxyMiddleware({
  target: `http://booking-api:${process.env.BOOKING_PORT || 4015}`,
  changeOrigin: true,
  pathRewrite: { '^/api/booking': '' }
}));

app.use('/api/ranking', createProxyMiddleware({
  target: `http://hotel-ranking-api:${process.env.HOTEL_PORT || 4016}`,
  changeOrigin: true,
  pathRewrite: { '^/api/ranking': '' }
}));

app.use('/api/hotels', createProxyMiddleware({
  target: `http://hotel-ranking-api:${process.env.HOTEL_PORT || 4016}`,
  changeOrigin: true,
  pathRewrite: { '^/api/hotels': '' }
}));

app.use('/api/chatbot', createProxyMiddleware({
  target: `http://chatbot-api:${process.env.CHATBOT_PORT || 4017}`,
  changeOrigin: true,
  pathRewrite: { '^/api/chatbot': '' }
}));

app.use('/api/chat', createProxyMiddleware({
  target: `http://chatbot-api:${process.env.CHATBOT_PORT || 4017}`,
  changeOrigin: true,
  pathRewrite: { '^/api/chat': '' }
}));

app.get('/healthz', (_, res) => {
  res.json({ ok: true });
});

const port = process.env.GATEWAY_PORT || 4000;
app.listen(port, () => {
  console.log(`Gateway listening on ${port}`);
});
```

## 架构说明

### 服务分类

**Java Spring Boot服务:**
1. **auth-api** (端口4011)
   - 认证: `/api/auth/login`, `/api/auth/register`
   - 奖励: `/api/rewards/show`, `/api/rewards/redeem`
   
2. **hotel-ranking-api** (端口4016)
   - 酒店排名: `/` (通过Gateway的`/api/ranking`)
   
3. **chatbot-api** (端口4017)
   - 聊天: `/` (通过Gateway的`/api/chat`和`/api/chatbot`)

**Node.js服务:**
1. **gateway** (端口4000) - 统一网关
2. **weather-api** (端口4013) - 天气服务
3. **heatmap-api** (端口4014) - 热力图服务
4. **booking-api** (端口4015) - 预订服务

### 路径转发规则

**保持完整路径** (使用context):
- Auth API: `/api/auth/*` → `http://auth-api:4011/api/auth/*`
- Rewards API: `/api/rewards/*` → `http://auth-api:4011/api/rewards/*`

**去除路径前缀** (使用path + pathRewrite):
- Weather API: `/api/weather/*` → `http://weather-api:4013/*`
- Heatmap API: `/api/heatmap/*` → `http://heatmap-api:4014/*`
- Booking API: `/api/booking/*` → `http://booking-api:4015/*`
- Hotel Ranking API: `/api/ranking/*` → `http://hotel-ranking-api:4016/*`
- Chatbot API: `/api/chat/*` → `http://chatbot-api:4017/*`

## 技术要点

### Spring Boot CORS配置

**不兼容的配置:**
```java
@CrossOrigin(origins = "*", allowCredentials = "true")  // ❌ 错误
```

**正确的配置:**
```java
// 选项1: 允许所有来源,不支持credentials
@CrossOrigin(origins = "*")  // ✅ 正确

// 选项2: 支持credentials,明确指定允许的来源
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:4000"}, allowCredentials = "true")  // ✅ 正确
```

### Express vs http-proxy-middleware路径处理

**方式1: 使用Express的path参数**
```javascript
app.use('/api/auth', middleware)
```
- Express会去掉`/api/auth`前缀
- 适合需要去除前缀的场景

**方式2: 使用middleware的context选项**
```javascript
app.use(middleware({ context: ['/api/auth'] }))
```
- Express不参与路径匹配
- middleware直接处理完整路径
- 适合需要保持完整路径的场景

## 测试验证

### 通过网关访问 (推荐)

```bash
# Auth - 注册
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Auth - 登录
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

# Rewards - 查看奖励列表
curl http://localhost:4000/api/rewards/show

# Chatbot - 初始化
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" -d '{}'

# Hotel Ranking - 获取酒店列表
curl http://localhost:4000/api/ranking

# Weather - 获取天气
curl http://localhost:4000/api/weather

# Booking - 获取预订
curl http://localhost:4000/api/booking
```

### 直接访问测试

```bash
# Auth API
curl -X POST http://localhost:4011/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'

curl http://localhost:4011/api/rewards/show

# Chatbot API
curl -X POST http://localhost:4017/ \
  -H "Content-Type: application/json" -d '{}'

# Hotel Ranking API
curl http://localhost:4016/
```

## 启动说明

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 2. 启动所有服务
docker-compose up --build

# 3. 等待服务启动
docker-compose ps

# 4. 测试健康检查
curl http://localhost:4000/healthz
```

## 常见问题

### 1. Auth API启动失败 - CORS错误
**症状**: 
```
When allowCredentials is true, allowedOrigins cannot contain the special value "*"
```

**原因**: Spring Boot 3.x的CORS安全限制

**解决**: 移除`allowCredentials = "true"`或明确指定允许的origins

### 2. 504 Gateway Timeout
**症状**: 通过网关访问返回504

**原因**: 后端服务未启动或无法连接

**检查**:
```bash
docker-compose ps  # 查看服务状态
docker-compose logs [service-name]  # 查看日志
```

### 3. 路径404错误
**症状**: 请求返回404 Not Found

**检查**:
- 确认Controller路径配置
- 验证Gateway的context或pathRewrite配置
- 查看服务日志确认接收到的路径

## 总结

本次修复涉及三个关键问题:
1. ✅ **Dockerfile构建**: Chatbot API改为多阶段构建
2. ✅ **Gateway路径处理**: 使用context保持Auth/Rewards的完整路径
3. ✅ **CORS配置**: 移除不兼容的allowCredentials配置

所有服务现在都能正常启动和工作!
