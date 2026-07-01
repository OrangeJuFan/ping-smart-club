export const parentConfig = {
  storageKey: 'ping-smart-club-parent-store-v1',
  lowBalanceThreshold: 4,
  mockLatency: 120,
  signInWindow: {
    beforeStartMinutes: 90,
    afterEndMinutes: 120
  },
  maxBindableStudents: 8,
  phonePattern: /^1[3-9]\d{9}$/
}

export const activeBookingStatuses = ['booked', 'waitlisted']
