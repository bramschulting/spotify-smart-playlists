const { reject } = require('ramda')
const { isLocal } = require('../selectors/track')

exports.withoutLocals = reject(isLocal)
