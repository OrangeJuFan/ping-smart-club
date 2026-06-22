# GitHub Spring Boot 后端相似项目架构调研报告

调研对象：`ping-smart-club-web-boot`

调研日期：2026-06-22

检索时间：2026-06-22 18:16 CST

本地源码基准：`/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot`

## 1. 当日调研摘要

### 1.1 本项目今日真实状态

本次可直接读取本地完整后端源码，未触发可见性降级。已检查 `pom.xml`、`README.md`、`src/main/java` 下 `controller/service/mapper/auth/config/common/dto/pojo` 结构、`src/main/resources/application*.yml`、`sql/`。

当前后端是一个第一阶段单体 Spring Boot 应用：

- Java 17，Spring Boot 3.5.9，Spring Web，MyBatis-Plus 3.5.5，MySQL 8，HikariCP，Lombok，Spring Validation，SpringDoc OpenAPI。
- Redis、RabbitMQ、Spring Security 在 `pom.xml` 或配置中有预留，但依赖和核心安全链路尚未正式启用。
- 代码规模约 75 个 Java 文件：`auth` 6、`config` 6、`controller` 12、`service` 11、`mapper` 15、`dto` 6、`pojo` 15、`common` 3。
- Controller 覆盖：鉴权、学员、教练、课程目录、场地、排课、预约/候补、课时账户、考勤、通知、统计、测试接口。
- SQL 第一阶段表覆盖：`psc_user`、`psc_student`、`psc_coach`、`psc_coach_availability`、`psc_coach_leave`、`psc_course_type`、`psc_course_product`、`psc_venue`、`psc_course_schedule`、`psc_booking`、`psc_waitlist_entry`、`psc_lesson_account`、`psc_lesson_transaction`、`psc_attendance_record`、`psc_notification_record`。
- 当前鉴权为自研 `AuthInterceptor + RequireRole + ThreadLocal AuthContext + ConcurrentHashMap TokenStore`；密码仍为明文比较；Token 仅进程内存保存，服务重启失效，无法多实例共享。
- `ScheduleService` 有教练/场地时间冲突查询校验；`BookingService` 有重复预约、容量判断、候补晋升；`LessonAccountService` 有课时余额与流水。但这些一致性主要依赖应用层查询，数据库缺少关键唯一约束、锁或幂等键。
- `application.yml` 和 `application-dev.yml` 存在明文数据库密码；`application-prod.yml` 已使用环境变量形式，但默认值仍偏宽松。
- 只有默认 Spring Boot 测试骨架，暂未看到覆盖鉴权、预约并发、课时扣减、排课冲突等核心链路的测试。

### 1.2 今日 Top 10 总体特征

今日筛选出的 10 个项目大致分成三类：

1. 企业后台/RBAC 快速开发平台：`ruoyi-vue-pro`、`RuoYi-Vue-Plus`、`JeecgBoot`、`RuoYi-Vue`、`eladmin-mp`、`Guns`。这些项目最适合作为权限、菜单、按钮级授权、数据权限、统一异常、代码生成、OpenAPI、部署脚手架参考。
2. 生产化安全与多架构平台：`pig`、`SpringBlade`。这些项目更适合参考 OAuth2/Spring Security、网关、单体/微服务切换、多租户、Docker Compose、配置中心和模块拆分。
3. 更接近业务流的会员/交易项目：`mall`、`jshERP`。它们在会员、订单、财务、库存/流水、统计报表、角色权限方面比通用后台更接近俱乐部预约和课时账户场景。

### 1.3 最值得关注的 3 个方向

1. 鉴权生产化：优先从 `ruoyi-vue-pro`、`RuoYi-Vue-Plus`、`pig` 学习 Token 存储、Redis 会话、Spring Security/Sa-Token/OAuth2、按钮级权限和登录日志。当前项目最紧急的问题不是 UI，而是明文密码和内存 Token。
2. 预约/排课一致性：优先结合本地 `ScheduleService`、`BookingService`、`LessonAccountService` 增加数据库约束、事务锁、乐观锁或 Redis/数据库幂等键。外部项目很少直接解决体育预约冲突，但 `mall`、`jshERP` 的订单/库存/流水模型可借鉴。
3. 业务模块边界：当前 `service` 已按资源分层，但 DTO/POJO 边界、领域规则、错误码、测试和部署配置仍偏第一阶段。应参考 `ruoyi-vue-pro` 的多模块、`pig` 的 common/security/data/swagger 封装，以及 `mall` 的业务分包方式逐步演进。

## 2. 评分方法

综合评分 100 分：

| 维度 | 分值 | 说明 |
| --- | ---: | --- |
| 技术栈相似度 | 25 | Spring Boot、MyBatis/MyBatis-Plus、MySQL/PostgreSQL、REST API、Java 17/Boot 3 优先 |
| 业务范围/领域相似度 | 20 | RBAC 管理后台、会员/预约/订单/课时/门店/教务/ERP/CRM 等越接近越高 |
| 架构清晰度与工程化质量 | 20 | 模块边界、common 封装、安全链路、部署脚本、代码生成、规范化程度 |
| 维护活跃度 | 15 | 2026 年提交或 release 优先；长期停更降分 |
| 社区热度 | 10 | stars/forks/issues/生态；只看热度不直接给高分 |
| 文档/部署/测试完整度 | 10 | README、官方文档、Docker、接口文档、示例/测试情况 |

