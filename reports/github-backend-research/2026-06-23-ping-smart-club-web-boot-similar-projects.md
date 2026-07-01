# 2026-06-23 `ping-smart-club-web-boot` GitHub 相似后端项目调研

## 1. 当日调研摘要

### 1.1 本项目当天真实状态概括

本次以本地完整源码 `/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot` 为准完成基线核对，未发现可见性限制。当天可见状态如下：

- Maven 依赖位于 `pom.xml`，当前为 `Spring Boot 3.5.9 + Java 17 + MyBatis-Plus 3.5.5 + MySQL 8 + Lombok + Validation + SpringDoc`。
- 代码结构为传统分层：`controller(12) / service(11) / mapper(15) / auth(6) / config(6) / common(3) / dto(6) / pojo(15)`。
- 鉴权未启用 Spring Security 正式链路，当前是 `AuthInterceptor + RequireRole + TokenStore` 的自定义实现。
- `AuthService` 仍使用明文密码比对，`TokenStore` 使用 JVM 内 `ConcurrentHashMap` 保存 168 小时 token，会话不持久化、不可横向扩缩容。
- `application.yml` 与 `application-dev.yml` 中存在本地数据库账号密码；Redis/RabbitMQ/Spring Security 是“配置预留”，依赖大多仍注释。
- `sql/` 下同时存在 `ping-smart-club-phase1.sql` 与历史风格更重的 `ping-smart-club.sql` 两套模型，存在演进分叉。
- 预约/候补/排课/课时流水/通知等核心业务已具备第一阶段代码，但冲突控制主要依赖应用层查询与事务，数据库唯一约束、行锁/乐观锁、幂等键、消息补偿尚未形成生产级闭环。
- 测试当前仅见启动类 smoke test，尚未形成模块级单测、集成测试、并发冲突测试。

### 1.2 今日 Top 10 总体特征

今天筛出的 10 个项目明显分成三类：

1. **后台管理平台型**：`ruoyi-vue-pro`、`JeecgBoot`、`RuoYi-Vue-Plus`、`eladmin`、`ballcat`、`pig`、`yudao-cloud`。这类项目最适合参考权限体系、模块边界、OpenAPI/文档、配置治理、缓存和部署工程化。
2. **复杂业务交易型**：`mall`、`litemall`、`crmeb_java`。这类项目更适合参考会员、账户、订单、库存/优惠、异步通知、Docker 化和后台运营模块划分。
3. **单体到云原生演进型**：`ruoyi-vue-pro` 与 `yudao-cloud` 形成一组，能直接对照你项目未来是否要从单体扩到分布式。

### 1.3 最值得关注的 3 个方向

- **生产化权限与会话体系**：你项目当前的明文密码 + 内存 token 是最大短板，最值得参考 `ruoyi-vue-pro`、`RuoYi-Vue-Plus`、`eladmin`。
- **预约/排课/账户流水的一致性治理**：`mall`、`crmeb_java` 在交易状态、缓存、异步通知、账户变更留痕方面参考价值更高。
- **分层重组与工程化升级**：`ruoyi-vue-pro`、`ballcat`、`yudao-cloud` 在模块拆分、基础设施抽象、配置外置和测试组织上更接近可持续演进路线。

## 2. 本项目基准画像

### 2.1 技术栈

| 维度 | 当前状态 |
| --- | --- |
| 语言/运行时 | Java 17 |
| 框架 | Spring Boot 3.5.9 |
| Web | Spring Web |
| ORM/持久层 | MyBatis-Plus 3.5.5 |
| 数据库 | MySQL 8，HikariCP |
| 文档 | SpringDoc OpenAPI / Swagger UI |
| 校验 | Spring Validation |
| 日志 | Logback |
| 预留未正式启用 | Redis、RabbitMQ、Spring Security |

### 2.2 代码分层与业务模块

当前代码仍是**按技术层分包**，不是按领域分包。主要模块如下：

- 鉴权：`AuthController / AuthService / auth/*`
- 学员：`StudentController / StudentService`
- 教练：`CoachController / CoachService`
- 课程目录：`CourseCatalogController / CourseCatalogService`
- 场地：`VenueController / VenueService`
- 排课：`ScheduleController / ScheduleService`
- 预约与候补：`BookingController / BookingService`
- 课时账户：`LessonAccountController / LessonAccountService`
- 考勤：`AttendanceController / AttendanceService`
- 通知：`NotificationController / NotificationService`
- 统计：`StatsController / StatsService`

### 2.3 鉴权方式

