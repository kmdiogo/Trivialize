import Vue from 'vue'
import Vuex from 'vuex'
import WebPlayback from '@/modules/webPlayback'
import Settings from '@/modules/settings'
import GameState from '@/modules/gameState'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        webPlayback: WebPlayback,
        settings: Settings,
        gameState: GameState
    },
    state: {
        accessToken: '',
        lockControls: false,
        isPremium: false,
        isPlayliteModalOpen: false,
    },
    mutations: {
        updateAccessToken(state, value) {
            state.accessToken = value;
        },
        updateLockControls(state, value) {
            state.lockControls = value;
        },
        updateIsPremium(state, value) {
            state.isPremium = value;
        },
        updateIsPlayliteModalOpen(state, value) {
            state.isPlayliteModalOpen = value;
        }

    },
})
