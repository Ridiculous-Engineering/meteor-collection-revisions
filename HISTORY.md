HISTORY.md

### v1.1.0
 - Fixed restoring first revision of documents of collection where this package was added later

### v1.0.1
 - Updated matb33:collection-hooks to version 1.0.0
 - Dropped compatibility to meteor versions older than Meteor 1.7.0.5

### v1.0.0
 - Decaffeinated package
 - Removed dependency on momentjs:moment
 - Removed dependency on dburles:mongo-collection-instances
 - Removed configuration `ignoreWithinUnit` - the configuration `ignoreWithin` now has the time difference in milliseconds
 - Updated matb33:collection-hooks to version 0.8.4
 - Dropped compatibility to meteor versions older than Meteor 1.3.0

### v0.3.3
 - Fixed issue with collection name lookup by adding a new dependency - mocha tests were failing because collections did not exist in the global scope when importing them as modules. Meteor Shell did not suffer from this issue during testing.
 - Fix issue with Meteor.Collection backward compatibility not actually using Mongo.Collection when available
 - Added callback to the restore function

### v0.3.2
  - Fixed issue when callback option was not defined - it should be allowed to be undefined/null.
  - Code cleanup

### v0.3.1
  - Added export for CollectionRevisions, fixed references when using export

### v0.3.0
  - Fixed bug for restoring revision when revisions field is not set for collection
  - Added a revision prune feature which will remove restored revision and all revisions after it
  - Added feature for callbacks

### v0.2.1
  - Add required dependencies to package.js

### v0.2.0
  - Changed restore logic to unset fields present in the current revision when restoring an older revision without those fields.

### v0.1.0
  - Initial Package
