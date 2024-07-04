const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 3000;
const index = 'index.html';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const recaptchaMiddleware = async (req, res, next) => {
  try {
    console.log("llega aqui ")
    const recaptchaToken = req.body.recaptchaToken;
    const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;

    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    });

    const data = await verifyResponse.json();

    if (!data.success || data.score < 0.5) {

      return res.status(403).json({ success: false, error: 'El reCAPTCHA no es válido.' });
    }
    next();
  } catch (error) {
    console.error('Error al verificar el reCAPTCHA:', error.message);
    res.status(500).json({ success: false, error: 'Error al verificar el reCAPTCHA.' });
  }
};

app.post('/verificar', recaptchaMiddleware, (req, res) => {

  res.send('¡reCAPTCHA verificado correctamente!');
});

app.get('*', (req, res) => res.sendFile(index, { root: __dirname }));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
