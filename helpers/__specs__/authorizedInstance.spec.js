const authorizedInstanceHelper = require('../authorizedInstance')
const spotifyApiHelper = require('../spotifyApi')

jest.mock('../spotifyApi')

describe('authFlow helper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get a new api instances based on the passed options', () => {
    const options = { foo: 'bar' }
    spotifyApiHelper.authorizeWithRefreshToken = jest.fn(() =>
      Promise.reject(new Error())
    )

    return authorizedInstanceHelper.getAuthorizedInstance(options).catch(() => {
      expect(spotifyApiHelper.getInstance).toHaveBeenCalledTimes(1)
      expect(spotifyApiHelper.getInstance).toHaveBeenCalledWith(options)
    })
  })

  it('should return a new api instance if the authorization is successful', () => {
    const refreshToken = 'some-refresh-token'
    const options = { refreshToken }

    spotifyApiHelper.getInstance = jest.fn(() => 'apiInstance')

    spotifyApiHelper.authorizeWithRefreshToken = jest.fn(() =>
      Promise.resolve()
    )

    return authorizedInstanceHelper
      .getAuthorizedInstance(options)
      .then(apiInstance => {
        expect(spotifyApiHelper.authorizeWithRefreshToken).toHaveBeenCalledWith(
          apiInstance,
          refreshToken
        )
      })
  })
})
