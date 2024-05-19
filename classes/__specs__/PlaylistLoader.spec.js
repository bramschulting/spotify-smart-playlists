const PlaylistLoader = require('../PlaylistLoader')
const spotifyApiHelper = require('../../helpers/spotifyApi')

jest.mock('../../helpers/spotifyApi')

describe('PlaylistLoader', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('contructor', () => {
    it('should store the playlistId', () => {
      const playlistId = 'some playlistId'

      const loader = new PlaylistLoader(playlistId)

      expect(loader.playlistId).toEqual(playlistId)
    })
  })

  describe('getTracks', () => {
    it('gets tracks recursively', () => {
      spotifyApiHelper.getPlaylistTracks = jest.fn(() =>
        Promise.reject(new Error())
      )

      const apiInstance = 'some apiInstance'
      const playlistId = 'some playlistId'
      const loader = new PlaylistLoader(playlistId)

      return loader.getTracks(apiInstance).catch(() => {
        expect(spotifyApiHelper.getPlaylistTracks).toHaveBeenCalledTimes(1)
        expect(spotifyApiHelper.getPlaylistTracks).toHaveBeenCalledWith(
          apiInstance,
          playlistId
        )
      })
    })
  })
})
