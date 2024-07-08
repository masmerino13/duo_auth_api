require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@duosecurity/duo_universal');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const duoClientConfig = {
  clientId: process.env.DUO_CLIENT_ID,
  clientSecret: process.env.DUO_CLIENT_SECRET,
};

app.post('/duo-auth-url', async (req, res) => {
  const {
    username,
    settings,
  } = req.body;
  const redirectUrl = settings.duo_redirect_url;

  try {
    const duoClient = new Client({
      ...duoClientConfig,
      redirectUrl,
      apiHost: settings.duo_api_hostname
    });

    await duoClient.healthCheck();

    const state = duoClient.generateState();

    const url = duoClient.createAuthUrl(username, state);

    res.send({
      duoURL: url
    })
  } catch (err) {
    console.error(err);
    res.status(501).send({
      duoURL: null
    })
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
