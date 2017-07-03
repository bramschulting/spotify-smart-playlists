const SpotifyWebApi = jest.fn(() => SpotifyWebApi)

SpotifyWebApi.authorizationCodeGrant = jest.fn(() =>
  Promise.resolve({
    body: {
      access_token: 'some access_token',
      refresh_token: 'some refresh_token'
    }
  })
)

SpotifyWebApi.refreshAccessToken = jest.fn(() =>
  Promise.resolve({
    body: {
      access_token: 'some access_token'
    }
  })
)

SpotifyWebApi.setAccessToken = jest.fn()

SpotifyWebApi.setRefreshToken = jest.fn()

SpotifyWebApi.getPlaylistTracks = jest.fn()

SpotifyWebApi.replaceTracksInPlaylist = jest.fn(() => Promise.resolve())

module.exports = SpotifyWebApi
