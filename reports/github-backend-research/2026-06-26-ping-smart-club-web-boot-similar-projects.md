# GitHub Spring Boot 相似后端项目架构调研报告

- 调研对象：`ping-smart-club-web-boot`
- 本地源码基准路径：`/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot`
- 检索与核验时间：2026-06-26 10:27 CST
- 报告日期：2026-06-26
- 数据来源：GitHub 仓库页、GitHub 提交搜索、GitHub 仓库元数据接口、候选项目 README/目录说明；本地源码以当前工作区可见文件为准。

## 1. 当日调研摘要

### 1.1 本项目今日后端状态

本次指定路径可用，已按要求检查 `pom.xml`、`README.md`、`src/main/java` 下的 `controller/service/mapper/auth/config/common/dto/pojo` 结构、`src/main/resources/application*.yml`、`sql/`、Docker 与 K8s 配置。

`ping-smart-club-web-boot` 当前是一个面向乒乓球/体育培训俱乐部的单体 REST 后端，使用 Java 17、Spring Boot 3.5.9、Spring Web、MyBatis-Plus 3.5.5、MySQL 8、HikariCP、Lombok、Spring Validation、SpringDoc OpenAPI/Swagger、Logback。Redis、RabbitMQ、Spring Security 仍属于预留状态：依赖和配置类主要被注释，`application-dev.yml` 与 `application-prod.yml` 已有 Redis/RabbitMQ 连接配置占位，但当前业务路径并未真正依赖它们。

当天源码相比一个纯脚手架已经具备较完整的第一阶段业务闭环：

- 登录鉴权：`AuthInterceptor + @RequireRole + AuthContext`，Token 由 `TokenStore` 生成并以 SHA-256 摘要写入 `psc_auth_session`，支持重启后校验与吊销。
- 密码：`PasswordService` 使用 PBKDF2WithHmacSHA256，支持历史明文密码首次登录迁移。
- 业务模块：学员、教练、课程类型/产品、场地、排课、预约、候补、课时账户、课时流水、考勤、通知、后台统计。
- 并发一致性：排课冲突、预约、课时账户已有 `select ... for update` 型行锁；预约活跃唯一键 `uk_psc_booking_active`、课时账户唯一键、课时流水 `biz_no` 唯一键已出现在 SQL 中。
- 错误处理：`ApiResponse` 统一 `code/errorCode/message/data/traceId`，`GlobalExceptionHandler` 已屏蔽未知异常内部信息。
- 部署：有 Dockerfile、docker-compose、K8s Deployment/Service/Ingress/ConfigMap/Secret 示例，容器非 root 运行。

主要短板仍集中在生产化边界：

- 鉴权仍是自定义 MVC 拦截器，不是 Spring Security/Sa-Token 等完整安全过滤链；缺少登录限流、账号锁定、Token 设备维度、过期清理任务、生产环境 Swagger/测试接口开关。
- 业务包按技术层平铺，领域边界没有按 `auth/course/schedule/booking/accounting/notification` 模块收敛，后续服务复杂度会上升。
- DTO 边界较薄，Entity/POJO 与接口响应/入参边界需要继续硬化。
- 排课/预约一致性已起步，但仍要补足无冲突插入时的幻读防护、容量扣减模型、候补唯一约束、幂等请求号和并发测试。
- 课时账户 `version` 字段已预留但未真正使用，课时购买/退款/消课需要更完整的账本模型与对账策略。
- 测试只有 `contextLoads`，缺少 MySQL/Testcontainers、MockMvc 鉴权、并发冲突、课时流水幂等、数据库迁移验证。
- SQL 脚本管理仍是手工脚本，未引入 Flyway/Liquibase；新旧 `sql/ping-smart-club.sql` 与 phase1 脚本需要明确生命周期。

### 1.2 今日 Top 10 总体特征

本次 Top 10 不是单纯按 star 排序，而是按“技术栈相似度、业务/领域相似度、工程化质量、维护活跃度、社区热度、文档/部署/测试完整度”综合评分。整体看，真正与 `ping-smart-club-web-boot` 最可比的项目分三类：

1. **成熟后台/RBAC 框架**：RuoYi-Vue-Pro、SmartAdmin、JeecgBoot、RuoYi-Vue-Plus、RuoYi-Vue、eladmin。适合参考权限、菜单、角色、数据字典、代码生成、统一响应、审计日志、部门/岗位/数据权限。
2. **会员/订单/库存/交易型业务项目**：mall、mall-swarm。虽不是体育培训，但对课时账户、预约扣课、流水幂等、后台统计、部署文档有很强参考价值。
3. **教育/教务领域项目**：roncoo-education。技术形态比本项目更重，但业务上接近“课程、讲师、学习记录、订单/支付”，可作为中长期教务域拆分参考。

### 1.3 最值得关注的方向

