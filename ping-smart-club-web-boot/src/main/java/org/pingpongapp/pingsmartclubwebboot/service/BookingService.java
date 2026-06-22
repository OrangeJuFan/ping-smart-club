package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.dto.BookingDtos;
import org.pingpongapp.pingsmartclubwebboot.mapper.BookingMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.WaitlistEntryMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.Booking;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseProduct;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseSchedule;
import org.pingpongapp.pingsmartclubwebboot.pojo.WaitlistEntry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingMapper bookingMapper;
    private final WaitlistEntryMapper waitlistEntryMapper;
    private final ScheduleService scheduleService;
    private final CourseCatalogService courseCatalogService;
    private final StudentService studentService;
    private final LessonAccountService lessonAccountService;
    private final NotificationService notificationService;

    public BookingService(BookingMapper bookingMapper,
                          WaitlistEntryMapper waitlistEntryMapper,
                          ScheduleService scheduleService,
                          CourseCatalogService courseCatalogService,
                          StudentService studentService,
                          LessonAccountService lessonAccountService,
                          NotificationService notificationService) {
        this.bookingMapper = bookingMapper;
        this.waitlistEntryMapper = waitlistEntryMapper;
        this.scheduleService = scheduleService;
        this.courseCatalogService = courseCatalogService;
        this.studentService = studentService;
        this.lessonAccountService = lessonAccountService;
        this.notificationService = notificationService;
    }

    public List<BookingDtos.AvailableScheduleResponse> listAvailable() {
        return scheduleService.list(null, null, null, "SCHEDULED").stream()
            .filter(schedule -> schedule.getStartTime().isAfter(LocalDateTime.now()))
            .map(schedule -> new BookingDtos.AvailableScheduleResponse(
                schedule.getId(),
                schedule.getCourseProductId(),
                schedule.getCourseProductName(),
                schedule.getCoachId(),
                schedule.getCoachName(),
                schedule.getVenueId(),
                schedule.getVenueName(),
                schedule.getStartTime(),
                schedule.getEndTime(),
                schedule.getCapacity(),
                countBooked(schedule.getId()),
                Math.max(schedule.getCapacity() - countBooked(schedule.getId()), 0),
                schedule.getStatus()
            ))
            .toList();
    }

    @Transactional
    public Booking createBooking(Long scheduleId, Long studentId, String source, String remark) {
        CourseSchedule schedule = scheduleService.getById(scheduleId);
        if (!"SCHEDULED".equals(schedule.getStatus())) {
            throw BusinessException.badRequest("课程安排不可预约");
        }
        studentService.getById(studentId);
        CourseProduct product = courseCatalogService.getProduct(schedule.getCourseProductId());
        lessonAccountService.assertEnough(studentId, product.getLessonCount());
        assertNoDuplicate(scheduleId, studentId);
        if (countBooked(scheduleId) >= schedule.getCapacity()) {
            throw BusinessException.conflict("课程名额已满，可加入候补");
        }
        Booking booking = new Booking();
        booking.setScheduleId(scheduleId);
        booking.setStudentId(studentId);
        booking.setStatus("BOOKED");
        booking.setSource(source);
        booking.setRemark(remark);
        booking.setBookedAt(LocalDateTime.now());
        bookingMapper.insert(booking);
        notificationService.createSystemNotification("BOOKING_SUCCESS", "STUDENT", studentId, "预约成功",
            "已成功预约课程：" + schedule.getCourseProductName());
        return booking;
    }

    @Transactional
    public Booking joinWaitlist(Long scheduleId, Long studentId, String source, String remark) {
        CourseSchedule schedule = scheduleService.getById(scheduleId);
        studentService.getById(studentId);
        assertNoDuplicate(scheduleId, studentId);
        if (countBooked(scheduleId) < schedule.getCapacity()) {
            throw BusinessException.badRequest("课程仍有余位，请直接预约");
        }
        int queueNo = waitlistEntryMapper.selectList(new LambdaQueryWrapper<WaitlistEntry>()
            .eq(WaitlistEntry::getScheduleId, scheduleId)).size() + 1;
        WaitlistEntry entry = new WaitlistEntry();
        entry.setScheduleId(scheduleId);
        entry.setStudentId(studentId);
        entry.setQueueNo(queueNo);
        entry.setStatus("WAITING");
        entry.setJoinedAt(LocalDateTime.now());
        waitlistEntryMapper.insert(entry);

        Booking booking = new Booking();
        booking.setScheduleId(scheduleId);
        booking.setStudentId(studentId);
        booking.setStatus("WAITING");
        booking.setSource(source);
        booking.setRemark(remark);
        booking.setBookedAt(LocalDateTime.now());
        bookingMapper.insert(booking);
        notificationService.createSystemNotification("WAITLIST_JOINED", "STUDENT", studentId, "候补成功",
            "已加入课程候补队列：" + schedule.getCourseProductName());
        return booking;
    }

    @Transactional
    public Booking cancel(Long bookingId, String reason) {
        Booking booking = getById(bookingId);
        if (!"BOOKED".equals(booking.getStatus()) && !"WAITING".equals(booking.getStatus())) {
            throw BusinessException.badRequest("当前预约状态不可取消");
        }
        boolean releaseSeat = "BOOKED".equals(booking.getStatus());
        boolean cancelWaitlist = "WAITING".equals(booking.getStatus());
        booking.setStatus("CANCELLED");
        booking.setCancelReason(reason);
        booking.setCanceledAt(LocalDateTime.now());
        bookingMapper.updateById(booking);
        if (cancelWaitlist) {
            cancelWaitlistEntry(booking.getScheduleId(), booking.getStudentId());
        }
        notificationService.createSystemNotification("BOOKING_CANCELLED", "STUDENT", booking.getStudentId(), "预约取消",
            "你的预约已取消");
        if (releaseSeat) {
            promoteFirstWaitlist(booking.getScheduleId());
        }
        return booking;
    }

    @Transactional
    public Booking complete(Long bookingId, String remark) {
        Booking booking = getById(bookingId);
        if (!"BOOKED".equals(booking.getStatus())) {
            throw BusinessException.badRequest("只有已预约状态可以确认完成");
        }
        CourseSchedule schedule = scheduleService.getById(booking.getScheduleId());
        CourseProduct product = courseCatalogService.getProduct(schedule.getCourseProductId());
        lessonAccountService.consume(booking.getStudentId(), bookingId, product.getLessonCount(), remark);
        booking.setStatus("COMPLETED");
        booking.setCompletedAt(LocalDateTime.now());
        bookingMapper.updateById(booking);
        return booking;
    }

    public Booking markAbsent(Long bookingId, String remark) {
        Booking booking = getById(bookingId);
        booking.setStatus("ABSENT");
        booking.setRemark(remark);
        bookingMapper.updateById(booking);
        return booking;
    }

    public Booking getById(Long bookingId) {
        Booking booking = bookingMapper.selectById(bookingId);
        if (booking == null) {
            throw BusinessException.notFound("预约记录不存在");
        }
        return booking;
    }

    public List<Booking> list(Long studentId, Long scheduleId, String status) {
        return bookingMapper.selectList(new LambdaQueryWrapper<Booking>()
            .eq(studentId != null, Booking::getStudentId, studentId)
            .eq(scheduleId != null, Booking::getScheduleId, scheduleId)
            .eq(status != null && !status.isBlank(), Booking::getStatus, status)
            .orderByDesc(Booking::getId));
    }

    public long countBooked(Long scheduleId) {
        return bookingMapper.selectCount(new LambdaQueryWrapper<Booking>()
            .eq(Booking::getScheduleId, scheduleId)
            .eq(Booking::getStatus, "BOOKED"));
    }

    private void assertNoDuplicate(Long scheduleId, Long studentId) {
        Long count = bookingMapper.selectCount(new LambdaQueryWrapper<Booking>()
            .eq(Booking::getScheduleId, scheduleId)
            .eq(Booking::getStudentId, studentId)
            .in(Booking::getStatus, List.of("BOOKED", "WAITING")));
        if (count > 0) {
            throw BusinessException.conflict("不能重复预约同一课程");
        }
    }

    private void promoteFirstWaitlist(Long scheduleId) {
        CourseSchedule schedule = scheduleService.getById(scheduleId);
        if (countBooked(scheduleId) >= schedule.getCapacity()) {
            return;
        }
        List<WaitlistEntry> entries = waitlistEntryMapper.selectList(new LambdaQueryWrapper<WaitlistEntry>()
            .eq(WaitlistEntry::getScheduleId, scheduleId)
            .eq(WaitlistEntry::getStatus, "WAITING")
            .orderByAsc(WaitlistEntry::getQueueNo)
            .last("limit 1"));
        if (entries.isEmpty()) {
            return;
        }
        WaitlistEntry entry = entries.get(0);
        Booking waitingBooking = bookingMapper.selectOne(new LambdaQueryWrapper<Booking>()
            .eq(Booking::getScheduleId, scheduleId)
            .eq(Booking::getStudentId, entry.getStudentId())
            .eq(Booking::getStatus, "WAITING")
            .last("limit 1"));
        if (waitingBooking == null) {
            entry.setStatus("CANCELLED");
            waitlistEntryMapper.updateById(entry);
            return;
        }
        waitingBooking.setStatus("BOOKED");
        bookingMapper.updateById(waitingBooking);
        entry.setStatus("PROMOTED");
        entry.setPromotedAt(LocalDateTime.now());
        waitlistEntryMapper.updateById(entry);
        notificationService.createSystemNotification("WAITLIST_PROMOTED", "STUDENT", entry.getStudentId(), "候补转预约",
            "候补课程已自动转为预约：" + schedule.getCourseProductName());
    }

    private void cancelWaitlistEntry(Long scheduleId, Long studentId) {
        WaitlistEntry entry = waitlistEntryMapper.selectOne(new LambdaQueryWrapper<WaitlistEntry>()
            .eq(WaitlistEntry::getScheduleId, scheduleId)
            .eq(WaitlistEntry::getStudentId, studentId)
            .eq(WaitlistEntry::getStatus, "WAITING")
            .last("limit 1"));
        if (entry != null) {
            entry.setStatus("CANCELLED");
            waitlistEntryMapper.updateById(entry);
        }
    }
}
