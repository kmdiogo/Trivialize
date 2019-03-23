export default {
    state: {
        playList: null,
        tracks: null
    },
    mutations: {
        updatePlayList(state, value) {
            state.playList = value;
        },
        updateTracks(state, value) {
            state.tracks = value;
        }
    },
}