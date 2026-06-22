<template>
  <uni-tag :text="label" :type="tagType" size="small" />
</template>

<script>
const labels = {
  booked: '待上课',
  completed: '已完成',
  cancelled: '已取消',
  waitlisted: '候补中',
  open: '可预约',
  full: '满员',
  unread: '未读',
  read: '已读'
}

const typeMap = {
  booked: 'success',
  completed: 'primary',
  cancelled: 'default',
  waitlisted: 'warning',
  open: 'success',
  full: 'warning',
  unread: 'warning',
  read: 'default'
}

export default {
  name: 'StatusPill',
  props: {
    status: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  computed: {
    label() {
      return labels[this.status] || this.status
    },
    tagType() {
      return this.type || typeMap[this.status] || 'primary'
    }
  }
}
</script>
