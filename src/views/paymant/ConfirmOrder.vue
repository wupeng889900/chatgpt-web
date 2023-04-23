<template>
	<div class="background"></div>
	<div class="layui-row">
		<div class="header">
			<NButton  @click="back()">返回</NButton>
		</div>
		<div class="main-box">
			<div class="pay-title">
				<svg style="margin-bottom: -6px;" t="1603120404646" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1611" width="27" height="27">
					<path d="M320.512 428.032h382.976v61.44H320.512zM320.512 616.448h320.512v61.44H320.512z" fill="#00EAFF" p-id="1612" data-spm-anchor-id="a313x.7781069.0.i3" class="selected"></path>
					<path d="M802.816 937.984H221.184l-40.96-40.96V126.976l40.96-40.96h346.112l26.624 10.24 137.216 117.76 98.304 79.872 15.36 31.744v571.392l-41.984 40.96z m-540.672-81.92h500.736V345.088L677.888 276.48 550.912 167.936H262.144v688.128z" fill="#3C8CE7" p-id="1613" data-spm-anchor-id="a313x.7781069.0.i0" class=""></path>
				</svg>
				确认订单
			</div>

			<div class="layui-card-body">
				<div class="product-info">
					<p style="color: #3C8CE7 ;font-size: 18px;font-weight: 700; text-align: center;margin: 20px 0">
						请注意！！5分钟内未完成支付订单将作废
					</p>
				</div>
				<table class="layui-table" lay-skin="nob">
					<colgroup>
						<col width="50%">
						<col width="50%">
					</colgroup>
					<tbody>
					<tr>
						<td style="text-align: right">订单号：</td>
						<td>{{ state.order.outTradeNo }}</td>
					</tr>
					<tr>
						<td style="text-align: right">订单名称：</td>
						<td>
							<span class="small-tips tips-green noML">{{state.order.subject}}</span>
						</td>
					</tr>
					<tr>
						<td style="text-align: right">订单时间：</td>
						<td>
							<span class="small-tips tips-green noML">{{ state.order.start_time }}</span>
						</td>
					</tr>
					<tr>
						<td style="text-align: right">实际支付价格：</td>
						<td>
							<span class="small-tips tips-green noML">￥{{ state.order.amount }}</span>
						</td>

					</tr>
					<tr>
						<td style="text-align: right">支付方式：</td>
						<td>支付宝</td>
					</tr>
					</tbody>
				</table>
				<p class="btn" style="text-align: center">
					<a @click="showModal">
						立即支付
					</a>
				</p>
			</div>


		</div>
	</div>
	<n-modal v-model:show="state.showModal">
		<n-card
			style="width: 300px"
			title=""
			:bordered="false"
			size="huge"
			role="dialog"
			aria-modal="true"
		>
			<div class="pay-title" style="justify-content: center;margin-bottom: 20px">
				<svg style="margin-bottom: -6px;" t="1603122535052" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1949" width="27" height="27">
					<path d="M146.432 336.896h-81.92V106.496l40.96-40.96h231.424v81.92H146.432zM336.896 958.464H105.472l-40.96-40.96V687.104h81.92v189.44h190.464zM956.416 336.896h-81.92V147.456H684.032v-81.92h231.424l40.96 40.96zM915.456 958.464H613.376v-81.92h261.12V659.456h81.92v258.048z" fill="#3C8CE7" p-id="1950" data-spm-anchor-id="a313x.7781069.0.i11" class="selected"></path>
					<path d="M326.656 334.848h61.44v98.304h-61.44zM415.744 575.488h61.44v133.12h-61.44zM265.216 575.488h61.44v114.688h-61.44zM566.272 575.488h61.44v98.304h-61.44zM706.56 575.488h61.44v154.624h-61.44zM477.184 297.984h61.44v135.168h-61.44zM627.712 329.728h61.44v103.424h-61.44z" fill="#00EAFF" p-id="1951" data-spm-anchor-id="a313x.7781069.0.i9" class=""></path>
					<path d="M10.24 473.088h1003.52v61.44H10.24z" fill="#3C8CE7" p-id="1952" data-spm-anchor-id="a313x.7781069.0.i12" class="selected"></path>
				</svg>
				扫码支付
			</div>
			<QRCode :qrcodeUrl="state.order.alipay_trade_precreate_response.qr_code" />
			<template #footer>
				<div style="text-align: center;width: 100%">
					等待支付中
				</div>
			</template>
		</n-card>
	</n-modal>
</template>

