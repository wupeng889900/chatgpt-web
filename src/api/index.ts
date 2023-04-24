import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useAuthStore, useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()
  const authStore = useAuthStore()

  let data: Record<string, any> = {
    prompt: params.prompt,
    options: params.options,
  }

  if (authStore.isChatGPTAPI) {
    data = {
      ...data,
      systemMessage: settingStore.systemMessage,
      temperature: settingStore.temperature,
      top_p: settingStore.top_p,
    }
  }

  return post<T>({
    url: '/chat-process',
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSendCode<T>(email:any) {
	return post<T>({
		url: '/send-code',
		data:{email:email},
	})
}

export function verifyCodeLogin<T>(data:any) {
	return post<T>({
		url: '/verifyCode',
		data,
	})
}
export function fetchSession<T>() {
	//验证token是否有效
  return post<T>({
    url: '/session',
		data:{ token : localStorage.getItem('token')}
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
		data:{ token : localStorage.getItem('token')}
  })
}
export function fetchPayments<T>(data:any) {
  return post<T>({
    url: '/payments',
		data,
  })
}

export function paymentsCallback<T>(outTradeNo:any) {
  return post<T>({
    url: '/payments_callback',
		data: outTradeNo
		,
  })
}


export function resSuucss<T>(data:any) {
	return post<T>({
		url: '/return',
		data
		,
	})
}

export function cardUpdate<T>(data:any) {
	return post<T>({
		url: '/cardUpdate',
		data
		,
	})
}
