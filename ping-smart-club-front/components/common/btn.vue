<template>
  <button
    class="custom-btn"
    :class="btnClass"
    :style="btnStyle"
    :disabled="disabled || loading"
    :loading="loading"
    @click="handleClick"
  >
    <!-- 加载状态 -->
    <view class="btn-loading" v-if="loading">
      <view class="loading-spinner">
        <view class="loading-dot" v-for="i in 3" :key="i" :style="{ animationDelay: i * 0.2 + 's' }"></view>
      </view>
    </view>

    <!-- 图标 -->
    <view class="btn-icon" v-if="icon && !loading">
      <image v-if="iconType === 'image'" :src="icon" class="btn-icon-image" />
      <text v-else class="btn-icon-text">{{ icon }}</text>
    </view>

    <!-- 文本 -->
    <text class="btn-text" v-if="$slots.default || text">
      <slot>{{ text }}</slot>
    </text>

    <!-- 右侧图标 -->
    <view class="btn-icon-right" v-if="iconRight && !loading">
      <image v-if="iconRightType === 'image'" :src="iconRight" class="btn-icon-image" />
      <text v-else class="btn-icon-text">{{ iconRight }}</text>
    </view>
  </button>
</template>

<script>
export default {
  name: 'Btn',
  props: {
    // 按钮文本
    text: {
      type: String,
      default: ''
    },
    // 按钮类型：primary, secondary, success, warning, danger, info
    type: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    // 按钮尺寸：small, medium, large
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    // 按钮形状：square, round, circle
    shape: {
      type: String,
      default: 'round',
      validator: value => ['square', 'round', 'circle'].includes(value)
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 加载文本
    loadingText: {
      type: String,
      default: '加载中...'
    },
    // 左侧图标
    icon: {
      type: String,
      default: ''
    },
    // 左侧图标类型：text, image
    iconType: {
      type: String,
      default: 'text',
      validator: value => ['text', 'image'].includes(value)
    },
    // 右侧图标
    iconRight: {
      type: String,
      default: ''
    },
    // 右侧图标类型：text, image
    iconRightType: {
      type: String,
      default: 'text',
      validator: value => ['text', 'image'].includes(value)
    },
    // 是否块级按钮
    block: {
      type: Boolean,
      default: false
    },
    // 是否镂空
    plain: {
      type: Boolean,
      default: false
    },
    // 自定义背景色
    backgroundColor: {
      type: String,
      default: ''
    },
    // 自定义文字颜色
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    btnClass() {
      return [
        `btn-${this.type}`,
        `btn-${this.size}`,
        `btn-${this.shape}`,
        {
          'btn-block': this.block,
          'btn-plain': this.plain,
          'btn-disabled': this.disabled,
          'btn-loading': this.loading
        }
      ]
    },
    btnStyle() {
      const style = {}
      if (this.backgroundColor) {
        style.backgroundColor = this.backgroundColor
        if (this.plain) {
          style.borderColor = this.backgroundColor
        }
      }
      if (this.color) {
        style.color = this.color
      }
      return style
    }
  },
  methods: {
    handleClick() {
      if (!this.disabled && !this.loading) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped>
.custom-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.custom-btn:not(.btn-disabled):not(.btn-loading):active {
  transform: scale(0.98);
}

/* 按钮类型 */
.btn-primary {
  background-color: #007aff;
  color: #fff;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #333;
}

.btn-success {
  background-color: #28a745;
  color: #fff;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
}

.btn-info {
  background-color: #17a2b8;
  color: #fff;
}

/* 镂空样式 */
.btn-plain.btn-primary {
  background-color: transparent;
  color: #007aff;
  border: 2rpx solid #007aff;
}

.btn-plain.btn-secondary {
  background-color: transparent;
  color: #333;
  border: 2rpx solid #ddd;
}

.btn-plain.btn-success {
  background-color: transparent;
  color: #28a745;
  border: 2rpx solid #28a745;
}

.btn-plain.btn-warning {
  background-color: transparent;
  color: #ffc107;
  border: 2rpx solid #ffc107;
}

.btn-plain.btn-danger {
  background-color: transparent;
  color: #dc3545;
  border: 2rpx solid #dc3545;
}

.btn-plain.btn-info {
  background-color: transparent;
  color: #17a2b8;
  border: 2rpx solid #17a2b8;
}

/* 按钮尺寸 */
.btn-small {
  padding: 16rpx 32rpx;
  font-size: 24rpx;
  height: 64rpx;
  min-width: 120rpx;
}

.btn-medium {
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  height: 80rpx;
  min-width: 160rpx;
}

.btn-large {
  padding: 24rpx 48rpx;
  font-size: 32rpx;
  height: 96rpx;
  min-width: 200rpx;
}

/* 按钮形状 */
.btn-square {
  border-radius: 0;
}

.btn-round {
  border-radius: 8rpx;
}

.btn-circle {
  border-radius: 50%;
  padding: 0;
  width: 80rpx;
  height: 80rpx;
  min-width: 80rpx;
}

/* 块级按钮 */
.btn-block {
  width: 100%;
}

/* 禁用状态 */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载状态 */
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.loading-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: currentColor;
  margin: 0 4rpx;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

/* 图标 */
.btn-icon {
  margin-right: 12rpx;
}

.btn-icon-right {
  margin-left: 12rpx;
}

.btn-icon-image {
  width: 32rpx;
  height: 32rpx;
}

.btn-icon-text {
  font-size: 32rpx;
}

/* 文本 */
.btn-text {
  font-weight: 500;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
