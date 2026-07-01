package org.pingpongapp.pingsmartclubwebboot.common;

public enum ErrorCode {
    COMMON_BAD_REQUEST(400, "参数或业务状态不合法"),
    COMMON_UNAUTHORIZED(401, "请先登录"),
    COMMON_FORBIDDEN(403, "当前账号无权访问该接口"),
    COMMON_NOT_FOUND(404, "资源不存在"),
    COMMON_CONFLICT(409, "业务冲突"),
    COMMON_INTERNAL_ERROR(500, "系统繁忙，请稍后再试"),

    AUTH_INVALID_CREDENTIALS(401, "账号或密码错误"),
    AUTH_TOKEN_INVALID(401, "登录已失效，请重新登录"),
    AUTH_TOKEN_MISSING(401, "缺少 Authorization Bearer Token"),

    SCHEDULE_NOT_FOUND(404, "课程安排不存在"),
    SCHEDULE_NOT_BOOKABLE(400, "课程安排不可预约"),
    SCHEDULE_COACH_CONFLICT(409, "教练时间冲突"),
    SCHEDULE_VENUE_CONFLICT(409, "场地时间冲突"),

    BOOKING_DUPLICATE(409, "不能重复预约同一课程"),
    BOOKING_CAPACITY_FULL(409, "课程名额已满，可加入候补"),
    BOOKING_NOT_FOUND(404, "预约记录不存在"),
    BOOKING_STATUS_INVALID(400, "当前预约状态不可操作"),

    LESSON_BALANCE_NOT_ENOUGH(400, "课时余额不足"),
    LESSON_TRANSACTION_DUPLICATE(409, "课时流水已处理");

    private final int httpStatus;
    private final String defaultMessage;

    ErrorCode(int httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
