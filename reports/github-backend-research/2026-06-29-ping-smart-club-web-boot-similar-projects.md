# 2026-06-29 GitHub 相似后端项目架构调研报告：ping-smart-club-web-boot

检索时间：2026-06-29 11:15 CST  
本地基准路径：`/Users/bytedance/Documents/project/ping-smart-club/ping-smart-club-web-boot`  
本次调研对象：Spring Boot / MyBatis-Plus / MySQL / RBAC / 管理后台 / 会员、预约、培训、教务、商城、CRM、ERP 等相近后端项目  
说明：本次优先读取本地完整源码；本地基准为当前工作区可见状态，包含未提交改动。外部项目未逐仓克隆和编译，GitHub 指标以本次可访问的 GitHub 仓库页、API、commits、release、README 为准；部分 GitHub 页面只展示约数，表格中用“约”标识。

## 一、当日调研摘要

### 1. 本项目当前后端架构状态

`ping-smart-club-web-boot` 今天可见状态已经不是纯 CRUD 原型，第一阶段业务主链路较完整：

- 技术栈：Java 17、Spring Boot 3.5.9、Spring Web、MyBatis-Plus 3.5.5、MySQL 8.0.33、HikariCP、Lombok、Validation、SpringDoc OpenAPI 2.2.0、Logback。
- 预留但未正式启用：Spring Security 依赖和配置被注释，Redis / RabbitMQ 在 `pom.xml` 中被注释；`application-dev.yml` / `application-prod.yml` 和 Docker Compose / K8s 里已有 Redis、RabbitMQ 配置。
- 代码分层：`auth`、`common`、`config`、`controller`、`service`、`mapper`、`dto`、`pojo` 分层清晰；Controller 覆盖鉴权、学员、教练、课程、场地、排课、预约/候补、课时账户、考勤、通知、统计。
- 鉴权：当前使用 `AuthInterceptor + @RequireRole + TokenStore + psc_auth_session`，Token 摘要落库，支持过期、吊销和服务重启后的校验。
- 密码：`PasswordService` 使用 PBKDF2-HMAC-SHA256，历史明文密码可首次登录后迁移；新增教练/学员仍会生成默认密码 `123456`。
- 并发一致性：排课冲突使用 `select ... for update` 检查教练/场地时间重叠；预约使用 `active_key` 唯一键防重复；课时账户使用行锁，课时流水有 `biz_no` 幂等唯一键。
- 数据库脚本：`sql/ping-smart-club-phase1.sql` 已含 `psc_user`、`psc_auth_session`、`psc_student`、`psc_coach`、`psc_course_schedule`、`psc_booking`、`psc_waitlist_entry`、`psc_lesson_account`、`psc_lesson_transaction`、`psc_attendance_record`、`psc_notification_record` 等核心表和索引；`phase1-hardening.sql` 包含会话、密码、预约唯一键、课时流水幂等加固。
- 部署：已有 Dockerfile、`docker-compose.yml`、K8s `deployment/configmap/secret/ingress`；探针使用 `/api/test/health`，生产密钥通过占位符注入。

当前短板集中在生产化权限、安全、边界建模和验证体系：

- Spring Security 尚未启用，当前只有粗粒度角色注解，缺少菜单/按钮/接口权限、数据权限、登录限流、刷新 Token、Token 轮换、全局会话清理任务。
- Controller 仍有直接接收或返回 POJO 的接口，例如排课接口直接接收 `CourseSchedule`，DTO / VO / Entity 边界不够严格。
- 并发链路已有行锁和唯一键基础，但候补 `queueNo = size() + 1` 在并发下仍可能产生队列号竞争；候补记录也缺少类似 `active_key` 的唯一约束。
- 课时账户已有流水和幂等号，但还需要围绕购买、赠送、冻结、退款、取消预约是否返还课时等建立更完整的账本状态机。
- 当前未发现 `src/test` 下测试文件，排课冲突、重复预约、候补晋级、消课幂等、权限拦截都缺少自动化回归。
- `application.yml` 中 MyBatis 二级缓存打开、Swagger 在生产配置仍可启用、Docker Compose 有开发默认密码，生产环境需要更明确的安全开关。

### 2. 今日 Top 10 总体特征

今天筛选后的项目不是按 star 排序，而是按技术栈相似度、业务可迁移性、工程质量、维护活跃度、社区热度和文档部署测试完整度综合评分。Top 10 主要分三类：

- 通用 RBAC / 快速开发平台：`RuoYi-Vue-Pro`、`SmartAdmin`、`JeecgBoot`、`RuoYi-Vue-Plus`、`Pig`、`lamp-cloud`、`RuoYi-Cloud-Plus`。参考价值集中在权限模型、菜单/按钮权限、数据权限、代码分层、审计日志、统一错误码、代码生成和多租户。
- 商城 / 会员 / 交易型后端：`mall`、`mall-swarm`。虽然不是体育培训业务，但会员、订单、库存、支付、账务、幂等、Docker/K8s、搜索与消息等能力可映射到学员、课时账户、预约和通知。
- 教育培训领域：`roncoo-education`。它是在线教育/培训平台，业务领域最贴近教务和课程管理，但微服务形态、AGPL-3.0 许可证和商业限制需要谨慎评估。

