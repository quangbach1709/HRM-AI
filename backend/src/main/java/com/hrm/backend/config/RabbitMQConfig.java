package com.hrm.backend.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Salary email queue (hiện có) ─────────────────────────────────────────
    public static final String SALARY_EMAIL_QUEUE = "email.salary.queue";
    public static final String EMAIL_EXCHANGE = "email.exchange";
    public static final String SALARY_EMAIL_ROUTING_KEY = "email.salary.key";

    // ── Face Embedding queue (nhận từ AI Service — đăng ký mặt) ─────────────
    public static final String FACE_EMBEDDING_QUEUE = "face.embedding.queue";
    public static final String FACE_EMBEDDING_EXCHANGE = "face.embedding.exchange";
    public static final String FACE_EMBEDDING_ROUTING_KEY = "face.embedding.key";

    // ── Face Approval queue (gửi sang AI Service — HR duyệt) ─────────────────
    public static final String FACE_APPROVAL_QUEUE = "face.approval.queue";
    public static final String FACE_APPROVAL_EXCHANGE = "face.approval.exchange";
    public static final String FACE_APPROVAL_ROUTING_KEY = "face.approval.key";

    // ── Beans: Salary Email ───────────────────────────────────────────────────

    @Bean
    public Queue salaryEmailQueue() {
        return new Queue(SALARY_EMAIL_QUEUE, true);
    }

    @Bean
    public TopicExchange emailExchange() {
        return new TopicExchange(EMAIL_EXCHANGE);
    }

    @Bean
    public Binding salaryEmailBinding(Queue salaryEmailQueue, TopicExchange emailExchange) {
        return BindingBuilder.bind(salaryEmailQueue).to(emailExchange).with(SALARY_EMAIL_ROUTING_KEY);
    }

    // ── Beans: Face Embedding ─────────────────────────────────────────────────

    @Bean
    public Queue faceEmbeddingQueue() {
        return new Queue(FACE_EMBEDDING_QUEUE, true);
    }

    @Bean
    public TopicExchange faceEmbeddingExchange() {
        return new TopicExchange(FACE_EMBEDDING_EXCHANGE);
    }

    @Bean
    public Binding faceEmbeddingBinding(Queue faceEmbeddingQueue, TopicExchange faceEmbeddingExchange) {
        return BindingBuilder.bind(faceEmbeddingQueue).to(faceEmbeddingExchange).with(FACE_EMBEDDING_ROUTING_KEY);
    }

    // ── Beans: Face Approval ──────────────────────────────────────────────────

    @Bean
    public Queue faceApprovalQueue() {
        return new Queue(FACE_APPROVAL_QUEUE, true);
    }

    @Bean
    public TopicExchange faceApprovalExchange() {
        return new TopicExchange(FACE_APPROVAL_EXCHANGE);
    }

    @Bean
    public Binding faceApprovalBinding(Queue faceApprovalQueue, TopicExchange faceApprovalExchange) {
        return BindingBuilder.bind(faceApprovalQueue).to(faceApprovalExchange).with(FACE_APPROVAL_ROUTING_KEY);
    }

    // ── Shared Infrastructure ─────────────────────────────────────────────────

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
