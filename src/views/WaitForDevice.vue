<template>
    <div class="d-flex justify-content-center align-items-center">
        <video autoplay muted loop class="background-video">
            <source src="../assets/images/TurntableLoop.mp4" type="video/mp4">
        </video>
        <b-card title="Welcome to Trivialize!" sub-title="Click the button below to connect your account and get started" class="main-card" v-if="!$store.state.accessToken">
            <b-button @click="redirectToSpotify" style="color: #1ED760; background-color: black" size="lg"><i class="fab fa-spotify fa-2x"></i></b-button>
        </b-card>
        <b-card title="Waiting For Spotify Device" v-else>
            <b-spinner label="Spinning" />
        </b-card>

        <TheWebPlayback></TheWebPlayback>

        <b-modal title="Trivialize Lite" centered ok-only v-model="$store.state.isPlayliteModalOpen" size="lg" class="text-left" @hidden="startGame">
            <h3 class="text-center">Before you Play...</h3>
            <h6>
                It looks like either your Spotify account isn't premium or your browser doesn't support Trivialize.
                Regardless, you'll still be able to take advantage of most of Trivialize's features, but
                this means you won't be able to link up a Spotify device to Trivialize.
            </h6>
            <h6>
                Because of this, the songs that are played are from Spotify's 30 second previews clips.
                This can mean that some songs in your playlists won't available (if Spotify doesn't have a preview available) and tracks will play
                from the same 30 second preview clip (which can get boring once you've memorized that specific track clip).
            </h6>
            <h6>You're still welcome to use the rest of the features Trivialize has to offer. Have fun!</h6>
        </b-modal>
    </div>
</template>

<script>
    import {spotifyAuthUrl} from "@/spotifyAppConfig";
    import TheWebPlayback from "@/components/TheNavbar/TheWebPlayback";
    import SpotifyController from '@/SpotifyController'

    export default {
        name: 'WaitForDevice',
        components: {TheWebPlayback},
        created() {
            // Get token sent by Spotify in URL
            if (window.location.hash) {
                this.getTokenFromURL();
            }
        },
        methods: {
            async getTokenFromURL() {
                let hash = window.location.hash.substring(1);
                let token = hash.split('=')[1];
                this.$store.commit('updateAccessToken', token);
                let r = await new SpotifyController(this.$store.state.accessToken).getUserProfile();
                if (r.data.product === 'premium') {
                    this.$store.commit('updateIsPremium', true);
                    this.$store.commit('updateInfoModalOpen', true);
                }
                else {
                    this.$store.commit('isPlayliteModalOpen', true);
                }
                // NOTE: The redirect to choose playlist is done by TheWebPlayback state or the PlayliteModal

            },
            redirectToSpotify() {
                window.location.href = spotifyAuthUrl;
            },
            startGame() {
                this.$store.commit('updateInfoModalOpen', false);
                this.$router.push('/play');
            }
        },
    }
</script>

<style scoped>
    .main-card{
        border-radius: 10px 10px 10px 10px !important;
    }
    .background-video {
        position: fixed;
        top: 0;
        left: 0;
        min-width: 100%;
        min-height: 100%;
    }
</style>
