const spotifyApiHelper = require('../helpers/spotifyApi')

function getAuthorizedInstance (options) {
  const apiInstance = spotifyApiHelper.getInstance(options)

  return spotifyApiHelper
    .authorizeWithRefreshToken(apiInstance, options.refreshToken)
    .then(() => apiInstance)
}

exports.getAuthorizedInstance = getAuthorizedInstance
