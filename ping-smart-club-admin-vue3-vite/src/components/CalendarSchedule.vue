<script setup lang="ts">
import { computed } from 'vue';

import StatusBadge from '@/components/StatusBadge.vue';
import { appConfig } from '@/config/app';
import { formatDate, formatTime } from '@/utils/date';

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle: string;
  startTime: string;
  endTime: string;
  status: string;
}

const props = withDefaults(
  defineProps<{
    events: CalendarEvent[];
    mode?: 'day' | 'week';
  }>(),
  {
    mode: 'week',
  },
);

const grouped = computed(() => {
  const map = new Map<string, CalendarEvent[]>();
  props.events.forEach((event) => {
    const key = formatDate(event.startTime);
    map.set(key, [...(map.get(key) || []), event]);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, events]) => ({
      date,
      events: events.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }));
});

const visibleGroups = computed(() => (props.mode === 'day' ? grouped.value.slice(0, 1) : grouped.value.slice(0, 7)));
</script>

<template>
  <div class="calendar-schedule">
    <div v-if="visibleGroups.length === 0" class="calendar-empty">暂无课表安排</div>
    <section v-for="(group, index) in visibleGroups" v-else :key="group.date" class="day-column">
      <header>
        <strong>{{ group.date }}</strong>
        <span>{{ appConfig.weekDays[index] || '' }}</span>
      </header>
      <article v-for="event in group.events" :key="event.id" class="event-card">
        <div class="event-time">{{ formatTime(event.startTime) }} - {{ formatTime(event.endTime) }}</div>
        <div class="event-title">{{ event.title }}</div>
        <div class="event-subtitle">{{ event.subtitle }}</div>
        <StatusBadge :status="event.status" />
      </article>
    </section>
  </div>
</template>

<style scoped>
.calendar-schedule {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
}

.day-column {
  min-height: 220px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-muted);
  padding: 10px;
}

.day-column header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.day-column header strong {
  font-size: 14px;
}

.day-column header span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.event-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #fff;
  padding: 10px;
}

.event-card + .event-card {
  margin-top: 8px;
}

.event-time {
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 750;
}

.event-title {
  font-weight: 750;
}

.event-subtitle {
  color: var(--color-text-muted);
  font-size: 12px;
}

.calendar-empty {
  grid-column: 1 / -1;
  min-height: 160px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
}
</style>
