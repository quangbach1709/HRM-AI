package com.hrm.backend.dto.search;

import com.hrm.backend.dto.search.SearchDto;
import lombok.*;

/**
 * DTO tìm kiếm cho SalaryTemplate
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SearchSalaryTemplateDto extends SearchDto {

    // ===== SORTING MỞ RỘNG =====
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // ===== FILTER FIELDS =====
    private String code;
    private String name;
    private String description;


}
