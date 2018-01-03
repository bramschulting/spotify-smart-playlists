# Spotify Smart Playlist Generator

This package can be used to generate smart playlists for Spotify. It's inspired by the smart playlist feature you can find in iTunes.

## Installation

This package is available at npmjs.com, so you can install it using `npm`, `yarn`, or other package managers that support npmjs.com.

```shell
$ yarn add spotify-smart-playlists
```

## Example

```javascript
const { SmartPlaylistsGenerator, PlaylistLoader } = require('spotify-smart-playlists')
const { compose, reverse, take, flatten } = require('ramda')

// Initiate a new SmartPlaylistsGenerator instance. Please take a look at
// Spotify's documentation to learn how to get the required params:
// https://developer.spotify.com/
const smartPlaylists = new SmartPlaylistsGenerator({
  clientId: 'your client id',
  clientSecret: 'your client secret',
  refreshToken: 'your refresh token'
})

// In this example we take one playlist as input, reverse the order, and take the
// first 20 tracks (which are actually the 20 last tracks, since the order is
// reversed)
const loader = new PlaylistLoader('bramschulting', '4tWeRdIYH4ZPo5vvJIPJFm')
const outputPlaylist = { id: '7a81cTH5K8MUF6geWYZahA', userId: 'bramschulting' }
const generator = compose(take(20), reverse, flatten)

// Add the playlist generator to our instance
smartPlaylists.addPlaylist([loader], outputPlaylist, generator)

// Run your playlist generator(s)
smartPlaylists.generatePlaylists()
```

## Future plans

At the moment, this smart playlist generator isn't really that smart. I'd like to create some prebuilt 'ingredients' you can use when generating your playlists (for example something to filter out some tracks). Right now, almost anything is possible, but you have to write the code yourself.

Something that is not really possible at the moment, is merging several playlists. One of the first things I'm planning on working on is support for multiple input playlists.
