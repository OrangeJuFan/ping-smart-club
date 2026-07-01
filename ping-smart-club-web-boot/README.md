# Ping Smart Club 后端第一阶段接口文档

`ping-smart-club-web-boot` 是乒乓球俱乐部管理系统后端服务。第一阶段先补齐登录鉴权、基础档案、课程场地、排课、预约、候补、课时、考勤、通知和后台统计能力。

当前实现基于 Spring Boot 3 + MyBatis-Plus。由于本地后端环境尚未安装，本次先给出代码结构和数据库 SQL，暂不执行编译和接口测试。

## 一、运行环境

- JDK 17
- Maven 3.8+
- MySQL 8.0+
- Redis、RabbitMQ、微信登录、短信通知：第一阶段预留，不强依赖

默认服务配置：

- 服务端口：`8080`
- 统一前缀：`/api`
- Swagger：`/api/swagger-ui.html`
- 数据库：`ping_smart_club`
- 第一阶段 SQL：`sql/ping-smart-club-phase1.sql`
- 已初始化库升级脚本：`sql/ping-smart-club-phase1-hardening.sql`

## 二、初始化数据库

```sql
CREATE DATABASE IF NOT EXISTS ping_smart_club
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

然后执行：

```bash
mysql -uroot -p ping_smart_club < sql/ping-smart-club-phase1.sql
```

如果数据库已经执行过旧版第一阶段 SQL，请执行加固脚本：

```bash
mysql -uroot -p ping_smart_club < sql/ping-smart-club-phase1-hardening.sql
```

内置演示账号：

| 角色 | 登录接口 | 账号/手机号 | 密码 |
| --- | --- | --- | --- |
| 管理员 | `/api/auth/admin/login` | `admin` 或 `13800000000` | `admin123` |
| 教练 | `/api/auth/coach/login` | `coach_demo` 或 `13800000001` | `123456` |
| 学员/家长 | `/api/auth/student/login` | `student_demo` 或 `13800000002` | `123456` |

说明：历史明文密码仍可登录，首次登录成功后会自动迁移为 PBKDF2 散列；新增教练或学员时，如果填写了手机号，后端会自动生成对应登录账号，默认密码为 `123456`，并直接保存为密码散列。学员优先使用家长手机号作为登录手机号。
登录 Token 不再保存在 JVM 内存里，后端会将 Token 摘要写入 `psc_auth_session`，支持服务重启后继续校验、集中吊销和后续多实例演进。

## 三、统一协议

请求头：

```http
Authorization: Bearer <token>
Content-Type: application/json
```

统一响应：

```json
{
  "code": 0,
  "errorCode": "SUCCESS",
  "message": "success",
  "data": {},
  "traceId": null
}
```

失败响应示例：

```json
{
  "code": 409,
  "errorCode": "BOOKING_DUPLICATE",
  "message": "不能重复预约同一课程",
  "data": null,
  "traceId": null
}
```

未知系统异常不会再直接返回内部异常信息，响应会包含 `traceId`，服务端日志可用该值排查。

常见错误码：

| code | 含义 |
| --- | --- |
| 400 | 参数或业务状态不合法 |
| 401 | 未登录或 Token 失效 |
| 403 | 角色无权限 |
| 404 | 数据不存在 |
| 409 | 业务冲突，例如重复预约、教练/场地时间冲突 |
| 500 | 服务异常 |

常见业务错误码：

| errorCode | 含义 |
| --- | --- |
| AUTH_INVALID_CREDENTIALS | 账号或密码错误 |
| AUTH_TOKEN_INVALID | 登录失效 |
| SCHEDULE_COACH_CONFLICT | 教练时间冲突 |
| SCHEDULE_VENUE_CONFLICT | 场地时间冲突 |
| BOOKING_DUPLICATE | 重复预约或重复候补 |
| BOOKING_CAPACITY_FULL | 课程名额已满 |
| LESSON_BALANCE_NOT_ENOUGH | 课时余额不足 |
| LESSON_TRANSACTION_DUPLICATE | 课时流水已处理 |

## 四、登录鉴权接口

### 1. 管理员登录

`POST /api/auth/admin/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

也支持手机号：

```json
{
  "phone": "13800000000",
  "password": "admin123"
}
```

### 2. 教练登录

`POST /api/auth/coach/login`

```json
{
  "phone": "13800000001",
  "password": "123456"
}
```

### 3. 学员/家长手机号登录

`POST /api/auth/student/login`

```json
{
  "phone": "13800000002",
  "password": "123456"
}
```

### 4. 当前登录人

`GET /api/auth/me`

### 5. 退出登录

`POST /api/auth/logout`

## 五、学员管理

后台接口需要管理员 Token，查询类接口允许教练查看。

### 新增学员

`POST /api/admin/students`

```json
{
  "name": "张三",
  "gender": "男",
  "age": 12,
  "phone": "13900000001",
  "level": "初级",
  "remark": "右手横拍",
  "parentName": "张女士",
  "parentPhone": "13900000002"
}
```

### 编辑学员

`PUT /api/admin/students/{id}`

