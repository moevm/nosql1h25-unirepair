<template xmlns="http://www.w3.org/1999/html">
	<div class="report">
		<button class="close-btn" @click="$emit('close')">✖</button>
		<h2 class="report__title">Отчет №{{ reportData.number }}</h2>

		<section class="report__block report__block__border">
			<div><b>№ Бригады:</b> {{ reportData.assignedTo }}</div>
			<div><b>Оператор:</b> {{ operator.fullName }}</div>
			<div><b>Время вызова:</b> {{ reportData.createdAt }}</div>
			<div><b>Вызов завершен:</b> {{ reportData.modifiedAt }}</div>
		</section>
		<section class="report__block">
			<div><b>Адрес:</b> {{ reportData.fireAddress }}</div>
			<div><b>Категория:</b> {{ reportData.fireRank }}</div>
			<div><b>Пострадавшие:</b> {{ reportData.victimsCount }}</div>

			<div>
				<b>Бригада и техника:</b>
				<ul>
					<li>{{ reportData.auto }}</li>
				</ul>
			</div>
			<!--      карта будет позже-->
			<div class="map-container">
				<div class="map-title">Место</div>
				<img class="map-image" src="../../public/map.png" />
			</div>
		</section>
	</div>
</template>

<script setup>
import { useUserStore } from "@/stores/user";

defineProps({
	reportData: Object,
});

const operator = useUserStore().user;
</script>

<style scoped>
.map-container {
	height: 350px;
}

.map-title {
	font-weight: bold;
}

.map-image {
	width: 30%;
	max-width: 600px;
	margin: 0 auto;
	padding-top: 30px;
	padding-left: 30px;
}

.report {
	overflow: hidden;
	position: relative;
	box-sizing: border-box;
	margin: 24px;
	min-width: 70vw;
	width: 100%;
	background: #fff;
	padding: 24px;
	border-radius: 12px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.report__title {
	font-size: 20px;
	display: flex;
	gap: 10px;
	padding: 0 20px 10px;
	margin: 0 -24px 20px;
	border-bottom: #ced0e9 4px solid;
	justify-content: center;
}
.report__block {
	padding-bottom: 10px;
	margin-bottom: 10px;
}
.report__block__border {
	border-bottom: black 2px solid;
}
.close-btn {
	position: absolute;
	top: 10px;
	right: 10px;
	border: none;
	background-color: #fff;
	cursor: pointer;
	color: #900b09;
	font-size: 24px;
}
</style>
