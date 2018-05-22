# Http Cache To Mongo

## Introduction

The **http-cache-to-mongo** module allows you to store an http response into mongodb. This can be useful for reducing requests to an external http api / web service. 

The first time you make a call to a web service, **http-cache-to-mongo** will first check if that data already exists in your mongo database based on its url.

If the data for that url does not exist in your mongo database, **http-cache-to-mongo** will store that data in mongo db before returning you that data.

If the data for that url exists in your mongo database, **http-cache-to-mongo** returns that data, and never makes a request to that url ever again, saving your request counts against your web service api quota.

## Example
Below is an example how you would use it. If the webservice doesn't require an apiKeyName or apiKeyValue, leave these values blank.

```

const HttpCacheToMongo = require('http-cache-to-mongo');
const apiKeyName = 'api_key';
const apiKeyValue = 'asdfwyenxcvkshgdwkssnqf0vzja';
const dbName = 'httpcachedb';
const collectionName = 'httpcache';
const connectionUrl = 'mongodb://localhost:27017';

const cache = new HttpCacheToMongo({
    apiKeyName,
    apiKeyValue,
    dbName,
    collectionName,
    connectionUrl
});

cache.then( (cache) => {
    cache.get('https://api.mockupwebservice.local/abc/123')
    .then(json => {
        // your json data is here
    })
    .catch(error => {
        console.log(error);
    });
}).catch(error => {
    console.log(error);
});
```