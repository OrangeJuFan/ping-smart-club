# 乒智管 Ping Smart Club

"乒智管"是一款专为多俱乐部乒乓球培训机构设计的全流程数字化管理系统，面向俱乐部、教练、学员家长和管理员，覆盖学员管理、教练调度、课程预约、考勤记录、课程购买、商品订单、统计报表和多租户数据隔离等业务场景，助力俱乐部高效运营，提升学员训练体验。

## 项目整体架构

本仓库采用多端分层架构，包含移动端/小程序、后台管理端、Spring Boot 后端服务和数据库初始化脚本。

```text
ping-smart-club
├── ping-smart-club-front               # Uni-app 移动端 / 微信小程序 / H5 / App
├── ping-smart-club-web-boot            # Spring Boot 后端服务
├── ping-smart-club-admin-vue3-vite     # Vue 3 + Vite 后台管理端预备项目
├── ping-smart-club-admin-vue3-webpack  # Vue 3 + Vue CLI 后台管理端脚手架
└── ping-smart-club-admin-vue2-webpack  # Vue 2 + Vue CLI 后台管理端脚手架
```

整体调用关系：

```text
移动端 Uni-app / 管理端 Vue
        │
        │ HTTP API
        ▼
Spring Boot Web API
        │
        │ MyBatis-Plus
        ▼
MySQL 数据库

后续可选扩展：Redis 缓存、RabbitMQ 消息队列、Spring Security 权限认证、Docker / Kubernetes 部署。
```

## 子项目说明

### ping-smart-club-front

移动端主项目，基于 Uni-app 开发，目标支持微信小程序、H5 和 App 多端运行。

技术栈：

- Uni-app
- Vue 2
- Vuex
- SCSS
- uni.request 请求封装

主要目录：

```text
ping-smart-club-front
├── api/                 # 前端 API 模块，按 user / coach / admin / common 分组
├── components/          # 通用组件
├── pages/               # 页面目录，按角色和业务划分
├── pages/components/    # 页面级复用组件，例如自定义 tabbar、登录弹窗
├── static/              # 图片等静态资源
├── store/               # Vuex 状态管理
├── utils/               # 请求封装和工具函数
├── App.vue              # 应用根组件
├── main.js              # Uni-app 入口
├── manifest.json        # 多端应用配置
└── pages.json           # 页面路由和 tabBar 配置
```

页面按角色划分：

- 游客/登录：`pages/login`、`pages/identity`、`pages/club`
- 家长端：`pages/parent`
- 教练端：`pages/coach`
- 管理员端：`pages/admin`

请求层统一在 `utils/request.js` 中处理，包含基础地址、超时、token 认证头、平台标识、GET 防缓存、响应码处理、失败重试和文件上传封装。API 通过 `api/index.js` 聚合后挂载到 Vue 原型，页面和 Vuex 模块通过 `this.$api` 调用。

### ping-smart-club-web-boot

后端服务项目，负责提供 REST API、数据库访问、接口文档和后续认证鉴权能力。

技术栈：

- Java 17
- Spring Boot 3.5.9
- Spring Web
- MyBatis-Plus 3.5.5
- MySQL 8
- HikariCP
- Lombok
- Spring Validation
- SpringDoc OpenAPI / Swagger UI
- Logback

当前已启用能力：

- Spring Boot Web 服务
- MySQL 数据源配置
- MyBatis-Plus 分页插件
- Swagger / OpenAPI 文档
- 多环境配置：`application.yml`、`application-dev.yml`、`application-prod.yml`
- Dockerfile、docker-compose、Kubernetes 配置文件

当前预留但暂未启用能力：

- Redis
- RabbitMQ
- Spring Security

主要目录：

```text
ping-smart-club-web-boot
├── src/main/java/org/pingpongapp/pingsmartclubwebboot
│   ├── config/          # MyBatis-Plus、Swagger、Redis、RabbitMQ、Security 配置
│   ├── controller/      # REST Controller
│   ├── pojo/            # 实体类
│   └── PingSmartClubWebBootApplication.java
├── src/main/resources
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── logback-spring.xml
├── sql/                 # 数据库结构脚本
├── k8s/                 # Kubernetes 部署配置
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

后端默认服务端口为 `8080`，并配置了上下文路径：

```yaml
server:
  port: 8080
  servlet:
    context-path: /api
```

因此本地接口路径示例为：

- 健康检查：`http://localhost:8080/api/test/health`
- 系统信息：`http://localhost:8080/api/test/info`
- Swagger UI：`http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON：`http://localhost:8080/api/v3/api-docs`

### ping-smart-club-admin-vue3-vite

