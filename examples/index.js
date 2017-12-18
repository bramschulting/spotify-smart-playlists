const SmartPlaylistsGenerator = require('../index')
const config = require('config')

// Create a new SmartPlaylistsGenerator instance..
const options = {
  clientId: config.get('clientId'),
  clientSecret: config.get('clientSecret'),
  refreshToken: config.get('refreshToken')
}
const generator = new SmartPlaylistsGenerator(options)

// ..add the playlist(s)..
const simpleExample = require('./example-simple')
generator.addPlaylist(
  simpleExample.inputPlaylist,
  simpleExample.outputPlaylist,
  simpleExample.generator
)

// ..generate them!
generator.generatePlaylists().then(() => {
  console.log('All done!')
})
