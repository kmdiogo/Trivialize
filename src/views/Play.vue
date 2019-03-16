<template>
    <div class="d-flex justify-content-center align-items-center h-100 flex-colum position-relative">
        <b-button variant="secondary" @click="loadPlaylists" style="position: absolute; top: 10px; left: 10px" :disabled="selectionMade || !tracks">Choose New Playlist</b-button>
        <div class="d-flex flex-column justify-content-center align-items-center h-100">
            <transition name="fade" mode="out-in">
                <b-card class="h-50 shadow-lg" v-if="!tracks" header="Select a Playlist" header-tag="h3" body-class="overflow-auto p-4">
                    <b-table :items="playLists" :fields="playlistTableFields" outlined reponsive hover class="overflow-auto" thead-class="d-none" v-if="playLists">
                        <template slot="images" slot-scope="data">
                            <b-img width="100px" height="100px" :src="data.item.images[0].url" fluid></b-img>
                        </template>
                        <template slot="select" slot-scope="row">
                            <b-button @click="onPlaylistClick(row)">Select</b-button>
                        </template>
                    </b-table>
                </b-card>
                <b-card v-else-if="gameOver" class="shadow-lg" header-tag="h3" :header="gameOverHeader" body-class="overflow-auto">
                    <div v-if="incorrectSongs.length === 0">
                        <h5>100%! Nice Job!</h5>
                    </div>
                    <div v-else>
                        <h5>You missed these songs: </h5>
                        <b-table :items="incorrectSongs" :fields="['artist','name']">
                            <template slot="artist" slot-scope="data">
                                {{data.item.artists[0].name}}
                            </template>
                        </b-table>
                    </div>
                    <b-button @click="loadPlaylists" variant="primary">Play Again?</b-button>
                </b-card>
                <b-card class="overflow-auto h-50 shadow-lg" v-else :header="songsLeftsHeader" header-tag="h3" body-class="overflow-auto">
                    <b-button block :variant="buttonVariant(track.uri)" v-for="track in choices" :key="track.uri" @click="onChoiceClick(track.uri)" :disabled="selectionMade">
                        {{track.artists[0].name}} - {{track.name}}
                    </b-button>
                </b-card>
            </transition>

            <b-card v-if="!gameOver && tracks" class="w-100 shadow-lg" body-class="p-2" body-bg-variant="dark">
                <b-button variant="secondary" @click="replayTrack" :disabled="$store.state.lockControls"><i class="fas fa-undo"></i></b-button>
                <b-progress class="mt-2" :max="$store.state.settings.listeningDuration-800">
                    <b-progress-bar :value="progress" variant="primary"></b-progress-bar>
                </b-progress>
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
                calculatedTrackStart: null,
                currentTrackDuration: null,
                incorrectSongs: [],
                numberOfCorrect: 0,
                gameOver: false,
                showFeedback: false,
                userChoiceURI: null,
                currentTrackURI: null,
                selectionMade: false,
                progress: 0
            }
        },
        computed: {
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
            songsLeftsHeader() {
                return `Songs Left: ${Object.keys(this.remainingTracks).length}`
            },
            gameOverHeader() {
                return `You got ${this.numberOfCorrect} / ${Object.keys(this.tracks).length} songs correct!`
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (!vm.$store.state.accessToken)
                    vm.$router.push('/');
                else {
                    vm.loadPlaylists();
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
                this.progress = 0;
            },

            async onPlaylistClick(row) {
                await this.spotifyController.setShuffle(true);

                // Get all tracks for the selected playlist
                let trackData = await this.http.get(row.item.tracks.href + `?market=from_token&fields=items(track(uri,name,is_playable,id,duration_ms,artists))`);
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

                // Pause song after duration ends
                // nowURI is used to prevent the song from playing if user guesses quickly
                let nowURI = this.currentTrackURI;

                await this.waitForTrackPlay();
                let counter = setInterval(async ()=>{
                    this.progress += 100;
                    if (this.progress === this.$store.state.settings.listeningDuration || this.selectionMade) {
                        clearInterval(counter);
                        this.progress = 0;
                    }
                }, 100);
                setTimeout(async function(){
                    await this.spotifyController.getCurrentTrack();
                    if (nowURI === this.currentTrackURI) {
                        await this.$store.dispatch('pause');
                        this.$store.commit('updateLockControls', false);
                    }
                }.bind(this), this.$store.state.settings.listeningDuration);
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
                let numberOfChoices = this.$store.state.settings.numberOfChoices-1;
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

                // Calculate the random starting point for the current song
                // If the duration is less than 30 seconds or less, set the starting point to the beginning
                // Otherwise, choose a random starting point from the beginning to (end - 30secs)
                if (this.tracks[this.currentTrackURI].duration_ms <= 30000)
                    this.calculatedTrackStart = 0;
                else {
                    this.calculatedTrackStart = Math.floor(Math.random() * this.tracks[this.currentTrackURI].duration_ms - 30000);
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

            /**
             * Spin Lock until a track is playing in the device
             * Times out after 10 seconds
             * @returns {Promise<*>}
             */
            async waitForTrackPlay() {
                return new Promise(resolve=>{
                    let timePassed = 0;
                    let id = setInterval(async ()=>{
                        timePassed += 500;
                        let currentState = await this.spotifyController.getCurrentTrack();
                        if (currentState.data.is_playing) {
                            clearInterval(id);
                            resolve(id);
                        }
                        else if (timePassed > 10000) {
                            clearInterval(id);
                            resolve(id);
                        }
                    }, 500)
                })
            }

        }
    }

</script>

<style scoped>

</style>