import type { App } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { setupPageGuard } from './permission'
import { ChatLayout } from '@/views/chat/layout'

// @ts-ignore
const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Root',
		component: ChatLayout,
		redirect: '/Login',
		children: [
			{
				path: '/login',
				name: 'Login',
				component: () => import('@/views/login/index.vue'),
			},
			{
				path: '/pay',
				name: 'Pay',
				component: () => import('@/views/paymant/index'),
			},{
				path: '/register',
				name: 'Register',
				component: () => import('@/views/register/index.vue'),
			},
			{
				path: '/chat/:uuid?',
				name: 'Chat',
				component: () => import('@/views/chat/index.vue'),
			},
			{
				path: '/confirmOrder/:order?',
				name: 'ConfirmOrder',
				component: () => import('@/views/paymant/ConfirmOrder.vue'),
			},
			{
				path: '/PaymentPage',
				name: 'PaymentPage',
				component: () => import('@/views/paymant/PaymentPage.vue'),
			},
		],
	},

	{
		path: '/404',
		name: '404',
		component: () => import('@/views/exception/404/index.vue'),
	},

	{
		path: '/500',
		name: '500',
		component: () => import('@/views/exception/500/index.vue'),
	},

	{
		path: '/:pathMatch(.*)*',
		name: 'notFound',
		redirect: '/404',
	},
]

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
	scrollBehavior: () => ({ left: 0, top: 0 }),
})

setupPageGuard(router)

export async function setupRouter(app: App) {
	app.use(router)
	await router.isReady()
}
