import axios from 'axios';


export default class SpotifyController {
    constructor(token) {
        this.token = token;
        this.http = axios.create({
            baseURL: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    getCurrentTrack() {
        return this.http.get('player/currently-playing');
    }

    getUserPlaylists() {
        return this.http.get('/playlists?limit=50');
    }

    setShuffle(state) {
        return this.http.put(`player/shuffle?state=${state}`);
    }

}