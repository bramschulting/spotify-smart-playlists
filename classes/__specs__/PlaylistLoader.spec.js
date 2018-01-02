const PlaylistLoader = require('../PlaylistLoader')
const spotifyApiHelper = require('../../helpers/spotifyApi')

jest.mock('../../helpers/spotifyApi')

describe('PlaylistLoader', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('contructor', () => {
    it('should store the userId and playlistId', () => {
      const userId = 'some userId'
      const playlistId = 'some playlistId'

      const loader = new PlaylistLoader(userId, playlistId)

      expect(loader.userId).toEqual(userId)
      expect(loader.playlistId).toEqual(playlistId)
    })
  })

  describe('getTracks', () => {
    spotifyApiHelper.getPlaylistTracks = jest.fn(() =>
      Promise.reject(new Error())
    )

    const apiInstance = 'some apiInstance'
    const userId = 'some userId'
    const playlistId = 'some playlistId'
    const loader = new PlaylistLoader(userId, playlistId)

    return loader.getTracks(apiInstance).catch(() => {
      expect(spotifyApiHelper.getPlaylistTracks).toHaveBeenCalledTimes(1)
      expect(spotifyApiHelper.getPlaylistTracks).toHaveBeenCalledWith(
        apiInstance,
        userId,
        playlistId
      )
    })
  })
})
