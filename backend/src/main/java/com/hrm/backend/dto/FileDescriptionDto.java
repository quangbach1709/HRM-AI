package com.hrm.backend.dto;

import com.hrm.backend.entity.FileDescription;

public class FileDescriptionDto extends AuditableDto {
    private String contentType;
    private Long contentSize;
    private String name;
    private String extension;
    private String filePath;
    private String url;

    public FileDescriptionDto() {
    }

    public FileDescriptionDto(FileDescription entity) {
        super(entity);
        if (entity != null) {
            this.contentType = entity.getContentType();
            this.contentSize = entity.getContentSize();
            this.name = entity.getName();
            this.extension = entity.getExtension();
            this.filePath = entity.getFilePath();
        }
    }

    /**
     * Constructor dùng khi cần truyền thêm minioEndpoint và bucketName
     * để tự tính public URL ngay trong DTO — frontend dùng trường {@code url} này để hiển thị ảnh.
     */
    public FileDescriptionDto(FileDescription entity, String minioEndpoint, String bucketName) {
        this(entity);
        if (entity != null && entity.getFilePath() != null && minioEndpoint != null) {
            this.url = minioEndpoint + "/" + bucketName + "/" + entity.getFilePath();
        }
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public static FileDescription toEntity(FileDescriptionDto dto) {
        if (dto == null) {
            return null;
        }
        FileDescription entity = new FileDescription();
        entity.setId(dto.getId());
        entity.setContentType(dto.getContentType());
        entity.setContentSize(dto.getContentSize());
        entity.setName(dto.getName());
        entity.setExtension(dto.getExtension());
        entity.setFilePath(dto.getFilePath());
        return entity;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getContentSize() {
        return contentSize;
    }

    public void setContentSize(Long contentSize) {
        this.contentSize = contentSize;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
}
