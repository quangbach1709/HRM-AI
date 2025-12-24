package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Date;
import java.util.Set;

@Entity
@Table(name = "tbl_person")
@Inheritance(strategy = InheritanceType.JOINED)
public class Person extends AuditableEntity {
    @Column(name = "first_name")
    protected String firstName; // Tên (Ví dụ: "Văn", "Thị")

    @Column(name = "last_name")
    protected String lastName; // Họ và tên đệm (Ví dụ: "Nguyễn", "Trần Văn")

    @Column(name = "display_name")
    protected String displayName; // Họ và tên đầy đủ để hiển thị

    @Column(name = "birth_date")
    protected Date birthDate; // Ngày sinh

    @Column(name = "birth_place")
    protected String birthPlace; // Nơi sinh

    @Column(name = "gender")
    protected Integer gender; // DatnConstants.Gender

    @Column(name = "phone_number")
    protected String phoneNumber; // Số điện thoại

    @Column(name = "id_number")
    protected String idNumber; // Số CMND/CCCD

    @Column(name = "id_number_issue_by")
    protected String idNumberIssueBy; // Nơi cấp CMND/CCCD

    @Column(name = "id_number_issue_date")
    protected Date idNumberIssueDate; // Ngày cấp CMND/CCCD

    @Column(name = "email")
    protected String email; // Địa chỉ email
    @Column(name = "marital_status")
    protected Integer maritalStatus; // DatnConstants.MaritalStatus

    @Column(name = "tax_code")
    private String taxCode; // Mã số thuế

    @Column(name = "education_level")
    protected Integer educationLevel; //DatnConstants.EducationLevel // Trình độ học vấn (tiến sĩ, thạc sĩ, cử nhân, kỹ sư, trung cấp, cao đẳng, ...)

    @Column(name = "height")
    protected Double height; // Chiều cao (cm)

    @Column(name = "weight")
    protected Double weight; // Cân nặng (kg)

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "avatar_id")
    protected FileDescription avatar;

    @OneToMany(mappedBy = "person", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    protected Set<Certificate> certificates; // Chứng chỉ
    public Person() {
        super();
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

    public FileDescription getAvatar() {
        return avatar;
    }

    public void setAvatar(FileDescription avatar) {
        this.avatar = avatar;
    }

    public Set<Certificate> getCertificates() {
        return certificates;
    }

    public void setCertificates(Set<Certificate> certificates) {
        this.certificates = certificates;
    }

}