# 2026-06-25 `ping-smart-club-web-boot` GitHub 相似后端项目调研

## 1. 当日调研摘要

### 1.1 本项目今日真实状态概括

本次优先基于本地完整源码路径 `/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot` 进行检查，路径可见，无需回退到工作区内的同名目录。

- 基础栈已经落地为 `Java 17 + Spring Boot 3.5.9 + Spring Web + MyBatis-Plus 3.5.5 + MySQL 8 + HikariCP + Validation + Lombok + SpringDoc 2.2.0`。
- 当前鉴权不是 Spring Security 正式生产链路，而是 `AuthInterceptor + TokenStore + psc_auth_session` 的轻量 Bearer Token 方案；`SecurityConfig` 仍处于整段注释状态。
- 密码散列已经比早期明文方案前进了一步，使用 `PBKDF2WithHmacSHA256`，并兼容历史明文密码首登迁移。
- 业务主链路已经有可读代码和 SQL：登录鉴权、学员/教练、课程产品、场地、排课、预约、候补、课时账户、课时流水、考勤、通知、统计。
- 一致性控制已有基础动作：`BookingService`、`LessonAccountService` 使用事务，`psc_booking.active_key`、`psc_lesson_transaction.biz_no`、`psc_auth_session.token_hash` 有唯一约束，课时账户有 `version` 字段预留，但真正的高并发一致性仍偏“单体早期可用版”。
- 统一响应、错误码、全局异常、Swagger 路径、`/api` context-path 已成型；Redis、RabbitMQ、Security 只处于配置预留或注释状态。
- 本地无法完成编译验证：当前环境缺少 `mvn`，因此“代码结构已落地”可以确认，“今日可编译可运行”无法在本次自动化里直接证实。

### 1.2 今日 Top 10 总体特征

今日筛出的 10 个项目明显分成三类：

1. `RuoYi` 系与 `JeecgBoot` 系这类“RBAC + 管理后台 + REST 接口 + 工程化底座”项目，最适合借鉴权限、审计、代码分层、部署、监控和工程规范。
2. `mall`、`mall-swarm`、`roncoo-education` 这类“强业务后端”项目，最适合借鉴会员、订单/预约、库存/额度、异步通知和领域拆分。
3. `yudao-cloud` 这类“现代 Spring Boot 企业后台套件”，虽然业务不完全贴合体育培训，但在权限、字典、租户、消息、缓存、任务和文档完整度上参考价值很高。

### 1.3 今日最值得关注的 3 个方向

1. **权限认证生产化**：你当前的 `AuthInterceptor` 方案已经能跑，但距离真正生产可控的会话治理、权限表达、刷新续期、审计、风控限流还有明显差距。
2. **预约/排课/课时的一致性闭环**：目前有事务和唯一键，但缺少更完整的冲突建模、幂等语义、状态机边界和异步事件闭环。
3. **工程化补全**：测试、部署、安全配置、监控、配置密钥管理、OpenAPI 治理都还在“有雏形但不够生产”的阶段。

## 2. 本项目基准画像

### 2.1 技术栈与基础设施

- Java: `17`
- Spring Boot: `3.5.9`
- Web: `spring-boot-starter-web`
- ORM: `MyBatis-Plus 3.5.5`
- DB: `MySQL 8.0.33`
- 连接池: `HikariCP`
- 校验: `spring-boot-starter-validation`
- 文档: `springdoc-openapi-starter-webmvc-ui 2.2.0`
- 日志: `logback-spring.xml`
- 预留能力: `Redis`、`RabbitMQ`、`Spring Security`

### 2.2 代码分层

当前目录结构清晰，属于经典单体后端分层：

