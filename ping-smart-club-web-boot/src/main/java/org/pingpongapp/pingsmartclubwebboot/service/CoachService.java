package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.mapper.AppUserMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.CoachAvailabilityMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.CoachLeaveMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.CoachMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.AppUser;
import org.pingpongapp.pingsmartclubwebboot.pojo.Coach;
import org.pingpongapp.pingsmartclubwebboot.pojo.CoachAvailability;
import org.pingpongapp.pingsmartclubwebboot.pojo.CoachLeave;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CoachService {

    private final CoachMapper coachMapper;
    private final AppUserMapper appUserMapper;
    private final CoachAvailabilityMapper coachAvailabilityMapper;
    private final CoachLeaveMapper coachLeaveMapper;

    public CoachService(CoachMapper coachMapper,
                        AppUserMapper appUserMapper,
                        CoachAvailabilityMapper coachAvailabilityMapper,
                        CoachLeaveMapper coachLeaveMapper) {
        this.coachMapper = coachMapper;
        this.appUserMapper = appUserMapper;
        this.coachAvailabilityMapper = coachAvailabilityMapper;
        this.coachLeaveMapper = coachLeaveMapper;
    }

    public Coach create(Coach coach) {
        if (!StringUtils.hasText(coach.getName())) {
            throw BusinessException.badRequest("教练姓名不能为空");
        }
        if (!StringUtils.hasText(coach.getStatus())) {
            coach.setStatus("ACTIVE");
        }
        coachMapper.insert(coach);
        createLoginUserIfAbsent(coach);
        return coach;
    }

    public Coach update(Long id, Coach coach) {
        getById(id);
        coach.setId(id);
        coachMapper.updateById(coach);
        return getById(id);
    }

    public void disable(Long id) {
        Coach coach = getById(id);
        coach.setStatus("DISABLED");
        coachMapper.updateById(coach);
        disableLoginUsers(id);
    }

    public Coach getById(Long id) {
        Coach coach = coachMapper.selectById(id);
        if (coach == null) {
            throw BusinessException.notFound("教练不存在");
        }
        return coach;
    }

    public List<Coach> list(String keyword, String status) {
        LambdaQueryWrapper<Coach> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(StringUtils.hasText(keyword), w -> w
            .like(Coach::getName, keyword)
            .or()
            .like(Coach::getPhone, keyword));
        wrapper.eq(StringUtils.hasText(status), Coach::getStatus, status);
        wrapper.orderByDesc(Coach::getId);
        return coachMapper.selectList(wrapper);
    }

    public CoachAvailability createAvailability(Long coachId, CoachAvailability availability) {
        getById(coachId);
        availability.setCoachId(coachId);
        if (!StringUtils.hasText(availability.getStatus())) {
            availability.setStatus("ACTIVE");
        }
        coachAvailabilityMapper.insert(availability);
        return availability;
    }

    public List<CoachAvailability> listAvailability(Long coachId) {
        getById(coachId);
        return coachAvailabilityMapper.selectList(new LambdaQueryWrapper<CoachAvailability>()
            .eq(CoachAvailability::getCoachId, coachId)
            .orderByAsc(CoachAvailability::getWeekDay)
            .orderByAsc(CoachAvailability::getStartTime));
    }

    public void deleteAvailability(Long availabilityId) {
        coachAvailabilityMapper.deleteById(availabilityId);
    }

    public CoachLeave createLeave(Long coachId, CoachLeave leave) {
        getById(coachId);
        leave.setCoachId(coachId);
        if (!StringUtils.hasText(leave.getStatus())) {
            leave.setStatus("APPROVED");
        }
        coachLeaveMapper.insert(leave);
        return leave;
    }

    public List<CoachLeave> listLeaves(Long coachId) {
        getById(coachId);
        return coachLeaveMapper.selectList(new LambdaQueryWrapper<CoachLeave>()
            .eq(CoachLeave::getCoachId, coachId)
            .orderByDesc(CoachLeave::getStartTime));
    }

    private void createLoginUserIfAbsent(Coach coach) {
        if (!StringUtils.hasText(coach.getPhone())) {
            return;
        }
        Long count = appUserMapper.selectCount(new LambdaQueryWrapper<AppUser>()
            .eq(AppUser::getRole, "COACH")
            .eq(AppUser::getPhone, coach.getPhone()));
        if (count > 0) {
            return;
        }
        AppUser user = new AppUser();
        user.setUsername("coach_" + coach.getId());
        user.setPhone(coach.getPhone());
        user.setPassword("123456");
        user.setRole("COACH");
        user.setRelatedId(coach.getId());
        user.setDisplayName(coach.getName());
        user.setStatus("ACTIVE");
        appUserMapper.insert(user);
    }

    private void disableLoginUsers(Long coachId) {
        List<AppUser> users = appUserMapper.selectList(new LambdaQueryWrapper<AppUser>()
            .eq(AppUser::getRole, "COACH")
            .eq(AppUser::getRelatedId, coachId));
        users.forEach(user -> {
            user.setStatus("DISABLED");
            appUserMapper.updateById(user);
        });
    }
}
