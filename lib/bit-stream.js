
var assert = require('assert');
var BitBuffer = require('./bit-buffer').BitBuffer;

exports.BitStream = BitStream;
function BitStream(view) {
	if (!(view instanceof BitBuffer))
		view = new BitBuffer(arguments[0], arguments[1], arguments[2]);

	this.view = view;
	this.index = 0;
}

BitStream.prototype.readBits = function(length) {
	var bits = this.view.getBits(this.index, length);
	this.index += length;
	return bits;
}

BitStream.prototype.writeBits = function(bits, length) {
	this.view.setBits(this.index, bits, length);
	this.index += length;
	return this;
}
