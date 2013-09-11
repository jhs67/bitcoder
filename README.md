bit-coder
=========

A node.js library for bitwise binary encoding of data

## Usage

```javascript
var assert = require('assert');
var bitCoder = require('bit-coder');

// 1000 bits to write to.
var wbs = new bitCoder.BitStream(1000);

// Write out some values.
wbs.writeBits(100, 20);
wbs.writeUnary(20);
wbs.writeEliasGamma(2000);

// Pad and get the result
var buf = wbs.wrap();

// Get a new bitstream removing the padding
var rbs = bitCoder.BitStream.unwrap(buf);

// Check the contents.
assert.equal(rbs.readBits(20), 100);
assert.equal(rbs.readUnary(), 20);
assert.equal(rbs.readEliasGamma(), 2000);
```

## API

### BitStream
### `new bitCoder.BitStream(len)`
Construct a new BitStream backed by a new `BitBuffer` len bits.

### `new bitCoder.BitStream(bitbuf)`
Construct a new BitStream backed by an existing `BitBuffer`.

### `new bitCoder.BitStream(buf, len)`
Construct a new BitStream backed by an new `BitBuffer`
constructed from the existing buffer and optional length.

### `bitCoder.Bitstream.unwrap(buf)`
Construct a new `BitStream` from of buffer previously obtained
from calling `wrap`. This is a Function method, not a prototype method.

### `BitStream.index`
The current read/write pointer; change this to seek.

### `BitStream.view`
The underling `BitBuffer`.

### `BitStream.wrap()`
Pad a bit stream with 1 to 8 bits to the nearest byte boundary and return
the slice of the underling `Buffer` that was written.

### `Bitstream.readBits(len)`
Read len bits (32 maximum) from the stream.

### `Bitstream.writeBits(offset, len)`
Write len (32 maximum) to the stream.

### `Bitstream.fillBits(offset, v, len)`
Write len bits with the lowest bit of v.

### `BitStream.writeUnary(v)`
Write out the given value (v >= 1) in unary encoding

### `BitStream.readUnary()`
Read a unary encoded value from the stream

### `BitStream.writeEliasGamma/writeEliasDelta/writeEliasOmega/writeFibonacci(v)`
Write out the given value (v >= 1) in the indicated universal code

### `BitStream.readEliasGamma/readEliasDelta/readEliasOmega/readFibonacci()`
Read a value encoded with the indicated universal code

### `BitStream.writeTruncateBinary(v, n)`
Write out the value v (0 <= v < n) in base n truncated binary representation

### `BitStream.readTruncateBinary(n)`
Read a base n truncated binary value from the stream

### BitBuffer
### `new bitCoder.BitBuffer(len)`
Construct a new BitBuffer len bits long backed by a `Buffer` on
node.js or a `Uint8Array` in the browser.

### `new bitCoder.BitBuffer(buffer, len)`
Construct a new BitBuffer backed by the supplied `Buffer` or `Uint8Array`.
The length is specified by the optional len, which is all the bits in
the buffer if unspecified.

### `BitBuffer.getBits(offset, len)`
Retreive len bits (32 maximum) from the buffer at the supplied offset.

### `BitBuffer.setBits(offset, len)`
Set len (32 maximum) to the buffer at the supplied offset.

### `BitBuffer.fillBits(offset, v, len)`
Fill len bits with the lowest bit of v at the supplied offset.


## License

  MIT
