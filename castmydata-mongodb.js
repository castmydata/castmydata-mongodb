// jshint esversion: 6
(function() {
    'use strict';

    var MongoClient = require('mongodb').MongoClient;
    var uuid = require('uuid');
    var _ = require('underscore');
    var ude = require('underscore-deep-extend');
    _.mixin({
        deepExtend: ude(_)
    });

    function MongoDB() {
        var self = this;
        this.name = 'mongodb';
        this.client = null;
    }

    function cleanup(records) {
        return records.map(function(record) {
            if (!record) return record;
            delete record._id;
            return record;
        });
    }

    MongoDB.prototype = {
        startup: function(app, done) {
            var self = this;
            var url = app.get('mongo.url', 'mongodb://localhost:27017/test');
            var connOptions = app.get('mongo.connOptions', {});
            var username = app.get('mongo.username');
            var password = app.get('mongo.password');
            var authOptions = app.get('mongo.authOptions', {});

            MongoClient.connect(url, connOptions, function(err, db) {
                self.client = db;
                if (username || password) {
                    db.authenticate(username, password, authOptions, function(err) {
                        if (err) throw err;
                        done();
                    });
                } else {
                    done();
                }
            });
        },
        all: function(table, callback) {
            this.where(table, {}, callback);
            return this;
        },
        where: function(table, filter, callback) {
            this.client.collection(table).find(filter).toArray(function(err, records) {
                if (err) return callback(err);
                callback(null, cleanup(records));
            });
            return this;
        },
        find: function(table, id, callback) {
            this.client.collection(table).findOne({
                _id: id
            }, function(err, model) {
                if (err) callback(err);
                callback(null, cleanup([model]).pop());
            });
            return this;
        },
        post: function(table, _record, callback) {
            if (!_record.id) {
                _record.id = uuid.v4();
            }
            _record._id = _record.id;
            var self = this;
            this.find(table, _record.id, function(err, record) {
                if (err) return callback(err);
                if (record) {
                    self.put(table, record.id, _record, callback);
                    return;
                }
                self.client.collection(table).insertOne(_record, function(err) {
                    if (err) return callback(err);
                    self.find(table, _record.id, callback);
                });
            });
            return this;
        },
        put: function(table, id, _record, callback) {
            var self = this;
            this.find(table, id, function(err, record) {
                if (err) return callback(err);
                if (!record) return callback(new Error(`No records found with id ${id} on table ${table}`));
                _record = _.deepExtend(record, _record);
                self.client.collection(table).updateOne({
                    _id: id
                }, {
                    $set: _record
                }, function(err) {
                    if (err) return callback(err);
                    self.find(table, id, callback);
                });
            });
            return this;
        },
        delete: function(table, id, callback) {
            var self = this;
            this.find(table, id, function(err, record) {
                if (err) return callback(err);
                if (!record) return callback(new Error(`No records found with id ${id} on table ${table}`));
                self.client.collection(table).deleteOne({
                    _id: id
                }, function(err) {
                    if (err) return callback(err);
                    callback(null, record);
                });
            });
            return this;
        },
        clear: function(table, callback) {
            var self = this;
            this.client.dropCollection(table, function(err) {
                if (err) return callback(err);
                callback(null);
            });
            return this;
        },
        shutdown: function(app, done) {
            this.client.close(done);
        }
    };

    module.exports = MongoDB;

}).call(global);