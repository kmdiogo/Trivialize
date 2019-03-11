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
                <b-table :items="incorrectSongs"></b-table>
            </b-card>
            <b-card class="overflow-auto h-50" v-else>
                <h5>Songs left: {{Object.keys(remainingTracks).length}}</h5>
                <b-button block :variant="buttonVariant(track.Id)" v-for="track in choices" :key="track.Id" @click="onChoiceClick(track.Id)" :disabled="$store.state.lockControls">
                    {{track.Artist}} - {{track.Song}}
                </b-button>
            </b-card>
        </transition>

        <b-card>
            <b-button-group>
                <b-button variant="primary" @click="replayTrack" :disabled="$store.state.lockControls"><i class="fas fa-undo"></i></b-button>
            </b-button-group>
        </b-card>
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
                currentTrackId: null,
                currentTrackStart: null,
                currentTrackDuration: null,
                incorrectSongs: [],
                numberOfCorrect: 0,
                gameOver: false,
                showFeedback: false,
                userChoiceId: null,
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
            async onPlaylistClick(row) {
                await this.spotifyController.setShuffle(true);

                // Get all tracks for the selected playlist
                let trackData = await this.http.get(row.item.tracks.href);
                let tracks = trackData.data.items;

                // Create object, where the key is the song id and value is an object with the artist and song
                // Tracks are represented as object to improve lookup times
                let formatted = {};
                for (let i=0; i < tracks.length; i++) {
                    formatted[tracks[i].track.id] = {
                        Artist: tracks[i].track.artists[0].name,
                        Song: tracks[i].track.name
                    }
                }
                this.tracks = cloneDeep(formatted);
                this.remainingTracks = cloneDeep(formatted);
                this.playNextTrack();
            },

            /**
             * Helper function that combines moving to the next song, updating the multiple choice, and playing the track
             * at a random location
             */
            async playNextTrack() {
                // --- Seek to next track ---
                await this.$store.dispatch('pause');
                await this.$store.dispatch('seek', 9999999);
                setTimeout(async ()=>{
                    //this.$store.dispatch('pause').then(()=>{
                    await this.updateChoices();

                    // --- Play next track ---
                    await this.replayTrack();
                }, 2000);
            },

            /**
             * Seeks to calculated random moment for the current track and plays for x amount of seconds
             * x is defined by the user in the SettingsBox
             */
            async replayTrack() {
                this.showFeedback = false;
                this.$store.commit('updateLockControls', true);
                await this.$store.dispatch('seek', this.currentTrackStart);
                await this.$store.dispatch('resume');

                // Set default duration if the user-defined duration is longer than the track
                // This makes it so the song will never play till the end (which we want to avoid since
                // that will automatically move to the next track)
                // In this case, we simply set the duration to one second less than the duration of the song
                let duration = this.$store.state.listeningDuration;
                if (duration >= this.currentTrackDuration)
                    duration = this.currentTrackDuration - 1000;

                // Pause song after duration ends
                setTimeout(function(){
                    this.$store.dispatch('pause').then(()=>{
                        this.$store.commit('updateLockControls', false);
                    });
                }.bind(this), duration);
            },

            /**
             * Gets the current track and adds it as on option then adds n other
             * randomly sampled-without-replacement options.
             * n is defined by the user in SettingsBox
             */
            async updateChoices() {
                this.choices = [];
                let r = await this.spotifyController.currentTrack();

                let artist = r.data.item.artists[0].name;
                let song = r.data.item.name;
                let id = r.data.item.id;

                this.currentTrackDuration = r.data.item.duration_ms;
                this.currentTrackId = id;

                // Add the current playing song as a choice
                this.choices.push({
                    Artist: artist,
                    Song: song,
                    Id: id
                });

                // If track is not in playlist, notify user. This will typically only happen if the user
                // selected the wrong playlist when setting up
                if (!this.tracks[id])
                    alert("Current playing track does not exist in playlist you selected!");
                else
                    // remove the currently playing song from the list of remaining tracks
                    delete this.remainingTracks[id];

                // If n is greater than the amount of remaining tracks, set n to amount of remaining tracks
                let numberOfChoices = this.$store.state.numberOfChoices;
                if (Object.keys(this.remainingTracks).length < numberOfChoices) {
                    numberOfChoices = Object.keys(this.remainingTracks).length+1;
                }
                // Push n random choices
                let ids = shuffle(Object.keys(this.remainingTracks));
                for (let i=0; i < numberOfChoices-1; i++) {
                    this.choices.push({
                        Artist: this.remainingTracks[ids[i]].Artist,
                        Song: this.remainingTracks[ids[i]].Song,
                        Id: ids[i]
                    });
                }

                // Reshuffle so current song isn't always the first element in choice array
                this.choices = shuffle(this.choices);

                // Set default duration if the user-defined duration is longer than the track
                // This makes it so the song will never play till the end (which we want to avoid since
                // that will automatically move to the next track)
                // In this case, we simply set the duration to one second less than the duration of the song
                let duration = this.$store.state.listeningDuration;
                if (duration >= this.currentTrackDuration)
                    duration = this.currentTrackDuration - 1000;

                // Calculate the random starting point for the current song
                // If the duration is less than 20 seconds, set the starting point to the beginning
                // Otherwise,
                if (this.currentTrackDuration <= 20000)
                    this.currentTrackStart = 0;
                else {
                    this.currentTrackStart = Math.floor(Math.random() * this.currentTrackDuration - duration);
                }
            },

            onChoiceClick(id) {
                this.userChoiceId = id;
                this.showFeedback = true;
                this.$store.commit('updateLockControls', true);
                if (id === this.currentTrackId) {
                    this.numberOfCorrect += 1;
                }
                else {
                    this.incorrectSongs.push(cloneDeep(this.tracks[this.currentTrackId]));
                }

                setTimeout(async ()=>{
                    // Check if game is over first
                    if (Object.keys(this.remainingTracks).length === 0) {
                        console.log("DONE");
                        this.gameOver = true;
                        return false;
                    }
                    else
                        this.playNextTrack();
                }, 2000)
            },

            buttonVariant(id) {
                if (this.showFeedback && id === this.currentTrackId) {
                    return 'success';
                }
                else if (this.showFeedback && id === this.userChoiceId)
                    return 'danger';
                else
                    return 'outline-primary';

            },

            async stopTrack() {
                await this.$store.dispatch('pause');
                this.$store.commit('updateLockControls', false);
            }

        }
    }

</script>

<style scoped>

</style>