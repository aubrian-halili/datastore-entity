const _ = require('lodash');

function map (collection, iteratee) {
  return _.compact(_.map(collection, iteratee));
};

function concat () {
  return _.compact(_.concat(...arguments));
};

exports.map = map;

exports.concat = concat;

exports.pluck = function pluck (collection, field) {
  return map(collection, field);
};
