const crDebug = (opts, item, label) => {
  if (label == null) { label = ''; }
  if (!opts.debug) { return; }
  if (typeof item === 'object') {
    console.log(`collectionRevisions DEBUG: ${label}↓`);
    console.log(item);
  } else {
    console.log(`collectionRevisions DEBUG: ${label}= ${item}`);
  }
};

export default (collectionRevisions) => function(collection, documentId, revision, cb) {
  check(documentId, String);
  check(revision, Match.OneOf(String, Object));

  if (!(collection instanceof Mongo.Collection)) { return false; }

  //Grab the document
  const doc = collection.findOne({_id:documentId});
  if (!doc) { return false; }

  //Load options
  const opts = collectionRevisions[collection._name] || {};
  _.defaults(opts, collectionRevisions.defaults);

  //grab the revision if the revison is just an ID
  let revIdPrune;
  console.log('what is the revision', revision);
  if (typeof revision === 'string') {
    console.log('am I inside of the if statement');
    revision = _.find(doc[opts.field], rev => rev.revisionId === revision);
    revIdPrune = revision.revisionId;
    console.log('revIdPrune', revIdPrune);
    if (!revision) { return false; }
  }
  
  crDebug({}, {revIdPrune}, 'what is the rid');
  //remove the revisionID
  delete revision.revisionId;
  console.log('do we still have revIdPrune', revIdPrune);
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
    modifier.$set.revIdPrune = revIdPrune;
  }
console.log('what is modifier', modifier);
  if (unsetFields.length > 0) {
    modifier.$unset = {};
    _.each(unsetFields, field => modifier.$unset[field] = "");
  }
console.log('do we still have what we need?', modifier);
  //update the document with the revision data and provide callback
  collection.update({ _id:doc._id }, modifier, {filter: false}, cb);
};
