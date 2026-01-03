package com.hrm.backend.service;

import com.hrm.backend.dto.CertificateDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchCertificateDto;

import java.util.List;
import java.util.UUID;

public interface CertificateService {

    // ===== PAGINATION =====
    PageResponse<CertificateDto> search(SearchCertificateDto dto);

    // ===== CRUD =====
    CertificateDto getById(UUID id);

    CertificateDto create(CertificateDto dto);

    CertificateDto update(UUID id, CertificateDto dto);

    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<CertificateDto> getAll();

    List<CertificateDto> exportToExcel(SearchCertificateDto dto);
}
