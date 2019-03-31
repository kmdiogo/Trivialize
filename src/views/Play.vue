<template>
    <!-- TODO: Add carousel background of currently playing song's cover art, unblur when song selected -->
    <div class="d-flex h-100 position-relative">
        <b-button variant="secondary" @click="goToPlaylists" class="new-pl-btn" :disabled="selectionMade || !tracks">Choose New Playlist</b-button>
        <div class="d-flex flex-column justify-content-center align-items-center h-100 w-100">
            <div class="d-flex flex-column justify-content-center align-items-center h-75 play-card">
                <b-card v-if="gameOver" class="shadow-lg border-0" header-tag="h4" :header="gameOverHeader" body-class="overflow-auto" header-bg-variant="secondary">
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
                    <b-button @click="goToPlaylists" variant="primary">Play Again?</b-button>
                </b-card>

                <b-card class="overflow-auto shadow-lg w-100 h-100 border-0" v-else :header="songsLeftsHeader" header-tag="h4" body-class="overflow-auto" header-bg-variant="secondary">
                    <b-button block :variant="buttonVariant(track.uri)" v-for="track in choices" :key="track.uri" @click="onChoiceClick(track.uri)" :disabled="selectionMade">
                        {{track.artists[0].name}} - {{track.name}}
                    </b-button>
                </b-card>

                <b-card v-if="!gameOver && tracks" class="w-100 shadow-lg border-0" body-class="p-2" body-bg-variant="dark" header-bg-variant="secondary">
                    <b-button variant="secondary" @click="replayTrack" :disabled="$store.state.lockControls"><i class="fas fa-undo"></i></b-button>
                    <b-progress class="mt-2" :max="$store.state.settings.listeningDuration-800">
                        <b-progress-bar :value="progress" variant="primary"></b-progress-bar>
                    </b-progress>
                </b-card>
            </div>

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
                tracks: null,
                remainingTracks: {},
                choices: [],
                calculatedTrackStart: null,
                incorrectSongs: [],
                numberOfCorrect: 0,
                gameOver: false,
                showFeedback: false,
                userChoiceURI: null,
                currentTrack: null,
                selectionMade: false,
                progress: 0,
                remainingTracksLength: 0,
                NEXT_SONG_DELAY: 2000
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
                return `Songs Left: ${this.remainingTracksLength}`
            },
            gameOverHeader() {
                return `You got ${this.numberOfCorrect} / ${Object.keys(this.tracks).length} songs correct!`
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (!vm.$store.state.accessToken)
                    vm.$router.push('/');
                else if (!vm.$store.state.gameState.tracks) {
                    vm.$router.push('/choosePlaylist');
                }
                else {
                    vm.startGame();
                }
            })
        },
        methods: {
            async goToPlaylists() {
                this.resetGame();
                this.$router.push('/choosePlaylist');
            },

            async resetGame() {
                if (this.$store.state.isPremium)
                    await this.$store.dispatch('pause');
                this.gameOver = false;
                this.remainingTracks = {};
                this.tracks = null;
                this.choices = [];
                this.numberOfCorrect = 0;
                this.incorrectSongs = [];
                this.selectionMade = false;
                this.progress = 0;
                this.remainingTracksLength = 0;
                this.currentTrack = null;
            },

            async startGame() {
                await this.resetGame();
                let formatted = {};
                this.$store.state.gameState.tracks.forEach(item=>{
                    if (this.$store.state.isPremium) {
                        if (item.track.is_playable)
                            formatted[item.track.uri] = cloneDeep(item.track);
                    }
                    else {
                        if (item.track.preview_url)
                            formatted[item.track.uri] = cloneDeep(item.track);
                    }

                });

                this.tracks = cloneDeep(formatted);
                this.remainingTracks = cloneDeep(formatted);
                this.remainingTracksLength = Object.keys(this.remainingTracks).length;
                this.playNextTrack();
            },

            /**
             * Helper function that combines moving to the next song, updating the multiple choice, and playing the track
             * at a random location
             */
            async playNextTrack() {
                let keys = Object.keys(this.remainingTracks);
                let rand = Math.floor(Math.random()*keys.length);
                this.currentTrack = this.remainingTracks[keys[rand]];
                this.updateChoices();
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

                if (this.$store.state.isPremium) {
                    this.replayTrackPremium();
                }
                else {
                    this.replayTrackLite();
                }

            },

            async replayTrackLite() {
                let sound = new Audio(this.currentTrack.preview_url);
                sound.play();
                let counter = setInterval(()=>{
                    this.progress += 100;
                    // If song duration ends or a selection was made or tracks is empty (game was restarted) reset the progress bar
                    if (this.progress === this.$store.state.settings.listeningDuration || this.selectionMade || !this.tracks) {
                        sound.pause();
                        this.progress = 0;
                        if (!this.selectionMade || !this.tracks)
                            this.$store.commit('updateLockControls', false);

                        clearInterval(counter);
                    }
                }, 100);
            },

            async replayTrackPremium() {
                await this.http.put('player/play', {
                    uris: [this.currentTrack.uri],
                    position_ms: this.calculatedTrackStart
                });

                // Pause song after duration ends
                // nowURI is used to prevent the song from playing if user guesses quickly
                let nowURI = this.currentTrack.uri;

                await this.waitForTrackPlay();
                let counter = setInterval(async ()=>{
                    this.progress += 100;
                    // If song duration ends or a selection was made or tracks is empty (game was restarted) reset the progress bar
                    if (this.progress === this.$store.state.settings.listeningDuration || this.selectionMade || !this.tracks) {
                        clearInterval(counter);
                        this.progress = 0;
                    }
                }, 100);
                setTimeout(async function(){
                    await this.spotifyController.getCurrentTrack();
                    if (nowURI === this.currentTrack.uri) {
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
            updateChoices() {
                this.choices = [];

                // Add the current playing song as a choice
                this.choices.push(cloneDeep(this.remainingTracks[this.currentTrack.uri]));

                // remove the currently playing song from the list of remaining tracks
                delete this.remainingTracks[this.currentTrack.uri];
                this.remainingTracksLength -= 1;

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
                if (this.tracks[this.currentTrack.uri].duration_ms <= 30000) {
                    this.calculatedTrackStart = 0;
                }
                else {
                    this.calculatedTrackStart = Math.floor(Math.random() * (this.tracks[this.currentTrack.uri].duration_ms - 30000));
                }

            },

            async onChoiceClick(uri) {
                this.selectionMade = true;

                if (this.$store.state.isPremium)
                    await this.$store.dispatch('pause');

                this.userChoiceURI = uri;
                this.showFeedback = true;
                this.$store.commit('updateLockControls', true);
                if (uri === this.currentTrack.uri) {
                    this.numberOfCorrect += 1;
                }
                else {
                    this.incorrectSongs.push(cloneDeep(this.tracks[this.currentTrack.uri]));
                }

                setTimeout(async ()=>{
                    // Check if game is over first
                    if (Object.keys(this.remainingTracks).length === 0) {
                        this.gameOver = true;
                        return false;
                    }
                    else
                        this.playNextTrack();
                }, this.NEXT_SONG_DELAY)
            },

            /**
             * Gets the button styling for a generated button. Will return success or danger when a question is answered
             */
            buttonVariant(uri) {
                if (this.showFeedback && uri === this.currentTrack.uri) {
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

<style scoped lang="scss">
    @media (max-width: 768px) {
        .play-card {
            width: 100% !important;
        }
    }
    .play-card {
        width: 75%;
    }
    .new-pl-btn {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
    }
</style>