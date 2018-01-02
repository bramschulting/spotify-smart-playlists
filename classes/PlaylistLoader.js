const spotifyApiHelper = require('../helpers/spotifyApi')

class PlaylistLoader {
  constructor (userId, playlistId) {
    this.userId = userId
    this.playlistId = playlistId
  }

  getTracks (apiInstance) {
    return spotifyApiHelper.getPlaylistTracks(
      apiInstance,
      this.userId,
      this.playlistId
    )
  }
}

module.exports = PlaylistLoader
