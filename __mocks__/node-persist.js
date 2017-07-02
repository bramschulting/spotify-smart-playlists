const nodePersistMock = {
  init: jest.fn(() => Promise.resolve(nodePersistMock)),
  getItem: jest.fn(() => Promise.resolve()),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve())
}

module.exports = nodePersistMock
