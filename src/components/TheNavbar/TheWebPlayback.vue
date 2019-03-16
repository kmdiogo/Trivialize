<template>
    <div id="web-playback" class="d-none"></div>
</template>

<script>
    export default {
        name: "TheWebPlayback",
        created() {
            if (this.$store.state.accessToken) {
                this.startSpotifyWebPlayer();
                this.$store.commit('updateInfoModalOpen', true);
            }
        },
        methods: {
            startSpotifyWebPlayer() {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    this.$store.state.webPlayback.player =  new Spotify.Player({
                        name: 'Trivialize',
                        getOAuthToken: cb => { cb(this.$store.state.accessToken); }
                    });

                    // Error handling
                    this.$store.state.webPlayback.player.addListener('initialization_error', ({ message }) => { console.error(message); });
                    this.$store.state.webPlayback.player.addListener('authentication_error', ({ message }) => { console.error(message); });
                    this.$store.state.webPlayback.player.addListener('account_error', ({ message }) => { console.error(message); });
                    this.$store.state.webPlayback.player.addListener('playback_error', ({ message }) => { console.error(message); });

                    // Playback status updates
                    this.$store.state.webPlayback.player.addListener('player_state_changed', state => {
                        if (!this.$store.state.webPlayback.active) {
                            this.$store.commit('updatePlayerActive', true);
                            this.$store.commit('updateInfoModalOpen', false);
                            this.$router.push('/play');
                        }
                        //console.log(state);
                    });

                    // Ready
                    this.$store.state.webPlayback.player.addListener('ready', ({ device_id }) => {
                        console.log('Ready with Device ID', device_id);
                    });

                    // Not Ready
                    this.$store.state.webPlayback.player.addListener('not_ready', ({ device_id }) => {
                        console.log('Device ID has gone offline', device_id);
                    });

                    // Connect to the player!
                    this.$store.state.webPlayback.player.connect();
                };
            }
        }
    }
</script>

<style scoped>

</style>