- `controller/`: `AuthController`、`StudentController`、`CoachController`、`ScheduleController`、`BookingController`、`LessonAccountController`、`AttendanceController`、`NotificationController`、`StatsController` 等。
- `service/`: `AuthService`、`BookingService`、`ScheduleService`、`LessonAccountService` 等，核心业务逻辑主要集中在这里。
- `mapper/`: MyBatis-Plus Mapper + 少量自定义锁查询。
- `pojo/`: 数据库实体。
- `dto/`: 入参与响应对象目前按业务聚合成 `*Dtos.java` 文件。
- `auth/`: `AuthInterceptor`、`TokenStore`、`PasswordService`、`RequireRole`、`AuthContext`。
- `common/`: `ApiResponse`、`BusinessException`、`ErrorCode`、`GlobalExceptionHandler`。
- `config/`: `WebMvcConfig`、`SwaggerConfig`、`MyBatisPlusConfig`，以及尚未启用的 `SecurityConfig`、`RedisConfig`、`RabbitMQConfig`。

### 2.3 鉴权方式

- 当前并未启用 Spring Security Filter Chain。
- 登录后通过 `TokenStore.issue()` 生成随机 Bearer Token。
- Token 只保存 SHA-256 摘要到 `psc_auth_session`，这比把原始 Token 存 DB 更合理。
- 鉴权入口是 `AuthInterceptor`，按请求头 `Authorization: Bearer <token>` 解析并查库。
- 角色控制是自定义注解 `@RequireRole`，能力简单直接，但表达力和生态能力有限。

### 2.4 数据访问与业务一致性

- 主要通过 MyBatis-Plus CRUD + 自定义 Mapper 锁查询完成。
- 预约、取消、候补提升、课时扣减都放在事务内。
- `psc_booking.active_key` 和 `psc_lesson_transaction.biz_no` 已经开始承担幂等与防重。
- `psc_lesson_account.version` 目前只是预留字段，尚未形成真正的乐观锁更新策略。
- SQL 里索引已经覆盖常见列表和查询场景，但大量外键、检查约束、唯一业务约束仍未系统补全。

### 2.5 异常与响应封装

- `ApiResponse` 已统一 `code / errorCode / message / data / traceId`。
- `GlobalExceptionHandler` 已区分业务异常、校验异常、未知异常。
- 未知异常会生成 `traceId` 并写日志，这一点是加分项。

### 2.6 部署与配置

- `application.yml`、`application-dev.yml`、`application-prod.yml` 已拆分。
- 生产环境参数主要依赖环境变量注入。
- 但当前仓库未见成熟的 `Dockerfile`、`docker-compose.yml`、K8s 清单、Actuator/metrics 暴露、密钥托管方案。

### 2.7 当前架构短板

1. Spring Security 没真正启用，权限认证仍是轻量自写方案。
2. 历史演示账号和默认密码逻辑仍偏开发态，不适合直接生产。
3. 预约/候补/排课冲突处理仍依赖应用层流程控制，数据库层规则不够严密。
4. DTO/VO/Entity 边界还不够严格，服务接口和控制层对象设计仍偏粗。
5. 缓存、消息、异步任务、审计日志、限流、监控都还在预留态。
6. 测试体系缺失明显，本次环境里也无法做 Maven 编译验证。

## 3. 评分方法

本次采用总分 100 的综合评分，维度如下：

- 技术栈相似度：25
- 业务范围或领域相似度：20
- 架构清晰度与工程化质量：20
- 维护活跃度：15
- 社区热度：10
- 文档、部署、测试完整度：10

评分说明：

- 业务完全不相同但技术底座高度相似的项目，仍可能进入 Top 10，但会在“业务范围相似度”上被拉低。
- Star 高但更像通用平台或脚手架的项目，会在“业务相似度”和“可直接借鉴性”上扣分。
- 多模块云原生项目若明显超过你当前单体体量，也会因迁移成本而适度降分。

## 4. Top 10 项目总表

> 说明：Stars/Forks/许可证/默认分支最近活跃时间均在 2026-06-25 10:53 CST 前后通过 GitHub 仓库主页与提交页实时核验；个别仓库的测试覆盖度只能根据仓库可见文件与 README 判断，不能等价视为完整测试审计。

