package org.pingpongapp.pingsmartclubwebboot.dto;

public record StatsSummaryResponse(
    Long studentCount,
    Long activeStudentCount,
    Long coachCount,
    Long activeCoachCount,
    Long scheduledCourseCount,
    Long bookedCount,
    Long waitlistCount,
    Long pendingNotificationCount
) {
}
