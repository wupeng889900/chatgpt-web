<template>
	<div class="qrcode-container">
		<div class="qrcode">
			<QRCodeVue3
				:value="qrData"
			/>
		</div>
	</div>
</template>

<script>
import { defineComponent } from 'vue'
import QRCodeVue3 from "qrcode-vue3";
export default defineComponent({
	components: {
		QRCodeVue3
	},
	props: {
		qrcodeUrl: {
			type: String,
			required: true
		}
	},
	data() {
		return {
			qrData: '',
			size:200,
			generated:false,
		}
	},
	mounted() {
		this.$nextTick(()=>{
			this.qrData = this.qrcodeUrl
			this.generated =true
			this.size = 200
		})

	}
})
</script>

<style scoped lang="less">
.qrcode-container {
	display: flex;
	justify-content: center;
}
.qrcode {
	width: 200px;
	height: 200px;
	img{
		width: 200px;
		height: 200px;
	}
}
</style>
