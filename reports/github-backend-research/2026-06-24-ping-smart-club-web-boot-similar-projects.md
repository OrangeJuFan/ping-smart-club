# 2026-06-24 Ping Smart Club Spring Boot 后端相似项目架构调研

检索时间：2026-06-24 11:14:21 CST  
本地基准路径：`/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot`  
报告目标：以当天本地后端真实源码为基准，筛选 GitHub 上与 `ping-smart-club-web-boot` 在技术栈、业务边界、工程化和可借鉴架构上相近的 Spring Boot 后端项目。

## 1. 当日调研摘要

今天本地后端项目可见性完整，优先路径 `/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot` 存在，已检查 `pom.xml`、`README.md`、`src/main/java` 分层、`src/main/resources/application*.yml`、`sql/`、Docker 与 K8s 配置。

本项目当前是 Spring Boot 3.5.9 + Java 17 + MyBatis-Plus 3.5.5 + MySQL 8 + SpringDoc 的单体后端，采用 controller/service/mapper/pojo/dto 技术层分包。业务已覆盖登录鉴权、学员、教练、课程、场地、排课、预约、候补、课时账户、考勤、通知、后台统计等俱乐部管理核心模块。

今日 Top 10 的共同特征：

- 高质量候选大多不是体育培训垂直项目，而是后台管理、商城、教育、CRM/ERP/RBAC 平台。这些项目在权限、代码分层、数据权限、OpenAPI/Knife4j、部署、缓存、消息、定时任务方面更有参考价值。
- 与本项目最直接相关的方向有三个：第一，RBAC/数据权限和生产化认证；第二，订单/库存/课程购买类系统里的事务一致性和流水设计；第三，Docker/K8s/配置中心/密钥管理的生产化实践。
- 业务领域最接近的是教育培训类 `roncoo-education`，但它的许可证和活跃度不如综合后台框架；架构生产化最值得看的是 `ruoyi-vue-pro`、`mall`、`JeecgBoot`、`mall-swarm`。

最值得关注的 3 个方向：

1. 认证授权生产化：从自定义拦截器 + JVM 内存 Token 迁移到标准安全链路，补齐密码散列、权限模型、数据权限、会话吊销和审计。
2. 预约/排课/课时一致性：给排课冲突、预约名额、候补晋级、消课流水增加数据库约束、锁、幂等键和事务边界。
3. 部署与配置安全：修复硬编码密钥、Docker 初始化 SQL 路径、K8s 健康探针与 actuator 依赖不匹配等问题。

## 2. 本项目基准画像

### 2.1 技术栈

- Java 17
- Spring Boot 3.5.9
- Spring Web
- MyBatis-Plus 3.5.5
- MySQL Connector 8.0.33
- HikariCP
- Lombok 1.18.30
- Spring Validation
- SpringDoc OpenAPI 2.2.0
- Logback
- Redis、RabbitMQ、Spring Security：存在配置或代码预留，但依赖和配置类主要处于注释状态。

### 2.2 代码分层

当前主包为 `org.pingpongapp.pingsmartclubwebboot`，目录如下：

- `auth`：`AuthInterceptor`、`TokenStore`、`AuthContext`、`AuthRole`、`RequireRole` 等自定义鉴权组件。
- `common`：`ApiResponse`、`BusinessException`、`GlobalExceptionHandler`。
- `config`：MyBatis-Plus、Swagger、WebMvc，以及 Redis/RabbitMQ/Security 的预留配置。
- `controller`：12 个控制器，覆盖 Auth、Student、Coach、CourseCatalog、Venue、Schedule、Booking、LessonAccount、Attendance、Notification、Stats、Test。
- `service`：11 个服务类，承载主要业务逻辑。
- `mapper`：15 个 MyBatis-Plus Mapper。
- `dto`：按业务聚合的 record DTO。
- `pojo`：15 个数据实体。

### 2.3 鉴权方式

当前鉴权是自定义 `HandlerInterceptor`：

- 登录后由 `TokenStore` 生成 UUID token。
- Token 存储在 JVM 内存 `ConcurrentHashMap`，过期时间 168 小时。
- `@RequireRole` 在方法或类上声明角色要求。
- 密码在 `AuthService` 中使用明文比较。
- Spring Security 依赖与 `BCryptPasswordEncoder` 代码均处于注释状态。

主要风险：

- 明文密码不适合生产。
- JVM 内存 Token 不支持多副本、重启保留、集中吊销和横向扩展。
- 仅角色枚举，缺少菜单/接口/数据权限模型。
- 500 异常直接返回 `ex.getMessage()`，可能泄漏内部信息。

### 2.4 数据访问与事务

