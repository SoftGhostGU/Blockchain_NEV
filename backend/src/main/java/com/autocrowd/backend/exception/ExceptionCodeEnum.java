package com.autocrowd.backend.exception;

import lombok.Getter;

/**
 * 异常状态码枚举类
 */
@Getter
public enum ExceptionCodeEnum {
    // 个人信息相关异常
    USER_NOT_FOUND(10001, "用户不存在"),
    PROFILE_UPDATE_FAILED(10002, "个人资料更新失败"),
    INVALID_TOKEN(10003, "无效的令牌"),
    TOKEN_EXPIRED(10004, "令牌已过期"),
    PARAM_ERROR(10005, "参数错误"),
    PARAM_NULL_ERROR(10007, "参数不能为空"),
    // 用户相关异常 from enums
    USERNAME_ALREADY_EXISTS(10011, "用户名已存在"),
    PHONE_ALREADY_EXISTS(10014, "手机号已存在"),
    INVALID_PASSWORD(10013, "密码错误"),
    USER_REGISTER_FAILED(10015, "用户注册失败"),
    // 司机相关异常
    DRIVERNAME_ALREADY_EXISTS(10021, "司机用户名已存在"),
    DRIVER_NOT_FOUND(10022, "司机不存在"),
    PHONE_ALREADY_REGISTERED(10023, "手机号已被注册"),
    DRIVER_LOGIN_ERROR(10024, "司机登录异常"),
    DRIVER_REGISTER_FAILED(10025, "司机注册失败"),
    DRIVER_PROFILE_GET_ERROR(10027, "司机资料获取异常"),
    DRIVER_PROFILE_UPDATE_ERROR(10026, "司机资料更新异常"),
    LOGIN_FAILED(10006, "登录失败"),
    // 系统通用异常 from enums
    DEFAULT_ERROR(500, "默认错误"),
    SYSTEM_ERROR(99999, "系统异常"),

    // 订单相关异常
    ORDER_NOT_FOUND(20001, "订单不存在"),
    PRICE_ESTIMATION_FAILED(20002, "价格预估失败"),
    ORDER_CREATE_FAILED(20003, "订单创建失败"),
    ORDER_GET_FAILED(20004, "获取订单失败"),
    ORDER_UPDATE_FAILED(20005, "更新订单状态失败"),
    ORDER_STATUS_ERROR(20007, "订单状态错误"),
    ORDER_ACCEPT_FAILED(20009,"订单接收失败"),
    // 车辆相关异常
    VEHICLE_NOT_FOUND(20006, "车辆不存在"),
    VEHICLE_TYPE_ERROR(20005, "车辆类型错误"),
    VEHICLE_NOT_BELONG_TO_DRIVER(20008, "车辆不属于该司机"),
    PERMISSION_DENIED(20009, "权限拒绝");


    private final int code;
    private final String message;

    ExceptionCodeEnum(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}