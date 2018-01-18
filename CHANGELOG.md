# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [1.1.1] - 2018-01-18
### Fixed
- Fixed bug that would cause loss of events written between a write to Kinesis 
  started and finished. Fixed by @chrissharkey.

## [1.1.0] - 2017-05-15
### Added
- Added flushTimeout for periodically flushing records. 
  Thanks to @indieisaconcept

## [1.0.2] - 2017-03-25
### Fixed
- Pass record to getPartitionKey as stated in
  documentation. Contribution by @indieisaconcept.

## [1.0.1] - 2015-11-04
### Fixed
- Call `warn` method instead of `warning` on log object if available

## [1.0.0] - 2015-11-04
### Fixed
- Do not write to Kinesis when queue is empty

## [0.0.1] - 2015-10-28

Initial release
