<template>
    <div class="d-flex justify-content-center align-items-center h-100 flex-column">
        <transition name="fade" mode="out-in">
            <b-card title="Select the Playlist currently active" class="overflow-auto h-50" v-if="!tracks">
                <hr />
                <b-table :items="playLists" :fields="playlistTableFields" outlined reponsive hover class="overflow-auto" thead-class="d-none" v-if="playLists">
                    <template slot="images" slot-scope="data">
                        <b-img width="100px" height="100px" :src="data.item.images[0].url" fluid></b-img>
                    </template>
                    <template slot="select" slot-scope="row">
                        <b-button @click="onPlaylistClick(row)">Select</b-button>
                    </template>
                </b-table>
            </b-card>
            <b-card v-else-if="gameOver">
                <h3>You got {{numberOfCorrect}} / {{Object.keys(tracks).length}} songs correct!</h3>
                <h5 v-if="incorrectSongs.length > 0">You missed these songs: </h5>
                <b-table :items="incorrectSongs" :fields="['artist','name']">
                    <template slot="artist" slot-scope="data">
                        {{data.item.artists[0].name}}
                    </template>
                </b-table>
            </b-card>
            <b-card class="overflow-auto h-50" v-else>
                <h5>Songs left: {{Object.keys(remainingTracks).length}}</h5>
                <b-button block :variant="buttonVariant(track.uri)" v-for="track in choices" :key="track.uri" @click="onChoiceClick(track.uri)" :disabled="selectionMade">
                    {{track.artists[0].name}} - {{track.name}}
                </b-button>
            </b-card>
        </transition>
        <div class="d-flex flex-column">
            <b-card v-if="!gameOver">
                <b-button-group>
                    <b-button variant="primary" @click="replayTrack" :disabled="$store.state.lockControls"><i class="fas fa-undo"></i></b-button>
                </b-button-group>
            </b-card>
            <b-card>
                <b-button variant="primary" @click="loadPlaylists">Play Again</b-button>
            </b-card>
        </div>

    </div>

</template>

