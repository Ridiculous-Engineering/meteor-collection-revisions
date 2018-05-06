Package.describe({
  name: 'nicklozon:collection-revisions',
  version: '0.3.3',
  // Brief, one-line summary of the package.
  summary: 'Keep revision history for collection documents and provide restore functionality.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/nicklozon/meteor-collection-revisions.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use([
    'underscore',
    'check',
    'random@1.0.2',
    'matb33:collection-hooks@0.8.4',
  ]);
  api.versionsFrom('1.3.0');
  api.addFiles(['collectionRevisions.js','restoreRevision.js']);
  api.export(['CollectionRevisions'], ['client', 'server']);
});
