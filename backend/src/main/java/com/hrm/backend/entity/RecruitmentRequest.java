package com.hrm.backend.entity;

import jakarta.persistence.*;

import java.util.Date;

// yeu cau tuyen dung
@Table(name = "tbl_recruitment_request")
@Entity
public class RecruitmentRequest extends BaseObject {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposer_id")
    private Staff proposer; // Người đề xuất

    @Column(name = "proposal_date")
    private Date proposalDate; // Ngày đề xuất

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id")
    private Position position; // Vị trí cần tuyển

    // Mô tả, yêu cầu công việc
    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // mo ta cong viec
    @Column(name = "request", columnDefinition = "TEXT")
    private String request; // yeu cau

    public RecruitmentRequest() {
    }

    public Staff getProposer() {
        return proposer;
    }

    public void setProposer(Staff proposer) {
        this.proposer = proposer;
    }

    public Date getProposalDate() {
        return proposalDate;
    }

    public void setProposalDate(Date proposalDate) {
        this.proposalDate = proposalDate;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    @Override
    public String getDescription() {
        return description;
    }

    @Override
    public void setDescription(String description) {
        this.description = description;
    }

    public String getRequest() {
        return request;
    }

    public void setRequest(String request) {
        this.request = request;
    }
}
