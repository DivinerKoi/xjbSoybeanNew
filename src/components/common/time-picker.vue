<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  modelValue?: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const startTime = ref<number | null>(null);
const endTime = ref<number | null>(null);
const startTimeError = ref<string>('');
const endTimeError = ref<string>('');

const formatTime = (time: number | null) => {
  if (!time) return '';
  const date = new Date(time);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const timeRange = computed(() => {
  if (!startTime.value || !endTime.value) return '';
  return `${formatTime(startTime.value)}-${formatTime(endTime.value)}`;
});

const validateTimes = () => {
  startTimeError.value = !startTime.value ? '请选择开始时间' : '';
  endTimeError.value = !endTime.value ? '请选择结束时间' : '';

  if (startTime.value && endTime.value && startTime.value >= endTime.value) {
    endTimeError.value = '结束时间必须晚于开始时间';
    return false;
  }
  return !startTimeError.value && !endTimeError.value;
};

watch([startTime, endTime], () => {
  validateTimes();
  if (validateTimes()) {
    emit('update:modelValue', timeRange.value);
  } else {
    emit('update:modelValue', '');
  }
});

// Parse initial value if provided
watch(
  () => props.modelValue,
  value => {
    if (!value) return;
    const [start, end] = value.split('-');
    if (start && end) {
      const [startHour, startMinute] = start.split(':');
      const [endHour, endMinute] = end.split(':');
      const now = new Date();
      startTime.value = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +startHour, +startMinute).getTime();
      endTime.value = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +endHour, +endMinute).getTime();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex items-center gap-2">
    <NTimePicker
      v-model:value="startTime"
      format="HH:mm"
      placeholder="开始时间"
      :clearable="true"
      :validate-status="startTimeError ? 'error' : undefined"
      :status-message="startTimeError"
      required
    />
    <span>-</span>
    <NTimePicker
      v-model:value="endTime"
      format="HH:mm"
      placeholder="结束时间"
      :clearable="true"
      :validate-status="endTimeError ? 'error' : undefined"
      :status-message="endTimeError"
      required
    />
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}
.items-center {
  align-items: center;
}
.gap-2 {
  gap: 0.5rem;
}
</style>
