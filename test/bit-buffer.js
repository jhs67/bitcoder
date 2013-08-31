
var assert = require('assert');
var BitBuffer = require('../index').BitBuffer;

describe('BitBuffer', function() {
	var bb, written = [];
	it("constructs properly", function() {
		bb = new BitBuffer(10000);
		assert.notEqual(bb, null);
		assert.equal(bb.length, 10000);
	});
	it("set bits", function() {
		for (var o = 0, i = 0; i < 500; ++i) {
			var bits = Math.random() * 31 | 0;
			var value = Math.random() * (1 << bits) | 0;
			written.push({ bits: bits, value: value });
			bb.setBits(o, value, bits);
			o += bits;
		}
	})
	it("gets bits", function() {
		for (var o = 0, i = 0; i < written.length; ++i) {
			assert.equal(bb.getBits(o, written[i].bits), written[i].value);
			o += written[i].bits;
		}
	})
});