- 登录用户落在 `psc_user`。
- 当前接口使用 `Authorization: Bearer <token>`。
- `TokenStore` 采用随机 UUID + 内存 `ConcurrentHashMap`。
- `RequireRole` 负责角色校验。
- `SecurityConfig` 文件存在，但整体被注释，尚未真正启用 Spring Security 过滤链。

### 2.4 数据访问与事务

- 以 MyBatis-Plus `Mapper + Service` 为主，SQL 结构偏 CRUD。
- `ScheduleService` 用应用层查询判断教练/场地时间冲突。
- `BookingService` 用事务包裹预约、取消、候补晋升、课时扣减，但没有看到数据库级防重约束、座位抢占锁、幂等号、补偿消息。

### 2.5 异常与响应封装

- 成功/失败统一通过 `ApiResponse`。
- 业务异常使用 `BusinessException`。
- `GlobalExceptionHandler` 对 `Exception` 直接返回 `ex.getMessage()`，生产环境存在内部错误信息外泄风险。

### 2.6 部署配置

- 已有 `Dockerfile`、`docker-compose.yml`、`k8s/configmap.yaml`、`k8s/secret.yaml`、`k8s/deployment.yaml`、`k8s/ingress.yaml`。
- 但默认配置文件仍带本地数据库密码，说明“仓库内配置”和“环境密钥注入”尚未彻底分离。

### 2.7 当前短板判断

1. **安全短板最突出**：明文密码、内存 token、未启用标准安全链、配置泄密风险。
2. **领域边界偏薄**：DTO/Entity/响应对象未充分分层，业务逻辑主要堆在 service。
3. **一致性不够硬**：排课、预约、候补、课时账户还缺数据库约束、锁策略、幂等与补偿。
4. **工程治理偏初期**：缺完整测试、缺统一错误码字典、缺版本化 API 策略、缺配置分级与 secrets 管理。
5. **数据模型存在历史分叉**：`ping-smart-club-phase1.sql` 与 `ping-smart-club.sql` 并存，长期会拖慢演进。

## 3. 评分方法

本次综合评分总分 100，采用以下维度：

- 技术栈相似度 25
- 业务范围/领域相似度 20
- 架构清晰度与工程化质量 20
- 维护活跃度 15
- 社区热度 10
- 文档/部署/测试完整度 10

说明：

- 对与你业务更接近但技术略旧的项目，业务分会高、活跃度分会低。
- 对平台型项目，虽然业务不完全同域，但如果权限、模块化、部署和工程治理明显优于你项目，仍会获得较高总分。
- “最近活跃时间”优先取 GitHub commit 页面可见的最新提交日期；若 commit 页面不便直接读取，则退而取 release 日期，并在表格中注明。

## 4. Top 10 项目总表

