const express = require('express')
const http = require('http')
const { getInstance, authorizeInstance } = require('./spotifyApi')

function getAuthorizedInstance () {
  // TODO - Check for refresh token and try to auth if exists

  return new Promise((resolve, reject) => {
    const app = express()
    const server = http.createServer(app)
    const apiInstance = getInstance()
    const state = String(Math.random())
    const scopes = ['playlist-modify-public', 'playlist-modify-private']

    app.get('/auth', (req, res) => {
      res.redirect(apiInstance.createAuthorizeURL(scopes, state))
    })

    app.get('/auth_callback', (req, res) => {
      if (req.query.state !== state) {
        return reject(new Error('state mismatch'))
      }

      authorizeInstance(apiInstance, req.query.code)
        .then(() => {
          res.send('Successfully authenticated! You can close this page.').end()

          // Close the auth server
          server.close()

          // TODO - Store refresh token

          resolve(apiInstance)
        })
        .catch(reject)
    })

    server.listen(8080, (err) => {
      if (err) {
        return reject(err)
      }

      console.log('Please go to http://localhost:8080/auth to authenticate with your Spotify account')
    })
  })
}

exports.getAuthorizedInstance = getAuthorizedInstance
