const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

module.exports = class HttpCacheToMongo {

    constructor(obj) {

        const {
            apiKeyName, 
            apiKeyValue, 
            dbName,
            collectionName,
            connectionUrl
        } = obj;

        this.apiKeyName = apiKeyName;
        this.apiKeyValue = apiKeyValue;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.connectionUrl = connectionUrl;

        return new Promise(resolve => {
            MongoClient.connect(this.connectionUrl, (err, client) => {
                assert.equal(null, err);       
                this.db = client.db(this.dbName);
                this.collection = this.db.collection(this.collectionName);
                resolve(this);
            });
        });
    }

    insertDocument(json, url, callback) {

        const documentByUrl = {
            url,
            data: json
        }

        this.collection.insert(documentByUrl, (err, result) => {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
            assert.equal(1, result.ops.length);
            callback(result.ops);
        });
    }

    get(url) {

        const absUrl = `${url}?${this.apiKeyName}=${this.apiKeyValue}`;
        
        return new Promise( (resolve, reject) => {

            this.collection.find({
                url
            })
            .toArray( (err, docs) => {
                // if the data for this url already exists, return it.
                if (docs.length > 0) {
                    resolve(docs);
                }
                // else make a call to the webservice and store it in mongodb
                else {
                    axios
                    .get(absUrl)
                    .then(response => {
                        this.insertDocument(response.data, url, (docs) => {
                            const json = docs;
                            resolve(json);
                        });
                    })
                    .catch( (error) => {
                        console.log(error);
                        reject(error);
                    });
                }
            });
        });
    }
}
