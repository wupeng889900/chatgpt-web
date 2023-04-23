import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'
import {useChatStore} from '@/store'
export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
				const chatStore = useChatStore()
        if (String(data.auth) == 'false'){
					authStore.removeToken()
					next('Login')
				}

        if (to.path === '/Login')
          next({ name: 'Chat' ,params: { uuid: chatStore.active }})
        else
          next()
      }
      catch (error:any) {
				console.log(error)
        if (to.path !== '/Login')
					next('Login')
        else
          next()
      }
    }
    else {
      next()
    }
  })
}
