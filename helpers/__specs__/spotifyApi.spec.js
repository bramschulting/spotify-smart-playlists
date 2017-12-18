const spotifyApiHelpers = require('../spotifyApi')
const SpotifyWebApi = require('spotify-web-api-node')

jest.mock('spotify-web-api-node')

describe('spotifyApi helper', () => {
  let apiInstance
  beforeEach(() => {
    apiInstance = spotifyApiHelpers.getInstance()

    jest.clearAllMocks()
  })

  describe('getInstance', () => {
    it('should return a spotify instance with the passed options', () => {
      const options = { foo: 'bar' }

      spotifyApiHelpers.getInstance(options)

      expect(SpotifyWebApi).toHaveBeenCalledTimes(1)
      expect(SpotifyWebApi).toHaveBeenCalledWith(options)
    })
  })

  describe('authorizeWithRefreshToken', () => {
    it('should set the refresh token of the passed instance', () => {
      const refreshToken = 'some refresh token'

      return spotifyApiHelpers
        .authorizeWithRefreshToken(apiInstance, refreshToken)
        .then(() => {
          expect(apiInstance.setRefreshToken).toHaveBeenCalledTimes(1)
          expect(apiInstance.setRefreshToken).toHaveBeenCalledWith(refreshToken)
        })
    })

    it('should attempt to authorize with the passed refresh token', () => {
      const refreshToken = 'some refresh token'

      return spotifyApiHelpers
        .authorizeWithRefreshToken(apiInstance, refreshToken)
        .then(() => {
          expect(apiInstance.refreshAccessToken).toHaveBeenCalledTimes(1)
        })
    })

    it('should set the access token of the passed instance', () => {
      const refreshToken = 'some refresh token'

      return spotifyApiHelpers
        .authorizeWithRefreshToken(apiInstance, refreshToken)
        .then(({ accessToken }) => {
          expect(apiInstance.setAccessToken).toHaveBeenCalledTimes(1)
          expect(apiInstance.setAccessToken).toHaveBeenCalledWith(accessToken)
        })
    })
  })

  describe('getPlaylistTracks', () => {
    it('should recursively get all tracks in a playlist', () => {
      const userId = 'bramschulting'
      const playlistId = '5318008'

      const firstBatchResult = {
        body: {
          items: Array.from({ length: 100 }).fill('track'),
          next: 'https://example.com'
        }
      }
      const secondBatchResult = {
        body: {
          items: Array.from({ length: 42 }).fill('track'),
          next: null
        }
      }

      apiInstance.getPlaylistTracks = jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(firstBatchResult))
        .mockImplementationOnce(() => Promise.resolve(secondBatchResult))

      return spotifyApiHelpers
        .getPlaylistTracks(apiInstance, userId, playlistId)
        .then(tracks => {
          expect(apiInstance.getPlaylistTracks).toHaveBeenCalledTimes(2)

          const { calls } = apiInstance.getPlaylistTracks.mock

          expect(calls[0]).toEqual([
            userId,
            playlistId,
            { offset: 0, limit: 100 }
          ])
          expect(calls[1]).toEqual([
            userId,
            playlistId,
            { offset: 100, limit: 100 }
          ])

          expect(tracks).toHaveLength(142)
        })
    })
  })

  describe('replaceTracksInPlaylist', () => {
    it('should attempt to replace the tracks of a playlist', () => {
      const userId = 'bramschulting'
      const playlistId = '5318008'
      const trackUris = ['first uri', 'second uri']

      return spotifyApiHelpers
        .replaceTracksInPlaylist(apiInstance, userId, playlistId, trackUris)
        .then(() => {
          expect(apiInstance.replaceTracksInPlaylist).toHaveBeenCalledTimes(1)
          expect(apiInstance.replaceTracksInPlaylist).toHaveBeenCalledWith(
            userId,
            playlistId,
            trackUris
          )
        })
    })
  })
})
