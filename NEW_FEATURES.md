# 新增功能说明

本版本在原有sg-tourist-guide的基础上,新增了以下两个功能:

## 1. Heatmap功能 (热力图)

### 功能描述
实时显示新加坡MRT/LRT站点的人流密度和出租车分布热力图。

### 技术栈
- Python + Pandas + Folium
- 数据来源: LTA DataMall API

### 数据文件
位于 `apps/heatmap-api/data/`:
- `mrt_lrt_heatmap.py` - 主要Python脚本
- `mrt_stations.csv` - MRT站点数据
- `final_data.csv` - 人流数据
- `merged_data.csv` - 合并数据
- `taxi_data.csv` - 出租车位置数据

### API端点
- 基础路径: `/api/heatmap`
- 端口: 4014

### 使用方法
```bash
# 访问热力图API
curl http://localhost:4000/api/heatmap
```

## 2. Map功能 (地图可视化)

### 功能描述
使用Google Maps显示新加坡酒店位置,支持marker clustering。

### 技术栈
- React + TypeScript
- Google Maps API (@vis.gl/react-google-maps)
- Marker Clusterer
- Vite

### 主要文件
- `apps/map-frontend/src/app.tsx` - 主应用组件
- `apps/map-frontend/HotelLocations.kml` - 酒店位置KML数据

### 访问方式
- 端口: 5173
- URL: http://localhost:5173

### 配置要求
需要在`.env`文件中配置Google Maps API Key:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 启动说明

### 启动所有服务
```bash
docker-compose up --build
```

### 单独启动heatmap服务
```bash
docker-compose up heatmap-api
```

### 单独启动map前端
```bash
docker-compose up map-frontend
```

## 服务端口总览

| 服务 | 端口 | 说明 |
|------|------|------|
| Gateway | 4000 | 统一网关 |
| Auth API | 4011 | 认证和奖励 |
| Weather API | 4013 | 天气服务 |
| Heatmap API | 4014 | 热力图服务 |
| Booking API | 4015 | 预订服务 |
| Hotel Ranking API | 4016 | 酒店排名 |
| Chatbot API | 4017 | 聊天机器人 |
| Map Frontend | 5173 | 地图可视化前端 |
| MySQL | 3307 | 数据库 |
| Redis | 6379 | 缓存 |

## 注意事项

1. **Google Maps API Key**: Map功能需要有效的Google Maps API Key
2. **LTA API Key**: Heatmap功能需要LTA DataMall API Key
3. **端口冲突**: 确保5173端口未被占用

## 开发说明

### Heatmap API开发
```bash
cd apps/heatmap-api/data
python3 mrt_lrt_heatmap.py
```

### Map Frontend开发
```bash
cd apps/map-frontend
npm install
npm start
```

## 集成架构

```
┌─────────────────────────────────────────────────┐
│                   Gateway (4000)                │
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
│          Map Frontend (5173)                    │
│          独立前端应用                            │
└─────────────────────────────────────────────────┘
```

## 测试命令

```bash
# 测试Heatmap API
curl http://localhost:4000/api/heatmap

# 访问Map Frontend
open http://localhost:5173

# 测试其他服务
curl http://localhost:4000/api/ranking
curl -X POST http://localhost:4000/api/chat -H "Content-Type: application/json" -d '{}'
```
