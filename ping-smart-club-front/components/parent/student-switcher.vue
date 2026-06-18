<template>
  <view class="student-switcher">
    <picker
      v-if="students.length > 1"
      :range="studentNames"
      :value="currentIndex"
      @change="handleChange"
    >
      <view class="picker-value">
        <text>{{ currentStudent ? currentStudent.name : '选择学员' }}</text>
        <text class="arrow">⌄</text>
      </view>
    </picker>
    <view v-else class="picker-value">
      <text>{{ currentStudent ? currentStudent.name : '未绑定学员' }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StudentSwitcher',
  props: {
    students: {
      type: Array,
      default: () => []
    },
    selectedStudentId: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentIndex() {
      const index = this.students.findIndex(item => item.id === this.selectedStudentId)
      return index >= 0 ? index : 0
    },
    currentStudent() {
      return this.students[this.currentIndex] || null
    },
    studentNames() {
      return this.students.map(item => item.name)
    }
  },
  methods: {
    handleChange(event) {
      const index = Number(event.detail.value || 0)
      const student = this.students[index]
      if (student) this.$emit('change', student.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.student-switcher {
  min-width: 160rpx;
}

.picker-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-height: 54rpx;
  color: #17201d;
  font-size: 34rpx;
  font-weight: 800;
}

.arrow {
  color: #66736d;
  font-size: 28rpx;
}
</style>
