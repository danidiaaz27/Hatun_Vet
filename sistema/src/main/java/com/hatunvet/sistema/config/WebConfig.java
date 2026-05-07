package com.hatunvet.sistema.config;

import org.springframework.lang.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final SessionInterceptor sessionInterceptor;

    public WebConfig(SessionInterceptor sessionInterceptor) {
        this.sessionInterceptor = sessionInterceptor;
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Configuramos las carpetas de CSS, JS e Imágenes
        registry.addResourceHandler("/css/**").addResourceLocations("classpath:/static/css/").setCachePeriod(0);
        registry.addResourceHandler("/js/**").addResourceLocations("classpath:/static/js/").setCachePeriod(0);
        registry.addResourceHandler("/img/**").addResourceLocations("classpath:/static/img/").setCachePeriod(0);
        registry.addResourceHandler("/uploads/**").addResourceLocations("file:uploads/");
    }

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(sessionInterceptor)
                .addPathPatterns("/**") // Protege todo
                .excludePathPatterns("/login", "/logout", "/test-clave", "/css/**", "/js/**", "/img/**", "/error", "/favicon.ico"); // Excluye lo público
    }
}