package com.hrm.backend.dto;


import com.hrm.backend.entity.RecruitmentRequest;

import java.util.Date;

public class RecruitmentRequestDto extends BaseObjectDto {
    private StaffDto proposer; // Người đề xuất
    private Date proposalDate; // Ngày đề xuất
    private PositionDto position; //Vị trí cần tuyển
    private String request; // yeu cau

    public RecruitmentRequestDto() {
    }

    public RecruitmentRequestDto(RecruitmentRequest entity, Boolean isGetFull) {
        super(entity);
        if (entity != null) {
            this.proposer = new StaffDto(entity.getProposer(), false);
            this.proposalDate = entity.getProposalDate();
            this.position = new PositionDto(entity.getPosition(), false, false);
            this.request = entity.getRequest();

            if (isGetFull) {
                //todo
            }
        }
    }

    public StaffDto getProposer() {
        return proposer;
    }

    public void setProposer(StaffDto proposer) {
        this.proposer = proposer;
    }

    public Date getProposalDate() {
        return proposalDate;
    }

    public void setProposalDate(Date proposalDate) {
        this.proposalDate = proposalDate;
    }

    public PositionDto getPosition() {
        return position;
    }

    public void setPosition(PositionDto position) {
        this.position = position;
    }

    public String getRequest() {
        return request;
    }

    public void setRequest(String request) {
        this.request = request;
    }
}