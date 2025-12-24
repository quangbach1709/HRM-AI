package com.hrm.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "tbl_file_description")
public class FileDescription extends AuditableEntity {
    @Column(name = "content_type")
    private String contentType;
    @Column(name = "content_size")
    private Long contentSize;
    @Column(name = "name")
    private String name;
    @Column(name = "extension")
    private String extension;
    @Column(name = "file_path")
    private String filePath;

    public FileDescription() {
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
