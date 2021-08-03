const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const port = 8443;

const options = {
  cert: fs.readFileSync('/certs/tls.crt'),
  key: fs.readFileSync('/certs/tls.key'),
};

app.post('/', (req, res) => {
  if (req.body.request === undefined || req.body.request.uid === undefined) {
    res.status(400).send();
    return;
  }
  console.log(req.body); //debug
  var allowed = true;
  var code = 200;
  var message = "";
  const uid = req.body.request.uid;
  const object = req.body.request.object;

  const allowlisted_registries_env = process.env.ALLOW_LISTED_REGISTRIES;
  const allowlisted_registries = allowlisted_registries_env.split(',');
  for (var container of object.spec.containers) {
      var allowlisted = false;
      for (var reg of allowlisted_registries) {
        if (container.image.startsWith(reg + '/')) {
            allowlisted = true;
        }
      }
      if (!allowlisted) {
          allowed = false;
          code = 403;
          message = `${container.name} image comes from an untrusted registry! (${container.image}). Only images from ${allowlisted_registries_env} are allowed.`;
          break;
      }
  }
  res.send({
        apiVersion: 'admission.k8s.io/v1',
        kind: 'AdmissionReview',
        response: {
            uid: uid,
            allowed: allowed,
            status: {
                code: code,
                message: message,
            },
        },
    });
});

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`allowlist-regsitry controller running on port ${port}/`);
});