'use strict'

const http = require('http')
const https = require('https')
const LE = require('greenlock').LE
const leChallengeFs = require('le-challenge-fs')
const leAcmeCore = require('le-acme-core')
const leStoreBot = require('le-store-certbot')

const DEFAULT_LE_ROOT = '~/letsencrypt'
const DEFAULT_HTTP_REDIRECT_PORT = 80
const DEFAULT_HTTPS_PORT = 443
const DEFAULT_API_END_POINT = 'https://acme-v01.api.letsencrypt.org/directory'

// This function starts a TLS webserver on HTTPS_PORT, with on-the-fly LetsEncrypt cert registration.
// It also starts a redirect server on HTTP_REDIRECT_PORT, which GreenLock uses for the ACME challenge.
// Certificates and temporary files are stored in LE_ROOT
module.exports = function getLetsEncryptServers (options) {
  let leRoot = DEFAULT_LE_ROOT;
  let httpRedirectPort = DEFAULT_HTTP_REDIRECT_PORT;
  let httpsPort = DEFAULT_HTTPS_PORT;
  let server = 'staging';
  let domain = 'localhost';
  let handler = (req, res) => {
    res.end("getLetsEncryptServers is working! Now please specify your own handler.")
  }
  if (typeof options === 'object') {
    if (typeof options.domain === 'string') {
      domain = options.domain;
    }
    if (typeof options.domain === 'function') {
      handler = options.handler;
    }
    if (typeof options.leRoot === 'string') {
      leRoot = options.leRoot;
    }
    if (typeof options.httpRedirectPort === 'number') {
      httpRedirectPort = options.httpRedirectPort;
    }
    if (typeof options.httpsPort === 'number') {
      httpsPort = options.httpsPort;
    }
    if ((typeof options.live === 'boolean') && (options.live === true)) {
      let apiEndPoint = DEFAULT_API_END_POINT;
      if (typeof options.apiEndPoint === 'string') {
        apiEndPoint = options.apiEndPoint;
      }
      server = apiEndPoint;
    }
  }

  let httpServer
  const le = LE.create({
    server,
    acme: leAcmeCore.ACME.create(),
    store: leStoreBot.create({ configDir: leRoot + '/etc', webrootPath: leRoot + '/var/:hostname' }),
    challenges: { 'http-01': leChallengeFs.create({ webrootPath: leRoot + '/var/:hostname' }) },
    agreeToTerms: function (tosUrl, cb) { cb(null, tosUrl) },
    debug: true
  })
  return new Promise((resolve, reject) => {
    httpServer = http.createServer(le.middleware())
    httpServer.listen(httpRedirectPort, (err) => {
      if (err) { reject(err) } else { resolve() }
    })
  }).then(() => {
    return le.core.certificates.getAsync({
      email: `letsencrypt+${domain}@gmail.com`,
      domains: [ domain ]
    })
  }).then(function (certs) {
    if (!certs) {
      throw new Error('Should have acquired certificate for domains.')
    }
    return new Promise((resolve, reject) => {
      const httpsServer = https.createServer({
        key: certs.privkey,
        cert: certs.cert,
        ca: certs.chain
      }, options.handler)
      httpsServer.listen(httpsPort, (err) => {
        if (err) { reject(err) } else { resolve([ httpsServer, httpServer ]) }
      })
    })
  })
}
