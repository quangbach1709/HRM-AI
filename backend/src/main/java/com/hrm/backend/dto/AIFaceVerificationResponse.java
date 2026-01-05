package com.hrm.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO để nhận response từ AI-Service API
 */
@Data
@NoArgsConstructor
public class AIFaceVerificationResponse {
    private List<Double> embeddingVector;
    private int status;
    private String statusDetail;

}
