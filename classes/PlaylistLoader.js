const spotifyApiHelper = require('../helpers/spotifyApi')

class PlaylistLoader {
  constructor (playlistId) {
    this.playlistId = playlistId
  }

  getTracks (apiInstance) {
    return spotifyApiHelper.getPlaylistTracks(apiInstance, this.playlistId)
  }
}

module.exports = PlaylistLoader
