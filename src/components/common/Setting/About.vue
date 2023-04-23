<script setup lang='ts'>
import { computed, onMounted, ref,  reactive, } from 'vue'
import { NSpin} from 'naive-ui'
import { fetchChatConfig } from '@/api'
import { useAuthStore } from '@/store'
import { fetchPayments } from '@/api'
import { useRoute, LocationQuery, useRouter } from 'vue-router'
import axios from 'axios'

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
const router = useRouter()
const isChatGPTAPI = computed<boolean>(() => !!authStore.isChatGPTAPI)
const state = reactive({
	aliPayGateway:null,
	planInfo: [{
		plan: '包月', //'monthly','quarterly','yearly'
		val:'1',
		amount: '0.01',
		content:'',
		role:'会员'
	},
	{
			plan: '包季',
			amount: '55',
			content:'折合每月18.3元/月',
			val:'2',
		role:'会员'
	},{
			plan: '包年',
			amount: '200',
			content:'折合每月16.6元/月',
			val:'3',
			role:'会员'
		}],
	currentVal: {
		plan: '包月', //'monthly','quarterly','yearly'
		val:'1',
		amount: '20',
		content:'',
		role:'会员'
	},
	message:'',
	order:{
		value: {
			alipay_trade_precreate_response:null
		}
	}
})
const handleSubmit = async () => {
	try {
		var params  = {
			subject: state.currentVal.plan,
			body: state.currentVal.content,
			amount: state.currentVal.amount,
		}
		const response = await fetchPayments(params);
		if (response.code == 0) {
			state.order.value = response.data;
			axios.get(response.data.qrcodeUrl)
				.then(response => {
					debugger
					if(response.data.alipay_trade_precreate_response.code =="10000"){
						state.order.value = {...state.order.value,...response.data} ;
						localStorage.setItem('orderInfo',JSON.stringify(state.order.value))
						router.push({ name: 'ConfirmOrder'})
					}else{
						window.$message.warning(response.data.alipay_trade_precreate_response.msg)
					}
				})
				.catch(error => {
					console.error(error);
				});
		} else {
			state.message = response.message;
			order.value = null;
		}
	} catch (error) {
		window.$message?.warning('支付请求失败')
		console.error(error);
	}
};
const refreshPlanDisplay = (item)=>{
	state.currentVal = item;
	console.log(item)
}
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
  // fetchConfig()
})
</script>

<template>
  <NSpin :show="loading">
		<div class="payment-cards" style="padding: 5px 10px;">
			<div class="deploy_block">
				<div class="row row-sm">
					<template v-for="item of state.planInfo" :key="item.val">
						<div class="col-xl-12 col-lg-4 col-md-4">
							<label>
								<input type="radio" name="planTypeGroupID" :value="item.val" :checked="state.currentVal.val == item.val" class="tabmenu_radio" @change="refreshPlanDisplay(item);">
								<div class="deploy__box deploy__box_choose_server shared_cloud_compute" style="flex-direction:column; height:calc(100% - 16px);">
									<span class="deploy_checkbox_checkmark"></span>
									<div style="color:var(--table-text); width:100%; font-size:17px; line-height:20px; margin-bottom:16px; margin-top:8px; text-align:center; font-weight:500;">
										<font style="vertical-align: inherit;">
											{{item.plan}}</font></div>
									<div style="display:flex; flex-direction:row; align-items:center; justify-content:space-between;">
										<div>
											<div style="opacity:.6; font-size:11px; line-height:16px;">
												<span><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">{{item.content}}</font></font></span>
											</div>
											<div style="font-size:13px; line-height: 18px;"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">

											</font></font></div>
										</div>
										<div class="label label-info" style="font-size:13px; white-space:normal; padding:4px 10px; text-align: right; line-height:18px; border-radius:4px;"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">
											{{ item.amount }}/月
										</font></font></div>
									</div>
								</div>
							</label>
						</div>
					</template>
					</div>
				</div>
				<div id="deploy_ordersummary">
						<div class="sidebar-info">
							<input type="button" value="立即购买" id="confirmordersubmit" @click="handleSubmit" class="responsive-full-width">
						</div>
				</div>
			</div>
	</NSpin>
</template>
<style scoped>
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
<style>
.deploy__box_choose_server .svg-product {
	max-width: auto;
}
.deploy__box .svg-product {
	margin: 0 auto;
}
.svg-product {
	position: relative;
	z-index: 3;
	visibility: visible;
	overflow: visible;
	width: 100%;
	max-width: 488px;
}
.deploy__box {
	position: relative;
	padding: 0 24px 24px;
	margin-bottom: 10px;
	display: flex;
	flex-direction: column;
	min-height: 100px;
	box-shadow: none;
	border: 1px solid var(--border-secondary);
	cursor: pointer;
}
.deploy_block {
	background-color: var(--bg-primary);
	border-radius: 0;
	box-shadow: none;
	position: relative;
	margin-top: 0 !important;
	margin-bottom: 12px;
}
input.tabmenu_radio {
	display: none;
}
.deploy_checkbox_checkmark {
	display: block;
	position: absolute;
	top: -1px !important;
	right: -1px;
	width: 34px;
	height: 34px;
	background: url(../../../assets/deploy_checkmark.svg) no-repeat;
	background-size: cover;
	opacity: 0;
	transition: all 0.2s ease-in;
}
.deploy_checkbox_checkmark:before {
	position: absolute;
	top: -2px;
	right: 0;
	height: 20px;
	width: 20px;
	font-size: 19px;
	line-break: 20px;
	text-align: center;
	color: #fff;
	content: "\f26b";
	font-family: "Material-Design-Iconic-Font", sans-serif;
	content: "\2713";
}

.deploy_block h3 {
	margin-bottom: 15px;
}
.deploy__box {
	position: relative;
	padding: 0 24px 24px;
	margin-bottom: 16px;
	display: flex;
	flex-direction: column;
	min-height: 100px;
	box-shadow: none;
	border: 1px solid var(--border-secondary);
	cursor: pointer;
}
.deploy_block:after {
	display: block;
	content: "";
	clear: both;
}