- 数据访问主要使用 MyBatis-Plus BaseMapper 和 LambdaQueryWrapper。
- 关键事务标注集中在 `BookingService`、`LessonAccountService`、`AttendanceService`。
- `ScheduleService.validateConflict` 通过查询重叠时间段判断教练/场地冲突，但没有数据库锁或约束兜底。
- `BookingService.createBooking` 通过 `countBooked` 判断容量，但并发请求下可能超卖。
- `LessonAccountService.consume` 先查余额再扣减，没有版本号或行锁；同一预约重复消课可产生重复流水。

### 2.5 SQL 与部署配置

SQL 文件：

- `sql/ping-smart-club-phase1.sql`：当前 README 指定第一阶段 SQL，包含 `psc_*` 表，约 250 行，有部分唯一索引和普通索引，但没有外键约束。
- `sql/ping-smart-club.sql`：早期或另一套模型，约 337 行，包含 admin、course_session、course_purchase 等表，有较多外键，与 phase1 表模型并存。

配置与部署：

- `application.yml` 和 `application-dev.yml` 存在明文数据库密码 `QAZwsx123!`。
- `application-prod.yml` 支持环境变量，但默认 `DB_PASSWORD:root`、`RABBITMQ_PASSWORD:guest` 偏弱。
- `docker-compose.yml` 显式写入 MySQL、RabbitMQ、应用环境变量密码，并映射 `./sql/init.sql`，但当前 `sql/` 下未发现 `init.sql`。
- K8s `deployment.yaml` 健康探针访问 `/api/actuator/health`，但 `pom.xml` 未引入 `spring-boot-starter-actuator`。
- K8s `secret.yaml` 使用明文 `stringData`，适合开发演示，不适合直接提交生产密钥。

### 2.6 当前架构短板

1. 鉴权链路还停留在第一阶段，缺少密码散列、会话集中存储、细粒度权限与审计。
2. 预约名额、候补晋级、排课冲突、课时扣减依赖应用层查询，缺少数据库锁、幂等键和约束兜底。
3. controller/service/mapper/pojo/dto 技术层分包在模块增多后会让业务边界变弱，后续维护成本会上升。
4. DTO/Entity 边界还不够严格，部分接口直接接收或返回实体。
5. 统一错误码只有 HTTP 风格数字，缺少业务错误码枚举、错误码文档和前端可稳定依赖的 code。
6. 测试覆盖很低，目前仅有默认启动测试。
7. 部署配置已有雏形，但健康检查、初始化 SQL、密钥管理、依赖启用状态之间存在不一致。

## 3. 评分方法

总分 100，按以下维度综合打分：

| 维度 | 分值 | 说明 |
| --- | ---: | --- |
| 技术栈相似度 | 25 | Spring Boot 版本、Java 版本、MyBatis/MyBatis-Plus/JPA、MySQL、REST、OpenAPI、Redis/MQ/Security 等与本项目匹配程度。 |
| 业务范围/领域相似度 | 20 | 是否覆盖会员、课程、教育、预约、订单、支付、CRM/ERP、后台管理、RBAC 等可迁移业务模型。 |
| 架构清晰度与工程化质量 | 20 | 模块边界、分层、通用能力、部署、代码生成、可观测性、事务设计。 |
| 维护活跃度 | 15 | 最近提交、版本更新、Issue/PR 状态。 |
| 社区热度 | 10 | stars、forks、生态影响力，但不单独决定排名。 |
| 文档/部署/测试完整度 | 10 | README、在线文档、Docker/K8s、教程、测试或示例完整度。 |

说明：分数不是 GitHub star 排名。`lenve/vhr` star 高但最近活跃度偏弱，所以分数低于一些 star 少但技术栈更现代、维护更近的项目。`roncoo-education` 业务更接近培训，但许可证和活跃度限制也会拉低分数。

## 4. Top 10 项目总表

