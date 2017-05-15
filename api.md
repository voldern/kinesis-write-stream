<a name="KinesisWritable"></a>
## KinesisWritable(client, streamName, options)
A simple stream wrapper around Kinesis putRecords

**Kind**: global function

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| client | <code>AWS.Kinesis</code> |  | AWS Kinesis client |
| streamName | <code>string</code> |  | Kinesis stream name |
| options | <code>Object</code> |  | Options |
| [options.highWaterMark] | <code>number</code> | <code>16</code> | Number of items to buffer before writing. Also the size of the underlying stream buffer. |
| [options.maxRetries] | <code>Number</code> | <code>3</code> | How many times to retry failed data before rasing an error |
| [options.retryTimeout] | <code>Number</code> | <code>100</code> | How long to wait initially before retrying failed records |
| [options.flushTimeout] | <code>number</code> | <code></code> | Number of ms to flush records after, if highWaterMark hasn't been reached |
| [options.logger] | <code>Object</code> |  | Instance of a logger like bunyan or winston |

<a name="KinesisWritable+getPartitionKey"></a>
### kinesisWritable.getPartitionKey([record]) ⇒ <code>string</code>
Get partition key for given record

**Kind**: instance method of <code>[KinesisWritable](#KinesisWritable)</code>

| Param | Type | Description |
| --- | --- | --- |
| [record] | <code>Object</code> | Record |
