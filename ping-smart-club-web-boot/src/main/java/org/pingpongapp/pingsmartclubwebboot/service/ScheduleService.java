package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.mapper.CourseScheduleMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.Coach;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseProduct;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseSchedule;
import org.pingpongapp.pingsmartclubwebboot.pojo.Venue;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleService {

    private final CourseScheduleMapper courseScheduleMapper;
    private final CourseCatalogService courseCatalogService;
    private final CoachService coachService;
    private final VenueService venueService;
    private final NotificationService notificationService;

    public ScheduleService(CourseScheduleMapper courseScheduleMapper,
                           CourseCatalogService courseCatalogService,
                           CoachService coachService,
                           VenueService venueService,
                           NotificationService notificationService) {
        this.courseScheduleMapper = courseScheduleMapper;
        this.courseCatalogService = courseCatalogService;
        this.coachService = coachService;
        this.venueService = venueService;
        this.notificationService = notificationService;
    }

    public CourseSchedule create(CourseSchedule schedule) {
        fillNamesAndValidate(schedule);
        validateTime(schedule);
        validateConflict(null, schedule.getCoachId(), schedule.getVenueId(), schedule.getStartTime(), schedule.getEndTime());
        if (!StringUtils.hasText(schedule.getStatus())) {
            schedule.setStatus("SCHEDULED");
        }
        courseScheduleMapper.insert(schedule);
        return schedule;
    }

    public CourseSchedule update(Long id, CourseSchedule schedule) {
        getById(id);
        schedule.setId(id);
        fillNamesAndValidate(schedule);
        validateTime(schedule);
        validateConflict(id, schedule.getCoachId(), schedule.getVenueId(), schedule.getStartTime(), schedule.getEndTime());
        courseScheduleMapper.updateById(schedule);
        return getById(id);
    }

    public void cancel(Long id) {
        CourseSchedule schedule = getById(id);
        schedule.setStatus("CANCELLED");
        courseScheduleMapper.updateById(schedule);
        notificationService.createSystemNotification("COURSE_CANCELLED", "ALL", null, "课程取消通知",
            "课程安排 " + schedule.getCourseProductName() + " 已取消");
    }

    public CourseSchedule changeCoach(Long id, Long coachId) {
        CourseSchedule schedule = getById(id);
        Coach coach = coachService.getById(coachId);
        validateConflict(id, coachId, schedule.getVenueId(), schedule.getStartTime(), schedule.getEndTime());
        schedule.setCoachId(coachId);
        schedule.setCoachName(coach.getName());
        courseScheduleMapper.updateById(schedule);
        notificationService.createSystemNotification("COURSE_CHANGED", "ALL", null, "调课通知",
            "课程安排 " + schedule.getCourseProductName() + " 已调整教练为 " + coach.getName());
        return getById(id);
    }

    public CourseSchedule getById(Long id) {
        CourseSchedule schedule = courseScheduleMapper.selectById(id);
        if (schedule == null) {
            throw BusinessException.notFound("课程安排不存在");
        }
        return schedule;
    }

    public List<CourseSchedule> list(LocalDate date, Long coachId, Long venueId, String status) {
        LambdaQueryWrapper<CourseSchedule> wrapper = new LambdaQueryWrapper<>();
        if (date != null) {
            LocalDateTime start = date.atStartOfDay();
            wrapper.ge(CourseSchedule::getStartTime, start)
                .lt(CourseSchedule::getStartTime, start.plusDays(1));
        }
        wrapper.eq(coachId != null, CourseSchedule::getCoachId, coachId)
            .eq(venueId != null, CourseSchedule::getVenueId, venueId)
            .eq(StringUtils.hasText(status), CourseSchedule::getStatus, status)
            .orderByAsc(CourseSchedule::getStartTime);
        return courseScheduleMapper.selectList(wrapper);
    }

    private void fillNamesAndValidate(CourseSchedule schedule) {
        CourseProduct product = courseCatalogService.getProduct(schedule.getCourseProductId());
        Coach coach = coachService.getById(schedule.getCoachId());
        Venue venue = venueService.getById(schedule.getVenueId());
        if (!"ACTIVE".equals(product.getStatus())) {
            throw BusinessException.badRequest("课程产品不是启用状态");
        }
        if (!"ACTIVE".equals(coach.getStatus())) {
            throw BusinessException.badRequest("教练不是启用状态");
        }
        if (!"AVAILABLE".equals(venue.getStatus())) {
            throw BusinessException.badRequest("场地不可用");
        }
        schedule.setCourseProductName(product.getName());
        schedule.setCoachName(coach.getName());
        schedule.setVenueName(venue.getName());
        if (schedule.getCapacity() == null || schedule.getCapacity() <= 0) {
            schedule.setCapacity(product.getBookableCapacity());
        }
    }

    private void validateTime(CourseSchedule schedule) {
        if (schedule.getStartTime() == null || schedule.getEndTime() == null) {
            throw BusinessException.badRequest("课程开始和结束时间不能为空");
        }
        if (!schedule.getEndTime().isAfter(schedule.getStartTime())) {
            throw BusinessException.badRequest("课程结束时间必须晚于开始时间");
        }
    }

    private void validateConflict(Long excludeScheduleId, Long coachId, Long venueId, LocalDateTime startTime, LocalDateTime endTime) {
        Long coachConflict = courseScheduleMapper.selectCount(new LambdaQueryWrapper<CourseSchedule>()
            .ne(excludeScheduleId != null, CourseSchedule::getId, excludeScheduleId)
            .eq(CourseSchedule::getCoachId, coachId)
            .ne(CourseSchedule::getStatus, "CANCELLED")
            .lt(CourseSchedule::getStartTime, endTime)
            .gt(CourseSchedule::getEndTime, startTime));
        if (coachConflict > 0) {
            throw BusinessException.conflict("教练时间冲突");
        }
        Long venueConflict = courseScheduleMapper.selectCount(new LambdaQueryWrapper<CourseSchedule>()
            .ne(excludeScheduleId != null, CourseSchedule::getId, excludeScheduleId)
            .eq(CourseSchedule::getVenueId, venueId)
            .ne(CourseSchedule::getStatus, "CANCELLED")
            .lt(CourseSchedule::getStartTime, endTime)
            .gt(CourseSchedule::getEndTime, startTime));
        if (venueConflict > 0) {
            throw BusinessException.conflict("场地时间冲突");
        }
    }
}