1. **权限认证生产化**：优先从 SmartAdmin、RuoYi-Vue-Plus、RuoYi-Vue-Pro 学习权限模型、Token 生命周期、接口权限表达、登录安全和菜单/按钮权限闭环。
2. **预约/课时一致性**：优先从 RuoYi-Vue-Pro 的库存/订单锁定思路、mall 的订单状态机和幂等设计、mall-swarm 的异步消息与补偿思路提炼到预约、候补、课时账户。
3. **工程化与演进节奏**：本项目当前更适合先保持单体，但需要补齐 Flyway、测试、OpenAPI 分组、配置密钥、部署安全；微服务可参考 RuoYi-Cloud-Plus/roncoo-education，但不宜过早拆分。

## 2. 本项目基准画像

### 2.1 技术栈

| 项目 | 当前状态 |
| --- | --- |
| JDK | Java 17 |
| Web 框架 | Spring Boot 3.5.9 + Spring Web |
| ORM/SQL | MyBatis-Plus 3.5.5，Mapper 注解与 BaseMapper |
| 数据库 | MySQL 8，HikariCP |
| 参数校验 | Spring Validation |
| API 文档 | SpringDoc OpenAPI 2.2.0，Swagger UI `/api/swagger-ui.html` |
| 日志 | Logback，`logs/ping-smart-club.log` |
| 鉴权 | 自定义 `AuthInterceptor`、`TokenStore`、`@RequireRole` |
| 密码 | PBKDF2WithHmacSHA256，支持历史明文迁移 |
| 缓存/消息 | Redis、RabbitMQ 配置预留，依赖与配置类当前注释 |
| 测试 | 仅有 Spring Boot `contextLoads` |
| 部署 | Dockerfile、docker-compose、K8s YAML 示例 |

### 2.2 代码分层

当前主包为 `org.pingpongapp.pingsmartclubwebboot`，按技术层组织：

- `controller`：REST 接口，覆盖登录、学员、教练、课程、场地、排课、预约、课时、考勤、通知、统计。
- `service`：业务逻辑与事务边界，主要集中在 `BookingService`、`ScheduleService`、`LessonAccountService`、`AuthService` 等。
- `mapper`：MyBatis-Plus Mapper，部分手写 `@Select` 实现 `for update` 锁。
- `pojo`：表实体。
- `dto`：请求/响应 DTO，当前粒度仍偏聚合类。
- `auth`：上下文、角色枚举、Token、密码、拦截器。
- `common`：统一响应、业务异常、错误码、全局异常处理。
- `config`：MyBatis-Plus、Swagger、WebMvc，Redis/RabbitMQ/Security 当前注释。

这种结构适合第一阶段快速补接口，但后续建议改为领域包聚合，例如 `auth`、`member`、`course`、`schedule`、`booking`、`accounting`、`attendance`、`notification`、`stats`，避免服务之间越来越多横向依赖。

### 2.3 鉴权方式

当前登录入口包括管理员、教练、学员/家长。成功登录后：

1. `PasswordService` 校验密码；历史明文密码成功后迁移为 PBKDF2。
2. `TokenStore.issue` 生成 32 字节随机 Token。
3. Token 明文只返回给客户端，数据库保存 SHA-256 摘要到 `psc_auth_session`。
4. `AuthInterceptor` 从 `Authorization: Bearer <token>` 解析 Token，并通过 `@RequireRole` 做角色检查。

优点是已经摆脱 JVM 内存 Token，也避免数据库明文 Token；短板是安全体系仍停留在 MVC 层，缺少完整过滤链、异常认证入口、登录防刷、会话设备信息、刷新/续期策略、全局权限表达、生产端点隔离。

### 2.4 数据访问与一致性

本项目使用 MyBatis-Plus BaseMapper 加少量手写锁定查询：

- `CourseScheduleMapper.selectByIdForUpdate`
- `CourseScheduleMapper.selectCoachConflictIdsForUpdate`
- `CourseScheduleMapper.selectVenueConflictIdsForUpdate`
- `BookingMapper.selectByIdForUpdate`
- `LessonAccountMapper.selectByStudentIdForUpdate`

关键约束与索引：

- `psc_auth_session.token_hash` 唯一。
- `psc_booking.active_key` 唯一，用于避免同一排课同一学员的活跃预约/候补重复。
- `psc_lesson_account.student_id` 唯一。
- `psc_lesson_transaction.biz_no` 唯一，用于课时流水幂等。
- 排课按教练时间、场地时间、状态时间建立索引。

仍需加强：

- phase1 SQL 没有显式外键，历史 SQL 有外键；要明确线上是否采用外键策略。
- 候补队列缺少 `(schedule_id, student_id, active status)` 或等价唯一约束。
- 排课冲突依赖应用层查询和 InnoDB 锁，需要补充并发集成测试验证无冲突并发插入场景。
- 预约容量用 `countBooked` 动态计数，建议演进为排课行上的 `booked_count/version` 或事务内原子更新。
- `LessonAccount.version` 已预留但未使用，需要选择行锁或乐观锁模型并固定下来。

