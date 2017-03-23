'use strict';

var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    streamArray = require('stream-array'),
    _ = require('lodash'),
    KinesisWritable = require('../'),
    recordsFixture = require('./fixture/records'),
    successResponseFixture = require('./fixture/success-response'),
    errorResponseFixture = require('./fixture/failed-response'),
    writeFixture = require('./fixture/write-fixture');

chai.use(sinonChai);

var expect = chai.expect;

describe('KinesisWritable', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        this.client = {
            putRecords: sinon.stub()
        };

        this.stream = new KinesisWritable(this.client, 'streamName', {
            highWaterMark: 6
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('constructor', function() {
        it('should throw error on missing client', function() {
            expect(function() {
                new KinesisWritable();
            }).to.Throw(Error, 'client is required');
        });

        it('should throw error on missing streamName', function() {
            expect(function() {
                new KinesisWritable({});
            }).to.Throw(Error, 'streamName is required');
        });

        it('should throw error on highWaterMark above 500', function() {
            expect(function() {
                new KinesisWritable({}, 'test', { highWaterMark: 501 });
            }).to.Throw(Error, 'Max highWaterMark is 500');
        });
    });

    describe('getPartitionKey', function() {
        it('should return a random partition key padded to 4 digits', function() {
            var kinesis = new KinesisWritable({}, 'foo');

            this.sinon.stub(_, 'random').returns(10);

            expect(kinesis.getPartitionKey()).to.eq('0010');

            _.random.returns(1000);

            expect(kinesis.getPartitionKey()).to.eq('1000');
        });

        it('should be called with the current record being added', function(done) {
            this.client.putRecords.yields(null, successResponseFixture);
            this.sinon.stub(this.stream, 'getPartitionKey').returns('1234');

            this.stream.on('finish', function() {
                expect(this.stream.getPartitionKey).to.have.been.calledWith(recordsFixture[0]);
                done();
            }.bind(this));

            streamArray([recordsFixture[0]])
                .pipe(this.stream);
        });

        it('should use custom getPartitionKey if defined', function(done) {
            this.client.putRecords.yields(null, successResponseFixture);

            this.stream.getPartitionKey = function() {
                return 'custom-partition';
            };

            this.sinon.spy(this.stream, 'getPartitionKey');

            this.stream.on('finish', function() {
                expect(this.stream.getPartitionKey).to.have.returned('custom-partition');
                done();
            }.bind(this));

            streamArray(recordsFixture)
                .pipe(this.stream);
        });
    });

    describe('_write', function() {
        it('should write to kinesis when stream is closed', function(done) {
            this.client.putRecords.yields(null, successResponseFixture);
            this.sinon.stub(this.stream, 'getPartitionKey').returns('1234');

            this.stream.on('finish', function() {
                expect(this.client.putRecords).to.have.been.calledOnce;

                expect(this.client.putRecords).to.have.been.calledWith({
                    Records: writeFixture,
                    StreamName: 'streamName'
                });

                done();
            }.bind(this));

            streamArray(recordsFixture)
                .pipe(this.stream);
        });

        it('should do nothing if there is nothing in the queue when the stream is closed', function(done) {
            this.client.putRecords.yields(null, successResponseFixture);

            this.stream.on('finish', function() {
                expect(this.client.putRecords).to.have.been.calledOnce;

                done();
            }.bind(this));

            for (var i = 0; i < 6; i++) {
                this.stream.write(recordsFixture);
            }

            this.stream.end();
        });

        it('should buffer records up to highWaterMark', function(done) {
            this.client.putRecords.yields(null, successResponseFixture);

            for (var i = 0; i < 4; i++) {
                this.stream.write(recordsFixture[0]);
            }

            this.stream.write(recordsFixture[0], function() {
                expect(this.client.putRecords).to.not.have.been.called;

                this.stream.write(recordsFixture[0], function() {
                    expect(this.client.putRecords).to.have.been.calledOnce;

                    done();
                }.bind(this));
            }.bind(this));
        });

        it('should emit error on Kinesis error', function(done) {
            this.client.putRecords.yields('Fail');

            this.stream.on('error', function(err) {
                expect(err).to.eq('Fail');

                done();
            });

            this.stream.end({ foo: 'bar' });
        });

        it('should emit error on records errors', function(done) {
            this.client.putRecords.yields(null, errorResponseFixture);

            this.stream.on('error', function(err) {
                expect(err).to.be.ok;

                done();
            });

            this.stream.end({ foo: 'bar' });
        });

        it('should retry failed records', function(done) {
            this.sinon.stub(this.stream, 'getPartitionKey').returns('1234');

            this.client.putRecords.yields(null, errorResponseFixture);
            this.client.putRecords.onCall(2).yields(null, successResponseFixture);

            this.stream.on('finish', function() {
                expect(this.client.putRecords).to.have.been.calledThrice;

                expect(this.client.putRecords.secondCall).to.have.been.calledWith({
                    Records: [
                        writeFixture[1],
                        writeFixture[3]
                    ],
                    StreamName: 'streamName'
                });

                done();
            }.bind(this));

            streamArray(recordsFixture).pipe(this.stream);
        });
    });
});
