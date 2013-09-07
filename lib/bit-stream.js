
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

BitStream.prototype.fillBits = function(bit, length) {
	this.view.fillBits(this.index, bit, length);
	this.index += length;
	return this;
}

BitStream.prototype.writeUnary = function(v) {
	assert(v >= 1);
	this.fillBits(0, v - 1);
	this.writeBits(1, 1);
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

function eliasOmegaW(b, v) {
	assert(v >= 1);
	if (v == 1) return;
	var n = 1;
	while (v >> n) n += 1;
	eliasOmegaW(b, n - 1);
	b.writeBits(v, n);
}

BitStream.prototype.writeEliasOmega = function(v) {
	eliasOmegaW(this, v);
	this.writeBits(0, 1);
}

function eliasOmegaR(b, n) {
	var p = b.readBits(1);
	if (p == 0) return n;
	return eliasOmegaR(b, (1 << n) + b.readBits(n));
}

BitStream.prototype.readEliasOmega = function(v) {
	var v = eliasOmegaR(this, 1);
	return v;
}

BitStream.prototype.writeTruncateBinary = function(v, n) {
	var k = 1;
	assert(v >= 0);
	assert(n >= 1);
	assert(v < n);
	while (n >> k) k += 1;
	var r = (1 << --k), b = n - r;
	if (v < r - b) this.writeBits(v, k);
	else this.writeBits(v + 2 * r - n, k + 1);
}

BitStream.prototype.readTruncatedBinary = function(n) {
	var k = 1;
	assert(n >= 1);
	while (n >> k) k += 1;
	var r = (1 << --k), b = n - r;
	var v = this.readBits(k);
	if (v < r - b) return v;
	return 2 * v + this.readBits(1) + n - 2 * r;
}