.bare-metal-cls-1 {
	opacity: 0.08;
	fill: url(#dedicated-gradient_17);
}
h3 {
	font-size: 24px;
	line-height: 24px;
	margin: 0px 0px 25px 0px;
	color: var(--table-text);
	font-weight: 400;
}
.bare-metal-cls-10,
.bare-metal-cls-17,
.bare-metal-cls-18,
.bare-metal-cls-7,
.bare-metal-cls-8,
.bare-metal-cls-9 {
	fill: none;
}

.bare-metal-cls-2 {
	fill: #001855;
	opacity: 0.08;
}

.bare-metal-cls-10,
.bare-metal-cls-14,
.bare-metal-cls-2,
.bare-metal-cls-7,
.bare-metal-cls-8,
.bare-metal-cls-9 {
	isolation: isolate;
}

.bare-metal-cls-3 {
	fill: url(#bare-metal-gradient);
}

.bare-metal-cls-4 {
	fill: url(#bare-metal-gradient_2);
}

.bare-metal-cls-5 {
	fill: #fff;
	fill-opacity: 0.5;
}

.bare-metal-cls-6 {
	fill: #333c5e;
}

.bare-metal-cls-10,
.bare-metal-cls-7,
.bare-metal-cls-8,
.bare-metal-cls-9 {
	stroke: #142149;
	stroke-linecap: round;
}

.bare-metal-cls-10,
.bare-metal-cls-18,
.bare-metal-cls-7,
.bare-metal-cls-8,
.bare-metal-cls-9 {
	stroke-linejoin: round;
}

.bare-metal-cls-7,
.bare-metal-cls-8 {
	stroke-width: 2.14px;
}

.bare-metal-cls-10,
.bare-metal-cls-7,
.bare-metal-cls-9 {
	opacity: 0.32;
}

.bare-metal-cls-8 {
	opacity: 0.48;
}

.bare-metal-cls-9 {
	stroke-width: 2.01px;
}

.bare-metal-cls-10 {
	stroke-width: 2.06px;
}

.bare-metal-cls-11 {
	fill: url(#bare-metal-gradient_11);
}

.bare-metal-cls-12 {
	fill: url(#bare-metal-gradient_3);
}

.bare-metal-cls-13 {
	fill: #e6e6e6;
}

.bare-metal-cls-14,
.bare-metal-cls-19 {
	fill: #292e47;
}

.bare-metal-cls-14 {
	opacity: 0.8;
}

.bare-metal-cls-15 {
	opacity: 0.64;
}

.bare-metal-cls-16 {
	clip-path: url(#clip-path);
}

.bare-metal-cls-17,
.bare-metal-cls-18 {
	stroke: #292e47;
	stroke-width: 0.5px;
}

.bare-metal-cls-18 {
	stroke-linecap: square;
}

.bare-metal-cls-19 {
	fill-opacity: 0.7;
}

.bare-metal-cls-20 {
	fill: url(#bare-metal-gradient_4);
}

.bare-metal-cls-21 {
	fill: url(#bare-metal-gradient_5);
}

.bare-metal-cls-22 {
	fill: url(#bare-metal-gradient_6);
}

.bare-metal-cls-23 {
	fill: url(#bare-metal-gradient_7);
}

.bare-metal-cls-24 {
	fill: url(#bare-metal-gradient_8);
}

.bare-metal-cls-25 {
	fill: url(#bare-metal-gradient_9);
}
.compute-st0 {
	opacity: 8.000000e-02;
	fill: #001855;
	enable-background: new;
}

.compute-st1 {
	fill: url(#compute-gradient_10);
}

.compute-st2 {
	fill: url(#compute-gradient_9);
}

.compute-st3 {
	fill: #FFFFFF;
	fill-opacity: 0.5;
}

.compute-st4 {
	fill: #333C5E;
}

.compute-st5 {
	opacity: 0.32;
	fill: none;
	stroke: #142149;
	stroke-width: 2.1386;
	stroke-linecap: round;
	stroke-linejoin: round;
	enable-background: new;
}

.compute-st6 {
	opacity: 0.48;
	fill: none;
	stroke: #142149;
	stroke-width: 2.1386;
	stroke-linecap: round;
	stroke-linejoin: round;
	enable-background: new;
}

.compute-st7 {
	opacity: 0.32;
	fill: none;
	stroke: #142149;
	stroke-width: 2.0091;
	stroke-linecap: round;
	stroke-linejoin: round;
	enable-background: new;
}

.compute-st8 {
	opacity: 0.32;
	fill: none;
	stroke: #142149;
	stroke-width: 2.0602;
	stroke-linecap: round;
	stroke-linejoin: round;
	enable-background: new;
}

.compute-st9 {
	fill: url(#compute-gradient_8);
}

.compute-st10 {
	fill: url(#compute-gradient_7);
}

.compute-st11 {
	opacity: 0.7;
	fill: #1D2540;
	enable-background: new;
}

.compute-st12 {
	fill: url(#compute-gradient_1);
}

.compute-st13 {
	fill: url(#compute-gradient_2);
}

.compute-st14 {
	fill: url(#compute-gradient_3);
}

.compute-st15 {
	fill: url(#compute-gradient_5);
}

.compute-st16 {
	fill: url(#compute-gradient_4);
}

.compute-st17 {
	fill: url(#compute-gradient_6);
}

.compute-st18 {
	fill: #FFFFFF;
}

.compute-st19 {
	display: none;
	fill: #FFFFFF;
}

.compute-st20 {
	fill-rule: evenodd;
	clip-rule: evenodd;
	fill: #FFFFFF;
}

.compute-cls-21 {
	opacity: 0.08;
	fill: url(#compute-gradient_17);
}


:root {
	--text-primary: #4e5259;
	--text-secondary: #8692b0;
	--text-sidebar: #aeb6d5;
	--border: #eeeeee;
	--border-primary: #DCDEE0;
	--border-secondary: #E6E7EB;
	--bg-dropdown: #525254;
	--label: #616366;
	--bg-primary: #ffffff;
	--bg-lighter: #d4e0fb;
	--bg-lighter-disabled: #eee;
	--bg-darker: #f8f8f8;
	--dropdown-light: #eef4ff;
	--dropdown-darker: #666B80;
	--form-input: #555555;
	--table-text: #1e2736;
	--table-hover: #fafbfc;
	--table-active: #EDEFF2;
	--green: #259425;
	--red: #AD0000;
	--gray: #616366;
	--warning: #fca426;
	--brand-primary: #007bfc;
	--brand-primary-lighter: #c9f4ff;
	--disabled: #777777;
	--nav-color: #142467;
	--docs-text-primary: #525666;
	--docs-text-secondary: #525666;
	--docs-navbar: linear-gradient(90deg,#021048,#1e38a3);
	--docs-bg-primary: #FFFFFF;
	--brand-primary-link: #007bfc;
	--docs-border: #e6e6eb;
	--docs-placeholder: #a1a5b2;
	--docs-banner: #007bfc;
	--docs-list-hover: #f3f4f7;
	--docs-header: #142149;
	--docs-tags: #f2f5ff;
	--docs-code: #000000;
	--docs-text-resources: #007bfc;
	--docs-bg-resources: #fff;
	--docs-sidebar: #142149;
	--docs-date: #a1a5b2;
	--docs-svg: #007bfc;
	--docs-banner-header: #fff;
	--docs-footer-text: rgba(229,235,255,.56);
	--docs-navbar-sticky: #fff;
	--docs-cta: #fff;
	--docs-btn-hover: #51b9ff;
	--docs-btn-text: #007bfc;
	--docs-nav-after: rgba(0,0,0,.1);
	--docs-btn-white: #fff;
	--docs-alert-banner: #fff;
}
</style>
<style>
* {
	box-sizing: border-box;
}

html {
	overflow-y: overlay;
}
@media (min-width: 0px) and (max-width: 767px){
	#confirmordersubmit {
		display: block;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0;
		width: 100%;
		border-radius: 0;
		z-index: 1001;
	}
}
.deploy_sidebar {
	z-index: 900;
}
@media (max-width: 767px){
	.deploy_sidebar {
		left: 0;
	}
}

#order_total {
	display: inline-block;
	color: var(--brand-primary);
	font-size: 32px;
	font-weight: 500;
	line-height: 36px;
}
body {
	color: var(--text-primary);
	background: var(--bg-primary);
	font-family: "Roboto", Helvetica, Arial, sans-serif;
	font-size: 15px;
	font-weight: 400;
	line-height: 24px;
}

a,
a:hover,
a:hover > span.popup-icon,
a:hover > .zmdi-edit.popup-icon,
a:hover > .zmdi-accounts-alt.popup-icon {
	color: var(--brand-primary);
	text-decoration: none;
}

.m0 {
	margin: 0;
}



.w100p {
	width: 100%;
}

hr.hr5 {
	height: 5px;
	border: none;
	margin: 0px;
	padding: 0px;
	width: 100%;
}

hr.hr10 {
	height: 10px;
	border: none;
	margin: 0px;
	padding: 0px;
	width: 100%;
}

hr.hr15 {
	height: 15px;
	border: none;
	margin: 0px;
	padding: 0px;
	width: 100%;
}

hr.hr3030 {
	margin: 0px 0px 30px 0px;
	padding: 0px 0px 30px 0px;
	width: 100%;
	border-width: 0px;
	border-bottom: 1px solid var(--border);
}

hr.hr20 {
	height: 32px;
	border: none;
	margin: 0px;
	padding: 0px;
	width: 100%;
}

h1 {
	font-size: 36px;
	line-height: 42px;
	margin: 0px 0px 25px 0px;
	color: var(--table-text);
	font-weight: 300;
}

h2 {
	font-size: 28px;
	line-height: 32px;
}

h3 {
	font-size: 24px;
	line-height: 24px;
	margin: 0px 0px 25px 0px;
	color: var(--table-text);
	font-weight: 400;
}

h4 {
	font-size: 18px;
	line-height: 18px;
	margin: 0px 0px 18px 0px;
	color: var(--table-text);
	font-weight: 400;
}

h5 {
	font-size: 17px;
	line-height: 16px;
	margin: 0px 0px 18px 0px;
	color: var(--table-text);
	font-weight: 500;
}

@media all and (min-width: 0px) and (max-width: 767px) {
	h3 {
		font-size: 21px;
	}
}



p {
	margin: 0;
}
.radiolabeldisc + label {
	display: inline-block;
	position: relative;
	cursor: pointer;
	padding-left: 31px;
	margin: 10px 0px;
}

.radiolabeldisc + label::before {
	position: absolute;
	top: 50%;
	left: 0px;
	margin-top: -12px;
	font-family: "Material-Design-Iconic-Font", sans-serif;
	font-weight: normal;
	font-size: 24px;
	color: var(--label);
	content: "\f26c";
}

.radiolabeldisc:checked + label::before {
	content: "\f26f";
	color: var(--brand-primary);
}
/* Deploy */
.deploy_body {
	width: 100%;
}

.deploy_options {
	margin-right: -16px;
}


.deploy_options--no-margin {
	margin-right: 0
}

@media (min-width: 768px) {
	.deploy_main {
		display: flex;
	}
}

/* Deploy Block */
.deploy_block {
	background-color: var(--bg-primary);
	border-radius: 0;
	box-shadow: none;
	position: relative;
	margin-top: 0 !important;
	margin-bottom: 32px;
}

.deploy_block h3 {
	margin-bottom: 35px;
}

.deploy_block h3 + .tabs-responsive {
	margin-top: -12px;
}
#deploy-summary-price {
	flex-grow: 2;
}
.deploy_block .tabs-responsive {
	position: relative;
	height: 40px;
	margin: 0 0 32px 0;
}
.sidebar-info {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	padding: 16px 30px;
	margin: 0 auto;

}

@media all and (min-width: 0px) and (max-width: 767px) {
	#deploy_ordersummary .empty-block {
		display: none;
	}

	#deploy_ordersummary .sidebar-info {
	}
	#confirmordersubmit {
		display: block;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0;
		width: 100% !important;
		border-radius: 0;
		z-index: 1001;
	}
	#deploy-summary-price {
		width: 50%;
		margin: 0 !important;
		padding: 0 16px;
	}
	#deploy-summary-price {
		flex-grow: 1;
	}
	.deploy_body .hr50 {
		display: none;
	}
	button.instanceCountButton {
		width: 20% !important;
	}
	#instanceCount {
		width: 60% !important;
	}
	#deploy_ordersummary {
		margin-bottom: 0;
	}
	a.deploy_floating {
		top: auto;
		right: 30px;
		z-index: 101;
		position: fixed;
		bottom: 0;
	}
}
@media (max-width: 1199px) {
	#deploy_ordersummary > div {
		padding: 8px 0px;
	}
	#deploy_ordersummary > div > * {
		display: inline-block;
		vertical-align: top;
		margin-right: 0px;
	}
	#deploy_ordersummary input[type=submit] {
		float: right;
		margin: 8px 0 0 0;
	}
	#order_total_spacer {
		margin: 0;
	}
	#order_total {
		font-size: 28px;
	}
	#order_total_spacer {
		display: inline-block;
	}
	#deploy-summary-price > *:nth-child(2) {
		line-height: 40px;
	}

}

@media (max-width: 767px) {
	.deploy_sidebar {
		left: 0;
	}
	#deploy-summary-price > span:first-child {
		margin-bottom: 0;
		line-height: 14px;
	}
	#deploy-summary-info > span {
		line-height: 14px;
		margin-bottom: 8px;
	}
	#order_total_spacer {
		margin-top: -8px;
		line-height: 14px;
		display: block;
	}
}

@media (max-width: 479px) {
	#deploy_ordersummary input[type=submit] {
		float: none;
		width: 100%;
	}
	#deploy_ordersummary > div > * {
		margin-right: 0px;
	}
}

@media all and (min-width: 0px) and (max-width: 767px) {
	#deploy_ordersummary {
		margin-bottom: 0;
	}
	#deploy_ordersummary {
	}
	#deploy_ordersummary .empty-block {
		display: none;
	}
	#deploy_ordersummary > div {
	}
	#deploy_ordersummary .sidebar-info {
		padding: 0 0 20px 0;
	}
	#confirmordersubmit {
		display: block;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		margin: 0;
		width: 100%;
		border-radius: 0;
		z-index: 1001;
	}
	#deploy-summary-info,
	#deploy-summary-price {
		width: 50%;
		margin: 0 !important;
		padding: 0 16px;
	}
	#deploy-summary-price {
		flex-grow: 1;
	}
	.deploy_body .hr50 {
		display: none;
	}
	button.instanceCountButton {
		width: 20% !important;
	}
	#instanceCount {
		width: 60% !important;
	}
	#deploy_ordersummary {
		margin-bottom: 0;
	}
	a.deploy_floating {
		top: auto;
		right: 30px;
		z-index: 101;
		position: fixed;
		bottom: 0;
	}
}

