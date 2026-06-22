package org.pingpongapp.pingsmartclubwebboot.dto;

public final class LessonDtos {

    private LessonDtos() {
    }

    public record AdjustLessonRequest(Long studentId, Integer changeHours, String transactionType, String remark) {
    }
}