### 3. 最值得关注的方向

1. 权限认证生产化：优先参考 `RuoYi-Vue-Pro`、`SmartAdmin`、`Pig`，把当前 `@RequireRole` 升级到角色、权限点、数据范围、登录风控、操作日志和会话治理。
2. 预约/课时一致性：借鉴商城项目的订单幂等、库存扣减、状态机和流水账思想，把预约、候补、消课、取消、退款/返课做成明确的状态流。
3. 工程化补齐：参考 `SmartAdmin` 和 `mall-swarm` 的环境配置、部署文档、监控、Swagger/OpenAPI、Docker/K8s 分层，补测试和生产安全开关。

## 二、本项目基准画像

### 1. 技术栈和依赖

| 维度 | 当前状态 |
| --- | --- |
| JDK / 框架 | Java 17，Spring Boot 3.5.9 |
| Web | Spring MVC / Spring Web |
| ORM | MyBatis-Plus 3.5.5，Mapper 继承 `BaseMapper`，部分关键 SQL 用注解 `@Select` |
| 数据库 | MySQL 8.0.33，HikariCP |
| 校验与文档 | Spring Validation，SpringDoc OpenAPI / Swagger UI |
| 日志 | Logback，按 dev/prod profile 区分日志级别，异步文件日志和错误日志 |
| 安全 | 自研拦截器 + Token 落库；Spring Security 预留但未启用 |
| 缓存 / 消息 | Redis、RabbitMQ 配置和基础类存在，但依赖注释，当前不是运行时能力 |
| 部署 | Dockerfile、docker-compose、K8s deployment/configmap/secret/ingress |

### 2. 代码分层

| 包 | 作用 | 当前观察 |
| --- | --- | --- |
| `auth` | 登录态、角色、上下文、Token、密码 | `AuthInterceptor`、`AuthContext`、`TokenStore`、`PasswordService` 已形成独立认证层 |
| `common` | 统一响应、错误码、异常 | `ApiResponse`、`ErrorCode`、`BusinessException`、`GlobalExceptionHandler` 已具备统一错误封装和 traceId |
| `config` | Web、Swagger、MyBatis、Redis、RabbitMQ、安全预留 | Security 仍注释；WebMvc 拦截器负责认证 |
| `controller` | REST API | 业务覆盖较全，部分接口直接暴露 POJO |
| `service` | 业务服务 | 排课、预约、课时、通知等业务规则主要在 Service |
| `mapper` | MyBatis-Plus 数据访问 | 除 BaseMapper 外，对行锁和冲突检查使用注解 SQL |
| `dto` | 请求/响应对象 | 已有 DTO，但还未完全替代 POJO 入参和实体出参 |
| `pojo` | 数据库实体 | 与 `psc_*` 表基本对应 |

### 3. 业务模块

- 登录鉴权：管理员、教练、学员/家长登录；`/auth/me`；退出登录。
- 基础档案：学员、教练、场地、课程类型、课程产品。
- 教练排班：教练可授课时间、请假、课表查询。
- 排课：创建、编辑、取消、调换教练、按日期/教练/场地/状态查询。
- 预约候补：可预约课程、创建预约、取消、候补、后台列表、管理员/教练确认消课。
- 课时账户：账户余额、调整、课时流水、消课幂等。
- 考勤：教练签到、学员签到、后台确认、考勤列表。
- 通知：系统通知记录。
- 统计：后台 summary。

### 4. 当前架构短板

1. 权限粒度停留在角色级，缺少权限点、菜单、按钮、数据范围和资源所有权校验。
2. 自研 Token 缺少刷新 Token、短期 access token、设备维度会话、登录失败限制、会话清理任务。
3. 默认密码 `123456` 和历史明文兼容仍存在生产安全窗口，需要强制改密和密码策略。
4. DTO / VO / Entity 边界不完整，排课等接口直接使用 POJO，后续扩展字段和权限字段时容易泄露或误写。
5. 候补队列并发风险未完全消除，`queueNo` 生成和候补唯一性应有数据库约束或单独序列策略。
6. 排课冲突靠行锁查询已有记录，建议补充业务锁、日历槽位模型或更强约束以覆盖空区间并发插入。
7. 课时账户流水已有幂等基础，但购买、赠送、冻结、退款、取消返还、过期等账务场景还未形成完整账本模型。
8. Redis/RabbitMQ 配置与依赖状态不一致，启用时机、消息幂等、重试和死信策略需要先设计。
9. 当前未发现测试文件，缺少业务并发、权限和数据一致性回归。
10. 生产 Swagger、默认密码、Secret 占位符、健康检查路径和日志敏感字段需要统一安全基线。