| 排名 | 项目 | 综合评分 | Stars | Forks | 最近活跃时间 | 许可证 | 技术栈/形态 | 业务范围 | 与本项目相似点 | 主要参考价值 |
| --- | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- | --- |
| 1 | [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) | 89 | 37.9k | 8.2k | 2026-05-24 commit | MIT | Spring Boot + MyBatis-Plus + RBAC 单体平台 | 管理后台、会员、支付、CRM、ERP、多租户 | 技术栈、RBAC、模块化、OpenAPI 都很接近 | 单体平台化治理、权限、测试与基础设施抽象 |
| 2 | [YunaiV/yudao-cloud](https://github.com/YunaiV/yudao-cloud) | 86 | 19.1k | 4.8k | 2026-05-31 release | MIT | Spring Cloud Alibaba + MyBatis-Plus | 云原生后台平台，含会员/商城/支付/IoT | 同作者同体系，适合看单体到云演进 | 微服务拆分、配置中心、消息、分布式治理 |
| 3 | [jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 84 | 46.8k | 16.1k | 2026-05-21 commit | Apache-2.0 | Spring Boot 3 + MyBatis-Plus + 低代码平台 | 企业后台、表单、流程、权限、报表 | 工程成熟、文档完备、权限/配置完善 | 工程化模板、权限/字典/生成器思路 |
| 4 | [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 83 | 2.3k | 589 | 2026-01-27 commit | MIT | Spring Boot + MyBatis-Plus + Knife4j | 后台权限平台 | 与你当前单体后端形态最接近 | 轻量但现代化的 RBAC、配置、文档链路 |
| 5 | [elunez/eladmin](https://github.com/elunez/eladmin) | 79 | 21.9k | 7.4k | 2023-07-05 release | Apache-2.0 | Spring Boot + JPA + Spring Security + Redis | 通用后台权限平台 | 权限生产化、数据权限、动态路由 | 安全链、缓存、RBAC 的成熟落地方式 |
| 6 | [macrozheng/mall](https://github.com/macrozheng/mall) | 78 | 83.9k | 29.7k | 2026-01-11 commit | Apache-2.0 | Spring Boot + MyBatis + Redis + RabbitMQ + Docker | 电商后台/会员/订单/营销 | 账户、预约状态机、通知、后台运营有借鉴 | 交易状态、缓存、异步消息、容器化 |
| 7 | [ballcat-projects/ballcat](https://github.com/ballcat-projects/ballcat) | 76 | 1.7k | 314 | 2024-04-13 release | Apache-2.0 | Spring Boot 脚手架 + 安全/日志/定时任务 | 企业后台开发脚手架 | 分层和基础设施抽象适合你重构 | starter 化基础能力、统一治理能力 |
| 8 | [pig-mesh/pig](https://github.com/pig-mesh/pig) | 74 | 6.6k | 1.1k | 2026-06-05 release | Apache-2.0 | Spring Cloud + OAuth2/SAS + RBAC | 微服务权限平台 | 权限、认证、网关、配置中心思路强 | 认证中心、网关鉴权、分布式扩展 |
| 9 | [crmeb/crmeb_java](https://github.com/crmeb/crmeb_java) | 73 | 2.8k | 763 | 2026-01-05 commit | Apache-2.0 | Spring Boot + MyBatis-Plus + Redis + Swagger | 商城/会员/营销/后台 | 会员、账户、运营、通知流程可迁移 | 会员与营销域建模、接口文档、后台配置化 |
| 10 | [linlinjava/litemall](https://github.com/linlinjava/litemall) | 69 | 20.3k | 7.3k | 2022-10-13 commit | MIT | Spring Boot + 商城单体 | 小型商城、后台、微信小程序 | 单体业务完整度高但较旧 | 单体业务拆分、订单链路、前后端协作样例 |

## 5. 各项目详细评估

### 5.1 `ruoyi-vue-pro`

- **业务范围**：通用后台平台，已覆盖系统、支付、商城、会员、CRM、ERP、MES、IoT、报表等模块。
- **模块边界**：仓库清晰拆为 `framework`、`server`、`module-system/member/mall/...`，模块化优于你当前“纯技术层分包”。
- **认证授权**：RBAC、数据权限、三方登录、多租户能力完整，适合作为你后续“管理员/教练/学员/家长”权限模型升级参考。
- **数据访问**：MyBatis-Plus，含大量通用查询/代码规范沉淀。
- **事务/并发**：从 commit 页面可见仍在持续修修复框架和业务校验，说明项目对生产问题有持续反馈闭环。
- **缓存/消息/异步**：平台层能力成熟，可扩展到 Redis、队列和任务调度。
- **接口文档**：文档体系完整，演示站与 README 指引清晰。
- **部署运维**：文档、脚本、SQL、模块结构都较完整。
- **测试策略**：commit 中可见 `WmsInventoryServiceImplTest` 等测试修复记录，说明不是“零测试文化”。
- **优点**：单体平台化程度高、现代技术栈、维护活跃。
- **局限**：业务面太广，直接照搬会过重。
- **对你最可借鉴点**：先学习其“模块边界 + 权限中心 + 通用基础设施”思路，而不是全量复制。

### 5.2 `yudao-cloud`

- **业务范围**：Cloud 版本的后台平台，含支付、商城、CRM、ERP、MES、IoT、报表等。
- **目录/分层**：清晰按 `framework + module + server` 拆分，且支持 Spring Cloud Alibaba、Dubbo、Nacos、RocketMQ、Seata、SkyWalking。
- **认证授权**：成熟 RBAC 与多租户能力，适合你项目未来“多校区/多门店/多馆”演进时参考。
- **数据访问**：MyBatis-Plus，配合云侧组件。
- **并发/一致性**：更偏分布式事务与云治理，不是直接为排课业务设计，但对未来拆预约、支付、通知很有价值。
- **缓存/消息/异步**：完整度很高，适合做你启用 Redis/RabbitMQ 之后的中远期蓝本。
- **接口文档**：README、演示、release 节奏都很强。
- **部署运维**：显著优于你当前项目，适合借鉴配置中心、链路追踪、消息治理。
- **优点**：最新活跃、平台成熟、云原生完备。
- **局限**：相对你当前单体过重，短期不适合直接迁移。
- **对你最可借鉴点**：只借“未来路线图”，近期不要直接朝微服务大拆。

### 5.3 `JeecgBoot`

- **业务范围**：低代码/零代码平台，但底层后端能力非常完整。
- **目录/分层**：大仓库、多子项目、配套文档和 docker 文件齐全。
- **认证授权**：颗粒度高，适合参考字典、菜单、数据权限、代码生成结合权限的治理思路。
- **数据访问**：Spring Boot 3 + MyBatis-Plus。
- **缓存/消息/异步**：企业化能力强。
- **接口文档**：README 详尽、版本节奏明确。
- **部署运维**：Docker、云部署资料完整。
- **测试策略**：未在首页直接突出，但工程化成熟度高于很多 CRUD 项目。
- **优点**：文档和工程完整度很高，适合参考“平台能力怎么沉淀”。
- **局限**：业务与乒乓俱乐部并不接近，低代码属性会拉低直接可迁移性。
- **对你最可借鉴点**：统一字典、通用组件、后台配置化能力，不建议引入低代码本体。

### 5.4 `RuoYi-Vue-Plus`

- **业务范围**：轻量级后台权限平台。
- **目录/分层**：在 RuoYi 体系上升级到 MyBatis-Plus、Undertow、Knife4j、Hutool、Feign，结构相对干净。
- **认证授权**：适合作为你当前单体后端最近距离的“生产化 RBAC 样板”。
- **数据访问**：MyBatis-Plus，和你项目的 ORM 习惯接近。
- **事务/并发**：更偏基础平台，不强调排课，但通用服务分层可参考。
- **接口文档**：Knife4j 友好，适合你把 Swagger 从“能看”提升到“能交付”。
- **部署运维**：有 Docker 与文档。
- **优点**：技术债少、现代化、足够轻，不像超大平台那样难落地。
- **局限**：业务域不强，交易型场景示例少。
- **对你最可借鉴点**：把你现有自定义鉴权替换为更标准的认证授权层时，可优先对照这个项目。

### 5.5 `eladmin`

- **业务范围**：通用后台管理系统，突出 RBAC、数据权限、字典和动态路由。
- **目录/分层**：模块化明显，JPA 版本而非 MyBatis-Plus。
- **认证授权**：Spring Security + Redis 是它的核心价值，正好补你当前鉴权短板。
- **数据访问**：虽非同 ORM，但在“领域服务 + repository + 安全”组合上仍有参考性。
- **缓存/异步**：Redis 使用成熟。
- **接口文档**：文档、演示、release 齐全。
- **测试策略**：首页未突出，需二次深入。
- **优点**：安全生产化思路成熟。
- **局限**：技术栈并非完全同构，且近两年公开 GitHub 活跃度不高。
- **对你最可借鉴点**：密码散列、Token/缓存、权限注解与安全过滤链组织方式。

### 5.6 `mall`

- **业务范围**：完整电商后台与前台，会员、订单、促销、统计、权限、设置全都有。
- **目录/分层**：`mall-admin`、`mall-portal`、搜索/缓存/消息等配套成熟。
- **认证授权**：使用 Spring Security，适合借鉴后台用户/会员两侧权限分离。
- **数据访问**：MyBatis；同时配 Redis、RabbitMQ、Elasticsearch、MongoDB、Docker。
- **事务/并发/冲突处理**：尽管业务不同，但“下单/库存/营销/缓存一致性”的套路与“预约/课时/候补/通知”非常接近。
- **接口文档**：Swagger、部署文档、Docker 教程很全。
- **部署运维**：是今天容器化与运维资料最完整的一类样本。
- **测试策略**：更多偏实战教程型，不是测试驱动型。
- **优点**：交易流程、缓存、消息和部署实战价值高。
- **局限**：业务领域不是体育培训，排课逻辑需要你自行映射。
- **对你最可借鉴点**：课时账户可按“余额账户 + 流水 + 状态流转 + 缓存更新”方式生产化。

### 5.7 `ballcat`

- **业务范围**：后台脚手架，聚焦权限、日志、定时任务、统一异常、XSS 过滤、国际化等基础设施。
- **目录/分层**：starter 化思路明显，适合把你现在 `common/config/auth` 零散能力重新收束。
- **认证授权**：偏平台化。
- **数据访问**：不是核心亮点，但工程抽象做得比普通业务项目好。
- **接口文档**：官方 docs 明确。
- **部署运维**：release 完整，适合作为工程治理蓝本。
- **优点**：很适合借鉴“公共能力下沉”为基础模块。
- **局限**：业务域参考较弱。
- **对你最可借鉴点**：统一异常、日志审计、基础 starter、模块化拆分。

### 5.8 `pig`

- **业务范围**：基于 Spring Cloud 的 RBAC 权限平台。
- **认证授权**：OAuth2 / Spring Authorization Server / 网关鉴权，是它的最大参考价值。
- **数据访问**：不是你当前最关心的点，但对后续分布式扩展有帮助。
- **缓存/消息/异步**：云原生配套成熟。
- **文档/部署**：release 更新到 2026-06-05，活跃度好。
- **优点**：认证中心、授权服务、网关模式成熟。
- **局限**：对你当前单体排课系统来说偏重。
- **对你最可借鉴点**：如果未来要把移动端、后台端、第三方端统一接入，`pig` 的认证中心架构值得看。

### 5.9 `crmeb_java`

- **业务范围**：商城、会员、积分、优惠券、余额、权限、角色、后台配置。
- **目录/分层**：README 直接给出了 `admin / app / crmeb(Api)` 的包说明，便于理解多端配套。
- **认证授权**：后台权限、角色体系较完整。
- **数据访问**：Spring Boot + MyBatis-Plus + Redis + Swagger。
- **事务/并发**：适合参考会员、余额、营销状态流与后台配置表。
- **接口文档**：文档、数据字典、二开文档、Apifox 链接都很全。
- **部署运维**：安装教程和视频文档较完善。
- **优点**：文档和业务配置化不错，后台可运营能力强。
- **局限**：公开 commit 中有不少营销/README 类提交，核心架构演进信号不如前几名稳定。
- **对你最可借鉴点**：学员课时账户与营销/权益体系的“流水留痕 + 运营后台配置化”。

### 5.10 `litemall`

- **业务范围**：单体商城，含管理后台、微信小程序、移动端。
- **目录/分层**：前后端协作完整，单体业务链条很清楚。
- **认证授权**：有权限管理，但偏老式实现。
- **数据访问**：Spring Boot 单体；更适合学习“小而全”业务分层。
- **接口文档/部署**：README 足够详细，启动说明齐全。
- **测试策略**：从公开信息看不突出。
- **优点**：对“小单体如何承载完整业务”很有参考性。
- **局限**：公开活跃度明显偏旧，release 停在 2021，最新 commit 也只到 2022。
- **对你最可借鉴点**：如果你要保持单体路线，它是比超大平台更容易看透的业务样例。

## 6. 针对 `ping-smart-club-web-boot` 的架构建议

### 6.1 近期可落地（1-3 周）

1. **立刻替换明文密码**：把 `psc_user.password` 迁移为 BCrypt（或符合你们合规要求的 SM3/国密方案），登录改为 `PasswordEncoder.matches`，并加一次性迁移脚本。
2. **废弃内存 `TokenStore`**：至少切到 JWT + Redis 黑名单/会话表，或者纯 Redis session；当前 `ConcurrentHashMap` 无法支撑重启恢复、集群扩容和强制下线。
3. **启用正式安全链**：不要再让 `SecurityConfig` 注释存在但不生效；把管理员、教练、家长/学员接口统一放到 Spring Security 过滤链里。
4. **移除仓库内明文凭据**：`application.yml`、`application-dev.yml` 中的 DB 密码需要改为环境变量或本地 `.env` / secret 注入；当前状态不适合多人协作和 CI。
5. **统一错误码字典**：`BusinessException` 现在直接复用 HTTP code，但业务域还不够细。建议新增 `AUTH_* / SCHEDULE_* / BOOKING_* / LESSON_*` 这类稳定业务码。
6. **收敛 SQL 基线**：明确只保留一套主演进脚本。`ping-smart-club-phase1.sql` 与 `ping-smart-club.sql` 并存会让接口和数据模型逐渐背离。
7. **保护 500 错误输出**：`GlobalExceptionHandler` 不要直接暴露 `ex.getMessage()`，改为内部日志记录 + 外部返回统一文案与 traceId。
8. **为预约防重增加数据库约束**：至少补 `(schedule_id, student_id, status in active states)` 的可实现约束方案，或独立业务唯一键，避免并发下重复预约。

### 6.2 中期演进（1-2 个月）

1. **从技术层分包转为领域分包**：建议按 `auth / student / coach / course / schedule / booking / attendance / account / notification / stats` 拆包，每个域下再放 controller/service/repository/dto。
2. **明确 DTO / VO / Entity 边界**：当前 `pojo` 与 `dto` 还偏扁平。建议实体只负责持久化，入参/出参单独建模，减少后续字段污染。
3. **重做预约排课一致性策略**：为 `Schedule` 与 `Booking` 加版本号或锁策略；高并发场景用“先锁课程安排再写预约/候补”的事务顺序。
4. **课时账户改成“账户表 + 流水表 + 幂等单号”**：`lesson_account` 与 `lesson_transaction` 已有雏形，但还应增加业务单号、来源类型、撤销/冲正机制。
5. **补齐数据库索引与约束**：当前教练/场地冲突主要靠应用层查询。建议补唯一索引、状态索引、时间段查询索引，并为流水、通知、考勤加常用查询组合索引。
6. **完善 OpenAPI 分组与版本化**：把 `/api/v1/admin/...`、`/api/v1/coach/...`、`/api/v1/app/...` 区分开，避免后续小程序和后台接口混用。
7. **把通知中心从“直接写记录”升级为“记录 + 发送器”**：先把站内信、短信、微信模板消息抽象成 channel handler，再逐步接 Redis/RabbitMQ。
8. **补测试矩阵**：至少覆盖登录、排课冲突、重复预约、候补晋升、课时扣减、取消释放名额、角色越权。

### 6.3 长期优化（2-6 个月）

1. **按业务强度决定是否拆服务**：在单体稳定前不建议急拆微服务。等预约/通知/支付/数据报表访问量起来后，再评估拆 `auth`、`booking`、`notification`。
2. **引入缓存时要先定边界**：Redis 最适合先用在 token/session、字典、教练可约时间快照、统计缓存；不要一开始把核心交易状态做成 cache-first。
3. **消息队列只在有真实异步需求时启用**：更适合预约成功通知、课前提醒、候补晋升、统计异步汇总，而不是为了“用了 RabbitMQ”而用。
4. **加入审计日志与操作留痕**：管理员改排课、补课、扣课、退款、禁用学员/教练都应有操作审计，便于追责。
5. **完善 Docker/K8s 安全基线**：检查镜像非 root 运行、只读根文件系统、secret 挂载方式、探针、资源限制和日志输出。
6. **建立配置分级**：区分 `application.yml` 默认配置、环境覆盖、机密配置、第三方密钥配置，并形成 README-CONFIG 的最终规范版。

## 7. 今日建议深入阅读的 3 个项目

1. **`ruoyi-vue-pro`**
   原因：与你当前单体 Spring Boot + MyBatis-Plus 路线最接近，同时权限、模块化、测试、文档都更成熟。
2. **`RuoYi-Vue-Plus`**
   原因：比大而全平台更轻，适合直接对照你项目做认证授权与工程治理改造。
3. **`mall`**
   原因：虽然是电商，但在会员、余额、状态流转、缓存、异步通知和 Docker 部署方面，对“预约 + 课时账户 + 通知”的生产化最有借鉴意义。

## 8. 检索关键词、检索时间与不确定性

### 8.1 检索关键词

- `Spring Boot MyBatis Plus RBAC backend`
- `Spring Boot training management system`
- `Spring Boot club management`
- `Spring Boot appointment booking management`
- `Spring Boot membership system`
- `Spring Boot mall admin system`

### 8.2 检索时间

- 本次 GitHub 与本地代码核验时间：`2026-06-23 11:15:05 CST`

### 8.3 数据不确定性说明

- Stars / forks / commit / release 数据来自 2026-06-23 当天可访问的 GitHub 页面，可随时间变化。
- 少数项目的“最近活跃时间”使用了 release 日期而非 commit 日期，原因是公开页面上 release 信息更稳定、可直接核验。
- 本次报告优先筛选“可直接借鉴后端架构”的项目，因此保留了部分业务域不完全相同但工程价值明显更高的平台型项目。
- `renren-fast` 这类经典项目因为 GitHub 公开仓库活跃度和维护重心迁移明显下降，本次未列入 Top 10。

## 9. 结论

对 `ping-smart-club-web-boot` 来说，今天最重要的不是继续堆业务接口，而是先补齐三件事：

1. **把认证授权做成可上线的正式能力**。
2. **把预约/候补/课时账户做成有约束、有幂等、有留痕的一致性链路**。
3. **把当前“按技术层平铺”的代码结构，收敛成按领域分包的可演进单体**。

只要这三件事到位，你的项目就能从“第一阶段可用原型”进入“可长期维护的正式后端”。