说明：对 `ping-smart-club-web-boot` 来说，通用后台项目虽然业务领域不完全相同，但 RBAC、统一响应、登录、数据权限、部署运维参考价值高；垂直业务项目若维护弱或 Spring 版本旧，会在维护/技术栈维度扣分。

## 3. 本项目基准画像

### 3.1 技术栈

- 语言与框架：Java 17、Spring Boot 3.5.9、Spring Web。
- ORM/数据访问：MyBatis-Plus 3.5.5、MySQL Connector/J 8.0.33、HikariCP。
- 文档与校验：SpringDoc OpenAPI 2.2.0、Spring Validation。
- 工具：Lombok、Jackson、Logback。
- 预留但未启用：Spring Security、Redis、RabbitMQ。

### 3.2 代码分层

当前包结构为：

```text
org.pingpongapp.pingsmartclubwebboot
├── auth       # AuthContext/AuthInterceptor/AuthRole/AuthUser/RequireRole/TokenStore
├── common     # ApiResponse/BusinessException/GlobalExceptionHandler
├── config     # MyBatisPlus/WebMvc/Swagger/Redis/RabbitMQ/Security 配置
├── controller # REST 控制器
├── dto        # Auth/Booking/Schedule/Lesson/Attendance/Stats DTO
├── mapper     # MyBatis-Plus BaseMapper
├── pojo       # 数据库实体
└── service    # 业务服务
```

优点是第一阶段结构清晰、业务模块已经拆开。短板是 `pojo` 直接承担实体模型，DTO/VO 不完整，复杂业务规则仍分散在资源型 Service 中，未来排课、预约、课时账户这类领域一致性会变得难维护。

### 3.3 鉴权方式

- 登录：`AuthService` 根据角色、用户名/手机号查 `psc_user`，明文密码相等即通过。
- Token：`TokenStore` 用 UUID 字符串生成 Token，存入 `ConcurrentHashMap`，默认 168 小时过期。
- 鉴权：`AuthInterceptor` 对除登录、Swagger、测试等路径外的请求解析 Bearer Token；`RequireRole` 做角色校验；`AuthContext` 用 `ThreadLocal` 保存当前用户。
- 风险：明文密码、无 BCrypt/Argon2/SM3 哈希；Token 无签名、无刷新、无设备/会话管理；内存 Token 不支持多实例、重启失效；无登录失败限流、验证码、审计日志；`GlobalExceptionHandler` 对未知异常直接返回 `ex.getMessage()`，生产可能泄漏内部信息。

### 3.4 数据访问与事务

- Mapper：15 个 `BaseMapper`，配合 MyBatis-Plus LambdaQueryWrapper。
- SQL：第一阶段 SQL 已提供核心业务表和基础索引。
- 事务：预约、候补、取消、课时调整/扣减使用 `@Transactional`。
- 风险：排课冲突、预约容量、重复预约、候补队列、课时余额扣减主要依赖应用层查询，缺少数据库唯一约束、行锁/乐观锁、幂等 key 和并发测试。

### 3.5 异常/响应封装

- 统一响应：`ApiResponse<T>{code,message,data}`。
- 业务异常：`BusinessException` 用 HTTP 状态码兼错误码，已有 400/401/403/404/409。
- 全局异常：参数校验返回首个字段错误，业务异常按 code 映射 HTTP status。
- 短板：错误码缺少业务域编码，例如 `BOOKING_CAPACITY_FULL`、`SCHEDULE_COACH_CONFLICT`；未知异常不应把底层 message 直接给前端。

### 3.6 部署配置

- `server.servlet.context-path=/api`，默认端口 8080。
- `application-dev.yml` 和 `application.yml` 存在明文 MySQL 密码。
- `application-prod.yml` 使用环境变量配置 MySQL、Redis、RabbitMQ。
- 未看到 Dockerfile、docker-compose、K8s Secret/ConfigMap、CI pipeline 或 profile 级安全开关。

### 3.7 当前架构短板

1. 明文密码和内存 Token 是最高优先级风险。
2. Redis/RabbitMQ/Security 处于预留状态，生产化链路尚未闭环。
3. 预约、排课、候补、课时扣减缺少数据库级一致性兜底。
4. DTO/VO/Entity 边界不够清晰，复杂返回直接暴露 POJO 的风险会增加。
5. 课时账户是余额 + 流水雏形，但缺少幂等交易号、乐观锁、反向冲销、审计字段。
6. SQL 有索引，但关键唯一约束和外键策略不足，例如同一学员同一排课活跃预约、候补队列唯一性、排课冲突窗口。
7. 统一错误码、OpenAPI 分组、接口版本策略、审计日志仍需补齐。
8. 测试覆盖弱，尤其是事务和并发链路。

## 4. Top 10 项目总表

