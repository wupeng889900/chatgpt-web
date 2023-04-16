import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './locales'
import { setupAssets } from './plugins'
import { setupStore } from './store'
import { setupRouter } from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
async function bootstrap() {
	const app = createApp(App)
	setupAssets()

	setupStore(app)

	setupI18n(app)

	await setupRouter(app)
	app.use(ElementPlus)
	app.mount('#app')
}

bootstrap()
