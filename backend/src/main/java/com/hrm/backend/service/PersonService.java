package com.hrm.backend.service;

import com.hrm.backend.dto.PersonDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchPersonDto;

import java.util.List;
import java.util.UUID;

public interface PersonService {

    // ===== PAGINATION =====
    PageResponse<PersonDto> search(SearchPersonDto dto);

    PageResponse<PersonDto> paging(SearchDto dto);

    // ===== CRUD =====
    PersonDto getById(UUID id);

    PersonDto create(PersonDto dto);

    PersonDto update(UUID id, PersonDto dto);

    void delete(UUID id);

    // ===== ADDITIONAL =====
    List<PersonDto> getAll();

    List<PersonDto> exportToExcel(SearchPersonDto dto);
}
