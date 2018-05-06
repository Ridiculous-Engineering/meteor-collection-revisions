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
    'random@1.0.2',
    'matb33:collection-hooks@0.8.4',
  ]);
  api.versionsFrom('1.3.5');
  api.mainModule('collectionRevisions.js');
  api.export(['CollectionRevisions'], ['client', 'server']);
});
