package com.hrm.backend.entity;

import jakarta.persistence.*;

@Table(name = "tbl_certificate")
@Entity
public class Certificate extends BaseObject {
    @Column(name = "code")
    private String code;
    @ManyToOne
    @JoinColumn(name = "person_id")
    private Person person;
    /**
     * Tài liệu bằng cấp đã được tải lên và lưu trữ.
     */
    @ManyToOne
    @JoinColumn(name = "file_id")
    private FileDescription certificateFile; // Tài liệu bằng cấp đã upload

    public Certificate() {
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public void setCode(String code) {
        this.code = code;
    }

    public Person getPerson() {
        return person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public FileDescription getCertificateFile() {
        return certificateFile;
    }

    public void setCertificateFile(FileDescription certificateFile) {
        this.certificateFile = certificateFile;
    }
}
