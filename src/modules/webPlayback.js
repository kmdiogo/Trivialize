export default {
    state: {
        active: false,
        player: null,
    },
    mutations: {
        updatePlayerActive(state, value) {
            state.active = value;
        },
        updatePlayer(state, value) {
            state.player = value;
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
        },

    }
}
