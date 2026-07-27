package com.jaimin.portfolio_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Shared payload for every admin bulk action (bulk delete/publish/unpublish/archive). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkIdsRequest {
    private List<Long> ids;
}