<script setup lang='ts'>
import QRCode from '@/components/qrcode/QRCode.vue'
import axios from 'axios'
import { NAutoComplete, NButton, NModal, NCard, useDialog, useMessage } from 'naive-ui'
import { computed, onMounted,  reactive,ref, watchEffect } from 'vue'
import { useRoute, LocationQuery, useRouter } from 'vue-router'
import { paymentsCallback,resSuucss } from '@/api'
import {useChatStore} from '@/store'
const router = useRouter()
const route = useRoute()
let interval =null;
const chatStore = useChatStore()
const state = reactive({
	showModal: false,
	order: {
		outTradeNo:'',
		number: "20211001",
		start_date: "",
		status: "待付款",
		total: 500,
		discount: 50,
		actualTotal: 450,
		recipient: "",
		address: "",
		deliveryMethod: "",
		alipay_trade_precreate_response: {
			qr_code:''
		}
	}
})
const back = () => {
  router.back();
}
const getOrderStatus = async () => {
	if (!state.order || !state.order.outTradeNo) {
		return;
	}
	try {
		//用来查询订单
	 let response =	await paymentsCallback(state.order)
		debugger
		if (response.code == 0) {
		  axios.get(response.data).then( async (res)=>{
				if(res.data.alipay_trade_query_response.code == '10000' && res.data.alipay_trade_query_response.trade_status == 'TRADE_SUCCESS'){
					console.log(res)
					clearInterval(interval);
					// state.showModal =false;
					window.$message.success('支付成功')
					debugger
					res.data.id = state.order.id
					await resSuucss(res.data)
					// router.replace({ name: 'Chat', params: { uuid: chatStore.active } })
				}else{
					// window.$message.warning(res.data.alipay_trade_query_response.msg || res.data.alipay_trade_query_response.sub_msg)
					// clearInterval(interval);
				}

			})
		}else{
			console.log(response)
		}
	} catch (error) {
		console.error(error);
	}
};
onMounted(() => {
	state.order = JSON.parse(localStorage.getItem('orderInfo'))
})
const showModal = ()=>{
	state.showModal= true
	if (state.order && state.order.status !== 'paid') {
		getOrderStatus()
		// interval = setInterval(getOrderStatus, 1000); // 每秒查询一次订单状态
	}
	console.log(state.order)
}

</script>
<style lang="scss" scoped>
.background {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	min-width: 1000px;
	z-index: -10;
	zoom: 1;
	background-color: #fff;
	background: url(../../assets/background.png) no-repeat;
	background-size: cover;
	-webkit-background-size: cover;
	-o-background-size: cover;
	background-position: center 0;
}
.layui-row {
	margin: 0 10px;
}
.header{
	margin: 20px 0px;
}
.pay-title {
	color: #737373;
	font-weight: 700;
	font-size: 20px;
	margin: 0 15px;
	display: flex;
	height: 28px;
	line-height: 28px;
}
.layui-table {
	width: 100%;
	background-color: #fff;
	color: #666;
}
.btn a, .btn button {
	border: initial;
	text-align: center;
	font-size: 18px;
	font-weight: 700;
	color: #fff;
	display: inline-block;
	width: 160px;
	line-height: 45px;
	margin-top: 15px;
	border-radius: 100px;
	cursor: pointer;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
	box-shadow: 0 5px 6px 0 rgb(73 105 230 / 22%);
	background-image: linear-gradient(135deg, #3C8CE7 10%, #00EAFF 100%);
}
.layui-card-body .layui-table {
	margin: 5px 0;
}
.layui-card-body {
	position: relative;
	padding: 10px 15px;
	line-height: 24px;
}
.main-box {
	margin-top: 20px;
	background: #fff;
	-webkit-box-shadow: 0 7px 29px 0 rgb(18 52 91 / 11%);
	box-shadow: 0 7px 29px 0 rgb(18 52 91 / 11%);
	border-radius: 6px;
	padding-top: 14px;
	padding-bottom: 20px;
}
	h1 {
	font-size: 1.5rem;
	margin: 0;
	color: #333;
	}

.order-info,
	.item-list,
	.payment-info,
	.delivery-info {
	margin-bottom: 40px;
}
	h2 {
	font-size: 1.2rem;
	margin: 0 0 10px;
	color: #333;
}
	ul {
	list-style: none;
	margin: 0;
	padding: 0;
}
	li {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}
	img {
	width: 80px;
	height: 80px;
	object-fit: cover;
	margin-right: 20px;
}
	.payment-info p:last-child,
	.delivery-info p:last-child {
	margin-bottom: 0;
}
</style>
