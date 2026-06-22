package org.pingpongapp.pingsmartclubwebboot.dto;

public final class AttendanceDtos {

    private AttendanceDtos() {
    }

    public record SignInRequest(
        Long scheduleId,
        Long personId,
        String checkInMethod,
        String checkInLocation,
        String deviceInfo,
        String faceCheckResult
    ) {
    }

    public record ConfirmAttendanceRequest(
        Long scheduleId,
        Long bookingId,
        Long studentId,
        String status,
        String remark
    ) {
    }
}
