const SpotifyWebApi = require('spotify-web-api-node')
const { map, splitEvery } = require('ramda')
const waterfall = require('promise-waterfall')
const {
  REPLACE_TRACKS_LIMIT,
  REMOVE_TRACKS_LIMIT,
  ADD_TRACKS_LIMIT
} = require('../app-constants')
const { trackUri } = require('../selectors/track')

const spotifyApiHelper = {
  getInstance: function getInstance (options) {
    return new SpotifyWebApi(options)
  },

  authorizeWithRefreshToken: function authorizeWithRefreshToken (
    apiInstance,
    refreshToken
  ) {
    apiInstance.setRefreshToken(refreshToken)
    return apiInstance.refreshAccessToken().then(res => {
      const { access_token: accessToken } = res.body
      apiInstance.setAccessToken(accessToken)

      return { accessToken }
    })
  },

  getPlaylistTracks: function getPlaylistTracks (apiInstance, playlistId) {
    let tracks = []

    function getRecursive (offset, limit, resolve, reject) {
      apiInstance
        .getPlaylistTracks(playlistId, { offset, limit })
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
  },

  removePlaylistTracks: function removePlaylistTracks (
    apiInstance,
    playlistId,
    trackUris
  ) {
    // Convert the array of strings into objects, because the API expects objects when removing tracks
    const tracks = trackUris.map(uri => ({ uri }))
    const batches = splitEvery(REMOVE_TRACKS_LIMIT, tracks)

    return Promise.all(
      batches.map(batch =>
        apiInstance.removeTracksFromPlaylist(playlistId, batch)
      )
    )
  },

  addPlaylistTracks: function addPlaylistTracks (
    apiInstance,
    playlistId,
    trackUris
  ) {
    const batches = splitEvery(ADD_TRACKS_LIMIT, trackUris)

    // We can't just Promise.all here, as the order in which the batches are completed must be the
    // same as the order of the array (to unsure the tracks are added in the correct order)
    return waterfall(
      batches.map(batch => () =>
        apiInstance.addTracksToPlaylist(playlistId, batch)
      )
    )
  },

  replaceTracksInPlaylist: function replaceTracksInPlaylist (
    apiInstance,
    playlistId,
    trackUris
  ) {
    // The Spotify API only allows us to replace a limited number of tracks at once
    if (trackUris.length <= REPLACE_TRACKS_LIMIT) {
      return apiInstance.replaceTracksInPlaylist(playlistId, trackUris)
    }

    // If the limit is exceeded, we need to manually clear the playlist and batch-add tracks to it
    return this.getPlaylistTracks(apiInstance, playlistId)
      .then(map(trackUri))
      .then(currentTrackUris =>
        this.removePlaylistTracks(apiInstance, playlistId, currentTrackUris)
      )
      .then(() => this.addPlaylistTracks(apiInstance, playlistId, trackUris))
  }
}

module.exports = spotifyApiHelper
