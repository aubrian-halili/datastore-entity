
# datastore-entity

## Installation

Using npm:
```shell
$ npm i --save datastore-entity
```

## Download

DatastoreEntity is released under the MIT license & supports modern environments.

## Overview

DatastoreEntity is built on top of the [official Google Cloud Datastore Node.js client](https://cloud.google.com/nodejs/docs/reference/datastore/2.0.x/). Google Cloud Datastore is using a key with a complex data structure that can be used to model relationship but it has also made it painful to manage multiple entities.<br>

DatastoreEntity is a utility to help manage and keep track of key for each entity. An added feature is the integration of Google Pubsub that provides a hook for every CRUD action.
