
const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const assert = require('assert');

const { MongoClient } = require('mongodb'); 
const random = require('randomstring');
const MongoErrors = require('mongo-errors');



const env = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost/shorten',
  EXPIRE_SECONDS: Number.parseInt(process.env.EXPIRE_SECONDS || '3600'), // 1 hour by default,
  PREFIX: process.env.PREFIX || '',
  PORT: process.env.PORT || '3000',
  CODE_SIZE: Number.parseInt(process.env.CODE_SIZE || '5')
};

const generateOptions = {
  length: env.CODE_SIZE,
  charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
};
function generate() {
  return random.generate(generateOptions);
}
 

(async () => {
  const db = await MongoClient.connect(env.MONGODB_URI);
  const urls = await db.collection('urls');
  await urls.createIndex({ updatedAt: 1 }, { expireAfterSeconds: env.EXPIRE_SECONDS });
  await urls.createIndex({ longUrl: 1 });

  http.createServer(function (request, response) {

    var filePath = '.' + request.url;
    if (filePath == './' && request.method == 'GET') {
        filePath = './views/index.html';

    } 

    if (request.url == '/endpoint' && request.method == 'POST') {
      console.log("RESPONSE", response._headerSent);
      

       // Parse Data from Form
        var body = '';
        request.on('data', function (data) {
          body += data;
          if (body.length > 1e6) request.connection.destroy(); // too much post data, kill the connection
        });

        request.on('end', async function () {

        

          console.log("Body: ", JSON.parse(body).url);
          var longUrl = JSON.parse(body).url;
          console.log('Long URL: ', longUrl);  // Ex: http://localhost:3000/123  - longURL
          
            // db.collection('urls').find({'longUrl': longUrl}).toArray(function(err, docs) {
            //   assert.equal(err, null);
            //   if(!docs) throw err;
            //   if (docs.length > 0) {
            //     console.log(docs);
            //   } else {
            //     // (\$/.*?/)[^/]*?\.\S*
            //     var stringPath = longUrl.split('/');
            //     stringPath = stringPath.slice(3, stringPath.length).join('/');

                

            //     console.log('generate', value);
            //     // db.collection('urls').insertMany([
            //     //   { _id : generate() }, {shortUrl : stringPath}, { longUrl }
            //     // ], function(err, result) {
            //     //   console.log("Inserted 3 documents into the collection");
            //     // });
            //   }
            // });

            const { value } = await db.collection('urls').findOneAndUpdate(
                  { longUrl },
                  {
                    $setOnInsert: { longUrl, _id: generate() },
                    $set: { updatedAt: new Date() },
                  },
                  { upsert: true, returnOriginal: false }
            );
            console.log('generate', value);

            var data =  {
                shortUrl: value._id, 
                longUrl: value.longUrl
            };
            console.log("JSON", data);

            response.setHeader('content-type', 'application/json');
            response.end(data);
            
            //response.setHeader('content-type', 'application/json');
            //response.end(JSON.stringify(data));
 
        });
         
    }

    var extname = String(path.extname(filePath)).toLowerCase();
    var contentType = 'text/html';
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    //response.writeHead(200, { 'Content-Type': contentType });
                    response.setHeader('Content-Type', contentType);
                    response.end(content, 'utf-8');
                });
            }
            else {
                //response.writeHead(500);
                response.end('Sorry, check the error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            //response.writeHead(200, { 'Content-Type': contentType });
            response.setHeader('Content-Type', contentType);
            response.end(content, 'utf-8');
        }
    });

  }).listen(env.PORT, () => console.log(`Listening on port ${env.PORT}`));
 




  
})(); // async ends
