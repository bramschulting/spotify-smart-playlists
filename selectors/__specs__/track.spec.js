const { trackUri } = require('../track')

describe('track selector', () => {
  describe('trackUri', () => {
    it('selects the uri of a track', () => {
      const uri = 'some uri'
      const track = {
        track: {
          uri
        }
      }

      expect(trackUri(track)).toEqual(uri)
    })
  })
})
