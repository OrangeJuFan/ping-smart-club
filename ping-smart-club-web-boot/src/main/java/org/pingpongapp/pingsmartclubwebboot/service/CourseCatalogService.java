package org.pingpongapp.pingsmartclubwebboot.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.pingpongapp.pingsmartclubwebboot.common.BusinessException;
import org.pingpongapp.pingsmartclubwebboot.mapper.CourseProductMapper;
import org.pingpongapp.pingsmartclubwebboot.mapper.CourseTypeMapper;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseProduct;
import org.pingpongapp.pingsmartclubwebboot.pojo.CourseType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CourseCatalogService {

    private final CourseTypeMapper courseTypeMapper;
    private final CourseProductMapper courseProductMapper;

    public CourseCatalogService(CourseTypeMapper courseTypeMapper, CourseProductMapper courseProductMapper) {
        this.courseTypeMapper = courseTypeMapper;
        this.courseProductMapper = courseProductMapper;
    }

    public CourseType createType(CourseType type) {
        if (!StringUtils.hasText(type.getName())) {
            throw BusinessException.badRequest("课程类型名称不能为空");
        }
        if (!StringUtils.hasText(type.getStatus())) {
            type.setStatus("ACTIVE");
        }
        courseTypeMapper.insert(type);
        return type;
    }

    public CourseType updateType(Long id, CourseType type) {
        getType(id);
        type.setId(id);
        courseTypeMapper.updateById(type);
        return getType(id);
    }

    public CourseType getType(Long id) {
        CourseType type = courseTypeMapper.selectById(id);
        if (type == null) {
            throw BusinessException.notFound("课程类型不存在");
        }
        return type;
    }

    public List<CourseType> listTypes() {
        return courseTypeMapper.selectList(new LambdaQueryWrapper<CourseType>().orderByAsc(CourseType::getId));
    }

    public CourseProduct createProduct(CourseProduct product) {
        getType(product.getCourseTypeId());
        if (!StringUtils.hasText(product.getName())) {
            throw BusinessException.badRequest("课程产品名称不能为空");
        }
        if (product.getLessonCount() == null || product.getLessonCount() <= 0) {
            throw BusinessException.badRequest("课程产品课时数必须大于 0");
        }
        if (product.getBookableCapacity() == null || product.getBookableCapacity() <= 0) {
            throw BusinessException.badRequest("可约人数必须大于 0");
        }
        if (!StringUtils.hasText(product.getStatus())) {
            product.setStatus("ACTIVE");
        }
        courseProductMapper.insert(product);
        return product;
    }

    public CourseProduct updateProduct(Long id, CourseProduct product) {
        getProduct(id);
        product.setId(id);
        courseProductMapper.updateById(product);
        return getProduct(id);
    }

    public CourseProduct getProduct(Long id) {
        CourseProduct product = courseProductMapper.selectById(id);
        if (product == null) {
            throw BusinessException.notFound("课程产品不存在");
        }
        return product;
    }

    public List<CourseProduct> listProducts(String status) {
        return courseProductMapper.selectList(new LambdaQueryWrapper<CourseProduct>()
            .eq(StringUtils.hasText(status), CourseProduct::getStatus, status)
            .orderByDesc(CourseProduct::getId));
    }
}
