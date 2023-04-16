<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { NSpin,NSpace,NCard,NGrid } from 'naive-ui'
import { fetchChatConfig } from '@/api'
import pkg from '@/../package.json'
import { useAuthStore } from '@/store'

interface ConfigState {
  timeoutMs?: number
  reverseProxy?: string
  apiModel?: string
  socksProxy?: string
  httpsProxy?: string
  usage?: string
}

const authStore = useAuthStore()

const loading = ref(false)

const config = ref<ConfigState>()

const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)

async function fetchConfig() {
  try {
    loading.value = true
    const { data } = await fetchChatConfig<ConfigState>()
    config.value = data
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
		<el-row :gutter="20">
			<el-col :span="12">
				<el-card class="box-card">
					<div class="n-card-header"><div class="n-card-header__main" role="heading">650次卡</div><!----><!----></div>
					333333333
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card class="box-card">
					<div class="n-card-header"><div class="n-card-header__main" role="heading">650次卡</div><!----><!----></div>
					333333333
				</el-card>
			</el-col>
		</el-row>
	</NSpin>
</template>
<style>
.light-green {
	height: 108px;
	background-color: rgba(0, 128, 0, 0.12);
}
.green {
	height: 108px;
	background-color: rgba(0, 128, 0, 0.24);
}
.n-card-header {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	font-size: var(--n-title-font-size);
	padding: var(--n-padding-top)  0;
}
.n-card-header__main {
	font-weight: var(--n-title-font-weight);
	transition: color .3s var(--n-bezier);
	flex: 1;
	min-width: 0;
	color: var(--n-title-text-color);
}
.n-card__footer {
	box-sizing: border-box;
	padding: 0 var(--n-padding-left) var(--n-padding-bottom) var(--n-padding-left);
	font-size: var(--n-font-size);
}
</style>
