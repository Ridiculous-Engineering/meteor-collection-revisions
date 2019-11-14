Package.describe({
  name: 'simonsimcity:collection-revisions',
  version: '1.0.0',
  summary: 'Keep revision history for collection documents and provide restore functionality.',
  git: 'https://github.com/simonsimcity/meteor-collection-revisions.git',
});

Package.onUse(function(api) {
  api.use([
    'mongo',
    'underscore',
    'ecmascript',
    'check',
    'random',
    'matb33:collection-hooks@1.0.0',
  ]);
  api.versionsFrom('1.7.0.5');
  api.mainModule('collectionRevisions.js');
  api.export(['CollectionRevisions'], ['client', 'server']);
});
