import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'; 
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap';
import router from './router'

// createApp(App).mount('#app')
createApp(App).use(router).mount('#app')


