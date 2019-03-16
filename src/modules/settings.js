export default {
    state: {
        listeningDuration: 5000,
        numberOfChoices: 5,
        infoModalOpen: false,
    },
    mutations: {
        updateListeningDuration(state, value) {
            state.listeningDuration = value;
        },
        updateNumberOfChoices(state, value) {
            state.numberOfChoices = value;
        },
        updateInfoModalOpen(state, value) {
            state.infoModalOpen = value;
        },

    },
}