.deploy_block .tabs-responsive .nav-tabs li span {
	padding-top: 10px;
	padding-bottom: 10px;
}

.deploy_block .tabs-responsive .nav-tabs input.tabmenu_radio + label {
	padding-top: 10px;
	padding-bottom: 10px;
	margin-top: -10px;
	margin-bottom: -10px;
}

.deploy_block .select2 {
	margin-bottom: 16px;
}

.deploy_block:after {
	display: block;
	content: "";
	clear: both;
}

.deploy_checkbox {
	display: none;
}

.deploy_checkbox + label {
	position: relative;
	z-index: 2;
	vertical-align: top;
	display: inline-flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;
	min-height: 98px;
	padding: 24px 8px 24px 93px !important;
	margin: 0px 16px 16px 0px;
	border: 1px solid var(--border-secondary);
	border-radius: 0;
	background-color: var(--bg-primary);
	cursor: pointer;
	box-shadow: none;
	white-space: nowrap;
	transition: border-color 0.2s ease-in;
}



.deploy_checkbox:disabled + label {
	display: none;
}

.deploy_checkbox:not(.deploylocationsoldout) + label:hover {
	border: 1px solid var(--label);
}


.deploy_checkbox_new {
	display: block;
	position: absolute;
	top: -1px!important;
	left: -1px;
	width: 34px;
	height: 34px;
	background: url(../_images/deploy_new.svg) no-repeat;
	background-size: cover;
	transition: all .2s ease-in;
}
.deploy_checkbox_new > span {
	color: var(--brand-primary);
	transform: translate(13px,2px) rotate(
		-45deg);
	display: inline-block;
	font-size: 10px;
	font-weight: 500;
	transform-origin: bottom left;
}




