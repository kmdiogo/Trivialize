<template>
    <b-modal title="Help" centered v-model="infoModalOpen" ok-only class="text-left">
        <h6>1. Open Spotify on any device</h6>
        <h6>2. In the track player, select 'Devices Available'</h6>
        <h6>3. Connect to the device titled 'Trivialize'. Trivialize should automatically start up in the browser</h6>
        <h6>TIP: Try restarting your Spotify App if Trivialize isn't appearing in your list of devices</h6>
    </b-modal>
</template>

<script>

    export default {
        name: "TheInfoModal",
        computed: {
            infoModalOpen: {
                get() {return this.$store.state.settings.infoModalOpen},
                set(value) {this.$store.commit('updateInfoModalOpen', value)}
            }
        }
    }
</script>

<style scoped>

</style>