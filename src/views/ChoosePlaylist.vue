<template>
    <!-- TODO: Add carousel background of album covers -->
    <div class="d-flex justify-content-center align-items-center h-100 flex-column position-relative">
        <b-carousel class="carousel-bg" no-touch no-hover-pause fade>
            <b-carousel-slide v-for="pl in playLists" :img-src="pl.images[0].url" :key="pl.id"></b-carousel-slide>
        </b-carousel>
        <b-card class="h-75 shadow-lg choose-playlist-card border-0"
                header="Select a Playlist" header-tag="h4"
                body-class="overflow-auto p-4"
                header-bg-variant="secondary" bg-variant="dark" text-variant="white">

            <div class="text-left">
                <span @click="isMyPlaylistTableOpen=!isMyPlaylistTableOpen">
                    <i class="far fa-minus-square text-light collapse-btn" v-if="isMyPlaylistTableOpen"></i>
                    <i class="far fa-plus-square collapse-btn" v-else></i>
                </span>
                <span class="collapse-btn" @click="isMyPlaylistTableOpen=!isMyPlaylistTableOpen"> My Playlists</span>
            </div>
            <b-collapse id="myPlaylistTable" v-model="isMyPlaylistTableOpen">
                <b-table :items="playLists" :fields="playlistTableFields"
                         outlined reponsive hover class="overflow-auto border-0"
                         thead-class="d-none" v-if="playLists" :busy="isLoading" dark>
                    <template slot="images" slot-scope="data">
                        <div class="d-none d-sm-block">
                            <b-img width="100px" height="100px" :src="noImageFallback(data.item)" fluid></b-img>
                        </div>
                    </template>
                    <template slot="select" slot-scope="row">
                        <b-button @click="onPlaylistClick(row)" size="sm" variant="primary">Select</b-button>
                    </template>
                    <template slot="table-busy" class="text-center text-primary my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </template>
                </b-table>
            </b-collapse>

            <hr class="bg-light" />

            <div class="text-left">
                <b-form-group label="Search Playlist: ">
                    <b-input @input="debounceInput" size="sm"></b-input>
                </b-form-group>
                <b-table :items="searchPlayLists" :fields="playlistTableFields"
                         outlined reponsive hover class="overflow-auto text-light border-0"
                         thead-class="d-none" v-if="searchPlayLists" :busy="searchIsLoading" dark>
                    <template slot="images" slot-scope="data">
                        <div class="d-none d-sm-block">
                            <b-img width="100px" height="100px" :src="noImageFallback(data.item)" fluid></b-img>
                        </div>
                    </template>
                    <template slot="select" slot-scope="row">
                        <b-button @click="onPlaylistClick(row)" size="md" variant="primary">Select</b-button>
                    </template>
                    <template slot="table-busy" class="text-center text-primary my-2">
                        <b-spinner class="align-middle" />
                        <strong>Loading...</strong>
                    </template>
                </b-table>
            </div>


        </b-card>
    </div>

</template>

<script>
    import SpotifyController from '@/SpotifyController'
    import axios from 'axios'
    import {cloneDeep, debounce} from 'lodash'

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
                searchPlayLists: [],
                playlistTableFields: ['name', 'images', 'select'],
                isLoading: false,
                searchKeyword: '',
                searchIsLoading: false,
                isMyPlaylistTableOpen: false,
            }
        },
        watch: {
            searchKeyword() {
                if (this.searchKeyword.length > 0)
                    this.searchPlaylists();
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
            tabClass(i) {
                if (this.tabIndex === i)
                    return ['bg-light', 'text-dark', 'border-0'];
                else
                    return ['bg-dark', 'text-light', 'border-0'];
            },
            async loadPlaylists() {
                this.isLoading = true;
                let response = await this.spotifyController.getUserPlaylists();
                this.playLists = [];
                response.data.items.forEach(item=>{
                    if (item.tracks.total > 0)
                        this.playLists.push(item)
                });
                this.isLoading = false;
            },

            async onPlaylistClick(row) {
                this.playList = row.item;

                // Get all tracks for the selected playlist
                let trackData = await this.http.get(row.item.tracks.href + `?market=from_token&fields=items(track(uri,name,is_playable,id,duration_ms,artists,preview_url))`);
                this.tracks = cloneDeep(trackData.data.items);
                this.$router.push('/play');
            },
            noImageFallback(item) {
                if (item.images[0]) {
                    return item.images[0].url;
                }
                else
                    return ''
            },
            async searchPlaylists() {
                this.searchIsLoading = true;
                let searchResults = await this.spotifyController.searchPlaylist(this.searchKeyword);
                this.searchPlayLists = [];
                searchResults.data.playlists.items.forEach(item=>{
                    if (item.tracks.total > 0)
                        this.searchPlayLists.push(item);
                })
                this.searchIsLoading = false;
            },
            debounceInput: debounce(function(e){
                this.searchKeyword = e;
            }, 500)
        }
    }
</script>

<style scoped lang="scss">
    @media (max-width: 768px) {
        .choose-playlist-card {
            width: 100% !important;
        }
    }
    .choose-playlist-card {
        width: 75%;
    }
    .collapse-btn:hover {
        cursor: pointer;
    }

</style>