@media (max-width: 767px) {
	.deploy_block {
		margin-bottom: 16px;
	}
	.deploy_block .tabs-container .btn-prev {
		top: 2px;
		left: -10px;
	}
	.deploy_block .tabs-container .btn-next {
		top: 2px;
		right: -10px;
	}
}



.deploy_checkbox_icon {
	position: absolute;
	left: 24px;
}
.deploy_checkbox_icon_soldout {
	top: 26px;
}



.deploy_osversionselector {
	display: block;
	padding: 4px 0px;
}

.deploy_osversionselector:last-child {
	padding-bottom: 0;
}

.deploy_osversionselector:hover {
	color: var(--brand-primary);
}

.deploy_osversioncontainer {
	display: none;
	padding: 16px 0 0 0;
	margin: 0 0 0 -80px;
	width: calc(100% + 80px);
}

.deploy_osversioncontainer .beta_tag {
	margin-left: 4px;
}

.deploy_osversioncontainer > span {
	padding-left: 0 !important;
	margin-left: 0 !important;
}

.deploy_osversioncontainer > span > *:first-child {
	margin-left: 0 !important;
}

.deploy_osversioncontainer > span [style="display: inline-block; width: 40%; padding-left: 3%;"] {
	padding-left: 0 !important;
}

#dc_backordered {
	padding: 16px;
	margin-bottom: 16px;
	border: 1px solid var(--red);
	border-radius: 0;
}

.deploy_osversioncontainer_select {
	box-shadow: 0 2px 24px rgba(11, 15, 20, 0.08);
	border: 1px solid var(--label) !important;
	margin-bottom: -200px !important;
	z-index: 100 !important;
}

@media (max-width: 768px) {
	.deploy_osversioncontainer_select {
		margin-bottom: -60px !important;
	}
}


.deploylocationsoldout + label
{
	background-color: var(--bg-darker) !important;
}
.deploylocationsoldout + label > .deploylocationsoldhide
{
	opacity:.9;
	transition: opacity ease-in-out .3s;
}
.deploylocationsoldout + label:hover > .deploylocationsoldhide
{
	opacity:0;
}
#confirmordersubmit, #deploy_ordersummary .confirmordersubmit.button {
	padding-top: 15px;
	padding-bottom: 15px;
	width: 24%;
	min-width: 160px;
	background-color: var(--brand-primary);
	color: var(--bg-primary) !important;
	font-size: 17px;
	font-weight: 500;
	transition: all ease-in .15s;
}
.deploylocationsoldoutAltAvailable.deploylocationsoldout + label, label.deploylocationsoldoutAltAvailable {
	background-color: var(--bg-primary) !important;
}
.deploy__box .svg-illustration-top,
.deploy__box .svg-illustration-bottom,
.deploy__box .svg-illustration-shadow,
.deploy__box .svg-illustration-light {
	transition: transform .3s ease, opacity .3s;
}
.deploy__box:hover .svg-illustration-top, .deploy__box:focus .svg-illustration-top, .deploy__box:active .svg-illustration-top {
	transform: translateY(-16px) !important;
}

.deploy__box:hover .svg-illustration-bottom,
.deploy__box:hover .svg-illustration-light, .deploy__box:focus .svg-illustration-bottom,
.deploy__box:focus .svg-illustration-light, .deploy__box:active .svg-illustration-bottom,
.deploy__box:active .svg-illustration-light {
	transform: translateY(-8px) !important;
}

.deploy__box:hover .svg-illustration-shadow, .deploy__box:focus .svg-illustration-shadow, .deploy__box:active .svg-illustration-shadow {
	opacity: 0.6 !important;
}

.deploy__box:hover .svg-product__shadow, .deploy__box:focus .svg-product__shadow, .deploy__box:active .svg-product__shadow {
	opacity: 0.06 !important;
}



.deploy__box .label-new {
	position: absolute;
	top: -10px;
	left: 50%;
	display: block;
	margin-left: -80px;
	text-transform: uppercase;
}

.deploy__box .label-new:after {
	position: absolute;
	right: 0;
	bottom: -6px;
	display: block;
	content: "";
	width: 0;
	height: 0;
	border-top: 6px solid transparent;
	border-bottom: 6px solid transparent;
	border-right: 6px solid var(--border-secondary);
}

.deploy__box .svg-product {
	max-width: 156px;
	margin: 0 auto;
}


.deploy__box_choose_server .svg-product
{
	max-width:auto;
	height:156px;
}
input.tabmenu_radio:checked + .deploy__box_choose_server .label-info
{
	background-color: #007bfc;
	color: #fff
}


.deploy__box-title {
	color: var(--table-text);
	font-size: 17px;
	font-weight: 500;
	line-height: 24px;
	text-align: center;
}



.deploy__chose-header {
	margin-top: 18px;
}

@media all and (min-width: 0px) and (max-width: 991px) {
	.deploy__box {
		margin-bottom: 16px;
	}
}

input.tabmenu_radio:checked + .deploy__box {
	box-shadow: 0 8px 16px 0px rgba(10, 14, 29, 0.04), 0px 8px 64px 0px rgba(10, 14, 29, 0.08);
	border-color: transparent;
}

input.tabmenu_radio:checked + .deploy__box .deploy_checkbox_checkmark {
	opacity: 1;
	position: absolute;
	top: -1px !important;
	right: -1px;
}

@media all and (min-width: 576px) and (max-width: 982px) {
	.deploy_block .deploy__box {
		min-height: 100px;
	}
}

/**
 *	Deploy box "wide" overrides for plan type filter selections
*/
input.tabmenu_radio:checked+.deploy__box--wide .deploy__box-info .label.label-info {
	background-color: #007bfc;
	color: #fff
}

@media (max-width:767px) {
	.quick-add-actions {
		position: fixed;
		top: auto;
		bottom: 24px;
		right: 18px
	}

	.quick-add-actions .dropdown__menu {
		top: auto;
		bottom: 72px;
		max-height: calc(100vh - 80px)
	}

	.quick-add-actions .dropdown__menu-scroll {
		height: calc(100vh - 140px);
		max-height: 240px
	}

	.quick-add-actions :after,
	.quick-add-actions :before {
		transform: rotate(180deg);
		bottom: -16px;
		top: auto
	}

	.quick-add-actions :after {
		bottom: -15px
	}
}



html {
	box-sizing: border-box;
	-ms-overflow-style: scrollbar;
}

.container {
	width: 100%;
	padding-right: 15px;
	padding-left: 15px;
	margin-right: auto;
	margin-left: auto;
}

@media (min-width: 576px) {
	.container {
		max-width: 540px;
	}
}

@media (min-width: 768px) {
	.container {
		max-width: 720px;
	}
}

@media (min-width: 992px) {
	.container {
		max-width: 960px;
	}
}

@media (min-width: 1200px) {
	.container {
		max-width: 1140px;
	}
}

.container-fluid {
	width: 100%;
	padding-right: 15px;
	padding-left: 15px;
	margin-right: auto;
	margin-left: auto;
}

.row {
	display: flex;
	flex-wrap: wrap;
	margin-right: -15px;
	margin-left: -15px;
	justify-content: center;
}

@media (max-width: 1199px){
	#deploy_ordersummary > div > * {
		display: inline-block;
		vertical-align: top;
		margin-right: 0px;
	}
}


.no-gutters > .col,
.no-gutters > [class*="col-"] {
	padding-right: 0;
	padding-left: 0;
}

.col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12, .col,
.col-auto, .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm,
.col-sm-auto, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12, .col-md,
.col-md-auto, .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg,
.col-lg-auto, .col-xl-1, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl,
.col-xl-auto {
	position: relative;
	width: 100%;
	min-height: 1px;
	padding-right: 15px;
	padding-left: 15px;
}

