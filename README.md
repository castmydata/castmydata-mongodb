# CastMyData Mongodb

MongoDB Backend Plugin for CastMyData

## Installation

npm install --save castmydata-mongodb

## Usage

```javascript
var CastMyData = require('castmydata-server');
var mongodb    = require('castmydata-mongodb');


var castmydata = new CastMyData({
    db: new mongodb(),
    config: {
        mongo: {
            url: 'mongodb://localhost:27017/test', // MongoDB Database URL
            connOptions: {},                       // connection options
            username: 'someuser',                  // username
            password: 'somepass',                  // password
            authOptions: {}                        // authentication options
        }
    }
});
```

#### MongoDB URL and Connection Options

These options are passed during the connection of a new MongoClient.

Reference: [MongoClient API Doc](http://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html)

#### MongoDB Authentication Options

These options are used to authenticate CastMyData with the MongoDB Instance.

Reference: [db.authenticate API Doc](http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#authenticate)

## Testing

```bash
> npm test

  CastMyData MongoDB Tests
    ✓ should deny api request without auth token
    ✓ should be able to create a new record (99ms)
    ✓ should be able list all records
    ✓ should be able to get a record by id
    ✓ should be able to update a record by id
    ✓ should be able to delete a record by id
    ✓ should be able to clear db
    ✓ should be able to broadcast data
    ✓ should be able to subscribe
    ✓ should be able to create a record (67ms)
    ✓ should be able to find a record by id
    ✓ should be able to query an endpoint
    ✓ should be able to update query models when a new record is created
    ✓ should be able to update a record by id
    ✓ should be able to delete a record by id
    ✓ should be able to clear db
    ✓ should be able to unsubscribe
    ✓ should be able to close connection

  18 passing (1s)
```

## License

The MIT License (MIT)
Copyright (c) 2016 Zulfa Juniadi

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.