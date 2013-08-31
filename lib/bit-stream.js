
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

BitStream.prototype.writeUnary = function(v) {
	assert(v >= 1);
	while (v > 32) this.writeBits(0, 32), v -= 32;
	while (v > 8) this.writeBits(0, 8), v -= 8;
	this.writeBits(1, v);
}

BitStream.prototype.readUnary = function(v) {
	var n = 1;
	while (this.readBits(1) == 0) n += 1;
	return n;
}

BitStream.prototype.writeEliasGamma = function(v) {
	var n = 1;
	assert(v >= 1);
	while (v >> n) n += 1;
	this.writeUnary(n);
	this.writeBits(v, n - 1);
}

BitStream.prototype.readEliasGamma = function() {
	var n = this.readUnary() - 1;
	var v = (1 << n) + this.readBits(n);
	return v;
}

BitStream.prototype.writeEliasDelta = function(v) {
	var n = 1;
	assert(v >= 1);
	while (v >> n) n += 1;
	this.writeEliasGamma(n);
	this.writeBits(v, n - 1);
}

BitStream.prototype.readEliasDelta = function() {
	var n = this.readEliasGamma() - 1;
	var v = (1 << n) + this.readBits(n);
	return v;
}
