const root = exports || this;
root.CollectionRevisions = {};
const { CollectionRevisions } = root;

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
    crDebug(opts, 'Begin before.update');
    crDebug(opts, opts, 'Defined options');

    //Don't do anything if this is a multi doc update
    options = options || {};
    if (options.multi) {
      crDebug(opts, "multi doc update attempted, can't create revisions this way, leaving.");
      return true;
    }

    modifier = modifier || {};
    modifier.$set = modifier.$set || {};

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
    if ((opts.ignoreWithin <= 0) || (doc[opts.lastModifiedField] == null) || new Date(doc[opts.lastModifiedField]) + opts.ignoreWithin < new Date()) {
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

      crDebug(opts, modifier, 'Final Modifier');
    } else {
      crDebug(opts, "Didn't create a new revision");
    }
  });
};
