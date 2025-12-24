package com.hrm.backend.dto;


import com.hrm.backend.entity.Candidate;
import jakarta.validation.Valid;

import java.util.Date;
import java.util.UUID;

@Valid
public class CandidateDto extends PersonDto {
    private String candidateCode; // ma ung vien
    private PositionDto position; // Vị trí ứng tuyển trong phòng ban ứng tuyển)
    private Date submissionDate; // Ngày nop ho so
    private Date interviewDate; // Ngày phong van
    private Double desiredPay; // muc luong mong muon
    private Date possibleWorkingDate; // Ngày co the lam việc
    private Date onboardDate; // Ngày ứng viên nhận việc
    private StaffDto introducer; // Nhân viên giới thiệu ứng viên
    private StaffDto staff;
    private Integer candidateStatus; //Xem status: DatnConstants.CandidateStatus
    private String workExperience; // kinh nghiem của ứng viên
    private RecruitmentRequestDto recruitmentRequest; //yêu cầu tuyển dụng nào

    public CandidateDto() {
        super();
    }

    public CandidateDto(UUID id, String displayName, String candidateCode) {
        this.setId(id);
        this.setDisplayName(displayName);
        this.setCandidateCode(candidateCode);
    }

    public CandidateDto(Candidate entity, Boolean isGetFull) {
        super(entity, isGetFull);
        if (entity != null) {
            this.candidateCode = entity.getCandidateCode();
            this.position = new PositionDto(entity.getPosition(), true, true);
            this.submissionDate = entity.getSubmissionDate();
            this.interviewDate = entity.getInterviewDate();
            this.desiredPay = entity.getDesiredPay();
            this.possibleWorkingDate = entity.getPossibleWorkingDate();
            this.onboardDate = entity.getOnboardDate();
            this.introducer = new StaffDto(entity.getIntroducer(), false);
            this.staff = new StaffDto(entity.getStaff(), false);
            this.candidateStatus = entity.getCandidateStatus();
            this.workExperience = entity.getWorkExperience();
            if (entity.getRecruitmentRequest() != null) {
                this.recruitmentRequest = new RecruitmentRequestDto(entity.getRecruitmentRequest(), false);
            }
            if (isGetFull) {
            }
        }
    }

    public String getCandidateCode() {
        return candidateCode;
    }

    public void setCandidateCode(String candidateCode) {
        this.candidateCode = candidateCode;
    }

    public PositionDto getPosition() {
        return position;
    }

    public void setPosition(PositionDto position) {
        this.position = position;
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

    public StaffDto getIntroducer() {
        return introducer;
    }

    public void setIntroducer(StaffDto introducer) {
        this.introducer = introducer;
    }

    public StaffDto getStaff() {
        return staff;
    }

    public void setStaff(StaffDto staff) {
        this.staff = staff;
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

    public RecruitmentRequestDto getRecruitmentRequest() {
        return recruitmentRequest;
    }

    public void setRecruitmentRequest(RecruitmentRequestDto recruitmentRequest) {
        this.recruitmentRequest = recruitmentRequest;
    }
}
