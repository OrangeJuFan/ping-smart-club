package org.pingpongapp.pingsmartclubwebboot.dto;

import java.time.LocalDateTime;

public final class BookingDtos {

    private BookingDtos() {
    }

    public record CreateBookingRequest(Long scheduleId, Long studentId, String remark) {
    }

    public record CancelBookingRequest(String reason) {
    }

    public record AvailableScheduleResponse(
        Long scheduleId,
        Long courseProductId,
        String courseProductName,
        Long coachId,
        String coachName,
        Long venueId,
        String venueName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer capacity,
        Long bookedCount,
        Long remainingCapacity,
        String status
    ) {
    }
}
