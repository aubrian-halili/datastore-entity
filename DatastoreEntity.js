const _ = require('lodash');
const Datastore = require('@google-cloud/datastore');
const debug = require('debug')('common-js');
const PubSubTopic = require('./lib/PubSubTopic');
const { pluck, concat, map } = require('./utils');

class DatastoreEntity {
  constructor (kind = [], conf, pubSubTopic, pubsubConf) {
    this.kind = concat(kind);
    this.datastore = this.initDatastore(conf);

    // Implements CRUD Hook using PubSub
    this.pubsub = this.initPubsub(pubSubTopic, pubsubConf);
  }

  set (entities) {
    const list = concat(entities);
    const kind = this.kind;
    let event = 'save';

    if (this.hasId(list)) event = 'update';
    return this._save(list).then(data => {
      return this.broadcast({ event, data, kind }).then(() => data);
    });
  };

  get (ids) {
    const list = concat(ids);
    const kind = this.kind;

    return this._get(list).then(data => {
      return this.broadcast({ event: 'get', data, kind }).then(() => data);
    });
  };

  remove (ids) {
    const list = concat([], ids);
    const kind = this.kind;

    return this._remove(list).then(data => {
      return this.broadcast({ event: 'delete', data: list, kind }).then(() => data);
    });
  };

  createQuery () {
    return this.datastore.createQuery(this.kind);
  }

  initDatastore (conf) {
    if (conf) return Datastore(conf);

    return Datastore();
  }

  initPubsub (topic, conf) {
    if (topic) return new PubSubTopic(topic, conf);

    return null;
  }

  _save (data) {
    const entities = map(data, entity => {
      return {
        key: this.createKey(entity),
        data: _.omit(entity, 'id')
      };
    });

    return this.datastore.save(entities).then(() => {
      return map(entities, ({ key, data }) => {
        return _.set(data, 'id', _.get(key, 'id'));
      });
    });
  };

  _get (data) {
    const actions = [];
    const keys = map(data, id => this.createKey(id));

    if (keys.length > 0) actions.push(this.datastore.get(keys));
    else actions.push(this._getAll());

    return Promise.all(actions).then(result => {
      const entities = _.get(result, '[0][0]');

      return map(entities, entity => {
        const keyPath = [this.datastore.KEY, 'id'];
        return _.set(entity, 'id', _.get(entity, keyPath));
      });
    });
  };

  _getAll () {
    const query = this.createQuery(this.kind);

    return query.run();
  };

  _remove (data) {
    const keys = map(data, id => this.createKey(id));

    return this.datastore.delete(keys);
  };

  createKey (entity) {
    let key = concat(this.kind);

    if (!_.isNil(entity)) {
      const id = [];

      if (_.isInteger(entity) || _.isString(entity)) id.push(entity);
      if (_.has(entity, 'id')) id.push(entity.id);
      if (id.length > 0) key = concat(key, this.datastore.int(id));
    }
    return this.datastore.key(key);
  }

  broadcast (message) {
    if (this.pubsub) {
      return this.pubsub.publish(message).catch(err => debug(err));
    }
    return Promise.resolve();
  }

  hasId (list) {
    const filter = pluck(list, 'id');

    if (filter.length > 0) return true;
    return false;
  }
};

module.exports = DatastoreEntity;
