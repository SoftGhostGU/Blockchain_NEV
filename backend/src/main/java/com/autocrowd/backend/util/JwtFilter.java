package com.autocrowd.backend.util;

import com.autocrowd.backend.exception.BusinessException;
import com.autocrowd.backend.exception.ExceptionCodeEnum;
import io.jsonwebtoken.Claims;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * JWT过滤器，用于验证请求中的JWT令牌
 */
@Component
@AllArgsConstructor
public class JwtFilter implements Filter {

    private final JwtUtil jwtUtil;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        // 获取请求路径
        String path = request.getRequestURI();

        // 放行登录和注册接口，以及管理员接口
        if (path.contains("/api/admin") || path.contains("/api/user/login") || path.contains("/api/user/register") || path.contains("/api/driver/login") || path.contains("/api/driver/register") || path.contains("/api/order/start")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 获取Authorization请求头
        String token = request.getHeader("Authorization");

        // 验证token
        if (token == null || !token.startsWith("Bearer ")) {
            throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
        }

        // 去除Bearer前缀
        token = token.substring(7);

        try {
            // 解析token
            Claims claims = jwtUtil.parseToken(token);
            // 将用户ID存储在请求属性中
            request.setAttribute("userId", claims.getSubject());
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            throw new BusinessException(ExceptionCodeEnum.INVALID_TOKEN);
        }
    }
}