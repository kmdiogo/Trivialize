<template>
    <div class="d-flex justify-content-center align-items-center h-100">
        <b-card title="Welcome to Trivialize!" sub-title="Click the button below to connect your account and get started" v-if="!$store.state.accessToken">
            <b-button @click="redirectToSpotify" style="color: green; background-color: black" size="lg"><i class="fab fa-spotify"></i></b-button>
        </b-card>
        <b-card title="Waiting For Spotify Device" v-else>
            <b-spinner label="Spinning" />
        </b-card>

        <TheWebPlayback></TheWebPlayback>
    </div>
</template>

<script>
    import {spotifyAuthUrl} from "@/spotifyAppConfig";
    import TheWebPlayback from "@/components/TheNavbar/TheWebPlayback";
    import SpotifyController from '@/SpotifyController'

    export default {
        name: 'home',
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
                // NOTE: The redirect to choose playlist is done by TheWebPlayback state

            },
            redirectToSpotify() {
                window.location.href = spotifyAuthUrl;
            },
        },
    }
</script>
