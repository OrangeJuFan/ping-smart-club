<template>
  <view class="page-nav">
    <uni-nav-bar
      :title="title"
      left-icon="left"
      :border="false"
      background-color="#f7f8f4"
      color="#17201d"
      status-bar
      @clickLeft="handleBack"
    />
  </view>
</template>

<script>
export default {
  name: 'ParentPageNav',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  methods: {
    handleBack() {
      if (this.$listeners && this.$listeners.back) {
        this.$emit('back')
        return
      }
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page-nav {
  margin: -8rpx -12rpx 18rpx;
}
</style>
