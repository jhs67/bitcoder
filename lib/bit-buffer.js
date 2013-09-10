
var assert = require('assert');

const haveBuffer = typeof Buffer !== 'undefined';
const defaultBuffer = haveBuffer && typeof window === 'undefined' ? Buffer : Uint8Array;

exports.BitBuffer = BitBuffer;
function BitBuffer(buf, len) {
	if (haveBuffer && buf instanceof Buffer) {
		this.buffer = buf;
	}
	else if (buf instanceof Uint8Array) {
		this.buffer = buf;
	}
	else {
		len = parseInt(buf);
		if (len <= 0)
			throw new Error("invalid length for bit buffer");
		this.buffer = new defaultBuffer((len + 7) / 8);
	}

	this.length = len == null ? this.buffer.length * 8 : len;
	assert(this.length <= this.buffer.length * 8);
}

BitBuffer.prototype.getBits = function(offset, length) {
	assert(length >= 0);
	assert(offset >= 0);
	assert(length <= 32);
	assert(offset + length <= this.length);

	var v = 0;
	while (length > 0) {
		var q = 8 - (offset & 7);
		var n = Math.min(length, q), m = (1 << n) - 1;
		v |= (this.buffer[offset >> 3] >> (q - n) & m) << (length - n);
		offset += n;
		length -= n;
	}
	return v;
}

BitBuffer.prototype.setBits = function(offset, bits, length) {
	assert(length >= 0);
	assert(offset >= 0);
	assert(length <= 32);
	assert(offset + length <= this.length);

	while (length > 0) {
		var q = 8 - (offset & 7);
		var n = Math.min(length, q), m = (1 << n) - 1;
		this.buffer[offset >> 3] = this.buffer[offset >> 3] & ~(m << (q - n))
			| (bits >> (length - n) & m) << (q - n);
		offset += n;
		length -= n;
	}
	return this;
}

BitBuffer.prototype.fillBits = function(offset, v, length) {
	v &= 1, v |= v << 1, v |= v << 2, v |= v << 4;
	var q = Math.min(length, -offset & 7);
	if (q) {
		this.setBits(offset, v, q);
		length -= q;
		offset += q;
	}
	while (length >= 8) {
		this.buffer[offset >> 3] = v;
		length -= 8;
		offset += 8;
	}
	if (length)
		this.setBits(offset, v, length);
}
