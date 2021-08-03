const express = require('express')
const https = require('https')
const fs = require('fs')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
const port = 8443

const options = {
  cert: fs.readFileSync('/certs/tls.crt'),
  key: fs.readFileSync('/certs/tls.key')
}

app.post('/', (req, res) => {
  if (req.body.request === undefined || req.body.request.uid === undefined) {
    res.status(400).send()
    return
  }

  const allowed = true
  const code = 200
  const message = ''
  const uid = req.body.request.uid
  const object = req.body.request.object
  console.log(JSON.stringify(object.spec, null, 2)) // debug
  const overrideMap = JSON.parse(fs.readFileSync('/config/map.json'))

  const toPatch = []
  for (const gitRepo of overrideMap) {
    if (gitRepo.upstreamRepoURL === object.spec.source.repoURL) {
      // we have a match for replace
      toPatch.push({ op: 'replace', path: '/spec/source/repoURL', value: gitRepo.originRepoUrL })
      if (gitRepo.originBranch) {
        toPatch.push({ op: 'replace', path: '/spec/source/targetRevision', value: gitRepo.originBranch })
      }
      break
    }
  }
  const review = {
    apiVersion: 'admission.k8s.io/v1',
    kind: 'AdmissionReview',
    response: {
      uid: uid,
      allowed: allowed,
      status: {
        code: code,
        message: message
      }
    }
  }
  if (toPatch.length > 0) {
    const dataAsString = JSON.stringify(toPatch)
    const buff = Buffer.from(dataAsString.toString(), 'utf8')
    const patch = buff.toString('base64')
    review.response.patchType = 'JSONPatch'
    review.response.patch = patch
  }
  console.log('response', JSON.stringify(review, null, 2))
  res.send(review)
})

const server = https.createServer(options, app)

server.listen(port, () => {
  console.log(`whitelist-regsitry controller running on port ${port}/`)
})