## 三、评分模型

总分 100，沿用用户要求的六项维度：

| 维度 | 分值 | 评分依据 |
| --- | ---: | --- |
| 技术栈相似度 | 25 | Spring Boot 3/4、Java 17、MyBatis/MyBatis-Plus/JPA、MySQL/PostgreSQL、REST、OpenAPI、Docker/K8s、Redis/MQ |
| 业务范围/领域相似度 | 20 | RBAC 管理后台、会员、课程、订单、教务、预约、培训、门店/CRM/ERP 可迁移程度 |
| 架构清晰度与工程化质量 | 20 | 模块边界、分层、认证授权、统一异常、日志审计、配置、代码规范、可扩展性 |
| 维护活跃度 | 15 | 最近提交、release、README 更新、issue/PR 活动 |
| 社区热度 | 10 | stars、forks、watchers、生态影响力 |
| 文档/部署/测试完整度 | 10 | README、官方文档、部署脚本、Docker/K8s、SQL、示例、测试可见度 |

评分不是 star 排名；star 高但业务/架构迁移价值有限会降分，领域贴近但许可证或商业限制明显也会降分。

## 四、Top 10 项目总表

| 排名 | 项目 | 综合评分 | Stars / Forks | 最近活跃时间 | 许可证 | 技术栈 | 业务范围 | 相似点 | 主要参考价值 |
| ---: | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) | 92 | 37,978 / 8,226 | API 显示 pushed 2026-06-26；commit 页可见 2026-06-07 | MIT | Spring Boot、MyBatis-Plus、Spring Security、Redis、Vue、Flowable | RBAC、SaaS、商城、CRM、ERP、工作流、支付、短信、小程序 | 栈和管理后台形态高度相似 | 权限、数据权限、多模块边界、OpenAPI、业务扩展 |
| 2 | [1024-lab/smart-admin](https://github.com/1024-lab/smart-admin) | 89 | 约 3.7k / 992 | release v3.30.0：2026-03-02 | MIT | Spring Boot 2/3、Java 8/17、Sa-Token、MyBatis-Plus、Vue3、Vite | 高质量后台管理、移动端、日志、监控、安全体系 | Java17 + Boot3 + Sa-Token + MyBatis-Plus 与本项目很接近 | 代码规范、四层架构、安全风控、返回码、日志审计 |
| 3 | [macrozheng/mall](https://github.com/macrozheng/mall) | 86 | 83,932 / 29,706 | API 显示 pushed 2026-05-14；commit 页可见 2026-03-06 | Apache-2.0 | Spring Boot、MyBatis、MySQL、Redis、RabbitMQ、Elasticsearch、Docker、Swagger | 电商、会员、订单、库存、营销、权限、统计 | 会员/账户/订单流可映射到学员/课时/预约 | 订单状态机、幂等、支付/库存、Docker 部署、模块组织 |
| 4 | [jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot) | 85 | 46,836 / 16,060 | API 显示 pushed 2026-06-19；commit 页可见 2026-05-18 | Apache-2.0 | Spring Boot、Spring Cloud、MyBatis-Plus、Vue3、Flowable、AI/低代码 | 低代码、表单、流程、权限、报表、AI 应用 | 后台权限和业务快速生成能力相似 | 代码生成、表单/流程、字典、租户、接口/数据权限 |
| 5 | [dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus) | 84 | 约 2.3k / 658 | commit 页可见 2026-04-24 | MIT | Spring Boot、Sa-Token、MyBatis-Plus、SpringDoc、WarmFlow、Hutool、OSS | 多租户后台管理、工作流、权限、代码生成 | 与本项目单体 Boot + MyBatis-Plus 演进路线接近 | Sa-Token、权限注解、数据权限、异常安全、依赖升级 |
| 6 | [pig-mesh/pig](https://github.com/pig-mesh/pig) | 82 | 约 6.7k / 1.1k | release 4.0.0：2026-06-05 | Apache-2.0 | Spring Cloud 2025、Spring Boot 4、OAuth2 Authorization Server、MyBatis-Plus、Vue3 | RBAC 权限、认证中心、网关、UPMS、监控、任务 | 权限认证生产化和单体/微服务兼容有参考价值 | OAuth2、Authorization Server、UPMS、Docker Compose、可观测性 |
| 7 | [macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm) | 81 | 约 13k / 5.5k | README 指向 Boot 3.5 分支；commits 页本次可访问但未展示最新摘要 | Apache-2.0 | Spring Cloud 2025 & Alibaba、Spring Boot 3.5、Sa-Token、MyBatis、Elasticsearch、Docker、K8s | 微服务商城、认证中心、网关、监控、商品、订单、搜索 | 交易型业务、消息、缓存、部署体系可迁移 | 微服务拆分、网关认证、搜索、Docker/K8s、订单/库存一致性 |
| 8 | [dromara/lamp-cloud](https://github.com/dromara/lamp-cloud) | 79 | 约 5.8k / 1.8k | README 标注 java17/5.x 持续开发；页面可见 1,177 commits | Apache-2.0 | Spring Cloud、Java 17/21、OAuth、MyBatis-Plus、多租户、多数据源 | 中后台快速开发、多租户、开放平台、系统管理 | 权限、租户、组织/字典/日志等后台基础能力相似 | 租户隔离、开放平台、工程规范、CI/Jenkins、Security 文档 |
| 9 | [dromara/RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus) | 78 | 约 1.2k / 0.38k | commit 页可见 2026-04-28 | MIT | Spring Cloud Alibaba、Dubbo 3、Sa-Token、MyBatis-Plus、MQ、WarmFlow、ES、Docker | 微服务通用权限管理、网关、认证、工作流、多数据源 | 当前项目未来多门店/多实例/消息化演进可参考 | 网关、分布式会话、消息、数据权限、运维治理 |
| 10 | [roncoo/roncoo-education](https://github.com/roncoo/roncoo-education) | 77 | 约 1.5k / 约 0.6k | 页面可见 1,881 commits；README 为 2026 技术栈 | AGPL-3.0，README 有商用限制提示 | Spring Cloud Alibaba 2025、MySQL 8、Nacos、Seata、MyBatis、Druid、Vue3/Nuxt3 | 在线教育、课程点播、考试、题库、任务、知识付费 | 培训/课程业务领域最接近 | 教育业务模块划分、课程内容、学习路径、教务/运营后台 |

## 五、候选项目详细分析

### 1. YunaiV/ruoyi-vue-pro

链接：[https://github.com/YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)

- 业务范围：后台管理、SaaS 多租户、RBAC、数据权限、工作流、CRM、ERP、商城、支付、短信、小程序、IoT、AI 等，覆盖面远超本项目。
- 模块边界：典型多模块后端结构，平台基础能力与业务模块分离，适合参考“系统能力层 + 业务域层”的组织方式。
- 认证授权：Spring Security、RBAC、菜单/按钮权限、数据权限、多租户权限是核心参考点。
- 数据访问：MyBatis-Plus + MySQL/Redis，配合代码生成和数据权限扩展。
- 事务/并发/冲突处理：不直接是排课预约系统，但商城、支付、流程、编号生成、消息队列中的幂等和状态流可映射到预约、课时流水和候补晋级。
- 缓存/消息/异步任务：Redis、Redisson、消息和定时任务能力丰富，适合本项目未来通知、排课提醒、Token 清理、统计异步化。
- 接口文档：官方文档和 OpenAPI/Swagger 体系完整。
- 部署运维：文档、环境配置、第三方组件说明较完整。
- 测试策略：本次未逐仓执行测试；从代码体量和文档看工程化成熟，但需要克隆后再判断测试覆盖质量。
- 架构优点：业务面广、权限能力强、模块边界清楚、与本项目技术栈高度重合。
- 局限或风险：功能面过宽，直接照搬会导致小型俱乐部系统复杂度膨胀。
- 对本项目借鉴点：优先学习权限中心、菜单/按钮权限、数据权限、统一字典、操作日志、OpenAPI 分组和业务模块包划分。

### 2. 1024-lab/smart-admin

链接：[https://github.com/1024-lab/smart-admin](https://github.com/1024-lab/smart-admin)

- 业务范围：高质量中后台平台，含系统管理、日志、监控、代码生成、移动端、数据变更记录、安全体系。
- 模块边界：README 明确强调四层架构 `controller / service / manager / dao`，这对本项目拆出领域服务和基础设施服务很有参考价值。
- 认证授权：Sa-Token，支持登录限制、密码复杂度、登录错误锁定、双因子、数据脱敏、接口加解密等安全能力。
- 数据访问：MyBatis-Plus，支持主流数据库和国产数据库。
- 事务/并发/冲突处理：不是预约领域，但它的数据变更记录、防重复提交、SQL 注入防护、返回码体系适合后台管理。
- 缓存/消息/异步任务：以平台能力为主，适合参考登录态、缓存和日志审计设计。
- 接口文档：有官方文档、在线预览和版本发布记录。
- 部署运维：多环境配置、日志、心跳、监控、单号生成器等能力对本项目生产化有直接价值。
- 测试策略：本次未逐仓克隆；README 强调代码规范和企业使用验证，但测试覆盖需要后续确认。
- 架构优点：对“安全、简洁、高质量代码”的取舍很适合当前项目阶段。
- 局限或风险：平台能力偏通用，不提供俱乐部排课/预约领域模型。
- 对本项目借鉴点：把当前 `auth/common/config` 抽象为更稳定的平台层；引入登录错误锁定、密码策略、操作日志、返回码维护和 manager 层。

### 3. macrozheng/mall

链接：[https://github.com/macrozheng/mall](https://github.com/macrozheng/mall)

- 业务范围：前台商城和后台管理，含商品、订单、会员、促销、运营、内容、统计、财务、权限、设置。
- 模块边界：单体商城后端，模块围绕商品、订单、会员、权限、统计划分，业务代码参考价值高。
- 认证授权：Spring Security + JWT/权限管理，适合对照本项目自研 Token 方案。
- 数据访问：Spring Boot + MyBatis + MySQL，另有 Redis、RabbitMQ、Elasticsearch、MongoDB 等扩展。
- 事务/并发/冲突处理：订单、库存、支付、促销和会员积分可以类比本项目的预约名额、课时账户和通知；幂等与状态机思想很值得借鉴。
- 缓存/消息/异步任务：Redis、RabbitMQ、ELK、Elasticsearch 组合完整，适合未来从同步通知演进到异步事件。
- 接口文档：Swagger UI、学习教程、演示环境和后台管理说明齐全。
- 部署运维：Docker 容器化部署成熟，文档较完整。
- 测试策略：本次未执行；从项目历史和文档看部署可复现性较好，测试覆盖仍需克隆验证。
- 架构优点：真实业务复杂度高，订单、库存、会员和财务链路可迁移到课时账户与预约。
- 局限或风险：电商领域与体育培训不同，不能直接复用业务模型。
- 对本项目借鉴点：建立预约状态机、课时流水账、通知事件、后台统计和 Docker 部署样板。

### 4. jeecgboot/JeecgBoot

链接：[https://github.com/jeecgboot/JeecgBoot](https://github.com/jeecgboot/JeecgBoot)

- 业务范围：低代码/零代码平台，含表单、流程、报表、大屏、AI、权限、代码生成、知识库等。
- 模块边界：平台化和低代码能力强，适合参考“元数据驱动 + 业务扩展”的边界，但不宜一次性引入。
- 认证授权：通用后台权限、菜单、数据字典和流程权限能力较完整。
- 数据访问：Spring Boot / Spring Cloud + MyBatis-Plus，适合快速生成 CRUD 和后台表单。
- 事务/并发/冲突处理：核心不是预约冲突；可参考流程、表单、版本升级和安全漏洞修复的工程治理。
- 缓存/消息/异步任务：平台组件多，适合中长期作为“可配置后台”的参考。
- 接口文档：官网、演示、README、低代码说明完整。
- 部署运维：生态文档较多，但组件复杂度也高。
- 测试策略：本次未逐仓克隆；需要后续单独检查测试和低代码生成物质量。
- 架构优点：代码生成、表单配置、流程和权限生态强。
- 局限或风险：低代码和 AI 能力会显著提高系统复杂度，不适合当前小步迭代阶段直接照搬。
- 对本项目借鉴点：课程类型、通知模板、字典、统计报表可先用轻量元数据配置，不急于引入完整低代码框架。

### 5. dromara/RuoYi-Vue-Plus

链接：[https://github.com/dromara/RuoYi-Vue-Plus](https://github.com/dromara/RuoYi-Vue-Plus)

- 业务范围：重写 RuoYi-Vue 的多租户后台管理系统，含 RBAC、租户、工作流、OSS、代码生成等。
- 模块边界：单体后台平台路线清晰，适合当前项目从自研拦截器演进到平台式权限管理。
- 认证授权：Sa-Token + 权限注解，比当前 `@RequireRole` 更丰富，可参考登录、角色、权限、二级认证、忽略校验。
- 数据访问：MyBatis-Plus、SpringDoc、Hutool，和本项目栈接近。
- 事务/并发/冲突处理：不直接处理排课预约；可参考分布式幂等、异常不泄漏、Token 日志截断等安全修复。
- 缓存/消息/异步任务：Redisson、队列、工作流和任务组件可作为中期能力储备。
- 接口文档：文档站和 README 可见，MIT 协议。
- 部署运维：相对完整，适合参考配置分层和升级策略。
- 测试策略：本次未执行；commit 记录显示持续做依赖升级和安全修复。
- 架构优点：Spring Boot 3、Java 17、MyBatis-Plus、Sa-Token 路线与本项目高度兼容。
- 局限或风险：多租户、工作流和插件化对当前项目可能偏重。
- 对本项目借鉴点：先吸收 Sa-Token 风格权限点、数据权限、Token 安全日志、重复提交防护、异常脱敏。

### 6. pig-mesh/pig

链接：[https://github.com/pig-mesh/pig](https://github.com/pig-mesh/pig)

- 业务范围：企业级 RBAC 快速开发平台，支持微服务和单体模式，含认证中心、网关、UPMS、监控、代码生成、定时任务。
- 模块边界：`pig-auth`、`pig-upms`、`pig-common`、`pig-gateway`、`pig-boot` 分层清晰，适合参考认证与业务服务分离。
- 认证授权：Spring Authorization Server / OAuth2，是本次候选中对生产级认证最有参考价值的项目之一。
- 数据访问：MyBatis-Plus、PostgreSQL/SQL、Nacos、Redis 等，Spring Boot 4 版本较新。
- 事务/并发/冲突处理：不覆盖预约冲突，但其认证、网关、日志和安全公共包适合中长期架构。
- 缓存/消息/异步任务：公共包中包含缓存、日志、Sentinel、Feign、Excel、XSS 等能力。
- 接口文档：README 和官方文档清楚，提供微服务和单体启动方式。
- 部署运维：Docker Compose、本地编排、Nacos、网关和监控说明明确。
- 测试策略：本次未执行；需要后续检查 OAuth2、UPMS 模块测试。
- 架构优点：认证生产化强，单体/微服务双模式对本项目未来演进友好。
- 局限或风险：Spring Boot 4 与本项目 Spring Boot 3.5.9 有版本差异，引入成本高于 Sa-Token 类项目。
- 对本项目借鉴点：学习 access token / refresh token、授权服务器、资源服务、UPMS、网关鉴权，而不是短期整体迁移。

### 7. macrozheng/mall-swarm

链接：[https://github.com/macrozheng/mall-swarm](https://github.com/macrozheng/mall-swarm)

- 业务范围：微服务商城，含认证中心、网关、后台管理、商品、订单、搜索、监控、配置中心。
- 模块边界：`mall-auth`、`mall-gateway`、`mall-admin`、`mall-portal`、`mall-search`、`mall-monitor`、`mall-common` 等结构清楚。
- 认证授权：README 显示新分支采用 Spring Boot 3.5、Spring Cloud 2025、Sa-Token。
- 数据访问：MyBatis、MyBatis Generator、MySQL，结合 Elasticsearch、Docker、Kubernetes。
- 事务/并发/冲突处理：商品库存和订单状态机可映射到预约名额、候补和课时扣减；微服务下更重视幂等和消息一致性。
- 缓存/消息/异步任务：商城搜索、消息、网关和监控体系完整。
- 接口文档：教程、演示、系统架构图、业务架构图和组织结构说明完整。
- 部署运维：Docker、Kubernetes、Spring Cloud 组件说明是重点参考。
- 测试策略：本次未执行；需要克隆后验证测试目录和集成测试。
- 架构优点：业务复杂且部署体系成熟，适合本项目中长期多服务拆分参考。
- 局限或风险：微服务复杂度高，当前阶段不宜过早拆分。
- 对本项目借鉴点：先借鉴事件驱动、通知异步化、监控和 Docker/K8s；微服务拆分放到多门店或并发规模上来后。

### 8. dromara/lamp-cloud

链接：[https://github.com/dromara/lamp-cloud](https://github.com/dromara/lamp-cloud)

- 业务范围：中后台快速开发平台，专注多租户、开放平台、非 SaaS 普通项目基础框架。
- 模块边界：包含 `lamp-base`、`lamp-gateway`、`lamp-generator`、`lamp-oauth`、`lamp-system`、`lamp-support` 等，平台层和业务基础层边界明显。
- 认证授权：OAuth / 权限体系、多租户隔离、开放平台能力。
- 数据访问：MyBatis-Plus、多数据源/租户隔离，支持 Java 17/21 分支。
- 事务/并发/冲突处理：更多是平台治理，不直接覆盖预约；可参考租户隔离、数据源隔离和开放 API 安全。
- 缓存/消息/异步任务：中后台平台常见组件较全，适合未来多门店、多租户、多端接入。
- 接口文档：官网、README、分支说明、安全文档、Jenkinsfile 可见。
- 部署运维：CI / 安全文档 / 分支策略值得参考。
- 测试策略：本次未执行；测试覆盖需要后续克隆判断。
- 架构优点：平台工程化和租户隔离能力强。
- 局限或风险：多租户和开放平台对当前单俱乐部版本偏重。
- 对本项目借鉴点：当系统支持多俱乐部/多门店时，优先参考其租户隔离、开放接口、平台基础模块设计。

### 9. dromara/RuoYi-Cloud-Plus

链接：[https://github.com/dromara/RuoYi-Cloud-Plus](https://github.com/dromara/RuoYi-Cloud-Plus)

- 业务范围：微服务通用权限管理系统，重写 RuoYi-Cloud，含认证、网关、模块服务、工作流、消息、搜索、Docker。
- 模块边界：`ruoyi-auth`、`ruoyi-gateway`、`ruoyi-modules`、`ruoyi-common`、`ruoyi-api`、`ruoyi-visual` 等边界清晰。
- 认证授权：Sa-Token、JWT、权限注解、数据权限，和本项目当前 RBAC 演进方向一致。
- 数据访问：MyBatis-Plus、多数据源、HikariCP、SQL 监控等能力较强。
- 事务/并发/冲突处理：框架层强调分布式事务、幂等、消息队列、异步任务，可用于预约消息化后的设计。
- 缓存/消息/异步任务：Redis/Redisson、Kafka/RocketMQ/RabbitMQ、SnailJob、工作流、ES 等能力丰富。
- 接口文档：SpringDoc、文档站、README 对比表丰富。
- 部署运维：Nacos、网关、服务治理、日志、搜索、消息、对象存储等完整。
- 测试策略：本次未逐仓执行；commit 页显示 2026-04 仍在安全和依赖修复。
- 架构优点：对分布式治理描述细，适合长期路线图。
- 局限或风险：远超当前项目复杂度，短期引入会拖慢业务迭代。
- 对本项目借鉴点：把它作为中长期“多实例 + 网关 + 消息 + 分布式任务”的技术路线参考，不作为近期重构模板。

### 10. roncoo/roncoo-education

链接：[https://github.com/roncoo/roncoo-education](https://github.com/roncoo/roncoo-education)

- 业务范围：在线教育、课程点播、直播、考试、题库、任务、知识付费、课程附件和 AI 课程内容生成。
- 模块边界：可见 `roncoo-education-common`、`roncoo-education-feign`、`roncoo-education-gateway`、`roncoo-education-service` 等模块。
- 认证授权：README 侧重教育业务和 Spring Cloud 后端，权限细节需后续克隆源码确认。
- 数据访问：Spring Cloud Alibaba 2025、MySQL 8、Nacos、Seata、MyBatis、Druid。
- 事务/并发/冲突处理：在线教育不等同于体育场地预约，但课程、任务、学习进度、订单/知识付费与本项目课程/课时/教务后台相关。
- 缓存/消息/异步任务：分布式教育平台通常涉及任务、课程内容和异步处理，具体实现需源码确认。
- 接口文档：README、演示地址、源码地址和公众号资料说明丰富。
- 部署运维：有后端、门户、管理端分仓说明；部署细节需进一步阅读官方资料。
- 测试策略：本次未执行。
- 架构优点：业务领域最贴近“培训/教务/课程管理”，可帮助本项目补课务模型。
- 局限或风险：AGPL-3.0 且 README 有商用限制提示，商业复用必须谨慎；微服务形态也偏重。
- 对本项目借鉴点：课程体系、学习任务、教务运营后台、内容生产和教育业务术语，不建议直接复用代码。

## 六、对 ping-smart-club-web-boot 的架构建议

### 近期可落地（1-2 周）

1. **把权限从角色升级为权限点。** 保留 `@RequireRole` 兼容层，新增 `@RequirePermission("schedule:create")`、`@RequirePermission("booking:complete")` 这类权限点；数据库增加菜单/权限/角色权限表，先覆盖后台核心接口。参考 `RuoYi-Vue-Pro`、`SmartAdmin`、`RuoYi-Vue-Plus`。
2. **补登录安全基线。** `PasswordService` 已有 PBKDF2，可继续增加密码复杂度、首次登录强制改密、默认密码过期、登录失败次数锁定、同账号会话列表和一键踢下线。`TokenStore` 增加定期清理 `EXPIRED` 会话和设备/IP/User-Agent 字段。
3. **收紧 DTO / VO / Entity 边界。** 排课、教练、场地、课时账户接口避免直接接收或返回 POJO；新增 request/response DTO，敏感字段和内部字段不出现在 API 响应里。
4. **修补候补并发约束。** 为 `psc_waitlist_entry` 增加活跃唯一键或唯一索引，例如 `(schedule_id, student_id, status_active)` 的等价设计；`queueNo` 不再用 `size()+1`，改为在同一排课行锁下取 `max(queue_no)+1`，或使用单独序列表。
5. **补最小自动化测试。** 先做 8-10 个服务层/集成测试：排课教练冲突、场地冲突、重复预约、容量满、候补晋级、取消预约、消课幂等、余额不足、Token 失效、角色越权。
6. **生产配置安全开关。** `prod` 默认禁用 Swagger UI 或加鉴权；移除 Compose 开发默认密码在生产环境的误用路径；K8s Secret 保留占位符但文档写明由 CI/CD 或 Secret Manager 注入。

### 中期演进（2-6 周）

7. **建立预约和课时状态机。** 预约状态明确 `BOOKED -> COMPLETED/CANCELLED/ABSENT`、`WAITING -> BOOKED/CANCELLED/EXPIRED`，并规定每个迁移是否扣课、返课、通知、释放名额。课时流水增加业务类型枚举和来源单据，减少自由字符串。
8. **抽出领域服务边界。** 在 `BookingService` 中拆出 `BookingCapacityService`、`WaitlistService`、`LessonLedgerService`、`NotificationEventService`，避免一个 Service 同时管容量、候补、课时和通知。
9. **为排课冲突引入更强一致性策略。** 当前 `select ... for update` 锁住已有冲突记录，但两个并发请求都未命中已有冲突时仍需谨慎；可按教练/场地/日期建立资源锁表，或把课程时间切成可控时间槽后用唯一键约束。
10. **按使用场景启用 Redis / RabbitMQ。** Redis 优先用于登录失败计数、短期验证码、防重复提交、热点课程余位缓存；RabbitMQ 优先用于通知发送、候补晋级通知、课后统计。启用前先设计消息幂等和死信队列。
11. **补 OpenAPI 分组和错误码治理。** 按 `auth/admin/coach/miniapp` 分组；所有业务异常必须走 `ErrorCode`，错误码文档和前端展示文案同步维护。
12. **数据库索引和约束复核。** 重点检查 `psc_course_schedule(coach_id,start_time,end_time)`、`psc_course_schedule(venue_id,start_time,end_time)`、`psc_booking(schedule_id,status)`、`psc_waitlist_entry(schedule_id,status,queue_no)` 是否覆盖真实查询；为状态枚举、课时变更、会话过期建立必要索引和唯一约束。

### 长期优化（6 周以上）

13. **评估 Spring Security / Sa-Token / OAuth2 的路线。** 如果目标是轻量单体，Sa-Token 风格更快；如果未来要多端开放 API、第三方小程序、合作机构接入，可参考 `Pig` 引入 OAuth2 Authorization Server。
14. **多俱乐部/多门店租户模型预留。** 当前 SQL 还偏单俱乐部，长期应在学员、教练、场地、课程、订单/课时、用户会话中统一引入 `club_id` / `tenant_id`，并配套数据权限。
15. **运维观测体系。** 引入 Actuator、结构化日志、traceId 贯穿请求、慢 SQL、登录审计、关键业务审计；K8s 探针从 `/api/test/health` 迁移到受控健康端点。
16. **持续交付和安全扫描。** Dockerfile 不跳过测试作为生产默认，CI 执行单测、集成测试、镜像扫描、依赖漏洞扫描；Secret 使用 SealedSecret、External Secrets 或云厂商 Secret Manager。

## 七、今日建议深入阅读的项目

1. [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)：技术栈和后台业务最接近，优先阅读权限、数据权限、系统管理、操作日志、字典和 OpenAPI 组织方式。
2. [1024-lab/smart-admin](https://github.com/1024-lab/smart-admin)：重点看四层架构、安全体系、登录限制、返回码、数据变更记录和代码规范，适合本项目近期生产化。
3. [roncoo/roncoo-education](https://github.com/roncoo/roncoo-education)：业务领域最贴近培训/课程/教务，适合阅读课程、任务、运营后台边界；但受 AGPL-3.0 和商用限制影响，不建议直接复用代码。

## 八、排除或降权说明

- `yangzongzhuan/RuoYi-Vue`：官方 RuoYi 仍有 RBAC 和 Spring Security/JWT 参考价值，但本次 Top 10 优先选择更贴近 Spring Boot 3/4、Sa-Token/MyBatis-Plus 和近期工程化演进的 Plus / Pro 项目。
- `elunez/eladmin`：RBAC、JPA、Spring Security、数据权限和代码生成参考价值仍在，但主线是 Spring Boot 2.7 + JPA，与本项目 MyBatis-Plus / Spring Boot 3.5 的直接相似度低于入选项目。
- 小型 gym / booking demo：检索到的同类“健身房/预约/会员”项目多为课程或毕业设计级，业务代码、文档、部署和维护信号不足，本次未纳入 Top 10。

## 九、检索关键词与数据不确定性

### 检索关键词

- `Spring Boot MyBatis-Plus Sa-Token admin RBAC GitHub`
- `Spring Boot MyBatis MySQL RBAC management system GitHub`
- `Spring Boot MyBatis education management system roncoo education`
- `Spring Boot MyBatis membership booking gym management GitHub`
- `RuoYi Vue Pro MyBatis Plus Spring Boot RBAC`
- `SmartAdmin SpringBoot3 Sa-Token Mybatis-Plus`
- `mall Spring Boot MyBatis MySQL RabbitMQ Docker`
- `Spring Cloud Alibaba education MyBatis MySQL`

### 核验来源

- GitHub 仓库页、README、commits 页面、release 信息。
- GitHub API 可访问项目：`YunaiV/ruoyi-vue-pro`、`macrozheng/mall`、`jeecgboot/JeecgBoot`。
- 本地源码：`pom.xml`、`README.md`、`src/main/java` 下 `auth/common/config/controller/service/mapper/dto/pojo`、`src/main/resources/application*.yml`、`logback-spring.xml`、`sql/`、Docker/K8s 文件。

### 不确定性说明

- GitHub 搜索结果页在本次环境中多次返回空结果或无法展开，因此候选发现采用关键词检索思路 + 直接打开仓库页/API/commits/release 交叉核验。
- stars/forks 会随时间变化；GitHub HTML 对部分项目只显示约数，例如 `3.7k`、`1.2k`，报告中已保留“约”。
- 本次未逐仓 clone、未执行外部项目测试或启动，测试策略和部署完整度按 README、目录、脚本和文档可见度评分。
- 许可证和商用限制以 GitHub 页面与 README 可见信息为准；`roncoo-education` 为 AGPL-3.0 且 README 有商用限制提示，商业参考需额外法务确认。
