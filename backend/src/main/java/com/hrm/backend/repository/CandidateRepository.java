package com.hrm.backend.repository;

import com.hrm.backend.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends
        JpaRepository<Candidate, UUID>,
        JpaSpecificationExecutor<Candidate> {

    boolean existsByCandidateCode(String candidateCode);

    Optional<Candidate> findByCandidateCode(String candidateCode);
}