### 禁用学员

`POST /api/admin/students/{id}/disable`

### 学员详情

`GET /api/admin/students/{id}`

### 学员列表

`GET /api/admin/students?keyword=张&status=ACTIVE`

### 学员课程记录

`GET /api/admin/students/{id}/course-records`

### 学员考勤记录

`GET /api/admin/students/{id}/attendance-records`

## 六、教练管理

### 新增教练

`POST /api/admin/coaches`

```json
{
  "name": "李教练",
  "phone": "13800000011",
  "qualification": "国家二级运动员",
  "courseTypes": "1对1,1对2,体验课",
  "levels": "初级,中级",
  "profile": "擅长青少年基础训练"
}
```

### 编辑教练

`PUT /api/admin/coaches/{id}`

### 禁用教练

`POST /api/admin/coaches/{id}/disable`

### 教练列表/详情

- `GET /api/admin/coaches?keyword=李&status=ACTIVE`
- `GET /api/admin/coaches/{id}`

### 维护可授课时间

`POST /api/admin/coaches/{id}/availability`

```json
{
  "weekDay": 1,
  "startTime": "09:00",
  "endTime": "12:00"
}
```

- 查询：`GET /api/admin/coaches/{id}/availability`
- 删除：`DELETE /api/admin/coaches/availability/{availabilityId}`

### 教练请假

`POST /api/admin/coaches/{id}/leaves`

```json
{
  "startTime": "2026-07-01T09:00:00",
  "endTime": "2026-07-01T18:00:00",
  "reason": "外出比赛"
}
```

- 查询：`GET /api/admin/coaches/{id}/leaves`
- 教练课表：`GET /api/admin/coaches/{id}/schedules`

## 七、课程与场地

### 课程类型

- 新增：`POST /api/admin/course-types`
- 编辑：`PUT /api/admin/course-types/{id}`
- 列表：`GET /api/admin/course-types`

请求示例：

```json
{
  "name": "1对1",
  "description": "一名教练一名学员",
  "status": "ACTIVE"
}
```

### 课程产品

- 新增：`POST /api/admin/course-products`
- 编辑：`PUT /api/admin/course-products/{id}`
- 列表：`GET /api/admin/course-products?status=ACTIVE`

请求示例：

```json
{
  "name": "青少年1对1基础课",
  "courseTypeId": 1,
  "lessonCount": 1,
  "price": 200.00,
  "bookableCapacity": 1,
  "status": "ACTIVE"
}
```

### 场地管理

- 新增：`POST /api/admin/venues`
- 编辑：`PUT /api/admin/venues/{id}`
- 详情：`GET /api/admin/venues/{id}`
- 列表：`GET /api/admin/venues?status=AVAILABLE`

请求示例：

```json
{
  "name": "A区1号台",
  "location": "一楼训练区",
  "status": "AVAILABLE"
}
```

## 八、排课管理

### 创建课程安排

`POST /api/admin/schedules`

```json
{
  "courseProductId": 1,
  "coachId": 1,
  "venueId": 1,
  "startTime": "2026-07-01T10:00:00",
  "endTime": "2026-07-01T11:00:00",
  "capacity": 1,
  "remark": "第一阶段使用课程安排承载班级概念"
}
```

后端会校验：

- 课程产品必须启用
- 教练必须启用
- 场地必须可用
- 结束时间必须晚于开始时间
- 同一教练时间不能重叠
- 同一场地时间不能重叠

### 编辑课程安排

`PUT /api/admin/schedules/{id}`

### 取消课程

`POST /api/admin/schedules/{id}/cancel`

### 调换教练

`POST /api/admin/schedules/{id}/change-coach`

```json
{
  "coachId": 2
}
```

### 课表查询

`GET /api/admin/schedules?date=2026-07-01&coachId=1&venueId=1&status=SCHEDULED`

## 九、预约与候补

### 学员查看可预约课程

`GET /api/miniapp/schedules/available`

返回课程安排、容量、已预约人数、剩余名额。

### 学员创建预约

`POST /api/miniapp/bookings`

```json
{
  "scheduleId": 1,
  "studentId": 1,
  "remark": "想练发球"
}
```

后端会校验：

- 学员存在
- 课程安排状态为 `SCHEDULED`
- 课时余额足够
- 名额未满
- 未重复预约同一课程

第一阶段策略：预约不扣课时，后台确认到课或教练确认消课后扣课时。
实现上会在事务内锁定课程安排行，并用 `psc_booking.active_key` 约束同一学员在同一课程安排下只能存在一个活跃预约或候补，降低并发重复预约风险。

### 学员取消预约

`POST /api/miniapp/bookings/{id}/cancel`

```json
{
  "reason": "临时有事"
}
```

### 管理员取消预约

`POST /api/admin/bookings/{id}/cancel`

### 教练/管理员确认消课

- 管理员：`POST /api/admin/bookings/{id}/complete`
- 教练：`POST /api/coach/bookings/{id}/complete`

确认完成后：

- 预约状态变为 `COMPLETED`
- 按课程产品 `lessonCount` 扣减课时
- 生成课时流水

