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

    export default {
        name: 'home',
        components: {TheWebPlayback},
        methods: {
            redirectToSpotify() {
                window.location.href = spotifyAuthUrl;
            },
        }
    }
</script>
