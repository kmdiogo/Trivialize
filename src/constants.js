const clientId = "995e9615284a4438b14c3a472177df80";
const uri = "http://localhost:8080";
//const uri = "http://kmdiogo.people.ysu.edu/";
export const spotifyAuthUrl = `http://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${uri}&scope=playlist-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-birthdate user-read-email user-read-private`;