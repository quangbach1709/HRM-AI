package com.hrm.backend.dto;


import com.hrm.backend.entity.Certificate;

import java.util.UUID;

public class CertificateDto extends BaseObjectDto {
    private PersonDto person;
    private UUID personId;
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
            this.personId = entity.getPerson() != null ? entity.getPerson().getId() : null;
        }
    }

    public static Certificate toEntity(CertificateDto dto) {
        if (dto == null) {
            return null;
        }
        Certificate entity = new Certificate();
        entity.setId(dto.getId());
        entity.setPerson(PersonDto.toEntity(dto.getPerson()));
        entity.setCertificateFile(FileDescriptionDto.toEntity(dto.getCertificateFile()));
        return entity;
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

    public UUID getPersonId() {
        return personId;
    }

    public void setPersonId(UUID personId) {
        this.personId = personId;
    }
}
