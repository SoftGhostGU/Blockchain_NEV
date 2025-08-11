package com.autocrowd.backend.util;

import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;

import java.util.regex.Pattern;

/**
 * 密码验证工具类
 * 用于检查密码复杂度，确保密码安全
 */
public class PasswordValidatorUtil {
    
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*\\d.*");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*");

    /**
     * 验证密码复杂度
     * 密码必须至少包含大写字母、小写字母、数字、特殊字符中的三种
     * 并且长度至少为8位
     * 
     * @param password 待验证的密码
     * @throws BusinessException 当密码不符合复杂度要求时抛出
     */
    public static void validatePassword(String password) {
        if (password == null) {
            throw new BusinessException(ExceptionCodeEnum.WEAK_PASSWORD);
        }

        // 检查长度
        if (password.length() < MIN_LENGTH) {
            throw new BusinessException(ExceptionCodeEnum.WEAK_PASSWORD);
        }

        // 计算满足的条件数量
        int satisfiedConditions = 0;
        
        // 检查是否包含大写字母
        if (UPPERCASE_PATTERN.matcher(password).matches()) {
            satisfiedConditions++;
        }

        // 检查是否包含小写字母
        if (LOWERCASE_PATTERN.matcher(password).matches()) {
            satisfiedConditions++;
        }

        // 检查是否包含数字
        if (DIGIT_PATTERN.matcher(password).matches()) {
            satisfiedConditions++;
        }

        // 检查是否包含特殊字符
        if (SPECIAL_CHAR_PATTERN.matcher(password).matches()) {
            satisfiedConditions++;
        }

        // 至少满足三种条件
        if (satisfiedConditions < 3) {
            throw new BusinessException(ExceptionCodeEnum.WEAK_PASSWORD);
        }
    }
}