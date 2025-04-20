<template>
  <section class="call-card" >
    <div class="call-card_text">
      <h3 class="call-card_title">Пожар на {{ call.fireAddress }} ({{ new Date(call.createdAt).toLocaleString() }})</h3>
      <p class="call-card_info"><strong>Адрес:</strong> {{ call.fireAddress }}</p>
      <p class="call-card_info"><strong>Характер пожара:</strong> {{ call.fireType }}</p>
      <p class="call-card_info"><strong>Пострадавшие:</strong> {{ call.victimsCount }}</p>
      <p class="call-card_info"><strong>Бригада и техника:</strong> {{ call.assignedTo }} | {{call.auto}}</p>
      <div class="time-table">
        <table class="call-timeline">
          <tr>
            <th><div class="square departureTime_square" :style="{ backgroundColor: call.departureTime === null ? '#CFCFCF' : 'black' }"></div></th>
            <th><div class="square arrivalTime_square" :style="{ backgroundColor: call.arrivalTime === null ? '#CFCFCF' : 'black' }"></div></th>
            <th><div class="square callEndedAt_square" :style="{ backgroundColor: call.callEndedAt === null ? '#CFCFCF' : 'black' }"></div></th>
          </tr>

          <tr>
            <th class="column_name">Выезд</th>
            <th class="column_name">На месте</th>
            <th class="column_name">Вызов завершен</th>
          </tr>

          <tr>
            <td><p class="caption departureTime_caption" >{{call.departureTime !== null ? new Date(call.departureTime).toLocaleString() : ' ' }}</p></td>
            <td><p class="caption arrivalTime_caption" >{{ call.arrivalTime !== null ? new Date(call.arrivalTime).toLocaleString() : ' ' }}</p></td>
            <td><p class="caption callEndedAt_caption" >{{ call.callEndedAt !== null ? new Date(call.callEndedAt).toLocaleString() : ' ' }}</p></td>
          </tr>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>

const props = defineProps({
  call: Object
})

</script>

<style scoped>
td, th {
  width: 33.33%;
}

.call-timeline{
  width: 60%;
}

.caption{
  margin: 0;
  padding: 0;
  text-align: start;
}
.column_name{
  text-align: left;
}

.square{
  box-sizing: border-box;
  height: 28px;
  width: 28px;
  background-color: black;
  border-radius: 10px;
}
.call-card {
  box-sizing: border-box;
  min-width: 70vw;
  width: 100%;
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
</style>