### 2.5 异常/响应封装

统一响应格式已经比较清晰：

```json
{
  "code": 0,
  "errorCode": "SUCCESS",
  "message": "success",
  "data": {},
  "traceId": null
}
```

`ErrorCode` 已覆盖认证、排课、预约、课时账户等核心错误；未知异常返回 `COMMON_INTERNAL_ERROR` 和 `traceId`。建议下一步把错误码分模块编号或增加稳定文档，避免前端和小程序依赖中文 message。

### 2.6 部署配置

已有：

- Dockerfile：多阶段构建，运行镜像 `eclipse-temurin:17-jre-alpine`，非 root 用户。
- docker-compose：MySQL 8、Redis 7、RabbitMQ 3.12、应用容器，带健康检查。
- K8s：Deployment 2 副本、Service、Ingress、ConfigMap、Secret，占位式密钥注入。

需要继续完善：

- 生产 profile 禁用 Swagger/测试接口或通过认证保护。
- K8s Secret 只是占位，应接入 CI/CD Secret、External Secrets、SealedSecret 或云 Secret Manager。
- Docker build 当前 `-DskipTests`，后续至少应在 CI 先跑单测和集成测试。
- 缺少 Actuator 健康分组、Prometheus 指标、结构化日志、镜像扫描、资源与 HPA 策略。

## 3. 评分方法

总分 100，采用以下维度：

| 维度 | 分值 | 说明 |
| --- | ---: | --- |
| 技术栈相似度 | 25 | Spring Boot、MyBatis/MyBatis-Plus/JPA、MySQL/PostgreSQL、REST、RBAC、单体/微服务形态与本项目接近程度 |
| 业务范围/领域相似度 | 20 | 是否覆盖会员、教务、课程、预约、订单、后台管理、通知、统计、组织权限等类似业务 |
| 架构清晰度与工程化质量 | 20 | 模块边界、分层、事务、错误处理、代码生成、部署、配置、可维护性 |
| 维护活跃度 | 15 | 近一年提交、依赖升级、默认分支活跃程度 |
| 社区热度 | 10 | stars、forks、生态使用面 |
| 文档/部署/测试完整度 | 10 | README、部署文档、SQL、Docker、接口文档、测试示例 |

说明：若项目 star 很高但与本项目业务/架构关联弱，综合评分会下降；若项目领域特别接近但维护或文档较弱，也不会只因业务相似而高分。

## 4. Top 10 项目总表

> Stars/Forks 中带 `k` 的值来自 GitHub 仓库页展示的近似值；无 `k` 的值来自 GitHub 元数据接口。最近活跃时间优先使用 GitHub `pushed_at` 或提交搜索结果，均为本次运行期间核验到的公开页面/接口数据，后续会随仓库变化。

