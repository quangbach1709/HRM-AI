package com.hrm.backend.service;

import com.hrm.backend.dto.UserRoleDto;

import com.hrm.backend.dto.response.PageResponse;
import com.hrm.backend.dto.search.SearchDto;
import com.hrm.backend.dto.search.SearchUserRoleDto;

import java.util.List;
import java.util.UUID;

public interface UserRoleService {
    PageResponse<UserRoleDto> search(SearchUserRoleDto dto);

    PageResponse<UserRoleDto> paging(SearchDto dto);

    UserRoleDto getById(UUID id);

    UserRoleDto create(SearchUserRoleDto dto);
    // Use Search DTO to pass Ids? Or create a CreateUserRoleDto?
    // Actually, UserRoleDto usually contains RoleDto. It doesn't contain UserID.
    // So for creation, we might need a specific DTO or just reuse SearchUserRoleDto
    // which has both IDs.
    // or just accept userId and roleId params?
    // Let's use SearchUserRoleDto as a command object or add a specific Create
    // method.
    // Ideally create(UserRoleDto dto) but UserRoleDto lacks userId.
    // I'll overload or use SearchUserRoleDto for creation convenience or define a
    // new simple DTO.
    // Given the prompt structure, usually we pass DTO.
    // But `UserRoleDto` in this codebase only has `RoleDto`.
    // I will implement `create(UUID userId, UUID roleId)` or similar.
    // Or better, let's look at `UserRoleDto` again.
    // I can extend UserRoleDto to include userId if needed, or just use parameters.
    // Using `SearchUserRoleDto` for creation is weird but works for IDs.

    // Let's try to stick to the pattern `UserRoleDto create(UserRoleDto dto)`.
    // But `UserRoleDto` doesn't have `userId`.
    // So I will likely need to update `UserRoleDto` to include `userId` or create a
    // new `UserRoleCreateDto`.
    // I'll create `UserRoleDto` update first?
    // No, `UserRoleDto` is used in `UserDto` which strictly defines roles.

    // I'll make `create` take a specific DTO or just params?
    // The implementation should probably be flexible.
    // Let's use `create(UserRoleDto dto)` but assume `dto` will be enhanced or
    // check if I can add userId to it.

    // Decision: I'll use `SearchUserRoleDto` for `create` input since it has both
    // IDs.
    // `UserRoleDto create(SearchUserRoleDto dto)`


    void delete(UUID id);

    List<UserRoleDto> getAll();
}
