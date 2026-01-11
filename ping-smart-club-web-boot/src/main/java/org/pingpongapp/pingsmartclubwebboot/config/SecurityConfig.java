//package org.pingpongapp.pingsmartclubwebboot.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
//import org.springframework.security.config.http.SessionCreationPolicy;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//
///**
// * Spring Security 配置类
// * 暂时注释，后续需要 Security 时再启用
// */
//// @Configuration  // 暂时注释，Spring Security 功能未启用
//// @EnableWebSecurity
//public class SecurityConfig {
//
//    /**
//     * 密码编码器
//     */
//    @Bean
//    public PasswordEncoder passwordEncoder() {
//        return new BCryptPasswordEncoder();
//    }
//
//    /**
//     * 安全过滤器链配置
//     * 注意：这是基础配置，实际项目中需要根据业务需求进行细化配置
//     */
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//            // 禁用 CSRF（根据实际需求决定是否启用）
//            .csrf(AbstractHttpConfigurer::disable)
//            // 配置会话管理策略
//            .sessionManagement(session ->
//                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//            )
//            // 配置请求授权
//            .authorizeHttpRequests(authorize ->
//                authorize
//                    // 允许所有请求访问（开发阶段，生产环境需要配置具体权限）
//                    .anyRequest().permitAll()
//                    // 实际生产环境中应该这样配置：
//                    // .requestMatchers("/api/public/**").permitAll()
//                    // .requestMatchers("/api/admin/**").hasRole("ADMIN")
//                    // .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
//                    // .anyRequest().authenticated()
//            )
//            // 禁用默认的登录页面
//            .formLogin(AbstractHttpConfigurer::disable)
//            // 禁用默认的登出功能
//            .logout(AbstractHttpConfigurer::disable);
//
//        return http.build();
//    }
//}
