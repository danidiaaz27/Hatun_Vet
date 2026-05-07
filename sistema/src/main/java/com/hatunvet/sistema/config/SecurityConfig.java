package com.hatunvet.sistema.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Mantenemos tu encriptador de contraseñas
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ¡La magia para apagar la pantalla por defecto!
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. Desactivamos CSRF temporalmente para que nuestro formulario HTML funcione
                .csrf(csrf -> csrf.disable())

                // 2. Le decimos a Spring Security que permita TODO.
                // (No te preocupes, nuestro SessionInterceptor es el que realmente protege las rutas)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}