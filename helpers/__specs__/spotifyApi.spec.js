const SpotifyWebApi = require('spotify-web-api-node')
const spotifyApiHelpers = require('../spotifyApi')
const { REPLACE_TRACKS_LIMIT } = require('../../app-constants')

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
        .getPlaylistTracks(apiInstance, playlistId)
        .then(tracks => {
          expect(apiInstance.getPlaylistTracks).toHaveBeenCalledTimes(2)

          const { calls } = apiInstance.getPlaylistTracks.mock

          expect(calls[0]).toEqual([playlistId, { offset: 0, limit: 100 }])
          expect(calls[1]).toEqual([playlistId, { offset: 100, limit: 100 }])

          expect(tracks).toHaveLength(142)
        })
    })
  })

  describe('removePlaylistTracks', () => {
    it('should remove the passed tracks in batches', () => {
      apiInstance.removeTracksFromPlaylist = jest.fn(() => Promise.resolve())

      const playlistId = '5318008'
      const trackUris = new Array(REPLACE_TRACKS_LIMIT + 1).fill('some-uri')

      return spotifyApiHelpers
        .removePlaylistTracks(apiInstance, playlistId, trackUris)
        .then(() => {
          expect(apiInstance.removeTracksFromPlaylist).toHaveBeenCalledTimes(2)

          // First batch
          expect(apiInstance.removeTracksFromPlaylist).toHaveBeenCalledWith(
            playlistId,
            trackUris.slice(0, REPLACE_TRACKS_LIMIT).map(uri => ({ uri }))
          )

          // Second batch
          expect(apiInstance.removeTracksFromPlaylist).toHaveBeenCalledWith(
            playlistId,
            trackUris
              .slice(REPLACE_TRACKS_LIMIT, REPLACE_TRACKS_LIMIT + 1)
              .map(uri => ({ uri }))
          )
        })
    })
  })

  describe('addPlaylistTracks', () => {
    it('should add the passed tracks in batches', () => {
      apiInstance.addTracksToPlaylist = jest.fn(() => Promise.resolve())

      const playlistId = '5318008'
      const trackUris = new Array(REPLACE_TRACKS_LIMIT + 1)

      return spotifyApiHelpers
        .addPlaylistTracks(apiInstance, playlistId, trackUris)
        .then(() => {
          expect(apiInstance.addTracksToPlaylist).toHaveBeenCalledTimes(2)

          // First batch
          expect(apiInstance.addTracksToPlaylist).toHaveBeenCalledWith(
            playlistId,
            trackUris.slice(0, REPLACE_TRACKS_LIMIT)
          )

          // Second batch
          expect(apiInstance.addTracksToPlaylist).toHaveBeenCalledWith(
            playlistId,
            trackUris.slice(REPLACE_TRACKS_LIMIT, REPLACE_TRACKS_LIMIT + 1)
          )
        })
    })
  })

  describe('replaceTracksInPlaylist', () => {
    describe('within the API limit', () => {
      it('should attempt to replace all tracks at once', () => {
        const playlistId = '5318008'
        const trackUris = ['first uri', 'second uri']

        return spotifyApiHelpers
          .replaceTracksInPlaylist(apiInstance, playlistId, trackUris)
          .then(() => {
            expect(apiInstance.replaceTracksInPlaylist).toHaveBeenCalledTimes(1)
            expect(apiInstance.replaceTracksInPlaylist).toHaveBeenCalledWith(
              playlistId,
              trackUris
            )
          })
      })
    })

    describe('manually replace when exceeding the API limit', () => {
      it('should get the current tracks', () => {
        spotifyApiHelpers.getPlaylistTracks = jest.fn(() =>
          Promise.reject(new Error())
        )

        const playlistId = '5318008'
        const trackUris = new Array(REPLACE_TRACKS_LIMIT + 1)

        return spotifyApiHelpers
          .replaceTracksInPlaylist(apiInstance, playlistId, trackUris)
          .catch(() => {
            // Should not have used the automatic function
            expect(apiInstance.replaceTracksInPlaylist).toHaveBeenCalledTimes(0)

            expect(spotifyApiHelpers.getPlaylistTracks).toHaveBeenCalledTimes(1)
            expect(spotifyApiHelpers.getPlaylistTracks).toHaveBeenCalledWith(
              apiInstance,
              playlistId
            )
          })
      })

      it('should remove the current tracks', () => {
        const currentTracks = [{ track: { uri: 'current-track-0' } }]

        spotifyApiHelpers.getPlaylistTracks = () =>
          Promise.resolve(currentTracks)
        spotifyApiHelpers.removePlaylistTracks = jest.fn(() =>
          Promise.reject(new Error())
        )

        const playlistId = '5318008'
        const trackUris = new Array(REPLACE_TRACKS_LIMIT + 1)

        return spotifyApiHelpers
          .replaceTracksInPlaylist(apiInstance, playlistId, trackUris)
          .catch(() => {
            expect(
              spotifyApiHelpers.removePlaylistTracks
            ).toHaveBeenCalledTimes(1)
            expect(spotifyApiHelpers.removePlaylistTracks).toHaveBeenCalledWith(
              apiInstance,
              playlistId,
              currentTracks.map(currentTrack => currentTrack.track.uri)
            )
          })
      })

      it('should add the new tracks', () => {
        const currentTracks = [{ track: { uri: 'current-track-0' } }]

        spotifyApiHelpers.getPlaylistTracks = () =>
          Promise.resolve(currentTracks)
        spotifyApiHelpers.removePlaylistTracks = () => Promise.resolve()
        spotifyApiHelpers.addPlaylistTracks = jest.fn(() =>
          Promise.reject(new Error())
        )

        const playlistId = '5318008'
        const trackUris = new Array(REPLACE_TRACKS_LIMIT + 1)

        return spotifyApiHelpers
          .replaceTracksInPlaylist(apiInstance, playlistId, trackUris)
          .catch(() => {
            expect(spotifyApiHelpers.addPlaylistTracks).toHaveBeenCalledTimes(1)
            expect(spotifyApiHelpers.addPlaylistTracks).toHaveBeenCalledWith(
              apiInstance,
              playlistId,
              trackUris
            )
          })
      })
    })
  })
})
