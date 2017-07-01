const { compose, prop } = require('ramda')

exports.trackUri = compose(prop('uri'), prop('track'))
