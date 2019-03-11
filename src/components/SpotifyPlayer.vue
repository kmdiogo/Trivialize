<template>
    <div>
        <b-button-group>
            <b-button @click="onPause">Pause</b-button>
            <b-button @click="player.play()">Play</b-button>
            <b-button @click="player.seek(pos)">Seek</b-button>
            <b-button @click="current">Get Current Track</b-button>
        </b-button-group>
        <b-input type="number" v-model="pos"></b-input>
    </div>

</template>

<script>
    import Player from '@/SpotifyController';
    export default {
        name: "SpotifyPlayer",
        data() {
            return {
                pos: 0
            }
        },
        computed: {
            player() {
                return new Player(this.$store.state.accessToken);
            },
        },
        methods: {
            current() {
                this.player.currentTrack().then(response=>{
                    console.log(response);
                })
            },

            onPause() {
                this.$store.dispatch('pause').then(()=>{
                    alert("Paused through spotify sdk");
                })
            }
        }
    }
</script>

<style scoped>

</style>