.col {
	flex-basis: 0;
	flex-grow: 1;
	max-width: 100%;
}

.col-auto {
	flex: 0 0 auto;
	width: auto;
	max-width: none;
}

.col-1 {
	flex: 0 0 8.333333%;
	max-width: 8.333333%;
}

.col-2 {
	flex: 0 0 16.666667%;
	max-width: 16.666667%;
}

.col-3 {
	flex: 0 0 25%;
	max-width: 25%;
}

.col-4 {
	flex: 0 0 33.333333%;
	max-width: 33.333333%;
}

.col-5 {
	flex: 0 0 41.666667%;
	max-width: 41.666667%;
}

.col-6 {
	flex: 0 0 50%;
	max-width: 50%;
}

.col-7 {
	flex: 0 0 58.333333%;
	max-width: 58.333333%;
}

.col-8 {
	flex: 0 0 66.666667%;
	max-width: 66.666667%;
}

.col-9 {
	flex: 0 0 75%;
	max-width: 75%;
}

.col-10 {
	flex: 0 0 83.333333%;
	max-width: 83.333333%;
}

.col-11 {
	flex: 0 0 91.666667%;
	max-width: 91.666667%;
}

.col-12 {
	flex: 0 0 100%;
	max-width: 100%;
}

.order-first {
	order: -1;
}

.order-last {
	order: 13;
}

.order-0 {
	order: 0;
}

.order-1 {
	order: 1;
}

.order-2 {
	order: 2;
}

.order-3 {
	order: 3;
}

.order-4 {
	order: 4;
}

.order-5 {
	order: 5;
}

.order-6 {
	order: 6;
}

.order-7 {
	order: 7;
}

.order-8 {
	order: 8;
}

.order-9 {
	order: 9;
}

.order-10 {
	order: 10;
}

.order-11 {
	order: 11;
}

.order-12 {
	order: 12;
}

.offset-1 {
	margin-left: 8.333333%;
}

.offset-2 {
	margin-left: 16.666667%;
}

.offset-3 {
	margin-left: 25%;
}

.offset-4 {
	margin-left: 33.333333%;
}

.offset-5 {
	margin-left: 41.666667%;
}

.offset-6 {
	margin-left: 50%;
}

.offset-7 {
	margin-left: 58.333333%;
}

.offset-8 {
	margin-left: 66.666667%;
}

.offset-9 {
	margin-left: 75%;
}

.offset-10 {
	margin-left: 83.333333%;
}

.offset-11 {
	margin-left: 91.666667%;
}

