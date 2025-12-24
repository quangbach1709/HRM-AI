package com.hrm.backend.dto;


import com.hrm.backend.entity.Certificate;

public class CertificateDto extends BaseObjectDto {
    private PersonDto person;
    private FileDescriptionDto certificateFile;

    public CertificateDto() {
    }

    public CertificateDto(Certificate entity, Boolean isGetPerson) {
        super(entity);
        if (entity != null) {
            if (isGetPerson) {
                this.person = new PersonDto(entity.getPerson(), false);
            }
            this.certificateFile = new FileDescriptionDto(entity.getCertificateFile());
        }
    }

    public PersonDto getPerson() {
        return person;
    }

    public void setPerson(PersonDto person) {
        this.person = person;
    }

    public FileDescriptionDto getCertificateFile() {
        return certificateFile;
    }

    public void setCertificateFile(FileDescriptionDto certificateFile) {
        this.certificateFile = certificateFile;
    }
}