<script>
    import axios from 'axios';
    import SpotifyController from '@/SpotifyController';
    import {cloneDeep, shuffle} from 'lodash'

    export default {
        name: "Play",
        data() {
            return {
                playlistTableFields: ['name', 'images', 'select'],
                playLists: null,
                tracks: null,
                remainingTracks: {},
                choices: [],
                //currentTrackId: null,
                calculatedTrackStart: null,
                currentTrackDuration: null,
                incorrectSongs: [],
                numberOfCorrect: 0,
                gameOver: false,
                showFeedback: false,
                userChoiceURI: null,
                currentTrackURI: null,
                selectionMade: false
            }
        },
        computed: {
            currentTrackId() {
                return this.$store.state.currentTrackId;
            },
            http() {
                let config = {
                    baseURL: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': `Bearer ${this.$store.state.accessToken}`
                    }
                };
                return axios.create(config);
            },
            spotifyController() {
                return new SpotifyController(this.$store.state.accessToken);
            },
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (!vm.$store.state.accessToken)
                    vm.$router.push('/');
                else {
                    // Load playlists
                    vm.spotifyController.getUserPlaylists().then(response=>{
                        vm.playLists = response.data.items;
                    })
                }
            })
        },
        methods: {
            async loadPlaylists() {
                let response = await this.spotifyController.getUserPlaylists();
                this.playLists = response.data.items;
                this.resetGame();
            },

            async resetGame() {
                await this.$store.dispatch('pause');
                this.gameOver = false;
                this.remainingTracks = {};
                this.tracks = null;
                this.choices = [];
                this.numberOfCorrect = 0;
                this.incorrectSongs = [];
                this.selectionMade = false;
            },

            async onPlaylistClick(row) {
                await this.spotifyController.setShuffle(true);

                // Get all tracks for the selected playlist
                let trackData = await this.http.get(row.item.tracks.href + `?market=from_token&fields=items(track(uri,name,is_playable,id,duration_ms,artists))`);
                console.log(trackData);
                let formatted = {};
                trackData.data.items.forEach(item=>{
                    if (item.track.is_playable)
                        formatted[item.track.uri] = cloneDeep(item.track);
                });

                this.tracks = cloneDeep(formatted);
                this.remainingTracks = cloneDeep(formatted);
                this.playNextTrack();
            },

            /**
             * Helper function that combines moving to the next song, updating the multiple choice, and playing the track
             * at a random location
             */
            async playNextTrack() {
                let keys = Object.keys(this.remainingTracks);
                let rand = Math.floor(Math.random()*keys.length);
                this.currentTrackURI = keys[rand];
                await this.updateChoices();
                this.selectionMade = false;
                this.replayTrack();
            },

            /**
             * Seeks to calculated random moment for the current track and plays for x amount of seconds
             * x is defined by the user in the SettingsBox
             */
            async replayTrack() {
                this.showFeedback = false;
                this.$store.commit('updateLockControls', true);
                await this.http.put('player/play', {
                    uris: [this.currentTrackURI],
                    position_ms: this.calculatedTrackStart
                });

                // Set default duration if the user-defined duration is longer than the track
                // This makes it so the song will never play till the end (which we want to avoid since
                // that will automatically move to the next track)
                // In this case, we simply set the duration to one second less than the duration of the song
                let duration = this.$store.state.listeningDuration;
                if (duration >= this.tracks[this.currentTrackURI].duration_ms)
                    duration = this.tracks[this.currentTrackURI].duration_ms - 1000;

                // Pause song after duration ends
                // nowURI is used to prevent the song from playing if user guess quickly
                let nowURI = this.currentTrackURI;
                setTimeout(function(){
                    if (nowURI === this.currentTrackURI) {
                        this.$store.dispatch('pause').then(()=>{
                            this.$store.commit('updateLockControls', false);
                        });
                    }
                }.bind(this), duration);
            },

            /**
             * Gets the current track and adds it as on option then adds n other
             * randomly sampled-without-replacement options.
             * n is defined by the user in SettingsBox
             */
            async updateChoices() {
                this.choices = [];

                // Add the current playing song as a choice
                this.choices.push(cloneDeep(this.remainingTracks[this.currentTrackURI]));

                // remove the currently playing song from the list of remaining tracks
                delete this.remainingTracks[this.currentTrackURI];

                // If n is greater than the amount of remaining tracks, set n to amount of remaining tracks
                let numberOfChoices = this.$store.state.numberOfChoices-1;
                if (Object.keys(this.remainingTracks).length < numberOfChoices) {
                    numberOfChoices = Object.keys(this.remainingTracks).length;
                }
                // Push n random choices
                let ids = shuffle(Object.keys(this.remainingTracks));
                for (let i=0; i < numberOfChoices; i++) {
                    this.choices.push(this.remainingTracks[ids[i]]);
                }

                // Reshuffle so current song isn't always the first element in choice array
                this.choices = shuffle(this.choices);

                // Set default duration if the user-defined duration is longer than the track
                // This makes it so the song will never play till the end (which we want to avoid since
                // that will automatically move to the next track)
                // In this case, we simply set the duration to one second less than the duration of the song
                let duration = this.$store.state.listeningDuration;
                let currentTrackDuration = this.tracks[this.currentTrackURI].duration_ms;
                if (duration >= currentTrackDuration)
                    duration = currentTrackDuration - 1000;

                // Calculate the random starting point for the current song
                // If the duration is less than 20 seconds, set the starting point to the beginning
                // Otherwise,
                if (this.tracks[this.currentTrackURI].duration_ms <= 20000)
                    this.calculatedTrackStart = 0;
                else {
                    this.calculatedTrackStart = Math.floor(Math.random() * this.tracks[this.currentTrackURI].duration_ms - duration);
                }
            },

            async onChoiceClick(uri) {
                this.selectionMade = true;
                await this.$store.dispatch('pause');
                this.userChoiceURI = uri;
                this.showFeedback = true;
                this.$store.commit('updateLockControls', true);
                if (uri === this.currentTrackURI) {
                    this.numberOfCorrect += 1;
                }
                else {
                    this.incorrectSongs.push(cloneDeep(this.tracks[this.currentTrackURI]));
                }

                setTimeout(async ()=>{
                    // Check if game is over first
                    if (Object.keys(this.remainingTracks).length === 0) {
                        this.gameOver = true;
                        return false;
                    }
                    else
                        this.playNextTrack();
                }, 2000)
            },

            /**
             * Gets the button styling for a generated button. Will return success or danger when a question is answered
             */
            buttonVariant(uri) {
                if (this.showFeedback && uri === this.currentTrackURI) {
                    return 'success';
                }
                else if (this.showFeedback && uri === this.userChoiceURI)
                    return 'danger';
                else
                    return 'outline-primary';
            },

            async stopTrack() {
                await this.$store.dispatch('pause');
                setTimeout(()=>{
                    this.$store.commit('updateLockControls', false);
                }, 500);

            }

        }
    }

</script>

<style scoped>

</style>