const _ = require('lodash');
const Pubsub = require('@google-cloud/pubsub');

class PubSubTopic {
  constructor (topic, config) {
    this.topic = topic;
    this.pubsub = this.initPubsub(config);
  }

  publish (message) {
    return this.getTopic().then(topic => {
      return topic.publisher().publish(this.toBuffer(message));
    });
  }

  subscribe (subscriptionName) {
    return this.getSubscription(subscriptionName);
  }

  getTopic () {
    return this.pubsub.topic(this.topic)
      .get({ autoCreate: true }).then(data => _.get(data, '[0]'));
  }

  getSubscription (name) {
    return this.getTopic().then(topic => {
      return topic.subscription(name)
        .get({ autoCreate: true }).then(data => _.get(data, '[0]'));
    });
  }

  initPubsub (config) {
    if (config) return Pubsub(config);

    return Pubsub();
  }

  toBuffer (message) {
    let content = message;

    if (_.isObject(message)) content = JSON.stringify(message);
    return Buffer.from(content);
  }
}

module.exports = PubSubTopic;
