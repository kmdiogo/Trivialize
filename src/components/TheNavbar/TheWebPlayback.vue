<template>
    <div id="web-playback" class="d-none"></div>
</template>

<script>
    export default {
        name: "TheWebPlayback",
        created() {
            /*if (this.$store.state.accessToken) {
                this.startSpotifyWebPlayer();
            }*/
        },
        computed: {
            isPremium() {return this.$store.state.isPremium}
        },
        watch: {
            isPremium() {
                if (this.isPremium)
                    this.startSpotifyWebPlayer();
            }
        },
        methods: {
            startSpotifyWebPlayer() {
                // Append script tag to get Spotify Scripts
                let spotifySdk = document.createElement('script');
                spotifySdk.setAttribute('src', "https://sdk.scdn.co/spotify-player.js");
                document.head.appendChild(spotifySdk);

                window.onSpotifyWebPlaybackSDKReady = () => {
                    this.$store.state.webPlayback.player =  new Spotify.Player({
                        name: 'Trivialize',
                        getOAuthToken: cb => { cb(this.$store.state.accessToken); }
                    });

                    // Error handling
                    this.$store.state.webPlayback.player.addListener('initialization_error', ({ message }) => {
                        // If browser is not supported, use lite version
                        console.log("Error Initializing Playback");
                        console.error(message);
                        this.$store.commit('updateIsPremium', false);
                        this.$store.commit('updateIsPlayliteModalOpen', true);
                        this.$store.commit('updateInfoModalOpen', false);
                    });
                    this.$store.state.webPlayback.player.addListener('authentication_error', ({ message }) => { console.error(message); });
                    this.$store.state.webPlayback.player.addListener('account_error', ({ message }) => { console.error(message); });
                    this.$store.state.webPlayback.player.addListener('playback_error', ({ message }) => { console.error(message); });

                    // Playback status updates
                    this.$store.state.webPlayback.player.addListener('player_state_changed', state => {
                        if (!this.$store.state.webPlayback.active) {
                            this.$store.commit('updatePlayerActive', true);
                            this.$store.commit('updateInfoModalOpen', false);
                            this.$router.push('/choosePlaylist');
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
            },
        }
    }
</script>

<style scoped>

</style>