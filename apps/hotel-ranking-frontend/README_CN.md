# 新加坡酒店排名系统 - 前端应用

这是一个基于 React 19 + TypeScript + Tailwind CSS 4 构建的现代化酒店排名前端应用，用于展示和交互新加坡酒店排名系统。

## 功能特性

### 核心功能
- **多维度排序**：支持按总体评分、价格（升序/降序）、设施类别进行排序
- **设施类别过滤**：支持按以下类别筛选酒店：
  - 美食中心（Hawker Centres）
  - 地铁站（MRT Stations）
  - 公交站（Bus Stops）
  - 换钱所（Money Changers）
  - 旅游景点（Tourist Attractions）
  - 无线热点（Wireless Hotspots）
- **实时数据展示**：显示酒店的总体评分、价格、地理位置和设施评分
- **响应式设计**：完美适配桌面端、平板和移动设备

### UI/UX 特性
- 现代化的卡片式布局
- 平滑的加载动画和过渡效果
- 直观的筛选控制面板
- 空状态和错误处理提示
- 渐变背景和阴影效果

## 技术栈

- **框架**：React 19
- **语言**：TypeScript
- **样式**：Tailwind CSS 4
- **UI 组件**：shadcn/ui
- **路由**：Wouter
- **图标**：Lucide React
- **构建工具**：Vite

## 项目结构

```
client/src/
├── components/          # React 组件
│   ├── ui/             # shadcn/ui 基础组件
│   ├── HotelCard.tsx   # 酒店卡片组件
│   └── FilterPanel.tsx # 筛选面板组件
├── pages/              # 页面组件
│   ├── Home.tsx        # 主页
│   └── NotFound.tsx    # 404 页面
├── services/           # 业务逻辑
│   └── hotelService.ts # 酒店数据服务
├── types/              # TypeScript 类型定义
│   └── hotel.ts        # 酒店相关类型
├── data/               # 模拟数据
│   └── mockHotels.ts   # 15 个模拟酒店数据
├── contexts/           # React Context
│   └── ThemeContext.tsx # 主题上下文
├── App.tsx             # 应用根组件
├── main.tsx            # 应用入口
└── index.css           # 全局样式
```

## 数据结构

### Hotel 接口
```typescript
interface Hotel {
  name: string;              // 酒店名称
  overallScore: number;      // 总体评分 (0-10)
  price: number;             // 价格（美元）
  latitude: number;          // 纬度
  longitude: number;         // 经度
  filterScores: Record<string, number>; // 各设施类别评分
}
```

### 排序类型
- `overall`: 按总体评分排序（降序）
- `price_low`: 按价格排序（升序）
- `price_high`: 按价格排序（降序）
- `filter`: 按指定设施类别评分排序（降序）

### 设施类别
- `hawker`: 美食中心
- `mrt`: 地铁站
- `bus`: 公交站
- `money`: 换钱所
- `attraction`: 旅游景点
- `wifi`: 无线热点

## 开发指南

### 本地开发
```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 连接实际后端

当前应用使用模拟数据（`client/src/data/mockHotels.ts`）。要连接实际的 Java 后端，请修改 `client/src/services/hotelService.ts`：

```typescript
export class HotelService {
  private static API_BASE_URL = 'http://your-backend-url:port';

  static async fetchRankingAsync(
    sortType: SortType,
    filter?: FilterType
  ): Promise<Hotel[]> {
    const params = new URLSearchParams({
      sortType,
      ...(filter && { filter }),
    });
    
    const response = await fetch(`${this.API_BASE_URL}/api/ranking?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch hotels');
    }
    
    return response.json();
  }
}
```

### 自定义主题

主题颜色在 `client/src/index.css` 中定义，使用 OKLCH 颜色格式：

```css
:root {
  --primary: var(--color-blue-700);
  --background: oklch(1 0 0);
  --foreground: oklch(0.235 0.015 65);
  /* ... 其他颜色变量 */
}
```

### 添加新的设施类别

1. 在 `client/src/types/hotel.ts` 中添加新类型：
```typescript
export type FilterType = 'hawker' | 'mrt' | 'bus' | 'money' | 'attraction' | 'wifi' | 'new_category';

export const FILTER_LABELS: Record<FilterType, string> = {
  // ... 现有类别
  new_category: '新类别名称',
};
```

2. 在模拟数据或后端 API 中添加对应的评分数据。

## 与后端对应关系

### Java 后端类 → TypeScript 类型

| Java 类 | TypeScript 类型 | 说明 |
|---------|----------------|------|
| `Hotel.java` | `Hotel` interface | 酒店数据模型 |
| `RankingController.getRanking()` | `HotelService.fetchRankingAsync()` | 获取排名数据 |
| `sortType` 参数 | `SortType` type | 排序类型 |
| `filter` 参数 | `FilterType` type | 设施类别 |

### API 端点建议

如果您的 Java 后端需要提供 RESTful API，建议实现以下端点：

```
GET /api/ranking?sortType={sortType}&filter={filter}

参数：
- sortType: overall | price_low | price_high | filter
- filter: hawker | mrt | bus | money | attraction | wifi (仅在 sortType=filter 时需要)

响应：
[
  {
    "name": "Marina Bay Sands",
    "overallScore": 9.2,
    "price": 450,
    "latitude": 1.2834,
    "longitude": 103.8607,
    "filterScores": {
      "hawker": 8.5,
      "mrt": 9.8,
      ...
    }
  },
  ...
]
```

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动浏览器（iOS Safari, Chrome Mobile）

## 许可证

本项目仅用于演示目的，酒店数据为虚构数据。

## 贡献

欢迎提交 Issue 和 Pull Request！

---

© 2025 Hotel Ranking Frontend. 酒店数据仅供演示使用。
