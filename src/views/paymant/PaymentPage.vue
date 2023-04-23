<template>
	<div class="payment-page-container">
		<h1 class="title">请扫描以下二维码进行付款</h1>
		<QRCode :value="qrData" />
		<div class="amount">{{ amount }} CNY</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
import QRCode from '@/components/qrcode/QRCode.vue'
import { useRoute } from 'vue-router';  //1.先在需要跳转的页面引入useRouter
const { query, params } = useRoute();   //2.在跳转页面定义router变量，解构得到指定的query和params传参的参数
export default defineComponent({
	components: {
		QRCode
	},
	data() {
		return {
			qrData: '',
			amount: 100
		}
	},
	methods:{
		getParams(){
			console.log(query, params)
		}
	}
})
onMounted(() => {
	console.log(query, params)
	this.getParams()
})
</script>

<style>
.payment-page-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.title {
	font-size: 24px;
	margin-bottom: 20px;
}

.amount {
	font-size: 32px;
	margin-top: 20px;
}
</style>
