import Vue from 'vue'
import Vuex from 'vuex'
import WebPlayback from '@/modules/webPlayback'
import Settings from '@/modules/settings'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        webPlayback: WebPlayback,
        settings: Settings
    },
    state: {
        accessToken: '',
        lockControls: false,
    },
    mutations: {
        updateAccessToken(state, value) {
            state.accessToken = value;
        },
        updateLockControls(state, value) {
            state.lockControls = value;
        },

    },
})
