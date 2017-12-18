const SpotifyWebApi = require('spotify-web-api-node')

exports.getInstance = function getInstance (options) {
  return new SpotifyWebApi(options)
}

exports.authorizeWithRefreshToken = function authorizeWithRefreshToken (
  apiInstance,
  refreshToken
) {
  apiInstance.setRefreshToken(refreshToken)
  return apiInstance.refreshAccessToken().then(res => {
    const { access_token: accessToken } = res.body
    apiInstance.setAccessToken(accessToken)

    return { accessToken }
  })
}

exports.getPlaylistTracks = function getPlaylistTracks (
  apiInstance,
  userId,
  playlistId
) {
  let tracks = []

  function getRecursive (offset = 0, limit = 100, resolve, reject) {
    apiInstance
      .getPlaylistTracks(userId, playlistId, { offset, limit })
      .then(res => {
        // Append the new tracks to the existing array
        tracks = tracks.concat(res.body.items)

        // Get the next section if available
        if (res.body.next) {
          return getRecursive(offset + limit, limit, resolve, reject)
        }

        // If we have everything, resolve
        return resolve(tracks)
      })
      .catch(reject)
  }

  // Get all tracks recursively
  return new Promise((resolve, reject) => {
    getRecursive(0, 100, resolve, reject)
  })
}

exports.replaceTracksInPlaylist = function replaceTracksInPlaylist (
  apiInstance,
  userId,
  playlistId,
  trackUris
) {
  return apiInstance.replaceTracksInPlaylist(userId, playlistId, trackUris)
}
