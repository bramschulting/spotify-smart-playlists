const authorizedInstanceHelper = require('../authorizedInstance')
const authFlowHelper = require('../authFlow')
const spotifyApiHelper = require('../spotifyApi')
const refreshTokenManager = require('../../managers/refreshToken')

jest.mock('../spotifyApi')
jest.mock('../authFlow')
jest.mock('../../managers/refreshToken')

describe('authFlow helper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should get a new api instances based on the passed options', () => {
    const options = { foo: 'bar' }
    refreshTokenManager.getRefreshToken = jest.fn(() =>
      Promise.reject(new Error())
    )

    return authorizedInstanceHelper.getAuthorizedInstance(options).catch(() => {
      expect(spotifyApiHelper.getInstance).toHaveBeenCalledTimes(1)
      expect(spotifyApiHelper.getInstance).toHaveBeenCalledWith(options)
    })
  })

  describe('with spotify auth flow', () => {
    beforeEach(() => {
      refreshTokenManager.getRefreshToken = jest.fn(() => Promise.resolve(null))
    })

    it('should start the spotify auth flow if there is no refresh token', () => {
      spotifyApiHelper.authorizeViaAuthFlow = jest.fn(() =>
        Promise.reject(new Error())
      )

      return authorizedInstanceHelper.getAuthorizedInstance().catch(() => {
        expect(authFlowHelper.authorizeViaAuthFlow).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('with stored refreshToken', () => {
    const options = {}
    const refreshToken = 'some refreshToken'
    beforeEach(() => {
      refreshTokenManager.getRefreshToken = jest.fn(() =>
        Promise.resolve(refreshToken)
      )
    })

    it('should try to authorize with the refresh token', () => {
      spotifyApiHelper.authorizeWithRefreshToken = jest.fn(() =>
        Promise.reject(new Error())
      )

      return authorizedInstanceHelper
        .getAuthorizedInstance(options)
        .catch(() => {
          expect(
            spotifyApiHelper.authorizeWithRefreshToken
          ).toHaveBeenCalledTimes(1)
          expect(
            spotifyApiHelper.authorizeWithRefreshToken
          ).toHaveBeenCalledWith(
            spotifyApiHelper.getInstance(options),
            refreshToken
          )
        })
    })

    it('should return an authorized apiInstance if all goes well', () => {
      spotifyApiHelper.authorizeWithRefreshToken = jest.fn(() =>
        Promise.resolve()
      )

      return authorizedInstanceHelper
        .getAuthorizedInstance(options)
        .then(resolvedInstance => {
          expect(resolvedInstance).toEqual(
            spotifyApiHelper.getInstance(options)
          )
        })
    })

    it('should start the spotify auth flow if authorizing with a refresh token fails', () => {
      spotifyApiHelper.authorizeWithRefreshToken = jest.fn(() =>
        Promise.reject(new Error())
      )

      return authorizedInstanceHelper
        .getAuthorizedInstance(options)
        .then(() => {
          expect(authFlowHelper.authorizeViaAuthFlow).toHaveBeenCalledTimes(1)
        })
    })
  })
})
