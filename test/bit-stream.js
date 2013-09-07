
var assert = require('assert');
var BitStream = require('../index').BitStream;

describe('BitStream', function() {
	var bs, written = [];
	it("constructs properly", function() {
		bs = new BitStream(10000)
		assert.equal(bs.view.length, 10000);
	});
	it("writes bits", function() {
		for (var i = 0; i < 500; ++i) {
			var bits = Math.random() * 31 | 0;
			var value = Math.random() * (1 << bits) | 0;
			written.push({ bits: bits, value: value });
			bs.writeBits(value, bits);
		}
	})
	it("reads bits", function() {
		bs.index = 0;
		for (var i = 0; i < written.length; ++i) {
			assert(bs.readBits(written[i].bits) == written[i].value);
		}
	})
	it("fills bits", function() {
		for (var i = 0; i < 200; ++i) {
			bs.index = 0;
			var l = Math.random() * 1000 | 0;
			var b = Math.random() > 0.5 | 0;
			bs.fillBits(b, l);
			bs.index = 0;
			for (var j = 0; j < l; ++j)
				assert.equal(b, bs.readBits(1));
		}
	})
	it("unary codes", function() {
		bs.index = 0;
		var written = [];
		for (var i = 0; i < 50; ++i) {
			var bits = Math.random() * 10 | 0;
			var value = Math.random() * (1 << bits) + 1 | 0;
			bs.writeUnary(value);
			written.push(value);
		}
		bs.index = 0;
		for (var i = 0; i < written.length; ++i) {
			assert.equal(bs.readUnary(), written[i]);
		}
	})
	it("elias-gamma codes", function() {
		bs.index = 0;
		var written = [];
		for (var i = 0; i < 200; ++i) {
			var bits = Math.random() * 30 | 0;
			var value = Math.random() * (1 << bits) + 1 | 0;
			bs.writeEliasGamma(value);
			written.push(value);
		}
		bs.index = 0;
		for (var i = 0; i < written.length; ++i) {
			assert.equal(bs.readEliasGamma(), written[i]);
		}
	})
	it("elias-delta codes", function() {
		bs.index = 0;
		var written = [];
		for (var i = 0; i < 200; ++i) {
			var bits = Math.random() * 30 | 0;
			var value = Math.random() * (1 << bits) + 1 | 0;
			bs.writeEliasDelta(value);
			written.push(value);
		}
		bs.index = 0;
		for (var i = 0; i < written.length; ++i) {
			assert.equal(bs.readEliasDelta(), written[i]);
		}
	})
	it("elias-omega codes", function() {
		bs.index = 0;
		var written = [];
		for (var i = 0; i < 200; ++i) {
			var bits = Math.random() * 30 | 0;
			var value = Math.random() * (1 << bits) + 1 | 0;
			bs.writeEliasOmega(value);
			written.push(value);
		}
		bs.index = 0;
		for (var i = 0; i < written.length; ++i) {
			assert.equal(bs.readEliasOmega(), written[i]);
		}
	})
	it("truncated binary codes", function() {
		bs.index = 0;
		var written = [];
		for (var i = 0; i < 200; ++i) {
			var bits = Math.random() * 30 | 0;
			var range = Math.random() * (1 << bits) + 1 | 0;
			var value = Math.random() * range | 0;
			bs.writeTruncateBinary(value, range);
			written.push({ v: value, r: range });
		}
		bs.index = 0;
		for (var i = 0; i < written.length; ++i) {
			assert.equal(bs.readTruncatedBinary(written[i].r), written[i].v);
		}
	})
});