| 排名 | 项目 | 综合评分 | stars | forks | 最近活跃时间 | 许可证 | 技术栈 | 业务范围 | 相似点 | 主要参考价值 |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| 1 | [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) | 90 | 37.9k | 8.2k | 2026-06-20 pushed_at；commit 页显示 2026-06-07 | MIT | Spring Boot、MyBatis-Plus、Spring Security、Redis、Flowable、Vue | 后台管理、会员、商城、CRM、ERP、工作流 | 技术栈和 RBAC 高度相似 | 单体多模块、权限、数据权限、代码生成、业务模块拆分 |
| 2 | [macrozheng/mall](https://github.com/macrozheng/mall) | 86 | 83.9k | 29.7k | 2026-05-14 | Apache-2.0 | Spring Boot 3.5、JDK 17、MyBatis、Spring Security、Redis、RabbitMQ、Docker | 电商、会员、订单、后台管理 | 会员账户、订单/库存/支付与课时账户类似 | 交易一致性、权限、Docker、后台接口组织 |
| 3 | [jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 85 | 46.8k | 16.1k | 2026-06-13；README 最新版本 3.9.2 为 2026-04-30 | Apache-2.0 | Spring Boot、MyBatis-Plus、Vue3、低代码、Docker Compose | 低代码后台、流程、表单、报表、权限 | RBAC、代码生成、后台通用能力 | 快速生成 CRUD、接口/表单/权限一体化、部署脚本 |
| 4 | [YunaiV/yudao-cloud](https://github.com/YunaiV/yudao-cloud) | 84 | 19.1k | 4.8k | 2026-06-01 | MIT | Spring Cloud Alibaba、MyBatis-Plus、Redis/Redisson、Spring Security、Flowable、MQ | 微服务后台、会员、商城、CRM、ERP、WMS、MES | 可作为未来微服务演进样板 | 服务拆分、网关、Redis Token、多租户、消息与工作流 |
| 5 | [macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm) | 82 | 13k | 5.5k | 2026-05-21 | Apache-2.0 | Spring Cloud 2025、Spring Boot 3.5、Sa-Token、MyBatis、Docker、Kubernetes | 微服务商城、认证中心、网关、监控、搜索 | 交易、会员、K8s、权限与消息 | 云原生部署、网关/认证中心/监控中心组织 |
| 6 | [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 81 | 2.3k | 658 | 2026-04-24 | MIT | Spring Boot 3.5.x、JDK 17/21、MyBatis-Plus、Sa-Token、Redisson、Knife4j | 通用权限后台、多租户、工作流 | 与本项目单体形态更接近 | Sa-Token 权限、集群会话、多租户与通用模块拆分 |
| 7 | [elunez/eladmin](https://github.com/elunez/eladmin) | 78 | 21.9k | 7.4k | 2026-05-09 | Apache-2.0 | Spring Boot 2.7、JPA、JWT、Spring Security、Redis、Vue | 后台管理、日志、代码生成、运维 | JPA 不同，但 RBAC/安全/日志可借鉴 | JWT/Security、异步线程池、权限绕过修复、日志审计 |
| 8 | [dromara/RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus) | 77 | 1.2k | 379 | 2026-04-28 | MIT | Spring Cloud Alibaba、Dubbo、Sa-Token、MyBatis-Plus、MQ、OSS、ES、XXL-Job、Docker | 微服务权限管理 | 未来拆服务和认证中心参考 | 网关、认证服务、公共模块、分布式任务和消息治理 |
| 9 | [roncoo/roncoo-education](https://github.com/roncoo/roncoo-education) | 74 | 1.4k | 575 | 2025-05-20 | AGPL-3.0，README 写明商用限制 | Spring Cloud、Vue、教育系统、课程点播/考试/题库 | 在线教育、课程、培训 | 业务领域最接近培训教育 | 课程/学习/购买/通知模型，但许可证和活跃度需谨慎 |
| 10 | [lenve/vhr](https://github.com/lenve/vhr) | 66 | 28.1k | 10.2k | 2024-11-25 | 仓库页未显示标准许可证入口 | Spring Boot、Spring Security、MyBatis、MySQL、Redis、RabbitMQ、WebSocket、Vue | 人力资源管理 | RBAC、菜单权限、组织/角色模型 | 权限菜单、Spring Security 教学价值；活跃度偏弱 |

## 5. 候选项目详细分析

### 5.1 YunaiV/ruoyi-vue-pro

项目链接：[https://github.com/YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)

业务范围：通用后台管理平台，覆盖系统管理、基础设施、会员、商城、支付、CRM、ERP、MES、WMS、工作流、IM、IoT 等模块。

目录/分层：多模块单体，典型目录包括 `yudao-framework`、`yudao-module-system`、`yudao-module-member`、`yudao-module-mall`、`yudao-module-pay`、`yudao-server`、`sql`、`script`。这种模块命名比本项目当前的技术层分包更适合业务增长。

认证授权：基于 Spring Security、Token、Redis，支持 RBAC、动态菜单、按钮权限、数据权限、多终端登录和 SSO。对本项目最大的价值是替换当前 `AuthInterceptor + TokenStore` 的第一阶段鉴权。

数据访问：MyBatis-Plus，和本项目高度一致。可以参考其 DO/DTO/VO、Mapper、Service、Controller 的边界，以及代码生成器如何保持 CRUD 一致性。

事务/并发/冲突处理：虽然不是预约系统，但支付、商城订单、库存、流水号等模块提供了交易类一致性参考。本项目的预约名额、候补晋级、课时流水可以借鉴其订单/支付幂等思路。

缓存/消息/异步：Redis/Redisson、消息队列、工作流、WebSocket 都有现成模式。本项目短期不需要全量引入，但 token/session、预约候补通知和异步消息可优先参考。

接口文档：README 指向完整文档、演示环境和迁移文档，适合团队学习和对照。

部署运维：脚本、SQL、Docker/部署文档较完整。

测试策略：README 声称功能通过单元测试保证质量，但实际采用时仍应局部核验测试目录和 CI。

优点：技术栈最贴近，模块边界清晰，RBAC、数据权限、代码生成和多业务模块非常完整。

局限：功能范围远大于本项目，直接照搬会引入过多平台能力。建议只借鉴认证、权限、错误码、模块拆分和代码生成，不要短期复制多租户/工作流/微服务式复杂度。

对本项目可借鉴点：

- 把 `auth/common/config` 演进为可复用基础设施层。
- 以 `student/coach/course/schedule/booking/lesson` 为业务模块拆包。
- 引入标准权限模型：用户、角色、菜单、接口权限、数据权限。
- 用 Redis 管理 token/session，支持多实例部署。

### 5.2 macrozheng/mall

项目链接：[https://github.com/macrozheng/mall](https://github.com/macrozheng/mall)

业务范围：完整电商系统，包括前台商城和后台管理，包含商品、订单、会员、促销、运营、内容、统计、财务、权限等模块。

目录/分层：多模块单体，核心包括 `mall-admin`、`mall-common`、`mall-mbg`、`mall-portal`、`mall-search`、`mall-security`。这种“后台、移动端、公共、安全、搜索、MyBatis 生成代码”拆分对本项目未来后台端和小程序端共用服务很有参考价值。

认证授权：Spring Security 体系较完整，后台权限、用户、角色、菜单模型成熟。

数据访问：MyBatis + MyBatis Generator，MySQL 为主，和本项目 MyBatis-Plus 的数据访问思路接近。

事务/并发/冲突处理：电商订单、库存、购物车、支付、会员积分与本项目课时账户/预约容量存在相似抽象：都有“可用余额或库存”“下单/预约”“取消/退款”“流水或订单状态流转”。重点参考它对订单状态、库存扣减、幂等和缓存的组织方式。

缓存/消息/异步：Redis、RabbitMQ、Elasticsearch、MongoDB、Logstash 等生态完整。本项目可先从 Redis token、通知异步化、统计缓存开始，避免一次性引入搜索和日志体系。

接口文档：README 有教程、在线演示和微服务版本链接。

部署运维：Docker 容器化文档完善；对本项目 Docker Compose 和 K8s 配置修正有参考价值。

测试策略：不是测试驱动型样板，重点价值在业务和工程组织。

优点：社区热度最高之一，电商业务里的账户、订单、库存、支付和后台权限对课时账户/预约很有映射价值。

局限：领域不是培训，且部分模块复杂度偏大。不要把商品/订单模型机械套进课程预约。

对本项目可借鉴点：

- 为 `lesson_transaction` 增加类似订单流水的不可变状态流转。
- 为预约取消、候补晋级、消课增加幂等键。
- 把后台统计和业务交易服务拆开，避免 `StatsService` 反向侵入交易逻辑。
- 修正本项目 Docker Compose SQL 初始化路径，并对数据库、Redis、RabbitMQ 密码做外部化。

### 5.3 jeecgboot/JeecgBoot

项目链接：[https://github.com/jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot)

业务范围：AI 低代码/零代码平台，覆盖表单、流程、报表、代码生成、权限、知识库等后台通用能力。

目录/分层：仓库包含 `jeecg-boot` 后端和 `jeecgboot-vue3` 前端，另有 Docker Compose 启动脚本和多语言 README。

认证授权：成熟后台权限体系，适合参考菜单权限、动态路由、按钮权限和接口权限。

数据访问：MyBatis-Plus，技术栈与本项目接近。

事务/并发/冲突处理：不是预约类系统，但代码生成、表单、流程审批对本项目后续“请假审批、课程变更审批、退款审批”有潜在参考。

缓存/消息/异步：低代码平台常见的任务、流程、报表能力比本项目重。近期只建议参考通用组件，不建议直接引入复杂低代码引擎。

接口文档：README 明确当前最新版本 3.9.2（2026-04-30），有一键安装和 Docker Compose。

部署运维：提供 `docker-compose.yml`、`docker-compose-cloud.yml`、启动脚本。

测试策略：报告检索阶段未深入测试目录；主要参考工程化和低代码能力。

优点：工程化成熟，代码生成、表单、报表和权限平台能力强。

局限：低代码平台复杂度远超本项目当前阶段。过早引入会稀释核心俱乐部业务模型。

对本项目可借鉴点：

- 引入轻量代码生成或模板，减少 controller/service/mapper/dto 重复代码。
- OpenAPI、表单字段、字典、枚举统一维护。
- 后台统计报表可以参考其报表/大屏思路，但先保持简单 SQL 聚合。

### 5.4 YunaiV/yudao-cloud

项目链接：[https://github.com/YunaiV/yudao-cloud](https://github.com/YunaiV/yudao-cloud)

业务范围：`ruoyi-vue-pro` 的 Spring Cloud 微服务版本，覆盖后台管理、用户小程序、会员、商城、CRM、ERP、MES、WMS、IM、IoT 等模块。

目录/分层：包括 `yudao-gateway`、`yudao-module-system`、`yudao-module-member`、`yudao-module-mall`、`yudao-module-pay`、`yudao-framework`、`yudao-server` 等模块。

认证授权：Spring Security + Token + Redis，支持动态权限、多终端认证、SSO、多租户和数据权限。

数据访问：MyBatis-Plus，支持多种数据库，Redis + Redisson。

事务/并发/冲突处理：微服务场景下有 Seata、MQ、工作流等组件。本项目目前不应直接拆服务，但可以提前学习“交易边界”和“基础设施隔离”。

缓存/消息/异步：Redis、RabbitMQ/Kafka/RocketMQ 等消息适配思路完整。

接口文档：README 提供启动文档、迁移文档、演示地址。

部署运维：微服务部署复杂度高，适合中长期参考。

测试策略：README 提到单元测试保证功能质量，采用前仍需抽样核验。

优点：业务模块和基础设施覆盖完整，适合做未来演进蓝图。

局限：微服务复杂度高。本项目应先把单体内领域边界和事务一致性做好，再考虑网关/服务拆分。

对本项目可借鉴点：

- 把身份、系统配置、通知、统计这些通用能力抽为清晰基础模块。
- 使用 Redis 做 session/token 和热点字典缓存。
- 预约完成后通知可走事件机制，但先以本地事务 + outbox 表落地。

### 5.5 macrozheng/mall-swarm

项目链接：[https://github.com/macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm)

业务范围：微服务商城，包含后台、门户、认证中心、网关、监控、搜索、配置等。

目录/分层：`mall-common`、`mall-auth`、`mall-gateway`、`mall-monitor`、`mall-admin`、`mall-search`、`mall-portal`、`config`。

认证授权：README 显示当前分支基于 Spring Cloud 2025 + Spring Boot 3.5，并使用 Sa-Token。认证中心和网关分层对未来多端统一登录有参考价值。

数据访问：MyBatis、MyBatis Generator、MySQL。

事务/并发/冲突处理：商城微服务场景有订单、支付、库存、消息和搜索同步问题；可迁移到本项目的预约、消课、通知和统计异步化。

缓存/消息/异步：Redis、RabbitMQ、Elasticsearch、Nacos、Sentinel、Seata 等较完整。

接口文档：README 有教程、演示、系统架构图、业务架构图、组织结构和技术选型。

部署运维：Docker、Kubernetes、Jenkins、Portainer、监控中心都有参考价值。

测试策略：更偏工程和教程型项目，测试不是最大亮点。

优点：云原生和微服务部署资料丰富，最近有 Spring Boot 3.5 升级。

局限：本项目当前单体尚未稳定，不应短期引入 Nacos、网关、Seata。可先借鉴 K8s、配置、安全和服务边界。

对本项目可借鉴点：

- K8s 健康检查、资源限制、配置中心和监控中心组织。
- 未来如果拆服务，优先拆认证、通知、统计，不要先拆预约核心交易。
- 参考 Sa-Token 多端登录和权限模型。

### 5.6 dromara/RuoYi-Vue-Plus

项目链接：[https://github.com/dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)

业务范围：基于 RuoYi-Vue 重写的通用权限管理系统，面向分布式集群和多租户场景。

目录/分层：`ruoyi-admin`、`ruoyi-common`、`ruoyi-extend`、`ruoyi-modules`、`script`。比本项目当前技术层分包更容易按业务模块收敛。

认证授权：Sa-Token、动态权限、多租户、数据权限。对本项目而言，Sa-Token 是比直接上全量 Spring Security 更轻的生产化选项。

数据访问：MyBatis-Plus，JDK 17/21，Spring Boot 3.5.x。

事务/并发/冲突处理：不是预约业务，但最近提交包含依赖升级、异常处理和 token 日志脱敏等安全修复，对本项目很实用。

缓存/消息/异步：Redisson、集群会话、任务等能力丰富。

接口文档：Knife4j/文档站较完整。

部署运维：脚本和集群场景资料可参考。

测试策略：未作为主要亮点，本次未深入测试目录。

优点：技术栈现代，权限方案轻量，适合本项目从自定义 token 迁移。

局限：业务模块不是培训；多租户和工作流不是近期必须。

对本项目可借鉴点：

- 用 Sa-Token 或 Spring Security 替代自定义拦截器，统一登录态、权限、注解和异常。
- 对日志中的 token、密码、手机号做脱敏。
- 统一异常不要返回原始异常消息。

### 5.7 elunez/eladmin

项目链接：[https://github.com/elunez/eladmin](https://github.com/elunez/eladmin)

业务范围：后台管理系统，覆盖用户、角色、菜单、部门、岗位、字典、日志、SQL 监控、定时任务、代码生成、云存储、支付宝、服务监控、运维部署。

目录/分层：`eladmin-common`、`eladmin-generator`、`eladmin-logging`、`eladmin-system`、`eladmin-tools`、`sql`。这种通用、系统、日志、工具、生成器分模块方式对本项目拆分基础设施层有参考价值。

认证授权：JWT + Spring Security + Redis，支持 RBAC、数据权限、动态路由。

数据访问：主仓库为 JPA，和本项目 MyBatis-Plus 不同；其 README 指向 `eladmin-mp` MyBatis-Plus 版本，可作为数据访问补充参考。

事务/并发/冲突处理：不是预约系统，但 2026-05-09 的提交涉及权限绕过修复和异步线程池优化，对当前项目的权限生产化有直接启发。

缓存/消息/异步：Redis、异步线程池、Quartz 定时任务。

接口文档：文档站、演示环境、README 功能说明较完整。

部署运维：运维管理、服务监控、SQL 监控、代码生成能力完整。

测试策略：本次未把测试作为主要参考。

优点：权限、日志、运维、代码生成成熟，安全修复意识强。

局限：JPA 主线与本项目 MyBatis-Plus 不完全一致；不要照搬 Entity/Repository 模式。

对本项目可借鉴点：

- `common` 模块拆出异常、工具、安全、配置。
- 增加操作日志和异常日志，尤其是排课、预约、消课、课时调整。
- 管理员权限增加数据权限和越权测试。

### 5.8 dromara/RuoYi-Cloud-Plus

项目链接：[https://github.com/dromara/RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus)

业务范围：微服务通用权限管理系统。

目录/分层：`ruoyi-api`、`ruoyi-auth`、`ruoyi-common`、`ruoyi-gateway`、`ruoyi-gateway-mvc`、`ruoyi-modules`、`ruoyi-visual`、`script`。

认证授权：Sa-Token，独立认证服务、网关、公共 API。

数据访问：MyBatis-Plus。

事务/并发/冲突处理：微服务下会面对认证、网关、服务间调用、消息和任务的一致性问题。对本项目目前属于长期参考。

缓存/消息/异步：MQ、OSS、ES、XXL-Job、Docker 等。

接口文档：Dromara Plus 文档站和演示环境。

部署运维：云端和集群场景资料较多。

测试策略：本次未深入测试目录。

优点：比从零设计微服务更有现实参考，认证中心/网关/公共模块划分清楚。

局限：本项目还不需要微服务；过早拆分会让预约一致性更难。

对本项目可借鉴点：

- 长期拆分顺序：认证/通知/统计优先，预约/课时账户保持强一致单体事务更久。
- 公共 API 和 DTO 不应直接泄露 Entity。
- 用网关前先完善服务内权限和错误码。

### 5.9 roncoo/roncoo-education

项目链接：[https://github.com/roncoo/roncoo-education](https://github.com/roncoo/roncoo-education)

业务范围：在线教育、点播、直播、考试、题库、任务、课程附件、课程内容生产等。

目录/分层：`roncoo-education-common`、`roncoo-education-feign`、`roncoo-education-gateway`、`roncoo-education-service`、`distribution`。

认证授权：教育平台常规账号和后台能力，具体权限实现需进一步读源码。

数据访问：Spring Cloud 教育系统，具体 ORM 需进一步核验源码细节。

事务/并发/冲突处理：课程购买、学习任务、通知、考试和题库更接近培训业务，但不是线下场地/教练排课冲突模型。

缓存/消息/异步：教育平台通常涉及视频云、存储云、通知和任务。README 提到多家视频云和存储云接入。

接口文档：README 有演示地址和项目介绍。

部署运维：有 `distribution`，但本次未深入部署脚本。

测试策略：未作为亮点。

优点：领域上最接近“培训/课程/学习”，适合参考课程、购买、学习进度和通知模型。

局限：AGPL-3.0 且 README 写明商用限制；最近 GitHub commit 为 2025-05-20，活跃度弱于前面项目。不可直接复制代码，适合阅读业务模型。

对本项目可借鉴点：

- 课程产品、课程购买、课时账户和学习记录可以建立更完整生命周期。
- 家长/学员端通知、学习记录、课程资料可以参考教育系统思路。
- 许可证风险高，只建议架构学习，不建议代码复用。

### 5.10 lenve/vhr

项目链接：[https://github.com/lenve/vhr](https://github.com/lenve/vhr)

业务范围：前后端分离的人力资源管理系统，包含组织、员工、薪资、权限菜单等。

目录/分层：后端 `vhr`，前端 `vuehr`，并带 SQL 和需求规格说明书。

认证授权：Spring Security，README 展示了不同用户登录后看到不同系统菜单、角色权限分配和资源管理。

数据访问：MyBatis、MySQL。

事务/并发/冲突处理：不是预约系统，主要参考权限菜单和组织模型。

缓存/消息/异步：Redis、RabbitMQ、Spring Cache、WebSocket。

接口文档：README 和教程资料较多。

部署运维：教程型项目，适合学习但生产部署参考价值有限。

测试策略：不是主要亮点。

优点：RBAC 教学价值高，Spring Security + MyBatis + Vue 组合清楚。

局限：最近 commit 为 2024-11-25，项目说明也提示已用 Spring Boot 3 + Vue 3 重构到 `vhr2.0`，原项目更适合读权限思路而不是作为新项目基线。

对本项目可借鉴点：

- 教练、管理员、学员/家长的菜单和资源权限可以参考其角色菜单模型。
- 组织结构可映射为俱乐部、校区、场地、教练组。
- 不建议复制其旧依赖版本。

## 6. 对 ping-smart-club-web-boot 的架构建议

### 6.1 近期可落地

1. 先生产化认证链路。当前 `AuthService` 明文比较密码，`TokenStore` 用 JVM Map 存 token。建议引入 `PasswordEncoder`，对新增账号使用 BCrypt/Argon2/SM3 散列；历史明文密码通过首次登录迁移或一次性脚本迁移。Token 存储改为 Redis/session 表/JWT + refresh token，至少支持多副本、吊销、过期和登录审计。

2. 把 `@RequireRole` 升级为权限模型。短期可以保留注解，但底层从 `AuthRole` 枚举扩展到用户、角色、菜单、接口权限、数据权限。后台接口如学员、课时、预约查询要校验“教练只能看自己课程相关学员”“家长只能看自己孩子”，不能只按角色放行。

3. 立即处理配置密钥。`application.yml`、`application-dev.yml`、`docker-compose.yml`、`k8s/secret.yaml` 都有明文或弱默认密码。建议开发环境使用 `.env` 或本地未提交配置，生产 profile 缺少 `DB_PASSWORD` 时直接启动失败，不要默认 `root`/`guest`。

4. 修正部署配置不一致。`docker-compose.yml` 映射 `./sql/init.sql`，但当前 SQL 文件是 `ping-smart-club-phase1.sql` 和 `ping-smart-club.sql`；K8s 健康探针访问 `/api/actuator/health`，但项目未引入 actuator。近期要么引入 `spring-boot-starter-actuator` 并开放 health，要么把探针改到已有健康接口。

5. 给预约和候补增加数据库兜底。`BookingService.createBooking` 先 `countBooked` 再 insert，存在并发超额风险；`joinWaitlist` 用 size+1 生成 queueNo，也可能重复。建议增加 active booking 唯一约束、waitlist 唯一约束、`course_schedule.version` 乐观锁或行锁，并在预约/取消/晋级中锁定 schedule 行。

6. 给课时账户增加幂等和版本。`LessonAccountService.consume` 可以对同一 booking 重复扣课时。建议 `lesson_transaction` 增加唯一键 `(booking_id, transaction_type)` 或业务幂等键，`lesson_account` 增加 version，余额更新使用 `where id=? and version=? and balance>=?`。

### 6.2 中期演进

7. 从技术层分包迁移到领域分包。建议逐步变成 `auth`、`student`、`coach`、`course`、`venue`、`schedule`、`booking`、`lesson`、`attendance`、`notification`、`stats`。每个领域内部再放 controller/service/mapper/dto/entity，减少跨模块随意调用。

8. 明确 DTO/VO/Entity 边界。现在部分 Controller 直接接收实体或返回实体，后续字段增加后容易泄露数据库字段。建议每个接口有 Request/Response DTO，Entity 只在 mapper/service 内流转，复杂映射可先手写，不急着引入 MapStruct。

9. 建立统一错误码枚举。当前 `BusinessException` 用 400/401/403/404/409/500 作为 code，前端只能知道 HTTP 类别。建议增加如 `AUTH_PASSWORD_INVALID`、`BOOKING_CAPACITY_FULL`、`SCHEDULE_COACH_CONFLICT`、`LESSON_BALANCE_NOT_ENOUGH`，并在 OpenAPI 中列出。

10. 把排课冲突做成领域服务。`ScheduleService.validateConflict` 当前只查教练和场地时间重叠。中期要把教练可授课时间、请假、场地状态、课程容量、课程时长、跨天规则、取消状态全部收敛到 `ScheduleConflictService`，并配集成测试。

11. OpenAPI 和接口版本治理。当前使用 SpringDoc，但 DTO 和错误码还不够稳定。建议从 `/api/v1` 开始冻结移动端契约，生成前端 SDK 或至少导出 OpenAPI JSON 纳入版本管理，避免小程序和后台同时联调时字段漂移。

12. 增加测试覆盖。优先写 `BookingService` 并发预约、候补晋级、取消后晋级、重复消课、余额不足、排课冲突、权限越权测试。数据库层建议使用 Testcontainers MySQL 或专用集成测试库，不要只用 mock。

### 6.3 长期优化

13. Redis/RabbitMQ 按场景启用，不要为了技术栈而启用。Redis 第一优先级是 token/session、字典缓存、重复提交防护；RabbitMQ 第一优先级是通知发送、预约变更事件、统计异步刷新。交易主流程先采用本地事务 + outbox 表，再由异步任务投递，避免消息成功但数据库回滚。

14. 微服务拆分要等领域边界稳定。可以阅读 `yudao-cloud`、`mall-swarm`、`RuoYi-Cloud-Plus`，但 `ping-smart-club-web-boot` 近期更适合保持单体。未来拆分顺序建议是 auth/notification/stats 先拆，booking/lesson/schedule 这三个强一致核心模块最后拆。

15. 生产部署安全化。K8s Secret 不应提交真实值，建议接入 External Secrets、SealedSecrets 或云厂商 Secret Manager；镜像加版本号，不使用 `latest`；为 JVM、Hikari、慢 SQL、接口耗时、登录失败次数、预约冲突次数增加指标。

16. 建立业务审计与回滚机制。课时调整、预约取消、教练换课、候补晋级、管理员禁用用户都应记录操作者、时间、原因、前后状态。课时账户流水应不可变，错误调整用反向流水修正，不直接改旧流水。

## 7. 今日建议深入阅读的项目

1. [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)：最贴近本项目当前单体 Spring Boot + MyBatis-Plus + RBAC 形态，适合优先学习权限、模块拆分、错误码、数据权限和代码生成。
2. [macrozheng/mall](https://github.com/macrozheng/mall)：订单、会员、账户、支付、库存与本项目预约/课时/通知有可迁移的交易一致性思路。
3. [macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm)：如果要继续完善 Docker/K8s、网关、认证中心、监控中心，可作为中长期云原生参考。

## 8. 检索关键词与数据不确定性

### 8.1 使用过的检索关键词

- `spring boot mybatis-plus rbac mysql admin`
- `spring boot mybatis mysql rbac vue admin`
- `spring boot education management mybatis mysql`
- `spring boot gym management mysql`
- 精确仓库核验：`YunaiV/ruoyi-vue-pro`、`YunaiV/yudao-cloud`、`jeecgboot/JeecgBoot`、`macrozheng/mall`、`macrozheng/mall-swarm`、`dromara/RuoYi-Vue-Plus`、`dromara/RuoYi-Cloud-Plus`、`elunez/eladmin`、`roncoo/roncoo-education`、`lenve/vhr`。

### 8.2 数据不确定性说明

- GitHub 页面在未登录抓取时对大仓库 stars/forks 常显示缩略值，例如 `37.9k`、`83.9k`，本报告按页面可见值记录；其中 `ruoyi-vue-pro`、`JeecgBoot`、`mall` 也通过 GitHub API 页面片段交叉看到了更精确的 count/pushed_at。
- “最近活跃时间”优先采用 GitHub commits 页面显示的最近 commit 日期；`ruoyi-vue-pro` 同时记录了 API `pushed_at` 与 commits 页日期存在差异的情况。
- GitHub 搜索结果对中文项目和组合关键词噪声较高，本报告没有机械采用搜索页排序，而是先用搜索发现候选，再逐仓库核验 README、目录、stars/forks、许可证、最近提交和部署/文档信息。
- `roncoo-education` README 明确有商用限制且许可证为 AGPL-3.0，适合学习业务模型，不建议复制代码进入商业项目。
- 本报告是 2026-06-24 当天快照，stars、forks、Issue、PR 和最近提交会继续变化。

## 9. 主要核验来源

- [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)
- [YunaiV/ruoyi-vue-pro commits](https://github.com/YunaiV/ruoyi-vue-pro/commits/master/)
- [YunaiV/yudao-cloud](https://github.com/YunaiV/yudao-cloud)
- [YunaiV/yudao-cloud commits](https://github.com/YunaiV/yudao-cloud/commits/master/)
- [jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot)
- [jeecgboot/JeecgBoot commits](https://github.com/jeecgboot/JeecgBoot/commits/main/)
- [macrozheng/mall](https://github.com/macrozheng/mall)
- [macrozheng/mall commits](https://github.com/macrozheng/mall/commits/master/)
- [macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm)
- [macrozheng/mall-swarm commits](https://github.com/macrozheng/mall-swarm/commits/master/)
- [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)
- [dromara/RuoYi-Vue-Plus commits](https://github.com/dromara/RuoYi-Vue-Plus/commits/5.X/)
- [dromara/RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus)
- [dromara/RuoYi-Cloud-Plus commits](https://github.com/dromara/RuoYi-Cloud-Plus/commits/2.X/)
- [elunez/eladmin](https://github.com/elunez/eladmin)
- [elunez/eladmin commits](https://github.com/elunez/eladmin/commits/master/)
- [roncoo/roncoo-education](https://github.com/roncoo/roncoo-education)
- [roncoo/roncoo-education commits](https://github.com/roncoo/roncoo-education/commits/master/)
- [lenve/vhr](https://github.com/lenve/vhr)
- [lenve/vhr commits](https://github.com/lenve/vhr/commits/master/)
