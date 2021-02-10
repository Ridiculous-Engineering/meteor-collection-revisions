import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import restoreRevision from './restoreRevision';

export const CollectionRevisions = {};

CollectionRevisions.restore = restoreRevision(CollectionRevisions);

//Setup defaults
CollectionRevisions.defaults = {
  field: 'revisions',
  lastModifiedField: 'lastModified',
  ignoreWithin: 0,
  keep: true,
  debug: false,
  prune: false,
};

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

Mongo.Collection.prototype.attachCollectionRevisions = function(opts) {
  if (opts == null) { opts = {}; }
  const collection = this;

  _.defaults(opts, CollectionRevisions.defaults);

  //Convert Keep = true to -1
  if (opts.keep === true) {
    opts.keep = -1;
  }

  const fields = {
    field:String,
    lastModifiedField: String,
    ignoreWithin: Number,
    keep: Number,
    debug: Boolean,
    prune: Boolean,
    callback: Match.Maybe(Function)
  };

  check(opts,Match.ObjectIncluding(fields));

  collection.before.insert(function(userId, doc) {
    crDebug(opts, 'Begin before.insert');
    return doc[opts.lastModifiedField] = new Date();
  });

  collection.before.update(function(userId, doc, fieldNames, modifier, options) {
    crDebug(opts, {
      userId,
      doc,
      fieldNames,
      modifier,
      options,
    },
      'Begin before.update');
    crDebug(opts, opts, 'Defined options');

    //Don't do anything if this is a multi doc update
    options = options || {};
    if (options.multi) {
      crDebug(opts, "multi doc update attempted, can't create revisions this way, leaving.");
      return true;
    }

    modifier = modifier || {};
    modifier.$set = modifier.$set || {};
    const revisionIdToPrune = modifier.$set.revIdPrune;
    delete modifier.$set.revIdPrune;

    //Unset the revisions field and _id from the doc before saving to the revisions
    delete doc[opts.field];
    delete doc._id;
    doc.revisionId = Random.id();

    //Perform callback if provided
    if (opts.callback) {
      if (opts.callback(doc, modifier) === false) {
        return true;
      }
    }

    //See if this update occured more than the ignored time window since the last one
    //or the option is set to not ignore within
    //or the lastModified field is not present (collection created before this package was added)
    // const modTime = new Date(doc[opts.lastModifiedField]);
    // const timestamp = new Date();
    const modTime = Date.parse(doc[opts.lastModifiedField]);
    const timestamp = Date.now();
    crDebug(opts, {
      ignoreWithin: opts.ignoreWithin,
      modTime,
      timestamp,
      lastmodified: doc[opts.lastModifiedField],
      difDate: modTime + opts.ignoreWithin,
      ignoreDiff: timestamp - modTime
      
    }, 'Evaluating ignore times')
    //Date.parse(doc[opts.lastModifiedField]) + opts.ignoreWithin < Date.now();
    if ((opts.ignoreWithin <= 0) || (doc[opts.lastModifiedField] == null) || Date.parse(doc[opts.lastModifiedField]) + opts.ignoreWithin < Date.now()) {
    // if ((opts.ignoreWithin <= 0) || (doc[opts.lastModifiedField] == null) || new Date(doc[opts.lastModifiedField]) + opts.ignoreWithin < new Date()) {//this is the original version
      //If so, add a new revision
      crDebug(opts, 'Is past ignore window, creating revision');

      //If pruning is enabled AND this update is restoring a revision, prune the
      //revision being restored and all revisions after using $pull
      if (opts.prune && modifier.$set[opts.lastModifiedField]) {
        modifier.$pull = modifier.$pull || {};
        modifier.$pull[opts.field] = modifier.$pull[opts.field] || {};
        modifier.$pull[opts.field][opts.lastModifiedField] = {
          $gte: modifier.$set[opts.lastModifiedField]
        };
      //If pruneOne is enabled AND this update is restoring a revision, prune the
      //revision being restored ONLY using $pull
      } else if (opts.pruneOne && modifier.$set[opts.lastModifiedField] && typeof revisionIdToPrune !== 'undefined') {
        console.log('in pruning',revisionIdToPrune);
        modifier.$pull = modifier.$pull || {};
        modifier.$pull[opts.field] = modifier.$pull[opts.field] || {};
        modifier.$pull[opts.field]['revisionId'] = {
          $eq: revisionIdToPrune
        };
      //If pruning is NOT occuring, insert a new revision using $push
      } else {
        modifier.$set[opts.lastModifiedField] = new Date();
        modifier.$push = modifier.$push || {};
        modifier.$push[opts.field] = {$each: [doc], $position: 0};

        //See if we are limiting how many to keep
        if (opts.keep > -1) {
          modifier.$push[opts.field].$slice = opts.keep;
        }
      }

      // In case a collection got it later, the first revision doesn't have a "lastModified" field. Returning to the first revision in this case would throw a MongoDB-exception if we would have the opts.lastModifiedField property set in $set and $unset.
      if (modifier.$unset && opts.lastModifiedField in modifier.$unset) {
        delete modifier.$unset[opts.lastModifiedField];
        if (Object.keys(modifier.$unset).length === 0) {
          delete modifier.$unset;
        }
      }

      crDebug(opts, JSON.stringify(modifier, null, 4), 'Final Modifier');
    } else {
      crDebug(opts, "Didn't create a new revision");
    }
  });
};
