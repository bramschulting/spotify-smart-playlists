const { compose, reverse, take } = require('ramda')

// Example playlist
const inputPlaylist = { id: '4tWeRdIYH4ZPo5vvJIPJFm', userId: 'bramschulting' }
const outputPlaylist = { id: '7a81cTH5K8MUF6geWYZahA', userId: 'bramschulting' }

// This should be read from right-to-left/bottom-to-top
const generator = compose(
  // 3. Take the first 20 tracks
  take(20),
  // 2. Reverse all tracks
  reverse
)

module.exports = {
  inputPlaylist,
  outputPlaylist,
  generator
}
