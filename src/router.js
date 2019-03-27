import Vue from 'vue'
import Router from 'vue-router'
import WaitForDevice from './views/WaitForDevice.vue'
import Play from './views/Play'
import ChoosePlaylist from './views/ChoosePlaylist'
import Error from './views/Error'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'WaitForDevice',
      component: WaitForDevice
    },
    {
      path: '/choosePlaylist',
      component: ChoosePlaylist
    },
    {
      path: '/play',
      component: Play
    },
    {
      path: '/error',
      component: Error
    }
  ]
})
