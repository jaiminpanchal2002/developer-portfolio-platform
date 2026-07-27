package com.jaimin.portfolio_backend.dto;

import java.util.List;

import com.jaimin.portfolio_backend.entity.AppointmentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkStatusRequest {
    private List<Long> ids;
    private AppointmentStatus status;
}
