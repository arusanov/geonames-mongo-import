/*
 * geonames-import
 * user/repo
 *
 * Copyright (c) 2014 
 * Licensed under the MIT license.
 */

'use strict';

var csv = require('csv'),
  timezones = require('./timezones'),
  util = require('util'),
  _ = require('underscore'),
  EventEmitter = require("events").EventEmitter;


function Importer(options) {
  this.options = _.defaults(options || {}, {
    featureClasses: ['A', 'P'] //Only this will be taken
  });
  EventEmitter.call(this);
}

util.inherits(Importer, EventEmitter);

Importer.prototype.fromStream = null;
Importer.prototype.toStream = null;
Importer.prototype.transforms = [];
Importer.prototype.parseOptions = {
  delimiter: '\t',
  relax: true,
  columns: [
    '_id',
    'name',
    'asciiname',
    'alternatenames',
    'latitude',
    'longitude',
    'feature_class',
    'feature_code',
    'country_code',
    'cc2',
    'admin1_code',
    'admin2_code',
    'admin3_code',
    'admin4_code',
    'population',
    'elevation',
    'dem',
    'timezone',
    'modification_date'
  ]
};

Importer.prototype.from = function (stream) {
  this.fromStream = stream;
  return this;
};

Importer.prototype.transform = function (fn) {
  this.transforms.push(fn);
  return this;
};

Importer.prototype.convert = function () {
  var self = this;
  return self.fromStream.pipe(csv.parse(self.parseOptions))
    .pipe(csv.transform(function (data) {
        if (self.options.featureClasses.indexOf(data.feature_class) === -1) {
          return null;
        }

        data.loc = {
          type: 'Point',
          coordinates: [
            parseFloat(data.longitude),
            parseFloat(data.latitude)
          ]
        };
        data.alternatenames = data.alternatenames ? data.alternatenames.split(',') : [];
        if (data.alternatenames.indexOf(data.name) === -1) {
          data.alternatenames.push(data.name);
        }
        if (data.alternatenames.indexOf(data.asciiname) === -1) {
          data.alternatenames.push(data.asciiname);
        }
        data.alternatenames = data.alternatenames.map(function (s) {
          return s.toLowerCase();
        });
        var timezone = timezones[data.timezone.toLowerCase()];

        var obj = {
          _id: data._id,
          name: data.name,
          alternatenames: data.alternatenames,
          loc: data.loc,
          feature_class: data.feature_class,
          feature_code: data.feature_code,
          country_code: data.country_code,
          population: data.population,
          timezone: data.timezone ? data.timezone.toLowerCase() : '',
          offset_gmt: timezone ? timezone.gmt_offset : null,
          offset_dst: timezone ? timezone.dst_offset : null,
          offset_raw: timezone ? timezone.raw_offset : null
        };
        self.transforms.forEach(function (fn) {
          obj = fn(obj);
        });
        return JSON.stringify(obj)+'\n';
      }
    ));
};

module.exports = Importer;
