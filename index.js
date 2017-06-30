const { getAuthorizedInstance } = require('./authFlow')
const { getPlaylistTracks, replaceTracksInPlaylist } = require('./spotifyApi')
const { compose, reverse, take, map } = require('ramda')
const { withoutLocals } = require('./filters/tracks')
const { trackUri } = require('./selectors/track')

const selectTracks = compose(map(trackUri), take(20), reverse, withoutLocals)

const inputPlaylist = { id: '53FcvvR0FF2bdqQ0Mv0CER', userId: 'bramschulting' }
const outputPlaylist = { id: '7a81cTH5K8MUF6geWYZahA', userId: 'bramschulting' }

getAuthorizedInstance().then(apiInstance => {
  console.log('Successfully authenticated')

  return getPlaylistTracks(apiInstance, inputPlaylist.userId, inputPlaylist.id)
    .then(selectTracks)
    .then(trackIds =>
      replaceTracksInPlaylist(
        apiInstance,
        outputPlaylist.userId,
        outputPlaylist.id,
        trackIds
      )
    )
    .then(() => {
      console.log('Playlist updated!')
    })
    .catch(err => {
      console.log(err)
    })
})