后台管理端预备项目，基于 Vue 3 + Vite 搭建，计划承载管理员在 Web 端的后台管理能力。

技术栈：

- Vue 3
- Vite
- Pinia
- Vue Router
- Axios
- Element Plus
- ESLint / Prettier

当前项目仍处于脚手架阶段，已安装管理端常用依赖，但路由、状态管理、接口层和业务页面尚未正式接入。

### ping-smart-club-admin-vue3-webpack

Vue 3 + Vue CLI / Webpack 管理端脚手架项目，目前主要是默认示例结构，可作为历史方案或技术对照保留。

### ping-smart-club-admin-vue2-webpack

Vue 2 + Vue CLI / Webpack 管理端脚手架项目，目前主要是默认示例结构，可作为 Vue 2 管理端方案参考。

## 业务数据模型

数据库结构脚本位于：

```text
ping-smart-club-web-boot/sql/ping-smart-club.sql
```

当前数据库表覆盖的主要业务域：

- `admin`：管理员信息
- `club`：俱乐部信息
- `coach`：教练信息
- `student`：学员信息
- `course`：课程信息
- `course_session`：课程预约 / 上课记录
- `attendance_record`：考勤记录
- `course_purchase`：课程购买记录
- `product`：商品信息
- `product_order`：商品订单
- `venue`：场地信息
- `pingpong_table`：球台信息

核心关系包括：

- 学员、教练、课程、俱乐部共同组成课程预约记录
- 课程预约记录关联考勤记录
- 课程购买记录关联学员、教练和课程
- 商品订单关联学员和商品
- 课程预约可关联场地和球台

## 前后端接口约定

移动端当前请求封装默认期望后端返回以下业务响应结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

移动端已按模块预留接口：

- `/auth/**`：登录、注册
- `/user/**`：用户信息、密码、头像
- `/coach/**`：教练信息、课程、学员、签到签退
- `/admin/**`：用户、教练、课程、预约、系统配置、报表
- `/common/**`：验证码、字典、公告、反馈、版本、上传

当前后端实际只实现了测试接口：

- `/api/test/health`
- `/api/test/info`

因此后续开发需要重点对齐：

- 前端 `baseURL` 是否包含 `/api`
- 后端统一响应格式是否改为 `{ code, message, data }`
- 已声明的前端 API 是否逐步补齐对应后端 Controller / Service / Mapper
- 登录 token、用户角色和权限模型是否与后端认证方案统一

## 部署与运行

### 后端本地运行

```bash
cd ping-smart-club-web-boot
./mvnw spring-boot:run
```

启动后访问：

```text
http://localhost:8080/api/test/health
http://localhost:8080/api/swagger-ui.html
```

### 后端 Docker 运行

```bash
cd ping-smart-club-web-boot
docker compose up -d
```

`docker-compose.yml` 中包含 MySQL、Redis、RabbitMQ 和后端应用服务。实际运行前需确认初始化 SQL 路径、数据库账号密码和中间件依赖是否与当前环境一致。

### 移动端运行

`ping-smart-club-front` 当前更接近 HBuilderX 创建的 Uni-app 项目，可通过 HBuilderX 导入后运行到微信小程序、H5 或 App。若需要纯命令行运行，需要补齐对应 `package.json` 和 Uni-app CLI 脚本。

### 管理端运行

Vue 3 + Vite 管理端：

```bash
cd ping-smart-club-admin-vue3-vite
npm install
npm run dev
```

Vue CLI 管理端：

```bash
cd ping-smart-club-admin-vue2-webpack
npm install
npm run serve
```

```bash
cd ping-smart-club-admin-vue3-webpack
npm install
npm run serve
```

## 当前开发状态

项目当前处于基础架构和业务雏形阶段：

- 移动端页面、角色导航、登录流程和 API 分层已有初步结构
- 移动端多数业务页面仍使用本地 mock 数据
- 后端 Spring Boot、MyBatis-Plus、Swagger、数据库配置已搭好
- 后端业务实体、Mapper、Service、Controller 尚待按数据库模型补齐
- 管理端 Vue 3 + Vite 项目已具备依赖基础，但业务页面尚未展开
- 数据库模型相对完整，可作为后续后端接口实现的主要依据

建议后续优先推进顺序：

1. 统一 API 路径、响应结构和错误码规范
2. 补齐登录认证、用户角色和权限模型
3. 按数据库模型实现基础 CRUD：教练、学员、课程、预约、考勤
4. 将移动端 mock 数据逐步替换为真实接口
5. 在 Vue 3 + Vite 管理端中实现后台管理核心页面
6. 完善 Docker 初始化 SQL、环境变量和部署文档
