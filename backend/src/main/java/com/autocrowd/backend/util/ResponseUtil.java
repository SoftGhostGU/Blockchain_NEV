package com.autocrowd.backend.util;

import java.util.HashMap;
import java.util.Map;

public class ResponseUtil {
    
    public static Map<String, Object> success(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 0);
        response.put("data", data);
        response.put("message", "success");
        return response;
    }
    
    public static Map<String, Object> success(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 0);
        response.put("data", data);
        response.put("message", message);
        return response;
    }
    
    public static Map<String, Object> error(int code, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("data", null);
        response.put("message", message);
        return response;
    }
    
    public static Map<String, Object> error(String message) {
        return error(1, message);
    }
}