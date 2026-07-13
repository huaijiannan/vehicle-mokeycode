import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import {
  Button, NavBar, Tabbar, TabbarItem, Tab, Tabs, Form, Field, CellGroup,
  Cell, Tag, Icon, Steps, Step, Popup, DatePicker, RadioGroup, Radio,
  Empty, NoticeBar, Uploader, PullRefresh, Toast, Dialog, Notify
} from 'vant'
import 'vant/lib/index.css'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const vantComponents = [
  Button, NavBar, Tabbar, TabbarItem, Tab, Tabs, Form, Field, CellGroup,
  Cell, Tag, Icon, Steps, Step, Popup, DatePicker, RadioGroup, Radio,
  Empty, NoticeBar, Uploader, PullRefresh
]
vantComponents.forEach(c => app.component(c.name, c))

app.use(Toast)
app.use(Dialog)
app.use(Notify)
app.use(ElementPlus)
app.use(createPinia())
app.use(router)
app.mount('#app')
