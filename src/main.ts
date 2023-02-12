import { createApp } from 'vue'
import './style.css'
import 'vant/lib/index.css';
import App from './App.vue'
import "@fancyapps/ui/dist/fancybox.css";
import {Lazyload} from "vant";

const app = createApp(App)
app.use(Lazyload,{
    lazyComponent:true
})
app.mount('#app')
