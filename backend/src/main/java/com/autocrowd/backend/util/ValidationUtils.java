package com.autocrowd.backend.util;

import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;

/**
 * 参数验证工具类
 * 提供通用的参数验证方法，避免代码重复
 */
public class ValidationUtils {
    
    /**
     * 验证参数不为空
     * @param value 参数值
     * @param paramName 参数名称
     * @throws BusinessException 当参数为空时抛出
     */
    public static void validateNotNull(Object value, String paramName) {
        if (value == null) {
            throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, paramName + "不能为空");
        }
    }
    
    /**
     * 验证字符串不为空且不为空白
     * @param value 字符串值
     * @param paramName 参数名称
     * @throws BusinessException 当字符串为空或空白时抛出
     */
    public static void validateNotEmpty(String value, String paramName) {
        if (value == null || value.trim().isEmpty()) {
            throw new BusinessException(ExceptionCodeEnum.PARAM_ERROR, paramName + "不能为空");
        }
    }
    
    /**
     * 验证ID参数
     * @param id ID值
     * @param idName ID名称
     * @throws BusinessException 当ID为空时抛出
     */
    public static void validateId(Integer id, String idName) {
        if (id == null) {
            throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, idName + "不能为空");
        }
    }
    
    /**
     * 验证请求对象不为空
     * @param request 请求对象
     * @throws BusinessException 当请求对象为空时抛出
     */
    public static void validateRequest(Object request) {
        if (request == null) {
            throw new BusinessException(ExceptionCodeEnum.PARAM_NULL_ERROR, "请求参数不能为空");
        }
    }
}