package com.autocrowd.backend.exception;

import com.autocrowd.backend.exception.ExceptionCodeEnum;
import lombok.Getter;
import lombok.Setter;

/**
 * 业务异常类，处理应用中的业务逻辑异常
 */
@Getter
@Setter
public class BusinessException extends RuntimeException {

    private final int code;
    private final String message;

    /**
     * 使用异常枚举构造业务异常
     * @param exceptionCodeEnum 异常枚举
     */
    public BusinessException(ExceptionCodeEnum exceptionCodeEnum) {
        super(exceptionCodeEnum.getMessage());
        this.code = exceptionCodeEnum.getCode();
        this.message = exceptionCodeEnum.getMessage();
    }

    /**
     * 使用自定义消息构造业务异常
     * @param message 异常消息
     */
    public BusinessException(String message) {
        super(message);
        this.code = ExceptionCodeEnum.DEFAULT_ERROR.getCode();
        this.message = message;
    }

    /**
     * 使用异常枚举和自定义消息构造业务异常
     * @param exceptionCodeEnum 异常枚举
     * @param message 自定义消息
     */
    public BusinessException(ExceptionCodeEnum exceptionCodeEnum, String message) {
        super(message);
        this.code = exceptionCodeEnum.getCode();
        this.message = message;
    }

    /**
     * 使用异常枚举和 cause 构造业务异常
     * @param exceptionCodeEnum 异常枚举
     * @param cause 异常原因
     */
    public BusinessException(ExceptionCodeEnum exceptionCodeEnum, Throwable cause) {
        super(exceptionCodeEnum.getMessage(), cause);
        this.code = exceptionCodeEnum.getCode();
        this.message = exceptionCodeEnum.getMessage();
    }

    @Override
    public String getMessage() {
        return message;
    }
}