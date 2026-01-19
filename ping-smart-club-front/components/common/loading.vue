<template>
  <view class="loading-container" v-if="visible">
    <view class="loading-mask" v-if="mask"></view>
    <view class="loading-content">
      <view class="loading-spinner">
        <view class="loading-dot" v-for="i in 3" :key="i" :style="{ animationDelay: i * 0.2 + 's' }"></view>
      </view>
      <text class="loading-text" v-if="text">{{ text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    // 是否显示
    visible: {
      type: Boolean,
      default: false
    },
    // 是否显示遮罩
    mask: {
      type: Boolean,
      default: true
    },
    // 加载文本
    text: {
      type: String,
      default: '加载中...'
    }
  }
}
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 12rpx;
  padding: 40rpx 60rpx;
  z-index: 1;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.loading-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #fff;
  margin: 0 8rpx;
  animation: loading-bounce 1.4s ease-in-out infinite both;
}

.loading-text {
  font-size: 28rpx;
  color: #fff;
  text-align: center;
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
