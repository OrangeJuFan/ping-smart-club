package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.dto.AttendanceDtos;
import org.pingpongapp.pingsmartclubwebboot.mapper.AttendanceRecordMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.AttendanceRecord;
import org.pingpongapp.pingsmartclubwebboot.pojo.Booking;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRecordMapper attendanceRecordMapper;
    private final BookingService bookingService;

    public AttendanceService(AttendanceRecordMapper attendanceRecordMapper, BookingService bookingService) {
        this.attendanceRecordMapper = attendanceRecordMapper;
        this.bookingService = bookingService;
    }

    public AttendanceRecord signIn(String personType, AttendanceDtos.SignInRequest request) {
        if (request.scheduleId() == null || request.personId() == null) {
            throw BusinessException.badRequest("课程安排和签到人员不能为空");
        }
        AttendanceRecord record = findExisting(request.scheduleId(), personType, request.personId());
        if (record == null) {
            record = new AttendanceRecord();
            record.setScheduleId(request.scheduleId());
            record.setPersonType(personType);
            record.setPersonId(request.personId());
        }
        record.setStatus("SIGNED_IN");
        record.setCheckInTime(LocalDateTime.now());
        record.setCheckInMethod(request.checkInMethod());
        record.setCheckInLocation(request.checkInLocation());
        record.setDeviceInfo(request.deviceInfo());
        record.setFaceCheckResult(request.faceCheckResult());
        if (record.getId() == null) {
            attendanceRecordMapper.insert(record);
        } else {
            attendanceRecordMapper.updateById(record);
        }
        return record;
    }

    @Transactional
    public AttendanceRecord confirm(AttendanceDtos.ConfirmAttendanceRequest request) {
        if (request.scheduleId() == null || request.studentId() == null) {
            throw BusinessException.badRequest("课程安排和学员不能为空");
        }
        AttendanceRecord record = findExisting(request.scheduleId(), "STUDENT", request.studentId());
        if (record == null) {
            record = new AttendanceRecord();
            record.setScheduleId(request.scheduleId());
            record.setPersonType("STUDENT");
            record.setPersonId(request.studentId());
        }
        record.setBookingId(request.bookingId());
        record.setStatus(request.status());
        record.setConfirmedAt(LocalDateTime.now());
        record.setRemark(request.remark());
        if (record.getId() == null) {
            attendanceRecordMapper.insert(record);
        } else {
            attendanceRecordMapper.updateById(record);
        }
        if (request.bookingId() != null) {
            if ("ATTENDED".equals(request.status())) {
                bookingService.complete(request.bookingId(), request.remark());
            } else if ("ABSENT".equals(request.status())) {
                bookingService.markAbsent(request.bookingId(), request.remark());
            }
        }
        return record;
    }

    public List<AttendanceRecord> list(Long scheduleId, Long personId, String personType) {
        return attendanceRecordMapper.selectList(new LambdaQueryWrapper<AttendanceRecord>()
            .eq(scheduleId != null, AttendanceRecord::getScheduleId, scheduleId)
            .eq(personId != null, AttendanceRecord::getPersonId, personId)
            .eq(personType != null && !personType.isBlank(), AttendanceRecord::getPersonType, personType)
            .orderByDesc(AttendanceRecord::getId));
    }

    public List<AttendanceRecord> listByStudent(Long studentId) {
        return list(null, studentId, "STUDENT");
    }

    public List<Booking> listCourseRecords(Long studentId) {
        return bookingService.list(studentId, null, null);
    }

    private AttendanceRecord findExisting(Long scheduleId, String personType, Long personId) {
        return attendanceRecordMapper.selectOne(new LambdaQueryWrapper<AttendanceRecord>()
            .eq(AttendanceRecord::getScheduleId, scheduleId)
            .eq(AttendanceRecord::getPersonType, personType)
            .eq(AttendanceRecord::getPersonId, personId)
            .last("limit 1"));
    }
}
