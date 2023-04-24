<script lang="ts" setup>
import { computed, ref, onMounted ,  reactive,} from 'vue'
import { NAvatar } from 'naive-ui'
import { useUserStore } from '@/store'
import { isString } from '@/utils/is'
import defaultAvatar from '@/assets/avatar.jpg'
import AvatarCom from './AvatarCom.vue'

interface Props {
  image?: boolean
}
defineProps<Props>()

const userStore = useUserStore()
const avatar = computed(() => userStore.userInfo.avatar)
const username = computed(() => userStore.userInfo.name)

const getFontSize = (20 / 2) * 0.8


const state = reactive({
	gradient : '',
	initials :''
})
function getRandomColor() {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
onMounted(() => {
	state.gradient = `linear-gradient(to bottom right, ${getRandomColor()}, ${getRandomColor()})`
	state.initials =username.value.charAt(0).toUpperCase()
	console.log(state.gradient,state.initials,'xxxx')
})
</script>

<template>
  <template v-if="image">
		<div class="avatar" :style="{ background: state.gradient }">
			<div class="initial">{{ state.initials }}</div>
			    <NAvatar v-if="isString(avatar) && avatar.length > 0" :src="avatar" :fallback-src="defaultAvatar"/>
					<NAvatar v-else round :src="defaultAvatar" />
			</div>
  </template>
  <span v-else class="text-[28px] dark:text-white">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" width="1em" height="1em">
      <path d="M29.71,13.09A8.09,8.09,0,0,0,20.34,2.68a8.08,8.08,0,0,0-13.7,2.9A8.08,8.08,0,0,0,2.3,18.9,8,8,0,0,0,3,25.45a8.08,8.08,0,0,0,8.69,3.87,8,8,0,0,0,6,2.68,8.09,8.09,0,0,0,7.7-5.61,8,8,0,0,0,5.33-3.86A8.09,8.09,0,0,0,29.71,13.09Zm-12,16.82a6,6,0,0,1-3.84-1.39l.19-.11,6.37-3.68a1,1,0,0,0,.53-.91v-9l2.69,1.56a.08.08,0,0,1,.05.07v7.44A6,6,0,0,1,17.68,29.91ZM4.8,24.41a6,6,0,0,1-.71-4l.19.11,6.37,3.68a1,1,0,0,0,1,0l7.79-4.49V22.8a.09.09,0,0,1,0,.08L13,26.6A6,6,0,0,1,4.8,24.41ZM3.12,10.53A6,6,0,0,1,6.28,7.9v7.57a1,1,0,0,0,.51.9l7.75,4.47L11.85,22.4a.14.14,0,0,1-.09,0L5.32,18.68a6,6,0,0,1-2.2-8.18Zm22.13,5.14-7.78-4.52L20.16,9.6a.08.08,0,0,1,.09,0l6.44,3.72a6,6,0,0,1-.9,10.81V16.56A1.06,1.06,0,0,0,25.25,15.67Zm2.68-4-.19-.12-6.36-3.7a1,1,0,0,0-1.05,0l-7.78,4.49V9.2a.09.09,0,0,1,0-.09L19,5.4a6,6,0,0,1,8.91,6.21ZM11.08,17.15,8.38,15.6a.14.14,0,0,1-.05-.08V8.1a6,6,0,0,1,9.84-4.61L18,3.6,11.61,7.28a1,1,0,0,0-.53.91ZM12.54,14,16,12l3.47,2v4L16,20l-3.47-2Z" fill="currentColor" />
    </svg>
  </span>
</template>
<style>
.avatar {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	overflow: hidden;
	/*background: linear-gradient(to right, #FFB88C, #DE6262);*/
}

.avatar img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.initial {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 22px;
	color: white;
	width: 100%;
	height: 100%;
	text-transform: uppercase;
}
</style>
