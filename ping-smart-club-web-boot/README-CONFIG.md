# Ping Smart Club 后端项目配置说明

## 技术栈版本对应关系（Spring Boot 3.5.9）

本项目基于 Spring Boot 3.5.9，使用以下技术栈及版本：

| 技术 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.5.9 | 主框架 |
| Java | 17 | JDK 版本 |
| MyBatis-Plus | 3.5.5 | 数据持久化框架（Spring Boot 3.x 兼容版本） |
| MySQL | 8.0.33 | 数据库驱动 |
| HikariCP | 内置 | Spring Boot 默认连接池 |
| Redis | 预留 | 当前依赖未启用，后续可用于缓存、会话和候补队列 |
| RabbitMQ | 预留 | 当前依赖未启用，后续可用于通知异步化 |
| Lombok | 1.18.30 | 代码简化工具 |
| Spring Security | 预留 | 当前使用自定义拦截器，后续可切换标准安全链 |
| Logback | 内置 | Spring Boot 默认日志框架 |

## 配置文件说明

### application.yml
主配置文件，包含所有组件的默认配置。

### application-dev.yml
开发环境配置，可通过 `spring.profiles.active=dev` 激活。

### application-prod.yml
生产环境配置，使用环境变量注入敏感信息。

## 配置类说明

### 1. RedisConfig
- 预留 RedisTemplate 配置
- 当前 Redis 依赖未启用，启用前需同步打开 pom.xml 依赖

### 2. RabbitMQConfig
- 预留 RabbitTemplate 配置
- 当前 RabbitMQ 依赖未启用，启用前需同步打开 pom.xml 依赖

### 3. MyBatisPlusConfig
- 配置分页插件
- 扫描 Mapper 接口包路径：`org.pingpongapp.pingsmartclubwebboot.mapper`

### 4. SecurityConfig
- Spring Security 预留配置
- 当前正式生效的是 `AuthInterceptor + RequireRole + psc_auth_session`
- 后续如切换 Spring Security，需要同步启用 pom.xml 依赖和过滤链

## Docker 部署

### 构建镜像
```bash
docker build -t ping-smart-club-app:latest .
```

### 使用 docker-compose 启动（包含 MySQL、Redis、RabbitMQ）
```bash
docker-compose up -d
```

### 单独启动应用容器
```bash
docker run -d \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  ping-smart-club-app:latest
```

## Kubernetes 部署

### 1. 创建 ConfigMap 和 Secret
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

### 2. 部署应用
```bash
kubectl apply -f k8s/deployment.yaml
```

### 3. 配置 Ingress（可选）
```bash
kubectl apply -f k8s/ingress.yaml
```

### 4. 查看部署状态
```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

## 环境变量说明

生产环境建议使用以下环境变量：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| SPRING_PROFILES_ACTIVE | Spring 环境配置 | prod |
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 3306 |
| DB_NAME | 数据库名 | ping_smart_club |
| DB_USER | 数据库用户名 | 无，生产必须注入 |
| DB_PASSWORD | 数据库密码 | 无，生产必须注入 |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| REDIS_PASSWORD | Redis 密码 | 空 |
| RABBITMQ_HOST | RabbitMQ 主机 | localhost |
| RABBITMQ_PORT | RabbitMQ 端口 | 5672 |
| RABBITMQ_USER | RabbitMQ 用户名 | 无，生产必须注入 |
| RABBITMQ_PASSWORD | RabbitMQ 密码 | 无，生产必须注入 |

## 数据库初始化

新库执行 `sql/ping-smart-club-phase1.sql`。
旧版第一阶段库执行 `sql/ping-smart-club-phase1-hardening.sql` 做加固迁移。

## 日志配置

日志文件位置：`logs/ping-smart-club.log`
错误日志：`logs/ping-smart-club-error.log`

日志配置使用 `logback-spring.xml`，支持按环境（dev/prod）配置不同的日志级别。

## 注意事项

1. **认证鉴权**: 当前使用 `AuthInterceptor + RequireRole + psc_auth_session`，密码会在首次登录后迁移为 PBKDF2 散列。

2. **数据库连接**: 首次运行前需要创建数据库并执行初始化脚本。

3. **Redis 连接池**: 使用 Lettuce 连接池，配置在 application.yml 中。

4. **RabbitMQ**: 当前为预留配置，启用前请打开依赖并使用强密码。

5. **Kubernetes**: 部署前请确保镜像已构建并推送到镜像仓库，或使用本地镜像。

6. **健康检查**: K8s 部署配置使用当前已存在的 `/api/test/health`。如果后续启用 Actuator，可再切换为 `/api/actuator/health`。

## 开发建议

1. 开发环境使用 `application-dev.yml` 配置
2. 生产环境使用环境变量 + `application-prod.yml` 配置
3. 敏感信息（密码、密钥）不要提交到代码仓库
4. 使用 ConfigMap 和 Secret 管理 K8s 配置
