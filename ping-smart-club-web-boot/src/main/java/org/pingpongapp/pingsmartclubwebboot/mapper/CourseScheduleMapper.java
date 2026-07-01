package org.pingpongapp.pingsmartclubwebboot.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseSchedule;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

public interface CourseScheduleMapper extends BaseMapper<CourseSchedule> {

    @Select("select * from psc_course_schedule where id = #{id} for update")
    CourseSchedule selectByIdForUpdate(@Param("id") Long id);

    @Select({
        "<script>",
        "select id from psc_course_schedule",
        "where coach_id = #{coachId}",
        "and status != 'CANCELLED'",
        "and start_time &lt; #{endTime}",
        "and end_time &gt; #{startTime}",
        "<if test='excludeScheduleId != null'>and id != #{excludeScheduleId}</if>",
        "for update",
        "</script>"
    })
    List<Long> selectCoachConflictIdsForUpdate(@Param("excludeScheduleId") Long excludeScheduleId,
                                               @Param("coachId") Long coachId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);

    @Select({
        "<script>",
        "select id from psc_course_schedule",
        "where venue_id = #{venueId}",
        "and status != 'CANCELLED'",
        "and start_time &lt; #{endTime}",
        "and end_time &gt; #{startTime}",
        "<if test='excludeScheduleId != null'>and id != #{excludeScheduleId}</if>",
        "for update",
        "</script>"
    })
    List<Long> selectVenueConflictIdsForUpdate(@Param("excludeScheduleId") Long excludeScheduleId,
                                               @Param("venueId") Long venueId,
                                               @Param("startTime") LocalDateTime startTime,
                                               @Param("endTime") LocalDateTime endTime);
}
