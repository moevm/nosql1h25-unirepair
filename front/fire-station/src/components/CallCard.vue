<template>
  <section class="call-card" >
    <div class="call-card_text" @click="isHidden = !isHidden">
      <h3 class="call-card_title">Пожар по адресу {{ call.fireAddress }}</h3>
      <p class="call-card_info"><strong>Адрес:</strong> {{ call.fireAddress }}</p>
      <p class="call-card_info"><strong>Характер пожара:</strong> {{ call.fireType }}</p>
      <p class="call-card_info"><strong>Пострадавшие:</strong> {{ call.victimsCount }}</p>
      <p class="call-card_info"><strong>Бригада и техника:</strong> {{ call.assignedTo }} | {{call.auto}}</p>
      <span :class="['arrow', { 'arrow--up': !isHidden }]"></span>
    </div>
    <div ref="mapContainer" class="call-card_info call-card_info__map" :class="{ hidden: isHidden }"></div>
  </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  call: Object
})

const mapContainer = ref(null)
const isHidden = ref(false)
let map = null;

function initMap() {
  if (!props.call.bottomLeft || !props.call.topRight) return

  if (map) {
    map.remove();
  }

  map = L.map(mapContainer.value).setView([
    (props.call.bottomLeft.latitude + props.call.topRight.latitude) / 2,
    (props.call.bottomLeft.longitude + props.call.topRight.longitude) / 2
  ], 16)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

  L.rectangle([
    [props.call.bottomLeft.latitude, props.call.bottomLeft.longitude],
    [props.call.topRight.latitude, props.call.topRight.longitude]
  ], { color: 'red', weight: 2 }).addTo(map)
}

onMounted(() => {
  initMap()
})

// следим за обновлением props.call
watch(() => props.call, () => {
  initMap()
}, { deep: true })
</script>

<style scoped>
.call-card {
  box-sizing: border-box;
  margin: 24px;
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
  color: #f00;
}

.call-card_info {
  font-size: 16px;
}

.arrow {
  width: 15px;
  height: 15px;
  display: inline-block;
  margin-left: 8px;
  border: solid #333;
  border-width: 0 3px 3px 0;
  padding: 3px;
  transform: rotate(45deg);
  transition: transform 0.3s ease;
}

.arrow--up {
  transform: rotate(-135deg);
}

.call-card_info__map {
  height: 350px;
  width: 80%;
  border-radius: 8px;
  overflow: hidden;
}

.hidden {
  display: none;
}
</style>