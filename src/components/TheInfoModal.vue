<template>
    <b-modal title="Help" centered v-model="infoModalOpen" ok-only class="text-left">
        <h6>1. Open Spotify on any device</h6>
        <h6>2. Go to any playlist you have created and select a song</h6>
        <h6>3. In the track player, select 'Devices Available'</h6>
        <h6>4. Connect to the device titled 'Trivialize'. Trivialize should automatically start up in the browser</h6>
    </b-modal>
</template>

<script>
    export default {
        name: "TheInfoModal",
        computed: {
            infoModalOpen: {
                get() {return this.$store.state.infoModalOpen},
                set(value) {this.$store.commit('updateInfoModalOpen', value)}
            }
        }
    }
</script>

<style scoped>

</style>