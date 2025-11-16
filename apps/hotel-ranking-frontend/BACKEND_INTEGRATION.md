# 后端集成指南

## 前端已完成的配置

前端已经配置好连接后端 API，现在需要您的 Java 后端提供对应的 REST API 端点。

## 后端需要实现的 API

### 端点信息

**URL:** `GET /api/ranking`

**查询参数:**
- `sortType` (必填): 排序类型
  - `overall` - 按总体评分排序
  - `price_low` - 按价格升序排序
  - `price_high` - 按价格降序排序
  - `filter` - 按设施类别评分排序
- `filter` (可选): 设施类别（仅当 sortType=filter 时需要）
  - `hawker` - 美食中心
  - `mrt` - 地铁站
  - `bus` - 公交站
  - `money` - 换钱所
  - `attraction` - 旅游景点
  - `wifi` - 无线热点

**响应格式 (JSON):**
```json
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
      "bus": 9.2,
      "money": 8.7,
      "attraction": 9.9,
      "wifi": 9.5
    }
  }
]
```

## Java 后端实现步骤

### 方案 A: 使用 Spring Boot（推荐）

#### 1. 添加依赖

**Maven (pom.xml):**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.2.0</version>
    </dependency>
</dependencies>
```

**Gradle (build.gradle):**
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web:3.2.0'
}
```

#### 2. 创建 REST Controller

创建文件 `src/main/java/ranking/RankingRestController.java`:

```java
package ranking;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 允许跨域请求
public class RankingRestController {
    private final RankingController controller;

    public RankingRestController() {
        this.controller = new RankingController(new RankingDAO());
    }

    @GetMapping("/ranking")
    public List<Hotel> getRanking(
        @RequestParam(defaultValue = "overall") String sortType,
        @RequestParam(required = false) String filter
    ) {
        return controller.getRanking(sortType, filter);
    }
}
```

#### 3. 修改 Main.java

```java
package ranking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Main {
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}
```

#### 4. 配置端口（可选）

创建 `src/main/resources/application.properties`:
```properties
server.port=8080
```

#### 5. 启动后端

```bash
# Maven
mvn spring-boot:run

# Gradle
gradle bootRun

# 或使用 IDE 运行 Main.java
```

#### 6. 测试 API

在浏览器访问：
```
http://localhost:8080/api/ranking?sortType=overall
```

应该返回 JSON 格式的酒店列表。

### 方案 B: 使用 Servlet（不推荐，但可行）

如果您不想使用 Spring Boot，可以创建一个简单的 Servlet：

```java
package ranking;

import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import com.google.gson.Gson;

@WebServlet("/api/ranking")
public class RankingServlet extends HttpServlet {
    private final RankingController controller = new RankingController(new RankingDAO());
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        // 允许跨域
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String sortType = request.getParameter("sortType");
        String filter = request.getParameter("filter");

        if (sortType == null) sortType = "overall";

        List<Hotel> hotels = controller.getRanking(sortType, filter);
        String json = gson.toJson(hotels);

        PrintWriter out = response.getWriter();
        out.print(json);
        out.flush();
    }
}
```

## CORS 配置（重要！）

如果前端和后端在不同端口运行，必须配置 CORS。

### Spring Boot 全局 CORS 配置

创建 `src/main/java/ranking/WebConfig.java`:

```java
package ranking;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://your-frontend-domain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 测试清单

完成后端实现后，请按以下步骤测试：

- [ ] 启动 Java 后端，确认无错误
- [ ] 在浏览器访问 `http://localhost:8080/api/ranking?sortType=overall`
- [ ] 确认返回 JSON 格式的酒店数据
- [ ] 测试不同的 sortType 参数（overall, price_low, price_high, filter）
- [ ] 测试 filter 参数（hawker, mrt, bus, money, attraction, wifi）
- [ ] 在前端管理界面的 Settings → Secrets 中配置 `VITE_API_BASE_URL` 为 `http://localhost:8080`
- [ ] 刷新前端页面，确认能正常显示酒店数据

## 常见问题

### Q1: 前端显示 "无法连接到后端服务器"

**解决方法：**
1. 确认后端已启动并运行在正确的端口
2. 检查 CORS 配置是否正确
3. 在浏览器开发者工具的 Console 中查看具体错误信息

### Q2: 返回数据格式不正确

**解决方法：**
1. 确保 Hotel 类的字段名与前端 TypeScript 接口一致（使用驼峰命名法）
2. 如果使用 Jackson 序列化，确保配置正确
3. 测试 API 端点返回的 JSON 格式

### Q3: 跨域错误 (CORS)

**解决方法：**
1. 添加 `@CrossOrigin` 注解到 Controller
2. 或配置全局 CORS（见上文 WebConfig）
3. 确保允许的 origin 包含前端地址

## 需要帮助？

如果在实现过程中遇到问题，请提供：
1. 完整的错误信息
2. 您的 Java 版本和构建工具（Maven/Gradle）
3. 后端启动日志
4. 浏览器开发者工具的 Network 和 Console 信息