| 排名 | 项目 | 综合评分 | Stars | Forks | 最近活跃 | 许可证 | 技术栈 | 业务范围 | 与本项目相似点 | 主要参考价值 |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| 1 | [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro) | 90 | 37,959 | 8,220 | 2026-06-23 | MIT | Spring Boot、MyBatis-Plus、Redis、MQ、Vue、多模块 | ERP/CRM/商城/工作流/支付/会员/后台 | RBAC、统一后端工程、会员订单和通知域 | 权限、模块拆分、订单/库存并发、OpenAPI、后台工程化 |
| 2 | [SmartAdmin](https://github.com/1024-lab/smart-admin) | 87 | 3.7k | 992 | 2026-04-05 | MIT | Spring Boot、MyBatis-Plus、Sa-Token/Spring Cache、Vue | 企业级后台、权限、代码生成、三级等保 | 单体后台、Java 17、权限与缓存、代码生成 | 轻量但现代的 RBAC、接口规范、管理后台工程 |
| 3 | [mall](https://github.com/macrozheng/mall) | 86 | 83,919 | 29,707 | 2026-05-14 | Apache-2.0 | Spring Boot、MyBatis、MySQL、Redis、Elasticsearch、RabbitMQ | 电商后台、会员、订单、库存、营销 | 会员、账户、订单/流水、后台统计 | 交易一致性、订单状态机、缓存/MQ 启用边界、部署文档 |
| 4 | [JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 85 | 46,836 | 16,060 | 2026-06-19 | Apache-2.0 | Spring Boot、MyBatis-Plus、Shiro/JWT、Low Code、Vue | 低代码后台、权限、报表、流程、接口平台 | 后台权限、数据字典、报表统计、接口文档 | 低代码/代码生成、数据权限、报表与多端后台 |
| 5 | [RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 82 | 2.3k | 685 | 2026-06-23 | MIT | Spring Boot 3、Java 17/21、MyBatis-Plus、Sa-Token、Redisson | 若依增强单体后台 | 与本项目技术版本和 RBAC 目标非常接近 | 生产化安全、数据权限、限流、防 XSS、云存储、审计 |
| 6 | [roncoo-education](https://github.com/roncoo/roncoo-education) | 78 | 1.5k | 592 | 2026-05-26 | AGPL-3.0 | Spring Boot 3.5、Spring Cloud 2025、MyBatis、Nacos、Seata、XXL-JOB | 在线教育、课程、讲师、订单、学习服务 | 教务/课程领域最接近 | 课程域边界、讲师/学员/订单拆分、任务调度、微服务演进 |
| 7 | [mall-swarm](https://github.com/macrozheng/mall-swarm) | 77 | 13k | 5.5k | 2025-12-09 | Apache-2.0 | Spring Cloud、Spring Boot、MyBatis、Redis、RabbitMQ、Docker | 电商微服务 | 订单/会员/账户、MQ、Docker 部署 | 中长期微服务、消息可靠性、服务拆分、监控部署 |
| 8 | [RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus) | 76 | 1.2k | 385 | 2026-06-23 | MIT | Spring Cloud、Spring Boot 3、MyBatis-Plus、Sa-Token、Seata、Nacos | 若依增强微服务后台 | 权限与后台模块相似，架构更重 | 多实例、网关、认证中心、分布式事务的长期参考 |
| 9 | [RuoYi-Vue](https://github.com/yangzongzhuan/RuoYi-Vue) | 73 | 3.1k | 1.7k | 2026-05-02 | MIT | Spring Boot、MyBatis、Spring Security、JWT、Vue | 经典后台管理/RBAC | 菜单、角色、部门、字典、日志 | 经典权限/菜单/代码生成模型，便于理解后台基础设施 |
| 10 | [eladmin](https://github.com/elunez/eladmin) | 68 | 21.9k | 7.4k | 2023-07-04 | Apache-2.0 | Spring Boot、Spring Security、JWT、Spring Data JPA、Redis | 后台权限、系统管理、监控、工具 | RBAC、数据权限、系统工具 | Spring Security/JWT 实践、后台工具模块；但活跃度偏弱 |

## 5. 候选项目详细分析

### 5.1 RuoYi-Vue-Pro

- GitHub：<https://github.com/YunaiV/ruoyi-vue-pro>
- 业务范围：定位为企业级管理后台，覆盖系统管理、基础设施、会员、商城、支付、工作流、CRM、ERP、AI、报表等，业务面明显大于本项目。
- 模块边界：多模块 Maven 结构，按系统基础能力、业务域、基础设施拆分；业务模块之间通过统一基础设施复用权限、租户、字典、日志、文件、消息。
- 认证授权：成熟 RBAC，包含用户、角色、菜单、部门、岗位、数据权限、登录日志、操作日志；适合本项目未来从简单 `AuthRole` 演进到菜单/按钮/数据范围权限。
- 数据访问：MyBatis-Plus 为主，配合多模块领域 Mapper；适合参考实体、DO/DTO/VO 转换、分页、条件查询和代码生成风格。
- 事务/并发/预约类冲突：虽然没有体育预约业务，但订单、库存、支付、WMS 中有行锁、状态机、幂等、库存锁定和流水思路。对本项目的课时账户、预约容量、候补晋级非常有参考价值。
- 缓存/消息/异步：大量使用 Redis、MQ、WebSocket 等基础设施，适合参考“先同步落库，再异步通知/事件”的演进方向。
- 接口文档：工程中有 OpenAPI/Swagger 相关能力，模块文档比较丰富。
- 部署运维：提供较完整部署资料，适合作为 Docker/K8s/多环境配置参考，但需要按单体规模裁剪。
- 测试策略：比普通脚手架更重视模块级验证，但体量大，直接照搬成本高。
- 架构优点：模块丰富、社区活跃、权限/订单/消息/工作流等基础设施成熟。
- 局限或风险：功能面过大，代码量和概念密度高；对小型俱乐部系统容易过度设计。
- 对本项目可借鉴点：优先学习权限模型、错误码/字典/审计、订单/库存并发控制、消息通知可靠性；暂不建议照搬完整 ERP/工作流体系。

### 5.2 SmartAdmin

- GitHub：<https://github.com/1024-lab/smart-admin>
- 业务范围：企业级后台管理系统，核心是权限、菜单、部门、用户、字典、代码生成、文件、缓存、系统工具和管理后台规范。
- 模块边界：相比 RuoYi-Vue-Pro 更轻，适合单体项目；系统能力和业务示例边界较清晰。
- 认证授权：使用现代后台常见的 Token/RBAC 方案，并强调三级等保、登录缓存、部门缓存、权限控制。
- 数据访问：MyBatis-Plus，与本项目技术路线接近；适合参考 Mapper、Service、VO、Controller 的落地风格。
- 事务/并发/预约类冲突：业务不是预约型，但权限、字典、代码生成、缓存一致性做得比多数 demo 工整。
- 缓存/消息/异步：重点可参考 Spring Cache/Redis 缓存使用和失效策略；本项目可先在课程产品、场地、教练档案、Token Session 缓存上试点。
- 接口文档：后台接口与前端配套较完整，接口规范性强。
- 部署运维：有较完善的启动/部署说明，适合参考轻量单体上线流程。
- 测试策略：不是强测试样板，但工程规范和分层足够作为单体重构参考。
- 架构优点：轻量、现代、与本项目当前阶段匹配度高。
- 局限或风险：业务域主要是通用后台，与课程/预约/课时账户没有直接模型。
- 对本项目可借鉴点：最适合作为近期参考，学习单体后台权限、安全、缓存、代码生成和接口风格。

### 5.3 mall

- GitHub：<https://github.com/macrozheng/mall>
- 业务范围：完整电商后台与前后端项目，覆盖商品、会员、订单、库存、营销、权限、内容管理、统计等。
- 模块边界：按后台管理、前台接口、通用模块、搜索、权限等组织，业务聚合清楚。
- 认证授权：有后台用户、角色、资源、菜单体系，适合参考 admin 端权限与菜单授权。
- 数据访问：Spring Boot + MyBatis + MySQL，SQL 和业务 Service 都较完整。
- 事务/并发/预约类冲突：订单创建、库存扣减、取消、支付、确认收货等状态机对本项目课时扣减、预约完成、取消候补、退款/补课有强参考价值。
- 缓存/消息/异步：Redis、RabbitMQ、Elasticsearch 等使用清楚，能帮助判断何时引入缓存和 MQ，而不是为了技术栈提前引入。
- 接口文档：README、部署和演示说明完整，适合学习文档组织。
- 部署运维：Docker、依赖服务说明较成熟。
- 测试策略：不是以测试覆盖著称，但业务代码和 SQL 足以做设计参考。
- 架构优点：真实业务复杂度高，会员/订单/流水/库存与课时账户非常相似。
- 局限或风险：电商域与体育培训不同，库存模型不能机械套到排课容量。
- 对本项目可借鉴点：重点看订单状态机、库存/账户扣减、幂等、RabbitMQ 延迟/异步处理、后台统计。

### 5.4 JeecgBoot

- GitHub：<https://github.com/jeecgboot/JeecgBoot>
- 业务范围：低代码开发平台，覆盖权限、表单、报表、流程、代码生成、接口平台、数据大屏等。
- 模块边界：平台能力强，业务开发通过低代码/代码生成扩展。
- 认证授权：JWT/Shiro/RBAC、菜单权限、数据权限、租户等能力成熟。
- 数据访问：MyBatis-Plus，配合代码生成、数据字典和在线表单。
- 事务/并发/预约类冲突：平台本身不是预约业务，冲突处理参考价值低于 mall/RuoYi-Vue-Pro。
- 缓存/消息/异步：平台集成能力较多，适合参考统一基础设施接入。
- 接口文档：文档、演示、部署资料丰富。
- 部署运维：生态完整，但也意味着运维复杂度较高。
- 测试策略：更偏平台产品，不适合直接作为测试样板。
- 架构优点：低代码、数据字典、报表、代码生成、权限体系成熟。
- 局限或风险：低代码平台概念重，若直接引入会改变本项目开发模式。
- 对本项目可借鉴点：参考数据字典、代码生成、报表/统计、OpenAPI/接口平台，不建议整体迁移低代码架构。

### 5.5 RuoYi-Vue-Plus

- GitHub：<https://github.com/dromara/RuoYi-Vue-Plus>
- 业务范围：若依增强单体后台，重点是系统管理、权限、租户、数据权限、文件、工作流、缓存、监控、安全增强。
- 模块边界：以单体多模块为主，比 RuoYi-Cloud-Plus 更接近本项目当前阶段。
- 认证授权：Sa-Token、角色/菜单/部门/岗位/数据权限、接口权限标识；比本项目 `@RequireRole` 细很多。
- 数据访问：MyBatis-Plus，Java/Spring Boot 版本较新，技术栈与本项目接近。
- 事务/并发/预约类冲突：没有直接预约业务，但权限越权、防 XSS、工作流、字典、租户、安全配置值得参考。
- 缓存/消息/异步：Redisson、Redis、分布式锁、缓存、消息组件使用比传统若依更现代。
- 接口文档：文档相对完整，适合按模块学习。
- 部署运维：配套部署资料较多，可作为 Spring Boot 3 后台部署模板参考。
- 测试策略：比原始若依更工程化，但仍需要筛选适合本项目的部分。
- 架构优点：技术版本新、单体形态合适、安全能力强。
- 局限或风险：若依生态代码量和约定较多，照搬会影响现有简洁代码。
- 对本项目可借鉴点：优先参考 Sa-Token/数据权限/接口权限、防重复提交、防 XSS、统一审计日志。

### 5.6 roncoo-education

- GitHub：<https://github.com/roncoo/roncoo-education>
- 业务范围：在线教育系统，覆盖课程、讲师、学习、订单、支付、运营后台、任务调度等。
- 模块边界：偏微服务，使用 Spring Cloud、Nacos、Seata、XXL-JOB 等；领域上比多数后台框架更接近本项目。
- 认证授权：有平台后台与业务端权限，适合参考教育平台角色划分，但其体系比本项目重。
- 数据访问：MyBatis 体系，数据模型围绕课程、讲师、订单、学习记录。
- 事务/并发/预约类冲突：课程购买、学习记录、订单支付可映射到课时购买、消课、预约完成，但排课冲突需要本项目自行设计。
- 缓存/消息/异步：微服务组件齐全，适合中长期参考任务调度、异步事件和分布式事务。
- 接口文档：项目资料相对完整，但 AGPL-3.0 许可证需要注意商业合规。
- 部署运维：微服务依赖较多，不适合本项目近期直接复制。
- 测试策略：更偏产品项目，测试参考价值一般。
- 架构优点：教育/课程领域接近，且近期有 Spring Boot 3.5/Spring Cloud 2025 依赖升级。
- 局限或风险：微服务和 AGPL 许可证会增加落地约束。
- 对本项目可借鉴点：学习课程域、讲师/学员/订单边界、定时任务和教育平台运营后台，但近期保持单体更合适。

### 5.7 mall-swarm

- GitHub：<https://github.com/macrozheng/mall-swarm>
- 业务范围：mall 的微服务版本，覆盖商品、会员、订单、营销、认证、网关、监控等。
- 模块边界：按微服务拆分，包含认证中心、网关、业务服务、监控与部署。
- 认证授权：集中认证、网关鉴权、后台权限，适合长期多端和多实例参考。
- 数据访问：Spring Cloud + MyBatis + MySQL，业务数据分服务维护。
- 事务/并发/预约类冲突：订单/库存/消息补偿对预约容量、候补晋级、课时扣减的长期演进有价值。
- 缓存/消息/异步：Redis、RabbitMQ、网关、注册中心、监控等体系较完整。
- 接口文档：部署文档和依赖服务说明较好。
- 部署运维：Docker 资料丰富，比本项目当前 K8s 示例更成熟。
- 测试策略：不是核心亮点。
- 架构优点：微服务链路和基础设施完整。
- 局限或风险：本项目当前规模不需要拆成微服务，直接引入会显著增加复杂度。
- 对本项目可借鉴点：中长期参考消息可靠性、服务拆分边界、网关认证和监控，而不是近期落地。

### 5.8 RuoYi-Cloud-Plus

- GitHub：<https://github.com/dromara/RuoYi-Cloud-Plus>
- 业务范围：若依增强微服务后台，系统管理、权限、租户、工作流、文件、监控等。
- 模块边界：网关、认证、系统服务、业务服务、基础设施服务拆分清楚。
- 认证授权：Sa-Token/网关/微服务权限，适合长期参考多实例认证。
- 数据访问：MyBatis-Plus，配合分布式事务和服务间调用。
- 事务/并发/预约类冲突：业务不是预约，但 Seata、工作流和服务拆分可为未来多门店/多系统集成做参考。
- 缓存/消息/异步：Redis、Nacos、Seata、Sentinel 等能力齐全。
- 接口文档：Dromara 生态文档相对充足。
- 部署运维：微服务部署复杂度高。
- 测试策略：不是近期主要参考点。
- 架构优点：活跃、Spring Boot 3 体系、云原生组件丰富。
- 局限或风险：对当前单体项目过重。
- 对本项目可借鉴点：只在长期关注网关、认证中心、分布式事务、多租户和多实例部署。

### 5.9 RuoYi-Vue

- GitHub：<https://github.com/yangzongzhuan/RuoYi-Vue>
- 业务范围：经典后台管理系统，系统管理、权限、菜单、角色、部门、岗位、字典、日志、代码生成。
- 模块边界：传统 Spring Boot 单体后台，结构清晰。
- 认证授权：Spring Security + JWT + RBAC，是国内后台管理系统常见实现。
- 数据访问：MyBatis，SQL XML 和代码生成体系成熟。
- 事务/并发/预约类冲突：业务不是预约/账户型，冲突处理参考有限。
- 缓存/消息/异步：有基础缓存和定时任务能力，但现代性不如 Plus 系项目。
- 接口文档：文档和社区资料丰富。
- 部署运维：部署方式简单，适合理解后台项目最小闭环。
- 测试策略：测试覆盖不是亮点。
- 架构优点：经典、学习成本低、权限/菜单/代码生成模型稳定。
- 局限或风险：技术栈相对传统，直接迁移到 Spring Boot 3/Java 17 需要筛选。
- 对本项目可借鉴点：参考权限菜单、字典、操作日志和代码生成的基础模型。

### 5.10 eladmin

- GitHub：<https://github.com/elunez/eladmin>
- 业务范围：后台管理系统，覆盖权限、部门、岗位、字典、日志、监控、工具、任务等。
- 模块边界：Spring Boot + Spring Security + JPA 的经典后台结构。
- 认证授权：Spring Security + JWT + RBAC，含数据权限、角色菜单、部门权限等。
- 数据访问：Spring Data JPA，不同于本项目 MyBatis-Plus，但实体建模和权限关联可参考。
- 事务/并发/预约类冲突：缺少业务交易/预约场景，参考价值主要在安全和系统工具。
- 缓存/消息/异步：Redis、定时任务、系统监控等能力可参考。
- 接口文档：文档较完整，社区资料多。
- 部署运维：有部署说明，但近年活跃度弱。
- 测试策略：不是主要亮点。
- 架构优点：Spring Security/JWT/RBAC 实现清晰。
- 局限或风险：最近公开提交活跃度偏低，且 ORM 路线与本项目不同。
- 对本项目可借鉴点：参考 Spring Security 安全链、JWT TokenFilter、数据权限和后台工具，不建议照搬数据访问层。

## 6. 面向 `ping-smart-club-web-boot` 的架构建议

### 6.1 近期可落地

1. **把鉴权从 MVC 拦截器推进到生产级安全链路**

   当前 `AuthInterceptor` 已能完成 Bearer Token 和 `@RequireRole`，但生产上建议迁移到 Spring Security `OncePerRequestFilter` 或 Sa-Token。保留 `psc_auth_session` 的 token-hash 存储优点，补充认证失败入口、权限不足入口、登录限流、账号锁定、Token 设备/IP/User-Agent 记录、过期会话清理任务。`/test/**`、Swagger、OpenAPI 在 prod profile 下应默认关闭或加管理员认证。

2. **引入 Flyway/Liquibase，固定数据库演进路径**

   现在存在 `sql/ping-smart-club.sql`、`ping-smart-club-phase1.sql`、`ping-smart-club-phase1-hardening.sql`。建议把 phase1 作为基线迁移，后续所有加固通过版本化 migration 管理，避免“初始化库”和“已初始化库升级脚本”长期分叉。

3. **继续补强数据库约束**

   已有 `uk_psc_booking_active` 和 `uk_psc_lesson_tx_biz_no` 是正确方向。下一步增加候补唯一约束、状态枚举约束或字典表约束、关键外键或应用层一致性校验策略；至少对 `booking.schedule_id/student_id`、`waitlist.schedule_id/student_id`、`lesson_transaction.student_id/booking_id` 建立明确的完整性规则。

4. **预约和排课并发做专项测试**

   `ScheduleService.validateConflict` 和 `BookingService.createBooking` 已使用 `for update`，但要用 Testcontainers MySQL 并发测试验证：同教练同时间并发排课、同场地并发排课、同学员重复预约、最后一个名额并发预约、取消后候补晋级。测试通过后再决定是否增加 `booked_count/version` 原子更新。

5. **把课时账户做成真正账本**

   `LessonTransaction.bizNo` 唯一很好，但 `adjust` 仍使用随机 UUID，购买/退款/后台调整应要求业务单号或幂等键。建议所有课时变化都写流水，账户余额只由流水投影或事务内同步维护；增加按学员对账接口，定期校验 `balance = totalPurchased - totalConsumed + adjustments`。

6. **补齐服务层和接口测试**

   当前只有 `contextLoads`。近期至少补：`AuthService` 密码迁移、`TokenStore` 过期/吊销、`BookingService` 重复预约/容量/候补、`LessonAccountService` 幂等消课、`ScheduleService` 冲突检测、`GlobalExceptionHandler` 错误码。MockMvc 测试应覆盖 admin/coach/student_parent 权限差异。

### 6.2 中期演进

7. **按领域重组包结构**

   目前 `controller/service/mapper/pojo/dto` 按技术层平铺。建议逐步改成 `auth`、`student`、`coach`、`course`、`venue`、`schedule`、`booking`、`accounting`、`attendance`、`notification`、`stats` 等领域包，每个领域内部再放 controller/service/mapper/dto/entity，减少跨服务随意调用。

8. **收紧 DTO/VO/Entity 边界**

   继续拆分 `CreateRequest`、`UpdateRequest`、`QueryRequest`、`ResponseVO`，避免直接暴露 POJO；对后台、教练端、小程序端分别定义响应对象。可以引入 MapStruct 或本地 converter，保持实体字段与接口字段解耦。

9. **OpenAPI 分组与接口版本化**

   当前统一 `/api` 前缀可用，但建议形成 `/api/v1/admin`、`/api/v1/coach`、`/api/v1/miniapp` 或通过 SpringDoc GroupedOpenApi 分组。OpenAPI 中补充 Bearer Auth Scheme、错误码 Schema、分页 Schema，前端和小程序可按契约生成类型。

10. **通知从同步写入演进到 Outbox + MQ**

   目前 `BookingService`、`ScheduleService` 同步调用 `notificationService.createSystemNotification`。短期可接受；中期当短信、微信订阅消息、站内信、教练通知上线时，应使用 outbox 表记录业务事件，事务提交后由任务或 MQ 投递，避免主事务因外部通知失败回滚。

11. **缓存启用要从读多写少和权限会话开始**

   Redis 已有配置占位，但不要一开始缓存所有数据。优先缓存课程产品、场地、教练基础档案、字典、权限菜单、Token Session 解析结果；所有排课容量、课时余额、候补队列仍以数据库事务为准，缓存只做读优化。

### 6.3 长期优化

12. **多门店/多俱乐部与数据权限模型**

   如果未来一个系统服务多个俱乐部或门店，需要在用户、学员、教练、课程、场地、排课、课时账户上增加 `club_id/tenant_id`，并参考 RuoYi/SmartAdmin 的部门/数据范围权限。这个决定会深刻影响索引、唯一约束、权限校验和报表统计，应早于大规模业务上线前确定。

13. **统一可观测性与部署安全**

   引入 Actuator 健康分组、Prometheus/Micrometer、结构化 JSON 日志、traceId MDC、慢 SQL 日志、审计日志。K8s Secret 不应保留明文占位；建议使用 External Secrets/SealedSecret/云 Secret Manager，并增加镜像漏洞扫描、readOnlyRootFilesystem、资源限制、HPA 和灰度发布策略。

14. **谨慎评估微服务**

   RuoYi-Cloud-Plus、mall-swarm、roncoo-education 都能提供微服务参考，但本项目近期最需要的是单体内聚和一致性。只有当多端流量、门店隔离、支付/通知/统计等独立伸缩诉求明确后，再拆出认证、通知、报表、支付等边界服务。

## 7. 今日建议深入阅读的 3 个项目

1. **[RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro)**  
   理由：综合评分最高，权限、会员、订单、支付、库存、通知、工作流都有生产化参考。尤其适合研究“复杂业务状态机 + 后台基础设施”的组合。

2. **[SmartAdmin](https://github.com/1024-lab/smart-admin)**  
   理由：比 RuoYi-Vue-Pro 更轻，更贴近本项目当前单体阶段；Spring Boot/MyBatis-Plus/RBAC/缓存/代码生成的落地方式更容易迁移。

3. **[roncoo-education](https://github.com/roncoo/roncoo-education)**  
   理由：业务领域最接近教务/课程/讲师/学员/订单。虽然架构偏微服务，但可用于中长期理解课程域和教育平台运营后台。

## 8. 检索关键词与筛除口径

### 8.1 本次使用的关键词

- `springboot mybatis-plus rbac admin language:Java`
- `smart-admin SpringBoot Mybatis-Plus Vue language:Java`
- `AgileBoot SpringBoot MyBatis Plus Vue language:Java`
- `Spring Boot MyBatis MySQL education management`
- `Spring Boot MyBatis gym management member appointment`
- `RuoYi Vue Plus Spring Boot 3 MyBatis Plus Sa-Token`
- `mall Spring Boot MyBatis MySQL RabbitMQ Redis`
- `roncoo education Spring Boot Spring Cloud MyBatis`

### 8.2 筛除口径

排除了以下类型项目：

- 只有脚手架或 demo，没有明确业务模块。
- README/部署说明严重缺失，无法判断可运行性。
- 与后端架构关联弱，主要是前端、资料库或算法项目。
- 长期不可用、归档或明显无人维护，且没有独特领域参考价值。
- star 较高但业务和架构参考价值不足的项目。

### 8.3 数据不确定性说明

- GitHub stars/forks、最近提交、许可证会持续变化，本报告只代表 2026-06-26 10:27 CST 前后可见数据。
- 部分 stars/forks 来自 GitHub 仓库页近似展示，如 `3.7k`；部分来自 GitHub 元数据接口，显示为精确数值。
- GitHub 连接器的泛关键词仓库搜索噪声较高，因此本次采用“关键词搜索发现候选 + 精确仓库元数据/提交核验 + README 人工筛选”的组合方式。
- 本地后端源码未执行编译和接口测试；本报告对本项目的判断来自可见源码、SQL、配置和部署文件。

## 9. 主要来源链接

- RuoYi-Vue-Pro：<https://github.com/YunaiV/ruoyi-vue-pro>
- SmartAdmin：<https://github.com/1024-lab/smart-admin>
- mall：<https://github.com/macrozheng/mall>
- JeecgBoot：<https://github.com/jeecgboot/JeecgBoot>
- RuoYi-Vue-Plus：<https://github.com/dromara/RuoYi-Vue-Plus>
- roncoo-education：<https://github.com/roncoo/roncoo-education>
- mall-swarm：<https://github.com/macrozheng/mall-swarm>
- RuoYi-Cloud-Plus：<https://github.com/dromara/RuoYi-Cloud-Plus>
- RuoYi-Vue：<https://github.com/yangzongzhuan/RuoYi-Vue>
- eladmin：<https://github.com/elunez/eladmin>
