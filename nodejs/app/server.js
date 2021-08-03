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

  const data = [
    { op: 'replace', path: '/spec/source/repoURL', value: 'https://github.com/replaced/argocd-git-override.git' },
    { op: 'replace', path: '/spec/source/targetRevision', value: 'replaced' }
  ]
  const dataAsString = JSON.stringify(data)
  const buff = Buffer.from(dataAsString.toString(), 'utf8')
  const patch = buff.toString('base64')
  res.send({
    apiVersion: 'admission.k8s.io/v1',
    kind: 'AdmissionReview',
    response: {
      uid: uid,
      allowed: allowed,
      patchType: 'JSONPatch',
      patch: patch,
      status: {
        code: code,
        message: message
      }
    }
  })
})

const server = https.createServer(options, app)

server.listen(port, () => {
  console.log(`whitelist-regsitry controller running on port ${port}/`)
})
