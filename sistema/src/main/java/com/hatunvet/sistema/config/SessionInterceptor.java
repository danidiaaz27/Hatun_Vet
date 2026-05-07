package com.hatunvet.sistema.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class SessionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        HttpSession session = request.getSession(false);

        // Si no hay sesión o no hay usuario logueado, rebota al login
        if (session == null || session.getAttribute("usuarioLogueado") == null) {
            response.sendRedirect("/login");
            return false;
        }
        return true;
    }
}