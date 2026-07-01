# 2026-06-30 Ping Smart Club 后端相似项目 GitHub 架构调研

检索时间：2026-06-30 11:16 CST  
本地基准路径：`/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot`  
本次状态说明：已读取本地 `pom.xml`、`README.md`、`src/main/java` 下 `auth/common/config/controller/service/mapper/dto/pojo` 结构、`src/main/resources/application*.yml`、`logback-spring.xml`、`sql/`、Dockerfile、docker-compose 与 K8s YAML。当前工作区存在未提交改动，以下基准画像按当天可见源码状态描述，不代表某个干净 commit。

## 1. 当日调研摘要

`ping-smart-club-web-boot` 当前已经从单纯第一阶段 CRUD 后端，演进到带有基本生产化雏形的 Spring Boot 单体：Java 17、Spring Boot 3.5.9、MyBatis-Plus 3.5.5、MySQL 8、HikariCP、Validation、SpringDoc、Logback；业务覆盖登录鉴权、学员、教练、课程产品、场地、排课、预约、候补、课时账户、考勤、通知、后台统计。近期加固点已经落到代码和 SQL：PBKDF2 密码迁移、`psc_auth_session` 持久化 token 摘要、统一 `ErrorCode`、异常 `traceId`、预约 `active_key` 唯一键、课时流水 `biz_no` 幂等号、排课和消课的 `for update` 行锁。

今日 Top 10 总体特征：

- 第一类是通用后台/RBAC 平台：RuoYi-Vue-Pro、JeecgBoot、SmartAdmin、RuoYi-Vue-Plus、Pig、Guns、eladmin。它们对权限模型、菜单按钮权限、数据权限、OpenAPI、代码生成、审计日志、配置隔离最有参考价值。
- 第二类是真实会员/交易/业务流项目：mall、mall-swarm。虽然业务是电商，但会员、订单、库存/库存锁定、营销、通知、后台统计，与俱乐部的课时账户、预约名额、支付/退款、消息提醒存在可迁移的建模经验。
- 第三类是教育/培训域项目：roncoo-education。它与体育培训业务最接近，但开源版有商用限制和功能精简，更多适合参考课程、题库、学习任务、教学内容生产和教育场景模块边界。

最值得关注的方向：

1. 权限认证从角色拦截器升级为可审计、可扩展的权限点体系：先补按钮/接口 permission code、数据范围、登录风控，再考虑是否接 Spring Security / Sa-Token / OAuth2。
2. 预约、候补、课时账户要继续强化一致性：现在已有行锁和唯一键，但候补队列、学生身份归属、重复消课、排课变更后的预约联动仍需要 DB 约束和并发测试闭环。
3. 单体优先，不急于微服务化：当前体量更适合参考 RuoYi-Vue-Pro、SmartAdmin、Guns 的模块化单体治理；Pig、mall-swarm 只作为以后拆 auth/gateway/notification/report 的中期样板。

## 2. 本项目基准画像

### 2.1 技术栈

- Java 17，Spring Boot `3.5.9`。
- Spring Web，Spring Validation，SpringDoc OpenAPI `2.2.0`。
- MyBatis-Plus `3.5.5`，MySQL Connector/J `8.0.33`，HikariCP。
- Lombok `1.18.30`，Jackson，Logback。
- Redis、RabbitMQ、Spring Security 仍是预留：配置文件和配置类存在，但依赖/`@Configuration` 多数仍注释。
- Docker 多阶段构建，docker-compose 包含 MySQL、Redis、RabbitMQ、应用；K8s 提供 ConfigMap、Secret、Deployment、Ingress。

### 2.2 代码分层

当前代码采用单模块、按层分包：

- `controller`：REST 入口，覆盖 `AuthController`、`StudentController`、`CoachController`、`CourseCatalogController`、`VenueController`、`ScheduleController`、`BookingController`、`LessonAccountController`、`AttendanceController`、`NotificationController`、`StatsController`、`TestController`。
- `service`：业务服务，预约、排课、课时账户已使用 `@Transactional` 和行锁。
- `mapper`：MyBatis-Plus BaseMapper + 少量 `@Select ... for update`。
- `pojo`：数据库实体，直接映射 `psc_*` 表。
- `dto`：目前只覆盖登录、预约、课时、排课、考勤和统计的部分请求/响应，仍有不少接口直接暴露实体。
- `auth`：`AuthInterceptor`、`AuthContext`、`RequireRole`、`AuthRole`、`AuthUser`、`PasswordService`、`TokenStore`。
- `common`：`ApiResponse`、`BusinessException`、`ErrorCode`、`GlobalExceptionHandler`。
- `config`：MyBatis-Plus、Swagger、WebMvc、Redis/RabbitMQ/Security 预留配置。

### 2.3 鉴权方式

当前运行时鉴权是 `AuthInterceptor + TokenStore + @RequireRole + AuthContext`：

- 登录接口按角色分为管理员、教练、学员/家长。
- 密码支持历史明文兼容，首次登录成功后迁移为 PBKDF2：`pbkdf2$iterations$salt$hash`。
- Token 生成使用 32 字节随机数，返回明文 token，数据库只保存 SHA-256 摘要。
- `psc_auth_session` 记录 `token_hash/user_id/role/related_id/status/expire_at/revoked_at`，支持重启后校验、退出吊销和过期标记。
- `@RequireRole` 只校验粗粒度角色，尚未支持菜单/按钮/接口权限码、数据权限、二次确认、登录失败锁定、刷新 token、多端策略。

