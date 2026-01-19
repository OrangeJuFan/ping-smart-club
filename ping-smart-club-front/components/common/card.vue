<template>
  <view class="card" :class="cardClass" :style="cardStyle" @click="handleClick">
    <!-- 卡片头部 -->
    <view class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <text class="card-title">{{ title }}</text>
        <text class="card-subtitle" v-if="subtitle">{{ subtitle }}</text>
      </slot>
    </view>

    <!-- 卡片主体 -->
    <view class="card-body">
      <slot></slot>
    </view>

    <!-- 卡片底部 -->
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Card',
  props: {
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 副标题
    subtitle: {
      type: String,
      default: ''
    },
    // 阴影深度：none, small, medium, large
    shadow: {
      type: String,
      default: 'small',
      validator: value => ['none', 'small', 'medium', 'large'].includes(value)
    },
    // 圆角大小：none, small, medium, large, round
    radius: {
      type: String,
      default: 'small',
      validator: value => ['none', 'small', 'medium', 'large', 'round'].includes(value)
    },
    // 内边距：none, small, medium, large
    padding: {
      type: String,
      default: 'medium',
      validator: value => ['none', 'small', 'medium', 'large'].includes(value)
    },
    // 背景色
    backgroundColor: {
      type: String,
      default: '#fff'
    },
    // 是否可点击
    clickable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardClass() {
      return [
        `card-shadow-${this.shadow}`,
        `card-radius-${this.radius}`,
        `card-padding-${this.padding}`,
        { 'card-clickable': this.clickable }
      ]
    },
    cardStyle() {
      return {
        backgroundColor: this.backgroundColor
      }
    }
  },
  methods: {
    handleClick() {
      if (this.clickable) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped>
.card {
  background-color: #fff;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:active {
  transform: scale(0.98);
}

/* 阴影样式 */
.card-shadow-none {
  box-shadow: none;
}

.card-shadow-small {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.card-shadow-medium {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.card-shadow-large {
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
}

/* 圆角样式 */
.card-radius-none {
  border-radius: 0;
}

.card-radius-small {
  border-radius: 8rpx;
}

.card-radius-medium {
  border-radius: 12rpx;
}

.card-radius-large {
  border-radius: 16rpx;
}

.card-radius-round {
  border-radius: 24rpx;
}

/* 内边距样式 */
.card-padding-none {
  padding: 0;
}

.card-padding-small {
  padding: 20rpx;
}

.card-padding-medium {
  padding: 32rpx;
}

.card-padding-large {
  padding: 48rpx;
}

/* 卡片头部 */
.card-header {
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.card-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

/* 卡片主体 */
.card-body {
  flex: 1;
}

/* 卡片底部 */
.card-footer {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}
</style>
