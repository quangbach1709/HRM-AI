package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Date;

/*
 * ứng viên
 */
@Entity
@Table(name = "tbl_candidate")
@PrimaryKeyJoinColumn(name = "id")
public class Candidate extends Person {
    @Column(name = "candidate_code", unique = true)
    private String candidateCode; // ma ung vien

    @ManyToOne
    @JoinColumn(name = "position_id")
    private Position position; // Vị trí ứng tuyển trong phòng ban ứng tuyển)

    @Column(name = "submission_date")
    private Date submissionDate; // Ngày nop ho so

    @Column(name = "interview_date")
    private Date interviewDate; // Ngày phong van

    @Column(name = "desired_pay")
    private Double desiredPay; // muc luong mong muon

    @Column(name = "possible_working_date")
    private Date possibleWorkingDate; // Ngày co the lam việc

    @Column(name = "onboard_date")
    private Date onboardDate; // Ngày ứng viên nhận việc

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "introducer_id")
    private Staff introducer; // Nhân viên giới thiệu ứng viên

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(name = "candidate_status")
    private Integer candidateStatus; //Xem status: DatnConstants.CandidateStatus

    @Column(name = "work_experience", columnDefinition = "TEXT")
    private String workExperience; // kinh nghiem của ứng viên

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruitment_request_id")
    private RecruitmentRequest recruitmentRequest; //yêu cầu tuyển dụng nào

    public Candidate() {
        super();
    }

    public RecruitmentRequest getRecruitmentRequest() {
        return recruitmentRequest;
    }

    public void setRecruitmentRequest(RecruitmentRequest recruitmentRequest) {
        this.recruitmentRequest = recruitmentRequest;
    }

    public String getWorkExperience() {
        return workExperience;
    }

    public void setWorkExperience(String workExperience) {
        this.workExperience = workExperience;
    }

    public Integer getCandidateStatus() {
        return candidateStatus;
    }

    public void setCandidateStatus(Integer candidateStatus) {
        this.candidateStatus = candidateStatus;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public Staff getIntroducer() {
        return introducer;
    }

    public void setIntroducer(Staff introducer) {
        this.introducer = introducer;
    }

    public Date getOnboardDate() {
        return onboardDate;
    }

    public void setOnboardDate(Date onboardDate) {
        this.onboardDate = onboardDate;
    }

    public Date getPossibleWorkingDate() {
        return possibleWorkingDate;
    }

    public void setPossibleWorkingDate(Date possibleWorkingDate) {
        this.possibleWorkingDate = possibleWorkingDate;
    }

    public Double getDesiredPay() {
        return desiredPay;
    }

    public void setDesiredPay(Double desiredPay) {
        this.desiredPay = desiredPay;
    }

    public Date getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(Date interviewDate) {
        this.interviewDate = interviewDate;
    }

    public Date getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(Date submissionDate) {
        this.submissionDate = submissionDate;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public String getCandidateCode() {
        return candidateCode;
    }

    public void setCandidateCode(String candidateCode) {
        this.candidateCode = candidateCode;
    }
}