| 排名 | 项目 | 综合评分 | Stars | Forks | 最近活跃时间 | 许可证 | 技术栈 | 业务范围 | 相似点 | 主要参考价值 |
| ---: | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| 1 | [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) | 92 | 37.9k | 8.2k | 2026-06-07 commit；2026-05-31 release | MIT | Spring Boot、MyBatis-Plus、Spring Security、Redis/Redisson、Flowable | RBAC、SaaS、会员、商城、CRM、ERP、WMS、支付、短信 | Java/Spring/MyBatis-Plus/RBAC/会员业务高度相关 | 权限、模块化、会员/支付/CRM/ERP、OpenAPI、代码生成 |
| 2 | [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 90 | 2.3k | 678 | 2026-04-24 commit；2026-06-17 release | MIT | Java 17/21、Spring Boot 3.x、MyBatis-Plus、Sa-Token、Redis/Redisson | RuoYi 重构、多租户、工作流、系统管理 | 技术栈与 Java 17/Spring Boot 3/MyBatis-Plus 很接近 | Sa-Token、Redis Token、数据权限、分布式锁、幂等、部署 |
| 3 | [jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 88 | 46.8k | 16.1k | 2026-06-13 commit；2026-05-11 release | Apache-2.0 | Spring Boot、MyBatis-Plus、Vue、Flowable/Activiti、低代码 | 低代码平台、RBAC、流程、报表、大屏、移动端 | 后台管理、代码生成、接口文档、工作流参考强 | 低代码生成、统一权限、表单/报表、接口文档、工程生态 |
| 4 | [macrozheng/mall](https://github.com/macrozheng/mall) | 86 | 83.9k | 29.7k | 2026-05-14 commit | Apache-2.0 | Spring Boot 3.5、MyBatis、MySQL、Redis、RabbitMQ、Spring Security、Docker | 电商前后台、会员、订单、财务、权限、统计 | 会员、订单/课时流水、后台统计、Spring Security 很有参考价值 | 交易/库存/订单一致性、Docker、缓存、消息、后台权限 |
| 5 | [pig-mesh/pig](https://github.com/pig-mesh/pig) | 85 | 6.6k | 1.1k | 2026-06-05 release | Apache-2.0 | Spring Cloud 2025、Spring Boot 4、Spring Security OAuth2、MyBatis-Plus、Nacos、Docker Compose | RBAC、认证中心、网关、单体/微服务、代码生成、定时任务 | 权限与生产化鉴权高度可借鉴，业务域较通用 | OAuth2、认证中心、单体/微服务切换、Docker Compose、common 分层 |
| 6 | [chillzhuang/SpringBlade](https://github.com/chillzhuang/SpringBlade) | 84 | 6.9k | 1.4k | 2026-05-10 release | Apache-2.0 | Java 17、Spring Boot 3.5、Spring Cloud 2025、MyBatis | SaaS 多租户、微服务/单体并存、企业后台 | Java 17 + Boot 3.5 与本项目版本接近 | 多租户、模块化、企业级部署、权限平台 |
| 7 | [stylefeng/Guns](https://github.com/stylefeng/Guns) | 81 | 4k | 1.6k | 2025-10-28 commit | Apache-2.0 | Spring Boot 3、Vue3、JDK17、MyBatis/MyBatis-Plus、JWT | Java 快速开发框架、RBAC、REST API | 单体后台框架、JDK17/Boot3 技术方向接近 | 轻量后台框架、权限、代码生成、REST 规范 |
| 8 | [jishenghua/jshERP](https://github.com/jishenghua/jshERP) | 80 | 4.4k | 1.5k | 2025-10-22 commit；2024-11-11 release | Apache-2.0 | Spring Boot 2、MyBatis、MySQL 8、Redis、Vue | ERP、零售、采购、销售、仓库、财务、会员、报表、角色权限 | 门店/会员/财务/流水与俱乐部课时账户相近 | 会员、账户流水、报表、按钮级权限、SaaS 租户 |
| 9 | [yangzongzhuan/RuoYi-Vue](https://github.com/yangzongzhuan/RuoYi-Vue) | 79 | 3.1k | 1.6k | 2026-03-26 release；2025-12-21 commit | MIT | Spring Boot、Spring Security、JWT、MyBatis、Redis、Quartz、Swagger | 前后端分离权限管理系统 | 最经典的 RBAC/菜单/日志/代码生成参考 | 基础权限、岗位/部门/角色/菜单、日志、代码生成 |
| 10 | [elunez/eladmin-mp](https://github.com/elunez/eladmin-mp) | 76 | 678 | 252 | 2025-07-03 commit | Apache-2.0 | Spring Boot 2.7.18、MyBatis-Plus、Spring Security、Redis、Vue | RBAC 后台管理、数据字典、数据权限、代码生成 | 技术栈与 MyBatis-Plus/RBAC 相近，但维护热度一般 | 更轻量的 Spring Security + JWT + Redis 后台模板 |

未入选说明：`linlinjava/litemall` star 高且业务含会员/订单，但 latest release 为 2021-01-10，README 也明确提示不稳定，维护活跃度和生产参考价值不足；若干 gym/education management 仓库更贴近“体育/教务”，但多为毕业设计或小体量样例，缺少可持续维护、测试、部署和清晰架构，因此未进入 Top 10。

## 5. 项目逐项分析

### 5.1 YunaiV/ruoyi-vue-pro

链接：[https://github.com/YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)

业务范围：官方说明为基于 Spring Boot + MyBatis Plus + Vue & Element 的后台管理系统和微信小程序，覆盖 RBAC、数据权限、SaaS 多租户、Flowable、三方登录、支付、短信、商城、CRM、ERP、MES、IM、AI、IoT 等。对本项目最重要的是“系统功能 + 会员中心 + 商城/支付/CRM/ERP”这些可裁剪模块。

目录/分层结构：多模块 Maven。核心目录包含 `yudao-framework`、`yudao-server`、`yudao-module-system`、`yudao-module-member`、`yudao-module-pay`、`yudao-module-mall`、`yudao-module-crm`、`yudao-module-erp`、`yudao-module-infra` 等。相比本项目单包分层，它更强调“通用框架层 + 业务模块层 + 启动层”。

认证授权：Spring Security + Token + Redis，多终端、多用户类型、SSO、动态权限菜单、按钮级权限、数据权限。适合替换本项目 `AuthInterceptor + TokenStore` 的自研方案。

数据访问：MyBatis-Plus，多数据库支持，SQL 脚本完整，模块内 mapper/service/controller 分层明确。

事务/并发/冲突：没有直接的体育预约排课模型，但支付、商城、ERP、MES 模块包含订单号、流水号、库存/业务单据等一致性场景。可借鉴其“业务单号、状态机、幂等、流水表、审计字段”的设计习惯。

缓存/消息/异步：Redis/Redisson、消息队列可选，模块化封装较完整。适合本项目在登录会话、验证码、预约幂等、候补通知和统计缓存上逐步启用。

接口文档：有完整启动文档、视频教程、演示地址、代码生成和接口文档能力。

部署运维：工程规模大，文档完整；支持多分支（JDK8/17/21）和多端前端。对小项目的风险是引入过多模块，短期不应照搬。

测试策略：文档和示例较全，但作为业务平台，仍需结合本项目自己补并发和领域测试。

架构优点：模块非常全，RBAC、会员、支付、短信、商城/ERP/CRM、报表和代码生成都可做参考；当前仍活跃。

局限/风险：体量过大，学习成本高；直接迁移会导致过度工程化。

对本项目借鉴点：

- 将当前 `auth/common/config` 抽为可复用基础设施层。
- 先落地 Spring Security + Redis Token/Session + 登录日志，而不是一次性引入全部平台能力。
- 参考会员、支付、ERP 模块拆出课时账户、预约、排课、通知的领域边界。

### 5.2 dromara/RuoYi-Vue-Plus

链接：[https://github.com/dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)

业务范围：RuoYi-Vue 的重构增强版本，面向分布式集群、多租户、工作流、文件、短信、邮件、WebSocket、任务调度等企业后台场景。

目录/分层结构：核心目录包括 `ruoyi-admin`、`ruoyi-common`、`ruoyi-extend`、`ruoyi-modules`、`script`。相比原 RuoYi，其 README 明确强调后端项目结构采用插件化和扩展包形式，解耦优于原框架。

认证授权：使用 Sa-Token、JWT、权限注解，支持登录校验、角色校验、权限校验、二级认证、HttpBasic、忽略校验等。对本项目 `RequireRole` 可直接形成替代方案。

数据访问：MyBatis-Plus，支持分页、乐观锁、多租户插件、动态数据源、SQL 监控等。当前项目已经使用 MyBatis-Plus，迁移成本相对低。

事务/并发/冲突：README 明确提到分布式幂等、Lock4j/Redisson 分布式锁、SnailJob 任务调度。这些对预约防重复、候补晋升、课时扣减幂等很有价值。

缓存/消息/异步：Redis 使用 Redisson，强调避免 `keys` 等错误用法；支持分布式队列、缓存注解、WebSocket/SSE 分布式会话同步。

接口文档：SpringDoc、javadoc 风格接口文档；这与本项目 SpringDoc 方向一致。

部署运维：Docker 编排、动态数据源、多环境配置较完善。

测试策略：README 提供单元测试支持说明；具体业务测试仍需按本项目补齐。

架构优点：Java 17/21、Spring Boot 3、MyBatis-Plus 与本项目技术栈最接近；对 Token、安全、幂等、分布式锁、接口文档等短板覆盖直接。

局限/风险：抽象层和扩展能力较多，小团队需要挑选式借鉴。

对本项目借鉴点：

- 用 Sa-Token 或 Spring Security 替换手写 TokenStore。
- 在预约、候补、课时扣减场景引入幂等注解/分布式锁思路。
- 参考其 `common` 层封装分页、错误码、数据权限、脱敏、接口文档。

### 5.3 jeecgboot/JeecgBoot

链接：[https://github.com/jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot)

业务范围：AI 低代码/零代码平台，支持一键生成前后端代码、流程、表单、报表、大屏、移动端，兼容主流大模型。对本项目不是业务域相似，而是工程化和后台能力完整。

目录/分层结构：低代码平台结构，包含系统管理、在线表单、报表、流程、代码生成、移动端等能力。文档展示有微服务架构图、产品功能蓝图、系统功能架构图。

认证授权：成熟后台权限模型，适合参考用户、角色、菜单、按钮权限、数据权限和在线接口文档的整合方式。

数据访问：MyBatis-Plus 为核心标签之一，配套代码生成和在线表单。

事务/并发/冲突：不直接解决预约场景；参考价值在于工作流、动态表单和报表，而不是课时扣减一致性。

缓存/消息/异步：平台生态包含流程、AI、MCP、RAG 等，部分能力对当前项目偏重。

接口文档：README 展示在线接口文档、报表设计器、移动端、大屏设计器等，文档完整度高。

部署运维：演示、文档、版本发布和社区活跃度优秀。

测试策略：开源平台更重演示和功能覆盖；本项目仍需独立补测试。

架构优点：高活跃、高社区，后台生成能力强，适合加速管理端 CRUD。

局限/风险：低代码平台会引入大量动态能力，不适合作为俱乐部后端核心架构直接照搬。

对本项目借鉴点：

- 管理后台 CRUD 可学习其代码生成、字段字典、接口文档联动。
- 统计报表和运营看板可参考其报表设计器思路。
- 不建议把当前第一阶段后端改造成低代码平台，短期只吸收“字典、日志、文档、代码生成”。

### 5.4 macrozheng/mall

链接：[https://github.com/macrozheng/mall](https://github.com/macrozheng/mall)

业务范围：电商前台 + 后台管理系统，包含商品、订单、会员、促销、运营、内容、统计报表、财务、权限、设置等。虽然不是体育培训，但“会员、订单、余额/流水、后台统计、权限”非常贴近本项目课时账户和预约业务。

目录/分层结构：后端 Java 比例高，配套 Docker、文档、ELK、MinIO、Redis 集群、读写分离等方案。业务通常按商品、订单、会员、促销、权限等模块拆分。

认证授权：Spring Security 是主题标签之一，后台权限管理成熟；适合对比本项目自研 `RequireRole`。

数据访问：Spring Boot + MyBatis，MySQL。不是 MyBatis-Plus，但 XML/Mapper 和业务 SQL 对复杂查询更直观。

事务/并发/冲突：订单、库存、促销、会员等场景比通用后台更接近“预约名额”和“课时扣减”。可参考订单状态机、库存扣减、缓存一致性、后台权限。

缓存/消息/异步：Redis、RabbitMQ、Elasticsearch、MongoDB、ELK、MinIO、Docker 生态完整。对本项目启用 Redis/RabbitMQ 时机有参考价值：先用于 Token/验证码/缓存，再用于通知和统计异步化。

接口文档：Swagger UI 主题，文档和教程生态非常丰富。

部署运维：Docker 容器化部署，另有 ELK、MinIO、Redis 集群、读写分离文章。

测试策略：不是以测试覆盖为卖点；本项目不能因此忽略预约和课时并发测试。

架构优点：业务真实度高，订单/会员/权限/统计是本项目最可借鉴部分。

局限/风险：电商复杂度和俱乐部预约不同；库存模型不能直接等同排课容量。

对本项目借鉴点：

- 课时账户可参考订单/会员/财务流水设计，增加交易号、来源单据、余额快照、反向流水。
- 通知、统计、报表可参考其运营后台分层。
- Docker 与 Redis/RabbitMQ/MinIO 运维文档可作为后续部署蓝图。

### 5.5 pig-mesh/pig

链接：[https://github.com/pig-mesh/pig](https://github.com/pig-mesh/pig)

业务范围：基于 Spring Cloud 2025、Spring Boot 4、OAuth2 的 RBAC 企业级快速开发平台，同时支持微服务和单体架构。开源版本保留认证、网关、用户权限、监控、代码生成、定时任务。

目录/分层结构：模块包括 `pig-auth`、`pig-boot`、`pig-common`、`pig-gateway`、`pig-register`、`pig-upms`、`pig-visual`，其中 `pig-common` 又拆成 core/data/datasource/log/security/swagger/feign/excel/xss 等。这个 common 切分对本项目中 `common/config/auth` 的后续拆分很有参考价值。

认证授权：Spring Authorization Server + OAuth2，支持授权码、密码、刷新令牌等常见登录与授权场景。对当前内存 Token 是生产级升级方向。

数据访问：MyBatis Plus 3.5.16，动态数据源，数据库脚本位于 `db/`。

事务/并发/冲突：不直接提供预约冲突模型；参考价值在认证中心、单体/微服务切换、common 封装和服务边界。

缓存/消息/异步：Docker Compose 启动 MySQL、Redis、Nacos 和业务服务；微服务模式使用网关和 Nacos。

接口文档：`pig-common-swagger` 封装接口文档，值得当前 SpringDoc 分组借鉴。

部署运维：提供 Docker Compose 单体/微服务两种本地编排，适合本项目后续加入 `docker-compose.yml`。

测试策略：工程规范较好，代码格式遵循 Spring Java Format；测试细节需按本项目补齐。

架构优点：认证生产化和部署工程化参考价值高；2026 年仍活跃。

局限/风险：Spring Boot 4 和 Spring Cloud 2025 对当前 Boot 3.5 项目过新，不能直接迁移依赖。

对本项目借鉴点：

- 将 Token/用户权限升级为 Redis 会话或 OAuth2/JWT 方案。
- 引入 `common-security`、`common-swagger`、`common-data` 类似边界。
- 为本项目补 Docker Compose：MySQL + Redis + app，后续再加 RabbitMQ。

### 5.6 chillzhuang/SpringBlade

链接：[https://github.com/chillzhuang/SpringBlade](https://github.com/chillzhuang/SpringBlade)

业务范围：商业级项目升级而来的综合型平台，支持 Spring Cloud 分布式微服务架构和 Spring Boot 单体式微服务架构并存，用于快速搭建企业级 SaaS 多租户微服务平台。

目录/分层结构：偏企业平台，强调多租户、微服务、React/Vue 多前端框架。具体目录需结合源码进一步阅读，但 README 已表明单体和微服务并存。

认证授权：企业级权限和租户模型是核心，适合参考多租户、菜单权限、租户隔离。

数据访问：Spring Boot 3.5、Spring Cloud 2025、MyBatis，Java 17 重构业务代码。

事务/并发/冲突：不直接提供预约领域；可参考 SaaS 租户、权限隔离和工程规范。

缓存/消息/异步：企业平台通常配套注册中心、配置、缓存和网关；当前报告只确认 README 范围。

接口文档：文档和官网完善。

部署运维：有商业级部署和平台化思路，但部分能力可能依赖商业生态。

测试策略：未作为主要开源卖点；需谨慎验证。

架构优点：技术版本新，Java 17 + Boot 3.5 与本项目高度匹配。

局限/风险：业务领域不相似，且企业平台抽象偏重。

对本项目借鉴点：

- 中长期如果做多俱乐部/SaaS，可参考租户隔离和权限模型。
- Java 17/Boot 3.5 版本升级策略可对齐。
- 不建议近期引入微服务，先把单体模块边界打牢。

### 5.7 stylefeng/Guns

链接：[https://github.com/stylefeng/Guns](https://github.com/stylefeng/Guns)

业务范围：现代化 Java 应用开发框架，目标是提升企业信息化系统开发效率。技术标签含 JWT、REST、Spring Boot、REST API、MyBatis、MyBatis-Plus。

目录/分层结构：快速开发框架，强调通用后台能力、代码生成和企业信息化低成本。比 `ruoyi-vue-pro` 更轻，适合作为中小项目后台骨架参考。

认证授权：JWT 和 RBAC 后台是核心方向，可对比当前 Bearer Token 自研链路。

数据访问：MyBatis/MyBatis-Plus。

事务/并发/冲突：不涉及预约领域；主要参考通用框架和 REST 规范。

缓存/消息/异步：需进一步读源码确认；本报告不把它作为缓存/消息重点参考。

接口文档：README 有框架介绍和荣誉，生态历史较长。

部署运维：社区和文档较成熟，但最近代码活跃低于前几名。

测试策略：需进一步源码核验。

架构优点：JDK17 + Spring Boot3 方向与本项目一致，项目规模没有 ruoyi-vue-pro 那么重。

局限/风险：领域业务弱，近期主要是 README 更新；对预约/课时一致性帮助有限。

对本项目借鉴点：

- 作为轻量后台开发框架参考，而不是业务模型参考。
- 可借鉴其 REST/JWT/代码生成组织方式。

### 5.8 jishenghua/jshERP

链接：[https://github.com/jishenghua/jshERP](https://github.com/jishenghua/jshERP)

业务范围：管伊佳 ERP，面向中小企业，专注进销存、财务、生产，模块包括零售、采购、销售、仓库、财务、报表、系统管理。README 明确提到角色和权限精确到按钮和菜单。

目录/分层结构：包含 `jshERP-boot` 和 `jshERP-web`。后端业务围绕 ERP 单据、会员、供应商、客户、库存、财务账户和报表展开。

认证授权：角色和权限控制细致到按钮/菜单，值得本项目后台权限生产化时参考。

数据访问：Spring Boot 2.0.0、MyBatis 1.3.2、MySQL 8.0.24、Redis 6.2.1。技术版本偏旧，但业务模型有价值。

事务/并发/冲突：ERP 单据、库存、客户/会员、财务收支等比通用后台更接近课时账户和预约后扣课时的“账务流水”。

缓存/消息/异步：Redis 是环境依赖之一；未确认 RabbitMQ。

接口文档：README 提供用户手册、接口文档、部署教程、演示云平台。

部署运维：有部署教程、打包说明、云平台；商业/插件生态较明显。

测试策略：未看到测试作为卖点；不应借鉴其老版本依赖和可能的历史包袱。

架构优点：会员/财务/报表/权限与本项目课时账户、统计后台高度相关。

局限/风险：Spring Boot 2/JDK8 栈老，直接迁移不可取；业务是 ERP，不是预约排课。

对本项目借鉴点：

- 课时账户流水应借鉴 ERP 财务单据：来源单据、变动类型、余额快照、操作人、撤销/冲正。
- 后台权限可从“菜单 + 按钮权限”扩展，而不只是角色枚举。
- 统计报表可参考其报表/会员查询优化方向。

### 5.9 yangzongzhuan/RuoYi-Vue

链接：[https://github.com/yangzongzhuan/RuoYi-Vue](https://github.com/yangzongzhuan/RuoYi-Vue)

业务范围：RuoYi 官方前后端分离权限管理系统，包含用户、部门、岗位、菜单、角色、字典、参数、通知公告、操作日志、登录日志、在线用户、定时任务、代码生成、接口文档、服务监控、缓存监控、连接池监视等。

目录/分层结构：经典后台管理系统结构，Java + Vue，MyBatis，Spring Security，JWT，Redis，Quartz，Swagger2。相对新派项目更老，但资料最多。

认证授权：Spring Security + JWT + 菜单/角色/权限标识，是最容易理解的 RBAC 样板。

数据访问：MyBatis + MySQL，Druid 连接池，代码生成支持 CRUD。

事务/并发/冲突：业务偏系统管理；不解决预约冲突。

缓存/消息/异步：Redis 用于缓存/在线用户，Quartz 用于定时任务。

接口文档：Swagger2，文档地址和演示站齐全。

部署运维：部署资料多，适合初期搭建参考。

测试策略：通用后台测试参考有限。

架构优点：RBAC、日志、字典、代码生成和接口文档模板清晰，学习成本低。

局限/风险：Spring Boot/Spring Security 方案较旧，MyBatis-Plus 不匹配，不能直接复制依赖。

对本项目借鉴点：

- 近期可先参考其用户/角色/菜单/权限标识表结构，把当前角色枚举升级为可配置权限。
- 增加操作日志、登录日志、在线用户和字典管理。

### 5.10 elunez/eladmin-mp

链接：[https://github.com/elunez/eladmin-mp](https://github.com/elunez/eladmin-mp)

业务范围：eladmin 的 MyBatis-Plus 版本，Spring Boot 2.7.18、MyBatis-Plus、Spring Security、Redis、Vue 前后端分离后台管理系统，RBAC、数据字典、数据权限、前后端代码生成、动态路由。

目录/分层结构：比 ruoyi-vue-pro 更轻，适合中小后台系统参考。README 已明确 RBAC、数据权限、动态路由和代码生成。

认证授权：Spring Security + JWT + Redis 方向。GitHub 提交历史中有 TokenProvider 并发问题修复、JwtUserDto 密码字段移除等安全相关提交，值得当前项目注意。

数据访问：MyBatis-Plus，与本项目 ORM 栈一致。

事务/并发/冲突：没有业务预约模型，但安全提交中出现 Token 并发 bug 修复，对当前自研 TokenStore 有警示价值。

缓存/消息/异步：Redis 是核心依赖；消息队列不是重点。

接口文档：后台基础文档和代码生成能力可参考。

部署运维：无 release，维护活跃度低于前几名。

测试策略：需进一步核验。

架构优点：轻量、MyBatis-Plus、Spring Security、Redis、RBAC 组合贴近本项目短期升级。

局限/风险：Spring Boot 2.7，社区热度和活跃度一般。

对本项目借鉴点：

- 如果不想引入大平台，可先参考 eladmin-mp 的 JWT/Security/Redis 组合做轻量化鉴权。
- 注意 Token 生成/验证组件的并发安全，避免共享可变 builder 或全局状态。

## 6. 针对 ping-smart-club-web-boot 的架构建议

### 6.1 近期可落地

1. 立即替换明文密码：新增 `PasswordEncoder`，优先 BCrypt；SQL 初始化账号改为哈希值；登录时用 `matches`。同时新增一次性迁移脚本，兼容已有明文演示账号的过渡期。
2. Token 从内存迁出：短期用 Redis 存 `token -> user/session`，支持过期、注销、多实例共享；如果暂不启 Redis，至少把内存 TokenStore 标记为 dev-only 并在 prod profile 禁用启动。
3. 收紧生产异常输出：`GlobalExceptionHandler` 对未知异常返回统一文案和错误码，详细异常只写日志；避免 `ex.getMessage()` 暴露 SQL、路径、配置等内部信息。
4. 去除配置明文密钥：`application.yml` 和 `application-dev.yml` 中数据库密码改为环境变量或本地不提交的 profile；生产默认值不要保留 `root/root` 或真实密码。
5. 增加核心数据库约束：`psc_booking` 增加“同一 schedule + student 活跃预约唯一”的约束策略，MySQL 可用状态拆分或生成列；`psc_waitlist_entry` 增加同一 schedule + student 等待中唯一；`psc_lesson_account` 已有 student 唯一，需要再配合乐观锁字段。
6. 预约容量加锁：`createBooking` 不能只 `countBooked` 后插入。短期可在事务内对 `psc_course_schedule` 行 `SELECT ... FOR UPDATE`，再检查容量并插入；或给 schedule 增加 `booked_count/version` 做 CAS 更新。
7. 排课冲突加数据库级防线：当前 `validateConflict` 只做应用查询，至少在事务中对同教练/同场地同日期的排课集合加锁；中期可维护时间片表或用资源日程表做唯一占用。
8. 课时账户流水加幂等交易号：`psc_lesson_transaction` 增加 `biz_type + biz_id + transaction_type` 或 `request_id` 唯一键；`consume`、`adjust` 支持重复请求幂等返回，避免网络重试多扣。
9. 补核心测试：至少增加登录成功/失败、角色无权限、排课冲突、预约满员、重复预约、候补晋升、课时不足、并发预约容量不超卖、并发扣课时不为负。

### 6.2 中期演进

10. 权限从角色枚举升级为 RBAC：参考 RuoYi/ruoyi-vue-pro，增加用户、角色、菜单、按钮权限、接口权限、数据范围；`@RequireRole` 可逐步替换为 `@RequirePermission("schedule:create")`。
11. 拆清 DTO/VO/Entity 边界：Controller 入参使用 Request DTO，返回使用 Response VO，POJO 仅作为持久化实体；避免把数据库字段、审计字段、密码、内部状态直接暴露。
12. 拆领域服务：保留资源 CRUD Service，但新增 `BookingDomainService`、`ScheduleConflictService`、`LessonAccountDomainService`，把“预约容量、候补晋升、课时扣减、通知发送”从单个资源 Service 中抽出。
13. 建立状态机和错误码：预约状态、排课状态、候补状态、课时流水类型不要只用裸字符串；增加枚举、状态迁移校验和业务错误码，如 `BOOKING_FULL`、`BOOKING_DUPLICATED`、`SCHEDULE_CONFLICT_COACH`。
14. OpenAPI 分组和版本策略：当前 `/api` 可继续保留，建议新增 `/api/v1` 或在 SpringDoc 中分组 admin/coach/student；DTO 字段加 schema 示例，减少前后端联调口头协议。
15. 通知异步化：短期系统通知可同步写库；中期当短信/微信模板消息接入后，再启 RabbitMQ 或 Redis Stream，避免预约事务被外部通知拖慢。

### 6.3 长期优化

16. 多俱乐部/SaaS 租户：如果未来支持多个俱乐部，参考 SpringBlade/ruoyi-vue-pro 的租户模型，所有核心表增加 `club_id/tenant_id`，权限、排课、场地、教练、学员都按租户隔离。
17. 缓存策略分级：Redis 先用于 Token、验证码、幂等和短期热点字典；不要过早缓存预约容量这类强一致数据。排课日历可做读缓存，但写入后要精确失效。
18. 账户与支付闭环：课时账户后续应与支付订单、退款、赠课、过期、转课、冻结结合，采用“账户余额 + 不可变流水 + 冲正流水”的账务模型。
19. Docker/K8s 安全部署：补 Dockerfile、docker-compose；K8s 使用 Secret/ConfigMap；开启健康检查、优雅停机、日志输出到 stdout；生产禁用 Swagger 或加鉴权。
20. 可观测性：增加登录/预约/扣课时/排课冲突的结构化业务日志和审计日志；后续接入 Prometheus 指标，监控预约失败率、候补转正耗时、课时扣减失败率。

## 7. 今日建议深入阅读的项目

1. [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)：最适合看“完整后台 + 会员/支付/CRM/ERP + 权限 + 多模块”的组合。建议重点读 `yudao-framework`、`yudao-module-system`、`yudao-module-member`、`yudao-module-pay`。
2. [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)：最适合看 Java 17/Boot 3/MyBatis-Plus/Sa-Token/Redisson/幂等/分布式锁这些与本项目近期升级直接相关的能力。
3. [macrozheng/mall](https://github.com/macrozheng/mall)：最适合看会员、订单、财务、统计、缓存、消息和 Docker 部署。虽然业务是电商，但对课时账户流水和预约容量一致性启发较大。

## 8. 检索关键词与数据不确定性

### 8.1 使用过的关键词

- `springboot mybatis-plus admin rbac`
- `ruoyi vue plus`
- `spring boot education management system`
- `springboot gym management system mysql`
- `springboot erp mybatis mysql rbac`
- `springboot crm mybatis mysql rbac`
- 项目名定向核验：`YunaiV/ruoyi-vue-pro`、`dromara/RuoYi-Vue-Plus`、`jeecgboot/JeecgBoot`、`macrozheng/mall`、`pig-mesh/pig`、`jishenghua/jshERP`、`stylefeng/Guns`、`elunez/eladmin-mp`、`yangzongzhuan/RuoYi-Vue`。

### 8.2 数据来源

- 本地源码：`/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot`
- GitHub 仓库页、README、commits 页、releases 信息。
- GitHub 搜索工具用于候选发现；部分关键词搜索结果噪声较高，因此最终使用“关键词搜索 + 已知项目定向核验 + 仓库页证据”交叉筛选。

### 8.3 不确定性说明

- GitHub stars/forks 会持续变化，本报告记录的是 2026-06-22 18:16 CST 附近页面可见值。
- 部分项目在 GitHub 与 Gitee/GitCode 多平台同步，GitHub commits 页可能晚于主维护平台；报告优先使用 GitHub 可见信息。
- 部分仓库的 commit 页面或动态区域加载不完整，最近活跃时间在这些情况下使用 release、tag 或 GitHub commit search 的可见结果。
- 本报告没有 clone 外部仓库逐行审计源码，因此“事务/并发/测试策略”部分基于 README、目录结构、公开说明和可见提交做架构判断；真正落地前建议对排名前三项目做一次源码级专项阅读。

