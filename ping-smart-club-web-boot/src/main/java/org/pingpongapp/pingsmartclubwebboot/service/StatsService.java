package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.dto.StatsSummaryResponse;
import org.pingpongapp.pingsmartclubwebboot.mapper.*;
import org.pingpongapp.pingsmartclubwebboot.pojo.*;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final StudentMapper studentMapper;
    private final CoachMapper coachMapper;
    private final CourseScheduleMapper courseScheduleMapper;
    private final BookingMapper bookingMapper;
    private final WaitlistEntryMapper waitlistEntryMapper;
    private final NotificationRecordMapper notificationRecordMapper;

    public StatsService(StudentMapper studentMapper,
                        CoachMapper coachMapper,
                        CourseScheduleMapper courseScheduleMapper,
                        BookingMapper bookingMapper,
                        WaitlistEntryMapper waitlistEntryMapper,
                        NotificationRecordMapper notificationRecordMapper) {
        this.studentMapper = studentMapper;
        this.coachMapper = coachMapper;
        this.courseScheduleMapper = courseScheduleMapper;
        this.bookingMapper = bookingMapper;
        this.waitlistEntryMapper = waitlistEntryMapper;
        this.notificationRecordMapper = notificationRecordMapper;
    }

    public StatsSummaryResponse summary() {
        return new StatsSummaryResponse(
            studentMapper.selectCount(null),
            studentMapper.selectCount(new LambdaQueryWrapper<Student>().eq(Student::getStatus, "ACTIVE")),
            coachMapper.selectCount(null),
            coachMapper.selectCount(new LambdaQueryWrapper<Coach>().eq(Coach::getStatus, "ACTIVE")),
            courseScheduleMapper.selectCount(new LambdaQueryWrapper<CourseSchedule>().eq(CourseSchedule::getStatus, "SCHEDULED")),
            bookingMapper.selectCount(new LambdaQueryWrapper<Booking>().eq(Booking::getStatus, "BOOKED")),
            waitlistEntryMapper.selectCount(new LambdaQueryWrapper<WaitlistEntry>().eq(WaitlistEntry::getStatus, "WAITING")),
            notificationRecordMapper.selectCount(new LambdaQueryWrapper<NotificationRecord>().eq(NotificationRecord::getStatus, "PENDING"))
        );
    }
}
