import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { ToastService } from 'primevue'

import App from './App.vue'
import router from './router'

import './style.css'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  pt: {
    accordion: {
      root: {
        class: 'border border-gray-300 dark:border-gray-600 rounded-md',
      },
    }
  }
})
app.use(ToastService)

app.mount('#app')
