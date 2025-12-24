package com.hrm.backend.dto;


import com.hrm.backend.entity.Certificate;
import com.hrm.backend.entity.Person;
import jakarta.validation.Valid;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Valid
public class PersonDto extends AuditableDto {
    protected String firstName;
    protected String lastName;
    protected String displayName;
    protected Date birthDate;
    protected String birthPlace;
    protected Integer gender;
    protected String phoneNumber;
    protected String idNumber;
    protected String idNumberIssueBy;
    protected Date idNumberIssueDate;
    protected String email;
    protected Integer maritalStatus;
    protected String taxCode;
    protected Integer educationLevel;
    protected Double height;
    protected Double weight;
    protected FileDescriptionDto avatar;
    protected List<CertificateDto> certificates;

    public PersonDto() {
    }

    public PersonDto(Person entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            this.firstName = entity.getFirstName();
            this.lastName = entity.getLastName();
            this.displayName = entity.getDisplayName();
            this.birthDate = entity.getBirthDate();
            this.birthPlace = entity.getBirthPlace();
            this.gender = entity.getGender();
            this.phoneNumber = entity.getPhoneNumber();
            this.idNumber = entity.getIdNumber();
            this.idNumberIssueBy = entity.getIdNumberIssueBy();
            this.idNumberIssueDate = entity.getIdNumberIssueDate();
            this.email = entity.getEmail();
            this.maritalStatus = entity.getMaritalStatus();
            this.taxCode = entity.getTaxCode();
            this.height = entity.getHeight();
            this.weight = entity.getWeight();

            if (entity.getAvatar() != null) {
                this.avatar = new FileDescriptionDto(entity.getAvatar());
            }

            this.educationLevel = entity.getEducationLevel();

            if (isGetFull) {
                if (entity.getCertificates() != null && !entity.getCertificates().isEmpty()) {
                    this.certificates = new ArrayList<>();
                    for (Certificate certificate : entity.getCertificates()) {
                        CertificateDto dto = new CertificateDto(certificate, false);
                        this.certificates.add(dto);
                    }
                }
            }
        }
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public String getBirthPlace() {
        return birthPlace;
    }

    public void setBirthPlace(String birthPlace) {
        this.birthPlace = birthPlace;
    }

    public Integer getGender() {
        return gender;
    }

    public void setGender(Integer gender) {
        this.gender = gender;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getIdNumber() {
        return idNumber;
    }

    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }

    public String getIdNumberIssueBy() {
        return idNumberIssueBy;
    }

    public void setIdNumberIssueBy(String idNumberIssueBy) {
        this.idNumberIssueBy = idNumberIssueBy;
    }

    public Date getIdNumberIssueDate() {
        return idNumberIssueDate;
    }

    public void setIdNumberIssueDate(Date idNumberIssueDate) {
        this.idNumberIssueDate = idNumberIssueDate;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getMaritalStatus() {
        return maritalStatus;
    }

    public void setMaritalStatus(Integer maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public Integer getEducationLevel() {
        return educationLevel;
    }

    public void setEducationLevel(Integer educationLevel) {
        this.educationLevel = educationLevel;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public FileDescriptionDto getAvatar() {
        return avatar;
    }

    public void setAvatar(FileDescriptionDto avatar) {
        this.avatar = avatar;
    }

    public List<CertificateDto> getCertificates() {
        return certificates;
    }

    public void setCertificates(List<CertificateDto> certificates) {
        this.certificates = certificates;
    }
}