消课流水使用业务单号 `CONSUME:BOOKING:{bookingId}` 幂等，避免同一预约重复扣课时。

### 加入候补

`POST /api/miniapp/schedules/{scheduleId}/waitlist`

```json
{
  "studentId": 1,
  "remark": "有空位请通知"
}
```

规则：

- 课程满员后才能加入候补
- 同一学员不能重复预约或重复候补
- 候补队列按 `queueNo` FIFO 排序
- 有人取消正式预约后，系统自动将队首候补转为 `BOOKED`

### 后台预约列表

`GET /api/admin/bookings?studentId=1&scheduleId=1&status=BOOKED`

预约状态：

| 状态 | 含义 |
| --- | --- |
| BOOKED | 已预约 |
| CANCELLED | 已取消 |
| COMPLETED | 已完成 |
| ABSENT | 旷课 |
| WAITING | 候补中 |

## 十、课时账户

### 查询课时账户

`GET /api/admin/lesson-accounts/{studentId}`

### 后台录入购买/退款/调整

`POST /api/admin/lesson-accounts/adjust`

购买课时：

```json
{
  "studentId": 1,
  "changeHours": 10,
  "transactionType": "PURCHASE",
  "remark": "后台录入购买10课时"
}
```

后台扣减或调整：

```json
{
  "studentId": 1,
  "changeHours": -1,
  "transactionType": "ADJUST",
  "remark": "后台调整"
}
```

流水类型：

| 类型 | 含义 |
| --- | --- |
| PURCHASE | 购买 |
| CONSUME | 消耗 |
| REFUND | 退款 |
| ADJUST | 后台调整 |

### 课时流水

`GET /api/admin/lesson-accounts/{studentId}/transactions`

## 十一、考勤

### 教练签到

`POST /api/coach/attendance/sign-in`

```json
{
  "scheduleId": 1,
  "personId": 1,
  "checkInMethod": "MANUAL",
  "checkInLocation": "一楼训练区",
  "deviceInfo": "iPhone",
  "faceCheckResult": "RESERVED"
}
```

### 学员签到

`POST /api/miniapp/attendance/student-sign-in`

```json
{
  "scheduleId": 1,
  "personId": 1,
  "checkInMethod": "MANUAL",
  "checkInLocation": "一楼训练区",
  "deviceInfo": "WeChatMiniProgram",
  "faceCheckResult": "RESERVED"
}
```

### 后台确认到课/旷课/请假

`POST /api/admin/attendance/confirm`

```json
{
  "scheduleId": 1,
  "bookingId": 1,
  "studentId": 1,
  "status": "ATTENDED",
  "remark": "正常到课"
}
```

状态：

| 状态 | 含义 |
| --- | --- |
| SIGNED_IN | 已签到 |
| ATTENDED | 到课 |
| ABSENT | 旷课 |
| LEAVE | 请假 |

当状态为 `ATTENDED` 且带 `bookingId` 时，会确认预约完成并扣课时。

### 考勤记录查询

`GET /api/admin/attendance?scheduleId=1&personType=STUDENT&personId=1`

## 十二、通知记录

第一阶段只做站内通知/消息记录，微信订阅消息和短信后续接入。

### 新增通知

`POST /api/admin/notifications`

```json
{
  "notificationType": "COURSE_REMINDER",
  "receiverType": "STUDENT",
  "receiverId": 1,
  "title": "课前提醒",
  "content": "你有一节课程即将开始",
  "channel": "IN_APP",
  "status": "PENDING"
}
```

### 通知列表

`GET /api/admin/notifications?receiverType=STUDENT&receiverId=1&status=PENDING`

### 标记已发送

`POST /api/admin/notifications/{id}/mark-sent`

通知状态：

| 状态 | 含义 |
| --- | --- |
| PENDING | 待发送 |
| SENT | 已发送 |
| FAILED | 发送失败 |
| READ | 已读 |

## 十三、后台统计

`GET /api/admin/stats/summary`

返回：

- 学员总数
- 启用学员数
- 教练总数
- 启用教练数
- 待上课程安排数
- 当前有效预约数
- 当前候补数
- 待发送通知数

## 十四、第一阶段开发顺序建议

1. 登录鉴权接口
2. 学员 CRUD
3. 教练 CRUD
4. 场地 CRUD
5. 课程类型/课程产品 CRUD
6. 教练可授课时间、请假接口
7. 排课 CRUD
8. 可预约课程查询
9. 创建预约
10. 取消预约
11. 候补加入和候补流转
12. 学员课时账户和课时流水
13. 签到接口
14. 后台统计接口
15. 通知记录接口

## 十五、后续生产化事项

- 按合规要求将 PBKDF2 切换或升级为 BCrypt/SM3/国密方案
- Token 会话从数据库进一步切换到 Redis/JWT 黑名单或统一认证中心
- 增加数据库外键、唯一约束和更细的状态机校验
- 微信小程序登录、微信订阅消息、短信通知
- 课前提醒定时任务
- 大班课班级模型
- 更细的角色数据权限，例如教练只能查看自己的课表和学员
