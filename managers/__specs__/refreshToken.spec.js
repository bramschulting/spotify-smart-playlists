const {
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken
} = require('../refreshToken')
const storage = require('node-persist')

jest.mock('node-persist')

describe('refreshToken manager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getRefreshToken', () => {
    it('should init the storage', () => {
      const expectedOptions = {
        dir: './user_data'
      }

      return getRefreshToken().then(() => {
        expect(storage.init).toHaveBeenCalledTimes(1)
        expect(storage.init).toHaveBeenCalledWith(expectedOptions)
      })
    })

    it('should get the refreshToken from storage', () => {
      return getRefreshToken().then(() => {
        expect(storage.getItem).toHaveBeenCalledTimes(1)
        expect(storage.getItem).toHaveBeenCalledWith('refreshToken')
      })
    })
  })

  describe('setRefreshToken', () => {
    it('should init the storage', () => {
      const refreshToken = 'some refresh token'
      const expectedOptions = {
        dir: './user_data'
      }

      return setRefreshToken(refreshToken).then(() => {
        expect(storage.init).toHaveBeenCalledTimes(1)
        expect(storage.init).toHaveBeenCalledWith(expectedOptions)
      })
    })

    it('should set the refreshToken in storage', () => {
      const refreshToken = 'some refresh token'

      return setRefreshToken(refreshToken).then(() => {
        expect(storage.setItem).toHaveBeenCalledTimes(1)
        expect(storage.setItem).toHaveBeenCalledWith(
          'refreshToken',
          refreshToken
        )
      })
    })
  })

  describe('removeRefreshToken', () => {
    it('should init the storage', () => {
      const expectedOptions = {
        dir: './user_data'
      }

      return removeRefreshToken().then(() => {
        expect(storage.init).toHaveBeenCalledTimes(1)
        expect(storage.init).toHaveBeenCalledWith(expectedOptions)
      })
    })

    it('should get the refreshToken from storage', () => {
      return removeRefreshToken().then(() => {
        expect(storage.removeItem).toHaveBeenCalledTimes(1)
        expect(storage.removeItem).toHaveBeenCalledWith('refreshToken')
      })
    })
  })
})
