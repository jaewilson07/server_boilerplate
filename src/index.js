//https://www.robinwieruch.de/minimal-node-js-babel-setup#nodejs-with-babel
// https://www.robinwieruch.de/node-js-express-tutorial

import 'dotenv/config';
import express from 'express';

import { BACKUP_PORT } from './constants';

const app = express();
const NEW_PORT = process.env.PORT ?? BACKUP_PORT;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(NEW_PORT, () =>
  console.log(`Example app listening on port ${NEW_PORT}!`)
);