@media (min-width: 576px) {
	.col-sm {
		flex-basis: 0;
		flex-grow: 1;
		max-width: 100%;
	}
	.col-sm-auto {
		flex: 0 0 auto;
		width: auto;
		max-width: none;
	}
	.col-sm-1 {
		flex: 0 0 8.333333%;
		max-width: 8.333333%;
	}
	.col-sm-2 {
		flex: 0 0 16.666667%;
		max-width: 16.666667%;
	}
	.col-sm-3 {
		flex: 0 0 25%;
		max-width: 25%;
	}
	.col-sm-4 {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
	.col-sm-5 {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
	.col-sm-6 {
		flex: 0 0 50%;
		max-width: 50%;
	}
	.col-sm-7 {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
	.col-sm-8 {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
	.col-sm-9 {
		flex: 0 0 75%;
		max-width: 75%;
	}
	.col-sm-10 {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
	.col-sm-11 {
		flex: 0 0 91.666667%;
		max-width: 91.666667%;
	}
	.col-sm-12 {
		flex: 0 0 100%;
		max-width: 100%;
	}
	.order-sm-first {
		order: -1;
	}
	.order-sm-last {
		order: 13;
	}
	.order-sm-0 {
		order: 0;
	}
	.order-sm-1 {
		order: 1;
	}
	.order-sm-2 {
		order: 2;
	}
	.order-sm-3 {
		order: 3;
	}
	.order-sm-4 {
		order: 4;
	}
	.order-sm-5 {
		order: 5;
	}
	.order-sm-6 {
		order: 6;
	}
	.order-sm-7 {
		order: 7;
	}
	.order-sm-8 {
		order: 8;
	}
	.order-sm-9 {
		order: 9;
	}
	.order-sm-10 {
		order: 10;
	}
	.order-sm-11 {
		order: 11;
	}
	.order-sm-12 {
		order: 12;
	}
	.offset-sm-0 {
		margin-left: 0;
	}
	.offset-sm-1 {
		margin-left: 8.333333%;
	}
	.offset-sm-2 {
		margin-left: 16.666667%;
	}
	.offset-sm-3 {
		margin-left: 25%;
	}
	.offset-sm-4 {
		margin-left: 33.333333%;
	}
	.offset-sm-5 {
		margin-left: 41.666667%;
	}
	.offset-sm-6 {
		margin-left: 50%;
	}
	.offset-sm-7 {
		margin-left: 58.333333%;
	}
	.offset-sm-8 {
		margin-left: 66.666667%;
	}
	.offset-sm-9 {
		margin-left: 75%;
	}
	.offset-sm-10 {
		margin-left: 83.333333%;
	}
	.offset-sm-11 {
		margin-left: 91.666667%;
	}
}

@media (min-width: 768px) {
	.col-md {
		flex-basis: 0;
		flex-grow: 1;
		max-width: 100%;
	}
	.col-md-auto {
		flex: 0 0 auto;
		width: auto;
		max-width: none;
	}
	.col-md-1 {
		flex: 0 0 8.333333%;
		max-width: 8.333333%;
	}
	.col-md-2 {
		flex: 0 0 16.666667%;
		max-width: 16.666667%;
	}
	.col-md-3 {
		flex: 0 0 25%;
		max-width: 25%;
	}
	.col-md-4 {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
	.col-md-5 {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
	.col-md-6 {
		flex: 0 0 50%;
		max-width: 50%;
	}
	.col-md-7 {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
	.col-md-8 {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
	.col-md-9 {
		flex: 0 0 75%;
		max-width: 75%;
	}
	.col-md-10 {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
	.col-md-11 {
		flex: 0 0 91.666667%;
		max-width: 91.666667%;
	}
	.col-md-12 {
		flex: 0 0 100%;
		max-width: 100%;
	}
	.order-md-first {
		order: -1;
	}
	.order-md-last {
		order: 13;
	}
	.order-md-0 {
		order: 0;
	}
	.order-md-1 {
		order: 1;
	}
	.order-md-2 {
		order: 2;
	}
	.order-md-3 {
		order: 3;
	}
	.order-md-4 {
		order: 4;
	}
	.order-md-5 {
		order: 5;
	}
	.order-md-6 {
		order: 6;
	}
	.order-md-7 {
		order: 7;
	}
	.order-md-8 {
		order: 8;
	}
	.order-md-9 {
		order: 9;
	}
	.order-md-10 {
		order: 10;
	}
	.order-md-11 {
		order: 11;
	}
	.order-md-12 {
		order: 12;
	}
	.offset-md-0 {
		margin-left: 0;
	}
	.offset-md-1 {
		margin-left: 8.333333%;
	}
	.offset-md-2 {
		margin-left: 16.666667%;
	}
	.offset-md-3 {
		margin-left: 25%;
	}
	.offset-md-4 {
		margin-left: 33.333333%;
	}
	.offset-md-5 {
		margin-left: 41.666667%;
	}
	.offset-md-6 {
		margin-left: 50%;
	}
	.offset-md-7 {
		margin-left: 58.333333%;
	}
	.offset-md-8 {
		margin-left: 66.666667%;
	}
	.offset-md-9 {
		margin-left: 75%;
	}
	.offset-md-10 {
		margin-left: 83.333333%;
	}
	.offset-md-11 {
		margin-left: 91.666667%;
	}
}

@media (min-width: 992px) {
	.col-lg {
		flex-basis: 0;
		flex-grow: 1;
		max-width: 100%;
	}
	.col-lg-auto {
		flex: 0 0 auto;
		width: auto;
		max-width: none;
	}
	.col-lg-1 {
		flex: 0 0 8.333333%;
		max-width: 8.333333%;
	}
	.col-lg-2 {
		flex: 0 0 16.666667%;
		max-width: 16.666667%;
	}
	.col-lg-3 {
		flex: 0 0 25%;
		max-width: 25%;
	}
	.col-lg-4 {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
	.col-lg-5 {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
	.col-lg-6 {
		flex: 0 0 50%;
		max-width: 50%;
	}
	.col-lg-7 {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
	.col-lg-8 {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
	.col-lg-9 {
		flex: 0 0 75%;
		max-width: 75%;
	}
	.col-lg-10 {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
	.col-lg-11 {
		flex: 0 0 91.666667%;
		max-width: 91.666667%;
	}
	.col-lg-12 {
		flex: 0 0 100%;
		max-width: 100%;
	}
	.order-lg-first {
		order: -1;
	}
	.order-lg-last {
		order: 13;
	}
	.order-lg-0 {
		order: 0;
	}
	.order-lg-1 {
		order: 1;
	}
	.order-lg-2 {
		order: 2;
	}
	.order-lg-3 {
		order: 3;
	}
	.order-lg-4 {
		order: 4;
	}
	.order-lg-5 {
		order: 5;
	}
	.order-lg-6 {
		order: 6;
	}
	.order-lg-7 {
		order: 7;
	}
	.order-lg-8 {
		order: 8;
	}
	.order-lg-9 {
		order: 9;
	}
	.order-lg-10 {
		order: 10;
	}
	.order-lg-11 {
		order: 11;
	}
	.order-lg-12 {
		order: 12;
	}
	.offset-lg-0 {
		margin-left: 0;
	}
	.offset-lg-1 {
		margin-left: 8.333333%;
	}
	.offset-lg-2 {
		margin-left: 16.666667%;
	}
	.offset-lg-3 {
		margin-left: 25%;
	}
	.offset-lg-4 {
		margin-left: 33.333333%;
	}
	.offset-lg-5 {
		margin-left: 41.666667%;
	}
	.offset-lg-6 {
		margin-left: 50%;
	}
	.offset-lg-7 {
		margin-left: 58.333333%;
	}
	.offset-lg-8 {
		margin-left: 66.666667%;
	}
	.offset-lg-9 {
		margin-left: 75%;
	}
	.offset-lg-10 {
		margin-left: 83.333333%;
	}
	.offset-lg-11 {
		margin-left: 91.666667%;
	}
}

@media (min-width: 1200px) {
	.col-xl {
		flex-basis: 0;
		flex-grow: 1;
		max-width: 100%;
	}
	.col-xl-auto {
		flex: 0 0 auto;
		width: auto;
		max-width: none;
	}
	.col-xl-1 {
		flex: 0 0 8.333333%;
		max-width: 8.333333%;
	}
	.col-xl-2 {
		flex: 0 0 16.666667%;
		max-width: 16.666667%;
	}
	.col-xl-3 {
		flex: 0 0 25%;
		max-width: 25%;
	}
	.col-xl-4 {
		flex: 0 0 33.333333%;
		max-width: 33.333333%;
	}
	.col-xl-5 {
		flex: 0 0 41.666667%;
		max-width: 41.666667%;
	}
	.col-xl-6 {
		flex: 0 0 50%;
		max-width: 50%;
	}
	.col-xl-7 {
		flex: 0 0 58.333333%;
		max-width: 58.333333%;
	}
	.col-xl-8 {
		flex: 0 0 66.666667%;
		max-width: 66.666667%;
	}
	.col-xl-9 {
		flex: 0 0 75%;
		max-width: 75%;
	}
	.col-xl-10 {
		flex: 0 0 83.333333%;
		max-width: 83.333333%;
	}
	.col-xl-11 {
		flex: 0 0 91.666667%;
		max-width: 91.666667%;
	}
	.col-xl-12 {
		flex: 0 0 100%;
		max-width: 100%;
	}
	.order-xl-first {
		order: -1;
	}
	.order-xl-last {
		order: 13;
	}
	.order-xl-0 {
		order: 0;
	}
	.order-xl-1 {
		order: 1;
	}
	.order-xl-2 {
		order: 2;
	}
	.order-xl-3 {
		order: 3;
	}
	.order-xl-4 {
		order: 4;
	}
	.order-xl-5 {
		order: 5;
	}
	.order-xl-6 {
		order: 6;
	}
	.order-xl-7 {
		order: 7;
	}
	.order-xl-8 {
		order: 8;
	}
	.order-xl-9 {
		order: 9;
	}
	.order-xl-10 {
		order: 10;
	}
	.order-xl-11 {
		order: 11;
	}
	.order-xl-12 {
		order: 12;
	}
	.offset-xl-0 {
		margin-left: 0;
	}
	.offset-xl-1 {
		margin-left: 8.333333%;
	}
	.offset-xl-2 {
		margin-left: 16.666667%;
	}
	.offset-xl-3 {
		margin-left: 25%;
	}
	.offset-xl-4 {
		margin-left: 33.333333%;
	}
	.offset-xl-5 {
		margin-left: 41.666667%;
	}
	.offset-xl-6 {
		margin-left: 50%;
	}
	.offset-xl-7 {
		margin-left: 58.333333%;
	}
	.offset-xl-8 {
		margin-left: 66.666667%;
	}
	.offset-xl-9 {
		margin-left: 75%;
	}
	.offset-xl-10 {
		margin-left: 83.333333%;
	}
	.offset-xl-11 {
		margin-left: 91.666667%;
	}
}

.d-none {
	display: none !important;
}

.d-inline {
	display: inline !important;
}

.d-inline-block {
	display: inline-block !important;
}

.d-block {
	display: block !important;
}

.d-table {
	display: table !important;
}

.d-table-row {
	display: table-row !important;
}

.d-table-cell {
	display: table-cell !important;
}

.d-flex {
	display: -webkit-box !important;
	display: -ms-flexbox !important;
	display: flex !important
}

.d-inline-flex {
	display: -webkit-inline-box !important;
	display: -ms-inline-flexbox !important;
	display: inline-flex !important
}


@media (min-width: 576px) {
	.d-sm-none {
		display: none !important;
	}
	.d-sm-inline {
		display: inline !important;
	}
	.d-sm-inline-block {
		display: inline-block !important;
	}
	.d-sm-block {
		display: block !important;
	}
	.d-sm-table {
		display: table !important;
	}
	.d-sm-table-row {
		display: table-row !important;
	}
	.d-sm-table-cell {
		display: table-cell !important;
	}
	.d-sm-flex {
		display: flex !important;
	}
	.d-sm-inline-flex {
		display: inline-flex !important;
	}
}

@media (min-width: 768px) {
	.d-md-none {
		display: none !important;
	}
	.d-md-inline {
		display: inline !important;
	}
	.d-md-inline-block {
		display: inline-block !important;
	}
	.d-md-block {
		display: block !important;
	}
	.d-md-table {
		display: table !important;
	}
	.d-md-table-row {
		display: table-row !important;
	}
	.d-md-table-cell {
		display: table-cell !important;
	}
	.d-md-flex {
		display: flex !important;
	}
	.d-md-inline-flex {
		display: inline-flex !important;
	}
}

@media (min-width: 992px) {
	.d-lg-none {
		display: none !important;
	}
	.d-lg-inline {
		display: inline !important;
	}
	.d-lg-inline-block {
		display: inline-block !important;
	}
	.d-lg-block {
		display: block !important;
	}
	.d-lg-table {
		display: table !important;
	}
	.d-lg-table-row {
		display: table-row !important;
	}
	.d-lg-table-cell {
		display: table-cell !important;
	}
	.d-lg-flex {
		display: flex !important;
	}
	.d-lg-inline-flex {
		display: inline-flex !important;
	}
}

@media (min-width: 1200px) {
	.d-xl-none {
		display: none !important;
	}
	.d-xl-inline {
		display: inline !important;
	}
	.d-xl-inline-block {
		display: inline-block !important;
	}
	.d-xl-block {
		display: block !important;
	}
	.d-xl-table {
		display: table !important;
	}
	.d-xl-table-row {
		display: table-row !important;
	}
	.d-xl-table-cell {
		display: table-cell !important;
	}
	.d-xl-flex {
		display: flex !important;
	}
	.d-xl-inline-flex {
		display: inline-flex !important;
	}
}

@media print {
	.d-print-none {
		display: none !important;
	}
	.d-print-inline {
		display: inline !important;
	}
	.d-print-inline-block {
		display: inline-block !important;
	}
	.d-print-block {
		display: block !important;
	}
	.d-print-table {
		display: table !important;
	}
	.d-print-table-row {
		display: table-row !important;
	}
	.d-print-table-cell {
		display: table-cell !important;
	}
	.d-print-flex {
		display: flex !important;
	}
	.d-print-inline-flex {
		display: inline-flex !important;
	}
}

.flex-row {
	flex-direction: row !important;
}

.flex-column {
	flex-direction: column !important;
}

.flex-row-reverse {
	flex-direction: row-reverse !important;
}

.flex-column-reverse {
	flex-direction: column-reverse !important;
}

.flex-wrap {
	flex-wrap: wrap !important;
}

.flex-nowrap {
	flex-wrap: nowrap !important;
}

.flex-wrap-reverse {
	flex-wrap: wrap-reverse !important;
}

.justify-content-start {
	justify-content: flex-start !important;
}

.justify-content-end {
	justify-content: flex-end !important;
}

.justify-content-center {
	justify-content: center !important;
}

.justify-content-between {
	justify-content: space-between !important;
}

.justify-content-around {
	justify-content: space-around !important;
}

.align-items-start {
	align-items: flex-start !important;
}

.align-items-end {
	align-items: flex-end !important;
}

.align-items-center {
	align-items: center !important;
}

.align-items-baseline {
	align-items: baseline !important;
}

.align-items-stretch {
	align-items: stretch !important;
}

.align-content-start {
	align-content: flex-start !important;
}

.align-content-end {
	align-content: flex-end !important;
}

.align-content-center {
	align-content: center !important;
}

.align-content-between {
	align-content: space-between !important;
}

.align-content-around {
	align-content: space-around !important;
}

.align-content-stretch {
	align-content: stretch !important;
}

.align-self-auto {
	align-self: auto !important;
}

.align-self-start {
	align-self: flex-start !important;
}

.align-self-end {
	align-self: flex-end !important;
}

.align-self-center {
	align-self: center !important;
}

.align-self-baseline {
	align-self: baseline !important;
}

.align-self-stretch {
	align-self: stretch !important;
}

@media (min-width: 576px) {
	.flex-sm-row {
		flex-direction: row !important;
	}
	.flex-sm-column {
		flex-direction: column !important;
	}
	.flex-sm-row-reverse {
		flex-direction: row-reverse !important;
	}
	.flex-sm-column-reverse {
		flex-direction: column-reverse !important;
	}
	.flex-sm-wrap {
		flex-wrap: wrap !important;
	}
	.flex-sm-nowrap {
		flex-wrap: nowrap !important;
	}
	.flex-sm-wrap-reverse {
		flex-wrap: wrap-reverse !important;
	}
	.justify-content-sm-start {
		justify-content: flex-start !important;
	}
	.justify-content-sm-end {
		justify-content: flex-end !important;
	}
	.justify-content-sm-center {
		justify-content: center !important;
	}
	.justify-content-sm-between {
		justify-content: space-between !important;
	}
	.justify-content-sm-around {
		justify-content: space-around !important;
	}
	.align-items-sm-start {
		align-items: flex-start !important;
	}
	.align-items-sm-end {
		align-items: flex-end !important;
	}
	.align-items-sm-center {
		align-items: center !important;
	}
	.align-items-sm-baseline {
		align-items: baseline !important;
	}
	.align-items-sm-stretch {
		align-items: stretch !important;
	}
	.align-content-sm-start {
		align-content: flex-start !important;
	}
	.align-content-sm-end {
		align-content: flex-end !important;
	}
	.align-content-sm-center {
		align-content: center !important;
	}
	.align-content-sm-between {
		align-content: space-between !important;
	}
	.align-content-sm-around {
		align-content: space-around !important;
	}
	.align-content-sm-stretch {
		align-content: stretch !important;
	}
	.align-self-sm-auto {
		align-self: auto !important;
	}
	.align-self-sm-start {
		align-self: flex-start !important;
	}
	.align-self-sm-end {
		align-self: flex-end !important;
	}
	.align-self-sm-center {
		align-self: center !important;
	}
	.align-self-sm-baseline {
		align-self: baseline !important;
	}
	.align-self-sm-stretch {
		align-self: stretch !important;
	}
}

@media (min-width: 768px) {
	.flex-md-row {
		flex-direction: row !important;
	}
	.flex-md-column {
		flex-direction: column !important;
	}
	.flex-md-row-reverse {
		flex-direction: row-reverse !important;
	}
	.flex-md-column-reverse {
		flex-direction: column-reverse !important;
	}
	.flex-md-wrap {
		flex-wrap: wrap !important;
	}
	.flex-md-nowrap {
		flex-wrap: nowrap !important;
	}
	.flex-md-wrap-reverse {
		flex-wrap: wrap-reverse !important;
	}
	.justify-content-md-start {
		justify-content: flex-start !important;
	}
	.justify-content-md-end {
		justify-content: flex-end !important;
	}
	.justify-content-md-center {
		justify-content: center !important;
	}
	.justify-content-md-between {
		justify-content: space-between !important;
	}
	.justify-content-md-around {
		justify-content: space-around !important;
	}
	.align-items-md-start {
		align-items: flex-start !important;
	}
	.align-items-md-end {
		align-items: flex-end !important;
	}
	.align-items-md-center {
		align-items: center !important;
	}
	.align-items-md-baseline {
		align-items: baseline !important;
	}
	.align-items-md-stretch {
		align-items: stretch !important;
	}
	.align-content-md-start {
		align-content: flex-start !important;
	}
	.align-content-md-end {
		align-content: flex-end !important;
	}
	.align-content-md-center {
		align-content: center !important;
	}
	.align-content-md-between {
		align-content: space-between !important;
	}
	.align-content-md-around {
		align-content: space-around !important;
	}
	.align-content-md-stretch {
		align-content: stretch !important;
	}
	.align-self-md-auto {
		align-self: auto !important;
	}
	.align-self-md-start {
		align-self: flex-start !important;
	}
	.align-self-md-end {
		align-self: flex-end !important;
	}
	.align-self-md-center {
		align-self: center !important;
	}
	.align-self-md-baseline {
		align-self: baseline !important;
	}
	.align-self-md-stretch {
		align-self: stretch !important;
	}
}

@media (min-width: 992px) {
	.flex-lg-row {
		flex-direction: row !important;
	}
	.flex-lg-column {
		flex-direction: column !important;
	}
	.flex-lg-row-reverse {
		flex-direction: row-reverse !important;
	}
	.flex-lg-column-reverse {
		flex-direction: column-reverse !important;
	}
	.flex-lg-wrap {
		flex-wrap: wrap !important;
	}
	.flex-lg-nowrap {
		flex-wrap: nowrap !important;
	}
	.flex-lg-wrap-reverse {
		flex-wrap: wrap-reverse !important;
	}
	.justify-content-lg-start {
		justify-content: flex-start !important;
	}
	.justify-content-lg-end {
		justify-content: flex-end !important;
	}
	.justify-content-lg-center {
		justify-content: center !important;
	}
	.justify-content-lg-between {
		justify-content: space-between !important;
	}
	.justify-content-lg-around {
		justify-content: space-around !important;
	}
	.align-items-lg-start {
		align-items: flex-start !important;
	}
	.align-items-lg-end {
		align-items: flex-end !important;
	}
	.align-items-lg-center {
		align-items: center !important;
	}
	.align-items-lg-baseline {
		align-items: baseline !important;
	}
	.align-items-lg-stretch {
		align-items: stretch !important;
	}
	.align-content-lg-start {
		align-content: flex-start !important;
	}
	.align-content-lg-end {
		align-content: flex-end !important;
	}
	.align-content-lg-center {
		align-content: center !important;
	}
	.align-content-lg-between {
		align-content: space-between !important;
	}
	.align-content-lg-around {
		align-content: space-around !important;
	}
	.align-content-lg-stretch {
		align-content: stretch !important;
	}
	.align-self-lg-auto {
		align-self: auto !important;
	}
	.align-self-lg-start {
		align-self: flex-start !important;
	}
	.align-self-lg-end {
		align-self: flex-end !important;
	}
	.align-self-lg-center {
		align-self: center !important;
	}
	.align-self-lg-baseline {
		align-self: baseline !important;
	}
	.align-self-lg-stretch {
		align-self: stretch !important;
	}
}

@media (min-width: 1200px) {
	.flex-xl-row {
		flex-direction: row !important;
	}
	.flex-xl-column {
		flex-direction: column !important;
	}
	.flex-xl-row-reverse {
		flex-direction: row-reverse !important;
	}
	.flex-xl-column-reverse {
		flex-direction: column-reverse !important;
	}
	.flex-xl-wrap {
		flex-wrap: wrap !important;
	}
	.flex-xl-nowrap {
		flex-wrap: nowrap !important;
	}
	.flex-xl-wrap-reverse {
		flex-wrap: wrap-reverse !important;
	}
	.justify-content-xl-start {
		justify-content: flex-start !important;
	}
	.justify-content-xl-end {
		justify-content: flex-end !important;
	}
	.justify-content-xl-center {
		justify-content: center !important;
	}
	.justify-content-xl-between {
		justify-content: space-between !important;
	}
	.justify-content-xl-around {
		justify-content: space-around !important;
	}
	.align-items-xl-start {
		align-items: flex-start !important;
	}
	.align-items-xl-end {
		align-items: flex-end !important;
	}
	.align-items-xl-center {
		align-items: center !important;
	}
	.align-items-xl-baseline {
		align-items: baseline !important;
	}
	.align-items-xl-stretch {
		align-items: stretch !important;
	}
	.align-content-xl-start {
		align-content: flex-start !important;
	}
	.align-content-xl-end {
		align-content: flex-end !important;
	}
	.align-content-xl-center {
		align-content: center !important;
	}
	.align-content-xl-between {
		align-content: space-between !important;
	}
	.align-content-xl-around {
		align-content: space-around !important;
	}
	.align-content-xl-stretch {
		align-content: stretch !important;
	}
	.align-self-xl-auto {
		align-self: auto !important;
	}
	.align-self-xl-start {
		align-self: flex-start !important;
	}
	.align-self-xl-end {
		align-self: flex-end !important;
	}
	.align-self-xl-center {
		align-self: center !important;
	}
	.align-self-xl-baseline {
		align-self: baseline !important;
	}
	.align-self-xl-stretch {
		align-self: stretch !important;
	}
}


.page-deploy #table_records div span {
	font-weight: 500;
	color: var(--table-text);
}

.page-deploy #table_records div span {
	font-size: 14px;
	color: var(--text-primary);
	line-height: 24px;
	max-width: 400px;
	padding-right: 50px;
	height: 66px;
	white-space: normal;
}

.deploy_block:after {
	display: block;
	content: "";
	clear: both;

}


.deploy_checkbox:not(.pagination-input):disabled+label {
	display: none;
}
.deploy_checkbox:not(.pagination-input)+label, .deploy_linkbox, [data-js-pagination] .pagination-label {
	height: auto!important;
	margin-right: 0;
	min-height: 98px!important;
}

.deploy_checkbox:not(.pagination-input)+label {
	position: relative;
	z-index: 2;
	vertical-align: top;
	display: inline-flex;
	flex-direction: column;
	justify-content: center;
	align-items: flex-start;
	min-height: 98px;
	padding: 24px 8px 24px 100px!important;
	margin: 0 16px 16px 0;
	border: 1px solid #e6e9eb;
	border-radius: 0;
	background-color: #fff;
	cursor: pointer;
	box-shadow: none;
	white-space: nowrap;
	transition: border-color .2s ease-in;
}



.deploy_checkbox:not(.deploylocationsoldout):checked+label:not(.filtr-item), .deployplan:not(.deploylocationsoldout):checked+label:not(.filtr-item) {
	border-color: transparent;
	box-shadow: 0 8px 16px 0 rgb(10 14 29 / 4%), 0 8px 64px 0 rgb(10 14 29 / 8%);
}

@media (min-width: 1100px) and (max-width: 1393px) {
	.deploy_linkbox, input.deploy_checkbox+label {
		width: calc(25% - 19px);
	}
}

.deploy_linkbox,
.deploy_checkbox + label {
	width: calc(25% - 19px);
}

.deployplan + label {
	position: relative;
	display: inline-flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	padding: 24px;
	margin: 0px 0px 16px 0px;
	border: 1px solid var(--border-secondary);
	border-radius: 0;
	color: var(--text-primary);
	cursor: pointer;
	text-align: center;
	height:calc(100% - 16px);
}

@media (min-width:1199px) {
	.deploy__box-label {
		max-width: 100px;
	}
}

@media (max-width: 1273px) and (min-width: 1199px) {
	.deploy_block .row .col-xl-4 label .deploy__box {
		height: 232px;
	}
}


.nav-tabs li a, .nav-tabs li button, .nav-tabs li span, .nav-tabs li span label {
	display: block;
	position: relative;
	padding: 14px 2px;
	margin: 0 14px;
	background: transparent;
	border: none;
	cursor: pointer;
	color: #71757c;
	font-size: 15px;
	line-height: 20px;
	transition: color .2s ease-in;
	outline: none;
}


input.tabmenu_radio+label:after {
	display: block;
	position: absolute;
	z-index: 10;
	content: "";
	left: 50%;
	bottom: 0;
	height: 2px;
	width: 0;
	background-color: #007bfc;
	transition: all .2s ease-in;
}

#deploy_ordersummary .confirmordersubmit.button:hover,
#deploy_ordersummary .confirmordersubmit.button:focus,
#deploy_ordersummary .confirmordersubmit.button:active {
	background: var(--nav-color);
}
@media (min-width: 0px) and (max-width: 767px){
	.deploy-summary-info .deploy-summary-price{
		display: none;
	}
}

input.tabmenu_radio:checked + label:after {
	width: 100% !important;
	margin-left: -50%;
}

</style>