### 2.4 数据访问与一致性

- 基础表包括 `psc_user`、`psc_auth_session`、`psc_student`、`psc_coach`、`psc_coach_availability`、`psc_coach_leave`、`psc_course_type`、`psc_course_product`、`psc_venue`、`psc_course_schedule`、`psc_booking`、`psc_waitlist_entry`、`psc_lesson_account`、`psc_lesson_transaction`、`psc_attendance_record`、`psc_notification_record`。
- 排课冲突检查使用 `CourseScheduleMapper.selectCoachConflictIdsForUpdate` 和 `selectVenueConflictIdsForUpdate`，按时间重叠条件加 `for update`。
- 预约使用 `scheduleService.getByIdForUpdate` 锁定课程安排，`psc_booking.active_key` 对活跃预约/候补做唯一约束，取消、完成、缺席后置空。
- 课时账户使用 `LessonAccountMapper.selectByStudentIdForUpdate` 行锁，消课用 `biz_no = CONSUME:BOOKING:{bookingId}` 防重复流水。
- 当前 SQL 暂无外键约束；跨表一致性主要依赖业务代码和索引。

### 2.5 异常与响应封装

- 成功响应为 `ApiResponse.ok(data)`：`code=0`、`errorCode=SUCCESS`。
- 业务失败通过 `BusinessException` + `ErrorCode` 返回明确 HTTP code 与业务码。
- 未知异常统一隐藏内部错误信息，返回 `COMMON_INTERNAL_ERROR` 和 `traceId`，服务端日志记录堆栈。
- 现有错误码覆盖鉴权、排课冲突、预约容量/重复、课时余额/流水幂等等核心场景。

### 2.6 部署配置

- `application.yml` 默认 `dev` profile，启用 Swagger UI，MyBatis 日志为 stdout。
- `application-dev.yml`/`application-prod.yml` 使用环境变量读取数据库、Redis、RabbitMQ。
- Dockerfile 构建阶段 `mvn clean package -DskipTests`，运行阶段使用非 root `spring` 用户。
- docker-compose 会启动 MySQL、Redis、RabbitMQ 并让 app 依赖其健康检查，但应用当前并未真正启用 Redis/RabbitMQ 依赖。
- K8s Deployment 使用 2 副本，探针打 `/api/test/health`；Secret YAML 是模板占位符。

### 2.7 当前架构短板

1. `@RequireRole` 仍是角色级权限，缺少权限点、菜单按钮权限、数据范围和资源归属校验。尤其学生/家长接口在 `relatedId == null` 时会退回请求参数 `studentId`，需要防止普通学生 token 操作其他学生数据。
2. 登录安全还缺少失败次数限制、账号锁定、验证码/二次校验、token 刷新/轮换、多端登录策略、session 清理任务。
3. Spring Security 依赖和配置仍注释，当前拦截器方案可用但生态能力不足；如果继续自研，需要补足过滤链、匿名接口、CORS/CSRF 策略和权限注解能力。
4. DTO/VO/Entity 边界不完整，多个后台接口直接收发 POJO，容易把数据库字段和内部状态暴露给前端。
5. 排课冲突依赖应用层查询加锁，缺少更系统的并发测试、隔离级别说明和边界条件测试。
6. 候补队列 `queueNo = size + 1` 在高并发下仍可能重复或乱序，建议引入锁定范围、唯一约束或单独队列表。
7. 课时账户已有行锁和幂等号，但缺少购买、退款、撤销消课、补课等完整流水状态机和审计字段。
8. SQL 没有外键，部分唯一约束不足；需要补关联索引、约束策略和迁移工具。
9. OpenAPI 分组仍有示例路径残留，Swagger 在 prod 默认启用，缺少鉴权说明和接口版本策略。
10. 测试目录目前未看到有效测试文件；关键并发路径、鉴权路径、异常码路径缺少自动化验证。
11. Docker 构建跳过测试，K8s 探针依赖 `TestController`，生产健康检查建议改 Actuator。
12. 密钥管理仍是模板占位，缺少 CI/CD 注入、Secret 管理、配置审计和敏感配置扫描。

## 3. 评分模型

总分 100：

- 技术栈相似度 25：Spring Boot、Java 17/Boot 3、MyBatis/MyBatis-Plus/JPA、MySQL/PostgreSQL、REST API、OpenAPI、Redis/MQ 等。
- 业务范围/领域相似度 20：会员、培训/课程、预约/订单、后台管理、CRM/ERP/门店/教育/体育服务等。
- 架构清晰度与工程化质量 20：分层、模块边界、权限模型、统一异常、审计、代码生成、部署脚本。
- 维护活跃度 15：最近提交/发布、issue/PR 状态、版本演进。
- 社区热度 10：stars、forks、使用面。
- 文档/部署/测试完整度 10：README、官方文档、SQL、Docker/K8s、测试或质量说明。

说明：GitHub 搜索和 topic 页用于发现候选，仓库页/API/commit 页用于核验。部分仓库页面只显示四舍五入 stars/forks，本报告在表格中保留页面可见值；能从 API 读取到精确值的项目使用精确值。

## 4. Top 10 项目总表

