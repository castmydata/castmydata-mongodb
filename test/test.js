var should = require('should');
var request = require('request');
var fs = require('fs');
var path = require('path');
var rmdir = require('rmdir-sync');
var url = 'http://localhost:8080';
var apiUrl = url + '/db/mochatest/';
var dotenv = require('dotenv').config({
    path: path.join(__dirname, '.castmydata.env')
});
var endpoint;

// cleanup localstorage
var localStoragePath = path.join(__dirname, '..', 'scratch');
rmdir(localStoragePath);
fs.mkdirSync(localStoragePath);

// require castmydata client
var client = require('castmydata-jsclient');

describe('CastMyData MongoDB Tests', function() {

    var CastMyData = require('castmydata-server');
    var castmydata = new CastMyData({
        db: (new(require('../castmydata-mongodb'))()),
        config: {
            mongo: {
                url: 'mongodb://localhost:27017/test',
                // username: process.env.MONGO_USER,
                // password: process.env.MONGO_PASS
            }
        }
    });

    this.timeout(5000);

    var api = request.defaults({
        headers: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + process.env.API_TOKEN
        }
    });

    before(function(done) {
        endpoint = new client.Endpoint(url, 'mochatest');
        castmydata.startup(done);
    });

    after(function(done) {
        this.timeout = 10000;
        endpoint.close();
        castmydata.shutdown(done);
    });

    it('should deny api request without auth token', function(done) {
        request(apiUrl, function(error, response, body) {
            response.statusCode.should.eql(403);
            body.should.eql('Forbidden');
            done();
        });
    });

    var id;
    it('should be able to create a new record', function(done) {
        api.post(apiUrl, function(error, response, body) {
            var data = JSON.parse(body);
            response.statusCode.should.eql(201);
            data.should.have.propertyByPath('response', 'title').eql('Buy Milk');
            data.should.have.propertyByPath('response', 'meta', 'createdAt').should.be.ok();
            data.response.id.should.be.ok();
            id = data.response.id;
            done();
        }).form({
            title: 'Buy Milk'
        });
    });

    it('should be able list all records', function(done) {
        api.get(apiUrl, function(err, response, body) {
            var data = JSON.parse(body);
            response.statusCode.should.eql(200);
            data.should.have.property('response');
            data.response.length.should.be.ok();
            done();
        });
    });

    it('should be able to get a record by id', function(done) {
        api.get(apiUrl + id, function(err, response, body) {
            var data = JSON.parse(body);
            response.statusCode.should.eql(200);
            data.should.have.propertyByPath('response', 'title').eql('Buy Milk');
            data.should.have.propertyByPath('response', 'meta', 'createdAt').should.be.ok();
            data.response.id.should.be.eql(id);
            done();
        });
    });

    it('should be able to update a record by id', function(done) {
        api.put(apiUrl + id, function(err, response, body) {
            var data = JSON.parse(body);
            response.statusCode.should.eql(200);
            data.should.have.propertyByPath('response', 'title').eql('Buy Eggs');
            data.should.have.propertyByPath('response', 'meta', 'updatedAt').should.be.ok();
            data.response.id.should.be.eql(id);
            done();
        }).form({
            title: 'Buy Eggs'
        });
    });

    it('should be able to delete a record by id', function(done) {
        api.delete(apiUrl + id, function(err, response, body) {
            var data = JSON.parse(body);
            response.statusCode.should.eql(200);
            data.response.id.should.be.eql(id);
            data.should.have.propertyByPath('response', 'meta', 'deletedAt').should.be.ok();
            done();
        });
    });

    it('should be able to clear db', function(done) {
        api.get(apiUrl + 'clear', function(err, response) {
            response.statusCode.should.eql(200);
            done();
        });
    });

    it('should be able to broadcast data', function(done) {
        api.post(apiUrl + 'broadcast', function(err, response, body) {
            response.statusCode.should.eql(200);
            done();
        }).form({
            channel: 'some-channel',
            payload: 'Hello World',
        });
    });

    it('should be able to subscribe', function(done) {
        this.slow(2000);
        endpoint.subscribe(function() {
            done();
        }).should.be.ok();
    });

    it('should be able to create a record', function(done) {
        endpoint.post({
            title: 'Buy Eggs'
        }, function(model) {
            model.should.have.propertyByPath('title').eql('Buy Eggs');
            model.should.have.propertyByPath('meta', 'createdAt').should.be.ok();
            model.id.should.be.ok();
            id = model.id;
            done();
        });
    });

    it('should be able to find a record by id', function(done) {
        var model = endpoint.find(id);
        model.should.be.ok();
        model.id.should.eql(id);
        done();
    });

    var query;
    it('should be able to query an endpoint', function(done) {
        query = endpoint.where(function(model) {
            return model.title == 'Buy Eggs';
        });
        query.models.length.should.be.eql(1);
        query.models[0].id.should.eql(id);
        done();
    });

    var id2;
    it('should be able to update query models when a new record is created', function(done) {
        endpoint.post({
            title: 'Buy Eggs'
        }, function(model) {
            query.models.length.should.be.eql(2);
            id2 = model.id;
            done();
        });
    });

    it('should be able to update a record by id', function(done) {
        endpoint.put(id, {
            title: 'Buy Bread'
        }, function(model) {
            model.should.have.property('title').eql('Buy Bread');
            model.should.have.propertyByPath('meta', 'updatedAt').should.be.ok();
            model.id.should.eql(id);
            query.models.length.should.be.eql(1);
            done();
        }).should.be.ok();
    });

    it('should be able to delete a record by id', function(done) {
        endpoint.delete(id2, function(model) {
            model.should.not.have.property('title');
            model.should.have.propertyByPath('meta', 'deletedAt').should.be.ok();
            model.id.should.eql(id2);
            query.models.length.should.eql(0);
            done();
        }).should.be.ok();
    });

    it('should be able to clear db', function(done) {
        endpoint.clear(function() {
            endpoint.models.length.should.eql(0);
            done();
        }).should.be.ok();
    });

    it('should be able to unsubscribe', function(done) {
        endpoint.unsubscribe(function() {
            endpoint.models.length.should.eql(0);
            done();
        }).should.be.ok();
    });

    it('should be able to close connection', function(done) {
        endpoint.close().should.be.ok();
        done();
    });
});