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

    currentTrack() {
        return this.http.get('player/currently-playing');
    }

    next() {
        return this.http.post('player/next/');
    }

    getUserPlaylists() {
        return this.http.get('/playlists');
    }

    setShuffle(state) {
        return this.http.put(`player/shuffle?state=${state}`);
    }

}