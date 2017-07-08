const spotifyApiHelper = require('../helpers/spotifyApi')
const refreshTokenManager = require('../managers/refreshToken')
const authFlow = require('./authFlow')

function getAuthorizedInstance (options = {}) {
  const apiInstance = spotifyApiHelper.getInstance(options)

  return refreshTokenManager.getRefreshToken().then(refreshToken => {
    if (refreshToken) {
      return spotifyApiHelper
        .authorizeWithRefreshToken(apiInstance, refreshToken)
        .then(() => apiInstance)
        .catch(() => {
          // If loggin in with the refresh token fails, start the manual auth flow
          return refreshTokenManager
            .removeRefreshToken()
            .then(() => authFlow.authorizeViaAuthFlow(apiInstance))
            .then(() => apiInstance)
        })
    }

    return authFlow.authorizeViaAuthFlow(apiInstance).then(() => apiInstance)
  })
}

exports.getAuthorizedInstance = getAuthorizedInstance
