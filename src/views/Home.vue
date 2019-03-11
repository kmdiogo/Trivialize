<template>
    <div class="d-flex justify-content-center align-items-center h-100">
        <b-card title="Welcome to Trivialize!" sub-title="Click the button below to connect your account and get started" v-if="!$store.state.accessToken">
            <b-button @click="redirectToSpotify" style="color: green; background-color: black" size="lg"><i class="fab fa-spotify"></i></b-button>
        </b-card>
        <b-card title="Waiting For Spotify Device" v-else>
            <b-spinner label="Spinning" />
        </b-card>
    </div>
</template>

<script>
    import {spotifyAuthUrl} from "@/constants";
    import 'vue-slider-component/theme/antd.css';

    export default {
        name: 'home',
        computed: {
            accessToken() {
                return this.$store.state.accessToken;
            },
            numberOfChoices: {
                get() {return this.$store.state.numberOfChoices},
                set(value) {this.$store.commit('updateNumberOfChoices', value)}
            }
        },
        created() {
            if (this.accessToken) {
                this.startSpotifyWebPlayer();
                this.$store.commit('updateInfoModalOpen', true);
            }

        },
        methods: {
            redirectToSpotify() {
                window.location.href = spotifyAuthUrl;
            },
            startSpotifyWebPlayer() {
                window.onSpotifyWebPlaybackSDKReady = () => {
                    this.$store.state.player = new Spotify.Player({
                        name: 'Web Playback SDK Quick Start Player',
                        getOAuthToken: cb => { cb(this.$store.state.accessToken); }
                    });

                    // Error handling
                    this.$store.state.player.addListener('initialization_error', ({ message }) => { console.error(message); });
                    this.$store.state.player.addListener('authentication_error', ({ message }) => { console.error(message); });
                    this.$store.state.player.addListener('account_error', ({ message }) => { console.error(message); });
                    this.$store.state.player.addListener('playback_error', ({ message }) => { console.error(message); });

                    // Playback status updates
                    this.$store.state.player.addListener('player_state_changed', state => {
                        if (!this.$store.state.playerActive) {
                            this.$store.commit('updatePlayerActive', true);
                            this.$store.commit('updateInfoModalOpen', false);
                            this.$router.push('/play');
                        }
                        console.log(state);
                    });

                    // Ready
                    this.$store.state.player.addListener('ready', ({ device_id }) => {
                        this.$store.state.player.setName("Trivialize");
                        console.log('Ready with Device ID', device_id);
                    });

                    // Not Ready
                    this.$store.state.player.addListener('not_ready', ({ device_id }) => {
                        console.log('Device ID has gone offline', device_id);
                    });

                    // Connect to the player!
                    this.$store.state.player.connect();
                };
            }
        }
    }
</script>
