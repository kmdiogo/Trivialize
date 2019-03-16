export const clientId = "995e9615284a4438b14c3a472177df80";
//export const baseUrl = "https://kmdiogo.github.io";
export const baseUrl = "http://localhost:8080";
export const spotifyAuthUrl = `http://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${baseUrl}&scope=playlist-read-private user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-birthdate user-read-email user-read-private`;