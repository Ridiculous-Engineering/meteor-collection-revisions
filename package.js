Package.describe({
  name: 'ridiculousengineering:collection-revisions',
  version: '1.2.0',
  summary:
    'Keep revision history for collection documents and provide restore functionality.',
  git: 'https://github.com/simonsimcity/meteor-collection-revisions.git',
});

Package.onUse(function (api) {
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

Package.onTest(function (api) {
  // Testing the compatibility ...
  api.use('mikowals:batch-insert');

  api.use(['mongo', 'ecmascript']);

  api.use('ridiculousengineering:collection-revisions', ['server', 'client']);

  api.use('meteortesting:mocha@0.4.1', ['server', 'client']);
  Npm.depends({ chai: '4.1.2' });

  api.addFiles('test/collectionRevisions.js', ['server', 'client']);
  api.addFiles('test/restoreRevision.js', ['server', 'client']);
});
