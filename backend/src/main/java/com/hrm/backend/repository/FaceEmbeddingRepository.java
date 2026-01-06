package com.hrm.backend.repository;

import com.hrm.backend.entity.FaceEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FaceEmbeddingRepository
        extends JpaRepository<FaceEmbedding, UUID>, JpaSpecificationExecutor<FaceEmbedding> {

    List<FaceEmbedding> findByPersonId(UUID personId);

    @Query("SELECT fe FROM FaceEmbedding fe WHERE fe.person.id = :personId AND fe.isActive = true AND (fe.voided = false OR fe.voided IS NULL)")
    List<FaceEmbedding> findByPersonIdAndActiveTrue(UUID personId);
}
