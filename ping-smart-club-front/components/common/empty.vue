<template>
  <view class="empty-container" :style="{ paddingTop: top + 'rpx' }">
    <view class="empty-content">
      <!-- 图标 -->
      <view class="empty-icon" v-if="icon">
        <image
          v-if="iconType === 'image'"
          :src="icon"
          mode="aspectFit"
          class="empty-image"
        />
        <text v-else class="empty-icon-text">{{ icon }}</text>
      </view>

      <!-- 标题 -->
      <text class="empty-title" v-if="title">{{ title }}</text>

      <!-- 描述 -->
      <text class="empty-description" v-if="description">{{ description }}</text>

      <!-- 操作按钮 -->
      <view class="empty-actions" v-if="showAction">
        <button
          class="empty-action-btn"
          :type="actionType"
          size="mini"
          @click="handleAction"
        >
          {{ actionText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Empty',
  props: {
    // 顶部间距
    top: {
      type: Number,
      default: 200
    },
    // 图标
    icon: {
      type: String,
      default: '📭'
    },
    // 图标类型：text 或 image
    iconType: {
      type: String,
      default: 'text',
      validator: value => ['text', 'image'].includes(value)
    },
    // 标题
    title: {
      type: String,
      default: '暂无数据'
    },
    // 描述
    description: {
      type: String,
      default: ''
    },
    // 是否显示操作按钮
    showAction: {
      type: Boolean,
      default: false
    },
    // 操作按钮文本
    actionText: {
      type: String,
      default: '刷新'
    },
    // 操作按钮类型
    actionType: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    handleAction() {
      this.$emit('action')
    }
  }
}
</script>

<style scoped>
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 400rpx;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  margin-bottom: 40rpx;
}

.empty-image {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.6;
}

.empty-icon-text {
  font-size: 120rpx;
  opacity: 0.6;
}

.empty-title {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.empty-description {
  font-size: 28rpx;
  color: #999;
  line-height: 1.5;
  margin-bottom: 40rpx;
  max-width: 500rpx;
}

.empty-actions {
  margin-top: 20rpx;
}

.empty-action-btn {
  min-width: 160rpx;
}
</style>
