import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        listeningDuration: 5000,
        numberOfChoices: 5,
        accessToken: '',
        playerActive: false,
        player: null,
        lockControls: false,
        infoModalOpen: false,
    },
    mutations: {
        updateAccessToken(state, value) {
            state.accessToken = value;
        },
        updatePlayerActive(state, value) {
            state.playerActive = value;
        },
        updatePlayer(state, value) {
            state.player = value;
        },
        updateListeningDuration(state, value) {
            state.listeningDuration = value;
        },
        updateNumberOfChoices(state, value) {
            state.numberOfChoices = value;
        },
        updateLockControls(state, value) {
            state.lockControls = value;
        },
        updateInfoModalOpen(state, value) {
            state.infoModalOpen = value;
        },

    },
    actions: {
        pause(context) {
            return context.state.player.pause();
        },
        resume(context) {
            return context.state.player.resume();
        },
        seek(context, pos) {
            return context.state.player.seek(pos);
        },
        nextTrack(context) {
            return context.state.player.nextTrack();
        }
    }
})
