const root = exports || this;

root.CollectionRevisions.restore = function(collection, documentId, revision, cb) {
  check(collection, Object);
  check(documentId, String);
  check(revision, Match.OneOf(String, Object));

  // backwards compatibility
  let mongo;
  if (typeof Mongo === "undefined") {
    mongo = {};
    mongo.Collection = Meteor.Collection;
  } else {
    mongo = Mongo;
  }

  if (!(collection instanceof mongo.Collection)) { return false; }

  //Grab the document
  const doc = collection.findOne({_id:documentId});
  if (!doc) { return false; }

  //Load options
  const opts = root.CollectionRevisions[collection._name] || {};
  _.defaults(opts, root.CollectionRevisions.defaults);

  //grab the revision if the revison is just an ID
  if (typeof revision === 'string') {
    revision = _.find(doc[opts.field], rev => rev.revisionId === revision);
    if (!revision) { return false; }
  }

  //remove the revisionID
  delete revision.revisionId;

  //get all document fields
  let docKeys = _.keys(doc);
  //remove _id and revisions fields
  docKeys = _.without(docKeys, '_id', opts.field);

  //get all revision fields
  const revKeys = _.keys(revision);

  //find keys that are present in the document that are not in the revision
  //these will be unset
  const unsetFields = _.difference(docKeys,revKeys);

  //Tee up the modifier
  const modifier = {};
  if (!_.isEmpty(revision)) {
    modifier.$set = revision;
  }

  if (unsetFields.length > 0) {
    modifier.$unset = {};
    _.each(unsetFields, field => modifier.$unset[field] = "");
  }

  //update the document with the revision data and provide callback
  collection.update({ _id:doc._id }, modifier, cb);
};
