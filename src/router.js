import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Play from './views/Play'
import ChoosePlaylist from './views/ChoosePlaylist'
import PlayLite from "@/views/PlayLite";

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
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
      path: '/playLite',
      component: PlayLite
    }
  ]
})
