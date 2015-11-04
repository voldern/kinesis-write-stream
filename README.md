# kinesis-write-stream

Kinesis writable stream that buffers up records

[![build status](https://travis-ci.org/voldern/kinesis-write-stream.svg)](https://travis-ci.org/voldern/kinesis-write-stream)
[![modules status](https://david-dm.org/voldern/kinesis-write-stream.svg)](https://david-dm.org/voldern/kinesis-write-stream)

[![npm badge](https://nodei.co/npm/kinesis-write-stream.png?downloads=true)](https://nodei.co/npm/kinesis-write-stream)

# Usage

Records written to the stream will buffer up until `highWaterMark` has
been reached, or the stream is closed, before writing to Kinesis using
`putRecords`.

## Failed items

Failed items will be retried up until `options.maxRetries` has been
reached. The initial timeout before the retry is set in
`options.retryTimeout` and it increases by the fibonnaci sequence.

## Partition key

The partition key is by default a random number, but this can be
adjusted by overriding `streamInstance.getPartitionKey(record)`.

## Logging

A [bunyan](https://www.npmjs.com/package/bunyan),
[winston](https://www.npmjs.com/package/winston) or similar logger
instance that have methods like `debug`, `error` and `info` may be
sent in as `options.logger` to the constructor.

# Example

```javascript
var KinesisWritable = require('kinesis-write-stream');

var stream = new KinesisWritable(kinesisClient, 'streamName', {
  highWaterMark: 16,
  maxRetries: 3,
  retryTimeout: 100
});

inputStream.pipe(stream);
```

# API

See [api.md](api.md).

# License

MIT
