const { compose, prop } = require('ramda')

exports.isLocal = prop('is_local')

exports.trackUri = compose(prop('uri'), prop('track'))