| 排名 | 项目 | 综合评分 | Stars | Forks | 最近活跃时间 | 许可证 | 技术栈 | 业务范围 | 相似点 | 主要参考价值 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| 1 | [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro) | 92 | 37,988 | 8,232 | 2026-06-28 pushed_at/API；commit 页可见 2026-06-07 | MIT | Spring Boot 3.5/JDK17 分支、MyBatis-Plus、MySQL、Redis、Redisson、Spring Security、Flowable | 后台管理、会员、CRM、ERP、商城、工作流、消息、支付 | RBAC、会员、通知、报表、代码生成、单体模块化 | 权限生产化、领域模块拆分、错误码/审计、OpenAPI、Redis/MQ 启用时机 |
| 2 | [JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 90 | 46,899 | 16,070 | 2026-06-24 pushed_at/API；commit 页可见 2026-05-21 | Apache-2.0 | SpringBoot/SpringCloud、MyBatis-Plus、Vue3、Flowable、低代码/报表 | 企业低代码、表单、流程、报表、权限 | 后台权限、代码生成、复杂表单、工作流 | 快速搭建后台配置能力、在线表单/报表、权限与审计体系 |
| 3 | [SmartAdmin](https://github.com/1024-lab/smart-admin) | 88 | 3.7k | 993 | Latest release 2026-03-02 | MIT | Spring Boot 2/3、Java 8/17、Sa-Token、MyBatis-Plus、Vue3、uni-app | 高质量后台管理、OA、权限、日志、数据安全 | 安全登录、接口加密、四层架构、前后端规范 | 登录风控、数据脱敏、返回码维护、controller-service-manager-dao 分层 |
| 4 | [mall](https://github.com/macrozheng/mall) | 86 | 83,939 | 29,705 | 2026-05-14 pushed_at/API；commit 页可见 2026-03-06 | Apache-2.0 | Spring Boot、MyBatis、MySQL、Redis、MongoDB、RabbitMQ、Elasticsearch、Docker | 电商前台、后台、会员、订单、营销、统计 | 会员、账户、订单状态、通知、后台统计 | 课时账户/交易流水、容量/库存类一致性、Docker 化、后台运营模块 |
| 5 | [RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 84 | 2.4k | 691 | commit 页可见 2026-06-23 | MIT | Spring Boot 3、JDK17/21、Sa-Token、MyBatis-Plus、Redisson、SpringDoc、WarmFlow | 多租户后台管理、权限、工作流、数据权限 | 权限注解、数据权限、缓存、分布式幂等 | 单体升级为高质量模块化后台，补权限表达式、数据权限和缓存规范 |
| 6 | [Pig](https://github.com/pig-mesh/pig) | 82 | 6.7k | 1.1k | commit 页可见 2026-06-18 | Apache-2.0 | Spring Cloud 2025、Spring Boot 4、Spring Authorization Server、OAuth2、MyBatis-Plus、Nacos | RBAC 快速开发平台，支持微服务和单体 | Auth、网关、UPMS、代码生成、Docker Compose | 中期认证中心/网关拆分、OAuth2 授权服务器、单体/微服务双形态 |
| 7 | [mall-swarm](https://github.com/macrozheng/mall-swarm) | 80 | 13k | 5.5k | commit 页可见 2026-05-21 | Apache-2.0 | Spring Cloud 2025、Spring Boot 3.5、Sa-Token、MyBatis、ES、Docker、K8s | 微服务商城、认证、网关、监控、搜索、后台 | 会员、订单、容量/库存、消息、微服务治理 | 中期拆 auth/gateway/notification/report 的参考，不建议当前照搬 |
| 8 | [roncoo-education](https://github.com/roncoo/roncoo-education) | 79 | 1.5k | 592 | Release 2025-09-01；README 技术栈已更新到 Spring Cloud Alibaba 2025 | AGPL-3.0 | Spring Cloud Alibaba 2025、MySQL8、Nacos、Seata、MyBatis、Druid | 在线教育、网课、直播、考试、题库、任务 | 培训/课程领域、教学内容、学习任务 | 教育域模块边界、课程内容/学员学习路径、培训平台产品能力 |
| 9 | [Guns](https://github.com/stylefeng/Guns) | 77 | 4k | 1.6k | README 更新日志可见 2025-11-12 | Apache-2.0 | Spring Boot 3、JDK17、MyBatis-Plus、Vue3、JWT、插件化 | Java 应用开发框架、RBAC、组织、字典、通知、日志 | 后台权限、组织、系统配置、通知 | 插件化单体、Flyway 自动初始化、权限和系统参数模块 |
| 10 | [eladmin](https://github.com/elunez/eladmin) | 76 | 21.9k | 7.4k | commit 页可见 2026-05-09 | Apache-2.0 | Spring Boot 2.7、JPA、Spring Security、JWT、Redis、Vue | 后台管理、RBAC、数据权限、代码生成、监控 | 权限、安全、审计、运维 | Spring Security/JWT、数据权限、在线用户、操作日志；技术栈较旧所以降分 |

## 5. 项目详细分析

### 5.1 RuoYi-Vue-Pro

- GitHub 链接：[YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)
- 核验信息：GitHub API 显示 37,988 stars、8,232 forks、MIT、`pushed_at=2026-06-28T02:51:13Z`；README 明确 JDK 17/21 + Spring Boot 3.5 分支、多模块架构、MyBatis-Plus、Redis/Redisson、Spring Security、Token、SSO、工作流、商城、CRM、ERP、会员中心等。
- 业务范围：后台管理基础设施 + 会员 + CRM + ERP + 商城 + 工作流 + 支付 + 短信 + 报表 + AI/IoT 扩展。比 `ping-smart-club-web-boot` 大很多，但其中系统、会员、通知、报表、课时/订单类建模都能拆出来参考。
- 模块边界：`yudao-framework` 承载通用技术能力，`yudao-module-system/infra/member/mall/crm/erp/pay/report` 等按领域拆分，`yudao-server` 组装启动。对本项目的启发是不要把所有 Service 长期堆在一个包里，可以逐步形成 `system/auth/member/course/booking/lesson/notification/report` 包内聚。
- 认证授权：Spring Security + Token + Redis，支持多终端、多用户类型、SSO、动态权限菜单、按钮权限和数据权限。当前项目只有 `@RequireRole`，可借鉴其 permission code、菜单按钮、数据范围建模。
- 数据访问：MyBatis-Plus，多数据库适配，代码生成器一键生成 Java/Vue/SQL/OpenAPI。当前项目可先只借鉴分页、Wrapper 规范、枚举字典和生成模板，不要引入复杂多租户。
- 事务/并发：README 可见分布式幂等、Redisson、消息队列、工作流和支付能力。对预约排课，可参考其幂等注解、分布式锁、业务流水防重思路，但本项目短期仍应保留 MySQL 行锁 + 唯一键为主。
- 缓存/消息/异步：支持 Redis、RabbitMQ、Kafka、RocketMQ、WebSocket、站内信等。当前通知仍是入库记录，后续可先启 Redis 缓存会话/字典，再把通知发送做成 MQ 异步。
- 文档/部署/测试：README 和官方文档完整，演示、启动、视频教程齐全；README 声称核心能力有单元测试。未克隆仓库，测试覆盖率未核验。
- 架构优点：权限、模块、字典、错误码、代码生成、基础设施完整，适合中小企业后台产品化。
- 局限风险：功能面过宽，直接照搬会把当前俱乐部后端复杂化；多租户/工作流/商城不是近期刚需。
- 可借鉴点：权限点表、角色-菜单-按钮关系、数据权限、系统参数、登录日志、操作日志、站内信、OpenAPI 分组、统一错误码在线维护。

### 5.2 JeecgBoot

- GitHub 链接：[jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot)
- 核验信息：GitHub API 显示 46,899 stars、16,070 forks、Apache-2.0、`pushed_at=2026-06-24T03:00:12Z`；commit 页可见 2026-05-21 活跃提交；topic 包含 `springboot`、`springcloud`、`mybatis-plus`、`flowable`、`vue3`、`low-code`。
- 业务范围：低代码/零代码、表单、流程、报表、大屏、知识库、AI 低代码。与体育培训业务不同，但对后台配置化、复杂表单、报表统计很有参考价值。
- 模块边界：典型平台型结构，系统管理、在线开发、报表、流程、消息、AI 能力拆分明显。当前项目未来如果要让门店自定义课程表单/报名表/通知模板，可以参考其在线表单和代码生成。
- 认证授权：成熟后台权限体系，支持菜单、角色、用户、部门、动态路由、按钮权限。比当前 `AuthRole` 更完整。
- 数据访问：MyBatis-Plus 与代码生成器是核心能力，适合参考生成 CRUD、分页、查询条件封装和字典翻译。
- 事务/并发：偏平台配置和流程，预约容量冲突不是重点；可参考工作流审批和表单状态机，不适合作为预约锁主参考。
- 缓存/消息/异步：大型平台通常集成缓存、消息、报表异步任务；本次未克隆源码，具体实现未核验。
- 接口文档/部署：官方文档、在线演示、发布节奏强；适合参考文档组织、演示账号和后台功能说明。
- 测试策略：GitHub 页面未直接核验测试覆盖，报告中不把测试作为强项计分。
- 架构优点：平台化能力强，低代码降低后台 CRUD 产出成本，报表/表单体系完善。
- 局限风险：低代码体系复杂，若早期引入会稀释体育培训核心领域；AI/流程能力不是当前第一优先级。
- 可借鉴点：后台统计报表、动态表单、代码生成、字典翻译、统一权限菜单、表单/流程元数据设计。

### 5.3 SmartAdmin

- GitHub 链接：[1024-lab/smart-admin](https://github.com/1024-lab/smart-admin)
- 核验信息：仓库页显示 3.7k stars、993 forks、MIT；README 显示后端提供 Java8/SpringBoot2 与 Java17/SpringBoot3 双版本，技术栈为 SpringBoot2/3 + Sa-Token + MyBatis-Plus，Latest release `v3.30.0` 为 2026-03-02。
- 业务范围：通用后台管理平台，覆盖安全体系、接口加解密、数据脱敏、数据变更记录、OA、日志、监控、角色权限、菜单、文件、系统参数、字典、单号生成器、代码生成。
- 模块边界：README 强调 controller、service、manager、dao 四层架构。当前项目可以借鉴 manager 层用于承载排课冲突、课时流水、通知发送等跨 mapper 编排，避免 Service 越来越厚。
- 认证授权：Sa-Token，强调双因子登录、密码复杂度、错误次数锁定、超时退出、数据脱敏、接口加解密。对当前项目的登录风控和生产安全补齐很有价值。
- 数据访问：MyBatis-Plus，主流数据库和国产数据库适配。当前项目不需要多数据库，但可借鉴 SQL 注入防护、统一分页和 query form。
- 事务/并发：更偏企业后台通用能力；预约排课冲突不是重点。可参考单号生成器和数据变更记录用于课时流水/预约流水追踪。
- 缓存/消息/异步：README 可见日志、心跳、系统钩子、服务器监控等，具体缓存/MQ 使用未深挖。
- 接口文档/部署：官方文档和预览地址完整；前后端规范清晰。
- 测试策略：未从 GitHub 页面核验测试覆盖，不把它作为主要加分项。
- 架构优点：工程规范、安全体系和分层说明非常贴近当前项目近期短板。
- 局限风险：业务域较通用，不提供课程预约/培训模型；Sa-Token 方案与 Spring Security 方案需二选一。
- 可借鉴点：登录失败锁定、密码策略、接口加密/脱敏、返回码维护、四层架构、数据变更日志、单号生成器。

### 5.4 mall

- GitHub 链接：[macrozheng/mall](https://github.com/macrozheng/mall)
- 核验信息：GitHub API 显示 83,939 stars、29,705 forks、Apache-2.0、`pushed_at=2026-05-14T08:32:05Z`；仓库 topic 包括 MySQL、Redis、RabbitMQ、MongoDB、Elasticsearch、Spring Security、Swagger UI、Docker。
- 业务范围：前台商城 + 后台管理系统，包含首页、商品、购物车、订单、会员、客服、促销、运营、内容、统计、财务、权限等。
- 模块边界：单体商城结构清楚，后台管理和移动端/前台业务分离，会员、订单、商品、营销、权限边界成熟。当前项目可对应到学员/会员、课程产品、预约订单、课时账户、通知营销、统计报表。
- 认证授权：Spring Security 和后台权限是核心能力，适合参考管理员登录、菜单/角色、后台用户体系。
- 数据访问：Spring Boot + MyBatis，SQL/Mapper 更贴近当前 MyBatis-Plus 项目，适合参考数据库命名、后台列表查询、分页、复杂查询。
- 事务/并发：电商订单、库存、优惠券、会员积分/余额与课时账户很类似；可参考订单状态机、库存扣减、防重复提交和交易流水。
- 缓存/消息/异步：Redis、RabbitMQ、Elasticsearch、MongoDB 均有真实业务使用场景。当前项目可按“先缓存字典/会话，后异步通知，再考虑搜索/报表”的顺序演进。
- 接口文档/部署：Docker 容器化部署成熟，线上演示和教程较多。
- 测试策略：未从 GitHub 页面确认系统性测试，不能作为测试参考主来源。
- 架构优点：业务真实、表多、状态流多、社区大，适合从会员/订单/营销/统计角度学习。
- 局限风险：部分技术栈早于 Spring Boot 3；电商领域和培训预约不完全一致。
- 可借鉴点：会员中心、订单状态机、账户流水、后台统计、Docker 部署、Redis/RabbitMQ 使用边界。

### 5.5 RuoYi-Vue-Plus

- GitHub 链接：[dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)
- 核验信息：仓库页显示约 2.4k stars、691 forks、MIT；commit 页可见 2026-06-23 提交；README 显示 Spring Boot、JDK17/21、Sa-Token、MyBatis-Plus、Redisson、SpringDoc、WarmFlow、Docker、分布式幂等、数据权限、缓存、监控等。
- 业务范围：多租户后台管理系统，重写 RuoYi-Vue，重点在权限、插件化、数据权限、多数据源、缓存、工作流、任务调度、文件存储。
- 模块边界：`ruoyi-admin`、`ruoyi-common`、`ruoyi-extend`、`ruoyi-modules`、`script` 等结构清晰。当前项目可参考 common/extend/modules 的分层，把业务模块从单层 `service` 逐步拆到领域包。
- 认证授权：Sa-Token，支持登录、角色、权限、二级认证、HttpBasic、忽略校验，权限表达式更丰富。当前 `@RequireRole` 可以先扩展 `@RequirePermission`，再决定是否引入 Sa-Token。
- 数据访问：MyBatis-Plus、分页、数据权限、动态数据源、SQL 监控。当前重点是数据权限和分页，不需要立即上多数据源。
- 事务/并发：README 明确有分布式幂等、Lock4j/Redisson 类能力。对预约/候补/课时消耗，可以参考幂等注解与分布式锁，但短期先完善 MySQL 约束和本地事务。
- 缓存/消息/异步：Redisson、Spring Cache、分布式队列、SnailJob、WebSocket/SSE 等完整。当前可参考 Redis 客户端选型和 key 命名规范。
- 接口文档/部署：SpringDoc、Docker 编排、文档站和演示站齐全。
- 测试策略：README 提到单例测试，未克隆核验测试质量。
- 架构优点：比原若依更现代，Spring Boot 3/JDK17 贴近本项目，安全和数据权限说明细。
- 局限风险：多租户、多数据源、分布式任务会增加复杂度；当前项目不宜一次性引入。
- 可借鉴点：权限表达式、数据权限、脱敏/加密、幂等、防重提交、SpringDoc、分布式锁作为中期能力。

### 5.6 Pig

- GitHub 链接：[pig-mesh/pig](https://github.com/pig-mesh/pig)
- 核验信息：仓库页显示约 6.7k stars、1.1k forks、Apache-2.0；commit 页可见 2026-06-18 提交；README 显示 Spring Cloud 2025、Spring Boot 4、Spring Security OAuth2 Authorization Server、MyBatis-Plus、Nacos、Druid，并同时支持微服务架构和单体架构。
- 业务范围：RBAC 企业级快速开发平台，保留认证、网关、用户权限、监控、代码生成、定时任务等核心能力。
- 模块边界：`pig-auth` 授权服务、`pig-gateway` 网关、`pig-upms` 用户权限、`pig-common` 通用能力、`pig-register` Nacos、`pig-visual` 可视化能力，同时提供 `pig-boot` 单体模式。
- 认证授权：Spring Authorization Server 落地 OAuth2，支持授权码、密码、刷新令牌等场景。当前项目如未来要开放第三方、教练端/家长端多端登录，可参考其 Auth Server 设计；近期不建议直接微服务化。
- 数据访问：MyBatis-Plus，RBAC 权限表结构、用户角色权限服务值得参考。
- 事务/并发：不是预约排课业务项目，但对认证中心和权限服务的一致性、token/refresh token 管理有参考意义。
- 缓存/消息/异步：Nacos、Gateway、监控、定时任务可作为中期平台化参考。
- 接口文档/部署：Docker Compose 支持微服务和单体两种启动方式，对当前项目未来“一套代码单体优先、保留拆分路径”很有启发。
- 测试策略：未从页面核验测试覆盖。
- 架构优点：认证中心/网关/UPMS 工程化成熟，且保留单体模式。
- 局限风险：Spring Boot 4 与当前 Spring Boot 3.5 有版本差异；平台复杂度高。
- 可借鉴点：刷新 token、多端 OAuth2、Auth/UPMS 边界、网关鉴权、从单体到微服务的迁移路径。

### 5.7 mall-swarm

- GitHub 链接：[macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm)
- 核验信息：仓库页显示约 13k stars、5.5k forks、Apache-2.0；commit 页可见 2026-05-21 提交；README 显示 Spring Cloud 2025 & Alibaba、Spring Boot 3.5、Sa-Token、MyBatis、Elasticsearch、Docker、Kubernetes、Vue 管理后台。
- 业务范围：微服务商城，包含后台管理、认证中心、网关、监控中心、搜索、前台商城、远程调用 demo、配置中心。
- 模块边界：`mall-common`、`mall-mbg`、`mall-auth`、`mall-gateway`、`mall-monitor`、`mall-admin`、`mall-search`、`mall-portal`、`config`。
- 认证授权：Sa-Token 认证和授权框架，独立认证中心。对本项目中期拆出 auth 模块有参考价值。
- 数据访问：MyBatis + Generator，适合参考复杂业务表和 DTO/mapper 分层，但当前项目已使用 MyBatis-Plus，不必照搬 generator。
- 事务/并发：电商库存、订单和营销场景与预约容量/课时扣减类似，但实现更偏微服务，涉及分布式一致性风险。
- 缓存/消息/异步：Redis、RabbitMQ、Elasticsearch、K8s、监控中心都有完整场景。当前项目只有配置预留，可把它作为“何时拆出 MQ/搜索/监控”的路线图。
- 接口文档/部署：README 有系统架构、业务架构、组织结构、在线演示、Docker/K8s 说明。
- 测试策略：未核验系统性测试。
- 架构优点：现代 Spring Cloud 版本、部署材料完整、业务真实。
- 局限风险：当前俱乐部后端还不需要微服务；过早引入 Gateway/Nacos/ES 会拖慢核心业务。
- 可借鉴点：认证中心、网关、监控、搜索、Docker/K8s、订单/库存式状态流。

### 5.8 roncoo-education

- GitHub 链接：[roncoo/roncoo-education](https://github.com/roncoo/roncoo-education)
- 核验信息：仓库页显示约 1.5k stars、592 forks、AGPL-3.0；Release `v25.0.0-RELEASE` 为 2025-09-01；README 显示 Spring Cloud Alibaba 2025、MySQL8、Nacos、Seata、MyBatis、Druid，业务为在线教育/培训系统。
- 业务范围：课程点播、直播、考试、题库、任务、课程附件、存储云、AI 生成课程简介/教学大纲。它是本次候选中领域最接近“培训”的项目。
- 模块边界：仓库可见 `roncoo-education-common`、`roncoo-education-feign`、`roncoo-education-gateway`、`roncoo-education-service`、`distribution`。偏分布式教育平台。
- 认证授权：README 未在首页详细展开权限模型，需进一步阅读源码；本次只把它作为教育域模块参考，不作为权限首选参考。
- 数据访问：MyBatis + MySQL8，教育课程和学习任务数据模型值得进一步阅读。
- 事务/并发：在线教育更多是学习任务、课程内容、订单/支付类一致性，不直接覆盖线下场地排课冲突。可参考报名/购买/学习进度，不可直接套用预约容量。
- 缓存/消息/异步：Nacos、Seata 说明其分布式治理能力较强，具体 MQ/缓存实现本次未核验。
- 接口文档/部署：README 提供门户、管理系统、前后端源码地址，更多 SQL/部署教程放在公众号资料，公开 GitHub 文档完整度弱于 RuoYi/mall。
- 测试策略：未核验。
- 架构优点：教育培训领域贴近，课程内容与学习路径完整。
- 局限风险：AGPL-3.0 和商用限制需要注意；开源版是商业版精简实现；线下场馆预约不是重点。
- 可借鉴点：课程内容、培训任务、学习记录、题库/考试、教育域后台菜单和教学资源管理。

### 5.9 Guns

- GitHub 链接：[stylefeng/Guns](https://github.com/stylefeng/Guns)
- 核验信息：仓库页显示约 4k stars、1.6k forks、Apache-2.0；README 更新日志可见 `v8.3.5-2025年11月12日`；README 显示 Spring Boot 3 + Vue3 + JDK17、MyBatis-Plus、Flyway、JWT、插件化架构。
- 业务范围：现代 Java 应用开发框架，覆盖控制面板、用户、职位、机构、应用、角色、菜单、资源、配置、字典、在线用户、定时任务、文件、数据源、操作日志、登录日志、通知、SQL 监控、服务器信息。
- 模块边界：当前 GitHub 仓库包含 `src/main` 和 `guns-front-project`，README 更强调核心包/插件化能力。对当前项目的借鉴是插件化思路和系统模块沉淀。
- 认证授权：JWT + 角色/菜单/应用/机构，支持安全策略、密码重试、密码失效、黑白名单。与当前项目登录安全短板高度相关。
- 数据访问：MyBatis-Plus，Flyway 自动初始化表。当前项目目前用手工 SQL 和 hardening 脚本，可中期迁移到 Flyway/Liquibase。
- 事务/并发：不是预约业务项目；对排课冲突帮助有限。
- 缓存/消息/异步：插件列表包含内存/Redis 缓存、WebSocket、消息插件、定时任务、短信、文件存储等。
- 接口文档/部署：README 有快速启动、SQL 初始化说明、更新日志，官网文档可进一步查阅。
- 测试策略：未从仓库页核验。
- 架构优点：Java 17/Spring Boot 3 贴近、插件化和系统配置设计成熟。
- 局限风险：领域模型通用，体育培训业务需要自行建模；GitHub Java 占比显示前端代码比例较高，需看后端核心包细节。
- 可借鉴点：Flyway 迁移、系统参数、安全策略、登录日志、通知插件、组织/应用/角色分层。

### 5.10 eladmin

- GitHub 链接：[elunez/eladmin](https://github.com/elunez/eladmin)
- 核验信息：仓库页显示约 21.9k stars、7.4k forks、Apache-2.0；commit 页可见 2026-05-09 修复角色级别验证、垂直越权等安全问题；README 显示 Spring Boot 2.7.18、JPA、Spring Security、JWT、Redis、Vue。
- 业务范围：前后端分离后台管理系统，用户、角色、菜单、部门、岗位、字典、日志、SQL 监控、Quartz、代码生成、邮件、对象存储、支付宝、服务监控、运维管理。
- 模块边界：`eladmin-common`、`eladmin-system`、`eladmin-logging`、`eladmin-tools`、`eladmin-generator`，按功能分模块清楚。
- 认证授权：Spring Security + JWT + RBAC + 数据权限 + 匿名接口注解 + 在线用户管理。对当前项目若选择 Spring Security 路线很有参考价值。
- 数据访问：JPA 为主，与当前 MyBatis-Plus 不一致；但权限表、数据权限和审计日志模式仍可参考。README 还指向 eladmin-mp 版本，可作为进一步阅读对象。
- 事务/并发：通用后台，不覆盖预约容量和课时账户。
- 缓存/消息/异步：Redis、Quartz、对象存储、邮件工具、服务监控。对通知、定时提醒、在线用户和缓存可参考。
- 接口文档/部署：开发文档和演示地址完整。
- 测试策略：未核验。
- 架构优点：安全问题修复活跃，Spring Security/JWT/数据权限体系成熟。
- 局限风险：Spring Boot 2.7 + JPA 技术栈较旧，与本项目不完全一致，所以评分低于前几名。
- 可借鉴点：Spring Security/JWT 接入、数据权限、匿名接口、在线用户、操作日志、垂直越权修复思路。

## 6. 针对 ping-smart-club-web-boot 的架构建议

### 6.1 近期可落地

1. 先补资源归属校验，再扩权限点。`BookingController.resolveStudentId()` 在登录人 `relatedId == null` 时使用请求体 `studentId`，学生/家长 token 有越权风险。建议学生端接口一律从登录态解析 studentId；管理员代操作走单独后台接口；教练查询学员需限制到本人课程或排课范围。
2. 在现有 `@RequireRole` 基础上增加 `@RequirePermission("booking:create")` 类权限点。先落表 `psc_permission`、`psc_role_permission`、`psc_user_role` 或在现有角色上挂 permission code，后台菜单/按钮与接口共享同一套权限码。
3. 登录安全补齐失败次数、账号锁定、token 过期清理任务。当前 PBKDF2 和 token 摘要已经是好基础，下一步应记录登录日志、失败 IP/设备、连续失败次数、锁定截止时间。
4. DTO/VO 与 Entity 分离。新增/编辑学员、教练、课程、场地、排课等接口不要直接接收 POJO；响应也不要直接返回数据库实体。先从预约、课时账户、学生端接口这些敏感模块开始。
5. 为预约/候补增加数据库约束和并发测试。已有 `active_key` 唯一键，但 waitlist 仍可能出现 queueNo 并发问题；建议增加 `(schedule_id, student_id, status)` 或活跃候补唯一约束，并用集成测试压 `joinWaitlist/cancel/promote`。
6. 课时账户流水增加状态和反向流水。当前 `biz_no` 防重复消课已经落地，但购买、退款、撤销消课、补课应统一用流水状态机，所有账户余额变更必须有 `biz_no`、operator、source、关联业务单。
7. Swagger 生产开关默认关闭。`application-prod.yml` 应通过环境变量控制 `springdoc.api-docs.enabled` 和 `swagger-ui.enabled`，生产默认 false；K8s 不要暴露 Swagger。
8. 把 K8s 探针从 `/api/test/health` 迁到 Actuator。引入 `spring-boot-starter-actuator`，开放 `/actuator/health/liveness` 和 `/actuator/health/readiness`，`TestController` 只保留开发环境或直接删除。

### 6.2 中期演进

9. 引入 Flyway 或 Liquibase 管理 SQL。当前 `phase1.sql` + `phase1-hardening.sql` 能用，但随着约束、索引、权限表、流水表扩展，手工脚本容易漂移。Guns 的 Flyway 自动初始化思路值得参考。
10. 拆分领域包而不是马上拆微服务。建议从包结构演进为 `module/auth`、`module/student`、`module/course`、`module/schedule`、`module/booking`、`module/lesson`、`module/notification`、`module/report`，每个模块内部有 controller/service/mapper/dto/entity。
11. Redis 启用顺序要克制。第一阶段可用于登录会话缓存、权限码缓存、字典缓存、验证码/登录失败计数；不要一开始把预约容量放 Redis 扣减，预约一致性仍以 MySQL 事务和唯一约束为准。
12. RabbitMQ 先用于通知，不用于核心扣课时。当前通知是数据库记录，适合改成 outbox 表 + MQ 消费发送微信/短信/站内信；课时扣减、预约确认仍保持同步事务，避免分布式一致性提前复杂化。
13. 后台审计日志标准化。参考 SmartAdmin/eladmin：记录登录日志、操作日志、数据变更日志、异常日志；对课时调整、预约取消、排课变更、权限变更必须可追溯。
14. OpenAPI 分组和版本化。按 `/admin/**`、`/coach/**`、`/miniapp/**`、`/auth/**` 分组，接口响应固定 `ApiResponse<T>`，新增 `/api/v1` 版本策略或至少在 OpenAPI tag 中标注稳定性。

### 6.3 长期优化

15. 认证体系路线二选一：如果坚持 Spring 生态，参考 eladmin/Pig 走 Spring Security + JWT/OAuth2；如果追求轻量后台权限，参考 SmartAdmin/RuoYi-Vue-Plus 走 Sa-Token。不要长期维护“自研拦截器 + 半套 Security 预留”的中间态。
16. 建立排课预约一致性模型文档。明确隔离级别、锁顺序、唯一键、状态机、候补晋升、取消退款、消课时机。对体育培训系统，排课/预约/课时账户是核心交易链，重要性高于低代码和多租户。
17. 引入 CI 测试门禁。至少覆盖 AuthService、TokenStore、BookingService 并发预约/候补、ScheduleService 冲突、LessonAccountService 幂等消课、GlobalExceptionHandler 错误码。Docker 构建不应永久 `-DskipTests`。
18. 配置和密钥管理生产化。K8s Secret 现在是模板占位，建议使用 CI/CD 注入、SealedSecret 或云厂商 Secret Manager；数据库、RabbitMQ、Redis 密码不应出现在 compose 默认值中用于生产。
19. 报表/统计异步化。`StatsService` 当前可同步查询，数据量增长后可参考 RuoYi/JeecgBoot 报表模块，用每日汇总表、定时任务和缓存降低首页统计压力。
20. 只在业务规模到达阈值后拆微服务。可优先拆 notification/report/auth，但预约和课时账户在单库单体内更容易保证一致性。mall-swarm/Pig 可作为未来路线，不是现在的实施模板。

## 7. 今日建议深入阅读

1. [RuoYi-Vue-Pro](https://github.com/YunaiV/ruoyi-vue-pro)：最适合作为当前单体后台的权限、会员、通知、报表和代码生成参考。重点读 `system/member/infra` 模块、权限菜单、登录日志、错误码和 Redis 使用。
2. [SmartAdmin](https://github.com/1024-lab/smart-admin)：最适合补当前登录安全和工程规范。重点读 Sa-Token 登录、密码策略、接口加密/脱敏、返回码、四层架构和数据变更记录。
3. [roncoo-education](https://github.com/roncoo/roncoo-education)：最贴近培训教育场景。重点读课程、学习任务、教育内容、管理后台模块边界；注意 AGPL-3.0 和商用限制。

## 8. 检索关键词与数据不确定性

本次使用/参考的 GitHub 检索入口：

- [GitHub topic: spring-boot](https://github.com/topics/spring-boot)
- [GitHub topic: mybatis-plus](https://github.com/topics/mybatis-plus)
- [GitHub topic: rbac](https://github.com/topics/rbac)
- `Spring Boot MyBatis RBAC admin`
- `Spring Boot MyBatis Plus CRM ERP RBAC`
- `Spring Boot MyBatis education management`
- `Spring Boot appointment booking management`
- `Spring Boot gym/training/member management`

数据不确定性：

- 本地 shell 网络被限制，无法用本地脚本直接访问 GitHub API；外部核验通过 Codex 浏览器侧 GitHub 页面、topic 页、部分仓库 API 页面、commit 页和 release 信息完成。
- GitHub 页面上的 stars/forks 对部分项目是四舍五入值；RuoYi-Vue-Pro、JeecgBoot、mall 读取到了 API 精确值，其余按页面显示值记录。
- 未 clone 外部候选仓库，测试覆盖、部署脚本可运行性、深层目录结构仅按 README/仓库首页/commit 页可见信息判断；详细落地前应再 clone 目标仓库做源码级核验。
- 部分中国开源项目以 Gitee 为主、GitHub 为镜像或同步仓库，GitHub 最近提交时间可能低估其实际活跃度。
- 本项目基准是 2026-06-30 当前 dirty working tree，可见源码已经包含 PBKDF2、token hash session、预约唯一键、课时流水幂等等加固；如果这些改动未提交或后续回滚，建议重新生成基准画像。
