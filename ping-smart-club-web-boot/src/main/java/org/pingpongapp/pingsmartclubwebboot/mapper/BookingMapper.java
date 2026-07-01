package org.pingpongapp.pingsmartclubwebboot.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.Booking;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface BookingMapper extends BaseMapper<Booking> {

    @Select("select * from psc_booking where id = #{id} for update")
    Booking selectByIdForUpdate(@Param("id") Long id);
}
