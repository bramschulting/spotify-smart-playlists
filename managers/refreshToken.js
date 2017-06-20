const storage = require('node-persist')

function getStorage () {
  const storageOptions = {
    dir: './user_data'
  }

  return storage.init(storageOptions)
    .then(() => storage)
}

exports.getRefreshToken = function getRefreshToken () {
  return getStorage()
    .then(storage => storage.getItem('refreshToken'))
}

exports.setRefreshToken = function setRefreshToken (refreshToken) {
  return getStorage()
    .then(storage => storage.setItem('refreshToken', refreshToken))
}
