<template>
  <div class="call" @click="openCall">
  <section class="call-card">
    <div class="call-card_text">
      <h3 class="call-card_title">
        Пожар на {{ call.fireAddress }} ({{ formateDate(call.createdAt) }})
      </h3>
      <p class="call-card_info">
        <strong>Адрес:</strong> {{ call.fireAddress }}
      </p>
      <p class="call-card_info">
        <strong>Характер пожара:</strong> {{ call.fireType }}
      </p>
      <p class="call-card_info">
        <strong>Пострадавшие:</strong> {{ call.victimsCount }}
      </p>
      <p class="call-card_info">
        <strong>Бригада и техника:</strong> {{ call.assignedTo }} |
        {{ call.auto }}
      </p>
      <div class="time-table">
        <table class="call-timeline">
          <tbody>
          <tr>
            <th>
              <div
                  class="square departureTime_square"
                  :style="{ backgroundColor: call.departureAt ? 'black' : '#CFCFCF', cursor: canSetDeparture ? 'pointer' : 'default' }"
                  @click="canSetDeparture && handleTimeSet('departureAt')"
                  title="Установить время выезда"
              ></div>
            </th>
            <th>
              <div
                  class="square arrivalTime_square"
                  :style="{ backgroundColor: call.arrivalAt ? 'black' : '#CFCFCF', cursor: canSetArrival ? 'pointer' : 'default' }"
                  @click="canSetArrival && handleTimeSet('arrivalAt')"
                  title="Установить время прибытия"
              ></div>
            </th>
            <th>
              <div
                  class="square callEndedAt_square"
                  :style="{ backgroundColor: call.callFinishedAt ? 'black' : '#CFCFCF', cursor: canSetFinished ? 'pointer' : 'default' }"
                  @click="canSetFinished && handleTimeSet('callFinishedAt')"
                  title="Установить время завершения"
              ></div>
            </th>
          </tr>

          <tr>
            <th class="column_name">Выезд</th>
            <th class="column_name">На месте</th>
            <th class="column_name">Вызов завершен</th>
          </tr>

          <tr>
            <td><p class="caption departureTime_caption">{{ formateDate(call.departureAt) }}</p></td>
            <td><p class="caption arrivalTime_caption">{{ formateDate(call.arrivalAt) }}</p></td>
            <td><p class="caption callEndedAt_caption">{{ formateDate(call.callFinishedAt) }}</p></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed } from 'vue'

const props = defineProps({
  call: Object
})

const router = useRouter();
function openCall() {
  console.log('DispatcherCall', props.call);
  console.log('DispatcherCall', props.call.id);
  console.log('DispatcherCall', props.call.createdAt);
  router.push({
    name: 'DispatcherNewCall',
    query: { createdAt: props.call.createdAt }
  });
}

const emit = defineEmits(['update-time'])

function handleTimeSet(type) {
  emit('update-time', type)
}

const canSetDeparture = computed(() => !props.call.departureAt)
const canSetArrival = computed(() => props.call.departureAt && !props.call.arrivalAt)
const canSetFinished = computed(() => props.call.arrivalAt && !props.call.callFinishedAt)

function formateDate(date) {
  if (date) {
    return date.substring(0, 19).split('T').join(' ');
  }
  return '-';
}
</script>

<style scoped>
td,
th {
  width: 33.33%;
}

.call-timeline {
  width: 60%;
}

.caption {
  margin: 0;
  padding: 0;
  text-align: start;
}
.column_name {
  text-align: left;
}

.square {
  box-sizing: border-box;
  height: 28px;
  width: 28px;
  background-color: black;
  border-radius: 10px;
}
.call-card {
  margin: 0 24px 0 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.call-card_text {
  cursor: pointer;
}

.call-card_title {
  font-size: 18px;
  color: black;
  margin: 0;
  padding: 0;
}

.call-card_info {
  font-size: 16px;
  margin: 1px;
  padding: 0;
}

.square {
  transition: background-color 1s ease;
}
</style>
