package org.pingpongapp.pingsmartclubwebboot.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.LessonAccount;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface LessonAccountMapper extends BaseMapper<LessonAccount> {

    @Select("select * from psc_lesson_account where student_id = #{studentId} for update")
    LessonAccount selectByStudentIdForUpdate(@Param("studentId") Long studentId);
}
