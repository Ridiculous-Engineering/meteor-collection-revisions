import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { CollectionRevisions } from 'meteor/simonsimcity:collection-revisions';

import { assert } from 'chai';

const collection = new Mongo.Collection('sample');
collection.attachCollectionRevisions();

describe('Restore revisions', function () {
  beforeEach(() => {
    collection.remove({});
  });

  it('can restore a document', function () {
    const docId = collection.insert({
      foo: 'bar'
    });

    collection.update(docId, {
      $set: { foo: 'bar2' }
    });

    const revId = collection.findOne(docId).revisions[0].revisionId;

    CollectionRevisions.restore(collection, docId, revId);

    assert.equal('bar', collection.findOne(docId).foo);
  });

  it('can restore a document inserted to a collection where revisions were added later', function () {
    const collection2 = new Mongo.Collection(`sample-${Random.id()}`);
    collection2.insert({
      foo: 'bar'
    });
  
    collection2.attachCollectionRevisions();

    const docId = collection2.findOne({})._id;

    collection2.update(docId, {
      $set: { foo: 'bar2' }
    });

    const revId = collection2.findOne(docId).revisions[0].revisionId;

    CollectionRevisions.restore(collection2, docId, revId);

    assert.equal('bar', collection2.findOne(docId).foo);
  });
});

