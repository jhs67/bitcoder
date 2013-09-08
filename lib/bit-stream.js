
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

BitStream.prototype.wrap = function(n) {
	n = 8 * (n || 1);
	this.writeBits(1, 1);
	this.fillBits(0, n * Math.ceil(this.index / n) - this.index);
	return this.view.buffer.slice(0, this.index / 8 | 0);
}

BitStream.unwrap = function(b) {
	var r = new BitStream(b);
	while (r.view.length > 0 && r.view.getBits(r.view.length - 1, 1) == 0)
		--r.view.length;
	--r.view.length;
	return r;
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

// Initialize a nice long list of fibonacci numbers
var fibs = [1, 2];
while (2e6 > fibs[fibs.length - 1])
	fibs.push(fibs[fibs.length - 2] + fibs[fibs.length - 1]);

// Find the index of the largest fibonacci not larger than v
function nextFib(v) {
	// Add new fibonacci numbers if necessary
	while (v >= fibs[fibs.length - 1])
		fibs.push(fibs[fibs.length - 2] + fibs[fibs.length - 1]);

	// Binary search
	var l = 0, h = fibs.length;
	while (true) {
		var m = (l + h) / 2 | 0;
		if (m == l) return m;
		if (v >= fibs[m])
			l = m;
		else
			h = m;
	}
}

function fibonacciW(b, v, i) {
	var q = v >= fibs[i];
	if (q) v -= fibs[i];
	if (i > 0) fibonacciW(b, v, --i);
	b.writeBits(q | 0, 1);
}

BitStream.prototype.writeFibonacci = function(v) {
	fibonacciW(this, v, nextFib(v));
	this.writeBits(1, 1);
}

BitStream.prototype.readFibonacci = function() {
	var a = 1, b = 2, c = 3, v = 0, w = 0;
	while (true) {
		var q = this.readBits(1);
		if (q && w) return v;
		if (q) v += a;
		a = b; b = c; c = a + b;
		w = q;
	}
}
