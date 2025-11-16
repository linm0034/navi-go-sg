# 快速开始指南

本文档说明如何将前端连接到真实的 Java 后端。

## 前提条件

✅ 您已经按照 `BACKEND_SETUP_GUIDE.md` 完成了后端改造  
✅ Java 后端正在运行（默认端口 8080）

---

## 步骤 1：确认后端正在运行

在浏览器中访问：

```
http://localhost:8080/api/health
```

**预期结果：** 显示 `OK`

如果无法访问，请检查：
- Java 后端是否已启动？
- 端口是否正确（默认 8080）？
- 防火墙是否阻止了连接？

---

## 步骤 2：配置前端环境变量

### 方式 1：通过管理界面配置（推荐）

1. 打开前端项目的管理界面（右上角齿轮图标）
2. 进入 **Settings → Secrets**
3. 找到以下配置项并修改：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | 后端 API 地址 |
| `VITE_USE_MOCK_DATA` | `false` | 禁用模拟数据 |

4. 保存后刷新前端页面

### 方式 2：修改 Secrets 卡片

如果您看到 Secrets 输入卡片，直接在卡片中输入：

- **VITE_API_BASE_URL**: `http://localhost:8080`
- **VITE_USE_MOCK_DATA**: `false`

---

## 步骤 3：验证连接

刷新前端页面后：

### ✅ 连接成功的标志

- 页面顶部**没有**"开发模式"提示
- 酒店数据来自真实后端
- 控制台（F12）显示成功的 API 请求

### ❌ 连接失败的标志

- 页面显示"连接错误"或"开发模式"提示
- 控制台显示 `Failed to fetch` 或 CORS 错误

---

## 故障排查

### 问题 1：页面显示"连接错误"

**可能原因：**
- 后端未启动
- 后端端口不是 8080
- `VITE_API_BASE_URL` 配置错误

**解决方案：**
1. 确认后端正在运行：`curl http://localhost:8080/api/health`
2. 检查后端控制台是否有错误日志
3. 确认 `VITE_API_BASE_URL` 配置正确

### 问题 2：浏览器控制台显示 CORS 错误

```
Access to fetch at 'http://localhost:8080/api/ranking' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**原因：** 后端未配置 CORS

**解决方案：** 确认 `RankingRestController.java` 中有以下注解：

```java
@CrossOrigin(origins = "*")
public class RankingRestController {
    ...
}
```

### 问题 3：返回的数据格式不正确

**原因：** `Hotel.java` 缺少 getter 方法

**解决方案：** 参考 `BACKEND_SETUP_GUIDE.md` 的步骤 5，为所有字段添加 getter 方法

### 问题 4：仍然显示模拟数据

**原因：** `VITE_USE_MOCK_DATA` 设置为 `true`

**解决方案：** 
1. 进入 Settings → Secrets
2. 将 `VITE_USE_MOCK_DATA` 改为 `false`
3. 刷新页面

---

## 测试所有功能

连接成功后，测试以下功能：

### 1. 总体评分排序
- 点击 "Overall" 按钮
- 查看酒店是否按 Overall Score 降序排列

### 2. 价格排序
- 点击 "Price ↑" 按钮
- 查看酒店是否按价格升序排列

### 3. 设施类别筛选
- 在 "Sort By" 下拉菜单中选择 "By Facility Category"
- 在 "Facility Category" 中选择不同类别（如 MRT Stations、Tourist Attractions）
- 查看酒店是否按对应的 Proximity Score 重新排序

---

## 部署到生产环境

### 后端部署

```bash
# 1. 打包后端
mvn clean package

# 2. 上传到服务器
scp target/hotel-ranking-1.0.0.jar user@your-server:/path/to/app/

# 3. 在服务器上运行
java -jar hotel-ranking-1.0.0.jar

# 4. 后台运行（推荐）
nohup java -jar hotel-ranking-1.0.0.jar > app.log 2>&1 &
```

### 前端配置

1. 修改 `VITE_API_BASE_URL` 为服务器地址：
   ```
   https://your-backend-domain.com
   ```

2. 点击管理界面右上角的 **Publish** 按钮发布前端

---

## 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `VITE_API_BASE_URL` | `http://localhost:8080` | 后端 API 地址 |
| `VITE_USE_MOCK_DATA` | `false` | 是否使用模拟数据 |

### 开发模式 vs 生产模式

| 模式 | VITE_USE_MOCK_DATA | VITE_API_BASE_URL | 用途 |
|------|-------------------|-------------------|------|
| 纯前端开发 | `true` | 任意 | 无需后端，使用模拟数据 |
| 本地联调 | `false` | `http://localhost:8080` | 连接本地后端 |
| 生产环境 | `false` | `https://your-api.com` | 连接生产后端 |

---

## 下一步

✅ 后端改造完成  
✅ 前端连接配置完成  
✅ 所有功能测试通过  

现在您可以：
- 添加更多酒店数据
- 实现用户登录功能
- 添加酒店详情页
- 集成地图可视化
- 部署到生产环境

---

## 相关文档

- [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md) - 后端改造详细指南
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - 后端集成说明
- [README_CN.md](./README_CN.md) - 项目总体说明
