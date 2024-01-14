const axios = require('axios');

const apiUrl = 'http://localhost:3001/webhook/process';

const webhookDataArray = [
  { webhook: 'NOTIFICATION', sourceUrl: 'sourceUrl1' },
  { webhook: 'LOGGING', sourceUrl: 'sourceUrl2' },
  { webhook: 'SAVE_DATA', sourceUrl: 'sourceUrl2' },
  { webhook: 'ANALYSIS', sourceUrl: 'sourceUrl2' },
];

const generateRandomData = () => {
  return { key1: Math.random(), key2: Math.random() };
};

const makePostRequest = async () => {
  const randomIndex = Math.floor(Math.random() * webhookDataArray.length);
  const { webhook, sourceUrl } = webhookDataArray[randomIndex];
  const payload = {
    webhookName: webhook,
    sourceUrl: sourceUrl,
    data: generateRandomData(),
  };

  try {
    await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'whs-secret-key':
          'cf703ec5e1edd73d6c0e4113cdd18f9e7ee7d0c6c5a8dbf2e5ca65b3eb188f18e5449f0919577054e7c0448801e462e6adec394b728aeaa92c088a090d4dee03',
      },
    });
  } catch (error) {
    console.log(error);
  }
};

setInterval(makePostRequest, 1000);
