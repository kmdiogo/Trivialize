<template>
    <div class="d-flex justify-content-center align-items-center h-100 flex-colum position-relative">
        <b-card class="h-50 shadow-lg" header="Select a Playlist" header-tag="h3" body-class="overflow-auto p-4">
            <transition name="fade" mode="out-in">
            <b-table :items="playLists" :fields="playlistTableFields" outlined reponsive hover class="overflow-auto" thead-class="d-none" v-if="playLists" :busy="isLoading">

                    <template slot="images" slot-scope="data">
                        <b-img width="100px" height="100px" :src="data.item.images[0].url" fluid></b-img>
                    </template>
                    <template slot="select" slot-scope="row">
                        <b-button @click="onPlaylistClick(row)">Select</b-button>
                    </template>
                    <template slot="table-busy" class="text-center text-primary my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </template>
            </b-table>
            </transition>
        </b-card>
    </div>
</template>

<script>
    import SpotifyController from '@/SpotifyController'
    import axios from 'axios'
    import {cloneDeep} from 'lodash'

    export default {
        name: "ChoosePlaylist",
        beforeRouteEnter(to, from, next) {
            next(vm => {
                if (vm.$store.state.accessToken)
                    vm.loadPlaylists();
                else
                    vm.$router.push('/');
            })
        },
        data() {
            return {
                playLists: [],
                playlistTableFields: ['name', 'images', 'select'],
                isLoading: false
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
            playList: {
                get() {return this.$store.state.gameState.playList},
                set(value) {
                    this.$store.commit('updatePlayList', value)
                }
            },
            tracks: {
                get() {return this.$store.state.gameState.tracks},
                set(value) {
                    this.$store.commit('updateTracks', value)
                }
            }
        },
        methods: {
            async loadPlaylists() {
                this.isLoading = true;
                let response = await this.spotifyController.getUserPlaylists();
                this.playLists = response.data.items;
                this.isLoading = false;
            },

            async onPlaylistClick(row) {
                this.playList = row.item;

                // Get all tracks for the selected playlist
                let trackData = await this.http.get(row.item.tracks.href + `?market=from_token&fields=items(track(uri,name,is_playable,id,duration_ms,artists))`);
                this.tracks = cloneDeep(trackData.data.items);
                if (this.$store.state.isPremium)
                    this.$router.push('/play');
                else
                    this.$router.push('/playLite');
            }
        }
    }
</script>

<style scoped>

</style>