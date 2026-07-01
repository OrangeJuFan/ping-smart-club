package org.pingpongapp.pingsmartclubwebboot.common;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final int code;
    private final ErrorCode errorCode;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.errorCode = resolveErrorCode(code);
    }

    public BusinessException(ErrorCode errorCode) {
        this(errorCode, errorCode.getDefaultMessage());
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.code = errorCode.getHttpStatus();
        this.errorCode = errorCode;
    }

    public static BusinessException badRequest(String message) {
        return new BusinessException(ErrorCode.COMMON_BAD_REQUEST, message);
    }

    public static BusinessException unauthorized(String message) {
        return new BusinessException(ErrorCode.COMMON_UNAUTHORIZED, message);
    }

    public static BusinessException forbidden(String message) {
        return new BusinessException(ErrorCode.COMMON_FORBIDDEN, message);
    }

    public static BusinessException notFound(String message) {
        return new BusinessException(ErrorCode.COMMON_NOT_FOUND, message);
    }

    public static BusinessException conflict(String message) {
        return new BusinessException(ErrorCode.COMMON_CONFLICT, message);
    }

    public static BusinessException of(ErrorCode errorCode) {
        return new BusinessException(errorCode);
    }

    public static BusinessException of(ErrorCode errorCode, String message) {
        return new BusinessException(errorCode, message);
    }

    private ErrorCode resolveErrorCode(int code) {
        if (code == 401) {
            return ErrorCode.COMMON_UNAUTHORIZED;
        }
        if (code == 403) {
            return ErrorCode.COMMON_FORBIDDEN;
        }
        if (code == 404) {
            return ErrorCode.COMMON_NOT_FOUND;
        }
        if (code == 409) {
            return ErrorCode.COMMON_CONFLICT;
        }
        if (code == 500) {
            return ErrorCode.COMMON_INTERNAL_ERROR;
        }
        return ErrorCode.COMMON_BAD_REQUEST;
    }
}
