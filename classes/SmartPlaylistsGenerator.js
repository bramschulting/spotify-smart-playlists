const authorizedInstanceHelper = require('../helpers/authorizedInstance')
const spotifyApiHelper = require('../helpers/spotifyApi')
const { map } = require('ramda')
const { trackUri } = require('../selectors/track')

class SmartPlaylistsGenerator {
  constructor (options) {
    // TODO: Validate options

    this.options = options
    this.playlistGenerators = []
  }

  addPlaylist (inputPlaylist, outputPlaylist, generator) {
    // TODO: Validate input

    this.playlistGenerators.push({
      inputPlaylist,
      outputPlaylist,
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
            spotifyApiHelper
              .getPlaylistTracks(
                apiInstance,
                playlistGenerator.inputPlaylist.userId,
                playlistGenerator.inputPlaylist.id
              )
              .then(playlistGenerator.generator)
              .then(map(trackUri))
              .then(trackUris =>
                spotifyApiHelper.replaceTracksInPlaylist(
                  apiInstance,
                  playlistGenerator.outputPlaylist.userId,
                  playlistGenerator.outputPlaylist.id,
                  trackUris
                )
              )
        )

        return Promise.all(generatorPromises)
      })
  }
}

module.exports = SmartPlaylistsGenerator
