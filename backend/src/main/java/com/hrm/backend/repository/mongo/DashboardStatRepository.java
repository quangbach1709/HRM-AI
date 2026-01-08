package com.hrm.backend.repository.mongo;

import com.hrm.backend.entity.mongo.DashboardStatDoc;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB Repository cho DashboardStatDoc.
 * Cung cấp các phương thức CRUD cơ bản thông qua MongoRepository.
 */
@Repository
public interface DashboardStatRepository extends MongoRepository<DashboardStatDoc, String> {

    /**
     * Tìm tất cả thống kê của một năm cụ thể
     * 
     * @param yearSuffix năm cần tìm (VD: "2024")
     * @return danh sách các tháng trong năm đó
     */
    List<DashboardStatDoc> findByIdContaining(String yearSuffix);
}
