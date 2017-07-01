const { getAuthorizedInstance } = require('../helpers/authFlow')
const {
  getPlaylistTracks,
  replaceTracksInPlaylist
} = require('../helpers/spotifyApi')
const { map } = require('ramda')
const { trackUri } = require('../selectors/track')

class SmartPlaylistGenerator {
  constructor (options = {}) {
    // TODO: Validate options

    this.options = options
    this.playlistGenerators = []
  }

  addPlaylist (inputPlaylist, outputPlaylist, generator) {
    this.playlistGenerators.push({
      inputPlaylist,
      outputPlaylist,
      generator
    })
  }

  generatePlaylists () {
    // Get an authorized api instance so we can get and mutate playlist
    return getAuthorizedInstance(this.options).then(apiInstance => {
      console.log('Successfully authenticated')

      // Generate each playlist
      const generatorPromises = this.playlistGenerators.map(playlistGenerator =>
        getPlaylistTracks(
          apiInstance,
          playlistGenerator.inputPlaylist.userId,
          playlistGenerator.inputPlaylist.id
        )
          .then(playlistGenerator.generator)
          .then(map(trackUri))
          .then(trackUris =>
            replaceTracksInPlaylist(
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

module.exports = SmartPlaylistGenerator
