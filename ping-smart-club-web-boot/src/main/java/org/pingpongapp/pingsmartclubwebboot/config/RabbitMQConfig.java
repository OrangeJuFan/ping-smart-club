package org.pingpongapp.pingsmartclubwebboot.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ 配置类
 * 暂时注释，后续需要 RabbitMQ 时再启用
 */
// @Configuration  // 暂时注释，RabbitMQ 功能未启用
public class RabbitMQConfig {

    /**
     * 消息转换器 - JSON格式
     */
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * 配置 RabbitTemplate
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        // 开启 Mandatory 模式，消息无法路由时回调
        template.setMandatory(true);
        return template;
    }

    // ========== 队列和交换机定义 ==========
    
    /**
     * 示例：通知队列
     */
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    
    /**
     * 示例：通知交换机
     */
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    
    /**
     * 路由键
     */
    public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";

    /**
     * 创建通知队列
     */
    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    /**
     * 创建通知交换机
     */
    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(NOTIFICATION_EXCHANGE, true, false);
    }

    /**
     * 绑定队列到交换机
     */
    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
            .bind(notificationQueue())
            .to(notificationExchange())
            .with(NOTIFICATION_ROUTING_KEY);
    }
}
