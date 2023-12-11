import express from 'express';
import path from 'path';
import config from './config.js';

const app = express()

app.use(express.static(path.join(config.get('vaultPath'), '/public')))

app.listen(2357, () => {
  console.log('Server is running on port 2357.')
})

export default app
