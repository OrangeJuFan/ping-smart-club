package org.pingpongapp.pingsmartclubwebboot.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger (OpenAPI 3) 配置类
 */
@Configuration
public class SwaggerConfig {

    /**
     * 配置 API 文档信息
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Ping Smart Club API 文档")
                .description("乒智管 API 接口文档")
                .version("v1.0.0")
                .contact(new Contact()
                    .name("Ping Smart Club Team")
                    .email("support@pingpongclub.com")
                )
                .license(new License()
                    .name("Apache 2.0")
                    .url("https://www.apache.org/licenses/LICENSE-2.0.html")
                )
            );
    }

    /**
     * 配置 API 分组 - 所有接口
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
            .group("public-api")
            .displayName("公开接口")
            .pathsToMatch("/**")
            .build();
    }

    /**
     * 配置 API 分组 - 教练相关接口（示例）
     */
    @Bean
    public GroupedOpenApi coachApi() {
        return GroupedOpenApi.builder()
            .group("coach-api")
            .displayName("教练管理")
            .pathsToMatch("/coach/**")
            .build();
    }

    /**
     * 配置 API 分组 - 家长相关接口（示例）
     */
    @Bean
    public GroupedOpenApi parentApi() {
        return GroupedOpenApi.builder()
            .group("parent-api")
            .displayName("家长管理")
            .pathsToMatch("/parent/**")
            .build();
    }

    /**
     * 配置 API 分组 - 管理员相关接口（示例）
     */
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
            .group("admin-api")
            .displayName("管理员管理")
            .pathsToMatch("/admin/**")
            .build();
    }
}
