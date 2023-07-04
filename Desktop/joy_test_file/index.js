const { writeFile } = require('fs');
const { join } = require('path');
const request = require('request');
const mergeImg = require('merge-img');
const argv = require('minimist')(process.argv.slice(2));

const {
  greeting = 'Hello', who = 'You',
  width = 400, height = 500, color = 'Pink', size = 100,
} = argv;

const getUrl = (text) => `https://cataas.com/cat/says/${encodeURIComponent(text)}?width=${width}&height=${height}&color=${color}&s=${size}`;

const getOptions = (text) => ({
  url: getUrl(text),
  encoding: 'binary'
});

const mergeAndSaveImages = (firstBody, secondBody) => {
  mergeImg([
    { src: Buffer.from(firstBody, 'binary'), x: 0, y: 0 },
    { src: Buffer.from(secondBody, 'binary'), x: width, y: 0 }
  ]).then((img) => {
    img.getBuffer('image/jpeg', (err, buffer) => {
      if (err) {
        console.log(err);
        return;
      }

      const fileOut = join(process.cwd(), '/cat-card.jpg');
      writeFile(fileOut, buffer, 'binary', (err) => {
        if (err) {
          console.log(err);
          return;
        }
        
        console.log('The file was saved!');
      });
    });
  });
};

const makeRequest = (reqOptions, callback) => {
  request.get(reqOptions, (err, res, body) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Received response with status: ${res.statusCode}`);
    callback(body);
  });
};

const firstReq = getOptions(greeting);
const secondReq = getOptions(who);

makeRequest(firstReq, (firstBody) => {
  makeRequest(secondReq, (secondBody) => {
    mergeAndSaveImages(firstBody, secondBody);
  });
});
