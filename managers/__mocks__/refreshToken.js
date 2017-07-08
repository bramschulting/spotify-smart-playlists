const refreshTokenManager = {
  getRefreshToken: jest.fn(() => Promise.resolve()),
  setRefreshToken: jest.fn(() => Promise.resolve()),
  removeRefreshToken: jest.fn(() => Promise.resolve())
}

module.exports = refreshTokenManager