| 排名 | 项目 | 链接 | 综合评分 | Stars | Forks | 最近活跃时间 | 核心技术栈 | 业务范围 | 与本项目相似点 | 主要参考价值 |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| 1 | RuoYi-Vue-Pro | [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) | 90 | 33.5k | 8.2k | 2026-06-07 | Spring Boot 3 / Vue / MyBatis Plus / Redis / MQ | 企业后台、会员、支付、工作流、商城、ERP、CRM、教培扩展 | Java 17 代际相近、后台能力全、RBAC 完整 | 权限、审计、缓存、任务、部署、模块分层 |
| 2 | mall | [macrozheng/mall](https://github.com/macrozheng/mall) | 88 | 78.5k | 28.7k | 2026-03-19 | Spring Boot / MyBatis / Redis / Elasticsearch / MQ | 电商会员、订单、库存、营销 | 强事务业务、会员/订单/库存和预约/课时思路相通 | 领域拆分、库存/订单一致性、部署文档 |
| 3 | yudao-cloud | [YunaiV/yudao-cloud](https://github.com/YunaiV/yudao-cloud) | 87 | 9.3k | 2.3k | 2026-06-15 | Spring Boot 3 / Spring Cloud / MyBatis Plus / Redis / MQ | 企业后台、ERP、CRM、商城、支付、工作流 | 与 RuoYi-Vue-Pro 同作者体系，工程化更现代 | 租户、消息、缓存、安全体系、模块治理 |
| 4 | JeecgBoot | [jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 84 | 43.4k | 15.8k | 2026-06-22 | Spring Boot / Spring Cloud / MyBatis Plus / Redis | 低代码后台、流程、IoT、行业应用 | 后台能力强，适合看 RBAC 和配置治理 | 模块装配、权限、代码生成、运维能力 |
| 5 | RuoYi-Vue-Plus | [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 82 | 5.8k | 1.8k | 2026-05-31 | Spring Boot 3 / MyBatis Plus / Redis / Sa-Token | 后台管理、权限、字典、租户、监控 | 单体管理平台与当前体量接近 | Sa-Token、缓存、租户、代码规范 |
| 6 | eladmin | [elunez/eladmin](https://github.com/elunez/eladmin) | 80 | 21.6k | 4k | 2026-05-25 | Spring Boot / Spring Security / JPA / Redis | 通用后台、权限、任务、日志 | 权限链路和后台治理成熟 | Security、审计、任务、部署与文档 |
| 7 | mall-swarm | [macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm) | 79 | 14.2k | 5.8k | 2026-01-13 | Spring Cloud / Nacos / Gateway / MyBatis | 微服务电商 | 如果后续俱乐部业务拆服务，可直接参考 | 服务拆分、网关、注册中心、部署演进 |
| 8 | roncoo-education | [roncoo/roncoo-education](https://github.com/roncoo/roncoo-education) | 77 | 4.4k | 1.7k | 2025-11-09 | Spring Boot / Cloud / MyBatis / Redis / MQ | 在线教育、课程、用户、订单、教务 | 教培业务域最接近之一 | 课程/教务领域边界、订单与内容体系 |
| 9 | RuoYi-Cloud-Plus | [dromara/RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus) | 76 | 1.7k | 541 | 2026-06-12 | Spring Cloud / MyBatis Plus / Redis / Sa-Token | 云原生后台、权限、监控、租户 | 适合中长期微服务演进参考 | 网关鉴权、服务治理、配置中心 |
| 10 | RuoYi | [yangzongzhuan/RuoYi](https://github.com/yangzongzhuan/RuoYi) | 75 | 6.5k | 2.3k | 2025-11-30 | Spring Boot / MyBatis / Shiro | 通用后台、权限、代码生成 | 经典后台单体，结构容易读 | 传统 RBAC、代码组织、后台实践 |

## 5. 各项目详细分析

### 5.1 RuoYi-Vue-Pro

- 业务范围：通用后台底座 + ERP/CRM/商城/支付/工作流等多业务模块。
- 模块边界：后台基础能力与业务模块边界明确，适合拆解“平台能力”和“俱乐部业务能力”。
- 目录与分层：标准企业单体/多模块 Spring Boot 组织，业务、系统、基础设施、定时任务、消息等分层清晰。
- 认证授权：成熟 RBAC，权限点、菜单、角色、数据权限、审计都更完整。
- 数据访问：MyBatis-Plus 为主，缓存、字典、配置、任务治理成熟。
- 事务与并发：在订单、支付、库存、工作流等事务型场景下有较成熟模式。
- 缓存/消息/异步：Redis、MQ、任务调度集成度高。
- 接口文档：文档和 README 体系完整，部署入口清楚。
- 部署运维：比你的项目更接近生产态，便于借鉴容器化、初始化、环境变量约定。
- 测试策略：从仓库可见信息看，工程质量较高，但测试不是它对外宣传的第一卖点。
- 优点：能力全、活跃高、生态成熟、Spring Boot 3 代际一致。
- 局限：功能面非常宽，直接整套照搬会远超 `ping-smart-club-web-boot` 当前体量。
- 对你的借鉴点：优先借鉴认证授权、统一字典/配置、审计日志、缓存和模块边界，而不是直接照搬全部业务模块。

### 5.2 mall

- 业务范围：会员、商品、订单、库存、支付、营销。
- 模块边界：订单、库存、会员、营销等边界清楚，是强事务业务后端的经典样本。
- 目录与分层：Controller / Service / DAO / DTO / Portal/Admin 双侧接口思路成熟。
- 认证授权：后台管理员 + 会员体系双通道，适合理解不同身份域。
- 数据访问：MyBatis 为主，SQL 和索引思维较成熟。
- 事务与并发：订单、库存、支付补偿、状态流转经验可迁移到预约/课时/候补。
- 缓存/消息/异步：Redis、MQ、搜索等设施完整。
- 接口文档：README 和衍生文档丰富。
- 部署运维：部署资料、环境依赖说明较全。
- 测试策略：文档完整度较高，但自动化测试并非仓库首页最突出资产。
- 优点：强业务一致性建模经验丰富。
- 局限：领域是电商，不是教培或体育场馆；需要映射理解而不是直接复用。
- 对你的借鉴点：`booking -> order`、`lesson account -> member asset/inventory`、`waitlist -> backorder` 这类映射非常有价值。

### 5.3 yudao-cloud

- 业务范围：通用企业平台，覆盖 ERP、CRM、商城、支付、工作流等。
- 模块边界：现代企业级后台模块化更强，平台基础能力比单一业务更完整。
- 目录与分层：云原生分层清楚，平台层能力完备。
- 认证授权：权限、租户、字典、配置、操作日志等体系成熟。
- 数据访问：MyBatis-Plus、缓存、消息、任务组件协同较好。
- 事务与并发：更偏平台化能力封装，适合作为中期演进蓝本。
- 缓存/消息/异步：这方面比你当前项目成熟很多。
- 接口文档：文档、演示、模块介绍都较充分。
- 部署运维：比大多数单体项目更偏生产化。
- 测试策略：工程成熟度较高，但真正测试深度仍需逐模块审读。
- 优点：现代 Spring Boot 3 / Cloud 体系，工程规范强。
- 局限：明显超出你当前单体项目复杂度。
- 对你的借鉴点：先借鉴平台基础设施与治理规则，不建议现在直接做 Cloud 化。

### 5.4 JeecgBoot

- 业务范围：低代码后台平台，可扩展到多个行业项目。
- 模块边界：基础平台能力齐全，业务模块通常站在低代码平台之上扩展。
- 目录与分层：平台化很重，配置、权限、字典、流程、报表等能力丰富。
- 认证授权：RBAC、菜单权限、组织权限等成熟。
- 数据访问：MyBatis-Plus 为主。
- 事务与并发：基础平台强于细分业务深度。
- 缓存/消息/异步：具备企业后台常见基础设施。
- 接口文档：文档非常丰富，部署资料可读性高。
- 部署运维：适合参考企业后台的工程化“全套姿势”。
- 测试策略：更强项在平台能力和可扩展性，不在展示深测试样例。
- 优点：工程化重，文档好，活跃度高。
- 局限：低代码平台特性较重，很多能力对你当前业务不是刚需。
- 对你的借鉴点：权限模型、菜单资源、字典配置、文件组织方式值得看；低代码层面不用跟。

### 5.5 RuoYi-Vue-Plus

- 业务范围：通用后台、权限、租户、监控、字典、代码生成。
- 模块边界：单体后台结构与当前项目规模更接近，阅读成本低。
- 目录与分层：比经典 RuoYi 更现代，Spring Boot 3 + MyBatis-Plus + Sa-Token 组合较适合你。
- 认证授权：Sa-Token 方案对中小团队非常实用，接近你当前自定义 Token 方案的可升级路径。
- 数据访问：MyBatis-Plus 体系统一。
- 事务与并发：业务深度一般，但平台底座扎实。
- 缓存/消息/异步：Redis 等基础设施接入思路成熟。
- 接口文档：README、脚本、SQL、部署入口可见。
- 部署运维：比传统单体更现代。
- 测试策略：中等，工程规范比测试展示更突出。
- 优点：与你当前单体阶段最容易嫁接。
- 局限：业务域仍然是通用后台，不是排课预约。
- 对你的借鉴点：如果不想一步切到 Spring Security，全量参考 `Sa-Token + RBAC + 会话治理` 是一条现实路线。

### 5.6 eladmin

- 业务范围：通用后台管理系统。
- 模块边界：权限、日志、任务、系统设置等基础能力比较完整。
- 目录与分层：JPA 风格，和你当前 MyBatis-Plus 不同，但安全链路实现值得看。
- 认证授权：Spring Security 是它的重要看点。
- 数据访问：JPA/Hibernate，不同于你的 ORM 体系。
- 事务与并发：业务域不是强事务型，但后台治理能力较成熟。
- 缓存/消息/异步：Redis、任务、日志审计等相对完善。
- 接口文档：README 与部署说明较完整。
- 部署运维：容器化和部署资料相对友好。
- 测试策略：从仓库可见信息判断，质量意识较好，但测试展示一般。
- 优点：适合专门学习“Spring Security 在后台单体中的落地方式”。
- 局限：JPA 体系差异较大，业务域不贴俱乐部。
- 对你的借鉴点：主要借鉴安全治理、审计、任务、环境隔离，不借鉴 ORM 选型。

### 5.7 mall-swarm

- 业务范围：微服务电商。
- 模块边界：网关、注册中心、配置中心、订单、商品、会员等服务拆分清楚。
- 目录与分层：典型 Spring Cloud 微服务结构。
- 认证授权：依赖网关与服务协同，适合看微服务下的鉴权方式。
- 数据访问：每个服务按职责划分。
- 事务与并发：适合学习分布式状态管理与异步化。
- 缓存/消息/异步：较完整。
- 接口文档：文档与部署说明较清楚。
- 部署运维：微服务部署经验很强。
- 测试策略：更强项在架构演进，不在测试展示。
- 优点：对中长期拆服务有启发。
- 局限：对你当前单体项目来说明显过重。
- 对你的借鉴点：现在不要照着拆，但可以提前看“若通知、统计、预约后续单独服务化时，边界如何切”。

### 5.8 roncoo-education

- 业务范围：在线教育、课程、内容、用户、订单、教务。
- 模块边界：和教培领域更接近，课程、用户、支付/订单的组织方式有参考意义。
- 目录与分层：教育业务色彩较强。
- 认证授权：具备后台与用户侧区分。
- 数据访问：Spring Boot/Cloud + MyBatis 系思路。
- 事务与并发：对课程和订单链路的借鉴价值高于通用后台项目。
- 缓存/消息/异步：比你的项目更接近真实教培后端形态。
- 接口文档：中等偏上。
- 部署运维：有一定企业级设计，但不如头部平台项目完整。
- 测试策略：公开可见测试资产不算突出。
- 优点：业务域贴近“课程/教务/用户”。
- 局限：最近活跃度不如头部项目，且体量较大。
- 对你的借鉴点：更适合读业务模块，而不是拿来做底层平台模板。

### 5.9 RuoYi-Cloud-Plus

- 业务范围：云原生后台平台。
- 模块边界：网关、认证、系统、租户、监控等能力齐全。
- 目录与分层：比单体 RuoYi 系更偏平台治理。
- 认证授权：适合看网关鉴权、Token 传播、服务间身份。
- 数据访问：MyBatis-Plus + Cloud 配套。
- 事务与并发：基础设施价值大于业务样例价值。
- 缓存/消息/异步：平台层成熟。
- 接口文档：较完整。
- 部署运维：适合中长期平台化参考。
- 测试策略：中等。
- 优点：如果未来做多校区、多租户、多实例，很有参考性。
- 局限：当前明显超出 `ping-smart-club-web-boot` 所需复杂度。
- 对你的借鉴点：先看认证和配置治理，不要提前微服务化。

### 5.10 RuoYi

- 业务范围：经典通用后台管理。
- 模块边界：用户、角色、菜单、日志、监控、字典等经典后台模块。
- 目录与分层：老派但清楚，学习成本低。
- 认证授权：Shiro 为主，传统 RBAC 非常直观。
- 数据访问：MyBatis 体系。
- 事务与并发：偏后台 CRUD 和管理平台，不是强事务业务模型。
- 缓存/消息/异步：基础能力有，但不算现代化。
- 接口文档：文档和社区资料丰富。
- 部署运维：适合读“经典单体后台”。
- 测试策略：不是它的强项。
- 优点：结构直白，适合补齐后台治理常识。
- 局限：技术代际偏旧，直接照搬会把你拉回旧栈。
- 对你的借鉴点：只建议借鉴 RBAC 结构和后台菜单权限，不建议借鉴安全技术栈本身。

## 6. 针对 `ping-smart-club-web-boot` 的架构建议

### 6.1 近期可落地（优先级最高）

1. **把鉴权从 `AuthInterceptor` 演进到正式安全链路**  
   当前自定义拦截器能工作，但建议至少切到 `Spring Security` 或 `Sa-Token` 之一，统一处理匿名路径、Bearer Token 解析、鉴权异常、方法级授权、会话吊销和登录态刷新。

2. **停用生产默认口令与演示账号逻辑**  
   README 里的 `admin123`、`123456` 仅适合开发。生产初始化应改为一次性引导、强制改密、弱口令禁止、管理员密码轮换策略。

3. **强化 `TokenStore` 的会话模型**  
   目前只有 `token_hash + expire_at + status`，建议补 `device_id`、`login_ip`、`user_agent`、`last_access_at`、`refresh_token` 或滑动续期策略，以及“按用户踢出全部会话”的管理能力。

4. **把预约/候补/取消/完成定义成显式状态机**  
   `BOOKED / WAITING / CANCELLED / COMPLETED / ABSENT` 已有雏形，但建议把允许转移关系、触发条件、是否扣课时、是否可逆全部收敛为统一状态机规则，避免未来条件分支散落各 Service。

5. **进一步收紧排课与预约冲突的一致性**  
   `countBooked()` + 应用层判断在高并发下仍可能出现竞态。建议在 `course_schedule`、`booking`、`waitlist_entry` 维度增加更严格的唯一约束、锁顺序和冲突索引，并补充并发测试。

6. **让课时流水彻底成为领域真账本**  
   现在 `adjust()` 里用 `UUID` 生成流水业务号，这对后台手工调整可行，但对任何外部调用、退款、补偿、撤销都不够稳定。建议所有变动都使用可追踪的业务主键，保证幂等与审计。

7. **严格区分 DTO / VO / Entity**  
   当前 `dto/*Dtos.java` 便于起步，但后续建议拆成 `command/query/response` 或 `request/response` 粒度，避免 Controller、Service、POJO 三层对象边界继续混在一起。

8. **补数据库约束而不只补 Java 校验**  
   当前表里多数是索引，外键和检查约束偏少。建议至少补手机号唯一策略、角色合法值、容量正数、时间区间合法性、教练/场地排课冲突约束、候补队列唯一规则。

### 6.2 中期演进

9. **按业务域拆 Service，而不是继续堆厚服务类**  
   建议逐步形成 `auth`、`member/student`、`coach`、`schedule`、`booking`、`lesson-account`、`attendance`、`notification`、`stats` 九个边界清晰的子域，减少跨域 Service 相互调用和共享状态。

10. **启用 Redis 的时机要明确**  
   不建议为了“看起来高级”提前上 Redis。建议在出现以下场景再启用：登录会话热点校验、热门课表查询、候补人数缓存、短信验证码、限流、幂等键短期存储。

11. **消息队列优先用于通知与统计，不优先用于预约主事务**  
   你当前事务链路还不复杂，MQ 最先适合承接预约成功通知、候补晋升通知、统计聚合、审计日志异步写入，而不是先把预约主链路做成分布式事务。

12. **建立最小可用测试矩阵**  
   至少补三类测试：`PasswordService/TokenStore` 单测、Mapper/Service 集成测试、预约/取消/候补晋升/扣课时并发场景测试。你的核心风险不是 CRUD，而是状态流转和一致性。

13. **补 OpenAPI 治理与接口版本策略**  
   目前 Swagger 已有，但建议把关键错误码、鉴权头、分页格式、枚举字段、业务示例纳入规范，并提前考虑 `/api/v1` 版本化，避免前后台联调长期依赖“隐式兼容”。

### 6.3 长期优化

14. **为通知、统计、课时变更引入 Outbox/Event 机制**  
   当俱乐部业务扩展到多门店、多渠道或更多异步集成时，建议从“数据库事务 + 同步调用”升级到“主事务 + Outbox + 异步消费”。

15. **补全容器化、观测和配置安全**  
   增加 `Dockerfile`、`docker-compose.yml`、健康检查、Actuator、结构化日志、配置脱敏、密钥托管和环境隔离规则。当前 `application-prod.yml` 已用环境变量占位，但仍缺完整运维交付物。

16. **如果未来做多校区/连锁门店，再评估租户化或服务化**  
   当前阶段不建议过早上 Spring Cloud；等到门店隔离、独立运营主体、跨校区权限、统计隔离成为真实需求，再考虑租户模型或服务拆分。

## 7. 今日最建议深入阅读的 3 个项目

1. **RuoYi-Vue-Pro**  
   原因：和你当前 Spring Boot 3 代际最接近，权限、安全、缓存、定时任务、后台治理都很成熟，最适合做“平台能力对标”。

2. **mall**  
   原因：虽然是电商，但它对“状态流转 + 强事务 + 异步通知 + 资产类账本”的处理，对预约、候补、课时消耗非常有映射价值。

3. **RuoYi-Vue-Plus**  
   原因：如果你不想马上切完整 Spring Security 体系，它提供了一条更轻但仍生产可用的升级路径，和你当前单体规模更贴近。

## 8. 检索关键词、时间与不确定性说明

### 8.1 检索关键词

- `spring boot training management`
- `spring boot club management`
- `spring boot gym management`
- `spring boot booking management`
- `spring boot education management mybatis`
- `spring boot rbac mybatis plus`
- `spring boot sports venue management`

### 8.2 检索时间

- 本次调研执行时间：`2026-06-25 10:53:50 CST`

### 8.3 数据不确定性说明

- GitHub 通用搜索接口在当前自动化环境中稳定性一般，GitHub 连接器也出现过握手超时，因此本次采用“先以实时可访问的候选仓库名单为种子，再逐个通过 GitHub 仓库主页和提交页核验元数据”的方式完成。
- Stars、Forks、最近活跃时间会随时间变化，报告只对 `2026-06-25` 本次运行时点负责。
- “文档/部署/测试完整度”中的测试部分，主要依据仓库主页、README、可见目录和公开材料判断，未对每个项目逐个拉取源码做全量审计。
- `ping-smart-club-web-boot` 本地编译未执行成功，不是代码报错，而是当前运行环境缺少 `mvn` 命令。

