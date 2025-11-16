# Java 后端改造指南

本文档提供将现有命令行 Java 应用改造为 REST API 的完整步骤。

## 目录

1. [现状分析](#现状分析)
2. [改造方案](#改造方案)
3. [详细步骤](#详细步骤)
4. [测试验证](#测试验证)
5. [前端配置](#前端配置)

---

## 现状分析

您的 Java 后端目前是一个**命令行应用**，具有以下特点：

### 现有代码结构

```
ranking/
├── Main.java                  # 程序入口（启动命令行界面）
├── RankingUI.java             # 命令行交互界面
├── RankingController.java     # 业务逻辑层（核心排序算法）✅
├── RankingDAO.java            # 数据访问层（获取酒店数据）✅
├── Hotel.java                 # 酒店数据模型 ✅
├── Facility.java              # 设施数据模型 ✅
└── DataFetcher.java           # 数据获取工具 ✅
```

### 核心优势

- ✅ **业务逻辑完整**：`RankingController.getRanking()` 方法已实现所有排序逻辑
- ✅ **数据层解耦**：`RankingDAO` 负责数据获取和计算
- ✅ **模型清晰**：`Hotel` 和 `Facility` 类定义完善

### 需要改造的部分

- ❌ **缺少 HTTP 接口**：无法通过网络访问
- ❌ **命令行交互**：`RankingUI` 和 `Main` 需要替换为 Web 服务器

---

## 改造方案

### 方案选择：Spring Boot（推荐）

**优势：**
- 内置 Web 服务器（Tomcat）
- 自动处理 JSON 序列化
- 支持 CORS 跨域配置
- 开发效率高，代码量少

**替代方案：**
- Servlet + Tomcat（传统方式，配置复杂）
- Javalin（轻量级，适合小项目）

---

## 详细步骤

### 步骤 1：添加 Maven 依赖

在项目根目录创建或修改 `pom.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>hotel-ranking</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <properties>
        <java.version>17</java.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <!-- Spring Boot Web Starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

**如果使用 Gradle**，在 `build.gradle` 中添加：

```gradle
plugins {
    id 'org.springframework.boot' version '3.2.0'
    id 'io.spring.dependency-management' version '1.1.4'
    id 'java'
}

group = 'com.example'
version = '1.0.0'
sourceCompatibility = '17'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

---

### 步骤 2：修改 Main.java（程序入口）

将命令行启动改为 Spring Boot 启动：

```java
package ranking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        System.out.println("Starting Hotel Ranking API Server...");
        SpringApplication.run(Main.class, args);
    }
}
```

**关键变化：**
- 添加 `@SpringBootApplication` 注解
- 使用 `SpringApplication.run()` 启动 Web 服务器
- 删除 `new RankingUI().run()` 命令行调用

---

### 步骤 3：创建 REST Controller

在 `ranking` 包下创建新文件 `RankingRestController.java`：

```java
package ranking;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 允许所有来源的跨域请求
public class RankingRestController {
    private final RankingController controller;

    public RankingRestController() {
        // 初始化业务逻辑层
        this.controller = new RankingController(new RankingDAO());
    }

    /**
     * GET /api/ranking
     * 
     * 查询参数：
     * - sortType: overall | filter | price_low | price_high
     * - filter: mrt | bus | hawker | money_changer | attraction | wifi (仅当 sortType=filter 时需要)
     * 
     * 示例：
     * - /api/ranking?sortType=overall
     * - /api/ranking?sortType=filter&filter=mrt
     * - /api/ranking?sortType=price_low
     */
    @GetMapping("/ranking")
    public List<Hotel> getRanking(
        @RequestParam(defaultValue = "overall") String sortType,
        @RequestParam(required = false) String filter
    ) {
        System.out.println("API Request: sortType=" + sortType + ", filter=" + filter);
        return controller.getRanking(sortType, filter);
    }

    /**
     * GET /api/health
     * 健康检查接口
     */
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
```

**注解说明：**
- `@RestController`：标记为 REST API 控制器，自动将返回值转为 JSON
- `@RequestMapping("/api")`：所有接口路径前缀为 `/api`
- `@CrossOrigin(origins = "*")`：允许前端跨域访问
- `@GetMapping`：处理 HTTP GET 请求
- `@RequestParam`：接收 URL 查询参数

---

### 步骤 4：配置服务器端口（可选）

在 `src/main/resources/` 目录下创建 `application.properties`：

```properties
# 服务器端口（默认 8080）
server.port=8080

# 应用名称
spring.application.name=hotel-ranking-api

# 日志级别
logging.level.ranking=INFO
```

**修改端口示例：**
```properties
server.port=9000  # 改为 9000 端口
```

---

### 步骤 5：确保 Hotel 类支持 JSON 序列化

检查 `Hotel.java`，确保所有字段都有 **getter 方法**：

```java
package ranking;

import java.util.HashMap;
import java.util.Map;

public class Hotel {
    private String name;
    private double latitude;
    private double longitude;
    private double price;
    private double overallScore;
    private Map<String, Double> filterScores = new HashMap<>();

    // 构造函数
    public Hotel(String name, double latitude, double longitude, double price) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.price = price;
    }

    // ✅ 必须有 getter 方法，Spring Boot 才能序列化为 JSON
    public String getName() { return name; }
    public double getLatitude() { return latitude; }
    public double getLongitude() { return longitude; }
    public double getPrice() { return price; }
    public double getOverallScore() { return overallScore; }
    public Map<String, Double> getFilterScores() { return filterScores; }

    // setter 方法
    public void setOverallScore(double score) { this.overallScore = score; }
    public void addFilterScore(String filterType, double score) {
        filterScores.put(filterType, score);
    }

    public double getScoreByFilter(String filter) {
        return filterScores.getOrDefault(filter, 0.0);
    }
}
```

**关键点：**
- 所有需要返回给前端的字段必须有 `public` getter 方法
- `filterScores` 会自动序列化为 JSON 对象

---

### 步骤 6：编译和运行

#### 使用 Maven

```bash
# 1. 清理并编译
mvn clean package

# 2. 运行 Spring Boot 应用
mvn spring-boot:run

# 或者直接运行生成的 JAR 文件
java -jar target/hotel-ranking-1.0.0.jar
```

#### 使用 Gradle

```bash
# 1. 清理并编译
./gradlew clean build

# 2. 运行 Spring Boot 应用
./gradlew bootRun

# 或者直接运行生成的 JAR 文件
java -jar build/libs/hotel-ranking-1.0.0.jar
```

#### 使用 IDE（IntelliJ IDEA / Eclipse）

1. 右键点击 `Main.java`
2. 选择 "Run 'Main.main()'"
3. 查看控制台输出，确认服务器启动成功

**成功启动的标志：**
```
Started Main in 2.5 seconds (JVM running for 3.0)
Tomcat started on port(s): 8080 (http)
```

---

## 测试验证

### 1. 浏览器测试

在浏览器地址栏输入以下 URL：

```
http://localhost:8080/api/health
```

**预期结果：** 显示 `OK`

```
http://localhost:8080/api/ranking?sortType=overall
```

**预期结果：** 返回 JSON 格式的酒店列表：

```json
[
  {
    "name": "Marina Bay Sands",
    "latitude": 1.2834,
    "longitude": 103.8607,
    "price": 450.0,
    "overallScore": 9.2,
    "filterScores": {
      "mrt": 9.8,
      "bus": 9.5,
      "hawker": 8.7,
      "money_changer": 9.1,
      "attraction": 9.9,
      "wifi": 9.3
    }
  },
  ...
]
```

### 2. 测试所有排序功能

```bash
# 总体评分排序
curl "http://localhost:8080/api/ranking?sortType=overall"

# 价格从低到高
curl "http://localhost:8080/api/ranking?sortType=price_low"

# 价格从高到低
curl "http://localhost:8080/api/ranking?sortType=price_high"

# 按地铁站邻近度排序
curl "http://localhost:8080/api/ranking?sortType=filter&filter=mrt"

# 按旅游景点邻近度排序
curl "http://localhost:8080/api/ranking?sortType=filter&filter=attraction"
```

### 3. 使用 Postman 测试

1. 打开 Postman
2. 创建新的 GET 请求
3. URL: `http://localhost:8080/api/ranking`
4. 添加查询参数：
   - `sortType`: `overall`
   - `filter`: `mrt`（可选）
5. 点击 "Send"，查看响应

---

## 前端配置

### 方式 1：通过管理界面配置（推荐）

1. 打开前端项目的管理界面
2. 进入 **Settings → Secrets**
3. 找到 `VITE_API_BASE_URL`
4. 修改为：`http://localhost:8080`
5. 保存并刷新前端页面

### 方式 2：修改环境变量文件

在前端项目根目录创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_DATA=false
```

然后重启前端开发服务器。

### 验证连接

1. 启动 Java 后端（确保运行在 `http://localhost:8080`）
2. 打开前端页面
3. 如果看到真实的酒店数据且没有"开发模式"提示，说明连接成功！

---

## 常见问题

### Q1: 编译时提示找不到 Spring Boot 类

**原因：** Maven/Gradle 依赖未下载

**解决方案：**
```bash
# Maven
mvn dependency:resolve

# Gradle
./gradlew build --refresh-dependencies
```

### Q2: 启动后前端仍然显示"连接错误"

**检查清单：**
1. 后端是否成功启动？查看控制台是否有 "Tomcat started on port(s): 8080"
2. 端口是否正确？浏览器访问 `http://localhost:8080/api/health` 是否返回 `OK`
3. 前端配置是否正确？检查 `VITE_API_BASE_URL` 是否为 `http://localhost:8080`
4. CORS 是否配置？确认 `@CrossOrigin(origins = "*")` 存在

### Q3: 返回的 JSON 数据缺少某些字段

**原因：** 对应字段缺少 getter 方法

**解决方案：** 在 `Hotel.java` 中为所有字段添加 `public` getter 方法

### Q4: 如何修改端口？

在 `application.properties` 中修改：
```properties
server.port=9000
```

然后前端配置也要相应修改为 `http://localhost:9000`

### Q5: 如何部署到服务器？

```bash
# 1. 打包为可执行 JAR
mvn clean package

# 2. 上传 target/hotel-ranking-1.0.0.jar 到服务器

# 3. 在服务器上运行
java -jar hotel-ranking-1.0.0.jar

# 4. 后台运行（Linux）
nohup java -jar hotel-ranking-1.0.0.jar > app.log 2>&1 &
```

---

## 完整项目结构

改造完成后的项目结构：

```
hotel-ranking/
├── pom.xml                          # Maven 配置
├── src/
│   └── main/
│       ├── java/
│       │   └── ranking/
│       │       ├── Main.java                  # ✅ Spring Boot 入口
│       │       ├── RankingRestController.java # ✅ 新增 REST API
│       │       ├── RankingController.java     # 业务逻辑（无需修改）
│       │       ├── RankingDAO.java            # 数据访问（无需修改）
│       │       ├── Hotel.java                 # 数据模型（确保有 getter）
│       │       ├── Facility.java              # 数据模型（无需修改）
│       │       └── DataFetcher.java           # 工具类（无需修改）
│       └── resources/
│           └── application.properties         # ✅ 新增配置文件
└── target/                                    # 编译输出目录
    └── hotel-ranking-1.0.0.jar                # 可执行 JAR 文件
```

---

## 总结

### 需要修改的文件（3个）

1. **pom.xml** - 添加 Spring Boot 依赖
2. **Main.java** - 改为 Spring Boot 启动方式
3. **RankingRestController.java** - 新建 REST API 控制器

### 无需修改的文件（5个）

- `RankingController.java` - 业务逻辑完整，直接复用 ✅
- `RankingDAO.java` - 数据访问层无需改动 ✅
- `Hotel.java` - 只需确认有 getter 方法 ✅
- `Facility.java` - 无需修改 ✅
- `DataFetcher.java` - 无需修改 ✅

### 预计改造时间

- **有 Spring Boot 经验**：15-30 分钟
- **首次使用 Spring Boot**：1-2 小时（包括依赖下载和学习）

---

## 下一步

1. 按照本文档完成后端改造
2. 启动后端服务器
3. 配置前端 API 地址
4. 测试所有功能是否正常

如有问题，请检查控制台日志或参考"常见问题"章节。
