package com.hrm.backend.dto;


import com.hrm.backend.entity.Candidate;

import java.util.Date;


public class CandidateImportExcelDto extends AuditableDto {
    private String firstName; // Tên (Ví dụ: "Văn", "Thị")
    private String lastName; // Họ và tên đệm (Ví dụ: "Nguyễn", "Trần Văn")
    private String displayName; // Họ và tên đầy đủ để hiển thị
    private Date birthDate; // Ngày sinh
    private String birthPlace; // Nơi sinh
    private Integer gender; // DatnConstants.Gender
    private String phoneNumber; // Số điện thoại
    private String idNumber; // Số CMND/CCCD
    private String idNumberIssueBy; // Nơi cấp CMND/CCCD
    private Date idNumberIssueDate; // Ngày cấp CMND/CCCD
    private String email; // Địa chỉ email
    private Integer maritalStatus; // DatnConstants.MaritalStatus
    private String taxCode; // Mã số thuế
    private Integer educationLevel; //DatnConstants.EducationLevel // Trình độ học vấn (tiến sĩ, thạc sĩ, cử nhân, kỹ sư, trung cấp, cao đẳng, ...)
    private Double height; // Chiều cao (cm)
    private Double weight; // Cân nặng (kg)

    private String candidateCode; // ma ung vien
    private String positionCode; // Vị trí ứng tuyển trong phòng ban ứng tuyển)
    private Date submissionDate; // Ngày nop ho so
    private Date interviewDate; // Ngày phong van
    private Double desiredPay; // muc luong mong muon
    private Date possibleWorkingDate; // Ngày co the lam việc
    private Date onboardDate; // Ngày ứng viên nhận việc
    private String introducerCode; // Nhân viên giới thiệu ứng viên
    private String staffCode;
    private Integer candidateStatus; //Xem status: DatnConstants.CandidateStatus
    private String workExperience; // kinh nghiem của ứng viên
    private String recruitmentRequestCode; //yêu cầu tuyển dụng nào

    public CandidateImportExcelDto() {
    }

    public CandidateImportExcelDto(Candidate entity) {
        super(entity);
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
        this.educationLevel = entity.getEducationLevel();
        this.height = entity.getHeight();
        this.weight = entity.getWeight();

        this.candidateCode = entity.getCandidateCode();
        this.positionCode = entity.getPosition() != null && entity.getPosition().getCode() != null ? entity.getPosition().getCode() : "";
        this.submissionDate = entity.getSubmissionDate();
        this.interviewDate = entity.getInterviewDate();
        this.desiredPay = entity.getDesiredPay();
        this.possibleWorkingDate = entity.getPossibleWorkingDate();
        this.onboardDate = entity.getOnboardDate();
        this.introducerCode = entity.getIntroducer() != null && entity.getIntroducer().getStaffCode() != null ? entity.getIntroducer().getStaffCode() : "";
        this.staffCode = entity.getStaff() != null && entity.getStaff().getStaffCode() != null ? entity.getStaff().getStaffCode() : "";
        this.candidateStatus = entity.getCandidateStatus();
        this.workExperience = entity.getWorkExperience();
        this.recruitmentRequestCode = entity.getRecruitmentRequest() != null && entity.getRecruitmentRequest().getCode() != null ? entity.getRecruitmentRequest().getCode() : "";
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

    public String getCandidateCode() {
        return candidateCode;
    }

    public void setCandidateCode(String candidateCode) {
        this.candidateCode = candidateCode;
    }

    public String getPositionCode() {
        return positionCode;
    }

    public void setPositionCode(String positionCode) {
        this.positionCode = positionCode;
    }

    public Date getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(Date submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Date getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(Date interviewDate) {
        this.interviewDate = interviewDate;
    }

    public Double getDesiredPay() {
        return desiredPay;
    }

    public void setDesiredPay(Double desiredPay) {
        this.desiredPay = desiredPay;
    }

    public Date getPossibleWorkingDate() {
        return possibleWorkingDate;
    }

    public void setPossibleWorkingDate(Date possibleWorkingDate) {
        this.possibleWorkingDate = possibleWorkingDate;
    }

    public Date getOnboardDate() {
        return onboardDate;
    }

    public void setOnboardDate(Date onboardDate) {
        this.onboardDate = onboardDate;
    }

    public String getIntroducerCode() {
        return introducerCode;
    }

    public void setIntroducerCode(String introducerCode) {
        this.introducerCode = introducerCode;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public Integer getCandidateStatus() {
        return candidateStatus;
    }

    public void setCandidateStatus(Integer candidateStatus) {
        this.candidateStatus = candidateStatus;
    }

    public String getWorkExperience() {
        return workExperience;
    }

    public void setWorkExperience(String workExperience) {
        this.workExperience = workExperience;
    }

    public String getRecruitmentRequestCode() {
        return recruitmentRequestCode;
    }

    public void setRecruitmentRequestCode(String recruitmentRequestCode) {
        this.recruitmentRequestCode = recruitmentRequestCode;
    }
}

//tao 1 file execl 2000 dòng với tiêu đề tương ứng cho tôi đây là các mã có: positionCode(VI_TRI_1, VI_TRI_2, VI_TRI_3, VI_TRI_4, VI_TRI_5, VI_TRI_6, VI_TRI_7), introducerCode, staffCode (NV25070001, NV25070002, NV25070003, ...den NV25070023), recruitmentRequestCode(TUYEN_UIUX_DESIGNER, TUYEN_BACKEND_SENIOR)