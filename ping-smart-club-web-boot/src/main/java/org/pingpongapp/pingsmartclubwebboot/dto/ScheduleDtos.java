package org.pingpongapp.pingsmartclubwebboot.dto;

public final class ScheduleDtos {

    private ScheduleDtos() {
    }

    public record ChangeCoachRequest(Long coachId) {
    }
}
