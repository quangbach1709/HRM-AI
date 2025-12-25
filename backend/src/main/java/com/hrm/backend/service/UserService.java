package com.hrm.backend.service;

import com.hrm.backend.dto.UserDto;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchUserDto;

import java.util.List;
import java.util.UUID;

public interface UserService {
    PageResponse<UserDto> search(SearchUserDto dto);

    PageResponse<UserDto> paging(SearchDto dto);

    UserDto getById(UUID id);

    UserDto create(UserDto dto);

    UserDto update(UUID id, UserDto dto);

    void delete(UUID id);

    List<UserDto> getAll();

    List<UserDto> exportToExcel(SearchUserDto dto);
}
