package org.pingpongapp.pingsmartclubwebboot.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private int code;
    private String errorCode;
    private String message;
    private T data;
    private String traceId;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(0, "SUCCESS", "success", data, null);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(0, "SUCCESS", "success", null, null);
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(code, "ERROR", message, null, null);
    }

    public static <T> ApiResponse<T> fail(ErrorCode errorCode, String message, String traceId) {
        return new ApiResponse<>(errorCode.getHttpStatus(), errorCode.name(), message, null, traceId);
    }
}
