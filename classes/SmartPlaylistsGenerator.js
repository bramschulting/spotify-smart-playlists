const authorizedInstanceHelper = require('../helpers/authorizedInstance')
const spotifyApiHelper = require('../helpers/spotifyApi')
const { map } = require('ramda')
const { trackUri } = require('../selectors/track')

function loadLoaders (apiInstance, loaders) {
  return Promise.all(loaders.map(loader => loader.getTracks(apiInstance)))
}

class SmartPlaylistsGenerator {
  constructor (options) {
    // TODO: Validate options

    this.options = options
    this.playlistGenerators = []
  }

  addPlaylist (loaders, outputPlaylistId, generator) {
    // TODO: Validate input

    this.playlistGenerators.push({
      loaders,
      outputPlaylistId,
      generator
    })
  }

  generatePlaylists () {
    // Get an authorized api instance so we can get and mutate playlist
    return authorizedInstanceHelper
      .getAuthorizedInstance(this.options)
      .then(apiInstance => {
        console.log('Successfully authenticated')

        // Generate each playlist
        const generatorPromises = this.playlistGenerators.map(
          playlistGenerator =>
            loadLoaders(apiInstance, playlistGenerator.loaders)
              .then(playlistGenerator.generator)
              .then(map(trackUri))
              .then(trackUris =>
                spotifyApiHelper.replaceTracksInPlaylist(
                  apiInstance,
                  playlistGenerator.outputPlaylistId,
                  trackUris
                )
              )
        )

        return Promise.all(generatorPromises)
      })
  }
}

module.exports = SmartPlaylistsGenerator
