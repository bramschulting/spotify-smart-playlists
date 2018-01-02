const SmartPlaylistsGenerator = require('../SmartPlaylistsGenerator')
const authorizedInstanceHelper = require('../../helpers/authorizedInstance')
const spotifyApiHelper = require('../../helpers/spotifyApi')

jest.mock('../../helpers/authorizedInstance')
jest.mock('../../helpers/spotifyApi')

describe('SmartPlaylistsGenerator', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('contructor', () => {
    it('should store the passed options', () => {
      const options = { foo: 'bar' }

      const generator = new SmartPlaylistsGenerator(options)

      expect(generator.options).toEqual(options)
    })
  })

  describe('addPlaylist', () => {
    it('should store a playlist generator', () => {
      const loader = 'some loader'
      const outputPlaylist = 'some output playlist'
      const generatorFunction = 'some generator function'

      const generator = new SmartPlaylistsGenerator()
      generator.addPlaylist(loader, outputPlaylist, generatorFunction)

      expect(generator.playlistGenerators).toHaveLength(1)
      expect(generator.playlistGenerators[0].loader).toEqual(loader)
      expect(generator.playlistGenerators[0].outputPlaylist).toEqual(
        outputPlaylist
      )
      expect(generator.playlistGenerators[0].generator).toEqual(
        generatorFunction
      )
    })
  })

  describe('generatePlaylists', () => {
    it('should get an authorized instance using the construtor options', () => {
      authorizedInstanceHelper.getAuthorizedInstance = jest.fn(() =>
        Promise.reject(new Error())
      )

      const options = { foo: 'bar' }
      const generator = new SmartPlaylistsGenerator(options)

      return generator.generatePlaylists().catch(() => {
        expect(
          authorizedInstanceHelper.getAuthorizedInstance
        ).toHaveBeenCalledTimes(1)
        expect(authorizedInstanceHelper.getAuthorizedInstance).toBeCalledWith(
          options
        )
      })
    })
  })

  it('should get the input tracks for each playlist', () => {
    // Arrange
    const apiInstance = 'apiInstance'
    authorizedInstanceHelper.getAuthorizedInstance = () =>
      Promise.resolve(apiInstance)

    const generator = new SmartPlaylistsGenerator()
    const loader = {
      getTracks: jest.fn(() => Promise.reject(new Error()))
    }
    const outputPlaylist = 'some output playlist'
    const generatorFunction = 'some generator function'

    generator.addPlaylist(loader, outputPlaylist, generatorFunction)

    // Act
    return generator.generatePlaylists().catch(() => {
      // Assert
      expect(loader.getTracks).toHaveBeenCalledTimes(1)
      expect(loader.getTracks).toHaveBeenCalledWith(apiInstance)
    })
  })

  it('should call the generate function for each playlist', () => {
    // Arrange
    const apiInstance = 'apiInstance'
    const inputPlaylistTracks = [{ track: { uri: 'track-uid' } }]
    authorizedInstanceHelper.getAuthorizedInstance = () =>
      Promise.resolve(apiInstance)
    spotifyApiHelper.replaceTracksInPlaylist = () => Promise.reject(new Error())

    const generator = new SmartPlaylistsGenerator()
    const loader = {
      getTracks: () => Promise.resolve(inputPlaylistTracks)
    }
    const outputPlaylist = 'some output playlist'
    const generatorFunction = jest.fn()

    generator.addPlaylist(loader, outputPlaylist, generatorFunction)

    // Act
    return generator.generatePlaylists().catch(() => {
      // Assert
      expect(generatorFunction).toHaveBeenCalledTimes(1)
      expect(generatorFunction).toHaveBeenCalledWith(inputPlaylistTracks)
    })
  })

  it('should save the output playlist', () => {
    // Arrange
    const apiInstance = 'apiInstance'
    const inputPlaylistTracks = [{ track: { uri: 'track-uid' } }]
    authorizedInstanceHelper.getAuthorizedInstance = () =>
      Promise.resolve(apiInstance)
    spotifyApiHelper.replaceTracksInPlaylist = jest.fn(() => Promise.resolve())

    const generator = new SmartPlaylistsGenerator()
    const loader = {
      getTracks: () => Promise.resolve(inputPlaylistTracks)
    }
    const outputPlaylist = {
      userId: 'output-userId',
      id: 'output-id'
    }
    const generatorFunction = jest.fn(inputTracks => inputTracks)

    generator.addPlaylist(loader, outputPlaylist, generatorFunction)

    // Act
    return generator.generatePlaylists().then(() => {
      // Assert
      expect(spotifyApiHelper.replaceTracksInPlaylist).toHaveBeenCalledTimes(1)
      expect(spotifyApiHelper.replaceTracksInPlaylist).toHaveBeenCalledWith(
        apiInstance,
        outputPlaylist.userId,
        outputPlaylist.id,
        ['track-uid']
      )
    })
  })
})
