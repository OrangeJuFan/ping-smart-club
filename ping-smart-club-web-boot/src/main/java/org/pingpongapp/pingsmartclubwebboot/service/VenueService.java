package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.mapper.VenueMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.Venue;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class VenueService {

    private final VenueMapper venueMapper;

    public VenueService(VenueMapper venueMapper) {
        this.venueMapper = venueMapper;
    }

    public Venue create(Venue venue) {
        if (!StringUtils.hasText(venue.getName())) {
            throw BusinessException.badRequest("场地名称不能为空");
        }
        if (!StringUtils.hasText(venue.getStatus())) {
            venue.setStatus("AVAILABLE");
        }
        venueMapper.insert(venue);
        return venue;
    }

    public Venue update(Long id, Venue venue) {
        getById(id);
        venue.setId(id);
        venueMapper.updateById(venue);
        return getById(id);
    }

    public Venue getById(Long id) {
        Venue venue = venueMapper.selectById(id);
        if (venue == null) {
            throw BusinessException.notFound("场地不存在");
        }
        return venue;
    }

    public List<Venue> list(String status) {
        return venueMapper.selectList(new LambdaQueryWrapper<Venue>()
            .eq(StringUtils.hasText(status), Venue::getStatus, status)
            .orderByDesc(Venue::getId));
    }
}
