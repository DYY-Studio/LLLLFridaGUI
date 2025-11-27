📦
691581 /src/index.js
✄
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// frida-shim:node_modules/@frida/base64-js/index.js
var lookup = [];
var revLookup = [];
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (let i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  const len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  let validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  const placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function _byteLength(b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  const lens = getLens(b64);
  const validLen = lens[0];
  const placeHoldersLen = lens[1];
  const arr = new Uint8Array(_byteLength(b64, validLen, placeHoldersLen));
  let curByte = 0;
  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  let i;
  for (i = 0; i < len; i += 4) {
    const tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = tmp >> 16 & 255;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    const tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    const tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr[curByte++] = tmp >> 8 & 255;
    arr[curByte++] = tmp & 255;
  }
  return arr;
}
function tripletToBase64(num) {
  return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
  const output = [];
  for (let i = start; i < end; i += 3) {
    const tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  const len = uint8.length;
  const extraBytes = len % 3;
  const parts = [];
  const maxChunkLength = 16383;
  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
  }
  if (extraBytes === 1) {
    const tmp = uint8[len - 1];
    parts.push(
      lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
    );
  } else if (extraBytes === 2) {
    const tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}

// frida-shim:node_modules/@frida/ieee754/index.js
function read(buffer, offset, isLE, mLen, nBytes) {
  let e, m2;
  const eLen = nBytes * 8 - mLen - 1;
  const eMax = (1 << eLen) - 1;
  const eBias = eMax >> 1;
  let nBits = -7;
  let i = isLE ? nBytes - 1 : 0;
  const d = isLE ? -1 : 1;
  let s = buffer[offset + i];
  i += d;
  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  while (nBits > 0) {
    e = e * 256 + buffer[offset + i];
    i += d;
    nBits -= 8;
  }
  m2 = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  while (nBits > 0) {
    m2 = m2 * 256 + buffer[offset + i];
    i += d;
    nBits -= 8;
  }
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m2 ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m2 = m2 + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m2 * Math.pow(2, e - mLen);
}
function write(buffer, value, offset, isLE, mLen, nBytes) {
  let e, m2, c;
  let eLen = nBytes * 8 - mLen - 1;
  const eMax = (1 << eLen) - 1;
  const eBias = eMax >> 1;
  const rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  let i = isLE ? 0 : nBytes - 1;
  const d = isLE ? 1 : -1;
  const s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  value = Math.abs(value);
  if (isNaN(value) || value === Infinity) {
    m2 = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m2 = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m2 = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m2 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }
  while (mLen >= 8) {
    buffer[offset + i] = m2 & 255;
    i += d;
    m2 /= 256;
    mLen -= 8;
  }
  e = e << mLen | m2;
  eLen += mLen;
  while (eLen > 0) {
    buffer[offset + i] = e & 255;
    i += d;
    e /= 256;
    eLen -= 8;
  }
  buffer[offset + i - d] |= s * 128;
}

// frida-shim:node_modules/@frida/buffer/index.js
var config = {
  INSPECT_MAX_BYTES: 50
};
var K_MAX_LENGTH = 2147483647;
Buffer2.TYPED_ARRAY_SUPPORT = true;
Object.defineProperty(Buffer2.prototype, "parent", {
  enumerable: true,
  get: function() {
    if (!Buffer2.isBuffer(this)) return void 0;
    return this.buffer;
  }
});
Object.defineProperty(Buffer2.prototype, "offset", {
  enumerable: true,
  get: function() {
    if (!Buffer2.isBuffer(this)) return void 0;
    return this.byteOffset;
  }
});
function createBuffer(length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"');
  }
  const buf = new Uint8Array(length);
  Object.setPrototypeOf(buf, Buffer2.prototype);
  return buf;
}
function Buffer2(arg, encodingOrOffset, length) {
  if (typeof arg === "number") {
    if (typeof encodingOrOffset === "string") {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      );
    }
    return allocUnsafe(arg);
  }
  return from(arg, encodingOrOffset, length);
}
Buffer2.poolSize = 8192;
function from(value, encodingOrOffset, length) {
  if (typeof value === "string") {
    return fromString(value, encodingOrOffset);
  }
  if (ArrayBuffer.isView(value)) {
    return fromArrayView(value);
  }
  if (value == null) {
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
    );
  }
  if (value instanceof ArrayBuffer || value && value.buffer instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }
  if (value instanceof SharedArrayBuffer || value && value.buffer instanceof SharedArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length);
  }
  if (typeof value === "number") {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    );
  }
  const valueOf = value.valueOf && value.valueOf();
  if (valueOf != null && valueOf !== value) {
    return Buffer2.from(valueOf, encodingOrOffset, length);
  }
  const b = fromObject(value);
  if (b) return b;
  if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
    return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
  }
  throw new TypeError(
    "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
  );
}
Buffer2.from = function(value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length);
};
Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
Object.setPrototypeOf(Buffer2, Uint8Array);
function assertSize(size) {
  if (typeof size !== "number") {
    throw new TypeError('"size" argument must be of type number');
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"');
  }
}
function alloc(size, fill2, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(size);
  }
  if (fill2 !== void 0) {
    return typeof encoding === "string" ? createBuffer(size).fill(fill2, encoding) : createBuffer(size).fill(fill2);
  }
  return createBuffer(size);
}
Buffer2.alloc = function(size, fill2, encoding) {
  return alloc(size, fill2, encoding);
};
function allocUnsafe(size) {
  assertSize(size);
  return createBuffer(size < 0 ? 0 : checked(size) | 0);
}
Buffer2.allocUnsafe = function(size) {
  return allocUnsafe(size);
};
Buffer2.allocUnsafeSlow = function(size) {
  return allocUnsafe(size);
};
function fromString(string, encoding) {
  if (typeof encoding !== "string" || encoding === "") {
    encoding = "utf8";
  }
  if (!Buffer2.isEncoding(encoding)) {
    throw new TypeError("Unknown encoding: " + encoding);
  }
  const length = byteLength(string, encoding) | 0;
  let buf = createBuffer(length);
  const actual = buf.write(string, encoding);
  if (actual !== length) {
    buf = buf.slice(0, actual);
  }
  return buf;
}
function fromArrayLike(array) {
  const length = array.length < 0 ? 0 : checked(array.length) | 0;
  const buf = createBuffer(length);
  for (let i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255;
  }
  return buf;
}
function fromArrayView(arrayView) {
  if (arrayView instanceof Uint8Array) {
    const copy2 = new Uint8Array(arrayView);
    return fromArrayBuffer(copy2.buffer, copy2.byteOffset, copy2.byteLength);
  }
  return fromArrayLike(arrayView);
}
function fromArrayBuffer(array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds');
  }
  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds');
  }
  let buf;
  if (byteOffset === void 0 && length === void 0) {
    buf = new Uint8Array(array);
  } else if (length === void 0) {
    buf = new Uint8Array(array, byteOffset);
  } else {
    buf = new Uint8Array(array, byteOffset, length);
  }
  Object.setPrototypeOf(buf, Buffer2.prototype);
  return buf;
}
function fromObject(obj) {
  if (Buffer2.isBuffer(obj)) {
    const len = checked(obj.length) | 0;
    const buf = createBuffer(len);
    if (buf.length === 0) {
      return buf;
    }
    obj.copy(buf, 0, 0, len);
    return buf;
  }
  if (obj.length !== void 0) {
    if (typeof obj.length !== "number" || Number.isNaN(obj.length)) {
      return createBuffer(0);
    }
    return fromArrayLike(obj);
  }
  if (obj.type === "Buffer" && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data);
  }
}
function checked(length) {
  if (length >= K_MAX_LENGTH) {
    throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
  }
  return length | 0;
}
Buffer2.isBuffer = function isBuffer(b) {
  return b != null && b._isBuffer === true && b !== Buffer2.prototype;
};
Buffer2.compare = function compare(a, b) {
  if (a instanceof Uint8Array) a = Buffer2.from(a, a.offset, a.byteLength);
  if (b instanceof Uint8Array) b = Buffer2.from(b, b.offset, b.byteLength);
  if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    );
  }
  if (a === b) return 0;
  let x = a.length;
  let y = b.length;
  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};
Buffer2.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case "hex":
    case "utf8":
    case "utf-8":
    case "ascii":
    case "latin1":
    case "binary":
    case "base64":
    case "ucs2":
    case "ucs-2":
    case "utf16le":
    case "utf-16le":
      return true;
    default:
      return false;
  }
};
Buffer2.concat = function concat(list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers');
  }
  if (list.length === 0) {
    return Buffer2.alloc(0);
  }
  let i;
  if (length === void 0) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }
  const buffer = Buffer2.allocUnsafe(length);
  let pos = 0;
  for (i = 0; i < list.length; ++i) {
    let buf = list[i];
    if (buf instanceof Uint8Array) {
      if (pos + buf.length > buffer.length) {
        if (!Buffer2.isBuffer(buf)) {
          buf = Buffer2.from(buf.buffer, buf.byteOffset, buf.byteLength);
        }
        buf.copy(buffer, pos);
      } else {
        Uint8Array.prototype.set.call(
          buffer,
          buf,
          pos
        );
      }
    } else if (!Buffer2.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    } else {
      buf.copy(buffer, pos);
    }
    pos += buf.length;
  }
  return buffer;
};
function byteLength(string, encoding) {
  if (Buffer2.isBuffer(string)) {
    return string.length;
  }
  if (ArrayBuffer.isView(string) || string instanceof ArrayBuffer) {
    return string.byteLength;
  }
  if (typeof string !== "string") {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
    );
  }
  const len = string.length;
  const mustMatch = arguments.length > 2 && arguments[2] === true;
  if (!mustMatch && len === 0) return 0;
  let loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "ascii":
      case "latin1":
      case "binary":
        return len;
      case "utf8":
      case "utf-8":
        return utf8ToBytes(string).length;
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return len * 2;
      case "hex":
        return len >>> 1;
      case "base64":
        return base64ToBytes(string).length;
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length;
        }
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer2.byteLength = byteLength;
function slowToString(encoding, start, end) {
  let loweredCase = false;
  if (start === void 0 || start < 0) {
    start = 0;
  }
  if (start > this.length) {
    return "";
  }
  if (end === void 0 || end > this.length) {
    end = this.length;
  }
  if (end <= 0) {
    return "";
  }
  end >>>= 0;
  start >>>= 0;
  if (end <= start) {
    return "";
  }
  if (!encoding) encoding = "utf8";
  while (true) {
    switch (encoding) {
      case "hex":
        return hexSlice(this, start, end);
      case "utf8":
      case "utf-8":
        return utf8Slice(this, start, end);
      case "ascii":
        return asciiSlice(this, start, end);
      case "latin1":
      case "binary":
        return latin1Slice(this, start, end);
      case "base64":
        return base64Slice(this, start, end);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return utf16leSlice(this, start, end);
      default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = (encoding + "").toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer2.prototype._isBuffer = true;
function swap(b, n, m2) {
  const i = b[n];
  b[n] = b[m2];
  b[m2] = i;
}
Buffer2.prototype.swap16 = function swap16() {
  const len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 16-bits");
  }
  for (let i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this;
};
Buffer2.prototype.swap32 = function swap32() {
  const len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 32-bits");
  }
  for (let i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this;
};
Buffer2.prototype.swap64 = function swap64() {
  const len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError("Buffer size must be a multiple of 64-bits");
  }
  for (let i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this;
};
Buffer2.prototype.toString = function toString() {
  const length = this.length;
  if (length === 0) return "";
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};
Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
Buffer2.prototype.equals = function equals(b) {
  if (!Buffer2.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
  if (this === b) return true;
  return Buffer2.compare(this, b) === 0;
};
Buffer2.prototype.inspect = function inspect() {
  let str = "";
  const max = config.INSPECT_MAX_BYTES;
  str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
  if (this.length > max) str += " ... ";
  return "<Buffer " + str + ">";
};
Buffer2.prototype[Symbol.for("nodejs.util.inspect.custom")] = Buffer2.prototype.inspect;
Buffer2.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
  if (target instanceof Uint8Array) {
    target = Buffer2.from(target, target.offset, target.byteLength);
  }
  if (!Buffer2.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
    );
  }
  if (start === void 0) {
    start = 0;
  }
  if (end === void 0) {
    end = target ? target.length : 0;
  }
  if (thisStart === void 0) {
    thisStart = 0;
  }
  if (thisEnd === void 0) {
    thisEnd = this.length;
  }
  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError("out of range index");
  }
  if (thisStart >= thisEnd && start >= end) {
    return 0;
  }
  if (thisStart >= thisEnd) {
    return -1;
  }
  if (start >= end) {
    return 1;
  }
  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;
  if (this === target) return 0;
  let x = thisEnd - thisStart;
  let y = end - start;
  const len = Math.min(x, y);
  const thisCopy = this.slice(thisStart, thisEnd);
  const targetCopy = target.slice(start, end);
  for (let i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break;
    }
  }
  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};
function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
  if (buffer.length === 0) return -1;
  if (typeof byteOffset === "string") {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 2147483647) {
    byteOffset = 2147483647;
  } else if (byteOffset < -2147483648) {
    byteOffset = -2147483648;
  }
  byteOffset = +byteOffset;
  if (Number.isNaN(byteOffset)) {
    byteOffset = dir ? 0 : buffer.length - 1;
  }
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1;
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1;
  }
  if (typeof val === "string") {
    val = Buffer2.from(val, encoding);
  }
  if (Buffer2.isBuffer(val)) {
    if (val.length === 0) {
      return -1;
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
  } else if (typeof val === "number") {
    val = val & 255;
    if (typeof Uint8Array.prototype.indexOf === "function") {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
  }
  throw new TypeError("val must be string, number or Buffer");
}
function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
  let indexSize = 1;
  let arrLength = arr.length;
  let valLength = val.length;
  if (encoding !== void 0) {
    encoding = String(encoding).toLowerCase();
    if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
      if (arr.length < 2 || val.length < 2) {
        return -1;
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }
  function read2(buf, i2) {
    if (indexSize === 1) {
      return buf[i2];
    } else {
      return buf.readUInt16BE(i2 * indexSize);
    }
  }
  let i;
  if (dir) {
    let foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read2(arr, i) === read2(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      let found = true;
      for (let j = 0; j < valLength; j++) {
        if (read2(arr, i + j) !== read2(val, j)) {
          found = false;
          break;
        }
      }
      if (found) return i;
    }
  }
  return -1;
}
Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1;
};
Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  const remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }
  const strLen = string.length;
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  let i;
  for (i = 0; i < length; ++i) {
    const parsed = parseInt(string.substr(i * 2, 2), 16);
    if (Number.isNaN(parsed)) return i;
    buf[offset + i] = parsed;
  }
  return i;
}
function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}
function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}
function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
Buffer2.prototype.write = function write2(string, offset, length, encoding) {
  if (offset === void 0) {
    encoding = "utf8";
    length = this.length;
    offset = 0;
  } else if (length === void 0 && typeof offset === "string") {
    encoding = offset;
    length = this.length;
    offset = 0;
  } else if (isFinite(offset)) {
    offset = offset >>> 0;
    if (isFinite(length)) {
      length = length >>> 0;
      if (encoding === void 0) encoding = "utf8";
    } else {
      encoding = length;
      length = void 0;
    }
  } else {
    throw new Error(
      "Buffer.write(string, encoding, offset[, length]) is no longer supported"
    );
  }
  const remaining = this.length - offset;
  if (length === void 0 || length > remaining) length = remaining;
  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError("Attempt to write outside buffer bounds");
  }
  if (!encoding) encoding = "utf8";
  let loweredCase = false;
  for (; ; ) {
    switch (encoding) {
      case "hex":
        return hexWrite(this, string, offset, length);
      case "utf8":
      case "utf-8":
        return utf8Write(this, string, offset, length);
      case "ascii":
      case "latin1":
      case "binary":
        return asciiWrite(this, string, offset, length);
      case "base64":
        return base64Write(this, string, offset, length);
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return ucs2Write(this, string, offset, length);
      default:
        if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
        encoding = ("" + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};
Buffer2.prototype.toJSON = function toJSON() {
  return {
    type: "Buffer",
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};
function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf);
  } else {
    return fromByteArray(buf.slice(start, end));
  }
}
function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  const res = [];
  let i = start;
  while (i < end) {
    const firstByte = buf[i];
    let codePoint = null;
    let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
    if (i + bytesPerSequence <= end) {
      let secondByte, thirdByte, fourthByte, tempCodePoint;
      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 128) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 192) === 128) {
            tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
            if (tempCodePoint > 127) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
            if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
            tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
            if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
              codePoint = tempCodePoint;
            }
          }
      }
    }
    if (codePoint === null) {
      codePoint = 65533;
      bytesPerSequence = 1;
    } else if (codePoint > 65535) {
      codePoint -= 65536;
      res.push(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    res.push(codePoint);
    i += bytesPerSequence;
  }
  return decodeCodePointsArray(res);
}
var MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
  const len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints);
  }
  let res = "";
  let i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res;
}
function asciiSlice(buf, start, end) {
  let ret = "";
  end = Math.min(buf.length, end);
  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 127);
  }
  return ret;
}
function latin1Slice(buf, start, end) {
  let ret = "";
  end = Math.min(buf.length, end);
  for (let i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}
function hexSlice(buf, start, end) {
  const len = buf.length;
  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;
  let out = "";
  for (let i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]];
  }
  return out;
}
function utf16leSlice(buf, start, end) {
  const bytes = buf.slice(start, end);
  let res = "";
  for (let i = 0; i < bytes.length - 1; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}
Buffer2.prototype.slice = function slice(start, end) {
  const len = this.length;
  start = ~~start;
  end = end === void 0 ? len : ~~end;
  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }
  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }
  if (end < start) end = start;
  const newBuf = this.subarray(start, end);
  Object.setPrototypeOf(newBuf, Buffer2.prototype);
  return newBuf;
};
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
  if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
}
Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
  offset = offset >>> 0;
  byteLength2 = byteLength2 >>> 0;
  if (!noAssert) checkOffset(offset, byteLength2, this.length);
  let val = this[offset];
  let mul = 1;
  let i = 0;
  while (++i < byteLength2 && (mul *= 256)) {
    val += this[offset + i] * mul;
  }
  return val;
};
Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
  offset = offset >>> 0;
  byteLength2 = byteLength2 >>> 0;
  if (!noAssert) {
    checkOffset(offset, byteLength2, this.length);
  }
  let val = this[offset + --byteLength2];
  let mul = 1;
  while (byteLength2 > 0 && (mul *= 256)) {
    val += this[offset + --byteLength2] * mul;
  }
  return val;
};
Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};
Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};
Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};
Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
};
Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
Buffer2.prototype.readBigUInt64LE = function readBigUInt64LE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, "offset");
  const first = this[offset];
  const last = this[offset + 7];
  if (first === void 0 || last === void 0) {
    boundsError(offset, this.length - 8);
  }
  const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
  const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
};
Buffer2.prototype.readBigUInt64BE = function readBigUInt64BE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, "offset");
  const first = this[offset];
  const last = this[offset + 7];
  if (first === void 0 || last === void 0) {
    boundsError(offset, this.length - 8);
  }
  const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
  const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
  return (BigInt(hi) << BigInt(32)) + BigInt(lo);
};
Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
  offset = offset >>> 0;
  byteLength2 = byteLength2 >>> 0;
  if (!noAssert) checkOffset(offset, byteLength2, this.length);
  let val = this[offset];
  let mul = 1;
  let i = 0;
  while (++i < byteLength2 && (mul *= 256)) {
    val += this[offset + i] * mul;
  }
  mul *= 128;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
  return val;
};
Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
  offset = offset >>> 0;
  byteLength2 = byteLength2 >>> 0;
  if (!noAssert) checkOffset(offset, byteLength2, this.length);
  let i = byteLength2;
  let mul = 1;
  let val = this[offset + --i];
  while (i > 0 && (mul *= 256)) {
    val += this[offset + --i] * mul;
  }
  mul *= 128;
  if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
  return val;
};
Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 128)) return this[offset];
  return (255 - this[offset] + 1) * -1;
};
Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  const val = this[offset] | this[offset + 1] << 8;
  return val & 32768 ? val | 4294901760 : val;
};
Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 2, this.length);
  const val = this[offset + 1] | this[offset] << 8;
  return val & 32768 ? val | 4294901760 : val;
};
Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
Buffer2.prototype.readBigInt64LE = function readBigInt64LE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, "offset");
  const first = this[offset];
  const last = this[offset + 7];
  if (first === void 0 || last === void 0) {
    boundsError(offset, this.length - 8);
  }
  const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
  return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
};
Buffer2.prototype.readBigInt64BE = function readBigInt64BE(offset) {
  offset = offset >>> 0;
  validateNumber(offset, "offset");
  const first = this[offset];
  const last = this[offset + 7];
  if (first === void 0 || last === void 0) {
    boundsError(offset, this.length - 8);
  }
  const val = (first << 24) + // Overflow
  this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
  return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
};
Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4);
};
Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4);
};
Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8);
};
Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  offset = offset >>> 0;
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8);
};
function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
  if (offset + ext > buf.length) throw new RangeError("Index out of range");
}
Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength2 = byteLength2 >>> 0;
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
    checkInt(this, value, offset, byteLength2, maxBytes, 0);
  }
  let mul = 1;
  let i = 0;
  this[offset] = value & 255;
  while (++i < byteLength2 && (mul *= 256)) {
    this[offset + i] = value / mul & 255;
  }
  return offset + byteLength2;
};
Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset >>> 0;
  byteLength2 = byteLength2 >>> 0;
  if (!noAssert) {
    const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
    checkInt(this, value, offset, byteLength2, maxBytes, 0);
  }
  let i = byteLength2 - 1;
  let mul = 1;
  this[offset + i] = value & 255;
  while (--i >= 0 && (mul *= 256)) {
    this[offset + i] = value / mul & 255;
  }
  return offset + byteLength2;
};
Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
  this[offset] = value & 255;
  return offset + 1;
};
Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
  this[offset] = value & 255;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};
Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 255;
  return offset + 2;
};
Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
  this[offset + 3] = value >>> 24;
  this[offset + 2] = value >>> 16;
  this[offset + 1] = value >>> 8;
  this[offset] = value & 255;
  return offset + 4;
};
Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 255;
  return offset + 4;
};
function wrtBigUInt64LE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  let lo = Number(value & BigInt(4294967295));
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  let hi = Number(value >> BigInt(32) & BigInt(4294967295));
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  return offset;
}
function wrtBigUInt64BE(buf, value, offset, min, max) {
  checkIntBI(value, min, max, buf, offset, 7);
  let lo = Number(value & BigInt(4294967295));
  buf[offset + 7] = lo;
  lo = lo >> 8;
  buf[offset + 6] = lo;
  lo = lo >> 8;
  buf[offset + 5] = lo;
  lo = lo >> 8;
  buf[offset + 4] = lo;
  let hi = Number(value >> BigInt(32) & BigInt(4294967295));
  buf[offset + 3] = hi;
  hi = hi >> 8;
  buf[offset + 2] = hi;
  hi = hi >> 8;
  buf[offset + 1] = hi;
  hi = hi >> 8;
  buf[offset] = hi;
  return offset + 8;
}
Buffer2.prototype.writeBigUInt64LE = function writeBigUInt64LE(value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
};
Buffer2.prototype.writeBigUInt64BE = function writeBigUInt64BE(value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
};
Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    const limit = Math.pow(2, 8 * byteLength2 - 1);
    checkInt(this, value, offset, byteLength2, limit - 1, -limit);
  }
  let i = 0;
  let mul = 1;
  let sub = 0;
  this[offset] = value & 255;
  while (++i < byteLength2 && (mul *= 256)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 255;
  }
  return offset + byteLength2;
};
Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    const limit = Math.pow(2, 8 * byteLength2 - 1);
    checkInt(this, value, offset, byteLength2, limit - 1, -limit);
  }
  let i = byteLength2 - 1;
  let mul = 1;
  let sub = 0;
  this[offset + i] = value & 255;
  while (--i >= 0 && (mul *= 256)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = (value / mul >> 0) - sub & 255;
  }
  return offset + byteLength2;
};
Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
  if (value < 0) value = 255 + value + 1;
  this[offset] = value & 255;
  return offset + 1;
};
Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
  this[offset] = value & 255;
  this[offset + 1] = value >>> 8;
  return offset + 2;
};
Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
  this[offset] = value >>> 8;
  this[offset + 1] = value & 255;
  return offset + 2;
};
Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
  this[offset] = value & 255;
  this[offset + 1] = value >>> 8;
  this[offset + 2] = value >>> 16;
  this[offset + 3] = value >>> 24;
  return offset + 4;
};
Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
  if (value < 0) value = 4294967295 + value + 1;
  this[offset] = value >>> 24;
  this[offset + 1] = value >>> 16;
  this[offset + 2] = value >>> 8;
  this[offset + 3] = value & 255;
  return offset + 4;
};
Buffer2.prototype.writeBigInt64LE = function writeBigInt64LE(value, offset = 0) {
  return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
};
Buffer2.prototype.writeBigInt64BE = function writeBigInt64BE(value, offset = 0) {
  return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
};
function checkIEEE754(buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError("Index out of range");
  if (offset < 0) throw new RangeError("Index out of range");
}
function writeFloat(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}
Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};
Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};
function writeDouble(buf, value, offset, littleEndian, noAssert) {
  value = +value;
  offset = offset >>> 0;
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}
Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};
Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};
Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
  if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;
  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0;
  if (targetStart < 0) {
    throw new RangeError("targetStart out of bounds");
  }
  if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
  if (end < 0) throw new RangeError("sourceEnd out of bounds");
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }
  const len = end - start;
  if (this === target) {
    this.copyWithin(targetStart, start, end);
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    );
  }
  return len;
};
Buffer2.prototype.fill = function fill(val, start, end, encoding) {
  if (typeof val === "string") {
    if (typeof start === "string") {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === "string") {
      encoding = end;
      end = this.length;
    }
    if (encoding !== void 0 && typeof encoding !== "string") {
      throw new TypeError("encoding must be a string");
    }
    if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
    if (val.length === 1) {
      const code4 = val.charCodeAt(0);
      if (encoding === "utf8" && code4 < 128 || encoding === "latin1") {
        val = code4;
      }
    }
  } else if (typeof val === "number") {
    val = val & 255;
  } else if (typeof val === "boolean") {
    val = Number(val);
  }
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError("Out of range index");
  }
  if (end <= start) {
    return this;
  }
  start = start >>> 0;
  end = end === void 0 ? this.length : end >>> 0;
  if (!val) val = 0;
  let i;
  if (typeof val === "number") {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
    const len = bytes.length;
    if (len === 0) {
      throw new TypeError('The value "' + val + '" is invalid for argument "value"');
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }
  return this;
};
var errors = {};
function E(sym, getMessage, Base) {
  errors[sym] = class NodeError extends Base {
    constructor() {
      super();
      Object.defineProperty(this, "message", {
        value: getMessage.apply(this, arguments),
        writable: true,
        configurable: true
      });
      this.name = `${this.name} [${sym}]`;
      this.stack;
      delete this.name;
    }
    get code() {
      return sym;
    }
    set code(value) {
      Object.defineProperty(this, "code", {
        configurable: true,
        enumerable: true,
        value,
        writable: true
      });
    }
    toString() {
      return `${this.name} [${sym}]: ${this.message}`;
    }
  };
}
E(
  "ERR_BUFFER_OUT_OF_BOUNDS",
  function(name) {
    if (name) {
      return `${name} is outside of buffer bounds`;
    }
    return "Attempt to access memory outside buffer bounds";
  },
  RangeError
);
E(
  "ERR_INVALID_ARG_TYPE",
  function(name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
  },
  TypeError
);
E(
  "ERR_OUT_OF_RANGE",
  function(str, range, input) {
    let msg = `The value of "${str}" is out of range.`;
    let received = input;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === "bigint") {
      received = String(input);
      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
        received = addNumericalSeparator(received);
      }
      received += "n";
    }
    msg += ` It must be ${range}. Received ${received}`;
    return msg;
  },
  RangeError
);
function addNumericalSeparator(val) {
  let res = "";
  let i = val.length;
  const start = val[0] === "-" ? 1 : 0;
  for (; i >= start + 4; i -= 3) {
    res = `_${val.slice(i - 3, i)}${res}`;
  }
  return `${val.slice(0, i)}${res}`;
}
function checkBounds(buf, offset, byteLength2) {
  validateNumber(offset, "offset");
  if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
    boundsError(offset, buf.length - (byteLength2 + 1));
  }
}
function checkIntBI(value, min, max, buf, offset, byteLength2) {
  if (value > max || value < min) {
    const n = typeof min === "bigint" ? "n" : "";
    let range;
    if (byteLength2 > 3) {
      if (min === 0 || min === BigInt(0)) {
        range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
      } else {
        range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
      }
    } else {
      range = `>= ${min}${n} and <= ${max}${n}`;
    }
    throw new errors.ERR_OUT_OF_RANGE("value", range, value);
  }
  checkBounds(buf, offset, byteLength2);
}
function validateNumber(value, name) {
  if (typeof value !== "number") {
    throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
  }
}
function boundsError(value, length, type) {
  if (Math.floor(value) !== value) {
    validateNumber(value, type);
    throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
  }
  if (length < 0) {
    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
  }
  throw new errors.ERR_OUT_OF_RANGE(
    type || "offset",
    `>= ${type ? 1 : 0} and <= ${length}`,
    value
  );
}
var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function base64clean(str) {
  str = str.split("=")[0];
  str = str.trim().replace(INVALID_BASE64_RE, "");
  if (str.length < 2) return "";
  while (str.length % 4 !== 0) {
    str = str + "=";
  }
  return str;
}
function utf8ToBytes(string, units) {
  units = units || Infinity;
  let codePoint;
  const length = string.length;
  let leadSurrogate = null;
  const bytes = [];
  for (let i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);
    if (codePoint > 55295 && codePoint < 57344) {
      if (!leadSurrogate) {
        if (codePoint > 56319) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
          continue;
        } else if (i + 1 === length) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
          continue;
        }
        leadSurrogate = codePoint;
        continue;
      }
      if (codePoint < 56320) {
        if ((units -= 3) > -1) bytes.push(239, 191, 189);
        leadSurrogate = codePoint;
        continue;
      }
      codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
    } else if (leadSurrogate) {
      if ((units -= 3) > -1) bytes.push(239, 191, 189);
    }
    leadSurrogate = null;
    if (codePoint < 128) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 2048) {
      if ((units -= 2) < 0) break;
      bytes.push(
        codePoint >> 6 | 192,
        codePoint & 63 | 128
      );
    } else if (codePoint < 65536) {
      if ((units -= 3) < 0) break;
      bytes.push(
        codePoint >> 12 | 224,
        codePoint >> 6 & 63 | 128,
        codePoint & 63 | 128
      );
    } else if (codePoint < 1114112) {
      if ((units -= 4) < 0) break;
      bytes.push(
        codePoint >> 18 | 240,
        codePoint >> 12 & 63 | 128,
        codePoint >> 6 & 63 | 128,
        codePoint & 63 | 128
      );
    } else {
      throw new Error("Invalid code point");
    }
  }
  return bytes;
}
function asciiToBytes(str) {
  const byteArray = [];
  for (let i = 0; i < str.length; ++i) {
    byteArray.push(str.charCodeAt(i) & 255);
  }
  return byteArray;
}
function utf16leToBytes(str, units) {
  let c, hi, lo;
  const byteArray = [];
  for (let i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break;
    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }
  return byteArray;
}
function base64ToBytes(str) {
  return toByteArray(base64clean(str));
}
function blitBuffer(src, dst, offset, length) {
  let i;
  for (i = 0; i < length; ++i) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}
var hexSliceLookupTable = function() {
  const alphabet = "0123456789abcdef";
  const table = new Array(256);
  for (let i = 0; i < 16; ++i) {
    const i16 = i * 16;
    for (let j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j];
    }
  }
  return table;
}();

// node_modules/frida-il2cpp-bridge/dist/index.js
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.application = {
    /**
     * Gets the data path name of the current application, e.g.
     * `/data/emulated/0/Android/data/com.example.application/files`
     * on Android.
     *
     * **This information is not guaranteed to exist.**
     *
     * ```ts
     * Il2Cpp.perform(() => {
     *     // prints /data/emulated/0/Android/data/com.example.application/files
     *     console.log(Il2Cpp.application.dataPath);
     * });
     * ```
     */
    get dataPath() {
      return unityEngineCall("get_persistentDataPath");
    },
    /**
     * Gets the identifier name of the current application, e.g.
     * `com.example.application` on Android.
     *
     * In case the identifier cannot be retrieved, the main module name is
     * returned instead, which typically is the process name.
     *
     * ```ts
     * Il2Cpp.perform(() => {
     *     // prints com.example.application
     *     console.log(Il2Cpp.application.identifier);
     * });
     * ```
     */
    get identifier() {
      return unityEngineCall("get_identifier") ?? unityEngineCall("get_bundleIdentifier") ?? Process.mainModule.name;
    },
    /**
     * Gets the version name of the current application, e.g. `4.12.8`.
     *
     * In case the version cannot be retrieved, an hash of the IL2CPP
     * module is returned instead.
     *
     * ```ts
     * Il2Cpp.perform(() => {
     *     // prints 4.12.8
     *     console.log(Il2Cpp.application.version);
     * });
     * ```
     */
    get version() {
      return unityEngineCall("get_version") ?? exportsHash(Il2Cpp3.module).toString(16);
    }
  };
  getter(Il2Cpp3, "unityVersion", () => {
    try {
      const unityVersion = Il2Cpp3.$config.unityVersion ?? unityEngineCall("get_unityVersion");
      if (unityVersion != null) {
        return unityVersion;
      }
    } catch (_) {
    }
    const searchPattern = "69 6c 32 63 70 70";
    for (const range of Il2Cpp3.module.enumerateRanges("r--").concat(Process.getRangeByAddress(Il2Cpp3.module.base))) {
      for (let { address } of Memory.scanSync(range.base, range.size, searchPattern)) {
        while (address.readU8() != 0) {
          address = address.sub(1);
        }
        const match = UnityVersion.find(address.add(1).readCString());
        if (match != void 0) {
          return match;
        }
      }
    }
    raise("couldn't determine the Unity version, please specify it manually");
  }, lazy);
  getter(Il2Cpp3, "unityVersionIsBelow201830", () => {
    return UnityVersion.lt(Il2Cpp3.unityVersion, "2018.3.0");
  }, lazy);
  getter(Il2Cpp3, "unityVersionIsBelow202120", () => {
    return UnityVersion.lt(Il2Cpp3.unityVersion, "2021.2.0");
  }, lazy);
  function unityEngineCall(method2) {
    const handle2 = Il2Cpp3.exports.resolveInternalCall(Memory.allocUtf8String("UnityEngine.Application::" + method2));
    const nativeFunction = new NativeFunction(handle2, "pointer", []);
    return nativeFunction.isNull() ? null : new Il2Cpp3.String(nativeFunction()).asNullable()?.content ?? null;
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function boxed(value, type) {
    const mapping = {
      int8: "System.SByte",
      uint8: "System.Byte",
      int16: "System.Int16",
      uint16: "System.UInt16",
      int32: "System.Int32",
      uint32: "System.UInt32",
      int64: "System.Int64",
      uint64: "System.UInt64",
      char: "System.Char",
      intptr: "System.IntPtr",
      uintptr: "System.UIntPtr"
    };
    const className = typeof value == "boolean" ? "System.Boolean" : typeof value == "number" ? mapping[type ?? "int32"] : value instanceof Int64 ? "System.Int64" : value instanceof UInt64 ? "System.UInt64" : value instanceof NativePointer ? mapping[type ?? "intptr"] : raise(`Cannot create boxed primitive using value of type '${typeof value}'`);
    const object = Il2Cpp3.corlib.class(className ?? raise(`Unknown primitive type name '${type}'`)).alloc();
    (object.tryField("m_value") ?? object.tryField("_pointer") ?? raise(`Could not find primitive field in class '${className}'`)).value = value;
    return object;
  }
  Il2Cpp3.boxed = boxed;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.$config = {
    moduleName: void 0,
    unityVersion: void 0,
    exports: void 0
  };
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function dump(fileName, path) {
    fileName = fileName ?? `${Il2Cpp3.application.identifier}_${Il2Cpp3.application.version}.cs`;
    path = path ?? Il2Cpp3.application.dataPath ?? Process.getCurrentDir();
    createDirectoryRecursively(path);
    const destination = `${path}/${fileName}`;
    const file = new File(destination, "w");
    for (const assembly of Il2Cpp3.domain.assemblies) {
      inform(`dumping ${assembly.name}...`);
      for (const klass of assembly.image.classes) {
        file.write(`${klass}

`);
      }
    }
    file.flush();
    file.close();
    ok(`dump saved to ${destination}`);
    showDeprecationNotice();
  }
  Il2Cpp3.dump = dump;
  function dumpTree(path, ignoreAlreadyExistingDirectory = false) {
    path = path ?? `${Il2Cpp3.application.dataPath ?? Process.getCurrentDir()}/${Il2Cpp3.application.identifier}_${Il2Cpp3.application.version}`;
    if (!ignoreAlreadyExistingDirectory && directoryExists(path)) {
      raise(`directory ${path} already exists - pass ignoreAlreadyExistingDirectory = true to skip this check`);
    }
    for (const assembly of Il2Cpp3.domain.assemblies) {
      inform(`dumping ${assembly.name}...`);
      const destination = `${path}/${assembly.name.replaceAll(".", "/")}.cs`;
      createDirectoryRecursively(destination.substring(0, destination.lastIndexOf("/")));
      const file = new File(destination, "w");
      for (const klass of assembly.image.classes) {
        file.write(`${klass}

`);
      }
      file.flush();
      file.close();
    }
    ok(`dump saved to ${path}`);
    showDeprecationNotice();
  }
  Il2Cpp3.dumpTree = dumpTree;
  function directoryExists(path) {
    return Il2Cpp3.corlib.class("System.IO.Directory").method("Exists").invoke(Il2Cpp3.string(path));
  }
  function createDirectoryRecursively(path) {
    Il2Cpp3.corlib.class("System.IO.Directory").method("CreateDirectory").invoke(Il2Cpp3.string(path));
  }
  function showDeprecationNotice() {
    warn("this api will be removed in a future release, please use `npx frida-il2cpp-bridge dump` instead");
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function installExceptionListener(targetThread = "current") {
    const currentThread = Il2Cpp3.exports.threadGetCurrent();
    return Interceptor.attach(Il2Cpp3.module.getExportByName("__cxa_throw"), function(args) {
      if (targetThread == "current" && !Il2Cpp3.exports.threadGetCurrent().equals(currentThread)) {
        return;
      }
      inform(new Il2Cpp3.Object(args[0].readPointer()));
    });
  }
  Il2Cpp3.installExceptionListener = installExceptionListener;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.exports = {
    get alloc() {
      return r("il2cpp_alloc", "pointer", ["size_t"]);
    },
    get arrayGetLength() {
      return r("il2cpp_array_length", "uint32", ["pointer"]);
    },
    get arrayNew() {
      return r("il2cpp_array_new", "pointer", ["pointer", "uint32"]);
    },
    get assemblyGetImage() {
      return r("il2cpp_assembly_get_image", "pointer", ["pointer"]);
    },
    get classForEach() {
      return r("il2cpp_class_for_each", "void", ["pointer", "pointer"]);
    },
    get classFromName() {
      return r("il2cpp_class_from_name", "pointer", ["pointer", "pointer", "pointer"]);
    },
    get classFromObject() {
      return r("il2cpp_class_from_system_type", "pointer", ["pointer"]);
    },
    get classGetArrayClass() {
      return r("il2cpp_array_class_get", "pointer", ["pointer", "uint32"]);
    },
    get classGetArrayElementSize() {
      return r("il2cpp_class_array_element_size", "int", ["pointer"]);
    },
    get classGetAssemblyName() {
      return r("il2cpp_class_get_assemblyname", "pointer", ["pointer"]);
    },
    get classGetBaseType() {
      return r("il2cpp_class_enum_basetype", "pointer", ["pointer"]);
    },
    get classGetDeclaringType() {
      return r("il2cpp_class_get_declaring_type", "pointer", ["pointer"]);
    },
    get classGetElementClass() {
      return r("il2cpp_class_get_element_class", "pointer", ["pointer"]);
    },
    get classGetFieldFromName() {
      return r("il2cpp_class_get_field_from_name", "pointer", ["pointer", "pointer"]);
    },
    get classGetFields() {
      return r("il2cpp_class_get_fields", "pointer", ["pointer", "pointer"]);
    },
    get classGetFlags() {
      return r("il2cpp_class_get_flags", "int", ["pointer"]);
    },
    get classGetImage() {
      return r("il2cpp_class_get_image", "pointer", ["pointer"]);
    },
    get classGetInstanceSize() {
      return r("il2cpp_class_instance_size", "int32", ["pointer"]);
    },
    get classGetInterfaces() {
      return r("il2cpp_class_get_interfaces", "pointer", ["pointer", "pointer"]);
    },
    get classGetMethodFromName() {
      return r("il2cpp_class_get_method_from_name", "pointer", ["pointer", "pointer", "int"]);
    },
    get classGetMethods() {
      return r("il2cpp_class_get_methods", "pointer", ["pointer", "pointer"]);
    },
    get classGetName() {
      return r("il2cpp_class_get_name", "pointer", ["pointer"]);
    },
    get classGetNamespace() {
      return r("il2cpp_class_get_namespace", "pointer", ["pointer"]);
    },
    get classGetNestedClasses() {
      return r("il2cpp_class_get_nested_types", "pointer", ["pointer", "pointer"]);
    },
    get classGetParent() {
      return r("il2cpp_class_get_parent", "pointer", ["pointer"]);
    },
    get classGetStaticFieldData() {
      return r("il2cpp_class_get_static_field_data", "pointer", ["pointer"]);
    },
    get classGetValueTypeSize() {
      return r("il2cpp_class_value_size", "int32", ["pointer", "pointer"]);
    },
    get classGetType() {
      return r("il2cpp_class_get_type", "pointer", ["pointer"]);
    },
    get classHasReferences() {
      return r("il2cpp_class_has_references", "bool", ["pointer"]);
    },
    get classInitialize() {
      return r("il2cpp_runtime_class_init", "void", ["pointer"]);
    },
    get classIsAbstract() {
      return r("il2cpp_class_is_abstract", "bool", ["pointer"]);
    },
    get classIsAssignableFrom() {
      return r("il2cpp_class_is_assignable_from", "bool", ["pointer", "pointer"]);
    },
    get classIsBlittable() {
      return r("il2cpp_class_is_blittable", "bool", ["pointer"]);
    },
    get classIsEnum() {
      return r("il2cpp_class_is_enum", "bool", ["pointer"]);
    },
    get classIsGeneric() {
      return r("il2cpp_class_is_generic", "bool", ["pointer"]);
    },
    get classIsInflated() {
      return r("il2cpp_class_is_inflated", "bool", ["pointer"]);
    },
    get classIsInterface() {
      return r("il2cpp_class_is_interface", "bool", ["pointer"]);
    },
    get classIsSubclassOf() {
      return r("il2cpp_class_is_subclass_of", "bool", ["pointer", "pointer", "bool"]);
    },
    get classIsValueType() {
      return r("il2cpp_class_is_valuetype", "bool", ["pointer"]);
    },
    get domainGetAssemblyFromName() {
      return r("il2cpp_domain_assembly_open", "pointer", ["pointer", "pointer"]);
    },
    get domainGet() {
      return r("il2cpp_domain_get", "pointer", []);
    },
    get domainGetAssemblies() {
      return r("il2cpp_domain_get_assemblies", "pointer", ["pointer", "pointer"]);
    },
    get fieldGetClass() {
      return r("il2cpp_field_get_parent", "pointer", ["pointer"]);
    },
    get fieldGetFlags() {
      return r("il2cpp_field_get_flags", "int", ["pointer"]);
    },
    get fieldGetName() {
      return r("il2cpp_field_get_name", "pointer", ["pointer"]);
    },
    get fieldGetOffset() {
      return r("il2cpp_field_get_offset", "int32", ["pointer"]);
    },
    get fieldGetStaticValue() {
      return r("il2cpp_field_static_get_value", "void", ["pointer", "pointer"]);
    },
    get fieldGetType() {
      return r("il2cpp_field_get_type", "pointer", ["pointer"]);
    },
    get fieldSetStaticValue() {
      return r("il2cpp_field_static_set_value", "void", ["pointer", "pointer"]);
    },
    get free() {
      return r("il2cpp_free", "void", ["pointer"]);
    },
    get gcCollect() {
      return r("il2cpp_gc_collect", "void", ["int"]);
    },
    get gcCollectALittle() {
      return r("il2cpp_gc_collect_a_little", "void", []);
    },
    get gcDisable() {
      return r("il2cpp_gc_disable", "void", []);
    },
    get gcEnable() {
      return r("il2cpp_gc_enable", "void", []);
    },
    get gcGetHeapSize() {
      return r("il2cpp_gc_get_heap_size", "int64", []);
    },
    get gcGetMaxTimeSlice() {
      return r("il2cpp_gc_get_max_time_slice_ns", "int64", []);
    },
    get gcGetUsedSize() {
      return r("il2cpp_gc_get_used_size", "int64", []);
    },
    get gcHandleGetTarget() {
      return r("il2cpp_gchandle_get_target", "pointer", ["uint32"]);
    },
    get gcHandleFree() {
      return r("il2cpp_gchandle_free", "void", ["uint32"]);
    },
    get gcHandleNew() {
      return r("il2cpp_gchandle_new", "uint32", ["pointer", "bool"]);
    },
    get gcHandleNewWeakRef() {
      return r("il2cpp_gchandle_new_weakref", "uint32", ["pointer", "bool"]);
    },
    get gcIsDisabled() {
      return r("il2cpp_gc_is_disabled", "bool", []);
    },
    get gcIsIncremental() {
      return r("il2cpp_gc_is_incremental", "bool", []);
    },
    get gcSetMaxTimeSlice() {
      return r("il2cpp_gc_set_max_time_slice_ns", "void", ["int64"]);
    },
    get gcStartIncrementalCollection() {
      return r("il2cpp_gc_start_incremental_collection", "void", []);
    },
    get gcStartWorld() {
      return r("il2cpp_start_gc_world", "void", []);
    },
    get gcStopWorld() {
      return r("il2cpp_stop_gc_world", "void", []);
    },
    get getCorlib() {
      return r("il2cpp_get_corlib", "pointer", []);
    },
    get imageGetAssembly() {
      return r("il2cpp_image_get_assembly", "pointer", ["pointer"]);
    },
    get imageGetClass() {
      return r("il2cpp_image_get_class", "pointer", ["pointer", "uint"]);
    },
    get imageGetClassCount() {
      return r("il2cpp_image_get_class_count", "uint32", ["pointer"]);
    },
    get imageGetName() {
      return r("il2cpp_image_get_name", "pointer", ["pointer"]);
    },
    get initialize() {
      return r("il2cpp_init", "void", ["pointer"]);
    },
    get livenessAllocateStruct() {
      return r("il2cpp_unity_liveness_allocate_struct", "pointer", ["pointer", "int", "pointer", "pointer", "pointer"]);
    },
    get livenessCalculationBegin() {
      return r("il2cpp_unity_liveness_calculation_begin", "pointer", ["pointer", "int", "pointer", "pointer", "pointer", "pointer"]);
    },
    get livenessCalculationEnd() {
      return r("il2cpp_unity_liveness_calculation_end", "void", ["pointer"]);
    },
    get livenessCalculationFromStatics() {
      return r("il2cpp_unity_liveness_calculation_from_statics", "void", ["pointer"]);
    },
    get livenessFinalize() {
      return r("il2cpp_unity_liveness_finalize", "void", ["pointer"]);
    },
    get livenessFreeStruct() {
      return r("il2cpp_unity_liveness_free_struct", "void", ["pointer"]);
    },
    get memorySnapshotCapture() {
      return r("il2cpp_capture_memory_snapshot", "pointer", []);
    },
    get memorySnapshotFree() {
      return r("il2cpp_free_captured_memory_snapshot", "void", ["pointer"]);
    },
    get memorySnapshotGetClasses() {
      return r("il2cpp_memory_snapshot_get_classes", "pointer", ["pointer", "pointer"]);
    },
    get memorySnapshotGetObjects() {
      return r("il2cpp_memory_snapshot_get_objects", "pointer", ["pointer", "pointer"]);
    },
    get methodGetClass() {
      return r("il2cpp_method_get_class", "pointer", ["pointer"]);
    },
    get methodGetFlags() {
      return r("il2cpp_method_get_flags", "uint32", ["pointer", "pointer"]);
    },
    get methodGetName() {
      return r("il2cpp_method_get_name", "pointer", ["pointer"]);
    },
    get methodGetObject() {
      return r("il2cpp_method_get_object", "pointer", ["pointer", "pointer"]);
    },
    get methodGetParameterCount() {
      return r("il2cpp_method_get_param_count", "uint8", ["pointer"]);
    },
    get methodGetParameterName() {
      return r("il2cpp_method_get_param_name", "pointer", ["pointer", "uint32"]);
    },
    get methodGetParameters() {
      return r("il2cpp_method_get_parameters", "pointer", ["pointer", "pointer"]);
    },
    get methodGetParameterType() {
      return r("il2cpp_method_get_param", "pointer", ["pointer", "uint32"]);
    },
    get methodGetReturnType() {
      return r("il2cpp_method_get_return_type", "pointer", ["pointer"]);
    },
    get methodIsGeneric() {
      return r("il2cpp_method_is_generic", "bool", ["pointer"]);
    },
    get methodIsInflated() {
      return r("il2cpp_method_is_inflated", "bool", ["pointer"]);
    },
    get methodIsInstance() {
      return r("il2cpp_method_is_instance", "bool", ["pointer"]);
    },
    get monitorEnter() {
      return r("il2cpp_monitor_enter", "void", ["pointer"]);
    },
    get monitorExit() {
      return r("il2cpp_monitor_exit", "void", ["pointer"]);
    },
    get monitorPulse() {
      return r("il2cpp_monitor_pulse", "void", ["pointer"]);
    },
    get monitorPulseAll() {
      return r("il2cpp_monitor_pulse_all", "void", ["pointer"]);
    },
    get monitorTryEnter() {
      return r("il2cpp_monitor_try_enter", "bool", ["pointer", "uint32"]);
    },
    get monitorTryWait() {
      return r("il2cpp_monitor_try_wait", "bool", ["pointer", "uint32"]);
    },
    get monitorWait() {
      return r("il2cpp_monitor_wait", "void", ["pointer"]);
    },
    get objectGetClass() {
      return r("il2cpp_object_get_class", "pointer", ["pointer"]);
    },
    get objectGetVirtualMethod() {
      return r("il2cpp_object_get_virtual_method", "pointer", ["pointer", "pointer"]);
    },
    get objectInitialize() {
      return r("il2cpp_runtime_object_init_exception", "void", ["pointer", "pointer"]);
    },
    get objectNew() {
      return r("il2cpp_object_new", "pointer", ["pointer"]);
    },
    get objectGetSize() {
      return r("il2cpp_object_get_size", "uint32", ["pointer"]);
    },
    get objectUnbox() {
      return r("il2cpp_object_unbox", "pointer", ["pointer"]);
    },
    get resolveInternalCall() {
      return r("il2cpp_resolve_icall", "pointer", ["pointer"]);
    },
    get stringGetChars() {
      return r("il2cpp_string_chars", "pointer", ["pointer"]);
    },
    get stringGetLength() {
      return r("il2cpp_string_length", "int32", ["pointer"]);
    },
    get stringNew() {
      return r("il2cpp_string_new", "pointer", ["pointer"]);
    },
    get valueTypeBox() {
      return r("il2cpp_value_box", "pointer", ["pointer", "pointer"]);
    },
    get threadAttach() {
      return r("il2cpp_thread_attach", "pointer", ["pointer"]);
    },
    get threadDetach() {
      return r("il2cpp_thread_detach", "void", ["pointer"]);
    },
    get threadGetAttachedThreads() {
      return r("il2cpp_thread_get_all_attached_threads", "pointer", ["pointer"]);
    },
    get threadGetCurrent() {
      return r("il2cpp_thread_current", "pointer", []);
    },
    get threadIsVm() {
      return r("il2cpp_is_vm_thread", "bool", ["pointer"]);
    },
    get typeEquals() {
      return r("il2cpp_type_equals", "bool", ["pointer", "pointer"]);
    },
    get typeGetClass() {
      return r("il2cpp_class_from_type", "pointer", ["pointer"]);
    },
    get typeGetName() {
      return r("il2cpp_type_get_name", "pointer", ["pointer"]);
    },
    get typeGetObject() {
      return r("il2cpp_type_get_object", "pointer", ["pointer"]);
    },
    get typeGetTypeEnum() {
      return r("il2cpp_type_get_type", "int", ["pointer"]);
    }
  };
  decorate(Il2Cpp3.exports, lazy);
  getter(Il2Cpp3, "memorySnapshotExports", () => new CModule("#include <stdint.h>\n#include <string.h>\n\ntypedef struct Il2CppManagedMemorySnapshot Il2CppManagedMemorySnapshot;\ntypedef struct Il2CppMetadataType Il2CppMetadataType;\n\nstruct Il2CppManagedMemorySnapshot\n{\n  struct Il2CppManagedHeap\n  {\n    uint32_t section_count;\n    void * sections;\n  } heap;\n  struct Il2CppStacks\n  {\n    uint32_t stack_count;\n    void * stacks;\n  } stacks;\n  struct Il2CppMetadataSnapshot\n  {\n    uint32_t type_count;\n    Il2CppMetadataType * types;\n  } metadata_snapshot;\n  struct Il2CppGCHandles\n  {\n    uint32_t tracked_object_count;\n    void ** pointers_to_objects;\n  } gc_handles;\n  struct Il2CppRuntimeInformation\n  {\n    uint32_t pointer_size;\n    uint32_t object_header_size;\n    uint32_t array_header_size;\n    uint32_t array_bounds_offset_in_header;\n    uint32_t array_size_offset_in_header;\n    uint32_t allocation_granularity;\n  } runtime_information;\n  void * additional_user_information;\n};\n\nstruct Il2CppMetadataType\n{\n  uint32_t flags;\n  void * fields;\n  uint32_t field_count;\n  uint32_t statics_size;\n  uint8_t * statics;\n  uint32_t base_or_element_type_index;\n  char * name;\n  const char * assembly_name;\n  uint64_t type_info_address;\n  uint32_t size;\n};\n\nuintptr_t\nil2cpp_memory_snapshot_get_classes (\n    const Il2CppManagedMemorySnapshot * snapshot, Il2CppMetadataType ** iter)\n{\n  const int zero = 0;\n  const void * null = 0;\n\n  if (iter != NULL && snapshot->metadata_snapshot.type_count > zero)\n  {\n    if (*iter == null)\n    {\n      *iter = snapshot->metadata_snapshot.types;\n      return (uintptr_t) (*iter)->type_info_address;\n    }\n    else\n    {\n      Il2CppMetadataType * metadata_type = *iter + 1;\n\n      if (metadata_type < snapshot->metadata_snapshot.types +\n                              snapshot->metadata_snapshot.type_count)\n      {\n        *iter = metadata_type;\n        return (uintptr_t) (*iter)->type_info_address;\n      }\n    }\n  }\n  return 0;\n}\n\nvoid **\nil2cpp_memory_snapshot_get_objects (\n    const Il2CppManagedMemorySnapshot * snapshot, uint32_t * size)\n{\n  *size = snapshot->gc_handles.tracked_object_count;\n  return snapshot->gc_handles.pointers_to_objects;\n}\n"), lazy);
  function r(exportName, retType2, argTypes2) {
    const handle2 = Il2Cpp3.$config.exports?.[exportName]?.() ?? Il2Cpp3.module.findExportByName(exportName) ?? Il2Cpp3.memorySnapshotExports[exportName];
    const target = new NativeFunction(handle2 ?? NULL, retType2, argTypes2);
    return target.isNull() ? new Proxy(target, {
      get(value, name) {
        const property = value[name];
        return typeof property === "function" ? property.bind(value) : property;
      },
      apply() {
        if (handle2 == null) {
          raise(`couldn't resolve export ${exportName}`);
        } else if (handle2.isNull()) {
          raise(`export ${exportName} points to NULL IL2CPP library has likely been stripped, obfuscated, or customized`);
        }
      }
    }) : target;
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function is(klass) {
    return (element) => {
      if (element instanceof Il2Cpp3.Class) {
        return klass.isAssignableFrom(element);
      } else {
        return klass.isAssignableFrom(element.class);
      }
    };
  }
  Il2Cpp3.is = is;
  function isExactly(klass) {
    return (element) => {
      if (element instanceof Il2Cpp3.Class) {
        return element.equals(klass);
      } else {
        return element.class.equals(klass);
      }
    };
  }
  Il2Cpp3.isExactly = isExactly;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  Il2Cpp3.gc = {
    /**
     * Gets the heap size in bytes.
     */
    get heapSize() {
      return Il2Cpp3.exports.gcGetHeapSize();
    },
    /**
     * Determines whether the garbage collector is enabled.
     */
    get isEnabled() {
      return !Il2Cpp3.exports.gcIsDisabled();
    },
    /**
     * Determines whether the garbage collector is incremental
     * ([source](https://docs.unity3d.com/Manual/performance-incremental-garbage-collection.html)).
     */
    get isIncremental() {
      return !!Il2Cpp3.exports.gcIsIncremental();
    },
    /**
     * Gets the number of nanoseconds the garbage collector can spend in a
     * collection step.
     */
    get maxTimeSlice() {
      return Il2Cpp3.exports.gcGetMaxTimeSlice();
    },
    /**
     * Gets the used heap size in bytes.
     */
    get usedHeapSize() {
      return Il2Cpp3.exports.gcGetUsedSize();
    },
    /**
     * Enables or disables the garbage collector.
     */
    set isEnabled(value) {
      value ? Il2Cpp3.exports.gcEnable() : Il2Cpp3.exports.gcDisable();
    },
    /**
     *  Sets the number of nanoseconds the garbage collector can spend in
     * a collection step.
     */
    set maxTimeSlice(nanoseconds) {
      Il2Cpp3.exports.gcSetMaxTimeSlice(nanoseconds);
    },
    /**
     * Returns the heap allocated objects of the specified class. \
     * This variant reads GC descriptors.
     */
    choose(klass) {
      const matches = [];
      const callback = (objects, size) => {
        for (let i = 0; i < size; i++) {
          matches.push(new Il2Cpp3.Object(objects.add(i * Process.pointerSize).readPointer()));
        }
      };
      const chooseCallback = new NativeCallback(callback, "void", ["pointer", "int", "pointer"]);
      if (Il2Cpp3.unityVersionIsBelow202120) {
        const onWorld = new NativeCallback(() => {
        }, "void", []);
        const state = Il2Cpp3.exports.livenessCalculationBegin(klass, 0, chooseCallback, NULL, onWorld, onWorld);
        Il2Cpp3.exports.livenessCalculationFromStatics(state);
        Il2Cpp3.exports.livenessCalculationEnd(state);
      } else {
        const realloc = (handle2, size) => {
          if (!handle2.isNull() && size.compare(0) == 0) {
            Il2Cpp3.free(handle2);
            return NULL;
          } else {
            return Il2Cpp3.alloc(size);
          }
        };
        const reallocCallback = new NativeCallback(realloc, "pointer", ["pointer", "size_t", "pointer"]);
        this.stopWorld();
        const state = Il2Cpp3.exports.livenessAllocateStruct(klass, 0, chooseCallback, NULL, reallocCallback);
        Il2Cpp3.exports.livenessCalculationFromStatics(state);
        Il2Cpp3.exports.livenessFinalize(state);
        this.startWorld();
        Il2Cpp3.exports.livenessFreeStruct(state);
      }
      return matches;
    },
    /**
     * Forces a garbage collection of the specified generation.
     */
    collect(generation) {
      Il2Cpp3.exports.gcCollect(generation < 0 ? 0 : generation > 2 ? 2 : generation);
    },
    /**
     * Forces a garbage collection.
     */
    collectALittle() {
      Il2Cpp3.exports.gcCollectALittle();
    },
    /**
     *  Resumes all the previously stopped threads.
     */
    startWorld() {
      return Il2Cpp3.exports.gcStartWorld();
    },
    /**
     * Performs an incremental garbage collection.
     */
    startIncrementalCollection() {
      return Il2Cpp3.exports.gcStartIncrementalCollection();
    },
    /**
     * Stops all threads which may access the garbage collected heap, other
     * than the caller.
     */
    stopWorld() {
      return Il2Cpp3.exports.gcStopWorld();
    }
  };
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Android;
(function(Android2) {
  getter(Android2, "apiLevel", () => {
    const value = getProperty("ro.build.version.sdk");
    return value ? parseInt(value) : null;
  }, lazy);
  function getProperty(name) {
    const handle2 = Process.findModuleByName("libc.so")?.findExportByName("__system_property_get");
    if (handle2) {
      const __system_property_get = new NativeFunction(handle2, "void", ["pointer", "pointer"]);
      const value = Memory.alloc(92).writePointer(NULL);
      __system_property_get(Memory.allocUtf8String(name), value);
      return value.readCString() ?? void 0;
    }
  }
})(Android || (Android = {}));
function raise(message) {
  const error = new Error(message);
  error.name = "Il2CppError";
  error.stack = error.stack?.replace(/^(Il2Cpp)?Error/, "\x1B[0m\x1B[38;5;9mil2cpp\x1B[0m")?.replace(/\n    at (.+) \((.+):(.+)\)/, "\x1B[3m\x1B[2m")?.concat("\x1B[0m");
  throw error;
}
function warn(message) {
  globalThis.console.log(`\x1B[38;5;11mil2cpp\x1B[0m: ${message}`);
}
function ok(message) {
  globalThis.console.log(`\x1B[38;5;10mil2cpp\x1B[0m: ${message}`);
}
function inform(message) {
  globalThis.console.log(`\x1B[38;5;12mil2cpp\x1B[0m: ${message}`);
}
function decorate(target, decorator, descriptors = Object.getOwnPropertyDescriptors(target)) {
  for (const key in descriptors) {
    descriptors[key] = decorator(target, key, descriptors[key]);
  }
  Object.defineProperties(target, descriptors);
  return target;
}
function getter(target, key, get2, decorator) {
  globalThis.Object.defineProperty(target, key, decorator?.(target, key, { get: get2, configurable: true }) ?? { get: get2, configurable: true });
}
function cyrb53(str) {
  let h1 = 3735928559;
  let h2 = 1103547991;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
  h1 ^= Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
  h2 ^= Math.imul(h1 ^ h1 >>> 13, 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function exportsHash(module) {
  return cyrb53(module.enumerateExports().sort((a, b) => a.name.localeCompare(b.name)).map((_) => _.name + _.address.sub(module.base)).join(""));
}
function lazy(_, propertyKey, descriptor) {
  const getter2 = descriptor.get;
  if (!getter2) {
    throw new Error("@lazy can only be applied to getter accessors");
  }
  descriptor.get = function() {
    const value = getter2.call(this);
    Object.defineProperty(this, propertyKey, {
      value,
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      writable: false
    });
    return value;
  };
  return descriptor;
}
var NativeStruct = class {
  handle;
  constructor(handleOrWrapper) {
    if (handleOrWrapper instanceof NativePointer) {
      this.handle = handleOrWrapper;
    } else {
      this.handle = handleOrWrapper.handle;
    }
  }
  equals(other) {
    return this.handle.equals(other.handle);
  }
  isNull() {
    return this.handle.isNull();
  }
  asNullable() {
    return this.isNull() ? null : this;
  }
};
function addFlippedEntries(obj) {
  return Object.keys(obj).reduce((obj2, key) => (obj2[obj2[key]] = key, obj2), obj);
}
NativePointer.prototype.offsetOf = function(condition, depth) {
  depth ??= 512;
  for (let i = 0; depth > 0 ? i < depth : i < -depth; i++) {
    if (condition(depth > 0 ? this.add(i) : this.sub(i))) {
      return i;
    }
  }
  return null;
};
function readNativeIterator(block2) {
  const array = [];
  const iterator = Memory.alloc(Process.pointerSize);
  let handle2 = block2(iterator);
  while (!handle2.isNull()) {
    array.push(handle2);
    handle2 = block2(iterator);
  }
  return array;
}
function readNativeList(block2) {
  const lengthPointer = Memory.alloc(Process.pointerSize);
  const startPointer = block2(lengthPointer);
  if (startPointer.isNull()) {
    return [];
  }
  const array = new Array(lengthPointer.readInt());
  for (let i = 0; i < array.length; i++) {
    array[i] = startPointer.add(i * Process.pointerSize).readPointer();
  }
  return array;
}
function recycle(Class) {
  return new Proxy(Class, {
    cache: /* @__PURE__ */ new Map(),
    construct(Target, argArray) {
      const handle2 = argArray[0].toUInt32();
      if (!this.cache.has(handle2)) {
        this.cache.set(handle2, new Target(argArray[0]));
      }
      return this.cache.get(handle2);
    }
  });
}
var UnityVersion;
(function(UnityVersion2) {
  const pattern = /(6\d{3}|20\d{2}|\d)\.(\d)\.(\d{1,2})(?:[abcfp]|rc){0,2}\d?/;
  function find(string) {
    return string?.match(pattern)?.[0];
  }
  UnityVersion2.find = find;
  function gte(a, b) {
    return compare3(a, b) >= 0;
  }
  UnityVersion2.gte = gte;
  function lt(a, b) {
    return compare3(a, b) < 0;
  }
  UnityVersion2.lt = lt;
  function compare3(a, b) {
    const aMatches = a.match(pattern);
    const bMatches = b.match(pattern);
    for (let i = 1; i <= 3; i++) {
      const a2 = Number(aMatches?.[i] ?? -1);
      const b2 = Number(bMatches?.[i] ?? -1);
      if (a2 > b2)
        return 1;
      else if (a2 < b2)
        return -1;
    }
    return 0;
  }
})(UnityVersion || (UnityVersion = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function alloc2(size = Process.pointerSize) {
    return Il2Cpp3.exports.alloc(size);
  }
  Il2Cpp3.alloc = alloc2;
  function free(pointer) {
    return Il2Cpp3.exports.free(pointer);
  }
  Il2Cpp3.free = free;
  function read2(pointer, type) {
    switch (type.enumValue) {
      case Il2Cpp3.Type.Enum.BOOLEAN:
        return !!pointer.readS8();
      case Il2Cpp3.Type.Enum.BYTE:
        return pointer.readS8();
      case Il2Cpp3.Type.Enum.UBYTE:
        return pointer.readU8();
      case Il2Cpp3.Type.Enum.SHORT:
        return pointer.readS16();
      case Il2Cpp3.Type.Enum.USHORT:
        return pointer.readU16();
      case Il2Cpp3.Type.Enum.INT:
        return pointer.readS32();
      case Il2Cpp3.Type.Enum.UINT:
        return pointer.readU32();
      case Il2Cpp3.Type.Enum.CHAR:
        return pointer.readU16();
      case Il2Cpp3.Type.Enum.LONG:
        return pointer.readS64();
      case Il2Cpp3.Type.Enum.ULONG:
        return pointer.readU64();
      case Il2Cpp3.Type.Enum.FLOAT:
        return pointer.readFloat();
      case Il2Cpp3.Type.Enum.DOUBLE:
        return pointer.readDouble();
      case Il2Cpp3.Type.Enum.NINT:
      case Il2Cpp3.Type.Enum.NUINT:
        return pointer.readPointer();
      case Il2Cpp3.Type.Enum.POINTER:
        return new Il2Cpp3.Pointer(pointer.readPointer(), type.class.baseType);
      case Il2Cpp3.Type.Enum.VALUE_TYPE:
        return new Il2Cpp3.ValueType(pointer, type);
      case Il2Cpp3.Type.Enum.OBJECT:
      case Il2Cpp3.Type.Enum.CLASS:
        return new Il2Cpp3.Object(pointer.readPointer());
      case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
        return type.class.isValueType ? new Il2Cpp3.ValueType(pointer, type) : new Il2Cpp3.Object(pointer.readPointer());
      case Il2Cpp3.Type.Enum.STRING:
        return new Il2Cpp3.String(pointer.readPointer());
      case Il2Cpp3.Type.Enum.ARRAY:
      case Il2Cpp3.Type.Enum.NARRAY:
        return new Il2Cpp3.Array(pointer.readPointer());
    }
    raise(`couldn't read the value from ${pointer} using an unhandled or unknown type ${type.name} (${type.enumValue}), please file an issue`);
  }
  Il2Cpp3.read = read2;
  function write3(pointer, value, type) {
    switch (type.enumValue) {
      case Il2Cpp3.Type.Enum.BOOLEAN:
        return pointer.writeS8(+value);
      case Il2Cpp3.Type.Enum.BYTE:
        return pointer.writeS8(value);
      case Il2Cpp3.Type.Enum.UBYTE:
        return pointer.writeU8(value);
      case Il2Cpp3.Type.Enum.SHORT:
        return pointer.writeS16(value);
      case Il2Cpp3.Type.Enum.USHORT:
        return pointer.writeU16(value);
      case Il2Cpp3.Type.Enum.INT:
        return pointer.writeS32(value);
      case Il2Cpp3.Type.Enum.UINT:
        return pointer.writeU32(value);
      case Il2Cpp3.Type.Enum.CHAR:
        return pointer.writeU16(value);
      case Il2Cpp3.Type.Enum.LONG:
        return pointer.writeS64(value);
      case Il2Cpp3.Type.Enum.ULONG:
        return pointer.writeU64(value);
      case Il2Cpp3.Type.Enum.FLOAT:
        return pointer.writeFloat(value);
      case Il2Cpp3.Type.Enum.DOUBLE:
        return pointer.writeDouble(value);
      case Il2Cpp3.Type.Enum.NINT:
      case Il2Cpp3.Type.Enum.NUINT:
      case Il2Cpp3.Type.Enum.POINTER:
      case Il2Cpp3.Type.Enum.STRING:
      case Il2Cpp3.Type.Enum.ARRAY:
      case Il2Cpp3.Type.Enum.NARRAY:
        return pointer.writePointer(value);
      case Il2Cpp3.Type.Enum.VALUE_TYPE:
        return Memory.copy(pointer, value, type.class.valueTypeSize), pointer;
      case Il2Cpp3.Type.Enum.OBJECT:
      case Il2Cpp3.Type.Enum.CLASS:
      case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
        return value instanceof Il2Cpp3.ValueType ? (Memory.copy(pointer, value, type.class.valueTypeSize), pointer) : pointer.writePointer(value);
    }
    raise(`couldn't write value ${value} to ${pointer} using an unhandled or unknown type ${type.name} (${type.enumValue}), please file an issue`);
  }
  Il2Cpp3.write = write3;
  function fromFridaValue(value, type) {
    if (globalThis.Array.isArray(value)) {
      const handle2 = Memory.alloc(type.class.valueTypeSize);
      const fields = type.class.fields.filter((_) => !_.isStatic);
      for (let i = 0; i < fields.length; i++) {
        const convertedValue = fromFridaValue(value[i], fields[i].type);
        write3(handle2.add(fields[i].offset).sub(Il2Cpp3.Object.headerSize), convertedValue, fields[i].type);
      }
      return new Il2Cpp3.ValueType(handle2, type);
    } else if (value instanceof NativePointer) {
      if (type.isByReference) {
        return new Il2Cpp3.Reference(value, type);
      }
      switch (type.enumValue) {
        case Il2Cpp3.Type.Enum.POINTER:
          return new Il2Cpp3.Pointer(value, type.class.baseType);
        case Il2Cpp3.Type.Enum.STRING:
          return new Il2Cpp3.String(value);
        case Il2Cpp3.Type.Enum.CLASS:
        case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
        case Il2Cpp3.Type.Enum.OBJECT:
          return new Il2Cpp3.Object(value);
        case Il2Cpp3.Type.Enum.ARRAY:
        case Il2Cpp3.Type.Enum.NARRAY:
          return new Il2Cpp3.Array(value);
        default:
          return value;
      }
    } else if (type.enumValue == Il2Cpp3.Type.Enum.BOOLEAN) {
      return !!value;
    } else if (type.enumValue == Il2Cpp3.Type.Enum.VALUE_TYPE && type.class.isEnum) {
      return fromFridaValue([value], type);
    } else {
      return value;
    }
  }
  Il2Cpp3.fromFridaValue = fromFridaValue;
  function toFridaValue(value) {
    if (typeof value == "boolean") {
      return +value;
    } else if (value instanceof Il2Cpp3.ValueType) {
      if (value.type.class.isEnum) {
        return value.field("value__").value;
      } else {
        const _ = value.type.class.fields.filter((_2) => !_2.isStatic).map((_2) => toFridaValue(_2.bind(value).value));
        return _.length == 0 ? [0] : _;
      }
    } else {
      return value;
    }
  }
  Il2Cpp3.toFridaValue = toFridaValue;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  getter(Il2Cpp3, "module", () => {
    return tryModule() ?? raise("Could not find IL2CPP module");
  });
  async function initialize2(blocking = false) {
    const module = tryModule() ?? await new Promise((resolve) => {
      const [moduleName, fallbackModuleName] = getExpectedModuleNames();
      const timeout = setTimeout(() => {
        warn(`after 10 seconds, IL2CPP module '${moduleName}' has not been loaded yet, is the app running?`);
      }, 1e4);
      const moduleObserver = Process.attachModuleObserver({
        onAdded(module2) {
          if (module2.name == moduleName || fallbackModuleName && module2.name == fallbackModuleName) {
            clearTimeout(timeout);
            setImmediate(() => {
              resolve(module2);
              moduleObserver.detach();
            });
          }
        }
      });
    });
    Reflect.defineProperty(Il2Cpp3, "module", { value: module });
    if (Il2Cpp3.exports.getCorlib().isNull()) {
      return await new Promise((resolve) => {
        const interceptor = Interceptor.attach(Il2Cpp3.exports.initialize, {
          onLeave() {
            interceptor.detach();
            blocking ? resolve(true) : setImmediate(() => resolve(false));
          }
        });
      });
    }
    return false;
  }
  Il2Cpp3.initialize = initialize2;
  function tryModule() {
    const [moduleName, fallback] = getExpectedModuleNames();
    return Process.findModuleByName(moduleName) ?? Process.findModuleByName(fallback ?? moduleName) ?? (Process.platform == "darwin" ? Process.findModuleByAddress(DebugSymbol.fromName("il2cpp_init").address) : void 0) ?? void 0;
  }
  function getExpectedModuleNames() {
    if (Il2Cpp3.$config.moduleName) {
      return [Il2Cpp3.$config.moduleName];
    }
    switch (Process.platform) {
      case "linux":
        return [Android.apiLevel ? "libil2cpp.so" : "GameAssembly.so"];
      case "windows":
        return ["GameAssembly.dll"];
      case "darwin":
        return ["UnityFramework", "GameAssembly.dylib"];
    }
    raise(`${Process.platform} is not supported yet`);
  }
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  async function perform(block2, flag = "bind") {
    let attachedThread = null;
    try {
      const isInMainThread = await Il2Cpp3.initialize(flag == "main");
      if (flag == "main" && !isInMainThread) {
        return perform(() => Il2Cpp3.mainThread.schedule(block2), "free");
      }
      if (Il2Cpp3.currentThread == null) {
        attachedThread = Il2Cpp3.domain.attach();
      }
      if (flag == "bind" && attachedThread != null) {
        Script.bindWeak(globalThis, () => attachedThread?.detach());
      }
      const result = block2();
      return result instanceof Promise ? await result : result;
    } catch (error) {
      Script.nextTick((_) => {
        throw _;
      }, error);
      return Promise.reject(error);
    } finally {
      if (flag == "free" && attachedThread != null) {
        attachedThread.detach();
      }
    }
  }
  Il2Cpp3.perform = perform;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Tracer {
    /** @internal */
    #state = {
      depth: 0,
      buffer: [],
      history: /* @__PURE__ */ new Set(),
      flush: () => {
        if (this.#state.depth == 0) {
          const message = `
${this.#state.buffer.join("\n")}
`;
          if (this.#verbose) {
            inform(message);
          } else {
            const hash = cyrb53(message);
            if (!this.#state.history.has(hash)) {
              this.#state.history.add(hash);
              inform(message);
            }
          }
          this.#state.buffer.length = 0;
        }
      }
    };
    /** @internal */
    #threadId = Il2Cpp3.mainThread.id;
    /** @internal */
    #verbose = false;
    /** @internal */
    #applier;
    /** @internal */
    #targets = [];
    /** @internal */
    #domain;
    /** @internal */
    #assemblies;
    /** @internal */
    #classes;
    /** @internal */
    #methods;
    /** @internal */
    #assemblyFilter;
    /** @internal */
    #classFilter;
    /** @internal */
    #methodFilter;
    /** @internal */
    #parameterFilter;
    constructor(applier) {
      this.#applier = applier;
    }
    /** */
    thread(thread) {
      this.#threadId = thread.id;
      return this;
    }
    /** Determines whether print duplicate logs. */
    verbose(value) {
      this.#verbose = value;
      return this;
    }
    /** Sets the application domain as the place where to find the target methods. */
    domain() {
      this.#domain = Il2Cpp3.domain;
      return this;
    }
    /** Sets the passed `assemblies` as the place where to find the target methods. */
    assemblies(...assemblies) {
      this.#assemblies = assemblies;
      return this;
    }
    /** Sets the passed `classes` as the place where to find the target methods. */
    classes(...classes) {
      this.#classes = classes;
      return this;
    }
    /** Sets the passed `methods` as the target methods. */
    methods(...methods) {
      this.#methods = methods;
      return this;
    }
    /** Filters the assemblies where to find the target methods. */
    filterAssemblies(filter) {
      this.#assemblyFilter = filter;
      return this;
    }
    /** Filters the classes where to find the target methods. */
    filterClasses(filter) {
      this.#classFilter = filter;
      return this;
    }
    /** Filters the target methods. */
    filterMethods(filter) {
      this.#methodFilter = filter;
      return this;
    }
    /** Filters the target methods. */
    filterParameters(filter) {
      this.#parameterFilter = filter;
      return this;
    }
    /** Commits the current changes by finding the target methods. */
    and() {
      const filterMethod = (method2) => {
        if (this.#parameterFilter == void 0) {
          this.#targets.push(method2);
          return;
        }
        for (const parameter of method2.parameters) {
          if (this.#parameterFilter(parameter)) {
            this.#targets.push(method2);
            break;
          }
        }
      };
      const filterMethods = (values) => {
        for (const method2 of values) {
          filterMethod(method2);
        }
      };
      const filterClass = (klass) => {
        if (this.#methodFilter == void 0) {
          filterMethods(klass.methods);
          return;
        }
        for (const method2 of klass.methods) {
          if (this.#methodFilter(method2)) {
            filterMethod(method2);
          }
        }
      };
      const filterClasses = (values) => {
        for (const klass of values) {
          filterClass(klass);
        }
      };
      const filterAssembly = (assembly) => {
        if (this.#classFilter == void 0) {
          filterClasses(assembly.image.classes);
          return;
        }
        for (const klass of assembly.image.classes) {
          if (this.#classFilter(klass)) {
            filterClass(klass);
          }
        }
      };
      const filterAssemblies = (assemblies) => {
        for (const assembly of assemblies) {
          filterAssembly(assembly);
        }
      };
      const filterDomain = (domain) => {
        if (this.#assemblyFilter == void 0) {
          filterAssemblies(domain.assemblies);
          return;
        }
        for (const assembly of domain.assemblies) {
          if (this.#assemblyFilter(assembly)) {
            filterAssembly(assembly);
          }
        }
      };
      this.#methods ? filterMethods(this.#methods) : this.#classes ? filterClasses(this.#classes) : this.#assemblies ? filterAssemblies(this.#assemblies) : this.#domain ? filterDomain(this.#domain) : void 0;
      this.#assemblies = void 0;
      this.#classes = void 0;
      this.#methods = void 0;
      this.#assemblyFilter = void 0;
      this.#classFilter = void 0;
      this.#methodFilter = void 0;
      this.#parameterFilter = void 0;
      return this;
    }
    /** Starts tracing. */
    attach() {
      for (const target of this.#targets) {
        if (!target.virtualAddress.isNull()) {
          try {
            this.#applier(target, this.#state, this.#threadId);
          } catch (e) {
            switch (e.message) {
              case /unable to intercept function at \w+; please file a bug/.exec(e.message)?.input:
              case "already replaced this function":
                break;
              default:
                throw e;
            }
          }
        }
      }
    }
  }
  Il2Cpp3.Tracer = Tracer;
  function trace(parameters = false) {
    const applier = () => (method2, state, threadId) => {
      const paddedVirtualAddress = method2.relativeVirtualAddress.toString(16).padStart(8, "0");
      Interceptor.attach(method2.virtualAddress, {
        onEnter() {
          if (this.threadId == threadId) {
            state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(state.depth++)}\u250C\u2500\x1B[35m${method2.class.type.name}::\x1B[1m${method2.name}\x1B[0m\x1B[0m`);
          }
        },
        onLeave() {
          if (this.threadId == threadId) {
            state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(--state.depth)}\u2514\u2500\x1B[33m${method2.class.type.name}::\x1B[1m${method2.name}\x1B[0m\x1B[0m`);
            state.flush();
          }
        }
      });
    };
    const applierWithParameters = () => (method2, state, threadId) => {
      const paddedVirtualAddress = method2.relativeVirtualAddress.toString(16).padStart(8, "0");
      const startIndex = +!method2.isStatic | +Il2Cpp3.unityVersionIsBelow201830;
      const callback = function(...args) {
        if (this.threadId == threadId) {
          const thisParameter = method2.isStatic ? void 0 : new Il2Cpp3.Parameter("this", -1, method2.class.type);
          const parameters2 = thisParameter ? [thisParameter].concat(method2.parameters) : method2.parameters;
          state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(state.depth++)}\u250C\u2500\x1B[35m${method2.class.type.name}::\x1B[1m${method2.name}\x1B[0m\x1B[0m(${parameters2.map((e) => `\x1B[32m${e.name}\x1B[0m = \x1B[31m${Il2Cpp3.fromFridaValue(args[e.position + startIndex], e.type)}\x1B[0m`).join(", ")})`);
        }
        const returnValue = method2.nativeFunction(...args);
        if (this.threadId == threadId) {
          state.buffer.push(`\x1B[2m0x${paddedVirtualAddress}\x1B[0m ${`\u2502 `.repeat(--state.depth)}\u2514\u2500\x1B[33m${method2.class.type.name}::\x1B[1m${method2.name}\x1B[0m\x1B[0m${returnValue == void 0 ? "" : ` = \x1B[36m${Il2Cpp3.fromFridaValue(returnValue, method2.returnType)}`}\x1B[0m`);
          state.flush();
        }
        return returnValue;
      };
      method2.revert();
      const nativeCallback = new NativeCallback(callback, method2.returnType.fridaAlias, method2.fridaSignature);
      Interceptor.replace(method2.virtualAddress, nativeCallback);
    };
    return new Il2Cpp3.Tracer(parameters ? applierWithParameters() : applier());
  }
  Il2Cpp3.trace = trace;
  function backtrace2(mode) {
    const methods = Il2Cpp3.domain.assemblies.flatMap((_) => _.image.classes.flatMap((_2) => _2.methods.filter((_3) => !_3.virtualAddress.isNull()))).sort((_, __) => _.virtualAddress.compare(__.virtualAddress));
    const searchInsert = (target) => {
      let left = 0;
      let right = methods.length - 1;
      while (left <= right) {
        const pivot = Math.floor((left + right) / 2);
        const comparison = methods[pivot].virtualAddress.compare(target);
        if (comparison == 0) {
          return methods[pivot];
        } else if (comparison > 0) {
          right = pivot - 1;
        } else {
          left = pivot + 1;
        }
      }
      return methods[right];
    };
    const applier = () => (method2, state, threadId) => {
      Interceptor.attach(method2.virtualAddress, function() {
        if (this.threadId == threadId) {
          const handles = globalThis.Thread.backtrace(this.context, mode);
          handles.unshift(method2.virtualAddress);
          for (const handle2 of handles) {
            if (handle2.compare(Il2Cpp3.module.base) > 0 && handle2.compare(Il2Cpp3.module.base.add(Il2Cpp3.module.size)) < 0) {
              const method3 = searchInsert(handle2);
              if (method3) {
                const offset = handle2.sub(method3.virtualAddress);
                if (offset.compare(4095) < 0) {
                  state.buffer.push(`\x1B[2m0x${method3.relativeVirtualAddress.toString(16).padStart(8, "0")}\x1B[0m\x1B[2m+0x${offset.toString(16).padStart(3, `0`)}\x1B[0m ${method3.class.type.name}::\x1B[1m${method3.name}\x1B[0m`);
                }
              }
            }
          }
          state.flush();
        }
      });
    };
    return new Il2Cpp3.Tracer(applier());
  }
  Il2Cpp3.backtrace = backtrace2;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Array2 extends NativeStruct {
    /** Gets the Il2CppArray struct size, possibly equal to `Process.pointerSize * 4`. */
    static get headerSize() {
      return Il2Cpp3.corlib.class("System.Array").instanceSize;
    }
    /** @internal Gets a pointer to the first element of the current array. */
    get elements() {
      const array2 = Il2Cpp3.string("v").object.method("ToCharArray", 0).invoke();
      const offset = array2.handle.offsetOf((_) => _.readS16() == 118) ?? raise("couldn't find the elements offset in the native array struct");
      getter(Il2Cpp3.Array.prototype, "elements", function() {
        return new Il2Cpp3.Pointer(this.handle.add(offset), this.elementType);
      }, lazy);
      return this.elements;
    }
    /** Gets the size of the object encompassed by the current array. */
    get elementSize() {
      return this.elementType.class.arrayElementSize;
    }
    /** Gets the type of the object encompassed by the current array. */
    get elementType() {
      return this.object.class.type.class.baseType;
    }
    /** Gets the total number of elements in all the dimensions of the current array. */
    get length() {
      return Il2Cpp3.exports.arrayGetLength(this);
    }
    /** Gets the encompassing object of the current array. */
    get object() {
      return new Il2Cpp3.Object(this);
    }
    /** Gets the element at the specified index of the current array. */
    get(index) {
      if (index < 0 || index >= this.length) {
        raise(`cannot get element at index ${index} as the array length is ${this.length}`);
      }
      return this.elements.get(index);
    }
    /** Sets the element at the specified index of the current array. */
    set(index, value) {
      if (index < 0 || index >= this.length) {
        raise(`cannot set element at index ${index} as the array length is ${this.length}`);
      }
      this.elements.set(index, value);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : `[${this.elements.read(this.length, 0)}]`;
    }
    /** Iterable. */
    *[Symbol.iterator]() {
      for (let i = 0; i < this.length; i++) {
        yield this.elements.get(i);
      }
    }
  }
  __decorate([
    lazy
  ], Array2.prototype, "elementSize", null);
  __decorate([
    lazy
  ], Array2.prototype, "elementType", null);
  __decorate([
    lazy
  ], Array2.prototype, "length", null);
  __decorate([
    lazy
  ], Array2.prototype, "object", null);
  __decorate([
    lazy
  ], Array2, "headerSize", null);
  Il2Cpp3.Array = Array2;
  function array(klass, lengthOrElements) {
    const length = typeof lengthOrElements == "number" ? lengthOrElements : lengthOrElements.length;
    const array2 = new Il2Cpp3.Array(Il2Cpp3.exports.arrayNew(klass, length));
    if (globalThis.Array.isArray(lengthOrElements)) {
      array2.elements.write(lengthOrElements);
    }
    return array2;
  }
  Il2Cpp3.array = array;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Assembly = class Assembly extends NativeStruct {
    /** Gets the image of this assembly. */
    get image() {
      if (Il2Cpp3.exports.assemblyGetImage.isNull()) {
        const runtimeModule = this.object.tryMethod("GetType", 1)?.invoke(Il2Cpp3.string("<Module>"))?.asNullable()?.tryMethod("get_Module")?.invoke() ?? this.object.tryMethod("GetModules", 1)?.invoke(false)?.get(0) ?? raise(`couldn't find the runtime module object of assembly ${this.name}`);
        return new Il2Cpp3.Image(runtimeModule.field("_impl").value);
      }
      return new Il2Cpp3.Image(Il2Cpp3.exports.assemblyGetImage(this));
    }
    /** Gets the name of this assembly. */
    get name() {
      return this.image.name.replace(".dll", "");
    }
    /** Gets the encompassing object of the current assembly. */
    get object() {
      for (const _ of Il2Cpp3.domain.object.method("GetAssemblies", 1).invoke(false)) {
        if (_.field("_mono_assembly").value.equals(this)) {
          return _;
        }
      }
      raise("couldn't find the object of the native assembly struct");
    }
  };
  __decorate([
    lazy
  ], Assembly.prototype, "name", null);
  __decorate([
    lazy
  ], Assembly.prototype, "object", null);
  Assembly = __decorate([
    recycle
  ], Assembly);
  Il2Cpp3.Assembly = Assembly;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Class = class Class extends NativeStruct {
    /** Gets the actual size of the instance of the current class. */
    get actualInstanceSize() {
      const SystemString = Il2Cpp3.corlib.class("System.String");
      const offset = SystemString.handle.offsetOf((_) => _.readInt() == SystemString.instanceSize - 2) ?? raise("couldn't find the actual instance size offset in the native class struct");
      getter(Il2Cpp3.Class.prototype, "actualInstanceSize", function() {
        return this.handle.add(offset).readS32();
      }, lazy);
      return this.actualInstanceSize;
    }
    /** Gets the array class which encompass the current class. */
    get arrayClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetArrayClass(this, 1));
    }
    /** Gets the size of the object encompassed by the current array class. */
    get arrayElementSize() {
      return Il2Cpp3.exports.classGetArrayElementSize(this);
    }
    /** Gets the name of the assembly in which the current class is defined. */
    get assemblyName() {
      return Il2Cpp3.exports.classGetAssemblyName(this).readUtf8String().replace(".dll", "");
    }
    /** Gets the class that declares the current nested class. */
    get declaringClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetDeclaringType(this)).asNullable();
    }
    /** Gets the encompassed type of this array, reference, pointer or enum type. */
    get baseType() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.classGetBaseType(this)).asNullable();
    }
    /** Gets the class of the object encompassed or referred to by the current array, pointer or reference class. */
    get elementClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetElementClass(this)).asNullable();
    }
    /** Gets the fields of the current class. */
    get fields() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetFields(this, _)).map((_) => new Il2Cpp3.Field(_));
    }
    /** Gets the flags of the current class. */
    get flags() {
      return Il2Cpp3.exports.classGetFlags(this);
    }
    /** Gets the full name (namespace + name) of the current class. */
    get fullName() {
      return this.namespace ? `${this.namespace}.${this.name}` : this.name;
    }
    /** Gets the generic class of the current class if the current class is inflated. */
    get genericClass() {
      const klass = this.image.tryClass(this.fullName)?.asNullable();
      return klass?.equals(this) ? null : klass ?? null;
    }
    /** Gets the generics parameters of this generic class. */
    get generics() {
      if (!this.isGeneric && !this.isInflated) {
        return [];
      }
      const types2 = this.type.object.method("GetGenericArguments").invoke();
      return globalThis.Array.from(types2).map((_) => new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(_)));
    }
    /** Determines whether the GC has tracking references to the current class instances. */
    get hasReferences() {
      return !!Il2Cpp3.exports.classHasReferences(this);
    }
    /** Determines whether ther current class has a valid static constructor. */
    get hasStaticConstructor() {
      const staticConstructor = this.tryMethod(".cctor");
      return staticConstructor != null && !staticConstructor.virtualAddress.isNull();
    }
    /** Gets the image in which the current class is defined. */
    get image() {
      return new Il2Cpp3.Image(Il2Cpp3.exports.classGetImage(this));
    }
    /** Gets the size of the instance of the current class. */
    get instanceSize() {
      return Il2Cpp3.exports.classGetInstanceSize(this);
    }
    /** Determines whether the current class is abstract. */
    get isAbstract() {
      return !!Il2Cpp3.exports.classIsAbstract(this);
    }
    /** Determines whether the current class is blittable. */
    get isBlittable() {
      return !!Il2Cpp3.exports.classIsBlittable(this);
    }
    /** Determines whether the current class is an enumeration. */
    get isEnum() {
      return !!Il2Cpp3.exports.classIsEnum(this);
    }
    /** Determines whether the current class is a generic one. */
    get isGeneric() {
      return !!Il2Cpp3.exports.classIsGeneric(this);
    }
    /** Determines whether the current class is inflated. */
    get isInflated() {
      return !!Il2Cpp3.exports.classIsInflated(this);
    }
    /** Determines whether the current class is an interface. */
    get isInterface() {
      return !!Il2Cpp3.exports.classIsInterface(this);
    }
    /** Determines whether the current class is a struct. */
    get isStruct() {
      return this.isValueType && !this.isEnum;
    }
    /** Determines whether the current class is a value type. */
    get isValueType() {
      return !!Il2Cpp3.exports.classIsValueType(this);
    }
    /** Gets the interfaces implemented or inherited by the current class. */
    get interfaces() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetInterfaces(this, _)).map((_) => new Il2Cpp3.Class(_));
    }
    /** Gets the methods implemented by the current class. */
    get methods() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetMethods(this, _)).map((_) => new Il2Cpp3.Method(_));
    }
    /** Gets the name of the current class. */
    get name() {
      return Il2Cpp3.exports.classGetName(this).readUtf8String();
    }
    /** Gets the namespace of the current class. */
    get namespace() {
      return Il2Cpp3.exports.classGetNamespace(this).readUtf8String() || void 0;
    }
    /** Gets the classes nested inside the current class. */
    get nestedClasses() {
      return readNativeIterator((_) => Il2Cpp3.exports.classGetNestedClasses(this, _)).map((_) => new Il2Cpp3.Class(_));
    }
    /** Gets the class from which the current class directly inherits. */
    get parent() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classGetParent(this)).asNullable();
    }
    /** Gets the pointer class of the current class. */
    get pointerClass() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(this.type.object.method("MakePointerType").invoke()));
    }
    /** Gets the rank (number of dimensions) of the current array class. */
    get rank() {
      let rank = 0;
      const name = this.name;
      for (let i = this.name.length - 1; i > 0; i--) {
        const c = name[i];
        if (c == "]")
          rank++;
        else if (c == "[" || rank == 0)
          break;
        else if (c == ",")
          rank++;
        else
          break;
      }
      return rank;
    }
    /** Gets a pointer to the static fields of the current class. */
    get staticFieldsData() {
      return Il2Cpp3.exports.classGetStaticFieldData(this);
    }
    /** Gets the size of the instance - as a value type - of the current class. */
    get valueTypeSize() {
      return Il2Cpp3.exports.classGetValueTypeSize(this, NULL);
    }
    /** Gets the type of the current class. */
    get type() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.classGetType(this));
    }
    /** Allocates a new object of the current class. */
    alloc() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.objectNew(this));
    }
    /** Gets the field identified by the given name. */
    field(name) {
      return this.tryField(name) ?? raise(`couldn't find field ${name} in class ${this.type.name}`);
    }
    /** Gets the hierarchy of the current class. */
    *hierarchy(options) {
      let klass = options?.includeCurrent ?? true ? this : this.parent;
      while (klass) {
        yield klass;
        klass = klass.parent;
      }
    }
    /** Builds a generic instance of the current generic class. */
    inflate(...classes) {
      if (!this.isGeneric) {
        raise(`cannot inflate class ${this.type.name} as it has no generic parameters`);
      }
      if (this.generics.length != classes.length) {
        raise(`cannot inflate class ${this.type.name} as it needs ${this.generics.length} generic parameter(s), not ${classes.length}`);
      }
      const types2 = classes.map((_) => _.type.object);
      const typeArray = Il2Cpp3.array(Il2Cpp3.corlib.class("System.Type"), types2);
      const inflatedType = this.type.object.method("MakeGenericType", 1).invoke(typeArray);
      return new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(inflatedType));
    }
    /** Calls the static constructor of the current class. */
    initialize() {
      Il2Cpp3.exports.classInitialize(this);
      return this;
    }
    /** Determines whether an instance of `other` class can be assigned to a variable of the current type. */
    isAssignableFrom(other) {
      return !!Il2Cpp3.exports.classIsAssignableFrom(this, other);
    }
    /** Determines whether the current class derives from `other` class. */
    isSubclassOf(other, checkInterfaces) {
      return !!Il2Cpp3.exports.classIsSubclassOf(this, other, +checkInterfaces);
    }
    /** Gets the method identified by the given name and parameter count. */
    method(name, parameterCount = -1) {
      return this.tryMethod(name, parameterCount) ?? raise(`couldn't find method ${name} in class ${this.type.name}`);
    }
    /** Gets the nested class with the given name. */
    nested(name) {
      return this.tryNested(name) ?? raise(`couldn't find nested class ${name} in class ${this.type.name}`);
    }
    /** Allocates a new object of the current class and calls its default constructor. */
    new() {
      const object = this.alloc();
      const exceptionArray = Memory.alloc(Process.pointerSize);
      Il2Cpp3.exports.objectInitialize(object, exceptionArray);
      const exception = exceptionArray.readPointer();
      if (!exception.isNull()) {
        raise(new Il2Cpp3.Object(exception).toString());
      }
      return object;
    }
    /** Gets the field with the given name. */
    tryField(name) {
      return new Il2Cpp3.Field(Il2Cpp3.exports.classGetFieldFromName(this, Memory.allocUtf8String(name))).asNullable();
    }
    /** Gets the method with the given name and parameter count. */
    tryMethod(name, parameterCount = -1) {
      return new Il2Cpp3.Method(Il2Cpp3.exports.classGetMethodFromName(this, Memory.allocUtf8String(name), parameterCount)).asNullable();
    }
    /** Gets the nested class with the given name. */
    tryNested(name) {
      return this.nestedClasses.find((_) => _.name == name);
    }
    /** */
    toString() {
      const inherited = [this.parent].concat(this.interfaces);
      return `// ${this.assemblyName}
${this.isEnum ? `enum` : this.isStruct ? `struct` : this.isInterface ? `interface` : `class`} ${this.type.name}${inherited ? ` : ${inherited.map((_) => _?.type.name).join(`, `)}` : ``}
{
    ${this.fields.join(`
    `)}
    ${this.methods.join(`
    `)}
}`;
    }
    /** Executes a callback for every defined class. */
    static enumerate(block2) {
      const callback = new NativeCallback((_) => block2(new Il2Cpp3.Class(_)), "void", ["pointer", "pointer"]);
      return Il2Cpp3.exports.classForEach(callback, NULL);
    }
  };
  __decorate([
    lazy
  ], Class.prototype, "arrayClass", null);
  __decorate([
    lazy
  ], Class.prototype, "arrayElementSize", null);
  __decorate([
    lazy
  ], Class.prototype, "assemblyName", null);
  __decorate([
    lazy
  ], Class.prototype, "declaringClass", null);
  __decorate([
    lazy
  ], Class.prototype, "baseType", null);
  __decorate([
    lazy
  ], Class.prototype, "elementClass", null);
  __decorate([
    lazy
  ], Class.prototype, "fields", null);
  __decorate([
    lazy
  ], Class.prototype, "flags", null);
  __decorate([
    lazy
  ], Class.prototype, "fullName", null);
  __decorate([
    lazy
  ], Class.prototype, "generics", null);
  __decorate([
    lazy
  ], Class.prototype, "hasReferences", null);
  __decorate([
    lazy
  ], Class.prototype, "hasStaticConstructor", null);
  __decorate([
    lazy
  ], Class.prototype, "image", null);
  __decorate([
    lazy
  ], Class.prototype, "instanceSize", null);
  __decorate([
    lazy
  ], Class.prototype, "isAbstract", null);
  __decorate([
    lazy
  ], Class.prototype, "isBlittable", null);
  __decorate([
    lazy
  ], Class.prototype, "isEnum", null);
  __decorate([
    lazy
  ], Class.prototype, "isGeneric", null);
  __decorate([
    lazy
  ], Class.prototype, "isInflated", null);
  __decorate([
    lazy
  ], Class.prototype, "isInterface", null);
  __decorate([
    lazy
  ], Class.prototype, "isValueType", null);
  __decorate([
    lazy
  ], Class.prototype, "interfaces", null);
  __decorate([
    lazy
  ], Class.prototype, "methods", null);
  __decorate([
    lazy
  ], Class.prototype, "name", null);
  __decorate([
    lazy
  ], Class.prototype, "namespace", null);
  __decorate([
    lazy
  ], Class.prototype, "nestedClasses", null);
  __decorate([
    lazy
  ], Class.prototype, "parent", null);
  __decorate([
    lazy
  ], Class.prototype, "pointerClass", null);
  __decorate([
    lazy
  ], Class.prototype, "rank", null);
  __decorate([
    lazy
  ], Class.prototype, "staticFieldsData", null);
  __decorate([
    lazy
  ], Class.prototype, "valueTypeSize", null);
  __decorate([
    lazy
  ], Class.prototype, "type", null);
  Class = __decorate([
    recycle
  ], Class);
  Il2Cpp3.Class = Class;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  function delegate(klass, block2) {
    const SystemDelegate = Il2Cpp3.corlib.class("System.Delegate");
    const SystemMulticastDelegate = Il2Cpp3.corlib.class("System.MulticastDelegate");
    if (!SystemDelegate.isAssignableFrom(klass)) {
      raise(`cannot create a delegate for ${klass.type.name} as it's a non-delegate class`);
    }
    if (klass.equals(SystemDelegate) || klass.equals(SystemMulticastDelegate)) {
      raise(`cannot create a delegate for neither ${SystemDelegate.type.name} nor ${SystemMulticastDelegate.type.name}, use a subclass instead`);
    }
    const delegate2 = klass.alloc();
    const key = delegate2.handle.toString();
    const Invoke = delegate2.tryMethod("Invoke") ?? raise(`cannot create a delegate for ${klass.type.name}, there is no Invoke method`);
    delegate2.method(".ctor").invoke(delegate2, Invoke.handle);
    const callback = Invoke.wrap(block2);
    delegate2.field("method_ptr").value = callback;
    delegate2.field("invoke_impl").value = callback;
    Il2Cpp3._callbacksToKeepAlive[key] = callback;
    return delegate2;
  }
  Il2Cpp3.delegate = delegate;
  Il2Cpp3._callbacksToKeepAlive = {};
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Domain = class Domain extends NativeStruct {
    /** Gets the assemblies that have been loaded into the execution context of the application domain. */
    get assemblies() {
      let handles = readNativeList((_) => Il2Cpp3.exports.domainGetAssemblies(this, _));
      if (handles.length == 0) {
        const assemblyObjects = this.object.method("GetAssemblies").overload().invoke();
        handles = globalThis.Array.from(assemblyObjects).map((_) => _.field("_mono_assembly").value);
      }
      return handles.map((_) => new Il2Cpp3.Assembly(_));
    }
    /** Gets the encompassing object of the application domain. */
    get object() {
      return Il2Cpp3.corlib.class("System.AppDomain").method("get_CurrentDomain").invoke();
    }
    /** Opens and loads the assembly with the given name. */
    assembly(name) {
      return this.tryAssembly(name) ?? raise(`couldn't find assembly ${name}`);
    }
    /** Attached a new thread to the application domain. */
    attach() {
      return new Il2Cpp3.Thread(Il2Cpp3.exports.threadAttach(this));
    }
    /** Opens and loads the assembly with the given name. */
    tryAssembly(name) {
      return new Il2Cpp3.Assembly(Il2Cpp3.exports.domainGetAssemblyFromName(this, Memory.allocUtf8String(name))).asNullable();
    }
  };
  __decorate([
    lazy
  ], Domain.prototype, "assemblies", null);
  __decorate([
    lazy
  ], Domain.prototype, "object", null);
  Domain = __decorate([
    recycle
  ], Domain);
  Il2Cpp3.Domain = Domain;
  getter(Il2Cpp3, "domain", () => {
    return new Il2Cpp3.Domain(Il2Cpp3.exports.domainGet());
  }, lazy);
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Field2 extends NativeStruct {
    /** Gets the class in which this field is defined. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.fieldGetClass(this));
    }
    /** Gets the flags of the current field. */
    get flags() {
      return Il2Cpp3.exports.fieldGetFlags(this);
    }
    /** Determines whether this field value is known at compile time. */
    get isLiteral() {
      return (this.flags & 64) != 0;
    }
    /** Determines whether this field is static. */
    get isStatic() {
      return (this.flags & 16) != 0;
    }
    /** Determines whether this field is thread static. */
    get isThreadStatic() {
      const offset = Il2Cpp3.corlib.class("System.AppDomain").field("type_resolve_in_progress").offset;
      getter(Il2Cpp3.Field.prototype, "isThreadStatic", function() {
        return this.offset == offset;
      }, lazy);
      return this.isThreadStatic;
    }
    /** Gets the access modifier of this field. */
    get modifier() {
      switch (this.flags & 7) {
        case 1:
          return "private";
        case 2:
          return "private protected";
        case 3:
          return "internal";
        case 4:
          return "protected";
        case 5:
          return "protected internal";
        case 6:
          return "public";
      }
    }
    /** Gets the name of this field. */
    get name() {
      return Il2Cpp3.exports.fieldGetName(this).readUtf8String();
    }
    /** Gets the offset of this field, calculated as the difference with its owner virtual address. */
    get offset() {
      return Il2Cpp3.exports.fieldGetOffset(this);
    }
    /** Gets the type of this field. */
    get type() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.fieldGetType(this));
    }
    /** Gets the value of this field. */
    get value() {
      if (!this.isStatic) {
        raise(`cannot access instance field ${this.class.type.name}::${this.name} from a class, use an object instead`);
      }
      const handle2 = Memory.alloc(Process.pointerSize);
      Il2Cpp3.exports.fieldGetStaticValue(this.handle, handle2);
      return Il2Cpp3.read(handle2, this.type);
    }
    /** Sets the value of this field. Thread static or literal values cannot be altered yet. */
    set value(value) {
      if (!this.isStatic) {
        raise(`cannot access instance field ${this.class.type.name}::${this.name} from a class, use an object instead`);
      }
      if (this.isThreadStatic || this.isLiteral) {
        raise(`cannot write the value of field ${this.name} as it's thread static or literal`);
      }
      const handle2 = (
        // pointer-like values should be passed as-is, but boxed
        // value types (primitives included) must be unboxed first
        value instanceof Il2Cpp3.Object && this.type.class.isValueType ? value.unbox() : value instanceof NativeStruct ? value.handle : value instanceof NativePointer ? value : Il2Cpp3.write(Memory.alloc(this.type.class.valueTypeSize), value, this.type)
      );
      Il2Cpp3.exports.fieldSetStaticValue(this.handle, handle2);
    }
    /** */
    toString() {
      return `${this.isThreadStatic ? `[ThreadStatic] ` : ``}${this.isStatic ? `static ` : ``}${this.type.name} ${this.name}${this.isLiteral ? ` = ${this.type.class.isEnum ? Il2Cpp3.read(this.value.handle, this.type.class.baseType) : this.value}` : ``};${this.isThreadStatic || this.isLiteral ? `` : ` // 0x${this.offset.toString(16)}`}`;
    }
    /**
     * @internal
     * Binds the current field to a {@link Il2Cpp.Object} or a
     * {@link Il2Cpp.ValueType} (also known as *instances*), so that it is
     * possible to retrieve its value - see {@link Il2Cpp.Field.value} for
     * details. \
     * Binding a static field is forbidden.
     */
    bind(instance) {
      if (this.isStatic) {
        raise(`cannot bind static field ${this.class.type.name}::${this.name} to an instance`);
      }
      const offset = this.offset - (instance instanceof Il2Cpp3.ValueType ? Il2Cpp3.Object.headerSize : 0);
      return new Proxy(this, {
        get(target, property) {
          if (property == "value") {
            return Il2Cpp3.read(instance.handle.add(offset), target.type);
          }
          return Reflect.get(target, property);
        },
        set(target, property, value) {
          if (property == "value") {
            Il2Cpp3.write(instance.handle.add(offset), value, target.type);
            return true;
          }
          return Reflect.set(target, property, value);
        }
      });
    }
  }
  __decorate([
    lazy
  ], Field2.prototype, "class", null);
  __decorate([
    lazy
  ], Field2.prototype, "flags", null);
  __decorate([
    lazy
  ], Field2.prototype, "isLiteral", null);
  __decorate([
    lazy
  ], Field2.prototype, "isStatic", null);
  __decorate([
    lazy
  ], Field2.prototype, "isThreadStatic", null);
  __decorate([
    lazy
  ], Field2.prototype, "modifier", null);
  __decorate([
    lazy
  ], Field2.prototype, "name", null);
  __decorate([
    lazy
  ], Field2.prototype, "offset", null);
  __decorate([
    lazy
  ], Field2.prototype, "type", null);
  Il2Cpp3.Field = Field2;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class GCHandle {
    handle;
    /** @internal */
    constructor(handle2) {
      this.handle = handle2;
    }
    /** Gets the object associated to this handle. */
    get target() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.gcHandleGetTarget(this.handle)).asNullable();
    }
    /** Frees this handle. */
    free() {
      return Il2Cpp3.exports.gcHandleFree(this.handle);
    }
  }
  Il2Cpp3.GCHandle = GCHandle;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Image = class Image extends NativeStruct {
    /** Gets the assembly in which the current image is defined. */
    get assembly() {
      return new Il2Cpp3.Assembly(Il2Cpp3.exports.imageGetAssembly(this));
    }
    /** Gets the amount of classes defined in this image. */
    get classCount() {
      if (Il2Cpp3.unityVersionIsBelow201830) {
        return this.classes.length;
      } else {
        return Il2Cpp3.exports.imageGetClassCount(this);
      }
    }
    /** Gets the classes defined in this image. */
    get classes() {
      if (Il2Cpp3.unityVersionIsBelow201830) {
        const types2 = this.assembly.object.method("GetTypes").invoke(false);
        const classes = globalThis.Array.from(types2, (_) => new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(_)));
        const Module2 = this.tryClass("<Module>");
        if (Module2) {
          classes.unshift(Module2);
        }
        return classes;
      } else {
        return globalThis.Array.from(globalThis.Array(this.classCount), (_, i) => new Il2Cpp3.Class(Il2Cpp3.exports.imageGetClass(this, i)));
      }
    }
    /** Gets the name of this image. */
    get name() {
      return Il2Cpp3.exports.imageGetName(this).readUtf8String();
    }
    /** Gets the class with the specified name defined in this image. */
    class(name) {
      return this.tryClass(name) ?? raise(`couldn't find class ${name} in assembly ${this.name}`);
    }
    /** Gets the class with the specified name defined in this image. */
    tryClass(name) {
      const dotIndex = name.lastIndexOf(".");
      const classNamespace = Memory.allocUtf8String(dotIndex == -1 ? "" : name.slice(0, dotIndex));
      const className = Memory.allocUtf8String(name.slice(dotIndex + 1));
      return new Il2Cpp3.Class(Il2Cpp3.exports.classFromName(this, classNamespace, className)).asNullable();
    }
  };
  __decorate([
    lazy
  ], Image.prototype, "assembly", null);
  __decorate([
    lazy
  ], Image.prototype, "classCount", null);
  __decorate([
    lazy
  ], Image.prototype, "classes", null);
  __decorate([
    lazy
  ], Image.prototype, "name", null);
  Image = __decorate([
    recycle
  ], Image);
  Il2Cpp3.Image = Image;
  getter(Il2Cpp3, "corlib", () => {
    return new Il2Cpp3.Image(Il2Cpp3.exports.getCorlib());
  }, lazy);
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class MemorySnapshot extends NativeStruct {
    /** Captures a memory snapshot. */
    static capture() {
      return new Il2Cpp3.MemorySnapshot();
    }
    /** Creates a memory snapshot with the given handle. */
    constructor(handle2 = Il2Cpp3.exports.memorySnapshotCapture()) {
      super(handle2);
    }
    /** Gets any initialized class. */
    get classes() {
      return readNativeIterator((_) => Il2Cpp3.exports.memorySnapshotGetClasses(this, _)).map((_) => new Il2Cpp3.Class(_));
    }
    /** Gets the objects tracked by this memory snapshot. */
    get objects() {
      return readNativeList((_) => Il2Cpp3.exports.memorySnapshotGetObjects(this, _)).filter((_) => !_.isNull()).map((_) => new Il2Cpp3.Object(_));
    }
    /** Frees this memory snapshot. */
    free() {
      Il2Cpp3.exports.memorySnapshotFree(this);
    }
  }
  __decorate([
    lazy
  ], MemorySnapshot.prototype, "classes", null);
  __decorate([
    lazy
  ], MemorySnapshot.prototype, "objects", null);
  Il2Cpp3.MemorySnapshot = MemorySnapshot;
  function memorySnapshot(block2) {
    const memorySnapshot2 = Il2Cpp3.MemorySnapshot.capture();
    const result = block2(memorySnapshot2);
    memorySnapshot2.free();
    return result;
  }
  Il2Cpp3.memorySnapshot = memorySnapshot;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Method extends NativeStruct {
    /** Gets the class in which this method is defined. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.methodGetClass(this));
    }
    /** Gets the flags of the current method. */
    get flags() {
      return Il2Cpp3.exports.methodGetFlags(this, NULL);
    }
    /** Gets the implementation flags of the current method. */
    get implementationFlags() {
      const implementationFlagsPointer = Memory.alloc(Process.pointerSize);
      Il2Cpp3.exports.methodGetFlags(this, implementationFlagsPointer);
      return implementationFlagsPointer.readU32();
    }
    /** */
    get fridaSignature() {
      const types2 = [];
      for (const parameter of this.parameters) {
        types2.push(parameter.type.fridaAlias);
      }
      if (!this.isStatic || Il2Cpp3.unityVersionIsBelow201830) {
        types2.unshift("pointer");
      }
      if (this.isInflated) {
        types2.push("pointer");
      }
      return types2;
    }
    /** Gets the generic parameters of this generic method. */
    get generics() {
      if (!this.isGeneric && !this.isInflated) {
        return [];
      }
      const types2 = this.object.method("GetGenericArguments").invoke();
      return globalThis.Array.from(types2).map((_) => new Il2Cpp3.Class(Il2Cpp3.exports.classFromObject(_)));
    }
    /** Determines whether this method is external. */
    get isExternal() {
      return (this.implementationFlags & 4096) != 0;
    }
    /** Determines whether this method is generic. */
    get isGeneric() {
      return !!Il2Cpp3.exports.methodIsGeneric(this);
    }
    /** Determines whether this method is inflated (generic with a concrete type parameter). */
    get isInflated() {
      return !!Il2Cpp3.exports.methodIsInflated(this);
    }
    /** Determines whether this method is static. */
    get isStatic() {
      return !Il2Cpp3.exports.methodIsInstance(this);
    }
    /** Determines whether this method is synchronized. */
    get isSynchronized() {
      return (this.implementationFlags & 32) != 0;
    }
    /** Gets the access modifier of this method. */
    get modifier() {
      switch (this.flags & 7) {
        case 1:
          return "private";
        case 2:
          return "private protected";
        case 3:
          return "internal";
        case 4:
          return "protected";
        case 5:
          return "protected internal";
        case 6:
          return "public";
      }
    }
    /** Gets the name of this method. */
    get name() {
      return Il2Cpp3.exports.methodGetName(this).readUtf8String();
    }
    /** @internal */
    get nativeFunction() {
      return new NativeFunction(this.virtualAddress, this.returnType.fridaAlias, this.fridaSignature);
    }
    /** Gets the encompassing object of the current method. */
    get object() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.methodGetObject(this, NULL));
    }
    /** Gets the amount of parameters of this method. */
    get parameterCount() {
      return Il2Cpp3.exports.methodGetParameterCount(this);
    }
    /** Gets the parameters of this method. */
    get parameters() {
      return globalThis.Array.from(globalThis.Array(this.parameterCount), (_, i) => {
        const parameterName = Il2Cpp3.exports.methodGetParameterName(this, i).readUtf8String();
        const parameterType = Il2Cpp3.exports.methodGetParameterType(this, i);
        return new Il2Cpp3.Parameter(parameterName, i, new Il2Cpp3.Type(parameterType));
      });
    }
    /** Gets the relative virtual address (RVA) of this method. */
    get relativeVirtualAddress() {
      return this.virtualAddress.sub(Il2Cpp3.module.base);
    }
    /** Gets the return type of this method. */
    get returnType() {
      return new Il2Cpp3.Type(Il2Cpp3.exports.methodGetReturnType(this));
    }
    /** Gets the virtual address (VA) of this method. */
    get virtualAddress() {
      const FilterTypeName = Il2Cpp3.corlib.class("System.Reflection.Module").initialize().field("FilterTypeName").value;
      const FilterTypeNameMethodPointer = FilterTypeName.field("method_ptr").value;
      const FilterTypeNameMethod = FilterTypeName.field("method").value;
      const offset = FilterTypeNameMethod.offsetOf((_) => _.readPointer().equals(FilterTypeNameMethodPointer)) ?? raise("couldn't find the virtual address offset in the native method struct");
      getter(Il2Cpp3.Method.prototype, "virtualAddress", function() {
        return this.handle.add(offset).readPointer();
      }, lazy);
      Il2Cpp3.corlib.class("System.Reflection.Module").method(".cctor").invoke();
      return this.virtualAddress;
    }
    /** Replaces the body of this method. */
    set implementation(block2) {
      try {
        Interceptor.replace(this.virtualAddress, this.wrap(block2));
      } catch (e) {
        switch (e.message) {
          case "access violation accessing 0x0":
            raise(`couldn't set implementation for method ${this.name} as it has a NULL virtual address`);
          case /unable to intercept function at \w+; please file a bug/.exec(e.message)?.input:
            warn(`couldn't set implementation for method ${this.name} as it may be a thunk`);
            break;
          case "already replaced this function":
            warn(`couldn't set implementation for method ${this.name} as it has already been replaced by a thunk`);
            break;
          default:
            throw e;
        }
      }
    }
    /** Creates a generic instance of the current generic method. */
    inflate(...classes) {
      if (!this.isGeneric || this.generics.length != classes.length) {
        for (const method2 of this.overloads()) {
          if (method2.isGeneric && method2.generics.length == classes.length) {
            return method2.inflate(...classes);
          }
        }
        raise(`could not find inflatable signature of method ${this.name} with ${classes.length} generic parameter(s)`);
      }
      const types2 = classes.map((_) => _.type.object);
      const typeArray = Il2Cpp3.array(Il2Cpp3.corlib.class("System.Type"), types2);
      const inflatedMethodObject = this.object.method("MakeGenericMethod", 1).invoke(typeArray);
      return new Il2Cpp3.Method(inflatedMethodObject.field("mhandle").value);
    }
    /** Invokes this method. */
    invoke(...parameters) {
      if (!this.isStatic) {
        raise(`cannot invoke non-static method ${this.name} as it must be invoked throught a Il2Cpp.Object, not a Il2Cpp.Class`);
      }
      return this.invokeRaw(NULL, ...parameters);
    }
    /** @internal */
    invokeRaw(instance, ...parameters) {
      const allocatedParameters = parameters.map(Il2Cpp3.toFridaValue);
      if (!this.isStatic || Il2Cpp3.unityVersionIsBelow201830) {
        allocatedParameters.unshift(instance);
      }
      if (this.isInflated) {
        allocatedParameters.push(this.handle);
      }
      try {
        const returnValue = this.nativeFunction(...allocatedParameters);
        return Il2Cpp3.fromFridaValue(returnValue, this.returnType);
      } catch (e) {
        if (e == null) {
          raise("an unexpected native invocation exception occurred, this is due to parameter types mismatch");
        }
        switch (e.message) {
          case "bad argument count":
            raise(`couldn't invoke method ${this.name} as it needs ${this.parameterCount} parameter(s), not ${parameters.length}`);
          case "expected a pointer":
          case "expected number":
          case "expected array with fields":
            raise(`couldn't invoke method ${this.name} using incorrect parameter types`);
        }
        throw e;
      }
    }
    /** Gets the overloaded method with the given parameter types. */
    overload(...typeNamesOrClasses) {
      const method2 = this.tryOverload(...typeNamesOrClasses);
      return method2 ?? raise(`couldn't find overloaded method ${this.name}(${typeNamesOrClasses.map((_) => _ instanceof Il2Cpp3.Class ? _.type.name : _)})`);
    }
    /** @internal */
    *overloads() {
      for (const klass of this.class.hierarchy()) {
        for (const method2 of klass.methods) {
          if (this.name == method2.name) {
            yield method2;
          }
        }
      }
    }
    /** Gets the parameter with the given name. */
    parameter(name) {
      return this.tryParameter(name) ?? raise(`couldn't find parameter ${name} in method ${this.name}`);
    }
    /** Restore the original method implementation. */
    revert() {
      Interceptor.revert(this.virtualAddress);
      Interceptor.flush();
    }
    /** Gets the overloaded method with the given parameter types. */
    tryOverload(...typeNamesOrClasses) {
      const minScore = typeNamesOrClasses.length * 1;
      const maxScore = typeNamesOrClasses.length * 2;
      let candidate = void 0;
      loop: for (const method2 of this.overloads()) {
        if (method2.parameterCount != typeNamesOrClasses.length)
          continue;
        let score = 0;
        let i = 0;
        for (const parameter of method2.parameters) {
          const desiredTypeNameOrClass = typeNamesOrClasses[i];
          if (desiredTypeNameOrClass instanceof Il2Cpp3.Class) {
            if (parameter.type.is(desiredTypeNameOrClass.type)) {
              score += 2;
            } else if (parameter.type.class.isAssignableFrom(desiredTypeNameOrClass)) {
              score += 1;
            } else {
              continue loop;
            }
          } else if (parameter.type.name == desiredTypeNameOrClass) {
            score += 2;
          } else {
            continue loop;
          }
          i++;
        }
        if (score < minScore) {
          continue;
        } else if (score == maxScore) {
          return method2;
        } else if (candidate == void 0 || score > candidate[0]) {
          candidate = [score, method2];
        } else if (score == candidate[0]) {
          let i2 = 0;
          for (const parameter of candidate[1].parameters) {
            if (parameter.type.class.isAssignableFrom(method2.parameters[i2].type.class)) {
              candidate = [score, method2];
              continue loop;
            }
            i2++;
          }
        }
      }
      return candidate?.[1];
    }
    /** Gets the parameter with the given name. */
    tryParameter(name) {
      return this.parameters.find((_) => _.name == name);
    }
    /** */
    toString() {
      return `${this.isStatic ? `static ` : ``}${this.returnType.name} ${this.name}${this.generics.length > 0 ? `<${this.generics.map((_) => _.type.name).join(",")}>` : ""}(${this.parameters.join(`, `)});${this.virtualAddress.isNull() ? `` : ` // 0x${this.relativeVirtualAddress.toString(16).padStart(8, `0`)}`}`;
    }
    /**
     * @internal
     * Binds the current method to a {@link Il2Cpp.Object} or a
     * {@link Il2Cpp.ValueType} (also known as *instances*), so that it is
     * possible to invoke it - see {@link Il2Cpp.Method.invoke} for
     * details. \
     * Binding a static method is forbidden.
     */
    bind(instance) {
      if (this.isStatic) {
        raise(`cannot bind static method ${this.class.type.name}::${this.name} to an instance`);
      }
      return new Proxy(this, {
        get(target, property, receiver) {
          switch (property) {
            case "invoke":
              const handle2 = instance instanceof Il2Cpp3.ValueType ? target.class.isValueType ? instance.handle.sub(structMethodsRequireObjectInstances() ? Il2Cpp3.Object.headerSize : 0) : raise(`cannot invoke method ${target.class.type.name}::${target.name} against a value type, you must box it first`) : target.class.isValueType ? instance.handle.add(structMethodsRequireObjectInstances() ? 0 : Il2Cpp3.Object.headerSize) : instance.handle;
              return target.invokeRaw.bind(target, handle2);
            case "overloads":
              return function* () {
                for (const method2 of target[property]()) {
                  if (!method2.isStatic) {
                    yield method2;
                  }
                }
              };
            case "inflate":
            case "overload":
            case "tryOverload":
              const member = Reflect.get(target, property).bind(receiver);
              return function(...args) {
                return member(...args)?.bind(instance);
              };
          }
          return Reflect.get(target, property);
        }
      });
    }
    /** @internal */
    wrap(block2) {
      const startIndex = +!this.isStatic | +Il2Cpp3.unityVersionIsBelow201830;
      return new NativeCallback((...args) => {
        const thisObject = this.isStatic ? this.class : this.class.isValueType ? new Il2Cpp3.ValueType(args[0].add(structMethodsRequireObjectInstances() ? Il2Cpp3.Object.headerSize : 0), this.class.type) : new Il2Cpp3.Object(args[0]);
        const parameters = this.parameters.map((_, i) => Il2Cpp3.fromFridaValue(args[i + startIndex], _.type));
        const result = block2.call(thisObject, ...parameters);
        return Il2Cpp3.toFridaValue(result);
      }, this.returnType.fridaAlias, this.fridaSignature);
    }
  }
  __decorate([
    lazy
  ], Method.prototype, "class", null);
  __decorate([
    lazy
  ], Method.prototype, "flags", null);
  __decorate([
    lazy
  ], Method.prototype, "implementationFlags", null);
  __decorate([
    lazy
  ], Method.prototype, "fridaSignature", null);
  __decorate([
    lazy
  ], Method.prototype, "generics", null);
  __decorate([
    lazy
  ], Method.prototype, "isExternal", null);
  __decorate([
    lazy
  ], Method.prototype, "isGeneric", null);
  __decorate([
    lazy
  ], Method.prototype, "isInflated", null);
  __decorate([
    lazy
  ], Method.prototype, "isStatic", null);
  __decorate([
    lazy
  ], Method.prototype, "isSynchronized", null);
  __decorate([
    lazy
  ], Method.prototype, "modifier", null);
  __decorate([
    lazy
  ], Method.prototype, "name", null);
  __decorate([
    lazy
  ], Method.prototype, "nativeFunction", null);
  __decorate([
    lazy
  ], Method.prototype, "object", null);
  __decorate([
    lazy
  ], Method.prototype, "parameterCount", null);
  __decorate([
    lazy
  ], Method.prototype, "parameters", null);
  __decorate([
    lazy
  ], Method.prototype, "relativeVirtualAddress", null);
  __decorate([
    lazy
  ], Method.prototype, "returnType", null);
  Il2Cpp3.Method = Method;
  let structMethodsRequireObjectInstances = () => {
    const object = Il2Cpp3.corlib.class("System.Int64").alloc();
    object.field("m_value").value = 3735928559;
    const result = object.method("Equals", 1).overload(object.class).invokeRaw(object, 3735928559);
    return (structMethodsRequireObjectInstances = () => result)();
  };
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Object2 extends NativeStruct {
    /** Gets the Il2CppObject struct size, possibly equal to `Process.pointerSize * 2`. */
    static get headerSize() {
      return Il2Cpp3.corlib.class("System.Object").instanceSize;
    }
    /**
     * Returns the same object, but having its parent class as class.
     * It basically is the C# `base` keyword, so that parent members can be
     * accessed.
     *
     * **Example** \
     * Consider the following classes:
     * ```csharp
     * class Foo
     * {
     *     int foo()
     *     {
     *          return 1;
     *     }
     * }
     * class Bar : Foo
     * {
     *     new int foo()
     *     {
     *          return 2;
     *     }
     * }
     * ```
     * then:
     * ```ts
     * const Bar: Il2Cpp.Class = ...;
     * const bar = Bar.new();
     *
     * console.log(bar.foo()); // 2
     * console.log(bar.base.foo()); // 1
     * ```
     */
    get base() {
      if (this.class.parent == null) {
        raise(`class ${this.class.type.name} has no parent`);
      }
      return new Proxy(this, {
        get(target, property, receiver) {
          if (property == "class") {
            return Reflect.get(target, property).parent;
          } else if (property == "base") {
            return Reflect.getOwnPropertyDescriptor(Il2Cpp3.Object.prototype, property).get.bind(receiver)();
          }
          return Reflect.get(target, property);
        }
      });
    }
    /** Gets the class of this object. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.objectGetClass(this));
    }
    /** Returns a monitor for this object. */
    get monitor() {
      return new Il2Cpp3.Object.Monitor(this);
    }
    /** Gets the size of the current object. */
    get size() {
      return Il2Cpp3.exports.objectGetSize(this);
    }
    /** Gets the non-static field with the given name of the current class hierarchy. */
    field(name) {
      return this.tryField(name) ?? raise(`couldn't find non-static field ${name} in hierarchy of class ${this.class.type.name}`);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy. */
    method(name, parameterCount = -1) {
      return this.tryMethod(name, parameterCount) ?? raise(`couldn't find non-static method ${name} in hierarchy of class ${this.class.type.name}`);
    }
    /** Creates a reference to this object. */
    ref(pin) {
      return new Il2Cpp3.GCHandle(Il2Cpp3.exports.gcHandleNew(this, +pin));
    }
    /** Gets the correct virtual method from the given virtual method. */
    virtualMethod(method2) {
      return new Il2Cpp3.Method(Il2Cpp3.exports.objectGetVirtualMethod(this, method2)).bind(this);
    }
    /** Gets the non-static field with the given name of the current class hierarchy, if it exists. */
    tryField(name) {
      const field = this.class.tryField(name);
      if (field?.isStatic) {
        for (const klass of this.class.hierarchy({ includeCurrent: false })) {
          for (const field2 of klass.fields) {
            if (field2.name == name && !field2.isStatic) {
              return field2.bind(this);
            }
          }
        }
        return void 0;
      }
      return field?.bind(this);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy, if it exists. */
    tryMethod(name, parameterCount = -1) {
      const method2 = this.class.tryMethod(name, parameterCount);
      if (method2?.isStatic) {
        for (const klass of this.class.hierarchy()) {
          for (const method3 of klass.methods) {
            if (method3.name == name && !method3.isStatic && (parameterCount < 0 || method3.parameterCount == parameterCount)) {
              return method3.bind(this);
            }
          }
        }
        return void 0;
      }
      return method2?.bind(this);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : this.method("ToString", 0).invoke().content ?? "null";
    }
    /** Unboxes the value type (either a primitive, a struct or an enum) out of this object. */
    unbox() {
      return this.class.isValueType ? new Il2Cpp3.ValueType(Il2Cpp3.exports.objectUnbox(this), this.class.type) : raise(`couldn't unbox instances of ${this.class.type.name} as they are not value types`);
    }
    /** Creates a weak reference to this object. */
    weakRef(trackResurrection) {
      return new Il2Cpp3.GCHandle(Il2Cpp3.exports.gcHandleNewWeakRef(this, +trackResurrection));
    }
  }
  __decorate([
    lazy
  ], Object2.prototype, "class", null);
  __decorate([
    lazy
  ], Object2.prototype, "size", null);
  __decorate([
    lazy
  ], Object2, "headerSize", null);
  Il2Cpp3.Object = Object2;
  (function(Object3) {
    class Monitor {
      handle;
      /** @internal */
      constructor(handle2) {
        this.handle = handle2;
      }
      /** Acquires an exclusive lock on the current object. */
      enter() {
        return Il2Cpp3.exports.monitorEnter(this.handle);
      }
      /** Release an exclusive lock on the current object. */
      exit() {
        return Il2Cpp3.exports.monitorExit(this.handle);
      }
      /** Notifies a thread in the waiting queue of a change in the locked object's state. */
      pulse() {
        return Il2Cpp3.exports.monitorPulse(this.handle);
      }
      /** Notifies all waiting threads of a change in the object's state. */
      pulseAll() {
        return Il2Cpp3.exports.monitorPulseAll(this.handle);
      }
      /** Attempts to acquire an exclusive lock on the current object. */
      tryEnter(timeout) {
        return !!Il2Cpp3.exports.monitorTryEnter(this.handle, timeout);
      }
      /** Releases the lock on an object and attempts to block the current thread until it reacquires the lock. */
      tryWait(timeout) {
        return !!Il2Cpp3.exports.monitorTryWait(this.handle, timeout);
      }
      /** Releases the lock on an object and blocks the current thread until it reacquires the lock. */
      wait() {
        return Il2Cpp3.exports.monitorWait(this.handle);
      }
    }
    Object3.Monitor = Monitor;
  })(Object2 = Il2Cpp3.Object || (Il2Cpp3.Object = {}));
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Parameter {
    /** Name of this parameter. */
    name;
    /** Position of this parameter. */
    position;
    /** Type of this parameter. */
    type;
    constructor(name, position, type) {
      this.name = name;
      this.position = position;
      this.type = type;
    }
    /** */
    toString() {
      return `${this.type.name} ${this.name}`;
    }
  }
  Il2Cpp3.Parameter = Parameter;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Pointer extends NativeStruct {
    type;
    constructor(handle2, type) {
      super(handle2);
      this.type = type;
    }
    /** Gets the element at the given index. */
    get(index) {
      return Il2Cpp3.read(this.handle.add(index * this.type.class.arrayElementSize), this.type);
    }
    /** Reads the given amount of elements starting at the given offset. */
    read(length, offset = 0) {
      const values = new globalThis.Array(length);
      for (let i = 0; i < length; i++) {
        values[i] = this.get(i + offset);
      }
      return values;
    }
    /** Sets the given element at the given index */
    set(index, value) {
      Il2Cpp3.write(this.handle.add(index * this.type.class.arrayElementSize), value, this.type);
    }
    /** */
    toString() {
      return this.handle.toString();
    }
    /** Writes the given elements starting at the given index. */
    write(values, offset = 0) {
      for (let i = 0; i < values.length; i++) {
        this.set(i + offset, values[i]);
      }
    }
  }
  Il2Cpp3.Pointer = Pointer;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Reference extends NativeStruct {
    type;
    constructor(handle2, type) {
      super(handle2);
      this.type = type;
    }
    /** Gets the element referenced by the current reference. */
    get value() {
      return Il2Cpp3.read(this.handle, this.type);
    }
    /** Sets the element referenced by the current reference. */
    set value(value) {
      Il2Cpp3.write(this.handle, value, this.type);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : `->${this.value}`;
    }
  }
  Il2Cpp3.Reference = Reference;
  function reference(value, type) {
    const handle2 = Memory.alloc(Process.pointerSize);
    switch (typeof value) {
      case "boolean":
        return new Il2Cpp3.Reference(handle2.writeS8(+value), Il2Cpp3.corlib.class("System.Boolean").type);
      case "number":
        switch (type?.enumValue) {
          case Il2Cpp3.Type.Enum.UBYTE:
            return new Il2Cpp3.Reference(handle2.writeU8(value), type);
          case Il2Cpp3.Type.Enum.BYTE:
            return new Il2Cpp3.Reference(handle2.writeS8(value), type);
          case Il2Cpp3.Type.Enum.CHAR:
          case Il2Cpp3.Type.Enum.USHORT:
            return new Il2Cpp3.Reference(handle2.writeU16(value), type);
          case Il2Cpp3.Type.Enum.SHORT:
            return new Il2Cpp3.Reference(handle2.writeS16(value), type);
          case Il2Cpp3.Type.Enum.UINT:
            return new Il2Cpp3.Reference(handle2.writeU32(value), type);
          case Il2Cpp3.Type.Enum.INT:
            return new Il2Cpp3.Reference(handle2.writeS32(value), type);
          case Il2Cpp3.Type.Enum.ULONG:
            return new Il2Cpp3.Reference(handle2.writeU64(value), type);
          case Il2Cpp3.Type.Enum.LONG:
            return new Il2Cpp3.Reference(handle2.writeS64(value), type);
          case Il2Cpp3.Type.Enum.FLOAT:
            return new Il2Cpp3.Reference(handle2.writeFloat(value), type);
          case Il2Cpp3.Type.Enum.DOUBLE:
            return new Il2Cpp3.Reference(handle2.writeDouble(value), type);
        }
      case "object":
        if (value instanceof Il2Cpp3.ValueType || value instanceof Il2Cpp3.Pointer) {
          return new Il2Cpp3.Reference(value.handle, value.type);
        } else if (value instanceof Il2Cpp3.Object) {
          return new Il2Cpp3.Reference(handle2.writePointer(value), value.class.type);
        } else if (value instanceof Il2Cpp3.String || value instanceof Il2Cpp3.Array) {
          return new Il2Cpp3.Reference(handle2.writePointer(value), value.object.class.type);
        } else if (value instanceof NativePointer) {
          switch (type?.enumValue) {
            case Il2Cpp3.Type.Enum.NUINT:
            case Il2Cpp3.Type.Enum.NINT:
              return new Il2Cpp3.Reference(handle2.writePointer(value), type);
          }
        } else if (value instanceof Int64) {
          return new Il2Cpp3.Reference(handle2.writeS64(value), Il2Cpp3.corlib.class("System.Int64").type);
        } else if (value instanceof UInt64) {
          return new Il2Cpp3.Reference(handle2.writeU64(value), Il2Cpp3.corlib.class("System.UInt64").type);
        }
      default:
        raise(`couldn't create a reference to ${value} using an unhandled type ${type?.name}`);
    }
  }
  Il2Cpp3.reference = reference;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class String2 extends NativeStruct {
    /** Gets the content of this string. */
    get content() {
      return Il2Cpp3.exports.stringGetChars(this).readUtf16String(this.length);
    }
    /** @unsafe Sets the content of this string - it may write out of bounds! */
    set content(value) {
      const offset = Il2Cpp3.string("vfsfitvnm").handle.offsetOf((_) => _.readInt() == 9) ?? raise("couldn't find the length offset in the native string struct");
      globalThis.Object.defineProperty(Il2Cpp3.String.prototype, "content", {
        set(value2) {
          Il2Cpp3.exports.stringGetChars(this).writeUtf16String(value2 ?? "");
          this.handle.add(offset).writeS32(value2?.length ?? 0);
        }
      });
      this.content = value;
    }
    /** Gets the length of this string. */
    get length() {
      return Il2Cpp3.exports.stringGetLength(this);
    }
    /** Gets the encompassing object of the current string. */
    get object() {
      return new Il2Cpp3.Object(this);
    }
    /** */
    toString() {
      return this.isNull() ? "null" : `"${this.content}"`;
    }
  }
  Il2Cpp3.String = String2;
  function string(content) {
    return new Il2Cpp3.String(Il2Cpp3.exports.stringNew(Memory.allocUtf8String(content ?? "")));
  }
  Il2Cpp3.string = string;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class Thread2 extends NativeStruct {
    /** Gets the native id of the current thread. */
    get id() {
      let get2 = function() {
        return this.internal.field("thread_id").value.toNumber();
      };
      if (Process.platform != "windows") {
        const currentThreadId = Process.getCurrentThreadId();
        const currentPosixThread = ptr(get2.apply(Il2Cpp3.currentThread));
        const offset = currentPosixThread.offsetOf((_) => _.readS32() == currentThreadId, 1024) ?? raise(`couldn't find the offset for determining the kernel id of a posix thread`);
        const _get = get2;
        get2 = function() {
          return ptr(_get.apply(this)).add(offset).readS32();
        };
      }
      getter(Il2Cpp3.Thread.prototype, "id", get2, lazy);
      return this.id;
    }
    /** Gets the encompassing internal object (System.Threding.InternalThreead) of the current thread. */
    get internal() {
      return this.object.tryField("internal_thread")?.value ?? this.object;
    }
    /** Determines whether the current thread is the garbage collector finalizer one. */
    get isFinalizer() {
      return !Il2Cpp3.exports.threadIsVm(this);
    }
    /** Gets the managed id of the current thread. */
    get managedId() {
      return this.object.method("get_ManagedThreadId").invoke();
    }
    /** Gets the encompassing object of the current thread. */
    get object() {
      return new Il2Cpp3.Object(this);
    }
    /** @internal */
    get staticData() {
      return this.internal.field("static_data").value;
    }
    /** @internal */
    get synchronizationContext() {
      const get_ExecutionContext = this.object.tryMethod("GetMutableExecutionContext") ?? this.object.method("get_ExecutionContext");
      const executionContext = get_ExecutionContext.invoke();
      const synchronizationContext = executionContext.tryField("_syncContext")?.value ?? executionContext.tryMethod("get_SynchronizationContext")?.invoke() ?? this.tryLocalValue(Il2Cpp3.corlib.class("System.Threading.SynchronizationContext"));
      return synchronizationContext?.asNullable() ?? null;
    }
    /** Detaches the thread from the application domain. */
    detach() {
      return Il2Cpp3.exports.threadDetach(this);
    }
    /** Schedules a callback on the current thread. */
    schedule(block2) {
      const Post = this.synchronizationContext?.tryMethod("Post");
      if (Post == null) {
        return Process.runOnThread(this.id, block2);
      }
      return new Promise((resolve) => {
        const delegate = Il2Cpp3.delegate(Il2Cpp3.corlib.class("System.Threading.SendOrPostCallback"), () => {
          const result = block2();
          setImmediate(() => resolve(result));
        });
        Script.bindWeak(globalThis, () => {
          delegate.field("method_ptr").value = delegate.field("invoke_impl").value = Il2Cpp3.exports.domainGet;
        });
        Post.invoke(delegate, NULL);
      });
    }
    /** @internal */
    tryLocalValue(klass) {
      for (let i = 0; i < 16; i++) {
        const base = this.staticData.add(i * Process.pointerSize).readPointer();
        if (!base.isNull()) {
          const object = new Il2Cpp3.Object(base.readPointer()).asNullable();
          if (object?.class?.isSubclassOf(klass, false)) {
            return object;
          }
        }
      }
    }
  }
  __decorate([
    lazy
  ], Thread2.prototype, "internal", null);
  __decorate([
    lazy
  ], Thread2.prototype, "isFinalizer", null);
  __decorate([
    lazy
  ], Thread2.prototype, "managedId", null);
  __decorate([
    lazy
  ], Thread2.prototype, "object", null);
  __decorate([
    lazy
  ], Thread2.prototype, "staticData", null);
  __decorate([
    lazy
  ], Thread2.prototype, "synchronizationContext", null);
  Il2Cpp3.Thread = Thread2;
  getter(Il2Cpp3, "attachedThreads", () => {
    if (Il2Cpp3.exports.threadGetAttachedThreads.isNull()) {
      const currentThreadHandle = Il2Cpp3.currentThread?.handle ?? raise("Current thread is not attached to IL2CPP");
      const pattern = currentThreadHandle.toMatchPattern();
      const threads = [];
      for (const range of Process.enumerateRanges("rw-")) {
        if (range.file == void 0) {
          const matches = Memory.scanSync(range.base, range.size, pattern);
          if (matches.length == 1) {
            while (true) {
              const handle2 = matches[0].address.sub(matches[0].size * threads.length).readPointer();
              if (handle2.isNull() || !handle2.readPointer().equals(currentThreadHandle.readPointer())) {
                break;
              }
              threads.unshift(new Il2Cpp3.Thread(handle2));
            }
            break;
          }
        }
      }
      return threads;
    }
    return readNativeList(Il2Cpp3.exports.threadGetAttachedThreads).map((_) => new Il2Cpp3.Thread(_));
  });
  getter(Il2Cpp3, "currentThread", () => {
    return new Il2Cpp3.Thread(Il2Cpp3.exports.threadGetCurrent()).asNullable();
  });
  getter(Il2Cpp3, "mainThread", () => {
    return Il2Cpp3.attachedThreads[0];
  });
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  let Type = class Type extends NativeStruct {
    /** */
    static get Enum() {
      const _ = (_2, block2 = (_3) => _3) => block2(Il2Cpp3.corlib.class(_2)).type.enumValue;
      const initial = {
        VOID: _("System.Void"),
        BOOLEAN: _("System.Boolean"),
        CHAR: _("System.Char"),
        BYTE: _("System.SByte"),
        UBYTE: _("System.Byte"),
        SHORT: _("System.Int16"),
        USHORT: _("System.UInt16"),
        INT: _("System.Int32"),
        UINT: _("System.UInt32"),
        LONG: _("System.Int64"),
        ULONG: _("System.UInt64"),
        NINT: _("System.IntPtr"),
        NUINT: _("System.UIntPtr"),
        FLOAT: _("System.Single"),
        DOUBLE: _("System.Double"),
        POINTER: _("System.IntPtr", (_2) => _2.field("m_value")),
        VALUE_TYPE: _("System.Decimal"),
        OBJECT: _("System.Object"),
        STRING: _("System.String"),
        CLASS: _("System.Array"),
        ARRAY: _("System.Void", (_2) => _2.arrayClass),
        NARRAY: _("System.Void", (_2) => new Il2Cpp3.Class(Il2Cpp3.exports.classGetArrayClass(_2, 2))),
        GENERIC_INSTANCE: _("System.Int32", (_2) => _2.interfaces.find((_3) => _3.name.endsWith("`1")))
      };
      Reflect.defineProperty(this, "Enum", { value: initial });
      return addFlippedEntries({
        ...initial,
        VAR: _("System.Action`1", (_2) => _2.generics[0]),
        MVAR: _("System.Array", (_2) => _2.method("AsReadOnly", 1).generics[0])
      });
    }
    /** Gets the class of this type. */
    get class() {
      return new Il2Cpp3.Class(Il2Cpp3.exports.typeGetClass(this));
    }
    /** */
    get fridaAlias() {
      function getValueTypeFields(type) {
        const instanceFields = type.class.fields.filter((_) => !_.isStatic);
        return instanceFields.length == 0 ? ["char"] : instanceFields.map((_) => _.type.fridaAlias);
      }
      if (this.isByReference) {
        return "pointer";
      }
      switch (this.enumValue) {
        case Il2Cpp3.Type.Enum.VOID:
          return "void";
        case Il2Cpp3.Type.Enum.BOOLEAN:
          return "bool";
        case Il2Cpp3.Type.Enum.CHAR:
          return "uchar";
        case Il2Cpp3.Type.Enum.BYTE:
          return "int8";
        case Il2Cpp3.Type.Enum.UBYTE:
          return "uint8";
        case Il2Cpp3.Type.Enum.SHORT:
          return "int16";
        case Il2Cpp3.Type.Enum.USHORT:
          return "uint16";
        case Il2Cpp3.Type.Enum.INT:
          return "int32";
        case Il2Cpp3.Type.Enum.UINT:
          return "uint32";
        case Il2Cpp3.Type.Enum.LONG:
          return "int64";
        case Il2Cpp3.Type.Enum.ULONG:
          return "uint64";
        case Il2Cpp3.Type.Enum.FLOAT:
          return "float";
        case Il2Cpp3.Type.Enum.DOUBLE:
          return "double";
        case Il2Cpp3.Type.Enum.NINT:
        case Il2Cpp3.Type.Enum.NUINT:
        case Il2Cpp3.Type.Enum.POINTER:
        case Il2Cpp3.Type.Enum.STRING:
        case Il2Cpp3.Type.Enum.ARRAY:
        case Il2Cpp3.Type.Enum.NARRAY:
          return "pointer";
        case Il2Cpp3.Type.Enum.VALUE_TYPE:
          return this.class.isEnum ? this.class.baseType.fridaAlias : getValueTypeFields(this);
        case Il2Cpp3.Type.Enum.CLASS:
        case Il2Cpp3.Type.Enum.OBJECT:
        case Il2Cpp3.Type.Enum.GENERIC_INSTANCE:
          return this.class.isStruct ? getValueTypeFields(this) : this.class.isEnum ? this.class.baseType.fridaAlias : "pointer";
        default:
          return "pointer";
      }
    }
    /** Determines whether this type is passed by reference. */
    get isByReference() {
      return this.name.endsWith("&");
    }
    /** Determines whether this type is primitive. */
    get isPrimitive() {
      switch (this.enumValue) {
        case Il2Cpp3.Type.Enum.BOOLEAN:
        case Il2Cpp3.Type.Enum.CHAR:
        case Il2Cpp3.Type.Enum.BYTE:
        case Il2Cpp3.Type.Enum.UBYTE:
        case Il2Cpp3.Type.Enum.SHORT:
        case Il2Cpp3.Type.Enum.USHORT:
        case Il2Cpp3.Type.Enum.INT:
        case Il2Cpp3.Type.Enum.UINT:
        case Il2Cpp3.Type.Enum.LONG:
        case Il2Cpp3.Type.Enum.ULONG:
        case Il2Cpp3.Type.Enum.FLOAT:
        case Il2Cpp3.Type.Enum.DOUBLE:
        case Il2Cpp3.Type.Enum.NINT:
        case Il2Cpp3.Type.Enum.NUINT:
          return true;
        default:
          return false;
      }
    }
    /** Gets the name of this type. */
    get name() {
      const handle2 = Il2Cpp3.exports.typeGetName(this);
      try {
        return handle2.readUtf8String();
      } finally {
        Il2Cpp3.free(handle2);
      }
    }
    /** Gets the encompassing object of the current type. */
    get object() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.typeGetObject(this));
    }
    /** Gets the {@link Il2Cpp.Type.Enum} value of the current type. */
    get enumValue() {
      return Il2Cpp3.exports.typeGetTypeEnum(this);
    }
    is(other) {
      if (Il2Cpp3.exports.typeEquals.isNull()) {
        return this.object.method("Equals").invoke(other.object);
      }
      return !!Il2Cpp3.exports.typeEquals(this, other);
    }
    /** */
    toString() {
      return this.name;
    }
  };
  __decorate([
    lazy
  ], Type.prototype, "class", null);
  __decorate([
    lazy
  ], Type.prototype, "fridaAlias", null);
  __decorate([
    lazy
  ], Type.prototype, "isByReference", null);
  __decorate([
    lazy
  ], Type.prototype, "isPrimitive", null);
  __decorate([
    lazy
  ], Type.prototype, "name", null);
  __decorate([
    lazy
  ], Type.prototype, "object", null);
  __decorate([
    lazy
  ], Type.prototype, "enumValue", null);
  __decorate([
    lazy
  ], Type, "Enum", null);
  Type = __decorate([
    recycle
  ], Type);
  Il2Cpp3.Type = Type;
})(Il2Cpp2 || (Il2Cpp2 = {}));
var Il2Cpp2;
(function(Il2Cpp3) {
  class ValueType extends NativeStruct {
    type;
    constructor(handle2, type) {
      super(handle2);
      this.type = type;
    }
    /** Boxes the current value type in a object. */
    box() {
      return new Il2Cpp3.Object(Il2Cpp3.exports.valueTypeBox(this.type.class, this));
    }
    /** Gets the non-static field with the given name of the current class hierarchy. */
    field(name) {
      return this.tryField(name) ?? raise(`couldn't find non-static field ${name} in hierarchy of class ${this.type.name}`);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy. */
    method(name, parameterCount = -1) {
      return this.tryMethod(name, parameterCount) ?? raise(`couldn't find non-static method ${name} in hierarchy of class ${this.type.name}`);
    }
    /** Gets the non-static field with the given name of the current class hierarchy, if it exists. */
    tryField(name) {
      const field = this.type.class.tryField(name);
      if (field?.isStatic) {
        for (const klass of this.type.class.hierarchy()) {
          for (const field2 of klass.fields) {
            if (field2.name == name && !field2.isStatic) {
              return field2.bind(this);
            }
          }
        }
        return void 0;
      }
      return field?.bind(this);
    }
    /** Gets the non-static method with the given name (and optionally parameter count) of the current class hierarchy, if it exists. */
    tryMethod(name, parameterCount = -1) {
      const method2 = this.type.class.tryMethod(name, parameterCount);
      if (method2?.isStatic) {
        for (const klass of this.type.class.hierarchy()) {
          for (const method3 of klass.methods) {
            if (method3.name == name && !method3.isStatic && (parameterCount < 0 || method3.parameterCount == parameterCount)) {
              return method3.bind(this);
            }
          }
        }
        return void 0;
      }
      return method2?.bind(this);
    }
    /** */
    toString() {
      const ToString = this.method("ToString", 0);
      return this.isNull() ? "null" : (
        // If ToString is defined within a value type class, we can
        // avoid a boxing operation.
        ToString.class.isValueType ? ToString.invoke().content ?? "null" : this.box().toString() ?? "null"
      );
    }
  }
  Il2Cpp3.ValueType = ValueType;
})(Il2Cpp2 || (Il2Cpp2 = {}));
globalThis.Il2Cpp = Il2Cpp2;

// node_modules/frida-objc-bridge/lib/api.js
var cachedApi = null;
var defaultInvocationOptions = {
  exceptions: "propagate"
};
function getApi() {
  if (cachedApi !== null) {
    return cachedApi;
  }
  const temporaryApi = {};
  const pending = [
    {
      module: "libsystem_malloc.dylib",
      functions: {
        "free": ["void", ["pointer"]]
      }
    },
    {
      module: "libobjc.A.dylib",
      functions: {
        "objc_msgSend": function(address) {
          this.objc_msgSend = address;
        },
        "objc_msgSend_stret": function(address) {
          this.objc_msgSend_stret = address;
        },
        "objc_msgSend_fpret": function(address) {
          this.objc_msgSend_fpret = address;
        },
        "objc_msgSendSuper": function(address) {
          this.objc_msgSendSuper = address;
        },
        "objc_msgSendSuper_stret": function(address) {
          this.objc_msgSendSuper_stret = address;
        },
        "objc_msgSendSuper_fpret": function(address) {
          this.objc_msgSendSuper_fpret = address;
        },
        "objc_getClassList": ["int", ["pointer", "int"]],
        "objc_lookUpClass": ["pointer", ["pointer"]],
        "objc_allocateClassPair": ["pointer", ["pointer", "pointer", "pointer"]],
        "objc_disposeClassPair": ["void", ["pointer"]],
        "objc_registerClassPair": ["void", ["pointer"]],
        "class_isMetaClass": ["bool", ["pointer"]],
        "class_getName": ["pointer", ["pointer"]],
        "class_getImageName": ["pointer", ["pointer"]],
        "class_copyProtocolList": ["pointer", ["pointer", "pointer"]],
        "class_copyMethodList": ["pointer", ["pointer", "pointer"]],
        "class_getClassMethod": ["pointer", ["pointer", "pointer"]],
        "class_getInstanceMethod": ["pointer", ["pointer", "pointer"]],
        "class_getSuperclass": ["pointer", ["pointer"]],
        "class_addProtocol": ["bool", ["pointer", "pointer"]],
        "class_addMethod": ["bool", ["pointer", "pointer", "pointer", "pointer"]],
        "class_copyIvarList": ["pointer", ["pointer", "pointer"]],
        "objc_getProtocol": ["pointer", ["pointer"]],
        "objc_copyProtocolList": ["pointer", ["pointer"]],
        "objc_allocateProtocol": ["pointer", ["pointer"]],
        "objc_registerProtocol": ["void", ["pointer"]],
        "protocol_getName": ["pointer", ["pointer"]],
        "protocol_copyMethodDescriptionList": ["pointer", ["pointer", "bool", "bool", "pointer"]],
        "protocol_copyPropertyList": ["pointer", ["pointer", "pointer"]],
        "protocol_copyProtocolList": ["pointer", ["pointer", "pointer"]],
        "protocol_addProtocol": ["void", ["pointer", "pointer"]],
        "protocol_addMethodDescription": ["void", ["pointer", "pointer", "pointer", "bool", "bool"]],
        "ivar_getName": ["pointer", ["pointer"]],
        "ivar_getTypeEncoding": ["pointer", ["pointer"]],
        "ivar_getOffset": ["pointer", ["pointer"]],
        "object_isClass": ["bool", ["pointer"]],
        "object_getClass": ["pointer", ["pointer"]],
        "object_getClassName": ["pointer", ["pointer"]],
        "method_getName": ["pointer", ["pointer"]],
        "method_getTypeEncoding": ["pointer", ["pointer"]],
        "method_getImplementation": ["pointer", ["pointer"]],
        "method_setImplementation": ["pointer", ["pointer", "pointer"]],
        "property_getName": ["pointer", ["pointer"]],
        "property_copyAttributeList": ["pointer", ["pointer", "pointer"]],
        "sel_getName": ["pointer", ["pointer"]],
        "sel_registerName": ["pointer", ["pointer"]],
        "class_getInstanceSize": ["pointer", ["pointer"]]
      },
      optionals: {
        "objc_msgSend_stret": "ABI",
        "objc_msgSend_fpret": "ABI",
        "objc_msgSendSuper_stret": "ABI",
        "objc_msgSendSuper_fpret": "ABI",
        "object_isClass": "iOS8"
      }
    },
    {
      module: "libdispatch.dylib",
      functions: {
        "dispatch_async_f": ["void", ["pointer", "pointer", "pointer"]]
      },
      variables: {
        "_dispatch_main_q": function(address) {
          this._dispatch_main_q = address;
        }
      }
    }
  ];
  let remaining = 0;
  pending.forEach(function(api3) {
    const isObjCApi = api3.module === "libobjc.A.dylib";
    const functions = api3.functions || {};
    const variables = api3.variables || {};
    const optionals = api3.optionals || {};
    remaining += Object.keys(functions).length + Object.keys(variables).length;
    const exportByName = (Process.findModuleByName(api3.module)?.enumerateExports() ?? []).reduce(function(result, exp) {
      result[exp.name] = exp;
      return result;
    }, {});
    Object.keys(functions).forEach(function(name) {
      const exp = exportByName[name];
      if (exp !== void 0 && exp.type === "function") {
        const signature2 = functions[name];
        if (typeof signature2 === "function") {
          signature2.call(temporaryApi, exp.address);
          if (isObjCApi)
            signature2.call(temporaryApi, exp.address);
        } else {
          temporaryApi[name] = new NativeFunction(exp.address, signature2[0], signature2[1], defaultInvocationOptions);
          if (isObjCApi)
            temporaryApi[name] = temporaryApi[name];
        }
        remaining--;
      } else {
        const optional = optionals[name];
        if (optional)
          remaining--;
      }
    });
    Object.keys(variables).forEach(function(name) {
      const exp = exportByName[name];
      if (exp !== void 0 && exp.type === "variable") {
        const handler = variables[name];
        handler.call(temporaryApi, exp.address);
        remaining--;
      }
    });
  });
  if (remaining === 0) {
    if (!temporaryApi.objc_msgSend_stret)
      temporaryApi.objc_msgSend_stret = temporaryApi.objc_msgSend;
    if (!temporaryApi.objc_msgSend_fpret)
      temporaryApi.objc_msgSend_fpret = temporaryApi.objc_msgSend;
    if (!temporaryApi.objc_msgSendSuper_stret)
      temporaryApi.objc_msgSendSuper_stret = temporaryApi.objc_msgSendSuper;
    if (!temporaryApi.objc_msgSendSuper_fpret)
      temporaryApi.objc_msgSendSuper_fpret = temporaryApi.objc_msgSendSuper;
    cachedApi = temporaryApi;
  }
  return cachedApi;
}

// node_modules/frida-objc-bridge/lib/fastpaths.js
var code2 = `#include <glib.h>
#include <ptrauth.h>

#define KERN_SUCCESS 0
#define MALLOC_PTR_IN_USE_RANGE_TYPE 1
#if defined (HAVE_I386) && GLIB_SIZEOF_VOID_P == 8
# define OBJC_ISA_MASK 0x7ffffffffff8ULL
#elif defined (HAVE_ARM64)
# define OBJC_ISA_MASK 0xffffffff8ULL
#endif

typedef struct _ChooseContext ChooseContext;

typedef struct _malloc_zone_t malloc_zone_t;
typedef struct _malloc_introspection_t malloc_introspection_t;
typedef struct _vm_range_t vm_range_t;

typedef gpointer Class;
typedef int kern_return_t;
typedef guint mach_port_t;
typedef mach_port_t task_t;
typedef guintptr vm_offset_t;
typedef guintptr vm_size_t;
typedef vm_offset_t vm_address_t;

struct _ChooseContext
{
  GHashTable * classes;
  GArray * matches;
};

struct _malloc_zone_t
{
  void * reserved1;
  void * reserved2;
  size_t (* size) (struct _malloc_zone_t * zone, const void * ptr);
  void * (* malloc) (struct _malloc_zone_t * zone, size_t size);
  void * (* calloc) (struct _malloc_zone_t * zone, size_t num_items, size_t size);
  void * (* valloc) (struct _malloc_zone_t * zone, size_t size);
  void (* free) (struct _malloc_zone_t * zone, void * ptr);
  void * (* realloc) (struct _malloc_zone_t * zone, void * ptr, size_t size);
  void (* destroy) (struct _malloc_zone_t * zone);
  const char * zone_name;

  unsigned (* batch_malloc) (struct _malloc_zone_t * zone, size_t size, void ** results, unsigned num_requested);
  void (* batch_free) (struct _malloc_zone_t * zone, void ** to_be_freed, unsigned num_to_be_freed);

  malloc_introspection_t * introspect;
};

typedef kern_return_t (* memory_reader_t) (task_t remote_task, vm_address_t remote_address, vm_size_t size, void ** local_memory);
typedef void (* vm_range_recorder_t) (task_t task, void * user_data, unsigned type, vm_range_t * ranges, unsigned count);
typedef kern_return_t (* enumerator_func) (task_t task, void * user_data, unsigned type_mask, vm_address_t zone_address, memory_reader_t reader,
      vm_range_recorder_t recorder);

struct _malloc_introspection_t
{
  enumerator_func enumerator;
};

struct _vm_range_t
{
  vm_address_t address;
  vm_size_t size;
};

extern int objc_getClassList (Class * buffer, int buffer_count);
extern Class class_getSuperclass (Class cls);
extern size_t class_getInstanceSize (Class cls);
extern kern_return_t malloc_get_all_zones (task_t task, memory_reader_t reader, vm_address_t ** addresses, unsigned * count);

static void collect_subclasses (Class klass, GHashTable * result);
static void collect_matches_in_ranges (task_t task, void * user_data, unsigned type, vm_range_t * ranges, unsigned count);
static kern_return_t read_local_memory (task_t remote_task, vm_address_t remote_address, vm_size_t size, void ** local_memory);

extern mach_port_t selfTask;

gpointer *
choose (Class * klass,
        gboolean consider_subclasses,
        guint * count)
{
  ChooseContext ctx;
  GHashTable * classes;
  vm_address_t * malloc_zone_addresses;
  unsigned malloc_zone_count, i;

  classes = g_hash_table_new_full (NULL, NULL, NULL, NULL);
  ctx.classes = classes;
  ctx.matches = g_array_new (FALSE, FALSE, sizeof (gpointer));
  if (consider_subclasses)
    collect_subclasses (klass, classes);
  else
    g_hash_table_insert (classes, klass, GSIZE_TO_POINTER (class_getInstanceSize (klass)));

  malloc_zone_count = 0;
  malloc_get_all_zones (selfTask, read_local_memory, &malloc_zone_addresses, &malloc_zone_count);

  for (i = 0; i != malloc_zone_count; i++)
  {
    vm_address_t zone_address = malloc_zone_addresses[i];
    malloc_zone_t * zone = (malloc_zone_t *) zone_address;
    enumerator_func enumerator;

    if (zone != NULL && zone->introspect != NULL &&
        (enumerator = (ptrauth_strip (zone->introspect, ptrauth_key_asda))->enumerator) != NULL)
    {
      enumerator = ptrauth_sign_unauthenticated (
          ptrauth_strip (enumerator, ptrauth_key_asia),
          ptrauth_key_asia, 0);

      enumerator (selfTask, &ctx, MALLOC_PTR_IN_USE_RANGE_TYPE, zone_address, read_local_memory,
          collect_matches_in_ranges);
    }
  }

  g_hash_table_unref (classes);

  *count = ctx.matches->len;

  return (gpointer *) g_array_free (ctx.matches, FALSE);
}

void
destroy (gpointer mem)
{
  g_free (mem);
}

static void
collect_subclasses (Class klass,
                    GHashTable * result)
{
  Class * classes;
  int count, i;

  count = objc_getClassList (NULL, 0);
  classes = g_malloc (count * sizeof (gpointer));
  count = objc_getClassList (classes, count);

  for (i = 0; i != count; i++)
  {
    Class candidate = classes[i];
    Class c;

    c = candidate;
    do
    {
      if (c == klass)
      {
        g_hash_table_insert (result, candidate, GSIZE_TO_POINTER (class_getInstanceSize (candidate)));
        break;
      }

      c = class_getSuperclass (c);
    }
    while (c != NULL);
  }

  g_free (classes);
}

static void
collect_matches_in_ranges (task_t task,
                           void * user_data,
                           unsigned type,
                           vm_range_t * ranges,
                           unsigned count)
{
  ChooseContext * ctx = user_data;
  GHashTable * classes = ctx->classes;
  unsigned i;

  for (i = 0; i != count; i++)
  {
    const vm_range_t * range = &ranges[i];
    gconstpointer candidate = GSIZE_TO_POINTER (range->address);
    gconstpointer isa;
    guint instance_size;

    isa = *(gconstpointer *) candidate;
#ifdef OBJC_ISA_MASK
    isa = GSIZE_TO_POINTER (GPOINTER_TO_SIZE (isa) & OBJC_ISA_MASK);
#endif

    instance_size = GPOINTER_TO_UINT (g_hash_table_lookup (classes, isa));
    if (instance_size != 0 && range->size >= instance_size)
    {
      g_array_append_val (ctx->matches, candidate);
    }
  }
}

static kern_return_t
read_local_memory (task_t remote_task,
                   vm_address_t remote_address,
                   vm_size_t size,
                   void ** local_memory)
{
  *local_memory = (void *) remote_address;

  return KERN_SUCCESS;
}
`;
var { pointerSize: pointerSize2 } = Process;
var cachedModule = null;
function get() {
  if (cachedModule === null)
    cachedModule = compileModule();
  return cachedModule;
}
function compileModule() {
  const {
    objc_getClassList,
    class_getSuperclass,
    class_getInstanceSize
  } = getApi();
  const selfTask = Memory.alloc(4);
  selfTask.writeU32(Module.getGlobalExportByName("mach_task_self_").readU32());
  const cm2 = new CModule(code2, {
    objc_getClassList,
    class_getSuperclass,
    class_getInstanceSize,
    malloc_get_all_zones: Process.getModuleByName("/usr/lib/system/libsystem_malloc.dylib").getExportByName("malloc_get_all_zones"),
    selfTask
  });
  const _choose = new NativeFunction(cm2.choose, "pointer", ["pointer", "bool", "pointer"]);
  const _destroy = new NativeFunction(cm2.destroy, "void", ["pointer"]);
  return {
    handle: cm2,
    choose(klass, considerSubclasses) {
      const result = [];
      const countPtr = Memory.alloc(4);
      const matches = _choose(klass, considerSubclasses ? 1 : 0, countPtr);
      try {
        const count = countPtr.readU32();
        for (let i = 0; i !== count; i++)
          result.push(matches.add(i * pointerSize2).readPointer());
      } finally {
        _destroy(matches);
      }
      return result;
    }
  };
}

// node_modules/frida-objc-bridge/index.js
function Runtime() {
  const pointerSize = Process.pointerSize;
  let api = null;
  let apiError = null;
  const realizedClasses = /* @__PURE__ */ new Set();
  const classRegistry = new ClassRegistry();
  const protocolRegistry = new ProtocolRegistry();
  const replacedMethods = /* @__PURE__ */ new Map();
  const scheduledWork = /* @__PURE__ */ new Map();
  let nextId = 1;
  let workCallback = null;
  let NSAutoreleasePool = null;
  const bindings = /* @__PURE__ */ new Map();
  let readObjectIsa = null;
  const msgSendBySignatureId = /* @__PURE__ */ new Map();
  const msgSendSuperBySignatureId = /* @__PURE__ */ new Map();
  let cachedNSString = null;
  let cachedNSStringCtor = null;
  let cachedNSNumber = null;
  let cachedNSNumberCtor = null;
  let singularTypeById = null;
  let modifiers = null;
  try {
    tryInitialize();
  } catch (e) {
  }
  function tryInitialize() {
    if (api !== null)
      return true;
    if (apiError !== null)
      throw apiError;
    try {
      api = getApi();
    } catch (e) {
      apiError = e;
      throw e;
    }
    return api !== null;
  }
  function dispose() {
    for (const [rawMethodHandle, impls] of replacedMethods.entries()) {
      const methodHandle = ptr(rawMethodHandle);
      const [oldImp, newImp] = impls;
      if (api.method_getImplementation(methodHandle).equals(newImp))
        api.method_setImplementation(methodHandle, oldImp);
    }
    replacedMethods.clear();
  }
  Script.bindWeak(this, dispose);
  Object.defineProperty(this, "available", {
    enumerable: true,
    get() {
      return tryInitialize();
    }
  });
  Object.defineProperty(this, "api", {
    enumerable: true,
    get() {
      return getApi();
    }
  });
  Object.defineProperty(this, "classes", {
    enumerable: true,
    value: classRegistry
  });
  Object.defineProperty(this, "protocols", {
    enumerable: true,
    value: protocolRegistry
  });
  Object.defineProperty(this, "Object", {
    enumerable: true,
    value: ObjCObject
  });
  Object.defineProperty(this, "Protocol", {
    enumerable: true,
    value: ObjCProtocol
  });
  Object.defineProperty(this, "Block", {
    enumerable: true,
    value: Block
  });
  Object.defineProperty(this, "mainQueue", {
    enumerable: true,
    get() {
      return api?._dispatch_main_q ?? null;
    }
  });
  Object.defineProperty(this, "registerProxy", {
    enumerable: true,
    value: registerProxy
  });
  Object.defineProperty(this, "registerClass", {
    enumerable: true,
    value: registerClass
  });
  Object.defineProperty(this, "registerProtocol", {
    enumerable: true,
    value: registerProtocol
  });
  Object.defineProperty(this, "bind", {
    enumerable: true,
    value: bind
  });
  Object.defineProperty(this, "unbind", {
    enumerable: true,
    value: unbind
  });
  Object.defineProperty(this, "getBoundData", {
    enumerable: true,
    value: getBoundData
  });
  Object.defineProperty(this, "enumerateLoadedClasses", {
    enumerable: true,
    value: enumerateLoadedClasses
  });
  Object.defineProperty(this, "enumerateLoadedClassesSync", {
    enumerable: true,
    value: enumerateLoadedClassesSync
  });
  Object.defineProperty(this, "choose", {
    enumerable: true,
    value: choose
  });
  Object.defineProperty(this, "chooseSync", {
    enumerable: true,
    value(specifier) {
      const instances = [];
      choose(specifier, {
        onMatch(i) {
          instances.push(i);
        },
        onComplete() {
        }
      });
      return instances;
    }
  });
  this.schedule = function(queue, work) {
    const id = ptr(nextId++);
    scheduledWork.set(id.toString(), work);
    if (workCallback === null) {
      workCallback = new NativeCallback(performScheduledWorkItem, "void", ["pointer"]);
    }
    Script.pin();
    api.dispatch_async_f(queue, id, workCallback);
  };
  function performScheduledWorkItem(rawId) {
    const id = rawId.toString();
    const work = scheduledWork.get(id);
    scheduledWork.delete(id);
    if (NSAutoreleasePool === null)
      NSAutoreleasePool = classRegistry.NSAutoreleasePool;
    const pool = NSAutoreleasePool.alloc().init();
    let pendingException = null;
    try {
      work();
    } catch (e) {
      pendingException = e;
    }
    pool.release();
    setImmediate(performScheduledWorkCleanup, pendingException);
  }
  function performScheduledWorkCleanup(pendingException) {
    Script.unpin();
    if (pendingException !== null) {
      throw pendingException;
    }
  }
  this.implement = function(method2, fn) {
    return new NativeCallback(fn, method2.returnType, method2.argumentTypes);
  };
  this.selector = selector;
  this.selectorAsString = selectorAsString;
  function selector(name) {
    return api.sel_registerName(Memory.allocUtf8String(name));
  }
  function selectorAsString(sel2) {
    return api.sel_getName(sel2).readUtf8String();
  }
  const registryBuiltins = /* @__PURE__ */ new Set([
    "prototype",
    "constructor",
    "hasOwnProperty",
    "toJSON",
    "toString",
    "valueOf"
  ]);
  function ClassRegistry() {
    const cachedClasses = {};
    let numCachedClasses = 0;
    const registry = new Proxy(this, {
      has(target, property) {
        return hasProperty(property);
      },
      get(target, property, receiver) {
        switch (property) {
          case "prototype":
            return target.prototype;
          case "constructor":
            return target.constructor;
          case "hasOwnProperty":
            return hasProperty;
          case "toJSON":
            return toJSON2;
          case "toString":
            return toString2;
          case "valueOf":
            return valueOf;
          default:
            const klass = findClass(property);
            return klass !== null ? klass : void 0;
        }
      },
      set(target, property, value, receiver) {
        return false;
      },
      ownKeys(target) {
        if (api === null)
          return [];
        let numClasses = api.objc_getClassList(NULL, 0);
        if (numClasses !== numCachedClasses) {
          const classHandles = Memory.alloc(numClasses * pointerSize);
          numClasses = api.objc_getClassList(classHandles, numClasses);
          for (let i = 0; i !== numClasses; i++) {
            const handle2 = classHandles.add(i * pointerSize).readPointer();
            const name = api.class_getName(handle2).readUtf8String();
            cachedClasses[name] = handle2;
          }
          numCachedClasses = numClasses;
        }
        return Object.keys(cachedClasses);
      },
      getOwnPropertyDescriptor(target, property) {
        return {
          writable: false,
          configurable: true,
          enumerable: true
        };
      }
    });
    function hasProperty(name) {
      if (registryBuiltins.has(name))
        return true;
      return findClass(name) !== null;
    }
    function getClass(name) {
      const cls = findClass(name);
      if (cls === null)
        throw new Error("Unable to find class '" + name + "'");
      return cls;
    }
    function findClass(name) {
      let handle2 = cachedClasses[name];
      if (handle2 === void 0) {
        handle2 = api.objc_lookUpClass(Memory.allocUtf8String(name));
        if (handle2.isNull())
          return null;
        cachedClasses[name] = handle2;
        numCachedClasses++;
      }
      return new ObjCObject(handle2, void 0, true);
    }
    function toJSON2() {
      return Object.keys(registry).reduce(function(r, name) {
        r[name] = getClass(name).toJSON();
        return r;
      }, {});
    }
    function toString2() {
      return "ClassRegistry";
    }
    function valueOf() {
      return "ClassRegistry";
    }
    return registry;
  }
  function ProtocolRegistry() {
    let cachedProtocols = {};
    let numCachedProtocols = 0;
    const registry = new Proxy(this, {
      has(target, property) {
        return hasProperty(property);
      },
      get(target, property, receiver) {
        switch (property) {
          case "prototype":
            return target.prototype;
          case "constructor":
            return target.constructor;
          case "hasOwnProperty":
            return hasProperty;
          case "toJSON":
            return toJSON2;
          case "toString":
            return toString2;
          case "valueOf":
            return valueOf;
          default:
            const proto = findProtocol(property);
            return proto !== null ? proto : void 0;
        }
      },
      set(target, property, value, receiver) {
        return false;
      },
      ownKeys(target) {
        if (api === null)
          return [];
        const numProtocolsBuf = Memory.alloc(pointerSize);
        const protocolHandles = api.objc_copyProtocolList(numProtocolsBuf);
        try {
          const numProtocols = numProtocolsBuf.readUInt();
          if (numProtocols !== numCachedProtocols) {
            cachedProtocols = {};
            for (let i = 0; i !== numProtocols; i++) {
              const handle2 = protocolHandles.add(i * pointerSize).readPointer();
              const name = api.protocol_getName(handle2).readUtf8String();
              cachedProtocols[name] = handle2;
            }
            numCachedProtocols = numProtocols;
          }
        } finally {
          api.free(protocolHandles);
        }
        return Object.keys(cachedProtocols);
      },
      getOwnPropertyDescriptor(target, property) {
        return {
          writable: false,
          configurable: true,
          enumerable: true
        };
      }
    });
    function hasProperty(name) {
      if (registryBuiltins.has(name))
        return true;
      return findProtocol(name) !== null;
    }
    function findProtocol(name) {
      let handle2 = cachedProtocols[name];
      if (handle2 === void 0) {
        handle2 = api.objc_getProtocol(Memory.allocUtf8String(name));
        if (handle2.isNull())
          return null;
        cachedProtocols[name] = handle2;
        numCachedProtocols++;
      }
      return new ObjCProtocol(handle2);
    }
    function toJSON2() {
      return Object.keys(registry).reduce(function(r, name) {
        r[name] = { handle: cachedProtocols[name] };
        return r;
      }, {});
    }
    function toString2() {
      return "ProtocolRegistry";
    }
    function valueOf() {
      return "ProtocolRegistry";
    }
    return registry;
  }
  const objCObjectBuiltins = /* @__PURE__ */ new Set([
    "prototype",
    "constructor",
    "handle",
    "hasOwnProperty",
    "toJSON",
    "toString",
    "valueOf",
    "equals",
    "$kind",
    "$super",
    "$superClass",
    "$class",
    "$className",
    "$moduleName",
    "$protocols",
    "$methods",
    "$ownMethods",
    "$ivars"
  ]);
  function ObjCObject(handle2, protocol, cachedIsClass, superSpecifier2) {
    let cachedClassHandle = null;
    let cachedKind = null;
    let cachedSuper = null;
    let cachedSuperClass = null;
    let cachedClass = null;
    let cachedClassName = null;
    let cachedModuleName = null;
    let cachedProtocols = null;
    let cachedMethodNames = null;
    let cachedProtocolMethods = null;
    let respondsToSelector = null;
    const cachedMethods2 = {};
    let cachedNativeMethodNames = null;
    let cachedOwnMethodNames = null;
    let cachedIvars = null;
    handle2 = getHandle(handle2);
    if (cachedIsClass === void 0) {
      const klass = api.object_getClass(handle2);
      const key = klass.toString();
      if (!realizedClasses.has(key)) {
        api.objc_lookUpClass(api.class_getName(klass));
        realizedClasses.add(key);
      }
    }
    const self = new Proxy(this, {
      has(target, property) {
        return hasProperty(property);
      },
      get(target, property, receiver) {
        switch (property) {
          case "handle":
            return handle2;
          case "prototype":
            return target.prototype;
          case "constructor":
            return target.constructor;
          case "hasOwnProperty":
            return hasProperty;
          case "toJSON":
            return toJSON2;
          case "toString":
          case "valueOf":
            const descriptionImpl = receiver.description;
            if (descriptionImpl !== void 0) {
              const description = descriptionImpl.call(receiver);
              if (description !== null)
                return description.UTF8String.bind(description);
            }
            return function() {
              return receiver.$className;
            };
          case "equals":
            return equals2;
          case "$kind":
            if (cachedKind === null) {
              if (isClass())
                cachedKind = api.class_isMetaClass(handle2) ? "meta-class" : "class";
              else
                cachedKind = "instance";
            }
            return cachedKind;
          case "$super":
            if (cachedSuper === null) {
              const superHandle = api.class_getSuperclass(classHandle());
              if (!superHandle.isNull()) {
                const specifier = Memory.alloc(2 * pointerSize);
                specifier.writePointer(handle2);
                specifier.add(pointerSize).writePointer(superHandle);
                cachedSuper = [new ObjCObject(handle2, void 0, cachedIsClass, specifier)];
              } else {
                cachedSuper = [null];
              }
            }
            return cachedSuper[0];
          case "$superClass":
            if (cachedSuperClass === null) {
              const superClassHandle = api.class_getSuperclass(classHandle());
              if (!superClassHandle.isNull()) {
                cachedSuperClass = [new ObjCObject(superClassHandle)];
              } else {
                cachedSuperClass = [null];
              }
            }
            return cachedSuperClass[0];
          case "$class":
            if (cachedClass === null)
              cachedClass = new ObjCObject(api.object_getClass(handle2), void 0, true);
            return cachedClass;
          case "$className":
            if (cachedClassName === null) {
              if (superSpecifier2)
                cachedClassName = api.class_getName(superSpecifier2.add(pointerSize).readPointer()).readUtf8String();
              else if (isClass())
                cachedClassName = api.class_getName(handle2).readUtf8String();
              else
                cachedClassName = api.object_getClassName(handle2).readUtf8String();
            }
            return cachedClassName;
          case "$moduleName":
            if (cachedModuleName === null) {
              cachedModuleName = api.class_getImageName(classHandle()).readUtf8String();
            }
            return cachedModuleName;
          case "$protocols":
            if (cachedProtocols === null) {
              cachedProtocols = {};
              const numProtocolsBuf = Memory.alloc(pointerSize);
              const protocolHandles = api.class_copyProtocolList(classHandle(), numProtocolsBuf);
              if (!protocolHandles.isNull()) {
                try {
                  const numProtocols = numProtocolsBuf.readUInt();
                  for (let i = 0; i !== numProtocols; i++) {
                    const protocolHandle = protocolHandles.add(i * pointerSize).readPointer();
                    const p = new ObjCProtocol(protocolHandle);
                    cachedProtocols[p.name] = p;
                  }
                } finally {
                  api.free(protocolHandles);
                }
              }
            }
            return cachedProtocols;
          case "$methods":
            if (cachedNativeMethodNames === null) {
              const klass = superSpecifier2 ? superSpecifier2.add(pointerSize).readPointer() : classHandle();
              const meta = api.object_getClass(klass);
              const names = /* @__PURE__ */ new Set();
              let cur = meta;
              do {
                for (let methodName of collectMethodNames(cur, "+ "))
                  names.add(methodName);
                cur = api.class_getSuperclass(cur);
              } while (!cur.isNull());
              cur = klass;
              do {
                for (let methodName of collectMethodNames(cur, "- "))
                  names.add(methodName);
                cur = api.class_getSuperclass(cur);
              } while (!cur.isNull());
              cachedNativeMethodNames = Array.from(names);
            }
            return cachedNativeMethodNames;
          case "$ownMethods":
            if (cachedOwnMethodNames === null) {
              const klass = superSpecifier2 ? superSpecifier2.add(pointerSize).readPointer() : classHandle();
              const meta = api.object_getClass(klass);
              const classMethods = collectMethodNames(meta, "+ ");
              const instanceMethods = collectMethodNames(klass, "- ");
              cachedOwnMethodNames = classMethods.concat(instanceMethods);
            }
            return cachedOwnMethodNames;
          case "$ivars":
            if (cachedIvars === null) {
              if (isClass())
                cachedIvars = {};
              else
                cachedIvars = new ObjCIvars(self, classHandle());
            }
            return cachedIvars;
          default:
            if (typeof property === "symbol") {
              return target[property];
            }
            if (protocol) {
              const details = findProtocolMethod(property);
              if (details === null || !details.implemented)
                return void 0;
            }
            const wrapper = findMethodWrapper(property);
            if (wrapper === null)
              return void 0;
            return wrapper;
        }
      },
      set(target, property, value, receiver) {
        return false;
      },
      ownKeys(target) {
        if (cachedMethodNames === null) {
          if (!protocol) {
            const jsNames = {};
            const nativeNames = {};
            let cur = api.object_getClass(handle2);
            do {
              const numMethodsBuf = Memory.alloc(pointerSize);
              const methodHandles = api.class_copyMethodList(cur, numMethodsBuf);
              const fullNamePrefix = isClass() ? "+ " : "- ";
              try {
                const numMethods = numMethodsBuf.readUInt();
                for (let i = 0; i !== numMethods; i++) {
                  const methodHandle = methodHandles.add(i * pointerSize).readPointer();
                  const sel2 = api.method_getName(methodHandle);
                  const nativeName = api.sel_getName(sel2).readUtf8String();
                  if (nativeNames[nativeName] !== void 0)
                    continue;
                  nativeNames[nativeName] = nativeName;
                  const jsName = jsMethodName(nativeName);
                  let serial = 2;
                  let name = jsName;
                  while (jsNames[name] !== void 0) {
                    serial++;
                    name = jsName + serial;
                  }
                  jsNames[name] = true;
                  const fullName = fullNamePrefix + nativeName;
                  if (cachedMethods2[fullName] === void 0) {
                    const details = {
                      sel: sel2,
                      handle: methodHandle,
                      wrapper: null
                    };
                    cachedMethods2[fullName] = details;
                    cachedMethods2[name] = details;
                  }
                }
              } finally {
                api.free(methodHandles);
              }
              cur = api.class_getSuperclass(cur);
            } while (!cur.isNull());
            cachedMethodNames = Object.keys(jsNames);
          } else {
            const methodNames = [];
            const protocolMethods = allProtocolMethods();
            Object.keys(protocolMethods).forEach(function(methodName) {
              if (methodName[0] !== "+" && methodName[0] !== "-") {
                const details = protocolMethods[methodName];
                if (details.implemented) {
                  methodNames.push(methodName);
                }
              }
            });
            cachedMethodNames = methodNames;
          }
        }
        return ["handle"].concat(cachedMethodNames);
      },
      getOwnPropertyDescriptor(target, property) {
        return {
          writable: false,
          configurable: true,
          enumerable: true
        };
      }
    });
    if (protocol) {
      respondsToSelector = !isClass() ? findMethodWrapper("- respondsToSelector:") : null;
    }
    return self;
    function hasProperty(name) {
      if (objCObjectBuiltins.has(name))
        return true;
      if (protocol) {
        const details = findProtocolMethod(name);
        return !!(details !== null && details.implemented);
      }
      return findMethod(name) !== null;
    }
    function classHandle() {
      if (cachedClassHandle === null)
        cachedClassHandle = isClass() ? handle2 : api.object_getClass(handle2);
      return cachedClassHandle;
    }
    function isClass() {
      if (cachedIsClass === void 0) {
        if (api.object_isClass)
          cachedIsClass = !!api.object_isClass(handle2);
        else
          cachedIsClass = !!api.class_isMetaClass(api.object_getClass(handle2));
      }
      return cachedIsClass;
    }
    function findMethod(rawName) {
      let method2 = cachedMethods2[rawName];
      if (method2 !== void 0)
        return method2;
      const tokens = parseMethodName(rawName);
      const fullName = tokens[2];
      method2 = cachedMethods2[fullName];
      if (method2 !== void 0) {
        cachedMethods2[rawName] = method2;
        return method2;
      }
      const kind = tokens[0];
      const name = tokens[1];
      const sel2 = selector(name);
      const defaultKind = isClass() ? "+" : "-";
      if (protocol) {
        const details = findProtocolMethod(fullName);
        if (details !== null) {
          method2 = {
            sel: sel2,
            types: details.types,
            wrapper: null,
            kind
          };
        }
      }
      if (method2 === void 0) {
        const methodHandle = kind === "+" ? api.class_getClassMethod(classHandle(), sel2) : api.class_getInstanceMethod(classHandle(), sel2);
        if (!methodHandle.isNull()) {
          method2 = {
            sel: sel2,
            handle: methodHandle,
            wrapper: null,
            kind
          };
        } else {
          if (isClass() || kind !== "-" || name === "forwardingTargetForSelector:" || name === "methodSignatureForSelector:") {
            return null;
          }
          let target = self;
          if ("- forwardingTargetForSelector:" in self) {
            const forwardingTarget = self.forwardingTargetForSelector_(sel2);
            if (forwardingTarget !== null && forwardingTarget.$kind === "instance") {
              target = forwardingTarget;
            } else {
              return null;
            }
          } else {
            return null;
          }
          const methodHandle2 = api.class_getInstanceMethod(api.object_getClass(target.handle), sel2);
          if (methodHandle2.isNull()) {
            return null;
          }
          let types2 = api.method_getTypeEncoding(methodHandle2).readUtf8String();
          if (types2 === null || types2 === "") {
            types2 = stealTypesFromProtocols(target, fullName);
            if (types2 === null)
              types2 = stealTypesFromProtocols(self, fullName);
            if (types2 === null)
              return null;
          }
          method2 = {
            sel: sel2,
            types: types2,
            wrapper: null,
            kind
          };
        }
      }
      cachedMethods2[fullName] = method2;
      cachedMethods2[rawName] = method2;
      if (kind === defaultKind)
        cachedMethods2[jsMethodName(name)] = method2;
      return method2;
    }
    function stealTypesFromProtocols(klass, fullName) {
      const candidates = Object.keys(klass.$protocols).map((protocolName) => flatProtocolMethods({}, klass.$protocols[protocolName])).reduce((allMethods, methods) => {
        Object.assign(allMethods, methods);
        return allMethods;
      }, {});
      const method2 = candidates[fullName];
      if (method2 === void 0) {
        return null;
      }
      return method2.types;
    }
    function flatProtocolMethods(result, protocol2) {
      if (protocol2.methods !== void 0) {
        Object.assign(result, protocol2.methods);
      }
      if (protocol2.protocol !== void 0) {
        flatProtocolMethods(result, protocol2.protocol);
      }
      return result;
    }
    function findProtocolMethod(rawName) {
      const protocolMethods = allProtocolMethods();
      const details = protocolMethods[rawName];
      return details !== void 0 ? details : null;
    }
    function allProtocolMethods() {
      if (cachedProtocolMethods === null) {
        const methods = {};
        const protocols = collectProtocols(protocol);
        const defaultKind = isClass() ? "+" : "-";
        Object.keys(protocols).forEach(function(name) {
          const p = protocols[name];
          const m2 = p.methods;
          Object.keys(m2).forEach(function(fullMethodName) {
            const method2 = m2[fullMethodName];
            const methodName = fullMethodName.substr(2);
            const kind = fullMethodName[0];
            let didCheckImplemented = false;
            let implemented = false;
            const details = {
              types: method2.types
            };
            Object.defineProperty(details, "implemented", {
              get() {
                if (!didCheckImplemented) {
                  if (method2.required) {
                    implemented = true;
                  } else {
                    implemented = respondsToSelector !== null && respondsToSelector.call(self, selector(methodName));
                  }
                  didCheckImplemented = true;
                }
                return implemented;
              }
            });
            methods[fullMethodName] = details;
            if (kind === defaultKind)
              methods[jsMethodName(methodName)] = details;
          });
        });
        cachedProtocolMethods = methods;
      }
      return cachedProtocolMethods;
    }
    function findMethodWrapper(name) {
      const method2 = findMethod(name);
      if (method2 === null)
        return null;
      let wrapper = method2.wrapper;
      if (wrapper === null) {
        wrapper = makeMethodInvocationWrapper(method2, self, superSpecifier2, defaultInvocationOptions);
        method2.wrapper = wrapper;
      }
      return wrapper;
    }
    function parseMethodName(rawName) {
      const match = /([+\-])\s(\S+)/.exec(rawName);
      let name, kind;
      if (match === null) {
        kind = isClass() ? "+" : "-";
        name = objcMethodName(rawName);
      } else {
        kind = match[1];
        name = match[2];
      }
      const fullName = [kind, name].join(" ");
      return [kind, name, fullName];
    }
    function toJSON2() {
      return {
        handle: handle2.toString()
      };
    }
    function equals2(ptr2) {
      return handle2.equals(getHandle(ptr2));
    }
  }
  function getReplacementMethodImplementation(methodHandle) {
    const existingEntry = replacedMethods.get(methodHandle.toString());
    if (existingEntry === void 0)
      return null;
    const [, newImp] = existingEntry;
    return newImp;
  }
  function replaceMethodImplementation(methodHandle, imp) {
    const key = methodHandle.toString();
    let oldImp;
    const existingEntry = replacedMethods.get(key);
    if (existingEntry !== void 0)
      [oldImp] = existingEntry;
    else
      oldImp = api.method_getImplementation(methodHandle);
    if (!imp.equals(oldImp))
      replacedMethods.set(key, [oldImp, imp]);
    else
      replacedMethods.delete(key);
    api.method_setImplementation(methodHandle, imp);
  }
  function collectMethodNames(klass, prefix) {
    const names = [];
    const numMethodsBuf = Memory.alloc(pointerSize);
    const methodHandles = api.class_copyMethodList(klass, numMethodsBuf);
    try {
      const numMethods = numMethodsBuf.readUInt();
      for (let i = 0; i !== numMethods; i++) {
        const methodHandle = methodHandles.add(i * pointerSize).readPointer();
        const sel2 = api.method_getName(methodHandle);
        const nativeName = api.sel_getName(sel2).readUtf8String();
        names.push(prefix + nativeName);
      }
    } finally {
      api.free(methodHandles);
    }
    return names;
  }
  function ObjCProtocol(handle2) {
    let cachedName = null;
    let cachedProtocols = null;
    let cachedProperties = null;
    let cachedMethods2 = null;
    Object.defineProperty(this, "handle", {
      value: handle2,
      enumerable: true
    });
    Object.defineProperty(this, "name", {
      get() {
        if (cachedName === null)
          cachedName = api.protocol_getName(handle2).readUtf8String();
        return cachedName;
      },
      enumerable: true
    });
    Object.defineProperty(this, "protocols", {
      get() {
        if (cachedProtocols === null) {
          cachedProtocols = {};
          const numProtocolsBuf = Memory.alloc(pointerSize);
          const protocolHandles = api.protocol_copyProtocolList(handle2, numProtocolsBuf);
          if (!protocolHandles.isNull()) {
            try {
              const numProtocols = numProtocolsBuf.readUInt();
              for (let i = 0; i !== numProtocols; i++) {
                const protocolHandle = protocolHandles.add(i * pointerSize).readPointer();
                const protocol = new ObjCProtocol(protocolHandle);
                cachedProtocols[protocol.name] = protocol;
              }
            } finally {
              api.free(protocolHandles);
            }
          }
        }
        return cachedProtocols;
      },
      enumerable: true
    });
    Object.defineProperty(this, "properties", {
      get() {
        if (cachedProperties === null) {
          cachedProperties = {};
          const numBuf = Memory.alloc(pointerSize);
          const propertyHandles = api.protocol_copyPropertyList(handle2, numBuf);
          if (!propertyHandles.isNull()) {
            try {
              const numProperties = numBuf.readUInt();
              for (let i = 0; i !== numProperties; i++) {
                const propertyHandle = propertyHandles.add(i * pointerSize).readPointer();
                const propName = api.property_getName(propertyHandle).readUtf8String();
                const attributes = {};
                const attributeEntries = api.property_copyAttributeList(propertyHandle, numBuf);
                if (!attributeEntries.isNull()) {
                  try {
                    const numAttributeValues = numBuf.readUInt();
                    for (let j = 0; j !== numAttributeValues; j++) {
                      const attributeEntry = attributeEntries.add(j * (2 * pointerSize));
                      const name = attributeEntry.readPointer().readUtf8String();
                      const value = attributeEntry.add(pointerSize).readPointer().readUtf8String();
                      attributes[name] = value;
                    }
                  } finally {
                    api.free(attributeEntries);
                  }
                }
                cachedProperties[propName] = attributes;
              }
            } finally {
              api.free(propertyHandles);
            }
          }
        }
        return cachedProperties;
      },
      enumerable: true
    });
    Object.defineProperty(this, "methods", {
      get() {
        if (cachedMethods2 === null) {
          cachedMethods2 = {};
          const numBuf = Memory.alloc(pointerSize);
          collectMethods(cachedMethods2, numBuf, { required: true, instance: false });
          collectMethods(cachedMethods2, numBuf, { required: false, instance: false });
          collectMethods(cachedMethods2, numBuf, { required: true, instance: true });
          collectMethods(cachedMethods2, numBuf, { required: false, instance: true });
        }
        return cachedMethods2;
      },
      enumerable: true
    });
    function collectMethods(methods, numBuf, spec) {
      const methodDescValues = api.protocol_copyMethodDescriptionList(handle2, spec.required ? 1 : 0, spec.instance ? 1 : 0, numBuf);
      if (methodDescValues.isNull())
        return;
      try {
        const numMethodDescValues = numBuf.readUInt();
        for (let i = 0; i !== numMethodDescValues; i++) {
          const methodDesc = methodDescValues.add(i * (2 * pointerSize));
          const name = (spec.instance ? "- " : "+ ") + selectorAsString(methodDesc.readPointer());
          const types2 = methodDesc.add(pointerSize).readPointer().readUtf8String();
          methods[name] = {
            required: spec.required,
            types: types2
          };
        }
      } finally {
        api.free(methodDescValues);
      }
    }
  }
  const objCIvarsBuiltins = /* @__PURE__ */ new Set([
    "prototype",
    "constructor",
    "hasOwnProperty",
    "toJSON",
    "toString",
    "valueOf"
  ]);
  function ObjCIvars(instance, classHandle) {
    const ivars = {};
    let cachedIvarNames = null;
    let classHandles = [];
    let currentClassHandle = classHandle;
    do {
      classHandles.unshift(currentClassHandle);
      currentClassHandle = api.class_getSuperclass(currentClassHandle);
    } while (!currentClassHandle.isNull());
    const numIvarsBuf = Memory.alloc(pointerSize);
    classHandles.forEach((c) => {
      const ivarHandles = api.class_copyIvarList(c, numIvarsBuf);
      try {
        const numIvars = numIvarsBuf.readUInt();
        for (let i = 0; i !== numIvars; i++) {
          const handle2 = ivarHandles.add(i * pointerSize).readPointer();
          const name = api.ivar_getName(handle2).readUtf8String();
          ivars[name] = [handle2, null];
        }
      } finally {
        api.free(ivarHandles);
      }
    });
    const self = new Proxy(this, {
      has(target, property) {
        return hasProperty(property);
      },
      get(target, property, receiver) {
        switch (property) {
          case "prototype":
            return target.prototype;
          case "constructor":
            return target.constructor;
          case "hasOwnProperty":
            return hasProperty;
          case "toJSON":
            return toJSON2;
          case "toString":
            return toString2;
          case "valueOf":
            return valueOf;
          default:
            const ivar = findIvar(property);
            if (ivar === null)
              return void 0;
            return ivar.get();
        }
      },
      set(target, property, value, receiver) {
        const ivar = findIvar(property);
        if (ivar === null)
          throw new Error("Unknown ivar");
        ivar.set(value);
        return true;
      },
      ownKeys(target) {
        if (cachedIvarNames === null)
          cachedIvarNames = Object.keys(ivars);
        return cachedIvarNames;
      },
      getOwnPropertyDescriptor(target, property) {
        return {
          writable: true,
          configurable: true,
          enumerable: true
        };
      }
    });
    return self;
    function findIvar(name) {
      const entry = ivars[name];
      if (entry === void 0)
        return null;
      let impl = entry[1];
      if (impl === null) {
        const ivar = entry[0];
        const offset = api.ivar_getOffset(ivar).toInt32();
        const address = instance.handle.add(offset);
        const type = parseType(api.ivar_getTypeEncoding(ivar).readUtf8String());
        const fromNative = type.fromNative || identityTransform;
        const toNative = type.toNative || identityTransform;
        let read2, write3;
        if (name === "isa") {
          read2 = readObjectIsa;
          write3 = function() {
            throw new Error("Unable to set the isa instance variable");
          };
        } else {
          read2 = type.read;
          write3 = type.write;
        }
        impl = {
          get() {
            return fromNative.call(instance, read2(address));
          },
          set(value) {
            write3(address, toNative.call(instance, value));
          }
        };
        entry[1] = impl;
      }
      return impl;
    }
    function hasProperty(name) {
      if (objCIvarsBuiltins.has(name))
        return true;
      return ivars.hasOwnProperty(name);
    }
    function toJSON2() {
      return Object.keys(self).reduce(function(result, name) {
        result[name] = self[name];
        return result;
      }, {});
    }
    function toString2() {
      return "ObjCIvars";
    }
    function valueOf() {
      return "ObjCIvars";
    }
  }
  let blockDescriptorAllocSize, blockDescriptorDeclaredSize, blockDescriptorOffsets;
  let blockSize, blockOffsets;
  if (pointerSize === 4) {
    blockDescriptorAllocSize = 16;
    blockDescriptorDeclaredSize = 20;
    blockDescriptorOffsets = {
      reserved: 0,
      size: 4,
      rest: 8
    };
    blockSize = 20;
    blockOffsets = {
      isa: 0,
      flags: 4,
      reserved: 8,
      invoke: 12,
      descriptor: 16
    };
  } else {
    blockDescriptorAllocSize = 32;
    blockDescriptorDeclaredSize = 32;
    blockDescriptorOffsets = {
      reserved: 0,
      size: 8,
      rest: 16
    };
    blockSize = 32;
    blockOffsets = {
      isa: 0,
      flags: 8,
      reserved: 12,
      invoke: 16,
      descriptor: 24
    };
  }
  const BLOCK_HAS_COPY_DISPOSE = 1 << 25;
  const BLOCK_HAS_CTOR = 1 << 26;
  const BLOCK_IS_GLOBAL = 1 << 28;
  const BLOCK_HAS_STRET = 1 << 29;
  const BLOCK_HAS_SIGNATURE = 1 << 30;
  function Block(target, options = defaultInvocationOptions) {
    this._options = options;
    if (target instanceof NativePointer) {
      const descriptor = target.add(blockOffsets.descriptor).readPointer();
      this.handle = target;
      const flags = target.add(blockOffsets.flags).readU32();
      if ((flags & BLOCK_HAS_SIGNATURE) !== 0) {
        const signatureOffset = (flags & BLOCK_HAS_COPY_DISPOSE) !== 0 ? 2 : 0;
        this.types = descriptor.add(blockDescriptorOffsets.rest + signatureOffset * pointerSize).readPointer().readCString();
        this._signature = parseSignature(this.types);
      } else {
        this._signature = null;
      }
    } else {
      this.declare(target);
      const descriptor = Memory.alloc(blockDescriptorAllocSize + blockSize);
      const block2 = descriptor.add(blockDescriptorAllocSize);
      const typesStr = Memory.allocUtf8String(this.types);
      descriptor.add(blockDescriptorOffsets.reserved).writeULong(0);
      descriptor.add(blockDescriptorOffsets.size).writeULong(blockDescriptorDeclaredSize);
      descriptor.add(blockDescriptorOffsets.rest).writePointer(typesStr);
      block2.add(blockOffsets.isa).writePointer(classRegistry.__NSGlobalBlock__);
      block2.add(blockOffsets.flags).writeU32(BLOCK_HAS_SIGNATURE | BLOCK_IS_GLOBAL);
      block2.add(blockOffsets.reserved).writeU32(0);
      block2.add(blockOffsets.descriptor).writePointer(descriptor);
      this.handle = block2;
      this._storage = [descriptor, typesStr];
      this.implementation = target.implementation;
    }
  }
  Object.defineProperties(Block.prototype, {
    implementation: {
      enumerable: true,
      get() {
        const address = this.handle.add(blockOffsets.invoke).readPointer().strip();
        const signature2 = this._getSignature();
        return makeBlockInvocationWrapper(this, signature2, new NativeFunction(
          address.sign(),
          signature2.retType.type,
          signature2.argTypes.map(function(arg) {
            return arg.type;
          }),
          this._options
        ));
      },
      set(func) {
        const signature2 = this._getSignature();
        const callback = new NativeCallback(
          makeBlockImplementationWrapper(this, signature2, func),
          signature2.retType.type,
          signature2.argTypes.map(function(arg) {
            return arg.type;
          })
        );
        this._callback = callback;
        const location = this.handle.add(blockOffsets.invoke);
        const prot = Memory.queryProtection(location);
        const writable = prot.includes("w");
        if (!writable)
          Memory.protect(location, Process.pointerSize, "rw-");
        location.writePointer(callback.strip().sign("ia", location));
        if (!writable)
          Memory.protect(location, Process.pointerSize, prot);
      }
    },
    declare: {
      value(signature2) {
        let types2 = signature2.types;
        if (types2 === void 0) {
          types2 = unparseSignature(signature2.retType, ["block"].concat(signature2.argTypes));
        }
        this.types = types2;
        this._signature = parseSignature(types2);
      }
    },
    _getSignature: {
      value() {
        const signature2 = this._signature;
        if (signature2 === null)
          throw new Error("block is missing signature; call declare()");
        return signature2;
      }
    }
  });
  function collectProtocols(p, acc) {
    acc = acc || {};
    acc[p.name] = p;
    const parentProtocols = p.protocols;
    Object.keys(parentProtocols).forEach(function(name) {
      collectProtocols(parentProtocols[name], acc);
    });
    return acc;
  }
  function registerProxy(properties) {
    const protocols = properties.protocols || [];
    const methods = properties.methods || {};
    const events = properties.events || {};
    const supportedSelectors = new Set(
      Object.keys(methods).filter((m2) => /([+\-])\s(\S+)/.exec(m2) !== null).map((m2) => m2.split(" ")[1])
    );
    const proxyMethods = {
      "- dealloc": function() {
        const target = this.data.target;
        if ("- release" in target)
          target.release();
        unbind(this.self);
        this.super.dealloc();
        const callback = this.data.events.dealloc;
        if (callback !== void 0)
          callback.call(this);
      },
      "- respondsToSelector:": function(sel2) {
        const selector2 = selectorAsString(sel2);
        if (supportedSelectors.has(selector2))
          return true;
        return this.data.target.respondsToSelector_(sel2);
      },
      "- forwardingTargetForSelector:": function(sel2) {
        const callback = this.data.events.forward;
        if (callback !== void 0)
          callback.call(this, selectorAsString(sel2));
        return this.data.target;
      },
      "- methodSignatureForSelector:": function(sel2) {
        return this.data.target.methodSignatureForSelector_(sel2);
      },
      "- forwardInvocation:": function(invocation) {
        invocation.invokeWithTarget_(this.data.target);
      }
    };
    for (var key in methods) {
      if (methods.hasOwnProperty(key)) {
        if (proxyMethods.hasOwnProperty(key))
          throw new Error("The '" + key + "' method is reserved");
        proxyMethods[key] = methods[key];
      }
    }
    const ProxyClass = registerClass({
      name: properties.name,
      super: classRegistry.NSProxy,
      protocols,
      methods: proxyMethods
    });
    return function(target, data) {
      target = target instanceof NativePointer ? new ObjCObject(target) : target;
      data = data || {};
      const instance = ProxyClass.alloc().autorelease();
      const boundData = getBoundData(instance);
      boundData.target = "- retain" in target ? target.retain() : target;
      boundData.events = events;
      for (var key2 in data) {
        if (data.hasOwnProperty(key2)) {
          if (boundData.hasOwnProperty(key2))
            throw new Error("The '" + key2 + "' property is reserved");
          boundData[key2] = data[key2];
        }
      }
      this.handle = instance.handle;
    };
  }
  function registerClass(properties) {
    let name = properties.name;
    if (name === void 0)
      name = makeClassName();
    const superClass = properties.super !== void 0 ? properties.super : classRegistry.NSObject;
    const protocols = properties.protocols || [];
    const methods = properties.methods || {};
    const methodCallbacks = [];
    const classHandle = api.objc_allocateClassPair(superClass !== null ? superClass.handle : NULL, Memory.allocUtf8String(name), ptr("0"));
    if (classHandle.isNull())
      throw new Error("Unable to register already registered class '" + name + "'");
    const metaClassHandle = api.object_getClass(classHandle);
    try {
      protocols.forEach(function(protocol) {
        api.class_addProtocol(classHandle, protocol.handle);
      });
      Object.keys(methods).forEach(function(rawMethodName) {
        const match = /([+\-])\s(\S+)/.exec(rawMethodName);
        if (match === null)
          throw new Error("Invalid method name");
        const kind = match[1];
        const name2 = match[2];
        let method2;
        const value = methods[rawMethodName];
        if (typeof value === "function") {
          let types3 = null;
          if (rawMethodName in superClass) {
            types3 = superClass[rawMethodName].types;
          } else {
            for (let protocol of protocols) {
              const method3 = protocol.methods[rawMethodName];
              if (method3 !== void 0) {
                types3 = method3.types;
                break;
              }
            }
          }
          if (types3 === null)
            throw new Error("Unable to find '" + rawMethodName + "' in super-class or any of its protocols");
          method2 = {
            types: types3,
            implementation: value
          };
        } else {
          method2 = value;
        }
        const target = kind === "+" ? metaClassHandle : classHandle;
        let types2 = method2.types;
        if (types2 === void 0) {
          types2 = unparseSignature(method2.retType, [kind === "+" ? "class" : "object", "selector"].concat(method2.argTypes));
        }
        const signature2 = parseSignature(types2);
        const implementation2 = new NativeCallback(
          makeMethodImplementationWrapper(signature2, method2.implementation),
          signature2.retType.type,
          signature2.argTypes.map(function(arg) {
            return arg.type;
          })
        );
        methodCallbacks.push(implementation2);
        api.class_addMethod(target, selector(name2), implementation2, Memory.allocUtf8String(types2));
      });
    } catch (e) {
      api.objc_disposeClassPair(classHandle);
      throw e;
    }
    api.objc_registerClassPair(classHandle);
    classHandle._methodCallbacks = methodCallbacks;
    Script.bindWeak(classHandle, makeClassDestructor(ptr(classHandle)));
    return new ObjCObject(classHandle);
  }
  function makeClassDestructor(classHandle) {
    return function() {
      api.objc_disposeClassPair(classHandle);
    };
  }
  function registerProtocol(properties) {
    let name = properties.name;
    if (name === void 0)
      name = makeProtocolName();
    const protocols = properties.protocols || [];
    const methods = properties.methods || {};
    protocols.forEach(function(protocol) {
      if (!(protocol instanceof ObjCProtocol))
        throw new Error("Expected protocol");
    });
    const methodSpecs = Object.keys(methods).map(function(rawMethodName) {
      const method2 = methods[rawMethodName];
      const match = /([+\-])\s(\S+)/.exec(rawMethodName);
      if (match === null)
        throw new Error("Invalid method name");
      const kind = match[1];
      const name2 = match[2];
      let types2 = method2.types;
      if (types2 === void 0) {
        types2 = unparseSignature(method2.retType, [kind === "+" ? "class" : "object", "selector"].concat(method2.argTypes));
      }
      return {
        kind,
        name: name2,
        types: types2,
        optional: method2.optional
      };
    });
    const handle2 = api.objc_allocateProtocol(Memory.allocUtf8String(name));
    if (handle2.isNull())
      throw new Error("Unable to register already registered protocol '" + name + "'");
    protocols.forEach(function(protocol) {
      api.protocol_addProtocol(handle2, protocol.handle);
    });
    methodSpecs.forEach(function(spec) {
      const isRequiredMethod = spec.optional ? 0 : 1;
      const isInstanceMethod = spec.kind === "-" ? 1 : 0;
      api.protocol_addMethodDescription(handle2, selector(spec.name), Memory.allocUtf8String(spec.types), isRequiredMethod, isInstanceMethod);
    });
    api.objc_registerProtocol(handle2);
    return new ObjCProtocol(handle2);
  }
  function getHandle(obj) {
    if (obj instanceof NativePointer)
      return obj;
    else if (typeof obj === "object" && obj.hasOwnProperty("handle"))
      return obj.handle;
    else
      throw new Error("Expected NativePointer or ObjC.Object instance");
  }
  function bind(obj, data) {
    const handle2 = getHandle(obj);
    const self = obj instanceof ObjCObject ? obj : new ObjCObject(handle2);
    bindings.set(handle2.toString(), {
      self,
      super: self.$super,
      data
    });
  }
  function unbind(obj) {
    const handle2 = getHandle(obj);
    bindings.delete(handle2.toString());
  }
  function getBoundData(obj) {
    return getBinding(obj).data;
  }
  function getBinding(obj) {
    const handle2 = getHandle(obj);
    const key = handle2.toString();
    let binding = bindings.get(key);
    if (binding === void 0) {
      const self = obj instanceof ObjCObject ? obj : new ObjCObject(handle2);
      binding = {
        self,
        super: self.$super,
        data: {}
      };
      bindings.set(key, binding);
    }
    return binding;
  }
  function enumerateLoadedClasses(...args) {
    const allModules = new ModuleMap();
    let unfiltered = false;
    let callbacks;
    let modules;
    if (args.length === 1) {
      callbacks = args[0];
    } else {
      callbacks = args[1];
      const options = args[0];
      modules = options.ownedBy;
    }
    if (modules === void 0) {
      modules = allModules;
      unfiltered = true;
    }
    const classGetName = api.class_getName;
    const onMatch = callbacks.onMatch.bind(callbacks);
    const swiftNominalTypeDescriptorOffset = (pointerSize === 8 ? 8 : 11) * pointerSize;
    const numClasses = api.objc_getClassList(NULL, 0);
    const classHandles = Memory.alloc(numClasses * pointerSize);
    api.objc_getClassList(classHandles, numClasses);
    for (let i = 0; i !== numClasses; i++) {
      const classHandle = classHandles.add(i * pointerSize).readPointer();
      const rawName = classGetName(classHandle);
      let name = null;
      let modulePath = modules.findPath(rawName);
      const possiblySwift = modulePath === null && (unfiltered || allModules.findPath(rawName) === null);
      if (possiblySwift) {
        name = rawName.readCString();
        const probablySwift = name.indexOf(".") !== -1;
        if (probablySwift) {
          const nominalTypeDescriptor = classHandle.add(swiftNominalTypeDescriptorOffset).readPointer();
          modulePath = modules.findPath(nominalTypeDescriptor);
        }
      }
      if (modulePath !== null) {
        if (name === null)
          name = rawName.readUtf8String();
        onMatch(name, modulePath);
      }
    }
    callbacks.onComplete();
  }
  function enumerateLoadedClassesSync(options = {}) {
    const result = {};
    enumerateLoadedClasses(options, {
      onMatch(name, owner2) {
        let group = result[owner2];
        if (group === void 0) {
          group = [];
          result[owner2] = group;
        }
        group.push(name);
      },
      onComplete() {
      }
    });
    return result;
  }
  function choose(specifier, callbacks) {
    let cls = specifier;
    let subclasses = true;
    if (!(specifier instanceof ObjCObject) && typeof specifier === "object") {
      cls = specifier.class;
      if (specifier.hasOwnProperty("subclasses"))
        subclasses = specifier.subclasses;
    }
    if (!(cls instanceof ObjCObject && (cls.$kind === "class" || cls.$kind === "meta-class")))
      throw new Error("Expected an ObjC.Object for a class or meta-class");
    const matches = get().choose(cls, subclasses).map((handle2) => new ObjCObject(handle2));
    for (const match of matches) {
      const result = callbacks.onMatch(match);
      if (result === "stop")
        break;
    }
    callbacks.onComplete();
  }
  function makeMethodInvocationWrapper(method, owner, superSpecifier, invocationOptions) {
    const sel = method.sel;
    let handle = method.handle;
    let types;
    if (handle === void 0) {
      handle = null;
      types = method.types;
    } else {
      types = api.method_getTypeEncoding(handle).readUtf8String();
    }
    const signature = parseSignature(types);
    const retType = signature.retType;
    const argTypes = signature.argTypes.slice(2);
    const objc_msgSend = superSpecifier ? getMsgSendSuperImpl(signature, invocationOptions) : getMsgSendImpl(signature, invocationOptions);
    const argVariableNames = argTypes.map(function(t, i) {
      return "a" + (i + 1);
    });
    const callArgs = [
      superSpecifier ? "superSpecifier" : "this",
      "sel"
    ].concat(argTypes.map(function(t, i) {
      if (t.toNative) {
        return "argTypes[" + i + "].toNative.call(this, " + argVariableNames[i] + ")";
      }
      return argVariableNames[i];
    }));
    let returnCaptureLeft;
    let returnCaptureRight;
    if (retType.type === "void") {
      returnCaptureLeft = "";
      returnCaptureRight = "";
    } else if (retType.fromNative) {
      returnCaptureLeft = "return retType.fromNative.call(this, ";
      returnCaptureRight = ")";
    } else {
      returnCaptureLeft = "return ";
      returnCaptureRight = "";
    }
    const m = eval("var m = function (" + argVariableNames.join(", ") + ") { " + returnCaptureLeft + "objc_msgSend(" + callArgs.join(", ") + ")" + returnCaptureRight + "; }; m;");
    Object.defineProperty(m, "handle", {
      enumerable: true,
      get: getMethodHandle
    });
    m.selector = sel;
    Object.defineProperty(m, "implementation", {
      enumerable: true,
      get() {
        const h = getMethodHandle();
        const impl = new NativeFunction(api.method_getImplementation(h), m.returnType, m.argumentTypes, invocationOptions);
        const newImp = getReplacementMethodImplementation(h);
        if (newImp !== null)
          impl._callback = newImp;
        return impl;
      },
      set(imp) {
        replaceMethodImplementation(getMethodHandle(), imp);
      }
    });
    m.returnType = retType.type;
    m.argumentTypes = signature.argTypes.map((t) => t.type);
    m.types = types;
    Object.defineProperty(m, "symbol", {
      enumerable: true,
      get() {
        return `${method.kind}[${owner.$className} ${selectorAsString(sel)}]`;
      }
    });
    m.clone = function(options) {
      return makeMethodInvocationWrapper(method, owner, superSpecifier, options);
    };
    function getMethodHandle() {
      if (handle === null) {
        if (owner.$kind === "instance") {
          let cur = owner;
          do {
            if ("- forwardingTargetForSelector:" in cur) {
              const target = cur.forwardingTargetForSelector_(sel);
              if (target === null)
                break;
              if (target.$kind !== "instance")
                break;
              const h = api.class_getInstanceMethod(target.$class.handle, sel);
              if (!h.isNull())
                handle = h;
              else
                cur = target;
            } else {
              break;
            }
          } while (handle === null);
        }
        if (handle === null)
          throw new Error("Unable to find method handle of proxied function");
      }
      return handle;
    }
    return m;
  }
  function makeMethodImplementationWrapper(signature, implementation) {
    const retType = signature.retType;
    const argTypes = signature.argTypes;
    const argVariableNames = argTypes.map(function(t, i) {
      if (i === 0)
        return "handle";
      else if (i === 1)
        return "sel";
      else
        return "a" + (i - 1);
    });
    const callArgs = argTypes.slice(2).map(function(t, i) {
      const argVariableName = argVariableNames[2 + i];
      if (t.fromNative) {
        return "argTypes[" + (2 + i) + "].fromNative.call(self, " + argVariableName + ")";
      }
      return argVariableName;
    });
    let returnCaptureLeft;
    let returnCaptureRight;
    if (retType.type === "void") {
      returnCaptureLeft = "";
      returnCaptureRight = "";
    } else if (retType.toNative) {
      returnCaptureLeft = "return retType.toNative.call(self, ";
      returnCaptureRight = ")";
    } else {
      returnCaptureLeft = "return ";
      returnCaptureRight = "";
    }
    const m = eval("var m = function (" + argVariableNames.join(", ") + ") { var binding = getBinding(handle);var self = binding.self;" + returnCaptureLeft + "implementation.call(binding" + (callArgs.length > 0 ? ", " : "") + callArgs.join(", ") + ")" + returnCaptureRight + "; }; m;");
    return m;
  }
  function makeBlockInvocationWrapper(block, signature, implementation) {
    const retType = signature.retType;
    const argTypes = signature.argTypes.slice(1);
    const argVariableNames = argTypes.map(function(t, i) {
      return "a" + (i + 1);
    });
    const callArgs = argTypes.map(function(t, i) {
      if (t.toNative) {
        return "argTypes[" + i + "].toNative.call(this, " + argVariableNames[i] + ")";
      }
      return argVariableNames[i];
    });
    let returnCaptureLeft;
    let returnCaptureRight;
    if (retType.type === "void") {
      returnCaptureLeft = "";
      returnCaptureRight = "";
    } else if (retType.fromNative) {
      returnCaptureLeft = "return retType.fromNative.call(this, ";
      returnCaptureRight = ")";
    } else {
      returnCaptureLeft = "return ";
      returnCaptureRight = "";
    }
    const f = eval("var f = function (" + argVariableNames.join(", ") + ") { " + returnCaptureLeft + "implementation(this" + (callArgs.length > 0 ? ", " : "") + callArgs.join(", ") + ")" + returnCaptureRight + "; }; f;");
    return f.bind(block);
  }
  function makeBlockImplementationWrapper(block, signature, implementation) {
    const retType = signature.retType;
    const argTypes = signature.argTypes;
    const argVariableNames = argTypes.map(function(t, i) {
      if (i === 0)
        return "handle";
      else
        return "a" + i;
    });
    const callArgs = argTypes.slice(1).map(function(t, i) {
      const argVariableName = argVariableNames[1 + i];
      if (t.fromNative) {
        return "argTypes[" + (1 + i) + "].fromNative.call(this, " + argVariableName + ")";
      }
      return argVariableName;
    });
    let returnCaptureLeft;
    let returnCaptureRight;
    if (retType.type === "void") {
      returnCaptureLeft = "";
      returnCaptureRight = "";
    } else if (retType.toNative) {
      returnCaptureLeft = "return retType.toNative.call(this, ";
      returnCaptureRight = ")";
    } else {
      returnCaptureLeft = "return ";
      returnCaptureRight = "";
    }
    const f = eval("var f = function (" + argVariableNames.join(", ") + ") { if (!this.handle.equals(handle))this.handle = handle;" + returnCaptureLeft + "implementation.call(block" + (callArgs.length > 0 ? ", " : "") + callArgs.join(", ") + ")" + returnCaptureRight + "; }; f;");
    return f.bind(block);
  }
  function rawFridaType(t) {
    return t === "object" ? "pointer" : t;
  }
  function makeClassName() {
    for (let i = 1; true; i++) {
      const name = "FridaAnonymousClass" + i;
      if (!(name in classRegistry)) {
        return name;
      }
    }
  }
  function makeProtocolName() {
    for (let i = 1; true; i++) {
      const name = "FridaAnonymousProtocol" + i;
      if (!(name in protocolRegistry)) {
        return name;
      }
    }
  }
  function objcMethodName(name) {
    return name.replace(/_/g, ":");
  }
  function jsMethodName(name) {
    let result = name.replace(/:/g, "_");
    if (objCObjectBuiltins.has(result))
      result += "2";
    return result;
  }
  const isaMasks = {
    x64: "0x7ffffffffff8",
    arm64: "0xffffffff8"
  };
  const rawMask = isaMasks[Process.arch];
  if (rawMask !== void 0) {
    const mask = ptr(rawMask);
    readObjectIsa = function(p) {
      return p.readPointer().and(mask);
    };
  } else {
    readObjectIsa = function(p) {
      return p.readPointer();
    };
  }
  function getMsgSendImpl(signature2, invocationOptions2) {
    return resolveMsgSendImpl(msgSendBySignatureId, signature2, invocationOptions2, false);
  }
  function getMsgSendSuperImpl(signature2, invocationOptions2) {
    return resolveMsgSendImpl(msgSendSuperBySignatureId, signature2, invocationOptions2, true);
  }
  function resolveMsgSendImpl(cache, signature2, invocationOptions2, isSuper) {
    if (invocationOptions2 !== defaultInvocationOptions)
      return makeMsgSendImpl(signature2, invocationOptions2, isSuper);
    const { id } = signature2;
    let impl = cache.get(id);
    if (impl === void 0) {
      impl = makeMsgSendImpl(signature2, invocationOptions2, isSuper);
      cache.set(id, impl);
    }
    return impl;
  }
  function makeMsgSendImpl(signature2, invocationOptions2, isSuper) {
    const retType2 = signature2.retType.type;
    const argTypes2 = signature2.argTypes.map(function(t) {
      return t.type;
    });
    const components = ["objc_msgSend"];
    if (isSuper)
      components.push("Super");
    const returnsStruct = retType2 instanceof Array;
    if (returnsStruct && !typeFitsInRegisters(retType2))
      components.push("_stret");
    else if (retType2 === "float" || retType2 === "double")
      components.push("_fpret");
    const name = components.join("");
    return new NativeFunction(api[name], retType2, argTypes2, invocationOptions2);
  }
  function typeFitsInRegisters(type) {
    if (Process.arch !== "x64")
      return false;
    const size = sizeOfTypeOnX64(type);
    return size <= 16;
  }
  function sizeOfTypeOnX64(type) {
    if (type instanceof Array)
      return type.reduce((total, field) => total + sizeOfTypeOnX64(field), 0);
    switch (type) {
      case "bool":
      case "char":
      case "uchar":
        return 1;
      case "int16":
      case "uint16":
        return 2;
      case "int":
      case "int32":
      case "uint":
      case "uint32":
      case "float":
        return 4;
      default:
        return 8;
    }
  }
  function unparseSignature(retType2, argTypes2) {
    const retTypeId = typeIdFromAlias(retType2);
    const argTypeIds = argTypes2.map(typeIdFromAlias);
    const argSizes = argTypeIds.map((id) => singularTypeById[id].size);
    const frameSize = argSizes.reduce((total, size) => total + size, 0);
    let frameOffset = 0;
    return retTypeId + frameSize + argTypeIds.map((id, i) => {
      const result = id + frameOffset;
      frameOffset += argSizes[i];
      return result;
    }).join("");
  }
  function parseSignature(sig) {
    const cursor = [sig, 0];
    parseQualifiers(cursor);
    const retType2 = readType(cursor);
    readNumber(cursor);
    const argTypes2 = [];
    let id = JSON.stringify(retType2.type);
    while (dataAvailable(cursor)) {
      parseQualifiers(cursor);
      const argType = readType(cursor);
      readNumber(cursor);
      argTypes2.push(argType);
      id += JSON.stringify(argType.type);
    }
    return {
      id,
      retType: retType2,
      argTypes: argTypes2
    };
  }
  function parseType(type) {
    const cursor = [type, 0];
    return readType(cursor);
  }
  function readType(cursor) {
    let id = readChar(cursor);
    if (id === "@") {
      let next = peekChar(cursor);
      if (next === "?") {
        id += next;
        skipChar(cursor);
        if (peekChar(cursor) === "<")
          skipExtendedBlock(cursor);
      } else if (next === '"') {
        skipChar(cursor);
        readUntil('"', cursor);
      }
    } else if (id === "^") {
      let next = peekChar(cursor);
      if (next === "@") {
        id += next;
        skipChar(cursor);
      }
    }
    const type = singularTypeById[id];
    if (type !== void 0) {
      return type;
    } else if (id === "[") {
      const length = readNumber(cursor);
      const elementType = readType(cursor);
      skipChar(cursor);
      return arrayType(length, elementType);
    } else if (id === "{") {
      if (!tokenExistsAhead("=", "}", cursor)) {
        readUntil("}", cursor);
        return structType([]);
      }
      readUntil("=", cursor);
      const structFields = [];
      let ch;
      while ((ch = peekChar(cursor)) !== "}") {
        if (ch === '"') {
          skipChar(cursor);
          readUntil('"', cursor);
        }
        structFields.push(readType(cursor));
      }
      skipChar(cursor);
      return structType(structFields);
    } else if (id === "(") {
      readUntil("=", cursor);
      const unionFields = [];
      while (peekChar(cursor) !== ")")
        unionFields.push(readType(cursor));
      skipChar(cursor);
      return unionType(unionFields);
    } else if (id === "b") {
      readNumber(cursor);
      return singularTypeById.i;
    } else if (id === "^") {
      readType(cursor);
      return singularTypeById["?"];
    } else if (modifiers.has(id)) {
      return readType(cursor);
    } else {
      throw new Error("Unable to handle type " + id);
    }
  }
  function skipExtendedBlock(cursor) {
    let ch;
    skipChar(cursor);
    while ((ch = peekChar(cursor)) !== ">") {
      if (peekChar(cursor) === "<") {
        skipExtendedBlock(cursor);
      } else {
        skipChar(cursor);
        if (ch === '"')
          readUntil('"', cursor);
      }
    }
    skipChar(cursor);
  }
  function readNumber(cursor) {
    let result = "";
    while (dataAvailable(cursor)) {
      const c = peekChar(cursor);
      const v = c.charCodeAt(0);
      const isDigit = v >= 48 && v <= 57;
      if (isDigit) {
        result += c;
        skipChar(cursor);
      } else {
        break;
      }
    }
    return parseInt(result);
  }
  function readUntil(token, cursor) {
    const buffer = cursor[0];
    const offset = cursor[1];
    const index = buffer.indexOf(token, offset);
    if (index === -1)
      throw new Error("Expected token '" + token + "' not found");
    const result = buffer.substring(offset, index);
    cursor[1] = index + 1;
    return result;
  }
  function readChar(cursor) {
    return cursor[0][cursor[1]++];
  }
  function peekChar(cursor) {
    return cursor[0][cursor[1]];
  }
  function tokenExistsAhead(token, terminator, cursor) {
    const [buffer, offset] = cursor;
    const tokenIndex = buffer.indexOf(token, offset);
    if (tokenIndex === -1)
      return false;
    const terminatorIndex = buffer.indexOf(terminator, offset);
    if (terminatorIndex === -1)
      throw new Error("Expected to find terminator: " + terminator);
    return tokenIndex < terminatorIndex;
  }
  function skipChar(cursor) {
    cursor[1]++;
  }
  function dataAvailable(cursor) {
    return cursor[1] !== cursor[0].length;
  }
  const qualifierById = {
    "r": "const",
    "n": "in",
    "N": "inout",
    "o": "out",
    "O": "bycopy",
    "R": "byref",
    "V": "oneway"
  };
  function parseQualifiers(cursor) {
    const qualifiers = [];
    while (true) {
      const q = qualifierById[peekChar(cursor)];
      if (q === void 0)
        break;
      qualifiers.push(q);
      skipChar(cursor);
    }
    return qualifiers;
  }
  const idByAlias = {
    "char": "c",
    "int": "i",
    "int16": "s",
    "int32": "i",
    "int64": "q",
    "uchar": "C",
    "uint": "I",
    "uint16": "S",
    "uint32": "I",
    "uint64": "Q",
    "float": "f",
    "double": "d",
    "bool": "B",
    "void": "v",
    "string": "*",
    "object": "@",
    "block": "@?",
    "class": "#",
    "selector": ":",
    "pointer": "^v"
  };
  function typeIdFromAlias(alias) {
    if (typeof alias === "object" && alias !== null)
      return `@"${alias.type}"`;
    const id = idByAlias[alias];
    if (id === void 0)
      throw new Error("No known encoding for type " + alias);
    return id;
  }
  const fromNativeId = function(h) {
    if (h.isNull()) {
      return null;
    } else if (h.toString(16) === this.handle.toString(16)) {
      return this;
    } else {
      return new ObjCObject(h);
    }
  };
  const toNativeId = function(v) {
    if (v === null)
      return NULL;
    const type = typeof v;
    if (type === "string") {
      if (cachedNSStringCtor === null) {
        cachedNSString = classRegistry.NSString;
        cachedNSStringCtor = cachedNSString.stringWithUTF8String_;
      }
      return cachedNSStringCtor.call(cachedNSString, Memory.allocUtf8String(v));
    } else if (type === "number") {
      if (cachedNSNumberCtor === null) {
        cachedNSNumber = classRegistry.NSNumber;
        cachedNSNumberCtor = cachedNSNumber.numberWithDouble_;
      }
      return cachedNSNumberCtor.call(cachedNSNumber, v);
    }
    return v;
  };
  const fromNativeBlock = function(h) {
    if (h.isNull()) {
      return null;
    } else if (h.toString(16) === this.handle.toString(16)) {
      return this;
    } else {
      return new Block(h);
    }
  };
  const toNativeBlock = function(v) {
    return v !== null ? v : NULL;
  };
  const toNativeObjectArray = function(v) {
    if (v instanceof Array) {
      const length = v.length;
      const array = Memory.alloc(length * pointerSize);
      for (let i = 0; i !== length; i++)
        array.add(i * pointerSize).writePointer(toNativeId(v[i]));
      return array;
    }
    return v;
  };
  function arrayType(length, elementType) {
    return {
      type: "pointer",
      read(address) {
        const result = [];
        const elementSize = elementType.size;
        for (let index = 0; index !== length; index++) {
          result.push(elementType.read(address.add(index * elementSize)));
        }
        return result;
      },
      write(address, values) {
        const elementSize = elementType.size;
        values.forEach((value, index) => {
          elementType.write(address.add(index * elementSize), value);
        });
      }
    };
  }
  function structType(fieldTypes) {
    let fromNative, toNative;
    if (fieldTypes.some(function(t) {
      return !!t.fromNative;
    })) {
      const fromTransforms = fieldTypes.map(function(t) {
        if (t.fromNative)
          return t.fromNative;
        else
          return identityTransform;
      });
      fromNative = function(v) {
        return v.map(function(e, i) {
          return fromTransforms[i].call(this, e);
        });
      };
    } else {
      fromNative = identityTransform;
    }
    if (fieldTypes.some(function(t) {
      return !!t.toNative;
    })) {
      const toTransforms = fieldTypes.map(function(t) {
        if (t.toNative)
          return t.toNative;
        else
          return identityTransform;
      });
      toNative = function(v) {
        return v.map(function(e, i) {
          return toTransforms[i].call(this, e);
        });
      };
    } else {
      toNative = identityTransform;
    }
    const [totalSize, fieldOffsets] = fieldTypes.reduce(function(result, t) {
      const [previousOffset, offsets] = result;
      const { size } = t;
      const offset = align(previousOffset, size);
      offsets.push(offset);
      return [offset + size, offsets];
    }, [0, []]);
    return {
      type: fieldTypes.map((t) => t.type),
      size: totalSize,
      read(address) {
        return fieldTypes.map((type, index) => type.read(address.add(fieldOffsets[index])));
      },
      write(address, values) {
        values.forEach((value, index) => {
          fieldTypes[index].write(address.add(fieldOffsets[index]), value);
        });
      },
      fromNative,
      toNative
    };
  }
  function unionType(fieldTypes) {
    const largestType = fieldTypes.reduce(function(largest, t) {
      if (t.size > largest.size)
        return t;
      else
        return largest;
    }, fieldTypes[0]);
    let fromNative, toNative;
    if (largestType.fromNative) {
      const fromTransform = largestType.fromNative;
      fromNative = function(v) {
        return fromTransform.call(this, v[0]);
      };
    } else {
      fromNative = function(v) {
        return v[0];
      };
    }
    if (largestType.toNative) {
      const toTransform = largestType.toNative;
      toNative = function(v) {
        return [toTransform.call(this, v)];
      };
    } else {
      toNative = function(v) {
        return [v];
      };
    }
    return {
      type: [largestType.type],
      size: largestType.size,
      read: largestType.read,
      write: largestType.write,
      fromNative,
      toNative
    };
  }
  const longBits = pointerSize == 8 && Process.platform !== "windows" ? 64 : 32;
  modifiers = /* @__PURE__ */ new Set([
    "j",
    // complex
    "A",
    // atomic
    "r",
    // const
    "n",
    // in
    "N",
    // inout
    "o",
    // out
    "O",
    // by copy
    "R",
    // by ref
    "V",
    // one way
    "+"
    // GNU register
  ]);
  singularTypeById = {
    "c": {
      type: "char",
      size: 1,
      read: (address) => address.readS8(),
      write: (address, value) => {
        address.writeS8(value);
      },
      toNative(v) {
        if (typeof v === "boolean") {
          return v ? 1 : 0;
        }
        return v;
      }
    },
    "i": {
      type: "int",
      size: 4,
      read: (address) => address.readInt(),
      write: (address, value) => {
        address.writeInt(value);
      }
    },
    "s": {
      type: "int16",
      size: 2,
      read: (address) => address.readS16(),
      write: (address, value) => {
        address.writeS16(value);
      }
    },
    "l": {
      type: "int32",
      size: 4,
      read: (address) => address.readS32(),
      write: (address, value) => {
        address.writeS32(value);
      }
    },
    "q": {
      type: "int64",
      size: 8,
      read: (address) => address.readS64(),
      write: (address, value) => {
        address.writeS64(value);
      }
    },
    "C": {
      type: "uchar",
      size: 1,
      read: (address) => address.readU8(),
      write: (address, value) => {
        address.writeU8(value);
      }
    },
    "I": {
      type: "uint",
      size: 4,
      read: (address) => address.readUInt(),
      write: (address, value) => {
        address.writeUInt(value);
      }
    },
    "S": {
      type: "uint16",
      size: 2,
      read: (address) => address.readU16(),
      write: (address, value) => {
        address.writeU16(value);
      }
    },
    "L": {
      type: "uint" + longBits,
      size: longBits / 8,
      read: (address) => address.readULong(),
      write: (address, value) => {
        address.writeULong(value);
      }
    },
    "Q": {
      type: "uint64",
      size: 8,
      read: (address) => address.readU64(),
      write: (address, value) => {
        address.writeU64(value);
      }
    },
    "f": {
      type: "float",
      size: 4,
      read: (address) => address.readFloat(),
      write: (address, value) => {
        address.writeFloat(value);
      }
    },
    "d": {
      type: "double",
      size: 8,
      read: (address) => address.readDouble(),
      write: (address, value) => {
        address.writeDouble(value);
      }
    },
    "B": {
      type: "bool",
      size: 1,
      read: (address) => address.readU8(),
      write: (address, value) => {
        address.writeU8(value);
      },
      fromNative(v) {
        return v ? true : false;
      },
      toNative(v) {
        return v ? 1 : 0;
      }
    },
    "v": {
      type: "void",
      size: 0
    },
    "*": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      },
      fromNative(h) {
        return h.readUtf8String();
      }
    },
    "@": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      },
      fromNative: fromNativeId,
      toNative: toNativeId
    },
    "@?": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      },
      fromNative: fromNativeBlock,
      toNative: toNativeBlock
    },
    "^@": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      },
      toNative: toNativeObjectArray
    },
    "^v": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      }
    },
    "#": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      },
      fromNative: fromNativeId,
      toNative: toNativeId
    },
    ":": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      }
    },
    "?": {
      type: "pointer",
      size: pointerSize,
      read: (address) => address.readPointer(),
      write: (address, value) => {
        address.writePointer(value);
      }
    }
  };
  function identityTransform(v) {
    return v;
  }
  function align(value, boundary) {
    const remainder = value % boundary;
    return remainder === 0 ? value : value + (boundary - remainder);
  }
}
var runtime = new Runtime();
var frida_objc_bridge_default = runtime;

// node_modules/frida-java-bridge/lib/android.js
var android_exports = {};
__export(android_exports, {
  ArtMethod: () => ArtMethod,
  ArtStackVisitor: () => ArtStackVisitor,
  DVM_JNI_ENV_OFFSET_SELF: () => DVM_JNI_ENV_OFFSET_SELF,
  HandleVector: () => HandleVector,
  VariableSizedHandleScope: () => VariableSizedHandleScope,
  backtrace: () => backtrace,
  deoptimizeBootImage: () => deoptimizeBootImage,
  deoptimizeEverything: () => deoptimizeEverything,
  deoptimizeMethod: () => deoptimizeMethod,
  ensureClassInitialized: () => ensureClassInitialized,
  getAndroidApiLevel: () => getAndroidApiLevel,
  getAndroidVersion: () => getAndroidVersion,
  getApi: () => getApi2,
  getArtApexVersion: () => getArtApexVersion,
  getArtClassSpec: () => getArtClassSpec,
  getArtFieldSpec: () => getArtFieldSpec,
  getArtMethodSpec: () => getArtMethodSpec,
  getArtThreadFromEnv: () => getArtThreadFromEnv,
  getArtThreadSpec: () => getArtThreadSpec,
  makeArtClassLoaderVisitor: () => makeArtClassLoaderVisitor,
  makeArtClassVisitor: () => makeArtClassVisitor,
  makeMethodMangler: () => makeMethodMangler,
  makeObjectVisitorPredicate: () => makeObjectVisitorPredicate,
  revertGlobalPatches: () => revertGlobalPatches,
  translateMethod: () => translateMethod,
  withAllArtThreadsSuspended: () => withAllArtThreadsSuspended,
  withRunnableArtThread: () => withRunnableArtThread
});

// node_modules/frida-java-bridge/lib/alloc.js
var {
  pageSize,
  pointerSize: pointerSize3
} = Process;
var CodeAllocator = class {
  constructor(sliceSize) {
    this.sliceSize = sliceSize;
    this.slicesPerPage = pageSize / sliceSize;
    this.pages = [];
    this.free = [];
  }
  allocateSlice(spec, alignment) {
    const anyLocation = spec.near === void 0;
    const anyAlignment = alignment === 1;
    if (anyLocation && anyAlignment) {
      const slice2 = this.free.pop();
      if (slice2 !== void 0) {
        return slice2;
      }
    } else if (alignment < pageSize) {
      const { free } = this;
      const n = free.length;
      const alignMask = anyAlignment ? null : ptr(alignment - 1);
      for (let i = 0; i !== n; i++) {
        const slice2 = free[i];
        const satisfiesLocation = anyLocation || this._isSliceNear(slice2, spec);
        const satisfiesAlignment = anyAlignment || slice2.and(alignMask).isNull();
        if (satisfiesLocation && satisfiesAlignment) {
          return free.splice(i, 1)[0];
        }
      }
    }
    return this._allocatePage(spec);
  }
  _allocatePage(spec) {
    const page = Memory.alloc(pageSize, spec);
    const { sliceSize, slicesPerPage } = this;
    for (let i = 1; i !== slicesPerPage; i++) {
      const slice2 = page.add(i * sliceSize);
      this.free.push(slice2);
    }
    this.pages.push(page);
    return page;
  }
  _isSliceNear(slice2, spec) {
    const sliceEnd = slice2.add(this.sliceSize);
    const { near, maxDistance } = spec;
    const startDistance = abs(near.sub(slice2));
    const endDistance = abs(near.sub(sliceEnd));
    return startDistance.compare(maxDistance) <= 0 && endDistance.compare(maxDistance) <= 0;
  }
  freeSlice(slice2) {
    this.free.push(slice2);
  }
};
function abs(nptr) {
  const shmt = pointerSize3 === 4 ? 31 : 63;
  const mask = ptr(1).shl(shmt).not();
  return nptr.and(mask);
}
function makeAllocator(sliceSize) {
  return new CodeAllocator(sliceSize);
}

// node_modules/frida-java-bridge/lib/result.js
var JNI_OK = 0;
function checkJniResult(name, result) {
  if (result !== JNI_OK) {
    throw new Error(name + " failed: " + result);
  }
}

// node_modules/frida-java-bridge/lib/jvmti.js
var jvmtiVersion = {
  v1_0: 805371904,
  v1_2: 805372416
};
var jvmtiCapabilities = {
  canTagObjects: 1
};
var { pointerSize: pointerSize4 } = Process;
var nativeFunctionOptions = {
  exceptions: "propagate"
};
function EnvJvmti(handle2, vm3) {
  this.handle = handle2;
  this.vm = vm3;
  this.vtable = handle2.readPointer();
}
EnvJvmti.prototype.deallocate = proxy(47, "int32", ["pointer", "pointer"], function(impl, mem) {
  return impl(this.handle, mem);
});
EnvJvmti.prototype.getLoadedClasses = proxy(78, "int32", ["pointer", "pointer", "pointer"], function(impl, classCountPtr, classesPtr) {
  const result = impl(this.handle, classCountPtr, classesPtr);
  checkJniResult("EnvJvmti::getLoadedClasses", result);
});
EnvJvmti.prototype.iterateOverInstancesOfClass = proxy(112, "int32", ["pointer", "pointer", "int", "pointer", "pointer"], function(impl, klass, objectFilter, heapObjectCallback, userData) {
  const result = impl(this.handle, klass, objectFilter, heapObjectCallback, userData);
  checkJniResult("EnvJvmti::iterateOverInstancesOfClass", result);
});
EnvJvmti.prototype.getObjectsWithTags = proxy(114, "int32", ["pointer", "int", "pointer", "pointer", "pointer", "pointer"], function(impl, tagCount, tags, countPtr, objectResultPtr, tagResultPtr) {
  const result = impl(this.handle, tagCount, tags, countPtr, objectResultPtr, tagResultPtr);
  checkJniResult("EnvJvmti::getObjectsWithTags", result);
});
EnvJvmti.prototype.addCapabilities = proxy(142, "int32", ["pointer", "pointer"], function(impl, capabilitiesPtr) {
  return impl(this.handle, capabilitiesPtr);
});
function proxy(offset, retType2, argTypes2, wrapper) {
  let impl = null;
  return function() {
    if (impl === null) {
      impl = new NativeFunction(this.vtable.add((offset - 1) * pointerSize4).readPointer(), retType2, argTypes2, nativeFunctionOptions);
    }
    let args = [impl];
    args = args.concat.apply(args, arguments);
    return wrapper.apply(this, args);
  };
}

// node_modules/frida-java-bridge/lib/machine-code.js
function parseInstructionsAt(address, tryParse, { limit }) {
  let cursor = address;
  let prevInsn = null;
  for (let i = 0; i !== limit; i++) {
    const insn = Instruction.parse(cursor);
    const value = tryParse(insn, prevInsn);
    if (value !== null) {
      return value;
    }
    cursor = insn.next;
    prevInsn = insn;
  }
  return null;
}

// node_modules/frida-java-bridge/lib/memoize.js
function memoize(compute) {
  let value = null;
  let computed = false;
  return function(...args) {
    if (!computed) {
      value = compute(...args);
      computed = true;
    }
    return value;
  };
}

// node_modules/frida-java-bridge/lib/env.js
function Env(handle2, vm3) {
  this.handle = handle2;
  this.vm = vm3;
}
var pointerSize5 = Process.pointerSize;
var JNI_ABORT = 2;
var CALL_CONSTRUCTOR_METHOD_OFFSET = 28;
var CALL_OBJECT_METHOD_OFFSET = 34;
var CALL_BOOLEAN_METHOD_OFFSET = 37;
var CALL_BYTE_METHOD_OFFSET = 40;
var CALL_CHAR_METHOD_OFFSET = 43;
var CALL_SHORT_METHOD_OFFSET = 46;
var CALL_INT_METHOD_OFFSET = 49;
var CALL_LONG_METHOD_OFFSET = 52;
var CALL_FLOAT_METHOD_OFFSET = 55;
var CALL_DOUBLE_METHOD_OFFSET = 58;
var CALL_VOID_METHOD_OFFSET = 61;
var CALL_NONVIRTUAL_OBJECT_METHOD_OFFSET = 64;
var CALL_NONVIRTUAL_BOOLEAN_METHOD_OFFSET = 67;
var CALL_NONVIRTUAL_BYTE_METHOD_OFFSET = 70;
var CALL_NONVIRTUAL_CHAR_METHOD_OFFSET = 73;
var CALL_NONVIRTUAL_SHORT_METHOD_OFFSET = 76;
var CALL_NONVIRTUAL_INT_METHOD_OFFSET = 79;
var CALL_NONVIRTUAL_LONG_METHOD_OFFSET = 82;
var CALL_NONVIRTUAL_FLOAT_METHOD_OFFSET = 85;
var CALL_NONVIRTUAL_DOUBLE_METHOD_OFFSET = 88;
var CALL_NONVIRTUAL_VOID_METHOD_OFFSET = 91;
var CALL_STATIC_OBJECT_METHOD_OFFSET = 114;
var CALL_STATIC_BOOLEAN_METHOD_OFFSET = 117;
var CALL_STATIC_BYTE_METHOD_OFFSET = 120;
var CALL_STATIC_CHAR_METHOD_OFFSET = 123;
var CALL_STATIC_SHORT_METHOD_OFFSET = 126;
var CALL_STATIC_INT_METHOD_OFFSET = 129;
var CALL_STATIC_LONG_METHOD_OFFSET = 132;
var CALL_STATIC_FLOAT_METHOD_OFFSET = 135;
var CALL_STATIC_DOUBLE_METHOD_OFFSET = 138;
var CALL_STATIC_VOID_METHOD_OFFSET = 141;
var GET_OBJECT_FIELD_OFFSET = 95;
var GET_BOOLEAN_FIELD_OFFSET = 96;
var GET_BYTE_FIELD_OFFSET = 97;
var GET_CHAR_FIELD_OFFSET = 98;
var GET_SHORT_FIELD_OFFSET = 99;
var GET_INT_FIELD_OFFSET = 100;
var GET_LONG_FIELD_OFFSET = 101;
var GET_FLOAT_FIELD_OFFSET = 102;
var GET_DOUBLE_FIELD_OFFSET = 103;
var SET_OBJECT_FIELD_OFFSET = 104;
var SET_BOOLEAN_FIELD_OFFSET = 105;
var SET_BYTE_FIELD_OFFSET = 106;
var SET_CHAR_FIELD_OFFSET = 107;
var SET_SHORT_FIELD_OFFSET = 108;
var SET_INT_FIELD_OFFSET = 109;
var SET_LONG_FIELD_OFFSET = 110;
var SET_FLOAT_FIELD_OFFSET = 111;
var SET_DOUBLE_FIELD_OFFSET = 112;
var GET_STATIC_OBJECT_FIELD_OFFSET = 145;
var GET_STATIC_BOOLEAN_FIELD_OFFSET = 146;
var GET_STATIC_BYTE_FIELD_OFFSET = 147;
var GET_STATIC_CHAR_FIELD_OFFSET = 148;
var GET_STATIC_SHORT_FIELD_OFFSET = 149;
var GET_STATIC_INT_FIELD_OFFSET = 150;
var GET_STATIC_LONG_FIELD_OFFSET = 151;
var GET_STATIC_FLOAT_FIELD_OFFSET = 152;
var GET_STATIC_DOUBLE_FIELD_OFFSET = 153;
var SET_STATIC_OBJECT_FIELD_OFFSET = 154;
var SET_STATIC_BOOLEAN_FIELD_OFFSET = 155;
var SET_STATIC_BYTE_FIELD_OFFSET = 156;
var SET_STATIC_CHAR_FIELD_OFFSET = 157;
var SET_STATIC_SHORT_FIELD_OFFSET = 158;
var SET_STATIC_INT_FIELD_OFFSET = 159;
var SET_STATIC_LONG_FIELD_OFFSET = 160;
var SET_STATIC_FLOAT_FIELD_OFFSET = 161;
var SET_STATIC_DOUBLE_FIELD_OFFSET = 162;
var callMethodOffset = {
  pointer: CALL_OBJECT_METHOD_OFFSET,
  uint8: CALL_BOOLEAN_METHOD_OFFSET,
  int8: CALL_BYTE_METHOD_OFFSET,
  uint16: CALL_CHAR_METHOD_OFFSET,
  int16: CALL_SHORT_METHOD_OFFSET,
  int32: CALL_INT_METHOD_OFFSET,
  int64: CALL_LONG_METHOD_OFFSET,
  float: CALL_FLOAT_METHOD_OFFSET,
  double: CALL_DOUBLE_METHOD_OFFSET,
  void: CALL_VOID_METHOD_OFFSET
};
var callNonvirtualMethodOffset = {
  pointer: CALL_NONVIRTUAL_OBJECT_METHOD_OFFSET,
  uint8: CALL_NONVIRTUAL_BOOLEAN_METHOD_OFFSET,
  int8: CALL_NONVIRTUAL_BYTE_METHOD_OFFSET,
  uint16: CALL_NONVIRTUAL_CHAR_METHOD_OFFSET,
  int16: CALL_NONVIRTUAL_SHORT_METHOD_OFFSET,
  int32: CALL_NONVIRTUAL_INT_METHOD_OFFSET,
  int64: CALL_NONVIRTUAL_LONG_METHOD_OFFSET,
  float: CALL_NONVIRTUAL_FLOAT_METHOD_OFFSET,
  double: CALL_NONVIRTUAL_DOUBLE_METHOD_OFFSET,
  void: CALL_NONVIRTUAL_VOID_METHOD_OFFSET
};
var callStaticMethodOffset = {
  pointer: CALL_STATIC_OBJECT_METHOD_OFFSET,
  uint8: CALL_STATIC_BOOLEAN_METHOD_OFFSET,
  int8: CALL_STATIC_BYTE_METHOD_OFFSET,
  uint16: CALL_STATIC_CHAR_METHOD_OFFSET,
  int16: CALL_STATIC_SHORT_METHOD_OFFSET,
  int32: CALL_STATIC_INT_METHOD_OFFSET,
  int64: CALL_STATIC_LONG_METHOD_OFFSET,
  float: CALL_STATIC_FLOAT_METHOD_OFFSET,
  double: CALL_STATIC_DOUBLE_METHOD_OFFSET,
  void: CALL_STATIC_VOID_METHOD_OFFSET
};
var getFieldOffset = {
  pointer: GET_OBJECT_FIELD_OFFSET,
  uint8: GET_BOOLEAN_FIELD_OFFSET,
  int8: GET_BYTE_FIELD_OFFSET,
  uint16: GET_CHAR_FIELD_OFFSET,
  int16: GET_SHORT_FIELD_OFFSET,
  int32: GET_INT_FIELD_OFFSET,
  int64: GET_LONG_FIELD_OFFSET,
  float: GET_FLOAT_FIELD_OFFSET,
  double: GET_DOUBLE_FIELD_OFFSET
};
var setFieldOffset = {
  pointer: SET_OBJECT_FIELD_OFFSET,
  uint8: SET_BOOLEAN_FIELD_OFFSET,
  int8: SET_BYTE_FIELD_OFFSET,
  uint16: SET_CHAR_FIELD_OFFSET,
  int16: SET_SHORT_FIELD_OFFSET,
  int32: SET_INT_FIELD_OFFSET,
  int64: SET_LONG_FIELD_OFFSET,
  float: SET_FLOAT_FIELD_OFFSET,
  double: SET_DOUBLE_FIELD_OFFSET
};
var getStaticFieldOffset = {
  pointer: GET_STATIC_OBJECT_FIELD_OFFSET,
  uint8: GET_STATIC_BOOLEAN_FIELD_OFFSET,
  int8: GET_STATIC_BYTE_FIELD_OFFSET,
  uint16: GET_STATIC_CHAR_FIELD_OFFSET,
  int16: GET_STATIC_SHORT_FIELD_OFFSET,
  int32: GET_STATIC_INT_FIELD_OFFSET,
  int64: GET_STATIC_LONG_FIELD_OFFSET,
  float: GET_STATIC_FLOAT_FIELD_OFFSET,
  double: GET_STATIC_DOUBLE_FIELD_OFFSET
};
var setStaticFieldOffset = {
  pointer: SET_STATIC_OBJECT_FIELD_OFFSET,
  uint8: SET_STATIC_BOOLEAN_FIELD_OFFSET,
  int8: SET_STATIC_BYTE_FIELD_OFFSET,
  uint16: SET_STATIC_CHAR_FIELD_OFFSET,
  int16: SET_STATIC_SHORT_FIELD_OFFSET,
  int32: SET_STATIC_INT_FIELD_OFFSET,
  int64: SET_STATIC_LONG_FIELD_OFFSET,
  float: SET_STATIC_FLOAT_FIELD_OFFSET,
  double: SET_STATIC_DOUBLE_FIELD_OFFSET
};
var nativeFunctionOptions2 = {
  exceptions: "propagate"
};
var cachedVtable = null;
var globalRefs = [];
Env.dispose = function(env) {
  globalRefs.forEach(env.deleteGlobalRef, env);
  globalRefs = [];
};
function register(globalRef) {
  globalRefs.push(globalRef);
  return globalRef;
}
function vtable(instance) {
  if (cachedVtable === null) {
    cachedVtable = instance.handle.readPointer();
  }
  return cachedVtable;
}
function proxy2(offset, retType2, argTypes2, wrapper) {
  let impl = null;
  return function() {
    if (impl === null) {
      impl = new NativeFunction(vtable(this).add(offset * pointerSize5).readPointer(), retType2, argTypes2, nativeFunctionOptions2);
    }
    let args = [impl];
    args = args.concat.apply(args, arguments);
    return wrapper.apply(this, args);
  };
}
Env.prototype.getVersion = proxy2(4, "int32", ["pointer"], function(impl) {
  return impl(this.handle);
});
Env.prototype.findClass = proxy2(6, "pointer", ["pointer", "pointer"], function(impl, name) {
  const result = impl(this.handle, Memory.allocUtf8String(name));
  this.throwIfExceptionPending();
  return result;
});
Env.prototype.throwIfExceptionPending = function() {
  const throwable = this.exceptionOccurred();
  if (throwable.isNull()) {
    return;
  }
  this.exceptionClear();
  const handle2 = this.newGlobalRef(throwable);
  this.deleteLocalRef(throwable);
  const description = this.vaMethod("pointer", [])(this.handle, handle2, this.javaLangObject().toString);
  const descriptionStr = this.stringFromJni(description);
  this.deleteLocalRef(description);
  const error = new Error(descriptionStr);
  error.$h = handle2;
  Script.bindWeak(error, makeErrorHandleDestructor(this.vm, handle2));
  throw error;
};
function makeErrorHandleDestructor(vm3, handle2) {
  return function() {
    vm3.perform((env) => {
      env.deleteGlobalRef(handle2);
    });
  };
}
Env.prototype.fromReflectedMethod = proxy2(7, "pointer", ["pointer", "pointer"], function(impl, method2) {
  return impl(this.handle, method2);
});
Env.prototype.fromReflectedField = proxy2(8, "pointer", ["pointer", "pointer"], function(impl, method2) {
  return impl(this.handle, method2);
});
Env.prototype.toReflectedMethod = proxy2(9, "pointer", ["pointer", "pointer", "pointer", "uint8"], function(impl, klass, methodId, isStatic) {
  return impl(this.handle, klass, methodId, isStatic);
});
Env.prototype.getSuperclass = proxy2(10, "pointer", ["pointer", "pointer"], function(impl, klass) {
  return impl(this.handle, klass);
});
Env.prototype.isAssignableFrom = proxy2(11, "uint8", ["pointer", "pointer", "pointer"], function(impl, klass1, klass2) {
  return !!impl(this.handle, klass1, klass2);
});
Env.prototype.toReflectedField = proxy2(12, "pointer", ["pointer", "pointer", "pointer", "uint8"], function(impl, klass, fieldId, isStatic) {
  return impl(this.handle, klass, fieldId, isStatic);
});
Env.prototype.throw = proxy2(13, "int32", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.exceptionOccurred = proxy2(15, "pointer", ["pointer"], function(impl) {
  return impl(this.handle);
});
Env.prototype.exceptionDescribe = proxy2(16, "void", ["pointer"], function(impl) {
  impl(this.handle);
});
Env.prototype.exceptionClear = proxy2(17, "void", ["pointer"], function(impl) {
  impl(this.handle);
});
Env.prototype.pushLocalFrame = proxy2(19, "int32", ["pointer", "int32"], function(impl, capacity) {
  return impl(this.handle, capacity);
});
Env.prototype.popLocalFrame = proxy2(20, "pointer", ["pointer", "pointer"], function(impl, result) {
  return impl(this.handle, result);
});
Env.prototype.newGlobalRef = proxy2(21, "pointer", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.deleteGlobalRef = proxy2(22, "void", ["pointer", "pointer"], function(impl, globalRef) {
  impl(this.handle, globalRef);
});
Env.prototype.deleteLocalRef = proxy2(23, "void", ["pointer", "pointer"], function(impl, localRef) {
  impl(this.handle, localRef);
});
Env.prototype.isSameObject = proxy2(24, "uint8", ["pointer", "pointer", "pointer"], function(impl, ref1, ref2) {
  return !!impl(this.handle, ref1, ref2);
});
Env.prototype.newLocalRef = proxy2(25, "pointer", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.allocObject = proxy2(27, "pointer", ["pointer", "pointer"], function(impl, clazz) {
  return impl(this.handle, clazz);
});
Env.prototype.getObjectClass = proxy2(31, "pointer", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.isInstanceOf = proxy2(32, "uint8", ["pointer", "pointer", "pointer"], function(impl, obj, klass) {
  return !!impl(this.handle, obj, klass);
});
Env.prototype.getMethodId = proxy2(33, "pointer", ["pointer", "pointer", "pointer", "pointer"], function(impl, klass, name, sig) {
  return impl(this.handle, klass, Memory.allocUtf8String(name), Memory.allocUtf8String(sig));
});
Env.prototype.getFieldId = proxy2(94, "pointer", ["pointer", "pointer", "pointer", "pointer"], function(impl, klass, name, sig) {
  return impl(this.handle, klass, Memory.allocUtf8String(name), Memory.allocUtf8String(sig));
});
Env.prototype.getIntField = proxy2(100, "int32", ["pointer", "pointer", "pointer"], function(impl, obj, fieldId) {
  return impl(this.handle, obj, fieldId);
});
Env.prototype.getStaticMethodId = proxy2(113, "pointer", ["pointer", "pointer", "pointer", "pointer"], function(impl, klass, name, sig) {
  return impl(this.handle, klass, Memory.allocUtf8String(name), Memory.allocUtf8String(sig));
});
Env.prototype.getStaticFieldId = proxy2(144, "pointer", ["pointer", "pointer", "pointer", "pointer"], function(impl, klass, name, sig) {
  return impl(this.handle, klass, Memory.allocUtf8String(name), Memory.allocUtf8String(sig));
});
Env.prototype.getStaticIntField = proxy2(150, "int32", ["pointer", "pointer", "pointer"], function(impl, obj, fieldId) {
  return impl(this.handle, obj, fieldId);
});
Env.prototype.getStringLength = proxy2(164, "int32", ["pointer", "pointer"], function(impl, str) {
  return impl(this.handle, str);
});
Env.prototype.getStringChars = proxy2(165, "pointer", ["pointer", "pointer", "pointer"], function(impl, str) {
  return impl(this.handle, str, NULL);
});
Env.prototype.releaseStringChars = proxy2(166, "void", ["pointer", "pointer", "pointer"], function(impl, str, utf) {
  impl(this.handle, str, utf);
});
Env.prototype.newStringUtf = proxy2(167, "pointer", ["pointer", "pointer"], function(impl, str) {
  const utf = Memory.allocUtf8String(str);
  return impl(this.handle, utf);
});
Env.prototype.getStringUtfChars = proxy2(169, "pointer", ["pointer", "pointer", "pointer"], function(impl, str) {
  return impl(this.handle, str, NULL);
});
Env.prototype.releaseStringUtfChars = proxy2(170, "void", ["pointer", "pointer", "pointer"], function(impl, str, utf) {
  impl(this.handle, str, utf);
});
Env.prototype.getArrayLength = proxy2(171, "int32", ["pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array);
});
Env.prototype.newObjectArray = proxy2(172, "pointer", ["pointer", "int32", "pointer", "pointer"], function(impl, length, elementClass, initialElement) {
  return impl(this.handle, length, elementClass, initialElement);
});
Env.prototype.getObjectArrayElement = proxy2(173, "pointer", ["pointer", "pointer", "int32"], function(impl, array, index) {
  return impl(this.handle, array, index);
});
Env.prototype.setObjectArrayElement = proxy2(174, "void", ["pointer", "pointer", "int32", "pointer"], function(impl, array, index, value) {
  impl(this.handle, array, index, value);
});
Env.prototype.newBooleanArray = proxy2(175, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newByteArray = proxy2(176, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newCharArray = proxy2(177, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newShortArray = proxy2(178, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newIntArray = proxy2(179, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newLongArray = proxy2(180, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newFloatArray = proxy2(181, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.newDoubleArray = proxy2(182, "pointer", ["pointer", "int32"], function(impl, length) {
  return impl(this.handle, length);
});
Env.prototype.getBooleanArrayElements = proxy2(183, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getByteArrayElements = proxy2(184, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getCharArrayElements = proxy2(185, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getShortArrayElements = proxy2(186, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getIntArrayElements = proxy2(187, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getLongArrayElements = proxy2(188, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getFloatArrayElements = proxy2(189, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.getDoubleArrayElements = proxy2(190, "pointer", ["pointer", "pointer", "pointer"], function(impl, array) {
  return impl(this.handle, array, NULL);
});
Env.prototype.releaseBooleanArrayElements = proxy2(191, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseByteArrayElements = proxy2(192, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseCharArrayElements = proxy2(193, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseShortArrayElements = proxy2(194, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseIntArrayElements = proxy2(195, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseLongArrayElements = proxy2(196, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseFloatArrayElements = proxy2(197, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.releaseDoubleArrayElements = proxy2(198, "pointer", ["pointer", "pointer", "pointer", "int32"], function(impl, array, cArray) {
  impl(this.handle, array, cArray, JNI_ABORT);
});
Env.prototype.getByteArrayRegion = proxy2(200, "void", ["pointer", "pointer", "int", "int", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setBooleanArrayRegion = proxy2(207, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setByteArrayRegion = proxy2(208, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setCharArrayRegion = proxy2(209, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setShortArrayRegion = proxy2(210, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setIntArrayRegion = proxy2(211, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setLongArrayRegion = proxy2(212, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setFloatArrayRegion = proxy2(213, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.setDoubleArrayRegion = proxy2(214, "void", ["pointer", "pointer", "int32", "int32", "pointer"], function(impl, array, start, length, cArray) {
  impl(this.handle, array, start, length, cArray);
});
Env.prototype.registerNatives = proxy2(215, "int32", ["pointer", "pointer", "pointer", "int32"], function(impl, klass, methods, numMethods) {
  return impl(this.handle, klass, methods, numMethods);
});
Env.prototype.monitorEnter = proxy2(217, "int32", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.monitorExit = proxy2(218, "int32", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.getDirectBufferAddress = proxy2(230, "pointer", ["pointer", "pointer"], function(impl, obj) {
  return impl(this.handle, obj);
});
Env.prototype.getObjectRefType = proxy2(232, "int32", ["pointer", "pointer"], function(impl, ref) {
  return impl(this.handle, ref);
});
var cachedMethods = /* @__PURE__ */ new Map();
function plainMethod(offset, retType2, argTypes2, options) {
  return getOrMakeMethod(this, "p", makePlainMethod, offset, retType2, argTypes2, options);
}
function vaMethod(offset, retType2, argTypes2, options) {
  return getOrMakeMethod(this, "v", makeVaMethod, offset, retType2, argTypes2, options);
}
function nonvirtualVaMethod(offset, retType2, argTypes2, options) {
  return getOrMakeMethod(this, "n", makeNonvirtualVaMethod, offset, retType2, argTypes2, options);
}
function getOrMakeMethod(env, flavor, construct, offset, retType2, argTypes2, options) {
  if (options !== void 0) {
    return construct(env, offset, retType2, argTypes2, options);
  }
  const key = [offset, flavor, retType2].concat(argTypes2).join("|");
  let m2 = cachedMethods.get(key);
  if (m2 === void 0) {
    m2 = construct(env, offset, retType2, argTypes2, nativeFunctionOptions2);
    cachedMethods.set(key, m2);
  }
  return m2;
}
function makePlainMethod(env, offset, retType2, argTypes2, options) {
  return new NativeFunction(
    vtable(env).add(offset * pointerSize5).readPointer(),
    retType2,
    ["pointer", "pointer", "pointer"].concat(argTypes2),
    options
  );
}
function makeVaMethod(env, offset, retType2, argTypes2, options) {
  return new NativeFunction(
    vtable(env).add(offset * pointerSize5).readPointer(),
    retType2,
    ["pointer", "pointer", "pointer", "..."].concat(argTypes2),
    options
  );
}
function makeNonvirtualVaMethod(env, offset, retType2, argTypes2, options) {
  return new NativeFunction(
    vtable(env).add(offset * pointerSize5).readPointer(),
    retType2,
    ["pointer", "pointer", "pointer", "pointer", "..."].concat(argTypes2),
    options
  );
}
Env.prototype.constructor = function(argTypes2, options) {
  return vaMethod.call(this, CALL_CONSTRUCTOR_METHOD_OFFSET, "pointer", argTypes2, options);
};
Env.prototype.vaMethod = function(retType2, argTypes2, options) {
  const offset = callMethodOffset[retType2];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + retType2);
  }
  return vaMethod.call(this, offset, retType2, argTypes2, options);
};
Env.prototype.nonvirtualVaMethod = function(retType2, argTypes2, options) {
  const offset = callNonvirtualMethodOffset[retType2];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + retType2);
  }
  return nonvirtualVaMethod.call(this, offset, retType2, argTypes2, options);
};
Env.prototype.staticVaMethod = function(retType2, argTypes2, options) {
  const offset = callStaticMethodOffset[retType2];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + retType2);
  }
  return vaMethod.call(this, offset, retType2, argTypes2, options);
};
Env.prototype.getField = function(fieldType) {
  const offset = getFieldOffset[fieldType];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + fieldType);
  }
  return plainMethod.call(this, offset, fieldType, []);
};
Env.prototype.getStaticField = function(fieldType) {
  const offset = getStaticFieldOffset[fieldType];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + fieldType);
  }
  return plainMethod.call(this, offset, fieldType, []);
};
Env.prototype.setField = function(fieldType) {
  const offset = setFieldOffset[fieldType];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + fieldType);
  }
  return plainMethod.call(this, offset, "void", [fieldType]);
};
Env.prototype.setStaticField = function(fieldType) {
  const offset = setStaticFieldOffset[fieldType];
  if (offset === void 0) {
    throw new Error("Unsupported type: " + fieldType);
  }
  return plainMethod.call(this, offset, "void", [fieldType]);
};
var javaLangClass = null;
Env.prototype.javaLangClass = function() {
  if (javaLangClass === null) {
    const handle2 = this.findClass("java/lang/Class");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangClass = {
        handle: register(this.newGlobalRef(handle2)),
        getName: get2("getName", "()Ljava/lang/String;"),
        getSimpleName: get2("getSimpleName", "()Ljava/lang/String;"),
        getGenericSuperclass: get2("getGenericSuperclass", "()Ljava/lang/reflect/Type;"),
        getDeclaredConstructors: get2("getDeclaredConstructors", "()[Ljava/lang/reflect/Constructor;"),
        getDeclaredMethods: get2("getDeclaredMethods", "()[Ljava/lang/reflect/Method;"),
        getDeclaredFields: get2("getDeclaredFields", "()[Ljava/lang/reflect/Field;"),
        isArray: get2("isArray", "()Z"),
        isPrimitive: get2("isPrimitive", "()Z"),
        isInterface: get2("isInterface", "()Z"),
        getComponentType: get2("getComponentType", "()Ljava/lang/Class;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangClass;
};
var javaLangObject = null;
Env.prototype.javaLangObject = function() {
  if (javaLangObject === null) {
    const handle2 = this.findClass("java/lang/Object");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangObject = {
        handle: register(this.newGlobalRef(handle2)),
        toString: get2("toString", "()Ljava/lang/String;"),
        getClass: get2("getClass", "()Ljava/lang/Class;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangObject;
};
var javaLangReflectConstructor = null;
Env.prototype.javaLangReflectConstructor = function() {
  if (javaLangReflectConstructor === null) {
    const handle2 = this.findClass("java/lang/reflect/Constructor");
    try {
      javaLangReflectConstructor = {
        getGenericParameterTypes: this.getMethodId(handle2, "getGenericParameterTypes", "()[Ljava/lang/reflect/Type;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectConstructor;
};
var javaLangReflectMethod = null;
Env.prototype.javaLangReflectMethod = function() {
  if (javaLangReflectMethod === null) {
    const handle2 = this.findClass("java/lang/reflect/Method");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangReflectMethod = {
        getName: get2("getName", "()Ljava/lang/String;"),
        getGenericParameterTypes: get2("getGenericParameterTypes", "()[Ljava/lang/reflect/Type;"),
        getParameterTypes: get2("getParameterTypes", "()[Ljava/lang/Class;"),
        getGenericReturnType: get2("getGenericReturnType", "()Ljava/lang/reflect/Type;"),
        getGenericExceptionTypes: get2("getGenericExceptionTypes", "()[Ljava/lang/reflect/Type;"),
        getModifiers: get2("getModifiers", "()I"),
        isVarArgs: get2("isVarArgs", "()Z")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectMethod;
};
var javaLangReflectField = null;
Env.prototype.javaLangReflectField = function() {
  if (javaLangReflectField === null) {
    const handle2 = this.findClass("java/lang/reflect/Field");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangReflectField = {
        getName: get2("getName", "()Ljava/lang/String;"),
        getType: get2("getType", "()Ljava/lang/Class;"),
        getGenericType: get2("getGenericType", "()Ljava/lang/reflect/Type;"),
        getModifiers: get2("getModifiers", "()I"),
        toString: get2("toString", "()Ljava/lang/String;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectField;
};
var javaLangReflectTypeVariable = null;
Env.prototype.javaLangReflectTypeVariable = function() {
  if (javaLangReflectTypeVariable === null) {
    const handle2 = this.findClass("java/lang/reflect/TypeVariable");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangReflectTypeVariable = {
        handle: register(this.newGlobalRef(handle2)),
        getName: get2("getName", "()Ljava/lang/String;"),
        getBounds: get2("getBounds", "()[Ljava/lang/reflect/Type;"),
        getGenericDeclaration: get2("getGenericDeclaration", "()Ljava/lang/reflect/GenericDeclaration;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectTypeVariable;
};
var javaLangReflectWildcardType = null;
Env.prototype.javaLangReflectWildcardType = function() {
  if (javaLangReflectWildcardType === null) {
    const handle2 = this.findClass("java/lang/reflect/WildcardType");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangReflectWildcardType = {
        handle: register(this.newGlobalRef(handle2)),
        getLowerBounds: get2("getLowerBounds", "()[Ljava/lang/reflect/Type;"),
        getUpperBounds: get2("getUpperBounds", "()[Ljava/lang/reflect/Type;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectWildcardType;
};
var javaLangReflectGenericArrayType = null;
Env.prototype.javaLangReflectGenericArrayType = function() {
  if (javaLangReflectGenericArrayType === null) {
    const handle2 = this.findClass("java/lang/reflect/GenericArrayType");
    try {
      javaLangReflectGenericArrayType = {
        handle: register(this.newGlobalRef(handle2)),
        getGenericComponentType: this.getMethodId(handle2, "getGenericComponentType", "()Ljava/lang/reflect/Type;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectGenericArrayType;
};
var javaLangReflectParameterizedType = null;
Env.prototype.javaLangReflectParameterizedType = function() {
  if (javaLangReflectParameterizedType === null) {
    const handle2 = this.findClass("java/lang/reflect/ParameterizedType");
    try {
      const get2 = this.getMethodId.bind(this, handle2);
      javaLangReflectParameterizedType = {
        handle: register(this.newGlobalRef(handle2)),
        getActualTypeArguments: get2("getActualTypeArguments", "()[Ljava/lang/reflect/Type;"),
        getRawType: get2("getRawType", "()Ljava/lang/reflect/Type;"),
        getOwnerType: get2("getOwnerType", "()Ljava/lang/reflect/Type;")
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangReflectParameterizedType;
};
var javaLangString = null;
Env.prototype.javaLangString = function() {
  if (javaLangString === null) {
    const handle2 = this.findClass("java/lang/String");
    try {
      javaLangString = {
        handle: register(this.newGlobalRef(handle2))
      };
    } finally {
      this.deleteLocalRef(handle2);
    }
  }
  return javaLangString;
};
Env.prototype.getClassName = function(classHandle) {
  const name = this.vaMethod("pointer", [])(this.handle, classHandle, this.javaLangClass().getName);
  try {
    return this.stringFromJni(name);
  } finally {
    this.deleteLocalRef(name);
  }
};
Env.prototype.getObjectClassName = function(objHandle) {
  const jklass = this.getObjectClass(objHandle);
  try {
    return this.getClassName(jklass);
  } finally {
    this.deleteLocalRef(jklass);
  }
};
Env.prototype.getActualTypeArgument = function(type) {
  const actualTypeArguments = this.vaMethod("pointer", [])(this.handle, type, this.javaLangReflectParameterizedType().getActualTypeArguments);
  this.throwIfExceptionPending();
  if (!actualTypeArguments.isNull()) {
    try {
      return this.getTypeNameFromFirstTypeElement(actualTypeArguments);
    } finally {
      this.deleteLocalRef(actualTypeArguments);
    }
  }
};
Env.prototype.getTypeNameFromFirstTypeElement = function(typeArray) {
  const length = this.getArrayLength(typeArray);
  if (length > 0) {
    const typeArgument0 = this.getObjectArrayElement(typeArray, 0);
    try {
      return this.getTypeName(typeArgument0);
    } finally {
      this.deleteLocalRef(typeArgument0);
    }
  } else {
    return "java.lang.Object";
  }
};
Env.prototype.getTypeName = function(type, getGenericsInformation) {
  const invokeObjectMethodNoArgs = this.vaMethod("pointer", []);
  if (this.isInstanceOf(type, this.javaLangClass().handle)) {
    return this.getClassName(type);
  } else if (this.isInstanceOf(type, this.javaLangReflectGenericArrayType().handle)) {
    return this.getArrayTypeName(type);
  } else if (this.isInstanceOf(type, this.javaLangReflectParameterizedType().handle)) {
    const rawType = invokeObjectMethodNoArgs(this.handle, type, this.javaLangReflectParameterizedType().getRawType);
    this.throwIfExceptionPending();
    let result;
    try {
      result = this.getTypeName(rawType);
    } finally {
      this.deleteLocalRef(rawType);
    }
    if (getGenericsInformation) {
      result += "<" + this.getActualTypeArgument(type) + ">";
    }
    return result;
  } else if (this.isInstanceOf(type, this.javaLangReflectTypeVariable().handle)) {
    return "java.lang.Object";
  } else if (this.isInstanceOf(type, this.javaLangReflectWildcardType().handle)) {
    return "java.lang.Object";
  } else {
    return "java.lang.Object";
  }
};
Env.prototype.getArrayTypeName = function(type) {
  const invokeObjectMethodNoArgs = this.vaMethod("pointer", []);
  if (this.isInstanceOf(type, this.javaLangClass().handle)) {
    return this.getClassName(type);
  } else if (this.isInstanceOf(type, this.javaLangReflectGenericArrayType().handle)) {
    const componentType = invokeObjectMethodNoArgs(this.handle, type, this.javaLangReflectGenericArrayType().getGenericComponentType);
    this.throwIfExceptionPending();
    try {
      return "[L" + this.getTypeName(componentType) + ";";
    } finally {
      this.deleteLocalRef(componentType);
    }
  } else {
    return "[Ljava.lang.Object;";
  }
};
Env.prototype.stringFromJni = function(str) {
  const utf = this.getStringChars(str);
  if (utf.isNull()) {
    throw new Error("Unable to access string");
  }
  try {
    const length = this.getStringLength(str);
    return utf.readUtf16String(length);
  } finally {
    this.releaseStringChars(str, utf);
  }
};

// node_modules/frida-java-bridge/lib/vm.js
var JNI_VERSION_1_6 = 65542;
var pointerSize6 = Process.pointerSize;
var jsThreadID = Process.getCurrentThreadId();
var attachedThreads = /* @__PURE__ */ new Map();
var activeEnvs = /* @__PURE__ */ new Map();
function VM(api3) {
  const handle2 = api3.vm;
  let attachCurrentThread = null;
  let detachCurrentThread = null;
  let getEnv = null;
  function initialize2() {
    const vtable2 = handle2.readPointer();
    const options = {
      exceptions: "propagate"
    };
    attachCurrentThread = new NativeFunction(vtable2.add(4 * pointerSize6).readPointer(), "int32", ["pointer", "pointer", "pointer"], options);
    detachCurrentThread = new NativeFunction(vtable2.add(5 * pointerSize6).readPointer(), "int32", ["pointer"], options);
    getEnv = new NativeFunction(vtable2.add(6 * pointerSize6).readPointer(), "int32", ["pointer", "pointer", "int32"], options);
  }
  this.handle = handle2;
  this.perform = function(fn) {
    const threadId = Process.getCurrentThreadId();
    const cachedEnv = tryGetCachedEnv(threadId);
    if (cachedEnv !== null) {
      return fn(cachedEnv);
    }
    let env = this._tryGetEnv();
    const alreadyAttached = env !== null;
    if (!alreadyAttached) {
      env = this.attachCurrentThread();
      attachedThreads.set(threadId, true);
    }
    this.link(threadId, env);
    try {
      return fn(env);
    } finally {
      const isJsThread = threadId === jsThreadID;
      if (!isJsThread) {
        this.unlink(threadId);
      }
      if (!alreadyAttached && !isJsThread) {
        const allowedToDetach = attachedThreads.get(threadId);
        attachedThreads.delete(threadId);
        if (allowedToDetach) {
          this.detachCurrentThread();
        }
      }
    }
  };
  this.attachCurrentThread = function() {
    const envBuf = Memory.alloc(pointerSize6);
    checkJniResult("VM::AttachCurrentThread", attachCurrentThread(handle2, envBuf, NULL));
    return new Env(envBuf.readPointer(), this);
  };
  this.detachCurrentThread = function() {
    checkJniResult("VM::DetachCurrentThread", detachCurrentThread(handle2));
  };
  this.preventDetachDueToClassLoader = function() {
    const threadId = Process.getCurrentThreadId();
    if (attachedThreads.has(threadId)) {
      attachedThreads.set(threadId, false);
    }
  };
  this.getEnv = function() {
    const cachedEnv = tryGetCachedEnv(Process.getCurrentThreadId());
    if (cachedEnv !== null) {
      return cachedEnv;
    }
    const envBuf = Memory.alloc(pointerSize6);
    const result = getEnv(handle2, envBuf, JNI_VERSION_1_6);
    if (result === -2) {
      throw new Error("Current thread is not attached to the Java VM; please move this code inside a Java.perform() callback");
    }
    checkJniResult("VM::GetEnv", result);
    return new Env(envBuf.readPointer(), this);
  };
  this.tryGetEnv = function() {
    const cachedEnv = tryGetCachedEnv(Process.getCurrentThreadId());
    if (cachedEnv !== null) {
      return cachedEnv;
    }
    return this._tryGetEnv();
  };
  this._tryGetEnv = function() {
    const h = this.tryGetEnvHandle(JNI_VERSION_1_6);
    if (h === null) {
      return null;
    }
    return new Env(h, this);
  };
  this.tryGetEnvHandle = function(version) {
    const envBuf = Memory.alloc(pointerSize6);
    const result = getEnv(handle2, envBuf, version);
    if (result !== JNI_OK) {
      return null;
    }
    return envBuf.readPointer();
  };
  this.makeHandleDestructor = function(handle3) {
    return () => {
      this.perform((env) => {
        env.deleteGlobalRef(handle3);
      });
    };
  };
  this.link = function(tid, env) {
    const entry = activeEnvs.get(tid);
    if (entry === void 0) {
      activeEnvs.set(tid, [env, 1]);
    } else {
      entry[1]++;
    }
  };
  this.unlink = function(tid) {
    const entry = activeEnvs.get(tid);
    if (entry[1] === 1) {
      activeEnvs.delete(tid);
    } else {
      entry[1]--;
    }
  };
  function tryGetCachedEnv(threadId) {
    const entry = activeEnvs.get(threadId);
    if (entry === void 0) {
      return null;
    }
    return entry[0];
  }
  initialize2.call(this);
}
VM.dispose = function(vm3) {
  if (attachedThreads.get(jsThreadID) === true) {
    attachedThreads.delete(jsThreadID);
    vm3.detachCurrentThread();
  }
};

// node_modules/frida-java-bridge/lib/android.js
var jsizeSize = 4;
var pointerSize7 = Process.pointerSize;
var {
  readU32,
  readPointer,
  writeU32,
  writePointer
} = NativePointer.prototype;
var kAccPublic = 1;
var kAccStatic = 8;
var kAccFinal = 16;
var kAccNative = 256;
var kAccFastNative = 524288;
var kAccCriticalNative = 2097152;
var kAccFastInterpreterToInterpreterInvoke = 1073741824;
var kAccSkipAccessChecks = 524288;
var kAccSingleImplementation = 134217728;
var kAccNterpEntryPointFastPathFlag = 1048576;
var kAccNterpInvokeFastPathFlag = 2097152;
var kAccPublicApi = 268435456;
var kAccXposedHookedMethod = 268435456;
var kPointer = 0;
var kFullDeoptimization = 3;
var kSelectiveDeoptimization = 5;
var THUMB_BIT_REMOVAL_MASK = ptr(1).not();
var X86_JMP_MAX_DISTANCE = 2147467263;
var ARM64_ADRP_MAX_DISTANCE = 4294963200;
var ENV_VTABLE_OFFSET_EXCEPTION_CLEAR = 17 * pointerSize7;
var ENV_VTABLE_OFFSET_FATAL_ERROR = 18 * pointerSize7;
var DVM_JNI_ENV_OFFSET_SELF = 12;
var DVM_CLASS_OBJECT_OFFSET_VTABLE_COUNT = 112;
var DVM_CLASS_OBJECT_OFFSET_VTABLE = 116;
var DVM_OBJECT_OFFSET_CLAZZ = 0;
var DVM_METHOD_SIZE = 56;
var DVM_METHOD_OFFSET_ACCESS_FLAGS = 4;
var DVM_METHOD_OFFSET_METHOD_INDEX = 8;
var DVM_METHOD_OFFSET_REGISTERS_SIZE = 10;
var DVM_METHOD_OFFSET_OUTS_SIZE = 12;
var DVM_METHOD_OFFSET_INS_SIZE = 14;
var DVM_METHOD_OFFSET_SHORTY = 28;
var DVM_METHOD_OFFSET_JNI_ARG_INFO = 36;
var DALVIK_JNI_RETURN_VOID = 0;
var DALVIK_JNI_RETURN_FLOAT = 1;
var DALVIK_JNI_RETURN_DOUBLE = 2;
var DALVIK_JNI_RETURN_S8 = 3;
var DALVIK_JNI_RETURN_S4 = 4;
var DALVIK_JNI_RETURN_S2 = 5;
var DALVIK_JNI_RETURN_U2 = 6;
var DALVIK_JNI_RETURN_S1 = 7;
var DALVIK_JNI_NO_ARG_INFO = 2147483648;
var DALVIK_JNI_RETURN_SHIFT = 28;
var STD_STRING_SIZE = 3 * pointerSize7;
var STD_VECTOR_SIZE = 3 * pointerSize7;
var AF_UNIX = 1;
var SOCK_STREAM = 1;
var getArtRuntimeSpec = memoize(_getArtRuntimeSpec);
var getArtInstrumentationSpec = memoize(_getArtInstrumentationSpec);
var getArtMethodSpec = memoize(_getArtMethodSpec);
var getArtThreadSpec = memoize(_getArtThreadSpec);
var getArtManagedStackSpec = memoize(_getArtManagedStackSpec);
var getArtThreadStateTransitionImpl = memoize(_getArtThreadStateTransitionImpl);
var getAndroidVersion = memoize(_getAndroidVersion);
var getAndroidCodename = memoize(_getAndroidCodename);
var getAndroidApiLevel = memoize(_getAndroidApiLevel);
var getArtApexVersion = memoize(_getArtApexVersion);
var getArtQuickFrameInfoGetterThunk = memoize(_getArtQuickFrameInfoGetterThunk);
var makeCxxMethodWrapperReturningPointerByValue = Process.arch === "ia32" ? makeCxxMethodWrapperReturningPointerByValueInFirstArg : makeCxxMethodWrapperReturningPointerByValueGeneric;
var nativeFunctionOptions3 = {
  exceptions: "propagate"
};
var artThreadStateTransitions = {};
var cachedApi2 = null;
var cachedArtClassLinkerSpec = null;
var MethodMangler = null;
var artController = null;
var inlineHooks = [];
var patchedClasses = /* @__PURE__ */ new Map();
var artQuickInterceptors = [];
var thunkPage = null;
var thunkOffset = 0;
var taughtArtAboutReplacementMethods = false;
var taughtArtAboutMethodInstrumentation = false;
var backtraceModule = null;
var jdwpSessions = [];
var socketpair = null;
var trampolineAllocator = null;
function getApi2() {
  if (cachedApi2 === null) {
    cachedApi2 = _getApi();
  }
  return cachedApi2;
}
function _getApi() {
  const vmModules = Process.enumerateModules().filter((m2) => /^lib(art|dvm).so$/.test(m2.name)).filter((m2) => !/\/system\/fake-libs/.test(m2.path));
  if (vmModules.length === 0) {
    return null;
  }
  const vmModule = vmModules[0];
  const flavor = vmModule.name.indexOf("art") !== -1 ? "art" : "dalvik";
  const isArt = flavor === "art";
  const temporaryApi = {
    module: vmModule,
    find(name) {
      const { module } = this;
      let address = module.findExportByName(name);
      if (address === null) {
        address = module.findSymbolByName(name);
      }
      return address;
    },
    flavor,
    addLocalReference: null
  };
  temporaryApi.isApiLevel34OrApexEquivalent = isArt && (temporaryApi.find("_ZN3art7AppInfo29GetPrimaryApkReferenceProfileEv") !== null || temporaryApi.find("_ZN3art6Thread15RunFlipFunctionEPS0_") !== null);
  const pending = isArt ? {
    functions: {
      JNI_GetCreatedJavaVMs: ["JNI_GetCreatedJavaVMs", "int", ["pointer", "int", "pointer"]],
      // Android < 7
      artInterpreterToCompiledCodeBridge: function(address) {
        this.artInterpreterToCompiledCodeBridge = address;
      },
      // Android >= 8
      _ZN3art9JavaVMExt12AddGlobalRefEPNS_6ThreadENS_6ObjPtrINS_6mirror6ObjectEEE: ["art::JavaVMExt::AddGlobalRef", "pointer", ["pointer", "pointer", "pointer"]],
      // Android >= 6
      _ZN3art9JavaVMExt12AddGlobalRefEPNS_6ThreadEPNS_6mirror6ObjectE: ["art::JavaVMExt::AddGlobalRef", "pointer", ["pointer", "pointer", "pointer"]],
      // Android < 6: makeAddGlobalRefFallbackForAndroid5() needs these:
      _ZN3art17ReaderWriterMutex13ExclusiveLockEPNS_6ThreadE: ["art::ReaderWriterMutex::ExclusiveLock", "void", ["pointer", "pointer"]],
      _ZN3art17ReaderWriterMutex15ExclusiveUnlockEPNS_6ThreadE: ["art::ReaderWriterMutex::ExclusiveUnlock", "void", ["pointer", "pointer"]],
      // Android <= 7
      _ZN3art22IndirectReferenceTable3AddEjPNS_6mirror6ObjectE: function(address) {
        this["art::IndirectReferenceTable::Add"] = new NativeFunction(address, "pointer", ["pointer", "uint", "pointer"], nativeFunctionOptions3);
      },
      // Android > 7
      _ZN3art22IndirectReferenceTable3AddENS_15IRTSegmentStateENS_6ObjPtrINS_6mirror6ObjectEEE: function(address) {
        this["art::IndirectReferenceTable::Add"] = new NativeFunction(address, "pointer", ["pointer", "uint", "pointer"], nativeFunctionOptions3);
      },
      // Android >= 7
      _ZN3art9JavaVMExt12DecodeGlobalEPv: function(address) {
        let decodeGlobal;
        if (getAndroidApiLevel() >= 26) {
          decodeGlobal = makeCxxMethodWrapperReturningPointerByValue(address, ["pointer", "pointer"]);
        } else {
          decodeGlobal = new NativeFunction(address, "pointer", ["pointer", "pointer"], nativeFunctionOptions3);
        }
        this["art::JavaVMExt::DecodeGlobal"] = function(vm3, thread, ref) {
          return decodeGlobal(vm3, ref);
        };
      },
      // Android >= 6
      _ZN3art9JavaVMExt12DecodeGlobalEPNS_6ThreadEPv: ["art::JavaVMExt::DecodeGlobal", "pointer", ["pointer", "pointer", "pointer"]],
      // makeDecodeGlobalFallback() uses:
      // Android >= 15
      _ZNK3art6Thread19DecodeGlobalJObjectEP8_jobject: ["art::Thread::DecodeJObject", "pointer", ["pointer", "pointer"]],
      // Android < 6
      _ZNK3art6Thread13DecodeJObjectEP8_jobject: ["art::Thread::DecodeJObject", "pointer", ["pointer", "pointer"]],
      // Android >= 6
      _ZN3art10ThreadList10SuspendAllEPKcb: ["art::ThreadList::SuspendAll", "void", ["pointer", "pointer", "bool"]],
      // or fallback:
      _ZN3art10ThreadList10SuspendAllEv: function(address) {
        const suspendAll = new NativeFunction(address, "void", ["pointer"], nativeFunctionOptions3);
        this["art::ThreadList::SuspendAll"] = function(threadList, cause, longSuspend) {
          return suspendAll(threadList);
        };
      },
      _ZN3art10ThreadList9ResumeAllEv: ["art::ThreadList::ResumeAll", "void", ["pointer"]],
      // Android >= 7
      _ZN3art11ClassLinker12VisitClassesEPNS_12ClassVisitorE: ["art::ClassLinker::VisitClasses", "void", ["pointer", "pointer"]],
      // Android < 7
      _ZN3art11ClassLinker12VisitClassesEPFbPNS_6mirror5ClassEPvES4_: function(address) {
        const visitClasses = new NativeFunction(address, "void", ["pointer", "pointer", "pointer"], nativeFunctionOptions3);
        this["art::ClassLinker::VisitClasses"] = function(classLinker, visitor) {
          visitClasses(classLinker, visitor, NULL);
        };
      },
      _ZNK3art11ClassLinker17VisitClassLoadersEPNS_18ClassLoaderVisitorE: ["art::ClassLinker::VisitClassLoaders", "void", ["pointer", "pointer"]],
      _ZN3art2gc4Heap12VisitObjectsEPFvPNS_6mirror6ObjectEPvES5_: ["art::gc::Heap::VisitObjects", "void", ["pointer", "pointer", "pointer"]],
      _ZN3art2gc4Heap12GetInstancesERNS_24VariableSizedHandleScopeENS_6HandleINS_6mirror5ClassEEEiRNSt3__16vectorINS4_INS5_6ObjectEEENS8_9allocatorISB_EEEE: ["art::gc::Heap::GetInstances", "void", ["pointer", "pointer", "pointer", "int", "pointer"]],
      // Android >= 9
      _ZN3art2gc4Heap12GetInstancesERNS_24VariableSizedHandleScopeENS_6HandleINS_6mirror5ClassEEEbiRNSt3__16vectorINS4_INS5_6ObjectEEENS8_9allocatorISB_EEEE: function(address) {
        const getInstances = new NativeFunction(address, "void", ["pointer", "pointer", "pointer", "bool", "int", "pointer"], nativeFunctionOptions3);
        this["art::gc::Heap::GetInstances"] = function(instance, scope, hClass, maxCount, instances) {
          const useIsAssignableFrom = 0;
          getInstances(instance, scope, hClass, useIsAssignableFrom, maxCount, instances);
        };
      },
      _ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEjb: ["art::StackVisitor::StackVisitor", "void", ["pointer", "pointer", "pointer", "uint", "uint", "bool"]],
      _ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEmb: ["art::StackVisitor::StackVisitor", "void", ["pointer", "pointer", "pointer", "uint", "size_t", "bool"]],
      _ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE0EEEvb: ["art::StackVisitor::WalkStack", "void", ["pointer", "bool"]],
      _ZNK3art12StackVisitor9GetMethodEv: ["art::StackVisitor::GetMethod", "pointer", ["pointer"]],
      _ZNK3art12StackVisitor16DescribeLocationEv: function(address) {
        this["art::StackVisitor::DescribeLocation"] = makeCxxMethodWrapperReturningStdStringByValue(address, ["pointer"]);
      },
      _ZNK3art12StackVisitor24GetCurrentQuickFrameInfoEv: function(address) {
        this["art::StackVisitor::GetCurrentQuickFrameInfo"] = makeArtQuickFrameInfoGetter(address);
      },
      _ZN3art7Context6CreateEv: ["art::Context::Create", "pointer", []],
      _ZN3art6Thread18GetLongJumpContextEv: ["art::Thread::GetLongJumpContext", "pointer", ["pointer"]],
      _ZN3art6mirror5Class13GetDescriptorEPNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE: function(address) {
        this["art::mirror::Class::GetDescriptor"] = address;
      },
      _ZN3art6mirror5Class11GetLocationEv: function(address) {
        this["art::mirror::Class::GetLocation"] = makeCxxMethodWrapperReturningStdStringByValue(address, ["pointer"]);
      },
      _ZN3art9ArtMethod12PrettyMethodEb: function(address) {
        this["art::ArtMethod::PrettyMethod"] = makeCxxMethodWrapperReturningStdStringByValue(address, ["pointer", "bool"]);
      },
      _ZN3art12PrettyMethodEPNS_9ArtMethodEb: function(address) {
        this["art::ArtMethod::PrettyMethodNullSafe"] = makeCxxMethodWrapperReturningStdStringByValue(address, ["pointer", "bool"]);
      },
      // Android < 6 for cloneArtMethod()
      _ZN3art6Thread14CurrentFromGdbEv: ["art::Thread::CurrentFromGdb", "pointer", []],
      _ZN3art6mirror6Object5CloneEPNS_6ThreadE: function(address) {
        this["art::mirror::Object::Clone"] = new NativeFunction(address, "pointer", ["pointer", "pointer"], nativeFunctionOptions3);
      },
      _ZN3art6mirror6Object5CloneEPNS_6ThreadEm: function(address) {
        const clone = new NativeFunction(address, "pointer", ["pointer", "pointer", "pointer"], nativeFunctionOptions3);
        this["art::mirror::Object::Clone"] = function(thisPtr, threadPtr) {
          const numTargetBytes = NULL;
          return clone(thisPtr, threadPtr, numTargetBytes);
        };
      },
      _ZN3art6mirror6Object5CloneEPNS_6ThreadEj: function(address) {
        const clone = new NativeFunction(address, "pointer", ["pointer", "pointer", "uint"], nativeFunctionOptions3);
        this["art::mirror::Object::Clone"] = function(thisPtr, threadPtr) {
          const numTargetBytes = 0;
          return clone(thisPtr, threadPtr, numTargetBytes);
        };
      },
      _ZN3art3Dbg14SetJdwpAllowedEb: ["art::Dbg::SetJdwpAllowed", "void", ["bool"]],
      _ZN3art3Dbg13ConfigureJdwpERKNS_4JDWP11JdwpOptionsE: ["art::Dbg::ConfigureJdwp", "void", ["pointer"]],
      _ZN3art31InternalDebuggerControlCallback13StartDebuggerEv: ["art::InternalDebuggerControlCallback::StartDebugger", "void", ["pointer"]],
      _ZN3art3Dbg9StartJdwpEv: ["art::Dbg::StartJdwp", "void", []],
      _ZN3art3Dbg8GoActiveEv: ["art::Dbg::GoActive", "void", []],
      _ZN3art3Dbg21RequestDeoptimizationERKNS_21DeoptimizationRequestE: ["art::Dbg::RequestDeoptimization", "void", ["pointer"]],
      _ZN3art3Dbg20ManageDeoptimizationEv: ["art::Dbg::ManageDeoptimization", "void", []],
      _ZN3art15instrumentation15Instrumentation20EnableDeoptimizationEv: ["art::Instrumentation::EnableDeoptimization", "void", ["pointer"]],
      // Android >= 6
      _ZN3art15instrumentation15Instrumentation20DeoptimizeEverythingEPKc: ["art::Instrumentation::DeoptimizeEverything", "void", ["pointer", "pointer"]],
      // Android < 6
      _ZN3art15instrumentation15Instrumentation20DeoptimizeEverythingEv: function(address) {
        const deoptimize = new NativeFunction(address, "void", ["pointer"], nativeFunctionOptions3);
        this["art::Instrumentation::DeoptimizeEverything"] = function(instrumentation, key) {
          deoptimize(instrumentation);
        };
      },
      _ZN3art7Runtime19DeoptimizeBootImageEv: ["art::Runtime::DeoptimizeBootImage", "void", ["pointer"]],
      _ZN3art15instrumentation15Instrumentation10DeoptimizeEPNS_9ArtMethodE: ["art::Instrumentation::Deoptimize", "void", ["pointer", "pointer"]],
      // Android >= 11
      _ZN3art3jni12JniIdManager14DecodeMethodIdEP10_jmethodID: ["art::jni::JniIdManager::DecodeMethodId", "pointer", ["pointer", "pointer"]],
      _ZN3art3jni12JniIdManager13DecodeFieldIdEP9_jfieldID: ["art::jni::JniIdManager::DecodeFieldId", "pointer", ["pointer", "pointer"]],
      _ZN3art11interpreter18GetNterpEntryPointEv: ["art::interpreter::GetNterpEntryPoint", "pointer", []],
      _ZN3art7Monitor17TranslateLocationEPNS_9ArtMethodEjPPKcPi: ["art::Monitor::TranslateLocation", "void", ["pointer", "uint32", "pointer", "pointer"]]
    },
    variables: {
      _ZN3art3Dbg9gRegistryE: function(address) {
        this.isJdwpStarted = () => !address.readPointer().isNull();
      },
      _ZN3art3Dbg15gDebuggerActiveE: function(address) {
        this.isDebuggerActive = () => !!address.readU8();
      }
    },
    optionals: /* @__PURE__ */ new Set([
      "artInterpreterToCompiledCodeBridge",
      "_ZN3art9JavaVMExt12AddGlobalRefEPNS_6ThreadENS_6ObjPtrINS_6mirror6ObjectEEE",
      "_ZN3art9JavaVMExt12AddGlobalRefEPNS_6ThreadEPNS_6mirror6ObjectE",
      "_ZN3art9JavaVMExt12DecodeGlobalEPv",
      "_ZN3art9JavaVMExt12DecodeGlobalEPNS_6ThreadEPv",
      "_ZNK3art6Thread19DecodeGlobalJObjectEP8_jobject",
      "_ZNK3art6Thread13DecodeJObjectEP8_jobject",
      "_ZN3art10ThreadList10SuspendAllEPKcb",
      "_ZN3art10ThreadList10SuspendAllEv",
      "_ZN3art11ClassLinker12VisitClassesEPNS_12ClassVisitorE",
      "_ZN3art11ClassLinker12VisitClassesEPFbPNS_6mirror5ClassEPvES4_",
      "_ZNK3art11ClassLinker17VisitClassLoadersEPNS_18ClassLoaderVisitorE",
      "_ZN3art6mirror6Object5CloneEPNS_6ThreadE",
      "_ZN3art6mirror6Object5CloneEPNS_6ThreadEm",
      "_ZN3art6mirror6Object5CloneEPNS_6ThreadEj",
      "_ZN3art22IndirectReferenceTable3AddEjPNS_6mirror6ObjectE",
      "_ZN3art22IndirectReferenceTable3AddENS_15IRTSegmentStateENS_6ObjPtrINS_6mirror6ObjectEEE",
      "_ZN3art2gc4Heap12VisitObjectsEPFvPNS_6mirror6ObjectEPvES5_",
      "_ZN3art2gc4Heap12GetInstancesERNS_24VariableSizedHandleScopeENS_6HandleINS_6mirror5ClassEEEiRNSt3__16vectorINS4_INS5_6ObjectEEENS8_9allocatorISB_EEEE",
      "_ZN3art2gc4Heap12GetInstancesERNS_24VariableSizedHandleScopeENS_6HandleINS_6mirror5ClassEEEbiRNSt3__16vectorINS4_INS5_6ObjectEEENS8_9allocatorISB_EEEE",
      "_ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEjb",
      "_ZN3art12StackVisitorC2EPNS_6ThreadEPNS_7ContextENS0_13StackWalkKindEmb",
      "_ZN3art12StackVisitor9WalkStackILNS0_16CountTransitionsE0EEEvb",
      "_ZNK3art12StackVisitor9GetMethodEv",
      "_ZNK3art12StackVisitor16DescribeLocationEv",
      "_ZNK3art12StackVisitor24GetCurrentQuickFrameInfoEv",
      "_ZN3art7Context6CreateEv",
      "_ZN3art6Thread18GetLongJumpContextEv",
      "_ZN3art6mirror5Class13GetDescriptorEPNSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEE",
      "_ZN3art6mirror5Class11GetLocationEv",
      "_ZN3art9ArtMethod12PrettyMethodEb",
      "_ZN3art12PrettyMethodEPNS_9ArtMethodEb",
      "_ZN3art3Dbg13ConfigureJdwpERKNS_4JDWP11JdwpOptionsE",
      "_ZN3art31InternalDebuggerControlCallback13StartDebuggerEv",
      "_ZN3art3Dbg15gDebuggerActiveE",
      "_ZN3art15instrumentation15Instrumentation20EnableDeoptimizationEv",
      "_ZN3art15instrumentation15Instrumentation20DeoptimizeEverythingEPKc",
      "_ZN3art15instrumentation15Instrumentation20DeoptimizeEverythingEv",
      "_ZN3art7Runtime19DeoptimizeBootImageEv",
      "_ZN3art15instrumentation15Instrumentation10DeoptimizeEPNS_9ArtMethodE",
      "_ZN3art3Dbg9StartJdwpEv",
      "_ZN3art3Dbg8GoActiveEv",
      "_ZN3art3Dbg21RequestDeoptimizationERKNS_21DeoptimizationRequestE",
      "_ZN3art3Dbg20ManageDeoptimizationEv",
      "_ZN3art3Dbg9gRegistryE",
      "_ZN3art3jni12JniIdManager14DecodeMethodIdEP10_jmethodID",
      "_ZN3art3jni12JniIdManager13DecodeFieldIdEP9_jfieldID",
      "_ZN3art11interpreter18GetNterpEntryPointEv",
      "_ZN3art7Monitor17TranslateLocationEPNS_9ArtMethodEjPPKcPi"
    ])
  } : {
    functions: {
      _Z20dvmDecodeIndirectRefP6ThreadP8_jobject: ["dvmDecodeIndirectRef", "pointer", ["pointer", "pointer"]],
      _Z15dvmUseJNIBridgeP6MethodPv: ["dvmUseJNIBridge", "void", ["pointer", "pointer"]],
      _Z20dvmHeapSourceGetBasev: ["dvmHeapSourceGetBase", "pointer", []],
      _Z21dvmHeapSourceGetLimitv: ["dvmHeapSourceGetLimit", "pointer", []],
      _Z16dvmIsValidObjectPK6Object: ["dvmIsValidObject", "uint8", ["pointer"]],
      JNI_GetCreatedJavaVMs: ["JNI_GetCreatedJavaVMs", "int", ["pointer", "int", "pointer"]]
    },
    variables: {
      gDvmJni: function(address) {
        this.gDvmJni = address;
      },
      gDvm: function(address) {
        this.gDvm = address;
      }
    }
  };
  const {
    functions = {},
    variables = {},
    optionals = /* @__PURE__ */ new Set()
  } = pending;
  const missing = [];
  for (const [name, signature2] of Object.entries(functions)) {
    const address = temporaryApi.find(name);
    if (address !== null) {
      if (typeof signature2 === "function") {
        signature2.call(temporaryApi, address);
      } else {
        temporaryApi[signature2[0]] = new NativeFunction(address, signature2[1], signature2[2], nativeFunctionOptions3);
      }
    } else {
      if (!optionals.has(name)) {
        missing.push(name);
      }
    }
  }
  for (const [name, handler] of Object.entries(variables)) {
    const address = temporaryApi.find(name);
    if (address !== null) {
      handler.call(temporaryApi, address);
    } else {
      if (!optionals.has(name)) {
        missing.push(name);
      }
    }
  }
  if (missing.length > 0) {
    throw new Error("Java API only partially available; please file a bug. Missing: " + missing.join(", "));
  }
  const vms = Memory.alloc(pointerSize7);
  const vmCount = Memory.alloc(jsizeSize);
  checkJniResult("JNI_GetCreatedJavaVMs", temporaryApi.JNI_GetCreatedJavaVMs(vms, 1, vmCount));
  if (vmCount.readInt() === 0) {
    return null;
  }
  temporaryApi.vm = vms.readPointer();
  if (isArt) {
    const apiLevel = getAndroidApiLevel();
    let kAccCompileDontBother;
    if (apiLevel >= 27) {
      kAccCompileDontBother = 33554432;
    } else if (apiLevel >= 24) {
      kAccCompileDontBother = 16777216;
    } else {
      kAccCompileDontBother = 0;
    }
    temporaryApi.kAccCompileDontBother = kAccCompileDontBother;
    const artRuntime = temporaryApi.vm.add(pointerSize7).readPointer();
    temporaryApi.artRuntime = artRuntime;
    const runtimeSpec = getArtRuntimeSpec(temporaryApi);
    const runtimeOffset = runtimeSpec.offset;
    const instrumentationOffset = runtimeOffset.instrumentation;
    temporaryApi.artInstrumentation = instrumentationOffset !== null ? artRuntime.add(instrumentationOffset) : null;
    const instrumentationIsPointer = getArtApexVersion() >= 36e7;
    if (instrumentationIsPointer && temporaryApi.artInstrumentation != null) {
      temporaryApi.artInstrumentation = temporaryApi.artInstrumentation.readPointer();
    }
    temporaryApi.artHeap = artRuntime.add(runtimeOffset.heap).readPointer();
    temporaryApi.artThreadList = artRuntime.add(runtimeOffset.threadList).readPointer();
    const classLinker = artRuntime.add(runtimeOffset.classLinker).readPointer();
    const classLinkerOffsets = getArtClassLinkerSpec(artRuntime, runtimeSpec).offset;
    const quickResolutionTrampoline = classLinker.add(classLinkerOffsets.quickResolutionTrampoline).readPointer();
    const quickImtConflictTrampoline = classLinker.add(classLinkerOffsets.quickImtConflictTrampoline).readPointer();
    const quickGenericJniTrampoline = classLinker.add(classLinkerOffsets.quickGenericJniTrampoline).readPointer();
    const quickToInterpreterBridgeTrampoline = classLinker.add(classLinkerOffsets.quickToInterpreterBridgeTrampoline).readPointer();
    temporaryApi.artClassLinker = {
      address: classLinker,
      quickResolutionTrampoline,
      quickImtConflictTrampoline,
      quickGenericJniTrampoline,
      quickToInterpreterBridgeTrampoline
    };
    const vm3 = new VM(temporaryApi);
    temporaryApi.artQuickGenericJniTrampoline = getArtQuickEntrypointFromTrampoline(quickGenericJniTrampoline, vm3);
    temporaryApi.artQuickToInterpreterBridge = getArtQuickEntrypointFromTrampoline(quickToInterpreterBridgeTrampoline, vm3);
    temporaryApi.artQuickResolutionTrampoline = getArtQuickEntrypointFromTrampoline(quickResolutionTrampoline, vm3);
    if (temporaryApi["art::JavaVMExt::AddGlobalRef"] === void 0) {
      temporaryApi["art::JavaVMExt::AddGlobalRef"] = makeAddGlobalRefFallbackForAndroid5(temporaryApi);
    }
    if (temporaryApi["art::JavaVMExt::DecodeGlobal"] === void 0) {
      temporaryApi["art::JavaVMExt::DecodeGlobal"] = makeDecodeGlobalFallback(temporaryApi);
    }
    if (temporaryApi["art::ArtMethod::PrettyMethod"] === void 0) {
      temporaryApi["art::ArtMethod::PrettyMethod"] = temporaryApi["art::ArtMethod::PrettyMethodNullSafe"];
    }
    if (temporaryApi["art::interpreter::GetNterpEntryPoint"] !== void 0) {
      temporaryApi.artNterpEntryPoint = temporaryApi["art::interpreter::GetNterpEntryPoint"]();
    } else {
      temporaryApi.artNterpEntryPoint = temporaryApi.find("ExecuteNterpImpl");
    }
    artController = makeArtController(temporaryApi, vm3);
    fixupArtQuickDeliverExceptionBug(temporaryApi);
    let cachedJvmti = null;
    Object.defineProperty(temporaryApi, "jvmti", {
      get() {
        if (cachedJvmti === null) {
          cachedJvmti = [tryGetEnvJvmti(vm3, this.artRuntime)];
        }
        return cachedJvmti[0];
      }
    });
  }
  const cxxImports = vmModule.enumerateImports().filter((imp) => imp.name.indexOf("_Z") === 0).reduce((result, imp) => {
    result[imp.name] = imp.address;
    return result;
  }, {});
  temporaryApi.$new = new NativeFunction(cxxImports._Znwm || cxxImports._Znwj, "pointer", ["ulong"], nativeFunctionOptions3);
  temporaryApi.$delete = new NativeFunction(cxxImports._ZdlPv, "void", ["pointer"], nativeFunctionOptions3);
  MethodMangler = isArt ? ArtMethodMangler : DalvikMethodMangler;
  return temporaryApi;
}
function tryGetEnvJvmti(vm3, runtime3) {
  let env = null;
  vm3.perform(() => {
    const ensurePluginLoadedAddr = getApi2().find("_ZN3art7Runtime18EnsurePluginLoadedEPKcPNSt3__112basic_stringIcNS3_11char_traitsIcEENS3_9allocatorIcEEEE");
    if (ensurePluginLoadedAddr === null) {
      return;
    }
    const ensurePluginLoaded = new NativeFunction(
      ensurePluginLoadedAddr,
      "bool",
      ["pointer", "pointer", "pointer"]
    );
    const errorPtr = Memory.alloc(pointerSize7);
    const success = ensurePluginLoaded(runtime3, Memory.allocUtf8String("libopenjdkjvmti.so"), errorPtr);
    if (!success) {
      return;
    }
    const kArtTiVersion = jvmtiVersion.v1_2 | 1073741824;
    const handle2 = vm3.tryGetEnvHandle(kArtTiVersion);
    if (handle2 === null) {
      return;
    }
    env = new EnvJvmti(handle2, vm3);
    const capaBuf = Memory.alloc(8);
    capaBuf.writeU64(jvmtiCapabilities.canTagObjects);
    const result = env.addCapabilities(capaBuf);
    if (result !== JNI_OK) {
      env = null;
    }
  });
  return env;
}
function ensureClassInitialized(env, classRef) {
  const api3 = getApi2();
  if (api3.flavor !== "art") {
    return;
  }
  env.getFieldId(classRef, "x", "Z");
  env.exceptionClear();
}
function getArtVMSpec(api3) {
  return {
    offset: pointerSize7 === 4 ? {
      globalsLock: 32,
      globals: 72
    } : {
      globalsLock: 64,
      globals: 112
    }
  };
}
function _getArtRuntimeSpec(api3) {
  const vm3 = api3.vm;
  const runtime3 = api3.artRuntime;
  const startOffset = pointerSize7 === 4 ? 200 : 384;
  const endOffset = startOffset + 100 * pointerSize7;
  const apiLevel = getAndroidApiLevel();
  const codename = getAndroidCodename();
  const { isApiLevel34OrApexEquivalent } = api3;
  let spec = null;
  for (let offset = startOffset; offset !== endOffset; offset += pointerSize7) {
    const value = runtime3.add(offset).readPointer();
    if (value.equals(vm3)) {
      let classLinkerOffsets;
      let jniIdManagerOffset = null;
      if (apiLevel >= 33 || codename === "Tiramisu" || isApiLevel34OrApexEquivalent) {
        classLinkerOffsets = [offset - 4 * pointerSize7];
        jniIdManagerOffset = offset - pointerSize7;
      } else if (apiLevel >= 30 || codename === "R") {
        classLinkerOffsets = [offset - 3 * pointerSize7, offset - 4 * pointerSize7];
        jniIdManagerOffset = offset - pointerSize7;
      } else if (apiLevel >= 29) {
        classLinkerOffsets = [offset - 2 * pointerSize7];
      } else if (apiLevel >= 27) {
        classLinkerOffsets = [offset - STD_STRING_SIZE - 3 * pointerSize7];
      } else {
        classLinkerOffsets = [offset - STD_STRING_SIZE - 2 * pointerSize7];
      }
      for (const classLinkerOffset of classLinkerOffsets) {
        const internTableOffset = classLinkerOffset - pointerSize7;
        const threadListOffset = internTableOffset - pointerSize7;
        let heapOffset;
        if (isApiLevel34OrApexEquivalent) {
          heapOffset = threadListOffset - 9 * pointerSize7;
        } else if (apiLevel >= 24) {
          heapOffset = threadListOffset - 8 * pointerSize7;
        } else if (apiLevel >= 23) {
          heapOffset = threadListOffset - 7 * pointerSize7;
        } else {
          heapOffset = threadListOffset - 4 * pointerSize7;
        }
        const candidate = {
          offset: {
            heap: heapOffset,
            threadList: threadListOffset,
            internTable: internTableOffset,
            classLinker: classLinkerOffset,
            jniIdManager: jniIdManagerOffset
          }
        };
        if (tryGetArtClassLinkerSpec(runtime3, candidate) !== null) {
          spec = candidate;
          break;
        }
      }
      break;
    }
  }
  if (spec === null) {
    throw new Error("Unable to determine Runtime field offsets");
  }
  const instrumentationIsPointer = getArtApexVersion() >= 36e7;
  spec.offset.instrumentation = instrumentationIsPointer ? tryDetectInstrumentationPointer(api3) : tryDetectInstrumentationOffset(api3);
  spec.offset.jniIdsIndirection = tryDetectJniIdsIndirectionOffset(api3);
  return spec;
}
var instrumentationOffsetParsers = {
  ia32: parsex86InstrumentationOffset,
  x64: parsex86InstrumentationOffset,
  arm: parseArmInstrumentationOffset,
  arm64: parseArm64InstrumentationOffset
};
function tryDetectInstrumentationOffset(api3) {
  const impl = api3["art::Runtime::DeoptimizeBootImage"];
  if (impl === void 0) {
    return null;
  }
  return parseInstructionsAt(impl, instrumentationOffsetParsers[Process.arch], { limit: 30 });
}
function parsex86InstrumentationOffset(insn) {
  if (insn.mnemonic !== "lea") {
    return null;
  }
  const offset = insn.operands[1].value.disp;
  if (offset < 256 || offset > 1024) {
    return null;
  }
  return offset;
}
function parseArmInstrumentationOffset(insn) {
  if (insn.mnemonic !== "add.w") {
    return null;
  }
  const ops = insn.operands;
  if (ops.length !== 3) {
    return null;
  }
  const op2 = ops[2];
  if (op2.type !== "imm") {
    return null;
  }
  return op2.value;
}
function parseArm64InstrumentationOffset(insn) {
  if (insn.mnemonic !== "add") {
    return null;
  }
  const ops = insn.operands;
  if (ops.length !== 3) {
    return null;
  }
  if (ops[0].value === "sp" || ops[1].value === "sp") {
    return null;
  }
  const op2 = ops[2];
  if (op2.type !== "imm") {
    return null;
  }
  const offset = op2.value.valueOf();
  if (offset < 256 || offset > 1024) {
    return null;
  }
  return offset;
}
var instrumentationPointerParser = {
  ia32: parsex86InstrumentationPointer,
  x64: parsex86InstrumentationPointer,
  arm: parseArmInstrumentationPointer,
  arm64: parseArm64InstrumentationPointer
};
function tryDetectInstrumentationPointer(api3) {
  const impl = api3["art::Runtime::DeoptimizeBootImage"];
  if (impl === void 0) {
    return null;
  }
  return parseInstructionsAt(impl, instrumentationPointerParser[Process.arch], { limit: 30 });
}
function parsex86InstrumentationPointer(insn) {
  if (insn.mnemonic !== "mov") {
    return null;
  }
  const ops = insn.operands;
  const dst = ops[0];
  if (dst.value !== "rax") {
    return null;
  }
  const src = ops[1];
  if (src.type !== "mem") {
    return null;
  }
  const mem = src.value;
  if (mem.base !== "rdi") {
    return null;
  }
  const offset = mem.disp;
  if (offset < 256 || offset > 1024) {
    return null;
  }
  return offset;
}
function parseArmInstrumentationPointer(insn) {
  return null;
}
function parseArm64InstrumentationPointer(insn) {
  if (insn.mnemonic !== "ldr") {
    return null;
  }
  const ops = insn.operands;
  if (ops[0].value === "x0") {
    return null;
  }
  const mem = ops[1].value;
  if (mem.base !== "x0") {
    return null;
  }
  const offset = mem.disp;
  if (offset < 256 || offset > 1024) {
    return null;
  }
  return offset;
}
var jniIdsIndirectionOffsetParsers = {
  ia32: parsex86JniIdsIndirectionOffset,
  x64: parsex86JniIdsIndirectionOffset,
  arm: parseArmJniIdsIndirectionOffset,
  arm64: parseArm64JniIdsIndirectionOffset
};
function tryDetectJniIdsIndirectionOffset(api3) {
  const impl = api3.find("_ZN3art7Runtime12SetJniIdTypeENS_9JniIdTypeE");
  if (impl === null) {
    return null;
  }
  const offset = parseInstructionsAt(impl, jniIdsIndirectionOffsetParsers[Process.arch], { limit: 20 });
  if (offset === null) {
    throw new Error("Unable to determine Runtime.jni_ids_indirection_ offset");
  }
  return offset;
}
function parsex86JniIdsIndirectionOffset(insn) {
  if (insn.mnemonic === "cmp") {
    return insn.operands[0].value.disp;
  }
  return null;
}
function parseArmJniIdsIndirectionOffset(insn) {
  if (insn.mnemonic === "ldr.w") {
    return insn.operands[1].value.disp;
  }
  return null;
}
function parseArm64JniIdsIndirectionOffset(insn, prevInsn) {
  if (prevInsn === null) {
    return null;
  }
  const { mnemonic } = insn;
  const { mnemonic: prevMnemonic } = prevInsn;
  if (mnemonic === "cmp" && prevMnemonic === "ldr" || mnemonic === "bl" && prevMnemonic === "str") {
    return prevInsn.operands[1].value.disp;
  }
  return null;
}
function _getArtInstrumentationSpec() {
  const deoptimizationEnabledOffsets = {
    "4-21": 136,
    "4-22": 136,
    "4-23": 172,
    "4-24": 196,
    "4-25": 196,
    "4-26": 196,
    "4-27": 196,
    "4-28": 212,
    "4-29": 172,
    "4-30": 180,
    "4-31": 180,
    "8-21": 224,
    "8-22": 224,
    "8-23": 296,
    "8-24": 344,
    "8-25": 344,
    "8-26": 352,
    "8-27": 352,
    "8-28": 392,
    "8-29": 328,
    "8-30": 336,
    "8-31": 336
  };
  const deoptEnabledOffset = deoptimizationEnabledOffsets[`${pointerSize7}-${getAndroidApiLevel()}`];
  if (deoptEnabledOffset === void 0) {
    throw new Error("Unable to determine Instrumentation field offsets");
  }
  return {
    offset: {
      forcedInterpretOnly: 4,
      deoptimizationEnabled: deoptEnabledOffset
    }
  };
}
function getArtClassLinkerSpec(runtime3, runtimeSpec) {
  const spec = tryGetArtClassLinkerSpec(runtime3, runtimeSpec);
  if (spec === null) {
    throw new Error("Unable to determine ClassLinker field offsets");
  }
  return spec;
}
function tryGetArtClassLinkerSpec(runtime3, runtimeSpec) {
  if (cachedArtClassLinkerSpec !== null) {
    return cachedArtClassLinkerSpec;
  }
  const { classLinker: classLinkerOffset, internTable: internTableOffset } = runtimeSpec.offset;
  const classLinker = runtime3.add(classLinkerOffset).readPointer();
  const internTable = runtime3.add(internTableOffset).readPointer();
  const startOffset = pointerSize7 === 4 ? 100 : 200;
  const endOffset = startOffset + 100 * pointerSize7;
  const apiLevel = getAndroidApiLevel();
  let spec = null;
  for (let offset = startOffset; offset !== endOffset; offset += pointerSize7) {
    const value = classLinker.add(offset).readPointer();
    if (value.equals(internTable)) {
      let delta;
      if (apiLevel >= 30 || getAndroidCodename() === "R") {
        delta = 6;
      } else if (apiLevel >= 29) {
        delta = 4;
      } else if (apiLevel >= 23) {
        delta = 3;
      } else {
        delta = 5;
      }
      const quickGenericJniTrampolineOffset = offset + delta * pointerSize7;
      let quickResolutionTrampolineOffset;
      if (apiLevel >= 23) {
        quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - 2 * pointerSize7;
      } else {
        quickResolutionTrampolineOffset = quickGenericJniTrampolineOffset - 3 * pointerSize7;
      }
      spec = {
        offset: {
          quickResolutionTrampoline: quickResolutionTrampolineOffset,
          quickImtConflictTrampoline: quickGenericJniTrampolineOffset - pointerSize7,
          quickGenericJniTrampoline: quickGenericJniTrampolineOffset,
          quickToInterpreterBridgeTrampoline: quickGenericJniTrampolineOffset + pointerSize7
        }
      };
      break;
    }
  }
  if (spec !== null) {
    cachedArtClassLinkerSpec = spec;
  }
  return spec;
}
function getArtClassSpec(vm3) {
  const MAX_OFFSET = 256;
  let spec = null;
  vm3.perform((env) => {
    const fieldSpec = getArtFieldSpec(vm3);
    const methodSpec = getArtMethodSpec(vm3);
    const fInfo = {
      artArrayLengthSize: 4,
      artArrayEntrySize: fieldSpec.size,
      // java/lang/Thread has 36 fields on Android 16.
      artArrayMax: 50
    };
    const mInfo = {
      artArrayLengthSize: pointerSize7,
      artArrayEntrySize: methodSpec.size,
      // java/lang/Thread has 79 methods on Android 16.
      artArrayMax: 100
    };
    const readArtArray = (objectBase, fieldOffset, lengthSize) => {
      const header = objectBase.add(fieldOffset).readPointer();
      if (header.isNull()) {
        return null;
      }
      const length = lengthSize === 4 ? header.readU32() : header.readU64().valueOf();
      if (length <= 0) {
        return null;
      }
      return {
        length,
        data: header.add(lengthSize)
      };
    };
    const hasEntry = (objectBase, offset, needle, info) => {
      try {
        const artArray = readArtArray(objectBase, offset, info.artArrayLengthSize);
        if (artArray === null) {
          return false;
        }
        const artArrayEnd = Math.min(artArray.length, info.artArrayMax);
        for (let i = 0; i !== artArrayEnd; i++) {
          const fieldPtr = artArray.data.add(i * info.artArrayEntrySize);
          if (fieldPtr.equals(needle)) {
            return true;
          }
        }
      } catch {
      }
      return false;
    };
    const clazz = env.findClass("java/lang/Thread");
    const clazzRef = env.newGlobalRef(clazz);
    try {
      let object;
      withRunnableArtThread(vm3, env, (thread) => {
        object = getApi2()["art::JavaVMExt::DecodeGlobal"](vm3, thread, clazzRef);
      });
      const fieldInstance = unwrapFieldId(env.getFieldId(clazzRef, "name", "Ljava/lang/String;"));
      const fieldStatic = unwrapFieldId(env.getStaticFieldId(clazzRef, "MAX_PRIORITY", "I"));
      let offsetStatic = -1;
      let offsetInstance = -1;
      for (let offset = 0; offset !== MAX_OFFSET; offset += 4) {
        if (offsetStatic === -1 && hasEntry(object, offset, fieldStatic, fInfo)) {
          offsetStatic = offset;
        }
        if (offsetInstance === -1 && hasEntry(object, offset, fieldInstance, fInfo)) {
          offsetInstance = offset;
        }
      }
      if (offsetInstance === -1 || offsetStatic === -1) {
        throw new Error("Unable to find fields in java/lang/Thread; please file a bug");
      }
      const sfieldOffset = offsetInstance !== offsetStatic ? offsetStatic : 0;
      const ifieldOffset = offsetInstance;
      let offsetMethods = -1;
      const methodInstance = unwrapMethodId(env.getMethodId(clazzRef, "getName", "()Ljava/lang/String;"));
      for (let offset = 0; offset !== MAX_OFFSET; offset += 4) {
        if (offsetMethods === -1 && hasEntry(object, offset, methodInstance, mInfo)) {
          offsetMethods = offset;
        }
      }
      if (offsetMethods === -1) {
        throw new Error("Unable to find methods in java/lang/Thread; please file a bug");
      }
      let offsetCopiedMethods = -1;
      const methodsArray = readArtArray(object, offsetMethods, mInfo.artArrayLengthSize);
      const methodsArraySize = methodsArray.length;
      for (let offset = offsetMethods; offset !== MAX_OFFSET; offset += 4) {
        if (object.add(offset).readU16() === methodsArraySize) {
          offsetCopiedMethods = offset;
          break;
        }
      }
      if (offsetCopiedMethods === -1) {
        throw new Error("Unable to find copied methods in java/lang/Thread; please file a bug");
      }
      spec = {
        offset: {
          ifields: ifieldOffset,
          methods: offsetMethods,
          sfields: sfieldOffset,
          copiedMethodsOffset: offsetCopiedMethods
        }
      };
    } finally {
      env.deleteLocalRef(clazz);
      env.deleteGlobalRef(clazzRef);
    }
  });
  return spec;
}
function _getArtMethodSpec(vm3) {
  const api3 = getApi2();
  let spec;
  vm3.perform((env) => {
    const process = env.findClass("android/os/Process");
    const getElapsedCpuTime = unwrapMethodId(env.getStaticMethodId(process, "getElapsedCpuTime", "()J"));
    env.deleteLocalRef(process);
    const runtimeModule = Process.getModuleByName("libandroid_runtime.so");
    const runtimeStart = runtimeModule.base;
    const runtimeEnd = runtimeStart.add(runtimeModule.size);
    const apiLevel = getAndroidApiLevel();
    const entrypointFieldSize = apiLevel <= 21 ? 8 : pointerSize7;
    const expectedAccessFlags = kAccPublic | kAccStatic | kAccFinal | kAccNative;
    const relevantAccessFlagsMask = ~(kAccFastInterpreterToInterpreterInvoke | kAccPublicApi | kAccNterpInvokeFastPathFlag) >>> 0;
    let jniCodeOffset = null;
    let accessFlagsOffset = null;
    let remaining = 2;
    for (let offset = 0; offset !== 64 && remaining !== 0; offset += 4) {
      const field = getElapsedCpuTime.add(offset);
      if (jniCodeOffset === null) {
        const address = field.readPointer();
        if (address.compare(runtimeStart) >= 0 && address.compare(runtimeEnd) < 0) {
          jniCodeOffset = offset;
          remaining--;
        }
      }
      if (accessFlagsOffset === null) {
        const flags = field.readU32();
        if ((flags & relevantAccessFlagsMask) === expectedAccessFlags) {
          accessFlagsOffset = offset;
          remaining--;
        }
      }
    }
    if (remaining !== 0) {
      throw new Error("Unable to determine ArtMethod field offsets");
    }
    const quickCodeOffset = jniCodeOffset + entrypointFieldSize;
    const size = apiLevel <= 21 ? quickCodeOffset + 32 : quickCodeOffset + pointerSize7;
    spec = {
      size,
      offset: {
        jniCode: jniCodeOffset,
        quickCode: quickCodeOffset,
        accessFlags: accessFlagsOffset
      }
    };
    if ("artInterpreterToCompiledCodeBridge" in api3) {
      spec.offset.interpreterCode = jniCodeOffset - entrypointFieldSize;
    }
  });
  return spec;
}
function getArtFieldSpec(vm3) {
  const apiLevel = getAndroidApiLevel();
  if (apiLevel >= 23) {
    return {
      size: 16,
      offset: {
        accessFlags: 4
      }
    };
  }
  if (apiLevel >= 21) {
    return {
      size: 24,
      offset: {
        accessFlags: 12
      }
    };
  }
  return null;
}
function _getArtThreadSpec(vm3) {
  const apiLevel = getAndroidApiLevel();
  let spec;
  vm3.perform((env) => {
    const threadHandle = getArtThreadFromEnv(env);
    const envHandle = env.handle;
    let isExceptionReportedOffset = null;
    let exceptionOffset = null;
    let throwLocationOffset = null;
    let topHandleScopeOffset = null;
    let managedStackOffset = null;
    let selfOffset = null;
    for (let offset = 144; offset !== 256; offset += pointerSize7) {
      const field = threadHandle.add(offset);
      const value = field.readPointer();
      if (value.equals(envHandle)) {
        exceptionOffset = offset - 6 * pointerSize7;
        managedStackOffset = offset - 4 * pointerSize7;
        selfOffset = offset + 2 * pointerSize7;
        if (apiLevel <= 22) {
          exceptionOffset -= pointerSize7;
          isExceptionReportedOffset = exceptionOffset - pointerSize7 - 9 * 8 - 3 * 4;
          throwLocationOffset = offset + 6 * pointerSize7;
          managedStackOffset -= pointerSize7;
          selfOffset -= pointerSize7;
        }
        topHandleScopeOffset = offset + 9 * pointerSize7;
        if (apiLevel <= 22) {
          topHandleScopeOffset += 2 * pointerSize7 + 4;
          if (pointerSize7 === 8) {
            topHandleScopeOffset += 4;
          }
        }
        if (apiLevel >= 23) {
          topHandleScopeOffset += pointerSize7;
        }
        break;
      }
    }
    if (topHandleScopeOffset === null) {
      throw new Error("Unable to determine ArtThread field offsets");
    }
    spec = {
      offset: {
        isExceptionReportedToInstrumentation: isExceptionReportedOffset,
        exception: exceptionOffset,
        throwLocation: throwLocationOffset,
        topHandleScope: topHandleScopeOffset,
        managedStack: managedStackOffset,
        self: selfOffset
      }
    };
  });
  return spec;
}
function _getArtManagedStackSpec() {
  const apiLevel = getAndroidApiLevel();
  if (apiLevel >= 23) {
    return {
      offset: {
        topQuickFrame: 0,
        link: pointerSize7
      }
    };
  } else {
    return {
      offset: {
        topQuickFrame: 2 * pointerSize7,
        link: 0
      }
    };
  }
}
var artQuickTrampolineParsers = {
  ia32: parseArtQuickTrampolineX86,
  x64: parseArtQuickTrampolineX86,
  arm: parseArtQuickTrampolineArm,
  arm64: parseArtQuickTrampolineArm64
};
function getArtQuickEntrypointFromTrampoline(trampoline, vm3) {
  let address;
  vm3.perform((env) => {
    const thread = getArtThreadFromEnv(env);
    const tryParse = artQuickTrampolineParsers[Process.arch];
    const insn = Instruction.parse(trampoline);
    const offset = tryParse(insn);
    if (offset !== null) {
      address = thread.add(offset).readPointer();
    } else {
      address = trampoline;
    }
  });
  return address;
}
function parseArtQuickTrampolineX86(insn) {
  if (insn.mnemonic === "jmp") {
    return insn.operands[0].value.disp;
  }
  return null;
}
function parseArtQuickTrampolineArm(insn) {
  if (insn.mnemonic === "ldr.w") {
    return insn.operands[1].value.disp;
  }
  return null;
}
function parseArtQuickTrampolineArm64(insn) {
  if (insn.mnemonic === "ldr") {
    return insn.operands[1].value.disp;
  }
  return null;
}
function getArtThreadFromEnv(env) {
  return env.handle.add(pointerSize7).readPointer();
}
function _getAndroidVersion() {
  return getAndroidSystemProperty("ro.build.version.release");
}
function _getAndroidCodename() {
  return getAndroidSystemProperty("ro.build.version.codename");
}
function _getAndroidApiLevel() {
  return parseInt(getAndroidSystemProperty("ro.build.version.sdk"), 10);
}
function _getArtApexVersion() {
  try {
    const mountInfo = File.readAllText("/proc/self/mountinfo");
    let artSource = null;
    const sourceVersions = /* @__PURE__ */ new Map();
    for (const line of mountInfo.trimEnd().split("\n")) {
      const elements = line.split(" ");
      const mountRoot = elements[4];
      if (!mountRoot.startsWith("/apex/com.android.art")) {
        continue;
      }
      const mountSource = elements[10];
      if (mountRoot.includes("@")) {
        sourceVersions.set(mountSource, mountRoot.split("@")[1]);
      } else {
        artSource = mountSource;
      }
    }
    const strVersion = sourceVersions.get(artSource);
    return strVersion !== void 0 ? parseInt(strVersion) : computeArtApexVersionFromApiLevel();
  } catch {
    return computeArtApexVersionFromApiLevel();
  }
}
function computeArtApexVersionFromApiLevel() {
  return getAndroidApiLevel() * 1e7;
}
var systemPropertyGet = null;
var PROP_VALUE_MAX = 92;
function getAndroidSystemProperty(name) {
  if (systemPropertyGet === null) {
    systemPropertyGet = new NativeFunction(
      Process.getModuleByName("libc.so").getExportByName("__system_property_get"),
      "int",
      ["pointer", "pointer"],
      nativeFunctionOptions3
    );
  }
  const buf = Memory.alloc(PROP_VALUE_MAX);
  systemPropertyGet(Memory.allocUtf8String(name), buf);
  return buf.readUtf8String();
}
function withRunnableArtThread(vm3, env, fn) {
  const perform = getArtThreadStateTransitionImpl(vm3, env);
  const id = getArtThreadFromEnv(env).toString();
  artThreadStateTransitions[id] = fn;
  perform(env.handle);
  if (artThreadStateTransitions[id] !== void 0) {
    delete artThreadStateTransitions[id];
    throw new Error("Unable to perform state transition; please file a bug");
  }
}
function _getArtThreadStateTransitionImpl(vm3, env) {
  const callback = new NativeCallback(onThreadStateTransitionComplete, "void", ["pointer"]);
  return makeArtThreadStateTransitionImpl(vm3, env, callback);
}
function onThreadStateTransitionComplete(thread) {
  const id = thread.toString();
  const fn = artThreadStateTransitions[id];
  delete artThreadStateTransitions[id];
  fn(thread);
}
function withAllArtThreadsSuspended(fn) {
  const api3 = getApi2();
  const threadList = api3.artThreadList;
  const longSuspend = false;
  api3["art::ThreadList::SuspendAll"](threadList, Memory.allocUtf8String("frida"), longSuspend ? 1 : 0);
  try {
    fn();
  } finally {
    api3["art::ThreadList::ResumeAll"](threadList);
  }
}
var ArtClassVisitor = class {
  constructor(visit) {
    const visitor = Memory.alloc(4 * pointerSize7);
    const vtable2 = visitor.add(pointerSize7);
    visitor.writePointer(vtable2);
    const onVisit = new NativeCallback((self, klass) => {
      return visit(klass) === true ? 1 : 0;
    }, "bool", ["pointer", "pointer"]);
    vtable2.add(2 * pointerSize7).writePointer(onVisit);
    this.handle = visitor;
    this._onVisit = onVisit;
  }
};
function makeArtClassVisitor(visit) {
  const api3 = getApi2();
  if (api3["art::ClassLinker::VisitClasses"] instanceof NativeFunction) {
    return new ArtClassVisitor(visit);
  }
  return new NativeCallback((klass) => {
    return visit(klass) === true ? 1 : 0;
  }, "bool", ["pointer", "pointer"]);
}
var ArtClassLoaderVisitor = class {
  constructor(visit) {
    const visitor = Memory.alloc(4 * pointerSize7);
    const vtable2 = visitor.add(pointerSize7);
    visitor.writePointer(vtable2);
    const onVisit = new NativeCallback((self, klass) => {
      visit(klass);
    }, "void", ["pointer", "pointer"]);
    vtable2.add(2 * pointerSize7).writePointer(onVisit);
    this.handle = visitor;
    this._onVisit = onVisit;
  }
};
function makeArtClassLoaderVisitor(visit) {
  return new ArtClassLoaderVisitor(visit);
}
var WalkKind = {
  "include-inlined-frames": 0,
  "skip-inlined-frames": 1
};
var ArtStackVisitor = class {
  constructor(thread, context, walkKind, numFrames = 0, checkSuspended = true) {
    const api3 = getApi2();
    const baseSize = 512;
    const vtableSize = 3 * pointerSize7;
    const visitor = Memory.alloc(baseSize + vtableSize);
    api3["art::StackVisitor::StackVisitor"](
      visitor,
      thread,
      context,
      WalkKind[walkKind],
      numFrames,
      checkSuspended ? 1 : 0
    );
    const vtable2 = visitor.add(baseSize);
    visitor.writePointer(vtable2);
    const onVisitFrame = new NativeCallback(this._visitFrame.bind(this), "bool", ["pointer"]);
    vtable2.add(2 * pointerSize7).writePointer(onVisitFrame);
    this.handle = visitor;
    this._onVisitFrame = onVisitFrame;
    const curShadowFrame = visitor.add(pointerSize7 === 4 ? 12 : 24);
    this._curShadowFrame = curShadowFrame;
    this._curQuickFrame = curShadowFrame.add(pointerSize7);
    this._curQuickFramePc = curShadowFrame.add(2 * pointerSize7);
    this._curOatQuickMethodHeader = curShadowFrame.add(3 * pointerSize7);
    this._getMethodImpl = api3["art::StackVisitor::GetMethod"];
    this._descLocImpl = api3["art::StackVisitor::DescribeLocation"];
    this._getCQFIImpl = api3["art::StackVisitor::GetCurrentQuickFrameInfo"];
  }
  walkStack(includeTransitions = false) {
    getApi2()["art::StackVisitor::WalkStack"](this.handle, includeTransitions ? 1 : 0);
  }
  _visitFrame() {
    return this.visitFrame() ? 1 : 0;
  }
  visitFrame() {
    throw new Error("Subclass must implement visitFrame");
  }
  getMethod() {
    const methodHandle = this._getMethodImpl(this.handle);
    if (methodHandle.isNull()) {
      return null;
    }
    return new ArtMethod(methodHandle);
  }
  getCurrentQuickFramePc() {
    return this._curQuickFramePc.readPointer();
  }
  getCurrentQuickFrame() {
    return this._curQuickFrame.readPointer();
  }
  getCurrentShadowFrame() {
    return this._curShadowFrame.readPointer();
  }
  describeLocation() {
    const result = new StdString();
    this._descLocImpl(result, this.handle);
    return result.disposeToString();
  }
  getCurrentOatQuickMethodHeader() {
    return this._curOatQuickMethodHeader.readPointer();
  }
  getCurrentQuickFrameInfo() {
    return this._getCQFIImpl(this.handle);
  }
};
var ArtMethod = class {
  constructor(handle2) {
    this.handle = handle2;
  }
  prettyMethod(withSignature = true) {
    const result = new StdString();
    getApi2()["art::ArtMethod::PrettyMethod"](result, this.handle, withSignature ? 1 : 0);
    return result.disposeToString();
  }
  toString() {
    return `ArtMethod(handle=${this.handle})`;
  }
};
function makeArtQuickFrameInfoGetter(impl) {
  return function(self) {
    const result = Memory.alloc(12);
    getArtQuickFrameInfoGetterThunk(impl)(result, self);
    return {
      frameSizeInBytes: result.readU32(),
      coreSpillMask: result.add(4).readU32(),
      fpSpillMask: result.add(8).readU32()
    };
  };
}
function _getArtQuickFrameInfoGetterThunk(impl) {
  let thunk = NULL;
  switch (Process.arch) {
    case "ia32":
      thunk = makeThunk(32, (writer) => {
        writer.putMovRegRegOffsetPtr("ecx", "esp", 4);
        writer.putMovRegRegOffsetPtr("edx", "esp", 8);
        writer.putCallAddressWithArguments(impl, ["ecx", "edx"]);
        writer.putMovRegReg("esp", "ebp");
        writer.putPopReg("ebp");
        writer.putRet();
      });
      break;
    case "x64":
      thunk = makeThunk(32, (writer) => {
        writer.putPushReg("rdi");
        writer.putCallAddressWithArguments(impl, ["rsi"]);
        writer.putPopReg("rdi");
        writer.putMovRegPtrReg("rdi", "rax");
        writer.putMovRegOffsetPtrReg("rdi", 8, "edx");
        writer.putRet();
      });
      break;
    case "arm":
      thunk = makeThunk(16, (writer) => {
        writer.putCallAddressWithArguments(impl, ["r0", "r1"]);
        writer.putPopRegs(["r0", "lr"]);
        writer.putMovRegReg("pc", "lr");
      });
      break;
    case "arm64":
      thunk = makeThunk(64, (writer) => {
        writer.putPushRegReg("x0", "lr");
        writer.putCallAddressWithArguments(impl, ["x1"]);
        writer.putPopRegReg("x2", "lr");
        writer.putStrRegRegOffset("x0", "x2", 0);
        writer.putStrRegRegOffset("w1", "x2", 8);
        writer.putRet();
      });
      break;
  }
  return new NativeFunction(thunk, "void", ["pointer", "pointer"], nativeFunctionOptions3);
}
var thunkRelocators = {
  ia32: globalThis.X86Relocator,
  x64: globalThis.X86Relocator,
  arm: globalThis.ThumbRelocator,
  arm64: globalThis.Arm64Relocator
};
var thunkWriters = {
  ia32: globalThis.X86Writer,
  x64: globalThis.X86Writer,
  arm: globalThis.ThumbWriter,
  arm64: globalThis.Arm64Writer
};
function makeThunk(size, write3) {
  if (thunkPage === null) {
    thunkPage = Memory.alloc(Process.pageSize);
  }
  const thunk = thunkPage.add(thunkOffset);
  const arch = Process.arch;
  const Writer = thunkWriters[arch];
  Memory.patchCode(thunk, size, (code4) => {
    const writer = new Writer(code4, { pc: thunk });
    write3(writer);
    writer.flush();
    if (writer.offset > size) {
      throw new Error(`Wrote ${writer.offset}, exceeding maximum of ${size}`);
    }
  });
  thunkOffset += size;
  return arch === "arm" ? thunk.or(1) : thunk;
}
function notifyArtMethodHooked(method2, vm3) {
  ensureArtKnowsHowToHandleMethodInstrumentation(vm3);
  ensureArtKnowsHowToHandleReplacementMethods(vm3);
}
function makeArtController(api3, vm3) {
  const threadOffsets = getArtThreadSpec(vm3).offset;
  const managedStackOffsets = getArtManagedStackSpec().offset;
  const code4 = `
#include <gum/guminterceptor.h>

extern GMutex lock;
extern GHashTable * methods;
extern GHashTable * replacements;
extern gpointer last_seen_art_method;

extern gpointer get_oat_quick_method_header_impl (gpointer method, gpointer pc);

void
init (void)
{
  g_mutex_init (&lock);
  methods = g_hash_table_new_full (NULL, NULL, NULL, NULL);
  replacements = g_hash_table_new_full (NULL, NULL, NULL, NULL);
}

void
finalize (void)
{
  g_hash_table_unref (replacements);
  g_hash_table_unref (methods);
  g_mutex_clear (&lock);
}

gboolean
is_replacement_method (gpointer method)
{
  gboolean is_replacement;

  g_mutex_lock (&lock);

  is_replacement = g_hash_table_contains (replacements, method);

  g_mutex_unlock (&lock);

  return is_replacement;
}

gpointer
get_replacement_method (gpointer original_method)
{
  gpointer replacement_method;

  g_mutex_lock (&lock);

  replacement_method = g_hash_table_lookup (methods, original_method);

  g_mutex_unlock (&lock);

  return replacement_method;
}

void
set_replacement_method (gpointer original_method,
                        gpointer replacement_method)
{
  g_mutex_lock (&lock);

  g_hash_table_insert (methods, original_method, replacement_method);
  g_hash_table_insert (replacements, replacement_method, original_method);

  g_mutex_unlock (&lock);
}

void
synchronize_replacement_methods (guint quick_code_offset,
                                 void * nterp_entrypoint,
                                 void * quick_to_interpreter_bridge)
{
  GHashTableIter iter;
  gpointer hooked_method, replacement_method;

  g_mutex_lock (&lock);

  g_hash_table_iter_init (&iter, methods);
  while (g_hash_table_iter_next (&iter, &hooked_method, &replacement_method))
  {
    void ** quick_code;

    *((uint32_t *) replacement_method) = *((uint32_t *) hooked_method);

    quick_code = hooked_method + quick_code_offset;
    if (*quick_code == nterp_entrypoint)
      *quick_code = quick_to_interpreter_bridge;
  }

  g_mutex_unlock (&lock);
}

void
delete_replacement_method (gpointer original_method)
{
  gpointer replacement_method;

  g_mutex_lock (&lock);

  replacement_method = g_hash_table_lookup (methods, original_method);
  if (replacement_method != NULL)
  {
    g_hash_table_remove (methods, original_method);
    g_hash_table_remove (replacements, replacement_method);
  }

  g_mutex_unlock (&lock);
}

gpointer
translate_method (gpointer method)
{
  gpointer translated_method;

  g_mutex_lock (&lock);

  translated_method = g_hash_table_lookup (replacements, method);

  g_mutex_unlock (&lock);

  return (translated_method != NULL) ? translated_method : method;
}

gpointer
find_replacement_method_from_quick_code (gpointer method,
                                         gpointer thread)
{
  gpointer replacement_method;
  gpointer managed_stack;
  gpointer top_quick_frame;
  gpointer link_managed_stack;
  gpointer * link_top_quick_frame;

  replacement_method = get_replacement_method (method);
  if (replacement_method == NULL)
    return NULL;

  /*
   * Stack check.
   *
   * Return NULL to indicate that the original method should be invoked, otherwise
   * return a pointer to the replacement ArtMethod.
   *
   * If the caller is our own JNI replacement stub, then a stack transition must
   * have been pushed onto the current thread's linked list.
   *
   * Therefore, we invoke the original method if the following conditions are met:
   *   1- The current managed stack is empty.
   *   2- The ArtMethod * inside the linked managed stack's top quick frame is the
   *      same as our replacement.
   */
  managed_stack = thread + ${threadOffsets.managedStack};
  top_quick_frame = *((gpointer *) (managed_stack + ${managedStackOffsets.topQuickFrame}));
  if (top_quick_frame != NULL)
    return replacement_method;

  link_managed_stack = *((gpointer *) (managed_stack + ${managedStackOffsets.link}));
  if (link_managed_stack == NULL)
    return replacement_method;

  link_top_quick_frame = GSIZE_TO_POINTER (*((gsize *) (link_managed_stack + ${managedStackOffsets.topQuickFrame})) & ~((gsize) 1));
  if (link_top_quick_frame == NULL || *link_top_quick_frame != replacement_method)
    return replacement_method;

  return NULL;
}

void
on_interpreter_do_call (GumInvocationContext * ic)
{
  gpointer method, replacement_method;

  method = gum_invocation_context_get_nth_argument (ic, 0);

  replacement_method = get_replacement_method (method);
  if (replacement_method != NULL)
    gum_invocation_context_replace_nth_argument (ic, 0, replacement_method);
}

gpointer
on_art_method_get_oat_quick_method_header (gpointer method,
                                           gpointer pc)
{
  if (is_replacement_method (method))
    return NULL;

  return get_oat_quick_method_header_impl (method, pc);
}

void
on_art_method_pretty_method (GumInvocationContext * ic)
{
  const guint this_arg_index = ${Process.arch === "arm64" ? 0 : 1};
  gpointer method;

  method = gum_invocation_context_get_nth_argument (ic, this_arg_index);
  if (method == NULL)
    gum_invocation_context_replace_nth_argument (ic, this_arg_index, last_seen_art_method);
  else
    last_seen_art_method = method;
}

void
on_leave_gc_concurrent_copying_copying_phase (GumInvocationContext * ic)
{
  GHashTableIter iter;
  gpointer hooked_method, replacement_method;

  g_mutex_lock (&lock);

  g_hash_table_iter_init (&iter, methods);
  while (g_hash_table_iter_next (&iter, &hooked_method, &replacement_method))
    *((uint32_t *) replacement_method) = *((uint32_t *) hooked_method);

  g_mutex_unlock (&lock);
}
`;
  const lockSize = 8;
  const methodsSize = pointerSize7;
  const replacementsSize = pointerSize7;
  const lastSeenArtMethodSize = pointerSize7;
  const data = Memory.alloc(lockSize + methodsSize + replacementsSize + lastSeenArtMethodSize);
  const lock = data;
  const methods = lock.add(lockSize);
  const replacements = methods.add(methodsSize);
  const lastSeenArtMethod = replacements.add(replacementsSize);
  const getOatQuickMethodHeaderImpl = api3.find(pointerSize7 === 4 ? "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEj" : "_ZN3art9ArtMethod23GetOatQuickMethodHeaderEm");
  const cm2 = new CModule(code4, {
    lock,
    methods,
    replacements,
    last_seen_art_method: lastSeenArtMethod,
    get_oat_quick_method_header_impl: getOatQuickMethodHeaderImpl ?? ptr("0xdeadbeef")
  });
  const fastOptions = { exceptions: "propagate", scheduling: "exclusive" };
  return {
    handle: cm2,
    replacedMethods: {
      isReplacement: new NativeFunction(cm2.is_replacement_method, "bool", ["pointer"], fastOptions),
      get: new NativeFunction(cm2.get_replacement_method, "pointer", ["pointer"], fastOptions),
      set: new NativeFunction(cm2.set_replacement_method, "void", ["pointer", "pointer"], fastOptions),
      synchronize: new NativeFunction(cm2.synchronize_replacement_methods, "void", ["uint", "pointer", "pointer"], fastOptions),
      delete: new NativeFunction(cm2.delete_replacement_method, "void", ["pointer"], fastOptions),
      translate: new NativeFunction(cm2.translate_method, "pointer", ["pointer"], fastOptions),
      findReplacementFromQuickCode: cm2.find_replacement_method_from_quick_code
    },
    getOatQuickMethodHeaderImpl,
    hooks: {
      Interpreter: {
        doCall: cm2.on_interpreter_do_call
      },
      ArtMethod: {
        getOatQuickMethodHeader: cm2.on_art_method_get_oat_quick_method_header,
        prettyMethod: cm2.on_art_method_pretty_method
      },
      Gc: {
        copyingPhase: {
          onLeave: cm2.on_leave_gc_concurrent_copying_copying_phase
        },
        runFlip: {
          onEnter: cm2.on_leave_gc_concurrent_copying_copying_phase
        }
      }
    }
  };
}
function ensureArtKnowsHowToHandleMethodInstrumentation(vm3) {
  if (taughtArtAboutMethodInstrumentation) {
    return;
  }
  taughtArtAboutMethodInstrumentation = true;
  instrumentArtQuickEntrypoints(vm3);
  instrumentArtMethodInvocationFromInterpreter();
  instrumentArtGarbageCollection();
  instrumentArtFixupStaticTrampolines();
}
function instrumentArtQuickEntrypoints(vm3) {
  const api3 = getApi2();
  const quickEntrypoints = [
    api3.artQuickGenericJniTrampoline,
    api3.artQuickToInterpreterBridge,
    api3.artQuickResolutionTrampoline
  ];
  quickEntrypoints.forEach((entrypoint) => {
    Memory.protect(entrypoint, 32, "rwx");
    const interceptor = new ArtQuickCodeInterceptor(entrypoint);
    interceptor.activate(vm3);
    artQuickInterceptors.push(interceptor);
  });
}
function instrumentArtMethodInvocationFromInterpreter() {
  const api3 = getApi2();
  const apiLevel = getAndroidApiLevel();
  const { isApiLevel34OrApexEquivalent } = api3;
  let artInterpreterDoCallExportRegex;
  if (apiLevel <= 22) {
    artInterpreterDoCallExportRegex = /^_ZN3art11interpreter6DoCallILb[0-1]ELb[0-1]EEEbPNS_6mirror9ArtMethodEPNS_6ThreadERNS_11ShadowFrameEPKNS_11InstructionEtPNS_6JValueE$/;
  } else if (apiLevel <= 33 && !isApiLevel34OrApexEquivalent) {
    artInterpreterDoCallExportRegex = /^_ZN3art11interpreter6DoCallILb[0-1]ELb[0-1]EEEbPNS_9ArtMethodEPNS_6ThreadERNS_11ShadowFrameEPKNS_11InstructionEtPNS_6JValueE$/;
  } else if (isApiLevel34OrApexEquivalent) {
    artInterpreterDoCallExportRegex = /^_ZN3art11interpreter6DoCallILb[0-1]EEEbPNS_9ArtMethodEPNS_6ThreadERNS_11ShadowFrameEPKNS_11InstructionEtbPNS_6JValueE$/;
  } else {
    throw new Error("Unable to find method invocation in ART; please file a bug");
  }
  const art = api3.module;
  const entries = [...art.enumerateExports(), ...art.enumerateSymbols()].filter((entry) => artInterpreterDoCallExportRegex.test(entry.name));
  if (entries.length === 0) {
    throw new Error("Unable to find method invocation in ART; please file a bug");
  }
  for (const entry of entries) {
    Interceptor.attach(entry.address, artController.hooks.Interpreter.doCall);
  }
}
function instrumentArtGarbageCollection() {
  const api3 = getApi2();
  const art = api3.module;
  const gc = art.findSymbolByName("_ZN3art2gc4Heap22CollectGarbageInternalENS0_9collector6GcTypeENS0_7GcCauseEbj");
  if (gc === null) {
    return;
  }
  const { artNterpEntryPoint, artQuickToInterpreterBridge } = api3;
  const quickCodeOffset = getArtMethodSpec(api3.vm).offset.quickCode;
  Interceptor.attach(gc, {
    onLeave() {
      artController.replacedMethods.synchronize(quickCodeOffset, artNterpEntryPoint, artQuickToInterpreterBridge);
    }
  });
}
function instrumentArtFixupStaticTrampolines() {
  const patterns = [
    ["_ZN3art11ClassLinker26VisiblyInitializedCallback22MarkVisiblyInitializedEPNS_6ThreadE", "e90340f8 : ff0ff0ff"],
    ["_ZN3art11ClassLinker26VisiblyInitializedCallback29AdjustThreadVisibilityCounterEPNS_6ThreadEl", "7f0f00f9 : 1ffcffff"]
  ];
  const api3 = getApi2();
  const art = api3.module;
  for (const [name, pattern] of patterns) {
    const base = art.findSymbolByName(name);
    if (base === null) {
      continue;
    }
    const matches = Memory.scanSync(base, 8192, pattern);
    if (matches.length === 0) {
      return;
    }
    const { artNterpEntryPoint, artQuickToInterpreterBridge } = api3;
    const quickCodeOffset = getArtMethodSpec(api3.vm).offset.quickCode;
    Interceptor.attach(matches[0].address, function() {
      artController.replacedMethods.synchronize(quickCodeOffset, artNterpEntryPoint, artQuickToInterpreterBridge);
    });
    return;
  }
}
function ensureArtKnowsHowToHandleReplacementMethods(vm3) {
  if (taughtArtAboutReplacementMethods) {
    return;
  }
  taughtArtAboutReplacementMethods = true;
  if (!maybeInstrumentGetOatQuickMethodHeaderInlineCopies()) {
    const { getOatQuickMethodHeaderImpl } = artController;
    if (getOatQuickMethodHeaderImpl === null) {
      return;
    }
    try {
      Interceptor.replace(getOatQuickMethodHeaderImpl, artController.hooks.ArtMethod.getOatQuickMethodHeader);
    } catch (e) {
    }
  }
  const apiLevel = getAndroidApiLevel();
  let copyingPhase = null;
  const api3 = getApi2();
  if (apiLevel > 28) {
    copyingPhase = api3.find("_ZN3art2gc9collector17ConcurrentCopying12CopyingPhaseEv");
  } else if (apiLevel > 22) {
    copyingPhase = api3.find("_ZN3art2gc9collector17ConcurrentCopying12MarkingPhaseEv");
  }
  if (copyingPhase !== null) {
    Interceptor.attach(copyingPhase, artController.hooks.Gc.copyingPhase);
  }
  let runFlip = null;
  runFlip = api3.find("_ZN3art6Thread15RunFlipFunctionEPS0_");
  if (runFlip === null) {
    runFlip = api3.find("_ZN3art6Thread15RunFlipFunctionEPS0_b");
  }
  if (runFlip !== null) {
    Interceptor.attach(runFlip, artController.hooks.Gc.runFlip);
  }
}
var artGetOatQuickMethodHeaderInlinedCopyHandler = {
  arm: {
    signatures: [
      {
        pattern: [
          "b0 68",
          // ldr r0, [r6, #8]
          "01 30",
          // adds r0, #1
          "0c d0",
          // beq #0x16fcd4
          "1b 98",
          // ldr r0, [sp, #0x6c]
          ":",
          "c0 ff",
          "c0 ff",
          "00 ff",
          "00 2f"
        ],
        validateMatch: validateGetOatQuickMethodHeaderInlinedMatchArm
      },
      {
        pattern: [
          "d8 f8 08 00",
          // ldr r0, [r8, #8]
          "01 30",
          // adds r0, #1
          "0c d0",
          // beq #0x16fcd4
          "1b 98",
          // ldr r0, [sp, #0x6c]
          ":",
          "f0 ff ff 0f",
          "ff ff",
          "00 ff",
          "00 2f"
        ],
        validateMatch: validateGetOatQuickMethodHeaderInlinedMatchArm
      },
      {
        pattern: [
          "b0 68",
          // ldr r0, [r6, #8]
          "01 30",
          // adds r0, #1
          "40 f0 c3 80",
          // bne #0x203bf0
          "00 25",
          // movs r5, #0
          ":",
          "c0 ff",
          "c0 ff",
          "c0 fb 00 d0",
          "ff f8"
        ],
        validateMatch: validateGetOatQuickMethodHeaderInlinedMatchArm
      }
    ],
    instrument: instrumentGetOatQuickMethodHeaderInlinedCopyArm
  },
  arm64: {
    signatures: [
      {
        pattern: [
          /* e8 */
          "0a 40 b9",
          // ldr w8, [x23, #0x8]
          "1f 05 00 31",
          // cmn w8, #0x1
          "40 01 00 54",
          // b.eq 0x2e4204
          "88 39 00 f0",
          // adrp x8, 0xa17000
          ":",
          /* 00 */
          "fc ff ff",
          "1f fc ff ff",
          "1f 00 00 ff",
          "00 00 00 9f"
        ],
        offset: 1,
        validateMatch: validateGetOatQuickMethodHeaderInlinedMatchArm64
      },
      {
        pattern: [
          /* e8 */
          "0a 40 b9",
          // ldr w8, [x23, #0x8]
          "1f 05 00 31",
          // cmn w8, #0x1
          "01 34 00 54",
          // b.ne 0x3d8e50
          "e0 03 1f aa",
          // mov x0, xzr
          ":",
          /* 00 */
          "fc ff ff",
          "1f fc ff ff",
          "1f 00 00 ff",
          "e0 ff ff ff"
        ],
        offset: 1,
        validateMatch: validateGetOatQuickMethodHeaderInlinedMatchArm64
      }
    ],
    instrument: instrumentGetOatQuickMethodHeaderInlinedCopyArm64
  }
};
function validateGetOatQuickMethodHeaderInlinedMatchArm({ address, size }) {
  const ldr = Instruction.parse(address.or(1));
  const [ldrDst, ldrSrc] = ldr.operands;
  const methodReg = ldrSrc.value.base;
  const scratchReg = ldrDst.value;
  const branch = Instruction.parse(ldr.next.add(2));
  const targetWhenTrue = ptr(branch.operands[0].value);
  const targetWhenFalse = branch.address.add(branch.size);
  let targetWhenRegularMethod, targetWhenRuntimeMethod;
  if (branch.mnemonic === "beq") {
    targetWhenRegularMethod = targetWhenFalse;
    targetWhenRuntimeMethod = targetWhenTrue;
  } else {
    targetWhenRegularMethod = targetWhenTrue;
    targetWhenRuntimeMethod = targetWhenFalse;
  }
  return parseInstructionsAt(targetWhenRegularMethod.or(1), tryParse, { limit: 3 });
  function tryParse(insn) {
    const { mnemonic } = insn;
    if (!(mnemonic === "ldr" || mnemonic === "ldr.w")) {
      return null;
    }
    const { base, disp } = insn.operands[1].value;
    if (!(base === methodReg && disp === 20)) {
      return null;
    }
    return {
      methodReg,
      scratchReg,
      target: {
        whenTrue: targetWhenTrue,
        whenRegularMethod: targetWhenRegularMethod,
        whenRuntimeMethod: targetWhenRuntimeMethod
      }
    };
  }
}
function validateGetOatQuickMethodHeaderInlinedMatchArm64({ address, size }) {
  const [ldrDst, ldrSrc] = Instruction.parse(address).operands;
  const methodReg = ldrSrc.value.base;
  const scratchReg = "x" + ldrDst.value.substring(1);
  const branch = Instruction.parse(address.add(8));
  const targetWhenTrue = ptr(branch.operands[0].value);
  const targetWhenFalse = address.add(12);
  let targetWhenRegularMethod, targetWhenRuntimeMethod;
  if (branch.mnemonic === "b.eq") {
    targetWhenRegularMethod = targetWhenFalse;
    targetWhenRuntimeMethod = targetWhenTrue;
  } else {
    targetWhenRegularMethod = targetWhenTrue;
    targetWhenRuntimeMethod = targetWhenFalse;
  }
  return parseInstructionsAt(targetWhenRegularMethod, tryParse, { limit: 3 });
  function tryParse(insn) {
    if (insn.mnemonic !== "ldr") {
      return null;
    }
    const { base, disp } = insn.operands[1].value;
    if (!(base === methodReg && disp === 24)) {
      return null;
    }
    return {
      methodReg,
      scratchReg,
      target: {
        whenTrue: targetWhenTrue,
        whenRegularMethod: targetWhenRegularMethod,
        whenRuntimeMethod: targetWhenRuntimeMethod
      }
    };
  }
}
function maybeInstrumentGetOatQuickMethodHeaderInlineCopies() {
  if (getAndroidApiLevel() < 31) {
    return false;
  }
  const handler = artGetOatQuickMethodHeaderInlinedCopyHandler[Process.arch];
  if (handler === void 0) {
    return false;
  }
  const signatures = handler.signatures.map(({ pattern, offset = 0, validateMatch = returnEmptyObject }) => {
    return {
      pattern: new MatchPattern(pattern.join("")),
      offset,
      validateMatch
    };
  });
  const impls = [];
  for (const { base, size } of getApi2().module.enumerateRanges("--x")) {
    for (const { pattern, offset, validateMatch } of signatures) {
      const matches = Memory.scanSync(base, size, pattern).map(({ address, size: size2 }) => {
        return { address: address.sub(offset), size: size2 + offset };
      }).filter((match) => {
        const validationResult = validateMatch(match);
        if (validationResult === null) {
          return false;
        }
        match.validationResult = validationResult;
        return true;
      });
      impls.push(...matches);
    }
  }
  if (impls.length === 0) {
    return false;
  }
  impls.forEach(handler.instrument);
  return true;
}
function returnEmptyObject() {
  return {};
}
var InlineHook = class {
  constructor(address, size, trampoline) {
    this.address = address;
    this.size = size;
    this.originalCode = address.readByteArray(size);
    this.trampoline = trampoline;
  }
  revert() {
    Memory.patchCode(this.address, this.size, (code4) => {
      code4.writeByteArray(this.originalCode);
    });
  }
};
function instrumentGetOatQuickMethodHeaderInlinedCopyArm({ address, size, validationResult }) {
  const { methodReg, target } = validationResult;
  const trampoline = Memory.alloc(Process.pageSize);
  let redirectCapacity = size;
  Memory.patchCode(trampoline, 256, (code4) => {
    const writer = new ThumbWriter(code4, { pc: trampoline });
    const relocator = new ThumbRelocator(address, writer);
    for (let i = 0; i !== 2; i++) {
      relocator.readOne();
    }
    relocator.writeAll();
    relocator.readOne();
    relocator.skipOne();
    writer.putBCondLabel("eq", "runtime_or_replacement_method");
    const vpushFpRegs = [45, 237, 16, 10];
    writer.putBytes(vpushFpRegs);
    const savedRegs = ["r0", "r1", "r2", "r3"];
    writer.putPushRegs(savedRegs);
    writer.putCallAddressWithArguments(artController.replacedMethods.isReplacement, [methodReg]);
    writer.putCmpRegImm("r0", 0);
    writer.putPopRegs(savedRegs);
    const vpopFpRegs = [189, 236, 16, 10];
    writer.putBytes(vpopFpRegs);
    writer.putBCondLabel("ne", "runtime_or_replacement_method");
    writer.putBLabel("regular_method");
    relocator.readOne();
    const tailIsRegular = relocator.input.address.equals(target.whenRegularMethod);
    writer.putLabel(tailIsRegular ? "regular_method" : "runtime_or_replacement_method");
    relocator.writeOne();
    while (redirectCapacity < 10) {
      const offset = relocator.readOne();
      if (offset === 0) {
        redirectCapacity = 10;
        break;
      }
      redirectCapacity = offset;
    }
    relocator.writeAll();
    writer.putBranchAddress(address.add(redirectCapacity + 1));
    writer.putLabel(tailIsRegular ? "runtime_or_replacement_method" : "regular_method");
    writer.putBranchAddress(target.whenTrue);
    writer.flush();
  });
  inlineHooks.push(new InlineHook(address, redirectCapacity, trampoline));
  Memory.patchCode(address, redirectCapacity, (code4) => {
    const writer = new ThumbWriter(code4, { pc: address });
    writer.putLdrRegAddress("pc", trampoline.or(1));
    writer.flush();
  });
}
function instrumentGetOatQuickMethodHeaderInlinedCopyArm64({ address, size, validationResult }) {
  const { methodReg, scratchReg, target } = validationResult;
  const trampoline = Memory.alloc(Process.pageSize);
  Memory.patchCode(trampoline, 256, (code4) => {
    const writer = new Arm64Writer(code4, { pc: trampoline });
    const relocator = new Arm64Relocator(address, writer);
    for (let i = 0; i !== 2; i++) {
      relocator.readOne();
    }
    relocator.writeAll();
    relocator.readOne();
    relocator.skipOne();
    writer.putBCondLabel("eq", "runtime_or_replacement_method");
    const savedRegs = [
      "d0",
      "d1",
      "d2",
      "d3",
      "d4",
      "d5",
      "d6",
      "d7",
      "x0",
      "x1",
      "x2",
      "x3",
      "x4",
      "x5",
      "x6",
      "x7",
      "x8",
      "x9",
      "x10",
      "x11",
      "x12",
      "x13",
      "x14",
      "x15",
      "x16",
      "x17"
    ];
    const numSavedRegs = savedRegs.length;
    for (let i = 0; i !== numSavedRegs; i += 2) {
      writer.putPushRegReg(savedRegs[i], savedRegs[i + 1]);
    }
    writer.putCallAddressWithArguments(artController.replacedMethods.isReplacement, [methodReg]);
    writer.putCmpRegReg("x0", "xzr");
    for (let i = numSavedRegs - 2; i >= 0; i -= 2) {
      writer.putPopRegReg(savedRegs[i], savedRegs[i + 1]);
    }
    writer.putBCondLabel("ne", "runtime_or_replacement_method");
    writer.putBLabel("regular_method");
    relocator.readOne();
    const tailInstruction = relocator.input;
    const tailIsRegular = tailInstruction.address.equals(target.whenRegularMethod);
    writer.putLabel(tailIsRegular ? "regular_method" : "runtime_or_replacement_method");
    relocator.writeOne();
    writer.putBranchAddress(tailInstruction.next);
    writer.putLabel(tailIsRegular ? "runtime_or_replacement_method" : "regular_method");
    writer.putBranchAddress(target.whenTrue);
    writer.flush();
  });
  inlineHooks.push(new InlineHook(address, size, trampoline));
  Memory.patchCode(address, size, (code4) => {
    const writer = new Arm64Writer(code4, { pc: address });
    writer.putLdrRegAddress(scratchReg, trampoline);
    writer.putBrReg(scratchReg);
    writer.flush();
  });
}
function makeMethodMangler(methodId) {
  return new MethodMangler(methodId);
}
function translateMethod(methodId) {
  return artController.replacedMethods.translate(methodId);
}
function backtrace(vm3, options = {}) {
  const { limit = 16 } = options;
  const env = vm3.getEnv();
  if (backtraceModule === null) {
    backtraceModule = makeBacktraceModule(vm3, env);
  }
  return backtraceModule.backtrace(env, limit);
}
function makeBacktraceModule(vm3, env) {
  const api3 = getApi2();
  const performImpl = Memory.alloc(Process.pointerSize);
  const cm2 = new CModule(`
#include <glib.h>
#include <stdbool.h>
#include <string.h>
#include <gum/gumtls.h>
#include <json-glib/json-glib.h>

typedef struct _ArtBacktrace ArtBacktrace;
typedef struct _ArtStackFrame ArtStackFrame;

typedef struct _ArtStackVisitor ArtStackVisitor;
typedef struct _ArtStackVisitorVTable ArtStackVisitorVTable;

typedef struct _ArtClass ArtClass;
typedef struct _ArtMethod ArtMethod;
typedef struct _ArtThread ArtThread;
typedef struct _ArtContext ArtContext;

typedef struct _JNIEnv JNIEnv;

typedef struct _StdString StdString;
typedef struct _StdTinyString StdTinyString;
typedef struct _StdLargeString StdLargeString;

typedef enum {
  STACK_WALK_INCLUDE_INLINED_FRAMES,
  STACK_WALK_SKIP_INLINED_FRAMES,
} StackWalkKind;

struct _StdTinyString
{
  guint8 unused;
  gchar data[(3 * sizeof (gpointer)) - 1];
};

struct _StdLargeString
{
  gsize capacity;
  gsize size;
  gchar * data;
};

struct _StdString
{
  union
  {
    guint8 flags;
    StdTinyString tiny;
    StdLargeString large;
  };
};

struct _ArtBacktrace
{
  GChecksum * id;
  GArray * frames;
  gchar * frames_json;
};

struct _ArtStackFrame
{
  ArtMethod * method;
  gsize dexpc;
  StdString description;
};

struct _ArtStackVisitorVTable
{
  void (* unused1) (void);
  void (* unused2) (void);
  bool (* visit) (ArtStackVisitor * visitor);
};

struct _ArtStackVisitor
{
  ArtStackVisitorVTable * vtable;

  guint8 padding[512];

  ArtStackVisitorVTable vtable_storage;

  ArtBacktrace * backtrace;
};

struct _ArtMethod
{
  guint32 declaring_class;
  guint32 access_flags;
};

extern GumTlsKey current_backtrace;

extern void (* perform_art_thread_state_transition) (JNIEnv * env);

extern ArtContext * art_make_context (ArtThread * thread);

extern void art_stack_visitor_init (ArtStackVisitor * visitor, ArtThread * thread, void * context, StackWalkKind walk_kind,
    size_t num_frames, bool check_suspended);
extern void art_stack_visitor_walk_stack (ArtStackVisitor * visitor, bool include_transitions);
extern ArtMethod * art_stack_visitor_get_method (ArtStackVisitor * visitor);
extern void art_stack_visitor_describe_location (StdString * description, ArtStackVisitor * visitor);
extern ArtMethod * translate_method (ArtMethod * method);
extern void translate_location (ArtMethod * method, guint32 pc, const gchar ** source_file, gint32 * line_number);
extern void get_class_location (StdString * result, ArtClass * klass);
extern void cxx_delete (void * mem);
extern unsigned long strtoul (const char * str, char ** endptr, int base);

static bool visit_frame (ArtStackVisitor * visitor);
static void art_stack_frame_destroy (ArtStackFrame * frame);

static void append_jni_type_name (GString * s, const gchar * name, gsize length);

static void std_string_destroy (StdString * str);
static gchar * std_string_get_data (StdString * str);

void
init (void)
{
  current_backtrace = gum_tls_key_new ();
}

void
finalize (void)
{
  gum_tls_key_free (current_backtrace);
}

ArtBacktrace *
_create (JNIEnv * env,
         guint limit)
{
  ArtBacktrace * bt;

  bt = g_new (ArtBacktrace, 1);
  bt->id = g_checksum_new (G_CHECKSUM_SHA1);
  bt->frames = (limit != 0)
      ? g_array_sized_new (FALSE, FALSE, sizeof (ArtStackFrame), limit)
      : g_array_new (FALSE, FALSE, sizeof (ArtStackFrame));
  g_array_set_clear_func (bt->frames, (GDestroyNotify) art_stack_frame_destroy);
  bt->frames_json = NULL;

  gum_tls_key_set_value (current_backtrace, bt);

  perform_art_thread_state_transition (env);

  gum_tls_key_set_value (current_backtrace, NULL);

  return bt;
}

void
_on_thread_state_transition_complete (ArtThread * thread)
{
  ArtContext * context;
  ArtStackVisitor visitor = {
    .vtable_storage = {
      .visit = visit_frame,
    },
  };

  context = art_make_context (thread);

  art_stack_visitor_init (&visitor, thread, context, STACK_WALK_SKIP_INLINED_FRAMES, 0, true);
  visitor.vtable = &visitor.vtable_storage;
  visitor.backtrace = gum_tls_key_get_value (current_backtrace);

  art_stack_visitor_walk_stack (&visitor, false);

  cxx_delete (context);
}

static bool
visit_frame (ArtStackVisitor * visitor)
{
  ArtBacktrace * bt = visitor->backtrace;
  ArtStackFrame frame;
  const gchar * description, * dexpc_part;

  frame.method = art_stack_visitor_get_method (visitor);

  art_stack_visitor_describe_location (&frame.description, visitor);

  description = std_string_get_data (&frame.description);
  if (strstr (description, " '<") != NULL)
    goto skip;

  dexpc_part = strstr (description, " at dex PC 0x");
  if (dexpc_part == NULL)
    goto skip;
  frame.dexpc = strtoul (dexpc_part + 13, NULL, 16);

  g_array_append_val (bt->frames, frame);

  g_checksum_update (bt->id, (guchar *) &frame.method, sizeof (frame.method));
  g_checksum_update (bt->id, (guchar *) &frame.dexpc, sizeof (frame.dexpc));

  return true;

skip:
  std_string_destroy (&frame.description);
  return true;
}

static void
art_stack_frame_destroy (ArtStackFrame * frame)
{
  std_string_destroy (&frame->description);
}

void
_destroy (ArtBacktrace * backtrace)
{
  g_free (backtrace->frames_json);
  g_array_free (backtrace->frames, TRUE);
  g_checksum_free (backtrace->id);
  g_free (backtrace);
}

const gchar *
_get_id (ArtBacktrace * backtrace)
{
  return g_checksum_get_string (backtrace->id);
}

const gchar *
_get_frames (ArtBacktrace * backtrace)
{
  GArray * frames = backtrace->frames;
  JsonBuilder * b;
  guint i;
  JsonNode * root;

  if (backtrace->frames_json != NULL)
    return backtrace->frames_json;

  b = json_builder_new_immutable ();

  json_builder_begin_array (b);

  for (i = 0; i != frames->len; i++)
  {
    ArtStackFrame * frame = &g_array_index (frames, ArtStackFrame, i);
    gchar * description, * ret_type, * paren_open, * paren_close, * arg_types, * token, * method_name, * class_name;
    GString * signature;
    gchar * cursor;
    ArtMethod * translated_method;
    StdString location;
    gsize dexpc;
    const gchar * source_file;
    gint32 line_number;

    description = std_string_get_data (&frame->description);

    ret_type = strchr (description, '\\'') + 1;

    paren_open = strchr (ret_type, '(');
    paren_close = strchr (paren_open, ')');
    *paren_open = '\\0';
    *paren_close = '\\0';

    arg_types = paren_open + 1;

    token = strrchr (ret_type, '.');
    *token = '\\0';

    method_name = token + 1;

    token = strrchr (ret_type, ' ');
    *token = '\\0';

    class_name = token + 1;

    signature = g_string_sized_new (128);

    append_jni_type_name (signature, class_name, method_name - class_name - 1);
    g_string_append_c (signature, ',');
    g_string_append (signature, method_name);
    g_string_append (signature, ",(");

    if (arg_types != paren_close)
    {
      for (cursor = arg_types; cursor != NULL;)
      {
        gsize length;
        gchar * next;

        token = strstr (cursor, ", ");
        if (token != NULL)
        {
          length = token - cursor;
          next = token + 2;
        }
        else
        {
          length = paren_close - cursor;
          next = NULL;
        }

        append_jni_type_name (signature, cursor, length);

        cursor = next;
      }
    }

    g_string_append_c (signature, ')');

    append_jni_type_name (signature, ret_type, class_name - ret_type - 1);

    translated_method = translate_method (frame->method);
    dexpc = (translated_method == frame->method) ? frame->dexpc : 0;

    get_class_location (&location, GSIZE_TO_POINTER (translated_method->declaring_class));

    translate_location (translated_method, dexpc, &source_file, &line_number);

    json_builder_begin_object (b);

    json_builder_set_member_name (b, "signature");
    json_builder_add_string_value (b, signature->str);

    json_builder_set_member_name (b, "origin");
    json_builder_add_string_value (b, std_string_get_data (&location));

    json_builder_set_member_name (b, "className");
    json_builder_add_string_value (b, class_name);

    json_builder_set_member_name (b, "methodName");
    json_builder_add_string_value (b, method_name);

    json_builder_set_member_name (b, "methodFlags");
    json_builder_add_int_value (b, translated_method->access_flags);

    json_builder_set_member_name (b, "fileName");
    json_builder_add_string_value (b, source_file);

    json_builder_set_member_name (b, "lineNumber");
    json_builder_add_int_value (b, line_number);

    json_builder_end_object (b);

    std_string_destroy (&location);
    g_string_free (signature, TRUE);
  }

  json_builder_end_array (b);

  root = json_builder_get_root (b);
  backtrace->frames_json = json_to_string (root, FALSE);
  json_node_unref (root);

  return backtrace->frames_json;
}

static void
append_jni_type_name (GString * s,
                      const gchar * name,
                      gsize length)
{
  gchar shorty = '\\0';
  gsize i;

  switch (name[0])
  {
    case 'b':
      if (strncmp (name, "boolean", length) == 0)
        shorty = 'Z';
      else if (strncmp (name, "byte", length) == 0)
        shorty = 'B';
      break;
    case 'c':
      if (strncmp (name, "char", length) == 0)
        shorty = 'C';
      break;
    case 'd':
      if (strncmp (name, "double", length) == 0)
        shorty = 'D';
      break;
    case 'f':
      if (strncmp (name, "float", length) == 0)
        shorty = 'F';
      break;
    case 'i':
      if (strncmp (name, "int", length) == 0)
        shorty = 'I';
      break;
    case 'l':
      if (strncmp (name, "long", length) == 0)
        shorty = 'J';
      break;
    case 's':
      if (strncmp (name, "short", length) == 0)
        shorty = 'S';
      break;
    case 'v':
      if (strncmp (name, "void", length) == 0)
        shorty = 'V';
      break;
  }

  if (shorty != '\\0')
  {
    g_string_append_c (s, shorty);

    return;
  }

  if (length > 2 && name[length - 2] == '[' && name[length - 1] == ']')
  {
    g_string_append_c (s, '[');
    append_jni_type_name (s, name, length - 2);

    return;
  }

  g_string_append_c (s, 'L');

  for (i = 0; i != length; i++)
  {
    gchar ch = name[i];
    if (ch != '.')
      g_string_append_c (s, ch);
    else
      g_string_append_c (s, '/');
  }

  g_string_append_c (s, ';');
}

static void
std_string_destroy (StdString * str)
{
  bool is_large = (str->flags & 1) != 0;
  if (is_large)
    cxx_delete (str->large.data);
}

static gchar *
std_string_get_data (StdString * str)
{
  bool is_large = (str->flags & 1) != 0;
  return is_large ? str->large.data : str->tiny.data;
}
`, {
    current_backtrace: Memory.alloc(Process.pointerSize),
    perform_art_thread_state_transition: performImpl,
    art_make_context: api3["art::Thread::GetLongJumpContext"] ?? api3["art::Context::Create"],
    art_stack_visitor_init: api3["art::StackVisitor::StackVisitor"],
    art_stack_visitor_walk_stack: api3["art::StackVisitor::WalkStack"],
    art_stack_visitor_get_method: api3["art::StackVisitor::GetMethod"],
    art_stack_visitor_describe_location: api3["art::StackVisitor::DescribeLocation"],
    translate_method: artController.replacedMethods.translate,
    translate_location: api3["art::Monitor::TranslateLocation"],
    get_class_location: api3["art::mirror::Class::GetLocation"],
    cxx_delete: api3.$delete,
    strtoul: Process.getModuleByName("libc.so").getExportByName("strtoul")
  });
  const _create = new NativeFunction(cm2._create, "pointer", ["pointer", "uint"], nativeFunctionOptions3);
  const _destroy = new NativeFunction(cm2._destroy, "void", ["pointer"], nativeFunctionOptions3);
  const fastOptions = { exceptions: "propagate", scheduling: "exclusive" };
  const _getId = new NativeFunction(cm2._get_id, "pointer", ["pointer"], fastOptions);
  const _getFrames = new NativeFunction(cm2._get_frames, "pointer", ["pointer"], fastOptions);
  const performThreadStateTransition = makeArtThreadStateTransitionImpl(vm3, env, cm2._on_thread_state_transition_complete);
  cm2._performData = performThreadStateTransition;
  performImpl.writePointer(performThreadStateTransition);
  cm2.backtrace = (env2, limit) => {
    const handle2 = _create(env2, limit);
    const bt = new Backtrace(handle2);
    Script.bindWeak(bt, destroy.bind(null, handle2));
    return bt;
  };
  function destroy(handle2) {
    _destroy(handle2);
  }
  cm2.getId = (handle2) => {
    return _getId(handle2).readUtf8String();
  };
  cm2.getFrames = (handle2) => {
    return JSON.parse(_getFrames(handle2).readUtf8String());
  };
  return cm2;
}
var Backtrace = class {
  constructor(handle2) {
    this.handle = handle2;
  }
  get id() {
    return backtraceModule.getId(this.handle);
  }
  get frames() {
    return backtraceModule.getFrames(this.handle);
  }
};
function revertGlobalPatches() {
  patchedClasses.forEach((entry) => {
    entry.vtablePtr.writePointer(entry.vtable);
    entry.vtableCountPtr.writeS32(entry.vtableCount);
  });
  patchedClasses.clear();
  for (const interceptor of artQuickInterceptors.splice(0)) {
    interceptor.deactivate();
  }
  for (const hook of inlineHooks.splice(0)) {
    hook.revert();
  }
}
function unwrapMethodId(methodId) {
  return unwrapGenericId(methodId, "art::jni::JniIdManager::DecodeMethodId");
}
function unwrapFieldId(fieldId) {
  return unwrapGenericId(fieldId, "art::jni::JniIdManager::DecodeFieldId");
}
function unwrapGenericId(genericId, apiMethod) {
  const api3 = getApi2();
  const runtimeOffset = getArtRuntimeSpec(api3).offset;
  const jniIdManagerOffset = runtimeOffset.jniIdManager;
  const jniIdsIndirectionOffset = runtimeOffset.jniIdsIndirection;
  if (jniIdManagerOffset !== null && jniIdsIndirectionOffset !== null) {
    const runtime3 = api3.artRuntime;
    const jniIdsIndirection = runtime3.add(jniIdsIndirectionOffset).readInt();
    if (jniIdsIndirection !== kPointer) {
      const jniIdManager = runtime3.add(jniIdManagerOffset).readPointer();
      return api3[apiMethod](jniIdManager, genericId);
    }
  }
  return genericId;
}
var artQuickCodeReplacementTrampolineWriters = {
  ia32: writeArtQuickCodeReplacementTrampolineIA32,
  x64: writeArtQuickCodeReplacementTrampolineX64,
  arm: writeArtQuickCodeReplacementTrampolineArm,
  arm64: writeArtQuickCodeReplacementTrampolineArm64
};
function writeArtQuickCodeReplacementTrampolineIA32(trampoline, target, redirectSize, constraints, vm3) {
  const threadOffsets = getArtThreadSpec(vm3).offset;
  const artMethodOffsets = getArtMethodSpec(vm3).offset;
  let offset;
  Memory.patchCode(trampoline, 128, (code4) => {
    const writer = new X86Writer(code4, { pc: trampoline });
    const relocator = new X86Relocator(target, writer);
    const fxsave = [15, 174, 4, 36];
    const fxrstor = [15, 174, 12, 36];
    writer.putPushax();
    writer.putMovRegReg("ebp", "esp");
    writer.putAndRegU32("esp", 4294967280);
    writer.putSubRegImm("esp", 512);
    writer.putBytes(fxsave);
    writer.putMovRegFsU32Ptr("ebx", threadOffsets.self);
    writer.putCallAddressWithAlignedArguments(artController.replacedMethods.findReplacementFromQuickCode, ["eax", "ebx"]);
    writer.putTestRegReg("eax", "eax");
    writer.putJccShortLabel("je", "restore_registers", "no-hint");
    writer.putMovRegOffsetPtrReg("ebp", 7 * 4, "eax");
    writer.putLabel("restore_registers");
    writer.putBytes(fxrstor);
    writer.putMovRegReg("esp", "ebp");
    writer.putPopax();
    writer.putJccShortLabel("jne", "invoke_replacement", "no-hint");
    do {
      offset = relocator.readOne();
    } while (offset < redirectSize && !relocator.eoi);
    relocator.writeAll();
    if (!relocator.eoi) {
      writer.putJmpAddress(target.add(offset));
    }
    writer.putLabel("invoke_replacement");
    writer.putJmpRegOffsetPtr("eax", artMethodOffsets.quickCode);
    writer.flush();
  });
  return offset;
}
function writeArtQuickCodeReplacementTrampolineX64(trampoline, target, redirectSize, constraints, vm3) {
  const threadOffsets = getArtThreadSpec(vm3).offset;
  const artMethodOffsets = getArtMethodSpec(vm3).offset;
  let offset;
  Memory.patchCode(trampoline, 256, (code4) => {
    const writer = new X86Writer(code4, { pc: trampoline });
    const relocator = new X86Relocator(target, writer);
    const fxsave = [15, 174, 4, 36];
    const fxrstor = [15, 174, 12, 36];
    writer.putPushax();
    writer.putMovRegReg("rbp", "rsp");
    writer.putAndRegU32("rsp", 4294967280);
    writer.putSubRegImm("rsp", 512);
    writer.putBytes(fxsave);
    writer.putMovRegGsU32Ptr("rbx", threadOffsets.self);
    writer.putCallAddressWithAlignedArguments(artController.replacedMethods.findReplacementFromQuickCode, ["rdi", "rbx"]);
    writer.putTestRegReg("rax", "rax");
    writer.putJccShortLabel("je", "restore_registers", "no-hint");
    writer.putMovRegOffsetPtrReg("rbp", 8 * 8, "rax");
    writer.putLabel("restore_registers");
    writer.putBytes(fxrstor);
    writer.putMovRegReg("rsp", "rbp");
    writer.putPopax();
    writer.putJccShortLabel("jne", "invoke_replacement", "no-hint");
    do {
      offset = relocator.readOne();
    } while (offset < redirectSize && !relocator.eoi);
    relocator.writeAll();
    if (!relocator.eoi) {
      writer.putJmpAddress(target.add(offset));
    }
    writer.putLabel("invoke_replacement");
    writer.putJmpRegOffsetPtr("rdi", artMethodOffsets.quickCode);
    writer.flush();
  });
  return offset;
}
function writeArtQuickCodeReplacementTrampolineArm(trampoline, target, redirectSize, constraints, vm3) {
  const artMethodOffsets = getArtMethodSpec(vm3).offset;
  const targetAddress = target.and(THUMB_BIT_REMOVAL_MASK);
  let offset;
  Memory.patchCode(trampoline, 128, (code4) => {
    const writer = new ThumbWriter(code4, { pc: trampoline });
    const relocator = new ThumbRelocator(targetAddress, writer);
    const vpushFpRegs = [45, 237, 16, 10];
    const vpopFpRegs = [189, 236, 16, 10];
    writer.putPushRegs([
      "r1",
      "r2",
      "r3",
      "r5",
      "r6",
      "r7",
      "r8",
      "r10",
      "r11",
      "lr"
    ]);
    writer.putBytes(vpushFpRegs);
    writer.putSubRegRegImm("sp", "sp", 8);
    writer.putStrRegRegOffset("r0", "sp", 0);
    writer.putCallAddressWithArguments(artController.replacedMethods.findReplacementFromQuickCode, ["r0", "r9"]);
    writer.putCmpRegImm("r0", 0);
    writer.putBCondLabel("eq", "restore_registers");
    writer.putStrRegRegOffset("r0", "sp", 0);
    writer.putLabel("restore_registers");
    writer.putLdrRegRegOffset("r0", "sp", 0);
    writer.putAddRegRegImm("sp", "sp", 8);
    writer.putBytes(vpopFpRegs);
    writer.putPopRegs([
      "lr",
      "r11",
      "r10",
      "r8",
      "r7",
      "r6",
      "r5",
      "r3",
      "r2",
      "r1"
    ]);
    writer.putBCondLabel("ne", "invoke_replacement");
    do {
      offset = relocator.readOne();
    } while (offset < redirectSize && !relocator.eoi);
    relocator.writeAll();
    if (!relocator.eoi) {
      writer.putLdrRegAddress("pc", target.add(offset));
    }
    writer.putLabel("invoke_replacement");
    writer.putLdrRegRegOffset("pc", "r0", artMethodOffsets.quickCode);
    writer.flush();
  });
  return offset;
}
function writeArtQuickCodeReplacementTrampolineArm64(trampoline, target, redirectSize, { availableScratchRegs }, vm3) {
  const artMethodOffsets = getArtMethodSpec(vm3).offset;
  let offset;
  Memory.patchCode(trampoline, 256, (code4) => {
    const writer = new Arm64Writer(code4, { pc: trampoline });
    const relocator = new Arm64Relocator(target, writer);
    writer.putPushRegReg("d0", "d1");
    writer.putPushRegReg("d2", "d3");
    writer.putPushRegReg("d4", "d5");
    writer.putPushRegReg("d6", "d7");
    writer.putPushRegReg("x1", "x2");
    writer.putPushRegReg("x3", "x4");
    writer.putPushRegReg("x5", "x6");
    writer.putPushRegReg("x7", "x20");
    writer.putPushRegReg("x21", "x22");
    writer.putPushRegReg("x23", "x24");
    writer.putPushRegReg("x25", "x26");
    writer.putPushRegReg("x27", "x28");
    writer.putPushRegReg("x29", "lr");
    writer.putSubRegRegImm("sp", "sp", 16);
    writer.putStrRegRegOffset("x0", "sp", 0);
    writer.putCallAddressWithArguments(artController.replacedMethods.findReplacementFromQuickCode, ["x0", "x19"]);
    writer.putCmpRegReg("x0", "xzr");
    writer.putBCondLabel("eq", "restore_registers");
    writer.putStrRegRegOffset("x0", "sp", 0);
    writer.putLabel("restore_registers");
    writer.putLdrRegRegOffset("x0", "sp", 0);
    writer.putAddRegRegImm("sp", "sp", 16);
    writer.putPopRegReg("x29", "lr");
    writer.putPopRegReg("x27", "x28");
    writer.putPopRegReg("x25", "x26");
    writer.putPopRegReg("x23", "x24");
    writer.putPopRegReg("x21", "x22");
    writer.putPopRegReg("x7", "x20");
    writer.putPopRegReg("x5", "x6");
    writer.putPopRegReg("x3", "x4");
    writer.putPopRegReg("x1", "x2");
    writer.putPopRegReg("d6", "d7");
    writer.putPopRegReg("d4", "d5");
    writer.putPopRegReg("d2", "d3");
    writer.putPopRegReg("d0", "d1");
    writer.putBCondLabel("ne", "invoke_replacement");
    do {
      offset = relocator.readOne();
    } while (offset < redirectSize && !relocator.eoi);
    relocator.writeAll();
    if (!relocator.eoi) {
      const scratchReg = Array.from(availableScratchRegs)[0];
      writer.putLdrRegAddress(scratchReg, target.add(offset));
      writer.putBrReg(scratchReg);
    }
    writer.putLabel("invoke_replacement");
    writer.putLdrRegRegOffset("x16", "x0", artMethodOffsets.quickCode);
    writer.putBrReg("x16");
    writer.flush();
  });
  return offset;
}
var artQuickCodePrologueWriters = {
  ia32: writeArtQuickCodePrologueX86,
  x64: writeArtQuickCodePrologueX86,
  arm: writeArtQuickCodePrologueArm,
  arm64: writeArtQuickCodePrologueArm64
};
function writeArtQuickCodePrologueX86(target, trampoline, redirectSize) {
  Memory.patchCode(target, 16, (code4) => {
    const writer = new X86Writer(code4, { pc: target });
    writer.putJmpAddress(trampoline);
    writer.flush();
  });
}
function writeArtQuickCodePrologueArm(target, trampoline, redirectSize) {
  const targetAddress = target.and(THUMB_BIT_REMOVAL_MASK);
  Memory.patchCode(targetAddress, 16, (code4) => {
    const writer = new ThumbWriter(code4, { pc: targetAddress });
    writer.putLdrRegAddress("pc", trampoline.or(1));
    writer.flush();
  });
}
function writeArtQuickCodePrologueArm64(target, trampoline, redirectSize) {
  Memory.patchCode(target, 16, (code4) => {
    const writer = new Arm64Writer(code4, { pc: target });
    if (redirectSize === 16) {
      writer.putLdrRegAddress("x16", trampoline);
    } else {
      writer.putAdrpRegAddress("x16", trampoline);
    }
    writer.putBrReg("x16");
    writer.flush();
  });
}
var artQuickCodeHookRedirectSize = {
  ia32: 5,
  x64: 16,
  arm: 8,
  arm64: 16
};
var ArtQuickCodeInterceptor = class {
  constructor(quickCode) {
    this.quickCode = quickCode;
    this.quickCodeAddress = Process.arch === "arm" ? quickCode.and(THUMB_BIT_REMOVAL_MASK) : quickCode;
    this.redirectSize = 0;
    this.trampoline = null;
    this.overwrittenPrologue = null;
    this.overwrittenPrologueLength = 0;
  }
  _canRelocateCode(relocationSize, constraints) {
    const Writer = thunkWriters[Process.arch];
    const Relocator = thunkRelocators[Process.arch];
    const { quickCodeAddress } = this;
    const writer = new Writer(quickCodeAddress);
    const relocator = new Relocator(quickCodeAddress, writer);
    let offset;
    if (Process.arch === "arm64") {
      let availableScratchRegs = /* @__PURE__ */ new Set(["x16", "x17"]);
      do {
        const nextOffset = relocator.readOne();
        const nextScratchRegs = new Set(availableScratchRegs);
        const { read: read2, written } = relocator.input.regsAccessed;
        for (const regs of [read2, written]) {
          for (const reg of regs) {
            let name;
            if (reg.startsWith("w")) {
              name = "x" + reg.substring(1);
            } else {
              name = reg;
            }
            nextScratchRegs.delete(name);
          }
        }
        if (nextScratchRegs.size === 0) {
          break;
        }
        offset = nextOffset;
        availableScratchRegs = nextScratchRegs;
      } while (offset < relocationSize && !relocator.eoi);
      constraints.availableScratchRegs = availableScratchRegs;
    } else {
      do {
        offset = relocator.readOne();
      } while (offset < relocationSize && !relocator.eoi);
    }
    return offset >= relocationSize;
  }
  _allocateTrampoline() {
    if (trampolineAllocator === null) {
      const trampolineSize = pointerSize7 === 4 ? 128 : 256;
      trampolineAllocator = makeAllocator(trampolineSize);
    }
    const maxRedirectSize = artQuickCodeHookRedirectSize[Process.arch];
    let redirectSize, spec;
    let alignment = 1;
    const constraints = {};
    if (pointerSize7 === 4 || this._canRelocateCode(maxRedirectSize, constraints)) {
      redirectSize = maxRedirectSize;
      spec = {};
    } else {
      let maxDistance;
      if (Process.arch === "x64") {
        redirectSize = 5;
        maxDistance = X86_JMP_MAX_DISTANCE;
      } else if (Process.arch === "arm64") {
        redirectSize = 8;
        maxDistance = ARM64_ADRP_MAX_DISTANCE;
        alignment = 4096;
      }
      spec = { near: this.quickCodeAddress, maxDistance };
    }
    this.redirectSize = redirectSize;
    this.trampoline = trampolineAllocator.allocateSlice(spec, alignment);
    return constraints;
  }
  _destroyTrampoline() {
    trampolineAllocator.freeSlice(this.trampoline);
  }
  activate(vm3) {
    const constraints = this._allocateTrampoline();
    const { trampoline, quickCode, redirectSize } = this;
    const writeTrampoline = artQuickCodeReplacementTrampolineWriters[Process.arch];
    const prologueLength = writeTrampoline(trampoline, quickCode, redirectSize, constraints, vm3);
    this.overwrittenPrologueLength = prologueLength;
    this.overwrittenPrologue = Memory.dup(this.quickCodeAddress, prologueLength);
    const writePrologue = artQuickCodePrologueWriters[Process.arch];
    writePrologue(quickCode, trampoline, redirectSize);
  }
  deactivate() {
    const { quickCodeAddress, overwrittenPrologueLength: prologueLength } = this;
    const Writer = thunkWriters[Process.arch];
    Memory.patchCode(quickCodeAddress, prologueLength, (code4) => {
      const writer = new Writer(code4, { pc: quickCodeAddress });
      const { overwrittenPrologue } = this;
      writer.putBytes(overwrittenPrologue.readByteArray(prologueLength));
      writer.flush();
    });
    this._destroyTrampoline();
  }
};
function isArtQuickEntrypoint(address) {
  const api3 = getApi2();
  const { module: m2, artClassLinker } = api3;
  return address.equals(artClassLinker.quickGenericJniTrampoline) || address.equals(artClassLinker.quickToInterpreterBridgeTrampoline) || address.equals(artClassLinker.quickResolutionTrampoline) || address.equals(artClassLinker.quickImtConflictTrampoline) || address.compare(m2.base) >= 0 && address.compare(m2.base.add(m2.size)) < 0;
}
var ArtMethodMangler = class {
  constructor(opaqueMethodId) {
    const methodId = unwrapMethodId(opaqueMethodId);
    this.methodId = methodId;
    this.originalMethod = null;
    this.hookedMethodId = methodId;
    this.replacementMethodId = null;
    this.interceptor = null;
  }
  replace(impl, isInstanceMethod, argTypes2, vm3, api3) {
    const { kAccCompileDontBother, artNterpEntryPoint } = api3;
    this.originalMethod = fetchArtMethod(this.methodId, vm3);
    const originalFlags = this.originalMethod.accessFlags;
    if ((originalFlags & kAccXposedHookedMethod) !== 0 && xposedIsSupported()) {
      const hookInfo = this.originalMethod.jniCode;
      this.hookedMethodId = hookInfo.add(2 * pointerSize7).readPointer();
      this.originalMethod = fetchArtMethod(this.hookedMethodId, vm3);
    }
    const { hookedMethodId } = this;
    const replacementMethodId = cloneArtMethod(hookedMethodId, vm3);
    this.replacementMethodId = replacementMethodId;
    patchArtMethod(replacementMethodId, {
      jniCode: impl,
      accessFlags: (originalFlags & ~(kAccCriticalNative | kAccFastNative | kAccNterpEntryPointFastPathFlag) | kAccNative | kAccCompileDontBother) >>> 0,
      quickCode: api3.artClassLinker.quickGenericJniTrampoline,
      interpreterCode: api3.artInterpreterToCompiledCodeBridge
    }, vm3);
    let hookedMethodRemovedFlags = kAccFastInterpreterToInterpreterInvoke | kAccSingleImplementation | kAccNterpEntryPointFastPathFlag;
    if ((originalFlags & kAccNative) === 0) {
      hookedMethodRemovedFlags |= kAccSkipAccessChecks;
    }
    patchArtMethod(hookedMethodId, {
      accessFlags: (originalFlags & ~hookedMethodRemovedFlags | kAccCompileDontBother) >>> 0
    }, vm3);
    const quickCode = this.originalMethod.quickCode;
    if (artNterpEntryPoint !== null && quickCode.equals(artNterpEntryPoint)) {
      patchArtMethod(hookedMethodId, {
        quickCode: api3.artQuickToInterpreterBridge
      }, vm3);
    }
    if (!isArtQuickEntrypoint(quickCode)) {
      const interceptor = new ArtQuickCodeInterceptor(quickCode);
      interceptor.activate(vm3);
      this.interceptor = interceptor;
    }
    artController.replacedMethods.set(hookedMethodId, replacementMethodId);
    notifyArtMethodHooked(hookedMethodId, vm3);
  }
  revert(vm3) {
    const { hookedMethodId, interceptor } = this;
    patchArtMethod(hookedMethodId, this.originalMethod, vm3);
    artController.replacedMethods.delete(hookedMethodId);
    if (interceptor !== null) {
      interceptor.deactivate();
      this.interceptor = null;
    }
  }
  resolveTarget(wrapper, isInstanceMethod, env, api3) {
    return this.hookedMethodId;
  }
};
function xposedIsSupported() {
  return getAndroidApiLevel() < 28;
}
function fetchArtMethod(methodId, vm3) {
  const artMethodSpec = getArtMethodSpec(vm3);
  const artMethodOffset = artMethodSpec.offset;
  return ["jniCode", "accessFlags", "quickCode", "interpreterCode"].reduce((original, name) => {
    const offset = artMethodOffset[name];
    if (offset === void 0) {
      return original;
    }
    const address = methodId.add(offset);
    const read2 = name === "accessFlags" ? readU32 : readPointer;
    original[name] = read2.call(address);
    return original;
  }, {});
}
function patchArtMethod(methodId, patches, vm3) {
  const artMethodSpec = getArtMethodSpec(vm3);
  const artMethodOffset = artMethodSpec.offset;
  Object.keys(patches).forEach((name) => {
    const offset = artMethodOffset[name];
    if (offset === void 0) {
      return;
    }
    const address = methodId.add(offset);
    const write3 = name === "accessFlags" ? writeU32 : writePointer;
    write3.call(address, patches[name]);
  });
}
var DalvikMethodMangler = class {
  constructor(methodId) {
    this.methodId = methodId;
    this.originalMethod = null;
  }
  replace(impl, isInstanceMethod, argTypes2, vm3, api3) {
    const { methodId } = this;
    this.originalMethod = Memory.dup(methodId, DVM_METHOD_SIZE);
    let argsSize = argTypes2.reduce((acc, t) => acc + t.size, 0);
    if (isInstanceMethod) {
      argsSize++;
    }
    const accessFlags = (methodId.add(DVM_METHOD_OFFSET_ACCESS_FLAGS).readU32() | kAccNative) >>> 0;
    const registersSize = argsSize;
    const outsSize = 0;
    const insSize = argsSize;
    methodId.add(DVM_METHOD_OFFSET_ACCESS_FLAGS).writeU32(accessFlags);
    methodId.add(DVM_METHOD_OFFSET_REGISTERS_SIZE).writeU16(registersSize);
    methodId.add(DVM_METHOD_OFFSET_OUTS_SIZE).writeU16(outsSize);
    methodId.add(DVM_METHOD_OFFSET_INS_SIZE).writeU16(insSize);
    methodId.add(DVM_METHOD_OFFSET_JNI_ARG_INFO).writeU32(computeDalvikJniArgInfo(methodId));
    api3.dvmUseJNIBridge(methodId, impl);
  }
  revert(vm3) {
    Memory.copy(this.methodId, this.originalMethod, DVM_METHOD_SIZE);
  }
  resolveTarget(wrapper, isInstanceMethod, env, api3) {
    const thread = env.handle.add(DVM_JNI_ENV_OFFSET_SELF).readPointer();
    let objectPtr;
    if (isInstanceMethod) {
      objectPtr = api3.dvmDecodeIndirectRef(thread, wrapper.$h);
    } else {
      const h = wrapper.$borrowClassHandle(env);
      objectPtr = api3.dvmDecodeIndirectRef(thread, h.value);
      h.unref(env);
    }
    let classObject;
    if (isInstanceMethod) {
      classObject = objectPtr.add(DVM_OBJECT_OFFSET_CLAZZ).readPointer();
    } else {
      classObject = objectPtr;
    }
    const classKey = classObject.toString(16);
    let entry = patchedClasses.get(classKey);
    if (entry === void 0) {
      const vtablePtr = classObject.add(DVM_CLASS_OBJECT_OFFSET_VTABLE);
      const vtableCountPtr = classObject.add(DVM_CLASS_OBJECT_OFFSET_VTABLE_COUNT);
      const vtable2 = vtablePtr.readPointer();
      const vtableCount = vtableCountPtr.readS32();
      const vtableSize = vtableCount * pointerSize7;
      const shadowVtable = Memory.alloc(2 * vtableSize);
      Memory.copy(shadowVtable, vtable2, vtableSize);
      vtablePtr.writePointer(shadowVtable);
      entry = {
        classObject,
        vtablePtr,
        vtableCountPtr,
        vtable: vtable2,
        vtableCount,
        shadowVtable,
        shadowVtableCount: vtableCount,
        targetMethods: /* @__PURE__ */ new Map()
      };
      patchedClasses.set(classKey, entry);
    }
    const methodKey = this.methodId.toString(16);
    let targetMethod = entry.targetMethods.get(methodKey);
    if (targetMethod === void 0) {
      targetMethod = Memory.dup(this.originalMethod, DVM_METHOD_SIZE);
      const methodIndex = entry.shadowVtableCount++;
      entry.shadowVtable.add(methodIndex * pointerSize7).writePointer(targetMethod);
      targetMethod.add(DVM_METHOD_OFFSET_METHOD_INDEX).writeU16(methodIndex);
      entry.vtableCountPtr.writeS32(entry.shadowVtableCount);
      entry.targetMethods.set(methodKey, targetMethod);
    }
    return targetMethod;
  }
};
function computeDalvikJniArgInfo(methodId) {
  if (Process.arch !== "ia32") {
    return DALVIK_JNI_NO_ARG_INFO;
  }
  const shorty = methodId.add(DVM_METHOD_OFFSET_SHORTY).readPointer().readCString();
  if (shorty === null || shorty.length === 0 || shorty.length > 65535) {
    return DALVIK_JNI_NO_ARG_INFO;
  }
  let returnType;
  switch (shorty[0]) {
    case "V":
      returnType = DALVIK_JNI_RETURN_VOID;
      break;
    case "F":
      returnType = DALVIK_JNI_RETURN_FLOAT;
      break;
    case "D":
      returnType = DALVIK_JNI_RETURN_DOUBLE;
      break;
    case "J":
      returnType = DALVIK_JNI_RETURN_S8;
      break;
    case "Z":
    case "B":
      returnType = DALVIK_JNI_RETURN_S1;
      break;
    case "C":
      returnType = DALVIK_JNI_RETURN_U2;
      break;
    case "S":
      returnType = DALVIK_JNI_RETURN_S2;
      break;
    default:
      returnType = DALVIK_JNI_RETURN_S4;
      break;
  }
  let hints = 0;
  for (let i = shorty.length - 1; i > 0; i--) {
    const ch = shorty[i];
    hints += ch === "D" || ch === "J" ? 2 : 1;
  }
  return returnType << DALVIK_JNI_RETURN_SHIFT | hints;
}
function cloneArtMethod(method2, vm3) {
  const api3 = getApi2();
  if (getAndroidApiLevel() < 23) {
    const thread = api3["art::Thread::CurrentFromGdb"]();
    return api3["art::mirror::Object::Clone"](method2, thread);
  }
  return Memory.dup(method2, getArtMethodSpec(vm3).size);
}
function deoptimizeMethod(vm3, env, method2) {
  requestDeoptimization(vm3, env, kSelectiveDeoptimization, method2);
}
function deoptimizeEverything(vm3, env) {
  requestDeoptimization(vm3, env, kFullDeoptimization);
}
function deoptimizeBootImage(vm3, env) {
  const api3 = getApi2();
  if (getAndroidApiLevel() < 26) {
    throw new Error("This API is only available on Android >= 8.0");
  }
  withRunnableArtThread(vm3, env, (thread) => {
    api3["art::Runtime::DeoptimizeBootImage"](api3.artRuntime);
  });
}
function requestDeoptimization(vm3, env, kind, method2) {
  const api3 = getApi2();
  if (getAndroidApiLevel() < 24) {
    throw new Error("This API is only available on Android >= 7.0");
  }
  withRunnableArtThread(vm3, env, (thread) => {
    if (getAndroidApiLevel() < 30) {
      if (!api3.isJdwpStarted()) {
        const session = startJdwp(api3);
        jdwpSessions.push(session);
      }
      if (!api3.isDebuggerActive()) {
        api3["art::Dbg::GoActive"]();
      }
      const request = Memory.alloc(8 + pointerSize7);
      request.writeU32(kind);
      switch (kind) {
        case kFullDeoptimization:
          break;
        case kSelectiveDeoptimization:
          request.add(8).writePointer(method2);
          break;
        default:
          throw new Error("Unsupported deoptimization kind");
      }
      api3["art::Dbg::RequestDeoptimization"](request);
      api3["art::Dbg::ManageDeoptimization"]();
    } else {
      const instrumentation = api3.artInstrumentation;
      if (instrumentation === null) {
        throw new Error("Unable to find Instrumentation class in ART; please file a bug");
      }
      const enableDeopt = api3["art::Instrumentation::EnableDeoptimization"];
      if (enableDeopt !== void 0) {
        const deoptimizationEnabled = !!instrumentation.add(getArtInstrumentationSpec().offset.deoptimizationEnabled).readU8();
        if (!deoptimizationEnabled) {
          enableDeopt(instrumentation);
        }
      }
      switch (kind) {
        case kFullDeoptimization:
          api3["art::Instrumentation::DeoptimizeEverything"](instrumentation, Memory.allocUtf8String("frida"));
          break;
        case kSelectiveDeoptimization:
          api3["art::Instrumentation::Deoptimize"](instrumentation, method2);
          break;
        default:
          throw new Error("Unsupported deoptimization kind");
      }
    }
  });
}
var JdwpSession = class {
  constructor() {
    const libart = Process.getModuleByName("libart.so");
    const acceptImpl = libart.getExportByName("_ZN3art4JDWP12JdwpAdbState6AcceptEv");
    const receiveClientFdImpl = libart.getExportByName("_ZN3art4JDWP12JdwpAdbState15ReceiveClientFdEv");
    const controlPair = makeSocketPair();
    const clientPair = makeSocketPair();
    this._controlFd = controlPair[0];
    this._clientFd = clientPair[0];
    let acceptListener = null;
    acceptListener = Interceptor.attach(acceptImpl, function(args) {
      const state = args[0];
      const controlSockPtr = Memory.scanSync(state.add(8252), 256, "00 ff ff ff ff 00")[0].address.add(1);
      controlSockPtr.writeS32(controlPair[1]);
      acceptListener.detach();
    });
    Interceptor.replace(receiveClientFdImpl, new NativeCallback(function(state) {
      Interceptor.revert(receiveClientFdImpl);
      return clientPair[1];
    }, "int", ["pointer"]));
    Interceptor.flush();
    this._handshakeRequest = this._performHandshake();
  }
  async _performHandshake() {
    const input = new UnixInputStream(this._clientFd, { autoClose: false });
    const output = new UnixOutputStream(this._clientFd, { autoClose: false });
    const handshakePacket = [74, 68, 87, 80, 45, 72, 97, 110, 100, 115, 104, 97, 107, 101];
    try {
      await output.writeAll(handshakePacket);
      await input.readAll(handshakePacket.length);
    } catch (e) {
    }
  }
};
function startJdwp(api3) {
  const session = new JdwpSession();
  api3["art::Dbg::SetJdwpAllowed"](1);
  const options = makeJdwpOptions();
  api3["art::Dbg::ConfigureJdwp"](options);
  const startDebugger = api3["art::InternalDebuggerControlCallback::StartDebugger"];
  if (startDebugger !== void 0) {
    startDebugger(NULL);
  } else {
    api3["art::Dbg::StartJdwp"]();
  }
  return session;
}
function makeJdwpOptions() {
  const kJdwpTransportAndroidAdb = getAndroidApiLevel() < 28 ? 2 : 3;
  const kJdwpPortFirstAvailable = 0;
  const transport = kJdwpTransportAndroidAdb;
  const server = true;
  const suspend = false;
  const port = kJdwpPortFirstAvailable;
  const size = 8 + STD_STRING_SIZE + 2;
  const result = Memory.alloc(size);
  result.writeU32(transport).add(4).writeU8(server ? 1 : 0).add(1).writeU8(suspend ? 1 : 0).add(1).add(STD_STRING_SIZE).writeU16(port);
  return result;
}
function makeSocketPair() {
  if (socketpair === null) {
    socketpair = new NativeFunction(
      Process.getModuleByName("libc.so").getExportByName("socketpair"),
      "int",
      ["int", "int", "int", "pointer"]
    );
  }
  const buf = Memory.alloc(8);
  if (socketpair(AF_UNIX, SOCK_STREAM, 0, buf) === -1) {
    throw new Error("Unable to create socketpair for JDWP");
  }
  return [
    buf.readS32(),
    buf.add(4).readS32()
  ];
}
function makeAddGlobalRefFallbackForAndroid5(api3) {
  const offset = getArtVMSpec().offset;
  const lock = api3.vm.add(offset.globalsLock);
  const table = api3.vm.add(offset.globals);
  const add = api3["art::IndirectReferenceTable::Add"];
  const acquire = api3["art::ReaderWriterMutex::ExclusiveLock"];
  const release = api3["art::ReaderWriterMutex::ExclusiveUnlock"];
  const IRT_FIRST_SEGMENT = 0;
  return function(vm3, thread, obj) {
    acquire(lock, thread);
    try {
      return add(table, IRT_FIRST_SEGMENT, obj);
    } finally {
      release(lock, thread);
    }
  };
}
function makeDecodeGlobalFallback(api3) {
  const decode = api3["art::Thread::DecodeJObject"];
  if (decode === void 0) {
    throw new Error("art::Thread::DecodeJObject is not available; please file a bug");
  }
  return function(vm3, thread, ref) {
    return decode(thread, ref);
  };
}
var threadStateTransitionRecompilers = {
  ia32: recompileExceptionClearForX86,
  x64: recompileExceptionClearForX86,
  arm: recompileExceptionClearForArm,
  arm64: recompileExceptionClearForArm64
};
function makeArtThreadStateTransitionImpl(vm3, env, callback) {
  const api3 = getApi2();
  const envVtable = env.handle.readPointer();
  let exceptionClearImpl;
  const innerExceptionClearImpl = api3.find("_ZN3art3JNIILb1EE14ExceptionClearEP7_JNIEnv");
  if (innerExceptionClearImpl !== null) {
    exceptionClearImpl = innerExceptionClearImpl;
  } else {
    exceptionClearImpl = envVtable.add(ENV_VTABLE_OFFSET_EXCEPTION_CLEAR).readPointer();
  }
  let nextFuncImpl;
  const innerNextFuncImpl = api3.find("_ZN3art3JNIILb1EE10FatalErrorEP7_JNIEnvPKc");
  if (innerNextFuncImpl !== null) {
    nextFuncImpl = innerNextFuncImpl;
  } else {
    nextFuncImpl = envVtable.add(ENV_VTABLE_OFFSET_FATAL_ERROR).readPointer();
  }
  const recompile = threadStateTransitionRecompilers[Process.arch];
  if (recompile === void 0) {
    throw new Error("Not yet implemented for " + Process.arch);
  }
  let perform = null;
  const threadOffsets = getArtThreadSpec(vm3).offset;
  const exceptionOffset = threadOffsets.exception;
  const neuteredOffsets = /* @__PURE__ */ new Set();
  const isReportedOffset = threadOffsets.isExceptionReportedToInstrumentation;
  if (isReportedOffset !== null) {
    neuteredOffsets.add(isReportedOffset);
  }
  const throwLocationStartOffset = threadOffsets.throwLocation;
  if (throwLocationStartOffset !== null) {
    neuteredOffsets.add(throwLocationStartOffset);
    neuteredOffsets.add(throwLocationStartOffset + pointerSize7);
    neuteredOffsets.add(throwLocationStartOffset + 2 * pointerSize7);
  }
  const codeSize = 65536;
  const code4 = Memory.alloc(codeSize);
  Memory.patchCode(code4, codeSize, (buffer) => {
    perform = recompile(buffer, code4, exceptionClearImpl, nextFuncImpl, exceptionOffset, neuteredOffsets, callback);
  });
  perform._code = code4;
  perform._callback = callback;
  return perform;
}
function recompileExceptionClearForX86(buffer, pc, exceptionClearImpl, nextFuncImpl, exceptionOffset, neuteredOffsets, callback) {
  const blocks = {};
  const branchTargets = /* @__PURE__ */ new Set();
  const pending = [exceptionClearImpl];
  while (pending.length > 0) {
    let current = pending.shift();
    const alreadyCovered = Object.values(blocks).some(({ begin, end }) => current.compare(begin) >= 0 && current.compare(end) < 0);
    if (alreadyCovered) {
      continue;
    }
    const blockAddressKey = current.toString();
    let block2 = {
      begin: current
    };
    let lastInsn = null;
    let reachedEndOfBlock = false;
    do {
      if (current.equals(nextFuncImpl)) {
        reachedEndOfBlock = true;
        break;
      }
      const insn = Instruction.parse(current);
      lastInsn = insn;
      const existingBlock = blocks[insn.address.toString()];
      if (existingBlock !== void 0) {
        delete blocks[existingBlock.begin.toString()];
        blocks[blockAddressKey] = existingBlock;
        existingBlock.begin = block2.begin;
        block2 = null;
        break;
      }
      let branchTarget = null;
      switch (insn.mnemonic) {
        case "jmp":
          branchTarget = ptr(insn.operands[0].value);
          reachedEndOfBlock = true;
          break;
        case "je":
        case "jg":
        case "jle":
        case "jne":
        case "js":
          branchTarget = ptr(insn.operands[0].value);
          break;
        case "ret":
          reachedEndOfBlock = true;
          break;
      }
      if (branchTarget !== null) {
        branchTargets.add(branchTarget.toString());
        pending.push(branchTarget);
        pending.sort((a, b) => a.compare(b));
      }
      current = insn.next;
    } while (!reachedEndOfBlock);
    if (block2 !== null) {
      block2.end = lastInsn.address.add(lastInsn.size);
      blocks[blockAddressKey] = block2;
    }
  }
  const blocksOrdered = Object.keys(blocks).map((key) => blocks[key]);
  blocksOrdered.sort((a, b) => a.begin.compare(b.begin));
  const entryBlock = blocks[exceptionClearImpl.toString()];
  blocksOrdered.splice(blocksOrdered.indexOf(entryBlock), 1);
  blocksOrdered.unshift(entryBlock);
  const writer = new X86Writer(buffer, { pc });
  let foundCore = false;
  let threadReg = null;
  blocksOrdered.forEach((block2) => {
    const size = block2.end.sub(block2.begin).toInt32();
    const relocator = new X86Relocator(block2.begin, writer);
    let offset;
    while ((offset = relocator.readOne()) !== 0) {
      const insn = relocator.input;
      const { mnemonic } = insn;
      const insnAddressId = insn.address.toString();
      if (branchTargets.has(insnAddressId)) {
        writer.putLabel(insnAddressId);
      }
      let keep = true;
      switch (mnemonic) {
        case "jmp":
          writer.putJmpNearLabel(branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "je":
        case "jg":
        case "jle":
        case "jne":
        case "js":
          writer.putJccNearLabel(mnemonic, branchLabelFromOperand(insn.operands[0]), "no-hint");
          keep = false;
          break;
        /*
         * JNI::ExceptionClear(), when checked JNI is off.
         */
        case "mov": {
          const [dst, src] = insn.operands;
          if (dst.type === "mem" && src.type === "imm") {
            const dstValue = dst.value;
            const dstOffset = dstValue.disp;
            if (dstOffset === exceptionOffset && src.value.valueOf() === 0) {
              threadReg = dstValue.base;
              writer.putPushfx();
              writer.putPushax();
              writer.putMovRegReg("xbp", "xsp");
              if (pointerSize7 === 4) {
                writer.putAndRegU32("esp", 4294967280);
              } else {
                const scratchReg = threadReg !== "rdi" ? "rdi" : "rsi";
                writer.putMovRegU64(scratchReg, uint64("0xfffffffffffffff0"));
                writer.putAndRegReg("rsp", scratchReg);
              }
              writer.putCallAddressWithAlignedArguments(callback, [threadReg]);
              writer.putMovRegReg("xsp", "xbp");
              writer.putPopax();
              writer.putPopfx();
              foundCore = true;
              keep = false;
            } else if (neuteredOffsets.has(dstOffset) && dstValue.base === threadReg) {
              keep = false;
            }
          }
          break;
        }
        /*
         * CheckJNI::ExceptionClear, when checked JNI is on. Wrapper that calls JNI::ExceptionClear().
         */
        case "call": {
          const target = insn.operands[0];
          if (target.type === "mem" && target.value.disp === ENV_VTABLE_OFFSET_EXCEPTION_CLEAR) {
            if (pointerSize7 === 4) {
              writer.putPopReg("eax");
              writer.putMovRegRegOffsetPtr("eax", "eax", 4);
              writer.putPushReg("eax");
            } else {
              writer.putMovRegRegOffsetPtr("rdi", "rdi", 8);
            }
            writer.putCallAddressWithArguments(callback, []);
            foundCore = true;
            keep = false;
          }
          break;
        }
      }
      if (keep) {
        relocator.writeAll();
      } else {
        relocator.skipOne();
      }
      if (offset === size) {
        break;
      }
    }
    relocator.dispose();
  });
  writer.dispose();
  if (!foundCore) {
    throwThreadStateTransitionParseError();
  }
  return new NativeFunction(pc, "void", ["pointer"], nativeFunctionOptions3);
}
function recompileExceptionClearForArm(buffer, pc, exceptionClearImpl, nextFuncImpl, exceptionOffset, neuteredOffsets, callback) {
  const blocks = {};
  const branchTargets = /* @__PURE__ */ new Set();
  const thumbBitRemovalMask = ptr(1).not();
  const pending = [exceptionClearImpl];
  while (pending.length > 0) {
    let current = pending.shift();
    const alreadyCovered = Object.values(blocks).some(({ begin: begin2, end }) => current.compare(begin2) >= 0 && current.compare(end) < 0);
    if (alreadyCovered) {
      continue;
    }
    const begin = current.and(thumbBitRemovalMask);
    const blockId = begin.toString();
    const thumbBit = current.and(1);
    let block2 = {
      begin
    };
    let lastInsn = null;
    let reachedEndOfBlock = false;
    let ifThenBlockRemaining = 0;
    do {
      if (current.equals(nextFuncImpl)) {
        reachedEndOfBlock = true;
        break;
      }
      const insn = Instruction.parse(current);
      const { mnemonic } = insn;
      lastInsn = insn;
      const currentAddress = current.and(thumbBitRemovalMask);
      const insnId = currentAddress.toString();
      const existingBlock = blocks[insnId];
      if (existingBlock !== void 0) {
        delete blocks[existingBlock.begin.toString()];
        blocks[blockId] = existingBlock;
        existingBlock.begin = block2.begin;
        block2 = null;
        break;
      }
      const isOutsideIfThenBlock = ifThenBlockRemaining === 0;
      let branchTarget = null;
      switch (mnemonic) {
        case "b":
          branchTarget = ptr(insn.operands[0].value);
          reachedEndOfBlock = isOutsideIfThenBlock;
          break;
        case "beq.w":
        case "beq":
        case "bne":
        case "bne.w":
        case "bgt":
          branchTarget = ptr(insn.operands[0].value);
          break;
        case "cbz":
        case "cbnz":
          branchTarget = ptr(insn.operands[1].value);
          break;
        case "pop.w":
          if (isOutsideIfThenBlock) {
            reachedEndOfBlock = insn.operands.filter((op) => op.value === "pc").length === 1;
          }
          break;
      }
      switch (mnemonic) {
        case "it":
          ifThenBlockRemaining = 1;
          break;
        case "itt":
          ifThenBlockRemaining = 2;
          break;
        case "ittt":
          ifThenBlockRemaining = 3;
          break;
        case "itttt":
          ifThenBlockRemaining = 4;
          break;
        default:
          if (ifThenBlockRemaining > 0) {
            ifThenBlockRemaining--;
          }
          break;
      }
      if (branchTarget !== null) {
        branchTargets.add(branchTarget.toString());
        pending.push(branchTarget.or(thumbBit));
        pending.sort((a, b) => a.compare(b));
      }
      current = insn.next;
    } while (!reachedEndOfBlock);
    if (block2 !== null) {
      block2.end = lastInsn.address.add(lastInsn.size);
      blocks[blockId] = block2;
    }
  }
  const blocksOrdered = Object.keys(blocks).map((key) => blocks[key]);
  blocksOrdered.sort((a, b) => a.begin.compare(b.begin));
  const entryBlock = blocks[exceptionClearImpl.and(thumbBitRemovalMask).toString()];
  blocksOrdered.splice(blocksOrdered.indexOf(entryBlock), 1);
  blocksOrdered.unshift(entryBlock);
  const writer = new ThumbWriter(buffer, { pc });
  let foundCore = false;
  let threadReg = null;
  let realImplReg = null;
  blocksOrdered.forEach((block2) => {
    const relocator = new ThumbRelocator(block2.begin, writer);
    let address = block2.begin;
    const end = block2.end;
    let size = 0;
    do {
      const offset = relocator.readOne();
      if (offset === 0) {
        throw new Error("Unexpected end of block");
      }
      const insn = relocator.input;
      address = insn.address;
      size = insn.size;
      const { mnemonic } = insn;
      const insnAddressId = address.toString();
      if (branchTargets.has(insnAddressId)) {
        writer.putLabel(insnAddressId);
      }
      let keep = true;
      switch (mnemonic) {
        case "b":
          writer.putBLabel(branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "beq.w":
          writer.putBCondLabelWide("eq", branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "bne.w":
          writer.putBCondLabelWide("ne", branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "beq":
        case "bne":
        case "bgt":
          writer.putBCondLabelWide(mnemonic.substr(1), branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "cbz": {
          const ops = insn.operands;
          writer.putCbzRegLabel(ops[0].value, branchLabelFromOperand(ops[1]));
          keep = false;
          break;
        }
        case "cbnz": {
          const ops = insn.operands;
          writer.putCbnzRegLabel(ops[0].value, branchLabelFromOperand(ops[1]));
          keep = false;
          break;
        }
        /*
         * JNI::ExceptionClear(), when checked JNI is off.
         */
        case "str":
        case "str.w": {
          const dstValue = insn.operands[1].value;
          const dstOffset = dstValue.disp;
          if (dstOffset === exceptionOffset) {
            threadReg = dstValue.base;
            const nzcvqReg = threadReg !== "r4" ? "r4" : "r5";
            const clobberedRegs = ["r0", "r1", "r2", "r3", nzcvqReg, "r9", "r12", "lr"];
            writer.putPushRegs(clobberedRegs);
            writer.putMrsRegReg(nzcvqReg, "apsr-nzcvq");
            writer.putCallAddressWithArguments(callback, [threadReg]);
            writer.putMsrRegReg("apsr-nzcvq", nzcvqReg);
            writer.putPopRegs(clobberedRegs);
            foundCore = true;
            keep = false;
          } else if (neuteredOffsets.has(dstOffset) && dstValue.base === threadReg) {
            keep = false;
          }
          break;
        }
        /*
         * CheckJNI::ExceptionClear, when checked JNI is on. Wrapper that calls JNI::ExceptionClear().
         */
        case "ldr": {
          const [dstOp, srcOp] = insn.operands;
          if (srcOp.type === "mem") {
            const src = srcOp.value;
            if (src.base[0] === "r" && src.disp === ENV_VTABLE_OFFSET_EXCEPTION_CLEAR) {
              realImplReg = dstOp.value;
            }
          }
          break;
        }
        case "blx":
          if (insn.operands[0].value === realImplReg) {
            writer.putLdrRegRegOffset("r0", "r0", 4);
            writer.putCallAddressWithArguments(callback, ["r0"]);
            foundCore = true;
            realImplReg = null;
            keep = false;
          }
          break;
      }
      if (keep) {
        relocator.writeAll();
      } else {
        relocator.skipOne();
      }
    } while (!address.add(size).equals(end));
    relocator.dispose();
  });
  writer.dispose();
  if (!foundCore) {
    throwThreadStateTransitionParseError();
  }
  return new NativeFunction(pc.or(1), "void", ["pointer"], nativeFunctionOptions3);
}
function recompileExceptionClearForArm64(buffer, pc, exceptionClearImpl, nextFuncImpl, exceptionOffset, neuteredOffsets, callback) {
  const blocks = {};
  const branchTargets = /* @__PURE__ */ new Set();
  const pending = [exceptionClearImpl];
  while (pending.length > 0) {
    let current = pending.shift();
    const alreadyCovered = Object.values(blocks).some(({ begin, end }) => current.compare(begin) >= 0 && current.compare(end) < 0);
    if (alreadyCovered) {
      continue;
    }
    const blockAddressKey = current.toString();
    let block2 = {
      begin: current
    };
    let lastInsn = null;
    let reachedEndOfBlock = false;
    do {
      if (current.equals(nextFuncImpl)) {
        reachedEndOfBlock = true;
        break;
      }
      let insn;
      try {
        insn = Instruction.parse(current);
      } catch (e) {
        if (current.readU32() === 0) {
          reachedEndOfBlock = true;
          break;
        } else {
          throw e;
        }
      }
      lastInsn = insn;
      const existingBlock = blocks[insn.address.toString()];
      if (existingBlock !== void 0) {
        delete blocks[existingBlock.begin.toString()];
        blocks[blockAddressKey] = existingBlock;
        existingBlock.begin = block2.begin;
        block2 = null;
        break;
      }
      let branchTarget = null;
      switch (insn.mnemonic) {
        case "b":
          branchTarget = ptr(insn.operands[0].value);
          reachedEndOfBlock = true;
          break;
        case "b.eq":
        case "b.ne":
        case "b.le":
        case "b.gt":
          branchTarget = ptr(insn.operands[0].value);
          break;
        case "cbz":
        case "cbnz":
          branchTarget = ptr(insn.operands[1].value);
          break;
        case "tbz":
        case "tbnz":
          branchTarget = ptr(insn.operands[2].value);
          break;
        case "ret":
          reachedEndOfBlock = true;
          break;
      }
      if (branchTarget !== null) {
        branchTargets.add(branchTarget.toString());
        pending.push(branchTarget);
        pending.sort((a, b) => a.compare(b));
      }
      current = insn.next;
    } while (!reachedEndOfBlock);
    if (block2 !== null) {
      block2.end = lastInsn.address.add(lastInsn.size);
      blocks[blockAddressKey] = block2;
    }
  }
  const blocksOrdered = Object.keys(blocks).map((key) => blocks[key]);
  blocksOrdered.sort((a, b) => a.begin.compare(b.begin));
  const entryBlock = blocks[exceptionClearImpl.toString()];
  blocksOrdered.splice(blocksOrdered.indexOf(entryBlock), 1);
  blocksOrdered.unshift(entryBlock);
  const writer = new Arm64Writer(buffer, { pc });
  writer.putBLabel("performTransition");
  const invokeCallback = pc.add(writer.offset);
  writer.putPushAllXRegisters();
  writer.putCallAddressWithArguments(callback, ["x0"]);
  writer.putPopAllXRegisters();
  writer.putRet();
  writer.putLabel("performTransition");
  let foundCore = false;
  let threadReg = null;
  let realImplReg = null;
  blocksOrdered.forEach((block2) => {
    const size = block2.end.sub(block2.begin).toInt32();
    const relocator = new Arm64Relocator(block2.begin, writer);
    let offset;
    while ((offset = relocator.readOne()) !== 0) {
      const insn = relocator.input;
      const { mnemonic } = insn;
      const insnAddressId = insn.address.toString();
      if (branchTargets.has(insnAddressId)) {
        writer.putLabel(insnAddressId);
      }
      let keep = true;
      switch (mnemonic) {
        case "b":
          writer.putBLabel(branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "b.eq":
        case "b.ne":
        case "b.le":
        case "b.gt":
          writer.putBCondLabel(mnemonic.substr(2), branchLabelFromOperand(insn.operands[0]));
          keep = false;
          break;
        case "cbz": {
          const ops = insn.operands;
          writer.putCbzRegLabel(ops[0].value, branchLabelFromOperand(ops[1]));
          keep = false;
          break;
        }
        case "cbnz": {
          const ops = insn.operands;
          writer.putCbnzRegLabel(ops[0].value, branchLabelFromOperand(ops[1]));
          keep = false;
          break;
        }
        case "tbz": {
          const ops = insn.operands;
          writer.putTbzRegImmLabel(ops[0].value, ops[1].value.valueOf(), branchLabelFromOperand(ops[2]));
          keep = false;
          break;
        }
        case "tbnz": {
          const ops = insn.operands;
          writer.putTbnzRegImmLabel(ops[0].value, ops[1].value.valueOf(), branchLabelFromOperand(ops[2]));
          keep = false;
          break;
        }
        /*
         * JNI::ExceptionClear(), when checked JNI is off.
         */
        case "str": {
          const ops = insn.operands;
          const srcReg = ops[0].value;
          const dstValue = ops[1].value;
          const dstOffset = dstValue.disp;
          if (srcReg === "xzr" && dstOffset === exceptionOffset) {
            threadReg = dstValue.base;
            writer.putPushRegReg("x0", "lr");
            writer.putMovRegReg("x0", threadReg);
            writer.putBlImm(invokeCallback);
            writer.putPopRegReg("x0", "lr");
            foundCore = true;
            keep = false;
          } else if (neuteredOffsets.has(dstOffset) && dstValue.base === threadReg) {
            keep = false;
          }
          break;
        }
        /*
         * CheckJNI::ExceptionClear, when checked JNI is on. Wrapper that calls JNI::ExceptionClear().
         */
        case "ldr": {
          const ops = insn.operands;
          const src = ops[1].value;
          if (src.base[0] === "x" && src.disp === ENV_VTABLE_OFFSET_EXCEPTION_CLEAR) {
            realImplReg = ops[0].value;
          }
          break;
        }
        case "blr":
          if (insn.operands[0].value === realImplReg) {
            writer.putLdrRegRegOffset("x0", "x0", 8);
            writer.putCallAddressWithArguments(callback, ["x0"]);
            foundCore = true;
            realImplReg = null;
            keep = false;
          }
          break;
      }
      if (keep) {
        relocator.writeAll();
      } else {
        relocator.skipOne();
      }
      if (offset === size) {
        break;
      }
    }
    relocator.dispose();
  });
  writer.dispose();
  if (!foundCore) {
    throwThreadStateTransitionParseError();
  }
  return new NativeFunction(pc, "void", ["pointer"], nativeFunctionOptions3);
}
function throwThreadStateTransitionParseError() {
  throw new Error("Unable to parse ART internals; please file a bug");
}
function fixupArtQuickDeliverExceptionBug(api3) {
  const prettyMethod = api3["art::ArtMethod::PrettyMethod"];
  if (prettyMethod === void 0) {
    return;
  }
  Interceptor.attach(prettyMethod.impl, artController.hooks.ArtMethod.prettyMethod);
  Interceptor.flush();
}
function branchLabelFromOperand(op) {
  return ptr(op.value).toString();
}
function makeCxxMethodWrapperReturningPointerByValueGeneric(address, argTypes2) {
  return new NativeFunction(address, "pointer", argTypes2, nativeFunctionOptions3);
}
function makeCxxMethodWrapperReturningPointerByValueInFirstArg(address, argTypes2) {
  const impl = new NativeFunction(address, "void", ["pointer"].concat(argTypes2), nativeFunctionOptions3);
  return function() {
    const resultPtr = Memory.alloc(pointerSize7);
    impl(resultPtr, ...arguments);
    return resultPtr.readPointer();
  };
}
function makeCxxMethodWrapperReturningStdStringByValue(impl, argTypes2) {
  const { arch } = Process;
  switch (arch) {
    case "ia32":
    case "arm64": {
      let thunk;
      if (arch === "ia32") {
        thunk = makeThunk(64, (writer) => {
          const argCount = 1 + argTypes2.length;
          const argvSize = argCount * 4;
          writer.putSubRegImm("esp", argvSize);
          for (let i = 0; i !== argCount; i++) {
            const offset = i * 4;
            writer.putMovRegRegOffsetPtr("eax", "esp", argvSize + 4 + offset);
            writer.putMovRegOffsetPtrReg("esp", offset, "eax");
          }
          writer.putCallAddress(impl);
          writer.putAddRegImm("esp", argvSize - 4);
          writer.putRet();
        });
      } else {
        thunk = makeThunk(32, (writer) => {
          writer.putMovRegReg("x8", "x0");
          argTypes2.forEach((t, i) => {
            writer.putMovRegReg("x" + i, "x" + (i + 1));
          });
          writer.putLdrRegAddress("x7", impl);
          writer.putBrReg("x7");
        });
      }
      const invokeThunk = new NativeFunction(thunk, "void", ["pointer"].concat(argTypes2), nativeFunctionOptions3);
      const wrapper = function(...args) {
        invokeThunk(...args);
      };
      wrapper.handle = thunk;
      wrapper.impl = impl;
      return wrapper;
    }
    default: {
      const result = new NativeFunction(impl, "void", ["pointer"].concat(argTypes2), nativeFunctionOptions3);
      result.impl = impl;
      return result;
    }
  }
}
var StdString = class {
  constructor() {
    this.handle = Memory.alloc(STD_STRING_SIZE);
  }
  dispose() {
    const [data, isTiny] = this._getData();
    if (!isTiny) {
      getApi2().$delete(data);
    }
  }
  disposeToString() {
    const result = this.toString();
    this.dispose();
    return result;
  }
  toString() {
    const [data] = this._getData();
    return data.readUtf8String();
  }
  _getData() {
    const str = this.handle;
    const isTiny = (str.readU8() & 1) === 0;
    const data = isTiny ? str.add(1) : str.add(2 * pointerSize7).readPointer();
    return [data, isTiny];
  }
};
var StdVector = class {
  $delete() {
    this.dispose();
    getApi2().$delete(this);
  }
  constructor(storage, elementSize) {
    this.handle = storage;
    this._begin = storage;
    this._end = storage.add(pointerSize7);
    this._storage = storage.add(2 * pointerSize7);
    this._elementSize = elementSize;
  }
  init() {
    this.begin = NULL;
    this.end = NULL;
    this.storage = NULL;
  }
  dispose() {
    getApi2().$delete(this.begin);
  }
  get begin() {
    return this._begin.readPointer();
  }
  set begin(value) {
    this._begin.writePointer(value);
  }
  get end() {
    return this._end.readPointer();
  }
  set end(value) {
    this._end.writePointer(value);
  }
  get storage() {
    return this._storage.readPointer();
  }
  set storage(value) {
    this._storage.writePointer(value);
  }
  get size() {
    return this.end.sub(this.begin).toInt32() / this._elementSize;
  }
};
var HandleVector = class _HandleVector extends StdVector {
  static $new() {
    const vector = new _HandleVector(getApi2().$new(STD_VECTOR_SIZE));
    vector.init();
    return vector;
  }
  constructor(storage) {
    super(storage, pointerSize7);
  }
  get handles() {
    const result = [];
    let cur = this.begin;
    const end = this.end;
    while (!cur.equals(end)) {
      result.push(cur.readPointer());
      cur = cur.add(pointerSize7);
    }
    return result;
  }
};
var BHS_OFFSET_LINK = 0;
var BHS_OFFSET_NUM_REFS = pointerSize7;
var BHS_SIZE = BHS_OFFSET_NUM_REFS + 4;
var kNumReferencesVariableSized = -1;
var BaseHandleScope = class _BaseHandleScope {
  $delete() {
    this.dispose();
    getApi2().$delete(this);
  }
  constructor(storage) {
    this.handle = storage;
    this._link = storage.add(BHS_OFFSET_LINK);
    this._numberOfReferences = storage.add(BHS_OFFSET_NUM_REFS);
  }
  init(link, numberOfReferences) {
    this.link = link;
    this.numberOfReferences = numberOfReferences;
  }
  dispose() {
  }
  get link() {
    return new _BaseHandleScope(this._link.readPointer());
  }
  set link(value) {
    this._link.writePointer(value);
  }
  get numberOfReferences() {
    return this._numberOfReferences.readS32();
  }
  set numberOfReferences(value) {
    this._numberOfReferences.writeS32(value);
  }
};
var VSHS_OFFSET_SELF = alignPointerOffset(BHS_SIZE);
var VSHS_OFFSET_CURRENT_SCOPE = VSHS_OFFSET_SELF + pointerSize7;
var VSHS_SIZE = VSHS_OFFSET_CURRENT_SCOPE + pointerSize7;
var VariableSizedHandleScope = class _VariableSizedHandleScope extends BaseHandleScope {
  static $new(thread, vm3) {
    const scope = new _VariableSizedHandleScope(getApi2().$new(VSHS_SIZE));
    scope.init(thread, vm3);
    return scope;
  }
  constructor(storage) {
    super(storage);
    this._self = storage.add(VSHS_OFFSET_SELF);
    this._currentScope = storage.add(VSHS_OFFSET_CURRENT_SCOPE);
    const kLocalScopeSize = 64;
    const kSizeOfReferencesPerScope = kLocalScopeSize - pointerSize7 - 4 - 4;
    const kNumReferencesPerScope = kSizeOfReferencesPerScope / 4;
    this._scopeLayout = FixedSizeHandleScope.layoutForCapacity(kNumReferencesPerScope);
    this._topHandleScopePtr = null;
  }
  init(thread, vm3) {
    const topHandleScopePtr = thread.add(getArtThreadSpec(vm3).offset.topHandleScope);
    this._topHandleScopePtr = topHandleScopePtr;
    super.init(topHandleScopePtr.readPointer(), kNumReferencesVariableSized);
    this.self = thread;
    this.currentScope = FixedSizeHandleScope.$new(this._scopeLayout);
    topHandleScopePtr.writePointer(this);
  }
  dispose() {
    this._topHandleScopePtr.writePointer(this.link);
    let scope;
    while ((scope = this.currentScope) !== null) {
      const next = scope.link;
      scope.$delete();
      this.currentScope = next;
    }
  }
  get self() {
    return this._self.readPointer();
  }
  set self(value) {
    this._self.writePointer(value);
  }
  get currentScope() {
    const storage = this._currentScope.readPointer();
    if (storage.isNull()) {
      return null;
    }
    return new FixedSizeHandleScope(storage, this._scopeLayout);
  }
  set currentScope(value) {
    this._currentScope.writePointer(value);
  }
  newHandle(object) {
    return this.currentScope.newHandle(object);
  }
};
var FixedSizeHandleScope = class _FixedSizeHandleScope extends BaseHandleScope {
  static $new(layout) {
    const scope = new _FixedSizeHandleScope(getApi2().$new(layout.size), layout);
    scope.init();
    return scope;
  }
  constructor(storage, layout) {
    super(storage);
    const { offset } = layout;
    this._refsStorage = storage.add(offset.refsStorage);
    this._pos = storage.add(offset.pos);
    this._layout = layout;
  }
  init() {
    super.init(NULL, this._layout.numberOfReferences);
    this.pos = 0;
  }
  get pos() {
    return this._pos.readU32();
  }
  set pos(value) {
    this._pos.writeU32(value);
  }
  newHandle(object) {
    const pos = this.pos;
    const handle2 = this._refsStorage.add(pos * 4);
    handle2.writeS32(object.toInt32());
    this.pos = pos + 1;
    return handle2;
  }
  static layoutForCapacity(numRefs) {
    const refsStorage = BHS_SIZE;
    const pos = refsStorage + numRefs * 4;
    return {
      size: pos + 4,
      numberOfReferences: numRefs,
      offset: {
        refsStorage,
        pos
      }
    };
  }
};
var objectVisitorPredicateFactories = {
  arm: function(needle, onMatch) {
    const size = Process.pageSize;
    const predicate = Memory.alloc(size);
    Memory.protect(predicate, size, "rwx");
    const onMatchCallback = new NativeCallback(onMatch, "void", ["pointer"]);
    predicate._onMatchCallback = onMatchCallback;
    const instructions = [
      26625,
      // ldr r1, [r0]
      18947,
      // ldr r2, =needle
      17041,
      // cmp r1, r2
      53505,
      // bne mismatch
      19202,
      // ldr r3, =onMatch
      18200,
      // bx r3
      18288,
      // bx lr
      48896
      // nop
    ];
    const needleOffset = instructions.length * 2;
    const onMatchOffset = needleOffset + 4;
    const codeSize = onMatchOffset + 4;
    Memory.patchCode(predicate, codeSize, function(address) {
      instructions.forEach((instruction, index) => {
        address.add(index * 2).writeU16(instruction);
      });
      address.add(needleOffset).writeS32(needle);
      address.add(onMatchOffset).writePointer(onMatchCallback);
    });
    return predicate.or(1);
  },
  arm64: function(needle, onMatch) {
    const size = Process.pageSize;
    const predicate = Memory.alloc(size);
    Memory.protect(predicate, size, "rwx");
    const onMatchCallback = new NativeCallback(onMatch, "void", ["pointer"]);
    predicate._onMatchCallback = onMatchCallback;
    const instructions = [
      3107979265,
      // ldr w1, [x0]
      402653378,
      // ldr w2, =needle
      1795293247,
      // cmp w1, w2
      1409286241,
      // b.ne mismatch
      1476395139,
      // ldr x3, =onMatch
      3592355936,
      // br x3
      3596551104
      // ret
    ];
    const needleOffset = instructions.length * 4;
    const onMatchOffset = needleOffset + 4;
    const codeSize = onMatchOffset + 8;
    Memory.patchCode(predicate, codeSize, function(address) {
      instructions.forEach((instruction, index) => {
        address.add(index * 4).writeU32(instruction);
      });
      address.add(needleOffset).writeS32(needle);
      address.add(onMatchOffset).writePointer(onMatchCallback);
    });
    return predicate;
  }
};
function makeObjectVisitorPredicate(needle, onMatch) {
  const factory = objectVisitorPredicateFactories[Process.arch] || makeGenericObjectVisitorPredicate;
  return factory(needle, onMatch);
}
function makeGenericObjectVisitorPredicate(needle, onMatch) {
  return new NativeCallback((object) => {
    const klass = object.readS32();
    if (klass === needle) {
      onMatch(object);
    }
  }, "void", ["pointer", "pointer"]);
}
function alignPointerOffset(offset) {
  const remainder = offset % pointerSize7;
  if (remainder !== 0) {
    return offset + pointerSize7 - remainder;
  }
  return offset;
}

// node_modules/frida-java-bridge/lib/jvm.js
var jsizeSize2 = 4;
var { pointerSize: pointerSize8 } = Process;
var JVM_ACC_NATIVE = 256;
var JVM_ACC_IS_OLD = 65536;
var JVM_ACC_IS_OBSOLETE = 131072;
var JVM_ACC_NOT_C2_COMPILABLE = 33554432;
var JVM_ACC_NOT_C1_COMPILABLE = 67108864;
var JVM_ACC_NOT_C2_OSR_COMPILABLE = 134217728;
var nativeFunctionOptions4 = {
  exceptions: "propagate"
};
var getJvmMethodSpec = memoize(_getJvmMethodSpec);
var getJvmInstanceKlassSpec = memoize(_getJvmInstanceKlassSpec);
var getJvmThreadSpec = memoize(_getJvmThreadSpec);
var cachedApi3 = null;
var manglersScheduled = false;
var replaceManglers = /* @__PURE__ */ new Map();
var revertManglers = /* @__PURE__ */ new Map();
function getApi3() {
  if (cachedApi3 === null) {
    cachedApi3 = _getApi2();
  }
  return cachedApi3;
}
function _getApi2() {
  const vmModules = Process.enumerateModules().filter((m2) => /jvm.(dll|dylib|so)$/.test(m2.name));
  if (vmModules.length === 0) {
    return null;
  }
  const vmModule = vmModules[0];
  const temporaryApi = {
    flavor: "jvm"
  };
  const pending = Process.platform === "windows" ? [{
    module: vmModule,
    functions: {
      JNI_GetCreatedJavaVMs: ["JNI_GetCreatedJavaVMs", "int", ["pointer", "int", "pointer"]],
      JVM_Sleep: ["JVM_Sleep", "void", ["pointer", "pointer", "long"]],
      "VMThread::execute": ["VMThread::execute", "void", ["pointer"]],
      "Method::size": ["Method::size", "int", ["int"]],
      "Method::set_native_function": ["Method::set_native_function", "void", ["pointer", "pointer", "int"]],
      "Method::clear_native_function": ["Method::clear_native_function", "void", ["pointer"]],
      "Method::jmethod_id": ["Method::jmethod_id", "pointer", ["pointer"]],
      "ClassLoaderDataGraph::classes_do": ["ClassLoaderDataGraph::classes_do", "void", ["pointer"]],
      "NMethodSweeper::sweep_code_cache": ["NMethodSweeper::sweep_code_cache", "void", []],
      "OopMapCache::flush_obsolete_entries": ["OopMapCache::flush_obsolete_entries", "void", ["pointer"]]
    },
    variables: {
      "VM_RedefineClasses::`vftable'": function(address) {
        this.vtableRedefineClasses = address;
      },
      "VM_RedefineClasses::doit": function(address) {
        this.redefineClassesDoIt = address;
      },
      "VM_RedefineClasses::doit_prologue": function(address) {
        this.redefineClassesDoItPrologue = address;
      },
      "VM_RedefineClasses::doit_epilogue": function(address) {
        this.redefineClassesDoItEpilogue = address;
      },
      "VM_RedefineClasses::allow_nested_vm_operations": function(address) {
        this.redefineClassesAllow = address;
      },
      "NMethodSweeper::_traversals": function(address) {
        this.traversals = address;
      },
      "NMethodSweeper::_should_sweep": function(address) {
        this.shouldSweep = address;
      }
    },
    optionals: []
  }] : [{
    module: vmModule,
    functions: {
      JNI_GetCreatedJavaVMs: ["JNI_GetCreatedJavaVMs", "int", ["pointer", "int", "pointer"]],
      _ZN6Method4sizeEb: ["Method::size", "int", ["int"]],
      _ZN6Method19set_native_functionEPhb: ["Method::set_native_function", "void", ["pointer", "pointer", "int"]],
      _ZN6Method21clear_native_functionEv: ["Method::clear_native_function", "void", ["pointer"]],
      // JDK >= 17
      _ZN6Method24restore_unshareable_infoEP10JavaThread: ["Method::restore_unshareable_info", "void", ["pointer", "pointer"]],
      // JDK < 17
      _ZN6Method24restore_unshareable_infoEP6Thread: ["Method::restore_unshareable_info", "void", ["pointer", "pointer"]],
      _ZN6Method11link_methodERK12methodHandleP10JavaThread: ["Method::link_method", "void", ["pointer", "pointer", "pointer"]],
      _ZN6Method10jmethod_idEv: ["Method::jmethod_id", "pointer", ["pointer"]],
      _ZN6Method10clear_codeEv: function(address) {
        const clearCode = new NativeFunction(address, "void", ["pointer"], nativeFunctionOptions4);
        this["Method::clear_code"] = function(thisPtr) {
          clearCode(thisPtr);
        };
      },
      _ZN6Method10clear_codeEb: function(address) {
        const clearCode = new NativeFunction(address, "void", ["pointer", "int"], nativeFunctionOptions4);
        const lock = 0;
        this["Method::clear_code"] = function(thisPtr) {
          clearCode(thisPtr, lock);
        };
      },
      // JDK >= 13
      _ZN18VM_RedefineClasses19mark_dependent_codeEP13InstanceKlass: ["VM_RedefineClasses::mark_dependent_code", "void", ["pointer", "pointer"]],
      _ZN18VM_RedefineClasses20flush_dependent_codeEv: ["VM_RedefineClasses::flush_dependent_code", "void", []],
      // JDK < 13
      _ZN18VM_RedefineClasses20flush_dependent_codeEP13InstanceKlassP6Thread: ["VM_RedefineClasses::flush_dependent_code", "void", ["pointer", "pointer", "pointer"]],
      // JDK < 10
      _ZN18VM_RedefineClasses20flush_dependent_codeE19instanceKlassHandleP6Thread: ["VM_RedefineClasses::flush_dependent_code", "void", ["pointer", "pointer", "pointer"]],
      _ZN19ResolvedMethodTable21adjust_method_entriesEPb: ["ResolvedMethodTable::adjust_method_entries", "void", ["pointer"]],
      // JDK < 10
      _ZN15MemberNameTable21adjust_method_entriesEP13InstanceKlassPb: ["MemberNameTable::adjust_method_entries", "void", ["pointer", "pointer", "pointer"]],
      _ZN17ConstantPoolCache21adjust_method_entriesEPb: function(address) {
        const adjustMethod = new NativeFunction(address, "void", ["pointer", "pointer"], nativeFunctionOptions4);
        this["ConstantPoolCache::adjust_method_entries"] = function(thisPtr, holderPtr, tracePtr) {
          adjustMethod(thisPtr, tracePtr);
        };
      },
      // JDK < 13
      _ZN17ConstantPoolCache21adjust_method_entriesEP13InstanceKlassPb: function(address) {
        const adjustMethod = new NativeFunction(address, "void", ["pointer", "pointer", "pointer"], nativeFunctionOptions4);
        this["ConstantPoolCache::adjust_method_entries"] = function(thisPtr, holderPtr, tracePtr) {
          adjustMethod(thisPtr, holderPtr, tracePtr);
        };
      },
      _ZN20ClassLoaderDataGraph10classes_doEP12KlassClosure: ["ClassLoaderDataGraph::classes_do", "void", ["pointer"]],
      _ZN20ClassLoaderDataGraph22clean_deallocate_listsEb: ["ClassLoaderDataGraph::clean_deallocate_lists", "void", ["int"]],
      _ZN10JavaThread27thread_from_jni_environmentEP7JNIEnv_: ["JavaThread::thread_from_jni_environment", "pointer", ["pointer"]],
      _ZN8VMThread7executeEP12VM_Operation: ["VMThread::execute", "void", ["pointer"]],
      _ZN11OopMapCache22flush_obsolete_entriesEv: ["OopMapCache::flush_obsolete_entries", "void", ["pointer"]],
      _ZN14NMethodSweeper11force_sweepEv: ["NMethodSweeper::force_sweep", "void", []],
      _ZN14NMethodSweeper16sweep_code_cacheEv: ["NMethodSweeper::sweep_code_cache", "void", []],
      _ZN14NMethodSweeper17sweep_in_progressEv: ["NMethodSweeper::sweep_in_progress", "bool", []],
      JVM_Sleep: ["JVM_Sleep", "void", ["pointer", "pointer", "long"]]
    },
    variables: {
      // JDK <= 9
      _ZN18VM_RedefineClasses14_the_class_oopE: function(address) {
        this.redefineClass = address;
      },
      // 9 < JDK < 13
      _ZN18VM_RedefineClasses10_the_classE: function(address) {
        this.redefineClass = address;
      },
      // JDK < 13
      _ZN18VM_RedefineClasses25AdjustCpoolCacheAndVtable8do_klassEP5Klass: function(address) {
        this.doKlass = address;
      },
      // JDK >= 13
      _ZN18VM_RedefineClasses22AdjustAndCleanMetadata8do_klassEP5Klass: function(address) {
        this.doKlass = address;
      },
      _ZTV18VM_RedefineClasses: function(address) {
        this.vtableRedefineClasses = address;
      },
      _ZN18VM_RedefineClasses4doitEv: function(address) {
        this.redefineClassesDoIt = address;
      },
      _ZN18VM_RedefineClasses13doit_prologueEv: function(address) {
        this.redefineClassesDoItPrologue = address;
      },
      _ZN18VM_RedefineClasses13doit_epilogueEv: function(address) {
        this.redefineClassesDoItEpilogue = address;
      },
      _ZN18VM_RedefineClassesD0Ev: function(address) {
        this.redefineClassesDispose0 = address;
      },
      _ZN18VM_RedefineClassesD1Ev: function(address) {
        this.redefineClassesDispose1 = address;
      },
      _ZNK18VM_RedefineClasses26allow_nested_vm_operationsEv: function(address) {
        this.redefineClassesAllow = address;
      },
      _ZNK18VM_RedefineClasses14print_on_errorEP12outputStream: function(address) {
        this.redefineClassesOnError = address;
      },
      // JDK >= 17
      _ZN13InstanceKlass33create_new_default_vtable_indicesEiP10JavaThread: function(address) {
        this.createNewDefaultVtableIndices = address;
      },
      // JDK < 17
      _ZN13InstanceKlass33create_new_default_vtable_indicesEiP6Thread: function(address) {
        this.createNewDefaultVtableIndices = address;
      },
      _ZN19Abstract_VM_Version19jre_release_versionEv: function(address) {
        const getVersion = new NativeFunction(address, "pointer", [], nativeFunctionOptions4);
        const versionS = getVersion().readCString();
        this.version = versionS.startsWith("1.8") ? 8 : versionS.startsWith("9.") ? 9 : parseInt(versionS.slice(0, 2), 10);
        this.versionS = versionS;
      },
      _ZN14NMethodSweeper11_traversalsE: function(address) {
        this.traversals = address;
      },
      _ZN14NMethodSweeper21_sweep_fractions_leftE: function(address) {
        this.fractions = address;
      },
      _ZN14NMethodSweeper13_should_sweepE: function(address) {
        this.shouldSweep = address;
      }
    },
    optionals: [
      "_ZN6Method24restore_unshareable_infoEP10JavaThread",
      "_ZN6Method24restore_unshareable_infoEP6Thread",
      "_ZN6Method11link_methodERK12methodHandleP10JavaThread",
      "_ZN6Method10clear_codeEv",
      "_ZN6Method10clear_codeEb",
      "_ZN18VM_RedefineClasses19mark_dependent_codeEP13InstanceKlass",
      "_ZN18VM_RedefineClasses20flush_dependent_codeEv",
      "_ZN18VM_RedefineClasses20flush_dependent_codeEP13InstanceKlassP6Thread",
      "_ZN18VM_RedefineClasses20flush_dependent_codeE19instanceKlassHandleP6Thread",
      "_ZN19ResolvedMethodTable21adjust_method_entriesEPb",
      "_ZN15MemberNameTable21adjust_method_entriesEP13InstanceKlassPb",
      "_ZN17ConstantPoolCache21adjust_method_entriesEPb",
      "_ZN17ConstantPoolCache21adjust_method_entriesEP13InstanceKlassPb",
      "_ZN20ClassLoaderDataGraph22clean_deallocate_listsEb",
      "_ZN10JavaThread27thread_from_jni_environmentEP7JNIEnv_",
      "_ZN14NMethodSweeper11force_sweepEv",
      "_ZN14NMethodSweeper17sweep_in_progressEv",
      "_ZN18VM_RedefineClasses14_the_class_oopE",
      "_ZN18VM_RedefineClasses10_the_classE",
      "_ZN18VM_RedefineClasses25AdjustCpoolCacheAndVtable8do_klassEP5Klass",
      "_ZN18VM_RedefineClasses22AdjustAndCleanMetadata8do_klassEP5Klass",
      "_ZN18VM_RedefineClassesD0Ev",
      "_ZN18VM_RedefineClassesD1Ev",
      "_ZNK18VM_RedefineClasses14print_on_errorEP12outputStream",
      "_ZN13InstanceKlass33create_new_default_vtable_indicesEiP10JavaThread",
      "_ZN13InstanceKlass33create_new_default_vtable_indicesEiP6Thread",
      "_ZN14NMethodSweeper21_sweep_fractions_leftE"
    ]
  }];
  const missing = [];
  pending.forEach(function(api3) {
    const module = api3.module;
    const functions = api3.functions || {};
    const variables = api3.variables || {};
    const optionals = new Set(api3.optionals || []);
    const tmp = module.enumerateExports().reduce(function(result, exp) {
      result[exp.name] = exp;
      return result;
    }, {});
    const exportByName = module.enumerateSymbols().reduce(function(result, exp) {
      result[exp.name] = exp;
      return result;
    }, tmp);
    Object.keys(functions).forEach(function(name) {
      const exp = exportByName[name];
      if (exp !== void 0) {
        const signature2 = functions[name];
        if (typeof signature2 === "function") {
          signature2.call(temporaryApi, exp.address);
        } else {
          temporaryApi[signature2[0]] = new NativeFunction(exp.address, signature2[1], signature2[2], nativeFunctionOptions4);
        }
      } else {
        if (!optionals.has(name)) {
          missing.push(name);
        }
      }
    });
    Object.keys(variables).forEach(function(name) {
      const exp = exportByName[name];
      if (exp !== void 0) {
        const handler = variables[name];
        handler.call(temporaryApi, exp.address);
      } else {
        if (!optionals.has(name)) {
          missing.push(name);
        }
      }
    });
  });
  if (missing.length > 0) {
    throw new Error("Java API only partially available; please file a bug. Missing: " + missing.join(", "));
  }
  const vms = Memory.alloc(pointerSize8);
  const vmCount = Memory.alloc(jsizeSize2);
  checkJniResult("JNI_GetCreatedJavaVMs", temporaryApi.JNI_GetCreatedJavaVMs(vms, 1, vmCount));
  if (vmCount.readInt() === 0) {
    return null;
  }
  temporaryApi.vm = vms.readPointer();
  const allocatorFunctions = Process.platform === "windows" ? {
    $new: ["??2@YAPEAX_K@Z", "pointer", ["ulong"]],
    $delete: ["??3@YAXPEAX@Z", "void", ["pointer"]]
  } : {
    $new: ["_Znwm", "pointer", ["ulong"]],
    $delete: ["_ZdlPv", "void", ["pointer"]]
  };
  for (const [name, [rawName, retType2, argTypes2]] of Object.entries(allocatorFunctions)) {
    let address = Module.findGlobalExportByName(rawName);
    if (address === null) {
      address = DebugSymbol.fromName(rawName).address;
      if (address.isNull()) {
        throw new Error(`unable to find C++ allocator API, missing: '${rawName}'`);
      }
    }
    temporaryApi[name] = new NativeFunction(address, retType2, argTypes2, nativeFunctionOptions4);
  }
  temporaryApi.jvmti = getEnvJvmti(temporaryApi);
  if (temporaryApi["JavaThread::thread_from_jni_environment"] === void 0) {
    temporaryApi["JavaThread::thread_from_jni_environment"] = makeThreadFromJniHelper(temporaryApi);
  }
  return temporaryApi;
}
function getEnvJvmti(api3) {
  const vm3 = new VM(api3);
  let env;
  vm3.perform(() => {
    const handle2 = vm3.tryGetEnvHandle(jvmtiVersion.v1_0);
    if (handle2 === null) {
      throw new Error("JVMTI not available");
    }
    env = new EnvJvmti(handle2, vm3);
    const capaBuf = Memory.alloc(8);
    capaBuf.writeU64(jvmtiCapabilities.canTagObjects);
    const result = env.addCapabilities(capaBuf);
    checkJniResult("getEnvJvmti::AddCapabilities", result);
  });
  return env;
}
var threadOffsetParsers = {
  x64: parseX64ThreadOffset
};
function makeThreadFromJniHelper(api3) {
  let offset = null;
  const tryParse = threadOffsetParsers[Process.arch];
  if (tryParse !== void 0) {
    const vm3 = new VM(api3);
    const findClassImpl = vm3.perform((env) => env.handle.readPointer().add(6 * pointerSize8).readPointer());
    offset = parseInstructionsAt(findClassImpl, tryParse, { limit: 11 });
  }
  if (offset === null) {
    return () => {
      throw new Error("Unable to make thread_from_jni_environment() helper for the current architecture");
    };
  }
  return (env) => {
    return env.add(offset);
  };
}
function parseX64ThreadOffset(insn) {
  if (insn.mnemonic !== "lea") {
    return null;
  }
  const { base, disp } = insn.operands[1].value;
  if (!(base === "rdi" && disp < 0)) {
    return null;
  }
  return disp;
}
function ensureClassInitialized2(env, classRef) {
}
var JvmMethodMangler = class {
  constructor(methodId) {
    this.methodId = methodId;
    this.method = methodId.readPointer();
    this.originalMethod = null;
    this.newMethod = null;
    this.resolved = null;
    this.impl = null;
    this.key = methodId.toString(16);
  }
  replace(impl, isInstanceMethod, argTypes2, vm3, api3) {
    const { key } = this;
    const mangler = revertManglers.get(key);
    if (mangler !== void 0) {
      revertManglers.delete(key);
      this.method = mangler.method;
      this.originalMethod = mangler.originalMethod;
      this.newMethod = mangler.newMethod;
      this.resolved = mangler.resolved;
    }
    this.impl = impl;
    replaceManglers.set(key, this);
    ensureManglersScheduled(vm3);
  }
  revert(vm3) {
    const { key } = this;
    replaceManglers.delete(key);
    revertManglers.set(key, this);
    ensureManglersScheduled(vm3);
  }
  resolveTarget(wrapper, isInstanceMethod, env, api3) {
    const { resolved, originalMethod, methodId } = this;
    if (resolved !== null) {
      return resolved;
    }
    if (originalMethod === null) {
      return methodId;
    }
    const vip = originalMethod.oldMethod.vtableIndexPtr;
    vip.writeS32(-2);
    const jmethodID = Memory.alloc(pointerSize8);
    jmethodID.writePointer(this.method);
    this.resolved = jmethodID;
    return jmethodID;
  }
};
function ensureManglersScheduled(vm3) {
  if (!manglersScheduled) {
    manglersScheduled = true;
    Script.nextTick(doManglers, vm3);
  }
}
function doManglers(vm3) {
  const localReplaceManglers = new Map(replaceManglers);
  const localRevertManglers = new Map(revertManglers);
  replaceManglers.clear();
  revertManglers.clear();
  manglersScheduled = false;
  vm3.perform((env) => {
    const api3 = getApi3();
    const thread = api3["JavaThread::thread_from_jni_environment"](env.handle);
    let force = false;
    withJvmThread(() => {
      localReplaceManglers.forEach((mangler) => {
        const { method: method2, originalMethod, impl, methodId, newMethod } = mangler;
        if (originalMethod === null) {
          mangler.originalMethod = fetchJvmMethod(method2);
          mangler.newMethod = nativeJvmMethod(method2, impl, thread);
          installJvmMethod(mangler.newMethod, methodId, thread);
        } else {
          api3["Method::set_native_function"](newMethod.method, impl, 0);
        }
      });
      localRevertManglers.forEach((mangler) => {
        const { originalMethod, methodId, newMethod } = mangler;
        if (originalMethod !== null) {
          revertJvmMethod(originalMethod);
          const revert = originalMethod.oldMethod;
          revert.oldMethod = newMethod;
          installJvmMethod(revert, methodId, thread);
          force = true;
        }
      });
    });
    if (force) {
      forceSweep(env.handle);
    }
  });
}
function forceSweep(env) {
  const {
    fractions,
    shouldSweep,
    traversals,
    "NMethodSweeper::sweep_code_cache": sweep,
    "NMethodSweeper::sweep_in_progress": inProgress,
    "NMethodSweeper::force_sweep": force,
    JVM_Sleep: sleep
  } = getApi3();
  if (force !== void 0) {
    Thread.sleep(0.05);
    force();
    Thread.sleep(0.05);
    force();
  } else {
    let trav = traversals.readS64();
    const endTrav = trav + 2;
    while (endTrav > trav) {
      fractions.writeS32(1);
      sleep(env, NULL, 50);
      if (!inProgress()) {
        withJvmThread(() => {
          Thread.sleep(0.05);
        });
      }
      const sweepNotAlreadyInProgress = shouldSweep.readU8() === 0;
      if (sweepNotAlreadyInProgress) {
        fractions.writeS32(1);
        sweep();
      }
      trav = traversals.readS64();
    }
  }
}
function withJvmThread(fn, fnPrologue, fnEpilogue) {
  const {
    execute,
    vtable: vtable2,
    vtableSize,
    doItOffset,
    prologueOffset,
    epilogueOffset
  } = getJvmThreadSpec();
  const vtableDup = Memory.dup(vtable2, vtableSize);
  const vmOperation = Memory.alloc(pointerSize8 * 25);
  vmOperation.writePointer(vtableDup);
  const doIt = new NativeCallback(fn, "void", ["pointer"]);
  vtableDup.add(doItOffset).writePointer(doIt);
  let prologue = null;
  if (fnPrologue !== void 0) {
    prologue = new NativeCallback(fnPrologue, "int", ["pointer"]);
    vtableDup.add(prologueOffset).writePointer(prologue);
  }
  let epilogue = null;
  if (fnEpilogue !== void 0) {
    epilogue = new NativeCallback(fnEpilogue, "void", ["pointer"]);
    vtableDup.add(epilogueOffset).writePointer(epilogue);
  }
  execute(vmOperation);
}
function _getJvmThreadSpec() {
  const {
    vtableRedefineClasses,
    redefineClassesDoIt,
    redefineClassesDoItPrologue,
    redefineClassesDoItEpilogue,
    redefineClassesOnError,
    redefineClassesAllow,
    redefineClassesDispose0,
    redefineClassesDispose1,
    "VMThread::execute": execute
  } = getApi3();
  const vtablePtr = vtableRedefineClasses.add(2 * pointerSize8);
  const vtableSize = 15 * pointerSize8;
  const vtable2 = Memory.dup(vtablePtr, vtableSize);
  const emptyCallback = new NativeCallback(() => {
  }, "void", ["pointer"]);
  let doItOffset, prologueOffset, epilogueOffset;
  for (let offset = 0; offset !== vtableSize; offset += pointerSize8) {
    const element = vtable2.add(offset);
    const value = element.readPointer();
    if (redefineClassesOnError !== void 0 && value.equals(redefineClassesOnError) || redefineClassesDispose0 !== void 0 && value.equals(redefineClassesDispose0) || redefineClassesDispose1 !== void 0 && value.equals(redefineClassesDispose1)) {
      element.writePointer(emptyCallback);
    } else if (value.equals(redefineClassesDoIt)) {
      doItOffset = offset;
    } else if (value.equals(redefineClassesDoItPrologue)) {
      prologueOffset = offset;
      element.writePointer(redefineClassesAllow);
    } else if (value.equals(redefineClassesDoItEpilogue)) {
      epilogueOffset = offset;
      element.writePointer(emptyCallback);
    }
  }
  return {
    execute,
    emptyCallback,
    vtable: vtable2,
    vtableSize,
    doItOffset,
    prologueOffset,
    epilogueOffset
  };
}
function makeMethodMangler2(methodId) {
  return new JvmMethodMangler(methodId);
}
function installJvmMethod(method2, methodId, thread) {
  const { method: handle2, oldMethod: old } = method2;
  const api3 = getApi3();
  method2.methodsArray.add(method2.methodIndex * pointerSize8).writePointer(handle2);
  if (method2.vtableIndex >= 0) {
    method2.vtable.add(method2.vtableIndex * pointerSize8).writePointer(handle2);
  }
  methodId.writePointer(handle2);
  old.accessFlagsPtr.writeU32((old.accessFlags | JVM_ACC_IS_OLD | JVM_ACC_IS_OBSOLETE) >>> 0);
  const flushObs = api3["OopMapCache::flush_obsolete_entries"];
  if (flushObs !== void 0) {
    const { oopMapCache } = method2;
    if (!oopMapCache.isNull()) {
      flushObs(oopMapCache);
    }
  }
  const mark = api3["VM_RedefineClasses::mark_dependent_code"];
  const flush = api3["VM_RedefineClasses::flush_dependent_code"];
  if (mark !== void 0) {
    mark(NULL, method2.instanceKlass);
    flush();
  } else {
    flush(NULL, method2.instanceKlass, thread);
  }
  const traceNamePrinted = Memory.alloc(1);
  traceNamePrinted.writeU8(1);
  api3["ConstantPoolCache::adjust_method_entries"](method2.cache, method2.instanceKlass, traceNamePrinted);
  const klassClosure = Memory.alloc(3 * pointerSize8);
  const doKlassPtr = Memory.alloc(pointerSize8);
  doKlassPtr.writePointer(api3.doKlass);
  klassClosure.writePointer(doKlassPtr);
  klassClosure.add(pointerSize8).writePointer(thread);
  klassClosure.add(2 * pointerSize8).writePointer(thread);
  if (api3.redefineClass !== void 0) {
    api3.redefineClass.writePointer(method2.instanceKlass);
  }
  api3["ClassLoaderDataGraph::classes_do"](klassClosure);
  const rmtAdjustMethodEntries = api3["ResolvedMethodTable::adjust_method_entries"];
  if (rmtAdjustMethodEntries !== void 0) {
    rmtAdjustMethodEntries(traceNamePrinted);
  } else {
    const { memberNames } = method2;
    if (!memberNames.isNull()) {
      const mntAdjustMethodEntries = api3["MemberNameTable::adjust_method_entries"];
      if (mntAdjustMethodEntries !== void 0) {
        mntAdjustMethodEntries(memberNames, method2.instanceKlass, traceNamePrinted);
      }
    }
  }
  const clean = api3["ClassLoaderDataGraph::clean_deallocate_lists"];
  if (clean !== void 0) {
    clean(0);
  }
}
function nativeJvmMethod(method2, impl, thread) {
  const api3 = getApi3();
  const newMethod = fetchJvmMethod(method2);
  newMethod.constPtr.writePointer(newMethod.const);
  const flags = (newMethod.accessFlags | JVM_ACC_NATIVE | JVM_ACC_NOT_C2_COMPILABLE | JVM_ACC_NOT_C1_COMPILABLE | JVM_ACC_NOT_C2_OSR_COMPILABLE) >>> 0;
  newMethod.accessFlagsPtr.writeU32(flags);
  newMethod.signatureHandler.writePointer(NULL);
  newMethod.adapter.writePointer(NULL);
  newMethod.i2iEntry.writePointer(NULL);
  api3["Method::clear_code"](newMethod.method);
  newMethod.dataPtr.writePointer(NULL);
  newMethod.countersPtr.writePointer(NULL);
  newMethod.stackmapPtr.writePointer(NULL);
  api3["Method::clear_native_function"](newMethod.method);
  api3["Method::set_native_function"](newMethod.method, impl, 0);
  api3["Method::restore_unshareable_info"](newMethod.method, thread);
  if (api3.version >= 17) {
    const methodHandle = Memory.alloc(2 * pointerSize8);
    methodHandle.writePointer(newMethod.method);
    methodHandle.add(pointerSize8).writePointer(thread);
    api3["Method::link_method"](newMethod.method, methodHandle, thread);
  }
  return newMethod;
}
function fetchJvmMethod(method2) {
  const spec = getJvmMethodSpec();
  const constMethod = method2.add(spec.method.constMethodOffset).readPointer();
  const constMethodSize = constMethod.add(spec.constMethod.sizeOffset).readS32() * pointerSize8;
  const newConstMethod = Memory.alloc(constMethodSize + spec.method.size);
  Memory.copy(newConstMethod, constMethod, constMethodSize);
  const newMethod = newConstMethod.add(constMethodSize);
  Memory.copy(newMethod, method2, spec.method.size);
  const result = readJvmMethod(newMethod, newConstMethod, constMethodSize);
  const oldMethod = readJvmMethod(method2, constMethod, constMethodSize);
  result.oldMethod = oldMethod;
  return result;
}
function readJvmMethod(method2, constMethod, constMethodSize) {
  const api3 = getApi3();
  const spec = getJvmMethodSpec();
  const constPtr = method2.add(spec.method.constMethodOffset);
  const dataPtr = method2.add(spec.method.methodDataOffset);
  const countersPtr = method2.add(spec.method.methodCountersOffset);
  const accessFlagsPtr = method2.add(spec.method.accessFlagsOffset);
  const accessFlags = accessFlagsPtr.readU32();
  const adapter = spec.getAdapterPointer(method2, constMethod);
  const i2iEntry = method2.add(spec.method.i2iEntryOffset);
  const signatureHandler = method2.add(spec.method.signatureHandlerOffset);
  const constantPool = constMethod.add(spec.constMethod.constantPoolOffset).readPointer();
  const stackmapPtr = constMethod.add(spec.constMethod.stackmapDataOffset);
  const instanceKlass = constantPool.add(spec.constantPool.instanceKlassOffset).readPointer();
  const cache = constantPool.add(spec.constantPool.cacheOffset).readPointer();
  const instanceKlassSpec = getJvmInstanceKlassSpec();
  const methods = instanceKlass.add(instanceKlassSpec.methodsOffset).readPointer();
  const methodsCount = methods.readS32();
  const methodsArray = methods.add(pointerSize8);
  const methodIndex = constMethod.add(spec.constMethod.methodIdnumOffset).readU16();
  const vtableIndexPtr = method2.add(spec.method.vtableIndexOffset);
  const vtableIndex = vtableIndexPtr.readS32();
  const vtable2 = instanceKlass.add(instanceKlassSpec.vtableOffset);
  const oopMapCache = instanceKlass.add(instanceKlassSpec.oopMapCacheOffset).readPointer();
  const memberNames = api3.version >= 10 ? instanceKlass.add(instanceKlassSpec.memberNamesOffset).readPointer() : NULL;
  return {
    method: method2,
    methodSize: spec.method.size,
    const: constMethod,
    constSize: constMethodSize,
    constPtr,
    dataPtr,
    countersPtr,
    stackmapPtr,
    instanceKlass,
    methodsArray,
    methodsCount,
    methodIndex,
    vtableIndex,
    vtableIndexPtr,
    vtable: vtable2,
    accessFlags,
    accessFlagsPtr,
    adapter,
    i2iEntry,
    signatureHandler,
    memberNames,
    cache,
    oopMapCache
  };
}
function revertJvmMethod(method2) {
  const { oldMethod: old } = method2;
  old.accessFlagsPtr.writeU32(old.accessFlags);
  old.vtableIndexPtr.writeS32(old.vtableIndex);
}
function _getJvmMethodSpec() {
  const api3 = getApi3();
  const { version } = api3;
  let adapterHandlerLocation;
  if (version >= 17) {
    adapterHandlerLocation = "method:early";
  } else if (version >= 9 && version <= 16) {
    adapterHandlerLocation = "const-method";
  } else {
    adapterHandlerLocation = "method:late";
  }
  const isNative = 1;
  const methodSize = api3["Method::size"](isNative) * pointerSize8;
  const constMethodOffset = pointerSize8;
  const methodDataOffset = 2 * pointerSize8;
  const methodCountersOffset = 3 * pointerSize8;
  const adapterInMethodEarlyOffset = 4 * pointerSize8;
  const adapterInMethodEarlySize = adapterHandlerLocation === "method:early" ? pointerSize8 : 0;
  const accessFlagsOffset = adapterInMethodEarlyOffset + adapterInMethodEarlySize;
  const vtableIndexOffset = accessFlagsOffset + 4;
  const i2iEntryOffset = vtableIndexOffset + 4 + 8;
  const adapterInMethodLateOffset = i2iEntryOffset + pointerSize8;
  const adapterInMethodOffset = adapterInMethodEarlySize !== 0 ? adapterInMethodEarlyOffset : adapterInMethodLateOffset;
  const nativeFunctionOffset = methodSize - 2 * pointerSize8;
  const signatureHandlerOffset = methodSize - pointerSize8;
  const constantPoolOffset = 8;
  const stackmapDataOffset = constantPoolOffset + pointerSize8;
  const adapterInConstMethodOffset = stackmapDataOffset + pointerSize8;
  const adapterInConstMethodSize = adapterHandlerLocation === "const-method" ? pointerSize8 : 0;
  const constMethodSizeOffset = adapterInConstMethodOffset + adapterInConstMethodSize;
  const methodIdnumOffset = constMethodSizeOffset + 14;
  const cacheOffset = 2 * pointerSize8;
  const instanceKlassOffset = 3 * pointerSize8;
  const getAdapterPointer = adapterInConstMethodSize !== 0 ? function(method2, constMethod) {
    return constMethod.add(adapterInConstMethodOffset);
  } : function(method2, constMethod) {
    return method2.add(adapterInMethodOffset);
  };
  return {
    getAdapterPointer,
    method: {
      size: methodSize,
      constMethodOffset,
      methodDataOffset,
      methodCountersOffset,
      accessFlagsOffset,
      vtableIndexOffset,
      i2iEntryOffset,
      nativeFunctionOffset,
      signatureHandlerOffset
    },
    constMethod: {
      constantPoolOffset,
      stackmapDataOffset,
      sizeOffset: constMethodSizeOffset,
      methodIdnumOffset
    },
    constantPool: {
      cacheOffset,
      instanceKlassOffset
    }
  };
}
var vtableOffsetParsers = {
  x64: parseX64VTableOffset
};
function _getJvmInstanceKlassSpec() {
  const { version: jvmVersion, createNewDefaultVtableIndices } = getApi3();
  const tryParse = vtableOffsetParsers[Process.arch];
  if (tryParse === void 0) {
    throw new Error(`Missing vtable offset parser for ${Process.arch}`);
  }
  const vtableOffset = parseInstructionsAt(createNewDefaultVtableIndices, tryParse, { limit: 32 });
  if (vtableOffset === null) {
    throw new Error("Unable to deduce vtable offset");
  }
  const oopMultiplier = jvmVersion >= 10 && jvmVersion <= 11 || jvmVersion >= 15 ? 17 : 18;
  const methodsOffset = vtableOffset - 7 * pointerSize8;
  const memberNamesOffset = vtableOffset - 17 * pointerSize8;
  const oopMapCacheOffset = vtableOffset - oopMultiplier * pointerSize8;
  return {
    vtableOffset,
    methodsOffset,
    memberNamesOffset,
    oopMapCacheOffset
  };
}
function parseX64VTableOffset(insn) {
  if (insn.mnemonic !== "mov") {
    return null;
  }
  const dst = insn.operands[0];
  if (dst.type !== "mem") {
    return null;
  }
  const { value: dstValue } = dst;
  if (dstValue.scale !== 1) {
    return null;
  }
  const { disp } = dstValue;
  if (disp < 256) {
    return null;
  }
  const defaultVtableIndicesOffset = disp;
  return defaultVtableIndicesOffset + 16;
}

// node_modules/frida-java-bridge/lib/api.js
var getApi4 = getApi2;
try {
  getAndroidVersion();
} catch (e) {
  getApi4 = getApi3;
}
var api_default = getApi4;

// node_modules/frida-java-bridge/lib/class-model.js
var code3 = `#include <json-glib/json-glib.h>
#include <string.h>

#define kAccStatic 0x0008
#define kAccConstructor 0x00010000

typedef struct _Model Model;
typedef struct _EnumerateMethodsContext EnumerateMethodsContext;

typedef struct _JavaApi JavaApi;
typedef struct _JavaClassApi JavaClassApi;
typedef struct _JavaMethodApi JavaMethodApi;
typedef struct _JavaFieldApi JavaFieldApi;

typedef struct _JNIEnv JNIEnv;
typedef guint8 jboolean;
typedef gint32 jint;
typedef jint jsize;
typedef gpointer jobject;
typedef jobject jclass;
typedef jobject jstring;
typedef jobject jarray;
typedef jarray jobjectArray;
typedef gpointer jfieldID;
typedef gpointer jmethodID;

typedef struct _jvmtiEnv jvmtiEnv;
typedef enum
{
  JVMTI_ERROR_NONE = 0
} jvmtiError;

typedef struct _ArtApi ArtApi;
typedef guint32 ArtHeapReference;
typedef struct _ArtObject ArtObject;
typedef struct _ArtClass ArtClass;
typedef struct _ArtClassLinker ArtClassLinker;
typedef struct _ArtClassVisitor ArtClassVisitor;
typedef struct _ArtClassVisitorVTable ArtClassVisitorVTable;
typedef struct _ArtMethod ArtMethod;
typedef struct _ArtString ArtString;

typedef union _StdString StdString;
typedef struct _StdStringShort StdStringShort;
typedef struct _StdStringLong StdStringLong;

typedef void (* ArtVisitClassesFunc) (ArtClassLinker * linker, ArtClassVisitor * visitor);
typedef const char * (* ArtGetClassDescriptorFunc) (ArtClass * klass, StdString * storage);
typedef void (* ArtPrettyMethodFunc) (StdString * result, ArtMethod * method, jboolean with_signature);

struct _Model
{
  GHashTable * members;
};

struct _EnumerateMethodsContext
{
  GPatternSpec * class_query;
  GPatternSpec * method_query;
  jboolean include_signature;
  jboolean ignore_case;
  jboolean skip_system_classes;
  GHashTable * groups;
};

struct _JavaClassApi
{
  jmethodID get_declared_methods;
  jmethodID get_declared_fields;
};

struct _JavaMethodApi
{
  jmethodID get_name;
  jmethodID get_modifiers;
};

struct _JavaFieldApi
{
  jmethodID get_name;
  jmethodID get_modifiers;
};

struct _JavaApi
{
  JavaClassApi clazz;
  JavaMethodApi method;
  JavaFieldApi field;
};

struct _JNIEnv
{
  gpointer * functions;
};

struct _jvmtiEnv
{
  gpointer * functions;
};

struct _ArtApi
{
  gboolean available;

  guint class_offset_ifields;
  guint class_offset_methods;
  guint class_offset_sfields;
  guint class_offset_copied_methods_offset;

  guint method_size;
  guint method_offset_access_flags;

  guint field_size;
  guint field_offset_access_flags;

  guint alignment_padding;

  ArtClassLinker * linker;
  ArtVisitClassesFunc visit_classes;
  ArtGetClassDescriptorFunc get_class_descriptor;
  ArtPrettyMethodFunc pretty_method;

  void (* free) (gpointer mem);
};

struct _ArtObject
{
  ArtHeapReference klass;
  ArtHeapReference monitor;
};

struct _ArtClass
{
  ArtObject parent;

  ArtHeapReference class_loader;
};

struct _ArtClassVisitor
{
  ArtClassVisitorVTable * vtable;
  gpointer user_data;
};

struct _ArtClassVisitorVTable
{
  void (* reserved1) (ArtClassVisitor * self);
  void (* reserved2) (ArtClassVisitor * self);
  jboolean (* visit) (ArtClassVisitor * self, ArtClass * klass);
};

struct _ArtString
{
  ArtObject parent;

  gint32 count;
  guint32 hash_code;

  union
  {
    guint16 value[0];
    guint8 value_compressed[0];
  };
};

struct _StdStringShort
{
  guint8 size;
  gchar data[(3 * sizeof (gpointer)) - sizeof (guint8)];
};

struct _StdStringLong
{
  gsize capacity;
  gsize size;
  gchar * data;
};

union _StdString
{
  StdStringShort s;
  StdStringLong l;
};

static void model_add_method (Model * self, const gchar * name, jmethodID id, jint modifiers);
static void model_add_field (Model * self, const gchar * name, jfieldID id, jint modifiers);
static void model_free (Model * model);

static jboolean collect_matching_class_methods (ArtClassVisitor * self, ArtClass * klass);
static gchar * finalize_method_groups_to_json (GHashTable * groups);
static GPatternSpec * make_pattern_spec (const gchar * pattern, jboolean ignore_case);
static gchar * class_name_from_signature (const gchar * signature);
static gchar * format_method_signature (const gchar * name, const gchar * signature);
static void append_type (GString * output, const gchar ** type);

static gpointer read_art_array (gpointer object_base, guint field_offset, guint length_size, guint * length);

static void std_string_destroy (StdString * str);
static gchar * std_string_c_str (StdString * self);

extern GMutex lock;
extern GArray * models;
extern JavaApi java_api;
extern ArtApi art_api;

void
init (void)
{
  g_mutex_init (&lock);
  models = g_array_new (FALSE, FALSE, sizeof (Model *));
}

void
finalize (void)
{
  guint n, i;

  n = models->len;
  for (i = 0; i != n; i++)
  {
    Model * model = g_array_index (models, Model *, i);
    model_free (model);
  }

  g_array_unref (models);
  g_mutex_clear (&lock);
}

Model *
model_new (jclass class_handle,
           gpointer class_object,
           JNIEnv * env)
{
  Model * model;
  GHashTable * members;
  gpointer * funcs = env->functions;
  jmethodID (* from_reflected_method) (JNIEnv *, jobject) = funcs[7];
  jfieldID (* from_reflected_field) (JNIEnv *, jobject) = funcs[8];
  jobject (* to_reflected_method) (JNIEnv *, jclass, jmethodID, jboolean) = funcs[9];
  jobject (* to_reflected_field) (JNIEnv *, jclass, jfieldID, jboolean) = funcs[12];
  void (* delete_local_ref) (JNIEnv *, jobject) = funcs[23];
  jobject (* call_object_method) (JNIEnv *, jobject, jmethodID, ...) = funcs[34];
  jint (* call_int_method) (JNIEnv *, jobject, jmethodID, ...) = funcs[49];
  const char * (* get_string_utf_chars) (JNIEnv *, jstring, jboolean *) = funcs[169];
  void (* release_string_utf_chars) (JNIEnv *, jstring, const char *) = funcs[170];
  jsize (* get_array_length) (JNIEnv *, jarray) = funcs[171];
  jobject (* get_object_array_element) (JNIEnv *, jobjectArray, jsize) = funcs[173];
  jsize n, i;

  model = g_new (Model, 1);

  members = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, g_free);
  model->members = members;

  if (art_api.available)
  {
    gpointer elements;
    guint n, i;
    const guint field_arrays[] = {
      art_api.class_offset_ifields,
      art_api.class_offset_sfields
    };
    guint field_array_cursor;
    gboolean merged_fields = art_api.class_offset_sfields == 0;

    elements = read_art_array (class_object, art_api.class_offset_methods, sizeof (gsize), NULL);
    n = *(guint16 *) (class_object + art_api.class_offset_copied_methods_offset);
    for (i = 0; i != n; i++)
    {
      jmethodID id;
      guint32 access_flags;
      jboolean is_static;
      jobject method, name;
      const char * name_str;
      jint modifiers;

      id = elements + (i * art_api.method_size);

      access_flags = *(guint32 *) (id + art_api.method_offset_access_flags);
      if ((access_flags & kAccConstructor) != 0)
        continue;
      is_static = (access_flags & kAccStatic) != 0;
      method = to_reflected_method (env, class_handle, id, is_static);
      name = call_object_method (env, method, java_api.method.get_name);
      name_str = get_string_utf_chars (env, name, NULL);
      modifiers = access_flags & 0xffff;

      model_add_method (model, name_str, id, modifiers);

      release_string_utf_chars (env, name, name_str);
      delete_local_ref (env, name);
      delete_local_ref (env, method);
    }

    for (field_array_cursor = 0; field_array_cursor != G_N_ELEMENTS (field_arrays); field_array_cursor++)
    {
      jboolean is_static;

      if (field_arrays[field_array_cursor] == 0)
        continue;

      if (!merged_fields)
        is_static = field_array_cursor == 1;

      elements = read_art_array (class_object, field_arrays[field_array_cursor], sizeof (guint32), &n);
      for (i = 0; i != n; i++)
      {
        jfieldID id;
        guint32 access_flags;
        jobject field, name;
        const char * name_str;
        jint modifiers;

        id = elements + (i * art_api.field_size);

        access_flags = *(guint32 *) (id + art_api.field_offset_access_flags);
        if (merged_fields)
          is_static = (access_flags & kAccStatic) != 0;
        field = to_reflected_field (env, class_handle, id, is_static);
        name = call_object_method (env, field, java_api.field.get_name);
        name_str = get_string_utf_chars (env, name, NULL);
        modifiers = access_flags & 0xffff;

        model_add_field (model, name_str, id, modifiers);

        release_string_utf_chars (env, name, name_str);
        delete_local_ref (env, name);
        delete_local_ref (env, field);
      }
    }
  }
  else
  {
    jobject elements;

    elements = call_object_method (env, class_handle, java_api.clazz.get_declared_methods);
    n = get_array_length (env, elements);
    for (i = 0; i != n; i++)
    {
      jobject method, name;
      const char * name_str;
      jmethodID id;
      jint modifiers;

      method = get_object_array_element (env, elements, i);
      name = call_object_method (env, method, java_api.method.get_name);
      name_str = get_string_utf_chars (env, name, NULL);
      id = from_reflected_method (env, method);
      modifiers = call_int_method (env, method, java_api.method.get_modifiers);

      model_add_method (model, name_str, id, modifiers);

      release_string_utf_chars (env, name, name_str);
      delete_local_ref (env, name);
      delete_local_ref (env, method);
    }
    delete_local_ref (env, elements);

    elements = call_object_method (env, class_handle, java_api.clazz.get_declared_fields);
    n = get_array_length (env, elements);
    for (i = 0; i != n; i++)
    {
      jobject field, name;
      const char * name_str;
      jfieldID id;
      jint modifiers;

      field = get_object_array_element (env, elements, i);
      name = call_object_method (env, field, java_api.field.get_name);
      name_str = get_string_utf_chars (env, name, NULL);
      id = from_reflected_field (env, field);
      modifiers = call_int_method (env, field, java_api.field.get_modifiers);

      model_add_field (model, name_str, id, modifiers);

      release_string_utf_chars (env, name, name_str);
      delete_local_ref (env, name);
      delete_local_ref (env, field);
    }
    delete_local_ref (env, elements);
  }

  g_mutex_lock (&lock);
  g_array_append_val (models, model);
  g_mutex_unlock (&lock);

  return model;
}

static void
model_add_method (Model * self,
                  const gchar * name,
                  jmethodID id,
                  jint modifiers)
{
  GHashTable * members = self->members;
  gchar * key, type;
  const gchar * value;

  if (name[0] == '$')
    key = g_strdup_printf ("_%s", name);
  else
    key = g_strdup (name);

  type = (modifiers & kAccStatic) != 0 ? 's' : 'i';

  value = g_hash_table_lookup (members, key);
  if (value == NULL)
    g_hash_table_insert (members, key, g_strdup_printf ("m:%c0x%zx", type, id));
  else
    g_hash_table_insert (members, key, g_strdup_printf ("%s:%c0x%zx", value, type, id));
}

static void
model_add_field (Model * self,
                 const gchar * name,
                 jfieldID id,
                 jint modifiers)
{
  GHashTable * members = self->members;
  gchar * key, type;

  if (name[0] == '$')
    key = g_strdup_printf ("_%s", name);
  else
    key = g_strdup (name);
  while (g_hash_table_contains (members, key))
  {
    gchar * new_key = g_strdup_printf ("_%s", key);
    g_free (key);
    key = new_key;
  }

  type = (modifiers & kAccStatic) != 0 ? 's' : 'i';

  g_hash_table_insert (members, key, g_strdup_printf ("f:%c0x%zx", type, id));
}

static void
model_free (Model * model)
{
  g_hash_table_unref (model->members);

  g_free (model);
}

gboolean
model_has (Model * self,
           const gchar * member)
{
  return g_hash_table_contains (self->members, member);
}

const gchar *
model_find (Model * self,
            const gchar * member)
{
  return g_hash_table_lookup (self->members, member);
}

gchar *
model_list (Model * self)
{
  GString * result;
  GHashTableIter iter;
  guint i;
  const gchar * name;

  result = g_string_sized_new (128);

  g_string_append_c (result, '[');

  g_hash_table_iter_init (&iter, self->members);
  for (i = 0; g_hash_table_iter_next (&iter, (gpointer *) &name, NULL); i++)
  {
    if (i > 0)
      g_string_append_c (result, ',');

    g_string_append_c (result, '"');
    g_string_append (result, name);
    g_string_append_c (result, '"');
  }

  g_string_append_c (result, ']');

  return g_string_free (result, FALSE);
}

gchar *
enumerate_methods_art (const gchar * class_query,
                       const gchar * method_query,
                       jboolean include_signature,
                       jboolean ignore_case,
                       jboolean skip_system_classes)
{
  gchar * result;
  EnumerateMethodsContext ctx;
  ArtClassVisitor visitor;
  ArtClassVisitorVTable visitor_vtable = { NULL, };

  ctx.class_query = make_pattern_spec (class_query, ignore_case);
  ctx.method_query = make_pattern_spec (method_query, ignore_case);
  ctx.include_signature = include_signature;
  ctx.ignore_case = ignore_case;
  ctx.skip_system_classes = skip_system_classes;
  ctx.groups = g_hash_table_new_full (NULL, NULL, NULL, NULL);

  visitor.vtable = &visitor_vtable;
  visitor.user_data = &ctx;

  visitor_vtable.visit = collect_matching_class_methods;

  art_api.visit_classes (art_api.linker, &visitor);

  result = finalize_method_groups_to_json (ctx.groups);

  g_hash_table_unref (ctx.groups);
  g_pattern_spec_free (ctx.method_query);
  g_pattern_spec_free (ctx.class_query);

  return result;
}

static jboolean
collect_matching_class_methods (ArtClassVisitor * self,
                                ArtClass * klass)
{
  EnumerateMethodsContext * ctx = self->user_data;
  const char * descriptor;
  StdString descriptor_storage = { 0, };
  gchar * class_name = NULL;
  gchar * class_name_copy = NULL;
  const gchar * normalized_class_name;
  JsonBuilder * group;
  size_t class_name_length;
  GHashTable * seen_method_names;
  gpointer elements;
  guint n, i;

  if (ctx->skip_system_classes && klass->class_loader == 0)
    goto skip_class;

  descriptor = art_api.get_class_descriptor (klass, &descriptor_storage);
  if (descriptor[0] != 'L')
    goto skip_class;

  class_name = class_name_from_signature (descriptor);

  if (ctx->ignore_case)
  {
    class_name_copy = g_utf8_strdown (class_name, -1);
    normalized_class_name = class_name_copy;
  }
  else
  {
    normalized_class_name = class_name;
  }

  if (!g_pattern_match_string (ctx->class_query, normalized_class_name))
    goto skip_class;

  group = NULL;
  class_name_length = strlen (class_name);
  seen_method_names = ctx->include_signature ? NULL : g_hash_table_new_full (g_str_hash, g_str_equal, g_free, NULL);

  elements = read_art_array (klass, art_api.class_offset_methods, sizeof (gsize), NULL);
  n = *(guint16 *) ((gpointer) klass + art_api.class_offset_copied_methods_offset);
  for (i = 0; i != n; i++)
  {
    ArtMethod * method;
    guint32 access_flags;
    jboolean is_constructor;
    StdString method_name = { 0, };
    const gchar * bare_method_name;
    gchar * bare_method_name_copy = NULL;
    const gchar * normalized_method_name;
    gchar * normalized_method_name_copy = NULL;

    method = elements + (i * art_api.method_size);

    access_flags = *(guint32 *) ((gpointer) method + art_api.method_offset_access_flags);
    is_constructor = (access_flags & kAccConstructor) != 0;

    art_api.pretty_method (&method_name, method, ctx->include_signature);
    bare_method_name = std_string_c_str (&method_name);
    if (ctx->include_signature)
    {
      const gchar * return_type_end, * name_begin;
      GString * name;

      return_type_end = strchr (bare_method_name, ' ');
      name_begin = return_type_end + 1 + class_name_length + 1;
      if (is_constructor && g_str_has_prefix (name_begin, "<clinit>"))
        goto skip_method;

      name = g_string_sized_new (64);

      if (is_constructor)
      {
        g_string_append (name, "$init");
        g_string_append (name, strchr (name_begin, '>') + 1);
      }
      else
      {
        g_string_append (name, name_begin);
      }
      g_string_append (name, ": ");
      g_string_append_len (name, bare_method_name, return_type_end - bare_method_name);

      bare_method_name_copy = g_string_free (name, FALSE);
      bare_method_name = bare_method_name_copy;
    }
    else
    {
      const gchar * name_begin;

      name_begin = bare_method_name + class_name_length + 1;
      if (is_constructor && strcmp (name_begin, "<clinit>") == 0)
        goto skip_method;

      if (is_constructor)
        bare_method_name = "$init";
      else
        bare_method_name += class_name_length + 1;
    }

    if (seen_method_names != NULL && g_hash_table_contains (seen_method_names, bare_method_name))
      goto skip_method;

    if (ctx->ignore_case)
    {
      normalized_method_name_copy = g_utf8_strdown (bare_method_name, -1);
      normalized_method_name = normalized_method_name_copy;
    }
    else
    {
      normalized_method_name = bare_method_name;
    }

    if (!g_pattern_match_string (ctx->method_query, normalized_method_name))
      goto skip_method;

    if (group == NULL)
    {
      group = g_hash_table_lookup (ctx->groups, GUINT_TO_POINTER (klass->class_loader));
      if (group == NULL)
      {
        group = json_builder_new_immutable ();
        g_hash_table_insert (ctx->groups, GUINT_TO_POINTER (klass->class_loader), group);

        json_builder_begin_object (group);

        json_builder_set_member_name (group, "loader");
        json_builder_add_int_value (group, klass->class_loader);

        json_builder_set_member_name (group, "classes");
        json_builder_begin_array (group);
      }

      json_builder_begin_object (group);

      json_builder_set_member_name (group, "name");
      json_builder_add_string_value (group, class_name);

      json_builder_set_member_name (group, "methods");
      json_builder_begin_array (group);
    }

    json_builder_add_string_value (group, bare_method_name);

    if (seen_method_names != NULL)
      g_hash_table_add (seen_method_names, g_strdup (bare_method_name));

skip_method:
    g_free (normalized_method_name_copy);
    g_free (bare_method_name_copy);
    std_string_destroy (&method_name);
  }

  if (seen_method_names != NULL)
    g_hash_table_unref (seen_method_names);

  if (group == NULL)
    goto skip_class;

  json_builder_end_array (group);
  json_builder_end_object (group);

skip_class:
  g_free (class_name_copy);
  g_free (class_name);
  std_string_destroy (&descriptor_storage);

  return TRUE;
}

gchar *
enumerate_methods_jvm (const gchar * class_query,
                       const gchar * method_query,
                       jboolean include_signature,
                       jboolean ignore_case,
                       jboolean skip_system_classes,
                       JNIEnv * env,
                       jvmtiEnv * jvmti)
{
  gchar * result;
  GPatternSpec * class_pattern, * method_pattern;
  GHashTable * groups;
  gpointer * ef = env->functions;
  jobject (* new_global_ref) (JNIEnv *, jobject) = ef[21];
  void (* delete_local_ref) (JNIEnv *, jobject) = ef[23];
  jboolean (* is_same_object) (JNIEnv *, jobject, jobject) = ef[24];
  gpointer * jf = jvmti->functions - 1;
  jvmtiError (* deallocate) (jvmtiEnv *, void * mem) = jf[47];
  jvmtiError (* get_class_signature) (jvmtiEnv *, jclass, char **, char **) = jf[48];
  jvmtiError (* get_class_methods) (jvmtiEnv *, jclass, jint *, jmethodID **) = jf[52];
  jvmtiError (* get_class_loader) (jvmtiEnv *, jclass, jobject *) = jf[57];
  jvmtiError (* get_method_name) (jvmtiEnv *, jmethodID, char **, char **, char **) = jf[64];
  jvmtiError (* get_loaded_classes) (jvmtiEnv *, jint *, jclass **) = jf[78];
  jint class_count, class_index;
  jclass * classes;

  class_pattern = make_pattern_spec (class_query, ignore_case);
  method_pattern = make_pattern_spec (method_query, ignore_case);
  groups = g_hash_table_new_full (NULL, NULL, NULL, NULL);

  if (get_loaded_classes (jvmti, &class_count, &classes) != JVMTI_ERROR_NONE)
    goto emit_results;

  for (class_index = 0; class_index != class_count; class_index++)
  {
    jclass klass = classes[class_index];
    jobject loader = NULL;
    gboolean have_loader = FALSE;
    char * signature = NULL;
    gchar * class_name = NULL;
    gchar * class_name_copy = NULL;
    const gchar * normalized_class_name;
    jint method_count, method_index;
    jmethodID * methods = NULL;
    JsonBuilder * group = NULL;
    GHashTable * seen_method_names = NULL;

    if (skip_system_classes)
    {
      if (get_class_loader (jvmti, klass, &loader) != JVMTI_ERROR_NONE)
        goto skip_class;
      have_loader = TRUE;

      if (loader == NULL)
        goto skip_class;
    }

    if (get_class_signature (jvmti, klass, &signature, NULL) != JVMTI_ERROR_NONE)
      goto skip_class;

    class_name = class_name_from_signature (signature);

    if (ignore_case)
    {
      class_name_copy = g_utf8_strdown (class_name, -1);
      normalized_class_name = class_name_copy;
    }
    else
    {
      normalized_class_name = class_name;
    }

    if (!g_pattern_match_string (class_pattern, normalized_class_name))
      goto skip_class;

    if (get_class_methods (jvmti, klass, &method_count, &methods) != JVMTI_ERROR_NONE)
      goto skip_class;

    if (!include_signature)
      seen_method_names = g_hash_table_new_full (g_str_hash, g_str_equal, g_free, NULL);

    for (method_index = 0; method_index != method_count; method_index++)
    {
      jmethodID method = methods[method_index];
      const gchar * method_name;
      char * method_name_value = NULL;
      char * method_signature_value = NULL;
      gchar * method_name_copy = NULL;
      const gchar * normalized_method_name;
      gchar * normalized_method_name_copy = NULL;

      if (get_method_name (jvmti, method, &method_name_value, include_signature ? &method_signature_value : NULL, NULL) != JVMTI_ERROR_NONE)
        goto skip_method;
      method_name = method_name_value;

      if (method_name[0] == '<')
      {
        if (strcmp (method_name, "<init>") == 0)
          method_name = "$init";
        else if (strcmp (method_name, "<clinit>") == 0)
          goto skip_method;
      }

      if (include_signature)
      {
        method_name_copy = format_method_signature (method_name, method_signature_value);
        method_name = method_name_copy;
      }

      if (seen_method_names != NULL && g_hash_table_contains (seen_method_names, method_name))
        goto skip_method;

      if (ignore_case)
      {
        normalized_method_name_copy = g_utf8_strdown (method_name, -1);
        normalized_method_name = normalized_method_name_copy;
      }
      else
      {
        normalized_method_name = method_name;
      }

      if (!g_pattern_match_string (method_pattern, normalized_method_name))
        goto skip_method;

      if (group == NULL)
      {
        if (!have_loader && get_class_loader (jvmti, klass, &loader) != JVMTI_ERROR_NONE)
          goto skip_method;

        if (loader == NULL)
        {
          group = g_hash_table_lookup (groups, NULL);
        }
        else
        {
          GHashTableIter iter;
          jobject cur_loader;
          JsonBuilder * cur_group;

          g_hash_table_iter_init (&iter, groups);
          while (g_hash_table_iter_next (&iter, (gpointer *) &cur_loader, (gpointer *) &cur_group))
          {
            if (cur_loader != NULL && is_same_object (env, cur_loader, loader))
            {
              group = cur_group;
              break;
            }
          }
        }

        if (group == NULL)
        {
          jobject l;
          gchar * str;

          l = (loader != NULL) ? new_global_ref (env, loader) : NULL;

          group = json_builder_new_immutable ();
          g_hash_table_insert (groups, l, group);

          json_builder_begin_object (group);

          json_builder_set_member_name (group, "loader");
          str = g_strdup_printf ("0x%" G_GSIZE_MODIFIER "x", GPOINTER_TO_SIZE (l));
          json_builder_add_string_value (group, str);
          g_free (str);

          json_builder_set_member_name (group, "classes");
          json_builder_begin_array (group);
        }

        json_builder_begin_object (group);

        json_builder_set_member_name (group, "name");
        json_builder_add_string_value (group, class_name);

        json_builder_set_member_name (group, "methods");
        json_builder_begin_array (group);
      }

      json_builder_add_string_value (group, method_name);

      if (seen_method_names != NULL)
        g_hash_table_add (seen_method_names, g_strdup (method_name));

skip_method:
      g_free (normalized_method_name_copy);
      g_free (method_name_copy);
      deallocate (jvmti, method_signature_value);
      deallocate (jvmti, method_name_value);
    }

skip_class:
    if (group != NULL)
    {
      json_builder_end_array (group);
      json_builder_end_object (group);
    }

    if (seen_method_names != NULL)
      g_hash_table_unref (seen_method_names);

    deallocate (jvmti, methods);

    g_free (class_name_copy);
    g_free (class_name);
    deallocate (jvmti, signature);

    if (loader != NULL)
      delete_local_ref (env, loader);

    delete_local_ref (env, klass);
  }

  deallocate (jvmti, classes);

emit_results:
  result = finalize_method_groups_to_json (groups);

  g_hash_table_unref (groups);
  g_pattern_spec_free (method_pattern);
  g_pattern_spec_free (class_pattern);

  return result;
}

static gchar *
finalize_method_groups_to_json (GHashTable * groups)
{
  GString * result;
  GHashTableIter iter;
  guint i;
  JsonBuilder * group;

  result = g_string_sized_new (1024);

  g_string_append_c (result, '[');

  g_hash_table_iter_init (&iter, groups);
  for (i = 0; g_hash_table_iter_next (&iter, NULL, (gpointer *) &group); i++)
  {
    JsonNode * root;
    gchar * json;

    if (i > 0)
      g_string_append_c (result, ',');

    json_builder_end_array (group);
    json_builder_end_object (group);

    root = json_builder_get_root (group);
    json = json_to_string (root, FALSE);
    g_string_append (result, json);
    g_free (json);
    json_node_unref (root);

    g_object_unref (group);
  }

  g_string_append_c (result, ']');

  return g_string_free (result, FALSE);
}

static GPatternSpec *
make_pattern_spec (const gchar * pattern,
                   jboolean ignore_case)
{
  GPatternSpec * spec;

  if (ignore_case)
  {
    gchar * str = g_utf8_strdown (pattern, -1);
    spec = g_pattern_spec_new (str);
    g_free (str);
  }
  else
  {
    spec = g_pattern_spec_new (pattern);
  }

  return spec;
}

static gchar *
class_name_from_signature (const gchar * descriptor)
{
  gchar * result, * c;

  result = g_strdup (descriptor + 1);

  for (c = result; *c != '\\0'; c++)
  {
    if (*c == '/')
      *c = '.';
  }

  c[-1] = '\\0';

  return result;
}

static gchar *
format_method_signature (const gchar * name,
                         const gchar * signature)
{
  GString * sig;
  const gchar * cursor;
  gint arg_index;

  sig = g_string_sized_new (128);

  g_string_append (sig, name);

  cursor = signature;
  arg_index = -1;
  while (TRUE)
  {
    const gchar c = *cursor;

    if (c == '(')
    {
      g_string_append_c (sig, c);
      cursor++;
      arg_index = 0;
    }
    else if (c == ')')
    {
      g_string_append_c (sig, c);
      cursor++;
      break;
    }
    else
    {
      if (arg_index >= 1)
        g_string_append (sig, ", ");

      append_type (sig, &cursor);

      if (arg_index != -1)
        arg_index++;
    }
  }

  g_string_append (sig, ": ");
  append_type (sig, &cursor);

  return g_string_free (sig, FALSE);
}

static void
append_type (GString * output,
             const gchar ** type)
{
  const gchar * cursor = *type;

  switch (*cursor)
  {
    case 'Z':
      g_string_append (output, "boolean");
      cursor++;
      break;
    case 'B':
      g_string_append (output, "byte");
      cursor++;
      break;
    case 'C':
      g_string_append (output, "char");
      cursor++;
      break;
    case 'S':
      g_string_append (output, "short");
      cursor++;
      break;
    case 'I':
      g_string_append (output, "int");
      cursor++;
      break;
    case 'J':
      g_string_append (output, "long");
      cursor++;
      break;
    case 'F':
      g_string_append (output, "float");
      cursor++;
      break;
    case 'D':
      g_string_append (output, "double");
      cursor++;
      break;
    case 'V':
      g_string_append (output, "void");
      cursor++;
      break;
    case 'L':
    {
      gchar ch;

      cursor++;
      for (; (ch = *cursor) != ';'; cursor++)
      {
        g_string_append_c (output, (ch != '/') ? ch : '.');
      }
      cursor++;

      break;
    }
    case '[':
      *type = cursor + 1;
      append_type (output, type);
      g_string_append (output, "[]");
      return;
    default:
      g_string_append (output, "BUG");
      cursor++;
  }

  *type = cursor;
}

void
dealloc (gpointer mem)
{
  g_free (mem);
}

static gpointer
read_art_array (gpointer object_base,
                guint field_offset,
                guint length_size,
                guint * length)
{
  gpointer result, header;
  guint n;

  header = GSIZE_TO_POINTER (*(guint64 *) (object_base + field_offset));
  if (header != NULL)
  {
    result = header + length_size;
    if (length_size == sizeof (guint32))
      n = *(guint32 *) header;
    else
      n = *(guint64 *) header;
  }
  else
  {
    result = NULL;
    n = 0;
  }

  if (length != NULL)
    *length = n;

  return result;
}

static void
std_string_destroy (StdString * str)
{
  if ((str->l.capacity & 1) != 0)
    art_api.free (str->l.data);
}

static gchar *
std_string_c_str (StdString * self)
{
  if ((self->l.capacity & 1) != 0)
    return self->l.data;

  return self->s.data;
}
`;
var methodQueryPattern = /(.+)!([^/]+)\/?([isu]+)?/;
var cm = null;
var unwrap = null;
var Model = class _Model {
  static build(handle2, env) {
    ensureInitialized(env);
    return unwrap(handle2, env, (object) => {
      return new _Model(cm.new(handle2, object, env));
    });
  }
  static enumerateMethods(query, api3, env) {
    ensureInitialized(env);
    const params = query.match(methodQueryPattern);
    if (params === null) {
      throw new Error("Invalid query; format is: class!method -- see documentation of Java.enumerateMethods(query) for details");
    }
    const classQuery = Memory.allocUtf8String(params[1]);
    const methodQuery = Memory.allocUtf8String(params[2]);
    let includeSignature = false;
    let ignoreCase = false;
    let skipSystemClasses = false;
    const modifiers2 = params[3];
    if (modifiers2 !== void 0) {
      includeSignature = modifiers2.indexOf("s") !== -1;
      ignoreCase = modifiers2.indexOf("i") !== -1;
      skipSystemClasses = modifiers2.indexOf("u") !== -1;
    }
    let result;
    if (api3.flavor === "jvm") {
      const json = cm.enumerateMethodsJvm(
        classQuery,
        methodQuery,
        boolToNative(includeSignature),
        boolToNative(ignoreCase),
        boolToNative(skipSystemClasses),
        env,
        api3.jvmti
      );
      try {
        result = JSON.parse(json.readUtf8String()).map((group) => {
          const loaderRef = ptr(group.loader);
          group.loader = !loaderRef.isNull() ? loaderRef : null;
          return group;
        });
      } finally {
        cm.dealloc(json);
      }
    } else {
      withRunnableArtThread(env.vm, env, (thread) => {
        const json = cm.enumerateMethodsArt(
          classQuery,
          methodQuery,
          boolToNative(includeSignature),
          boolToNative(ignoreCase),
          boolToNative(skipSystemClasses)
        );
        try {
          const addGlobalReference = api3["art::JavaVMExt::AddGlobalRef"];
          const { vm: vmHandle } = api3;
          result = JSON.parse(json.readUtf8String()).map((group) => {
            const loaderObj = group.loader;
            group.loader = loaderObj !== 0 ? addGlobalReference(vmHandle, thread, ptr(loaderObj)) : null;
            return group;
          });
        } finally {
          cm.dealloc(json);
        }
      });
    }
    return result;
  }
  constructor(handle2) {
    this.handle = handle2;
  }
  has(member) {
    return cm.has(this.handle, Memory.allocUtf8String(member)) !== 0;
  }
  find(member) {
    return cm.find(this.handle, Memory.allocUtf8String(member)).readUtf8String();
  }
  list() {
    const str = cm.list(this.handle);
    try {
      return JSON.parse(str.readUtf8String());
    } finally {
      cm.dealloc(str);
    }
  }
};
function ensureInitialized(env) {
  if (cm === null) {
    cm = compileModule2(env);
    unwrap = makeHandleUnwrapper(cm, env.vm);
  }
}
function compileModule2(env) {
  const { pointerSize: pointerSize11 } = Process;
  const lockSize = 8;
  const modelsSize = pointerSize11;
  const javaApiSize = 6 * pointerSize11;
  const artApiSize = 10 * 4 + 5 * pointerSize11;
  const dataSize = lockSize + modelsSize + javaApiSize + artApiSize;
  const data = Memory.alloc(dataSize);
  const lock = data;
  const models = lock.add(lockSize);
  const javaApi = models.add(modelsSize);
  const { getDeclaredMethods, getDeclaredFields } = env.javaLangClass();
  const method2 = env.javaLangReflectMethod();
  const field = env.javaLangReflectField();
  let j = javaApi;
  [
    getDeclaredMethods,
    getDeclaredFields,
    method2.getName,
    method2.getModifiers,
    field.getName,
    field.getModifiers
  ].forEach((value) => {
    j = j.writePointer(value).add(pointerSize11);
  });
  const artApi = javaApi.add(javaApiSize);
  const { vm: vm3 } = env;
  const artClass = getArtClassSpec(vm3);
  if (artClass !== null) {
    const c = artClass.offset;
    const m2 = getArtMethodSpec(vm3);
    const f2 = getArtFieldSpec(vm3);
    let s = artApi;
    [
      1,
      c.ifields,
      c.methods,
      c.sfields,
      c.copiedMethodsOffset,
      m2.size,
      m2.offset.accessFlags,
      f2.size,
      f2.offset.accessFlags,
      4294967295
    ].forEach((value) => {
      s = s.writeUInt(value).add(4);
    });
    const api3 = getApi2();
    [
      api3.artClassLinker.address,
      api3["art::ClassLinker::VisitClasses"],
      api3["art::mirror::Class::GetDescriptor"],
      api3["art::ArtMethod::PrettyMethod"],
      Process.getModuleByName("libc.so").getExportByName("free")
    ].forEach((value, i) => {
      if (value === void 0) {
        value = NULL;
      }
      s = s.writePointer(value).add(pointerSize11);
    });
  }
  const cm2 = new CModule(code3, {
    lock,
    models,
    java_api: javaApi,
    art_api: artApi
  });
  const reentrantOptions = { exceptions: "propagate" };
  const fastOptions = { exceptions: "propagate", scheduling: "exclusive" };
  return {
    handle: cm2,
    mode: artClass !== null ? "full" : "basic",
    new: new NativeFunction(cm2.model_new, "pointer", ["pointer", "pointer", "pointer"], reentrantOptions),
    has: new NativeFunction(cm2.model_has, "bool", ["pointer", "pointer"], fastOptions),
    find: new NativeFunction(cm2.model_find, "pointer", ["pointer", "pointer"], fastOptions),
    list: new NativeFunction(cm2.model_list, "pointer", ["pointer"], fastOptions),
    enumerateMethodsArt: new NativeFunction(
      cm2.enumerate_methods_art,
      "pointer",
      ["pointer", "pointer", "bool", "bool", "bool"],
      reentrantOptions
    ),
    enumerateMethodsJvm: new NativeFunction(cm2.enumerate_methods_jvm, "pointer", [
      "pointer",
      "pointer",
      "bool",
      "bool",
      "bool",
      "pointer",
      "pointer"
    ], reentrantOptions),
    dealloc: new NativeFunction(cm2.dealloc, "void", ["pointer"], fastOptions)
  };
}
function makeHandleUnwrapper(cm2, vm3) {
  if (cm2.mode === "basic") {
    return nullUnwrap;
  }
  const decodeGlobal = getApi2()["art::JavaVMExt::DecodeGlobal"];
  return function(handle2, env, fn) {
    let result;
    withRunnableArtThread(vm3, env, (thread) => {
      const object = decodeGlobal(vm3, thread, handle2);
      result = fn(object);
    });
    return result;
  };
}
function nullUnwrap(handle2, env, fn) {
  return fn(NULL);
}
function boolToNative(val) {
  return val ? 1 : 0;
}

// node_modules/frida-java-bridge/lib/lru.js
var LRU = class {
  constructor(capacity, destroy) {
    this.items = /* @__PURE__ */ new Map();
    this.capacity = capacity;
    this.destroy = destroy;
  }
  dispose(env) {
    const { items, destroy } = this;
    items.forEach((val) => {
      destroy(val, env);
    });
    items.clear();
  }
  get(key) {
    const { items } = this;
    const item = items.get(key);
    if (item !== void 0) {
      items.delete(key);
      items.set(key, item);
    }
    return item;
  }
  set(key, val, env) {
    const { items } = this;
    const existingVal = items.get(key);
    if (existingVal !== void 0) {
      items.delete(key);
      this.destroy(existingVal, env);
    } else if (items.size === this.capacity) {
      const oldestKey = items.keys().next().value;
      const oldestVal = items.get(oldestKey);
      items.delete(oldestKey);
      this.destroy(oldestVal, env);
    }
    items.set(key, val);
  }
};

// node_modules/frida-java-bridge/lib/mkdex.js
var kAccPublic2 = 1;
var kAccNative2 = 256;
var kAccConstructor = 65536;
var kEndianTag = 305419896;
var kClassDefSize = 32;
var kProtoIdSize = 12;
var kFieldIdSize = 8;
var kMethodIdSize = 8;
var kTypeIdSize = 4;
var kStringIdSize = 4;
var kMapItemSize = 12;
var TYPE_HEADER_ITEM = 0;
var TYPE_STRING_ID_ITEM = 1;
var TYPE_TYPE_ID_ITEM = 2;
var TYPE_PROTO_ID_ITEM = 3;
var TYPE_FIELD_ID_ITEM = 4;
var TYPE_METHOD_ID_ITEM = 5;
var TYPE_CLASS_DEF_ITEM = 6;
var TYPE_MAP_LIST = 4096;
var TYPE_TYPE_LIST = 4097;
var TYPE_ANNOTATION_SET_ITEM = 4099;
var TYPE_CLASS_DATA_ITEM = 8192;
var TYPE_CODE_ITEM = 8193;
var TYPE_STRING_DATA_ITEM = 8194;
var TYPE_DEBUG_INFO_ITEM = 8195;
var TYPE_ANNOTATION_ITEM = 8196;
var TYPE_ANNOTATIONS_DIRECTORY_ITEM = 8198;
var VALUE_TYPE = 24;
var VALUE_ARRAY = 28;
var VISIBILITY_SYSTEM = 2;
var kDefaultConstructorSize = 24;
var kDefaultConstructorDebugInfo = Buffer2.from([3, 0, 7, 14, 0]);
var kDalvikAnnotationTypeThrows = "Ldalvik/annotation/Throws;";
var kNullTerminator = Buffer2.from([0]);
function mkdex(spec) {
  const builder = new DexBuilder();
  const fullSpec = Object.assign({}, spec);
  builder.addClass(fullSpec);
  return builder.build();
}
var DexBuilder = class {
  constructor() {
    this.classes = [];
  }
  addClass(spec) {
    this.classes.push(spec);
  }
  build() {
    const model = computeModel(this.classes);
    const {
      classes,
      interfaces,
      fields,
      methods,
      protos,
      parameters,
      annotationDirectories,
      annotationSets,
      throwsAnnotations,
      types: types2,
      strings
    } = model;
    let offset = 0;
    const headerOffset = 0;
    const checksumOffset = 8;
    const signatureOffset = 12;
    const signatureSize = 20;
    const headerSize = 112;
    offset += headerSize;
    const stringIdsOffset = offset;
    const stringIdsSize = strings.length * kStringIdSize;
    offset += stringIdsSize;
    const typeIdsOffset = offset;
    const typeIdsSize = types2.length * kTypeIdSize;
    offset += typeIdsSize;
    const protoIdsOffset = offset;
    const protoIdsSize = protos.length * kProtoIdSize;
    offset += protoIdsSize;
    const fieldIdsOffset = offset;
    const fieldIdsSize = fields.length * kFieldIdSize;
    offset += fieldIdsSize;
    const methodIdsOffset = offset;
    const methodIdsSize = methods.length * kMethodIdSize;
    offset += methodIdsSize;
    const classDefsOffset = offset;
    const classDefsSize = classes.length * kClassDefSize;
    offset += classDefsSize;
    const dataOffset = offset;
    const annotationSetOffsets = annotationSets.map((set) => {
      const setOffset = offset;
      set.offset = setOffset;
      offset += 4 + set.items.length * 4;
      return setOffset;
    });
    const javaCodeItems = classes.reduce((result, klass) => {
      const constructorMethods = klass.classData.constructorMethods;
      constructorMethods.forEach((method2) => {
        const [, accessFlags, superConstructor] = method2;
        if ((accessFlags & kAccNative2) === 0 && superConstructor >= 0) {
          method2.push(offset);
          result.push({ offset, superConstructor });
          offset += kDefaultConstructorSize;
        }
      });
      return result;
    }, []);
    annotationDirectories.forEach((dir) => {
      dir.offset = offset;
      offset += 16 + dir.methods.length * 8;
    });
    const interfaceOffsets = interfaces.map((iface) => {
      offset = align2(offset, 4);
      const ifaceOffset = offset;
      iface.offset = ifaceOffset;
      offset += 4 + 2 * iface.types.length;
      return ifaceOffset;
    });
    const parameterOffsets = parameters.map((param) => {
      offset = align2(offset, 4);
      const paramOffset = offset;
      param.offset = paramOffset;
      offset += 4 + 2 * param.types.length;
      return paramOffset;
    });
    const stringChunks = [];
    const stringOffsets = strings.map((str) => {
      const strOffset = offset;
      const header = Buffer2.from(createUleb128(str.length));
      const data = Buffer2.from(str, "utf8");
      const chunk = Buffer2.concat([header, data, kNullTerminator]);
      stringChunks.push(chunk);
      offset += chunk.length;
      return strOffset;
    });
    const debugInfoOffsets = javaCodeItems.map((codeItem) => {
      const debugOffset = offset;
      offset += kDefaultConstructorDebugInfo.length;
      return debugOffset;
    });
    const throwsAnnotationBlobs = throwsAnnotations.map((annotation) => {
      const blob = makeThrowsAnnotation(annotation);
      annotation.offset = offset;
      offset += blob.length;
      return blob;
    });
    const classDataBlobs = classes.map((klass, index) => {
      klass.classData.offset = offset;
      const blob = makeClassData(klass);
      offset += blob.length;
      return blob;
    });
    const linkSize = 0;
    const linkOffset = 0;
    offset = align2(offset, 4);
    const mapOffset = offset;
    const typeListLength = interfaces.length + parameters.length;
    const mapNumItems = 4 + (fields.length > 0 ? 1 : 0) + 2 + annotationSets.length + javaCodeItems.length + annotationDirectories.length + (typeListLength > 0 ? 1 : 0) + 1 + debugInfoOffsets.length + throwsAnnotations.length + classes.length + 1;
    const mapSize = 4 + mapNumItems * kMapItemSize;
    offset += mapSize;
    const dataSize = offset - dataOffset;
    const fileSize = offset;
    const dex = Buffer2.alloc(fileSize);
    dex.write("dex\n035");
    dex.writeUInt32LE(fileSize, 32);
    dex.writeUInt32LE(headerSize, 36);
    dex.writeUInt32LE(kEndianTag, 40);
    dex.writeUInt32LE(linkSize, 44);
    dex.writeUInt32LE(linkOffset, 48);
    dex.writeUInt32LE(mapOffset, 52);
    dex.writeUInt32LE(strings.length, 56);
    dex.writeUInt32LE(stringIdsOffset, 60);
    dex.writeUInt32LE(types2.length, 64);
    dex.writeUInt32LE(typeIdsOffset, 68);
    dex.writeUInt32LE(protos.length, 72);
    dex.writeUInt32LE(protoIdsOffset, 76);
    dex.writeUInt32LE(fields.length, 80);
    dex.writeUInt32LE(fields.length > 0 ? fieldIdsOffset : 0, 84);
    dex.writeUInt32LE(methods.length, 88);
    dex.writeUInt32LE(methodIdsOffset, 92);
    dex.writeUInt32LE(classes.length, 96);
    dex.writeUInt32LE(classDefsOffset, 100);
    dex.writeUInt32LE(dataSize, 104);
    dex.writeUInt32LE(dataOffset, 108);
    stringOffsets.forEach((offset2, index) => {
      dex.writeUInt32LE(offset2, stringIdsOffset + index * kStringIdSize);
    });
    types2.forEach((id, index) => {
      dex.writeUInt32LE(id, typeIdsOffset + index * kTypeIdSize);
    });
    protos.forEach((proto, index) => {
      const [shortyIndex, returnTypeIndex, params] = proto;
      const protoOffset = protoIdsOffset + index * kProtoIdSize;
      dex.writeUInt32LE(shortyIndex, protoOffset);
      dex.writeUInt32LE(returnTypeIndex, protoOffset + 4);
      dex.writeUInt32LE(params !== null ? params.offset : 0, protoOffset + 8);
    });
    fields.forEach((field, index) => {
      const [classIndex, typeIndex, nameIndex] = field;
      const fieldOffset = fieldIdsOffset + index * kFieldIdSize;
      dex.writeUInt16LE(classIndex, fieldOffset);
      dex.writeUInt16LE(typeIndex, fieldOffset + 2);
      dex.writeUInt32LE(nameIndex, fieldOffset + 4);
    });
    methods.forEach((method2, index) => {
      const [classIndex, protoIndex, nameIndex] = method2;
      const methodOffset = methodIdsOffset + index * kMethodIdSize;
      dex.writeUInt16LE(classIndex, methodOffset);
      dex.writeUInt16LE(protoIndex, methodOffset + 2);
      dex.writeUInt32LE(nameIndex, methodOffset + 4);
    });
    classes.forEach((klass, index) => {
      const { interfaces: interfaces2, annotationsDirectory } = klass;
      const interfacesOffset = interfaces2 !== null ? interfaces2.offset : 0;
      const annotationsOffset = annotationsDirectory !== null ? annotationsDirectory.offset : 0;
      const staticValuesOffset = 0;
      const classOffset = classDefsOffset + index * kClassDefSize;
      dex.writeUInt32LE(klass.index, classOffset);
      dex.writeUInt32LE(klass.accessFlags, classOffset + 4);
      dex.writeUInt32LE(klass.superClassIndex, classOffset + 8);
      dex.writeUInt32LE(interfacesOffset, classOffset + 12);
      dex.writeUInt32LE(klass.sourceFileIndex, classOffset + 16);
      dex.writeUInt32LE(annotationsOffset, classOffset + 20);
      dex.writeUInt32LE(klass.classData.offset, classOffset + 24);
      dex.writeUInt32LE(staticValuesOffset, classOffset + 28);
    });
    annotationSets.forEach((set, index) => {
      const { items } = set;
      const setOffset = annotationSetOffsets[index];
      dex.writeUInt32LE(items.length, setOffset);
      items.forEach((item, index2) => {
        dex.writeUInt32LE(item.offset, setOffset + 4 + index2 * 4);
      });
    });
    javaCodeItems.forEach((codeItem, index) => {
      const { offset: offset2, superConstructor } = codeItem;
      const registersSize = 1;
      const insSize = 1;
      const outsSize = 1;
      const triesSize = 0;
      const insnsSize = 4;
      dex.writeUInt16LE(registersSize, offset2);
      dex.writeUInt16LE(insSize, offset2 + 2);
      dex.writeUInt16LE(outsSize, offset2 + 4);
      dex.writeUInt16LE(triesSize, offset2 + 6);
      dex.writeUInt32LE(debugInfoOffsets[index], offset2 + 8);
      dex.writeUInt32LE(insnsSize, offset2 + 12);
      dex.writeUInt16LE(4208, offset2 + 16);
      dex.writeUInt16LE(superConstructor, offset2 + 18);
      dex.writeUInt16LE(0, offset2 + 20);
      dex.writeUInt16LE(14, offset2 + 22);
    });
    annotationDirectories.forEach((dir) => {
      const dirOffset = dir.offset;
      const classAnnotationsOffset = 0;
      const fieldsSize = 0;
      const annotatedMethodsSize = dir.methods.length;
      const annotatedParametersSize = 0;
      dex.writeUInt32LE(classAnnotationsOffset, dirOffset);
      dex.writeUInt32LE(fieldsSize, dirOffset + 4);
      dex.writeUInt32LE(annotatedMethodsSize, dirOffset + 8);
      dex.writeUInt32LE(annotatedParametersSize, dirOffset + 12);
      dir.methods.forEach((method2, index) => {
        const entryOffset = dirOffset + 16 + index * 8;
        const [methodIndex, annotationSet] = method2;
        dex.writeUInt32LE(methodIndex, entryOffset);
        dex.writeUInt32LE(annotationSet.offset, entryOffset + 4);
      });
    });
    interfaces.forEach((iface, index) => {
      const ifaceOffset = interfaceOffsets[index];
      dex.writeUInt32LE(iface.types.length, ifaceOffset);
      iface.types.forEach((type, typeIndex) => {
        dex.writeUInt16LE(type, ifaceOffset + 4 + typeIndex * 2);
      });
    });
    parameters.forEach((param, index) => {
      const paramOffset = parameterOffsets[index];
      dex.writeUInt32LE(param.types.length, paramOffset);
      param.types.forEach((type, typeIndex) => {
        dex.writeUInt16LE(type, paramOffset + 4 + typeIndex * 2);
      });
    });
    stringChunks.forEach((chunk, index) => {
      chunk.copy(dex, stringOffsets[index]);
    });
    debugInfoOffsets.forEach((debugInfoOffset) => {
      kDefaultConstructorDebugInfo.copy(dex, debugInfoOffset);
    });
    throwsAnnotationBlobs.forEach((annotationBlob, index) => {
      annotationBlob.copy(dex, throwsAnnotations[index].offset);
    });
    classDataBlobs.forEach((classDataBlob, index) => {
      classDataBlob.copy(dex, classes[index].classData.offset);
    });
    dex.writeUInt32LE(mapNumItems, mapOffset);
    const mapItems = [
      [TYPE_HEADER_ITEM, 1, headerOffset],
      [TYPE_STRING_ID_ITEM, strings.length, stringIdsOffset],
      [TYPE_TYPE_ID_ITEM, types2.length, typeIdsOffset],
      [TYPE_PROTO_ID_ITEM, protos.length, protoIdsOffset]
    ];
    if (fields.length > 0) {
      mapItems.push([TYPE_FIELD_ID_ITEM, fields.length, fieldIdsOffset]);
    }
    mapItems.push([TYPE_METHOD_ID_ITEM, methods.length, methodIdsOffset]);
    mapItems.push([TYPE_CLASS_DEF_ITEM, classes.length, classDefsOffset]);
    annotationSets.forEach((set, index) => {
      mapItems.push([TYPE_ANNOTATION_SET_ITEM, set.items.length, annotationSetOffsets[index]]);
    });
    javaCodeItems.forEach((codeItem) => {
      mapItems.push([TYPE_CODE_ITEM, 1, codeItem.offset]);
    });
    annotationDirectories.forEach((dir) => {
      mapItems.push([TYPE_ANNOTATIONS_DIRECTORY_ITEM, 1, dir.offset]);
    });
    if (typeListLength > 0) {
      mapItems.push([TYPE_TYPE_LIST, typeListLength, interfaceOffsets.concat(parameterOffsets)[0]]);
    }
    mapItems.push([TYPE_STRING_DATA_ITEM, strings.length, stringOffsets[0]]);
    debugInfoOffsets.forEach((debugInfoOffset) => {
      mapItems.push([TYPE_DEBUG_INFO_ITEM, 1, debugInfoOffset]);
    });
    throwsAnnotations.forEach((annotation) => {
      mapItems.push([TYPE_ANNOTATION_ITEM, 1, annotation.offset]);
    });
    classes.forEach((klass) => {
      mapItems.push([TYPE_CLASS_DATA_ITEM, 1, klass.classData.offset]);
    });
    mapItems.push([TYPE_MAP_LIST, 1, mapOffset]);
    mapItems.forEach((item, index) => {
      const [type, size, offset2] = item;
      const itemOffset = mapOffset + 4 + index * kMapItemSize;
      dex.writeUInt16LE(type, itemOffset);
      dex.writeUInt32LE(size, itemOffset + 4);
      dex.writeUInt32LE(offset2, itemOffset + 8);
    });
    const hash = new Checksum("sha1");
    hash.update(dex.slice(signatureOffset + signatureSize));
    Buffer2.from(hash.getDigest()).copy(dex, signatureOffset);
    dex.writeUInt32LE(adler32(dex, signatureOffset), checksumOffset);
    return dex;
  }
};
function makeClassData(klass) {
  const { instanceFields, constructorMethods, virtualMethods } = klass.classData;
  const staticFieldsSize = 0;
  return Buffer2.from([
    staticFieldsSize
  ].concat(createUleb128(instanceFields.length)).concat(createUleb128(constructorMethods.length)).concat(createUleb128(virtualMethods.length)).concat(instanceFields.reduce((result, [indexDiff, accessFlags]) => {
    return result.concat(createUleb128(indexDiff)).concat(createUleb128(accessFlags));
  }, [])).concat(constructorMethods.reduce((result, [indexDiff, accessFlags, , codeOffset]) => {
    return result.concat(createUleb128(indexDiff)).concat(createUleb128(accessFlags)).concat(createUleb128(codeOffset || 0));
  }, [])).concat(virtualMethods.reduce((result, [indexDiff, accessFlags]) => {
    const codeOffset = 0;
    return result.concat(createUleb128(indexDiff)).concat(createUleb128(accessFlags)).concat([codeOffset]);
  }, [])));
}
function makeThrowsAnnotation(annotation) {
  const { thrownTypes } = annotation;
  return Buffer2.from(
    [
      VISIBILITY_SYSTEM
    ].concat(createUleb128(annotation.type)).concat([1]).concat(createUleb128(annotation.value)).concat([VALUE_ARRAY, thrownTypes.length]).concat(thrownTypes.reduce((result, type) => {
      result.push(VALUE_TYPE, type);
      return result;
    }, []))
  );
}
function computeModel(classes) {
  const strings = /* @__PURE__ */ new Set();
  const types2 = /* @__PURE__ */ new Set();
  const protos = {};
  const fields = [];
  const methods = [];
  const throwsAnnotations = {};
  const javaConstructors = /* @__PURE__ */ new Set();
  const superConstructors = /* @__PURE__ */ new Set();
  classes.forEach((klass) => {
    const { name, superClass, sourceFileName } = klass;
    strings.add("this");
    strings.add(name);
    types2.add(name);
    strings.add(superClass);
    types2.add(superClass);
    strings.add(sourceFileName);
    klass.interfaces.forEach((iface) => {
      strings.add(iface);
      types2.add(iface);
    });
    klass.fields.forEach((field) => {
      const [fieldName, fieldType] = field;
      strings.add(fieldName);
      strings.add(fieldType);
      types2.add(fieldType);
      fields.push([klass.name, fieldType, fieldName]);
    });
    if (!klass.methods.some(([methodName]) => methodName === "<init>")) {
      klass.methods.unshift(["<init>", "V", []]);
      javaConstructors.add(name);
    }
    klass.methods.forEach((method2) => {
      const [methodName, retType2, argTypes2, thrownTypes = [], accessFlags] = method2;
      strings.add(methodName);
      const protoId = addProto(retType2, argTypes2);
      let throwsAnnotationId = null;
      if (thrownTypes.length > 0) {
        const typesNormalized = thrownTypes.slice();
        typesNormalized.sort();
        throwsAnnotationId = typesNormalized.join("|");
        let throwsAnnotation = throwsAnnotations[throwsAnnotationId];
        if (throwsAnnotation === void 0) {
          throwsAnnotation = {
            id: throwsAnnotationId,
            types: typesNormalized
          };
          throwsAnnotations[throwsAnnotationId] = throwsAnnotation;
        }
        strings.add(kDalvikAnnotationTypeThrows);
        types2.add(kDalvikAnnotationTypeThrows);
        thrownTypes.forEach((type) => {
          strings.add(type);
          types2.add(type);
        });
        strings.add("value");
      }
      methods.push([klass.name, protoId, methodName, throwsAnnotationId, accessFlags]);
      if (methodName === "<init>") {
        superConstructors.add(name + "|" + protoId);
        const superConstructorId = superClass + "|" + protoId;
        if (javaConstructors.has(name) && !superConstructors.has(superConstructorId)) {
          methods.push([superClass, protoId, methodName, null, 0]);
          superConstructors.add(superConstructorId);
        }
      }
    });
  });
  function addProto(retType2, argTypes2) {
    const signature2 = [retType2].concat(argTypes2);
    const id = signature2.join("|");
    if (protos[id] !== void 0) {
      return id;
    }
    strings.add(retType2);
    types2.add(retType2);
    argTypes2.forEach((argType) => {
      strings.add(argType);
      types2.add(argType);
    });
    const shorty = signature2.map(typeToShorty).join("");
    strings.add(shorty);
    protos[id] = [id, shorty, retType2, argTypes2];
    return id;
  }
  const stringItems = Array.from(strings);
  stringItems.sort();
  const stringToIndex = stringItems.reduce((result, string, index) => {
    result[string] = index;
    return result;
  }, {});
  const typeItems = Array.from(types2).map((name) => stringToIndex[name]);
  typeItems.sort(compareNumbers);
  const typeToIndex = typeItems.reduce((result, stringIndex, typeIndex) => {
    result[stringItems[stringIndex]] = typeIndex;
    return result;
  }, {});
  const literalProtoItems = Object.keys(protos).map((id) => protos[id]);
  literalProtoItems.sort(compareProtoItems);
  const parameters = {};
  const protoItems = literalProtoItems.map((item) => {
    const [, shorty, retType2, argTypes2] = item;
    let params;
    if (argTypes2.length > 0) {
      const argTypesSig = argTypes2.join("|");
      params = parameters[argTypesSig];
      if (params === void 0) {
        params = {
          types: argTypes2.map((type) => typeToIndex[type]),
          offset: -1
        };
        parameters[argTypesSig] = params;
      }
    } else {
      params = null;
    }
    return [
      stringToIndex[shorty],
      typeToIndex[retType2],
      params
    ];
  });
  const protoToIndex = literalProtoItems.reduce((result, item, index) => {
    const [id] = item;
    result[id] = index;
    return result;
  }, {});
  const parameterItems = Object.keys(parameters).map((id) => parameters[id]);
  const fieldItems = fields.map((field) => {
    const [klass, fieldType, fieldName] = field;
    return [
      typeToIndex[klass],
      typeToIndex[fieldType],
      stringToIndex[fieldName]
    ];
  });
  fieldItems.sort(compareFieldItems);
  const methodItems = methods.map((method2) => {
    const [klass, protoId, name, annotationsId, accessFlags] = method2;
    return [
      typeToIndex[klass],
      protoToIndex[protoId],
      stringToIndex[name],
      annotationsId,
      accessFlags
    ];
  });
  methodItems.sort(compareMethodItems);
  const throwsAnnotationItems = Object.keys(throwsAnnotations).map((id) => throwsAnnotations[id]).map((item) => {
    return {
      id: item.id,
      type: typeToIndex[kDalvikAnnotationTypeThrows],
      value: stringToIndex.value,
      thrownTypes: item.types.map((type) => typeToIndex[type]),
      offset: -1
    };
  });
  const annotationSetItems = throwsAnnotationItems.map((item) => {
    return {
      id: item.id,
      items: [item],
      offset: -1
    };
  });
  const annotationSetIdToIndex = annotationSetItems.reduce((result, item, index) => {
    result[item.id] = index;
    return result;
  }, {});
  const interfaceLists = {};
  const annotationDirectories = [];
  const classItems = classes.map((klass) => {
    const classIndex = typeToIndex[klass.name];
    const accessFlags = kAccPublic2;
    const superClassIndex = typeToIndex[klass.superClass];
    let ifaceList;
    const ifaces = klass.interfaces.map((type) => typeToIndex[type]);
    if (ifaces.length > 0) {
      ifaces.sort(compareNumbers);
      const ifacesId = ifaces.join("|");
      ifaceList = interfaceLists[ifacesId];
      if (ifaceList === void 0) {
        ifaceList = {
          types: ifaces,
          offset: -1
        };
        interfaceLists[ifacesId] = ifaceList;
      }
    } else {
      ifaceList = null;
    }
    const sourceFileIndex = stringToIndex[klass.sourceFileName];
    const classMethods = methodItems.reduce((result, method2, index) => {
      const [holder, protoIndex, name, annotationsId, accessFlags2] = method2;
      if (holder === classIndex) {
        result.push([index, name, annotationsId, protoIndex, accessFlags2]);
      }
      return result;
    }, []);
    let annotationsDirectory = null;
    const methodAnnotations = classMethods.filter(([, , annotationsId]) => {
      return annotationsId !== null;
    }).map(([index, , annotationsId]) => {
      return [index, annotationSetItems[annotationSetIdToIndex[annotationsId]]];
    });
    if (methodAnnotations.length > 0) {
      annotationsDirectory = {
        methods: methodAnnotations,
        offset: -1
      };
      annotationDirectories.push(annotationsDirectory);
    }
    const instanceFields = fieldItems.reduce((result, field, index) => {
      const [holder] = field;
      if (holder === classIndex) {
        result.push([index > 0 ? 1 : 0, kAccPublic2]);
      }
      return result;
    }, []);
    const constructorNameIndex = stringToIndex["<init>"];
    const constructorMethods = classMethods.filter(([, name]) => name === constructorNameIndex).map(([index, , , protoIndex]) => {
      if (javaConstructors.has(klass.name)) {
        let superConstructor = -1;
        const numMethodItems = methodItems.length;
        for (let i = 0; i !== numMethodItems; i++) {
          const [methodClass, methodProto, methodName] = methodItems[i];
          if (methodClass === superClassIndex && methodName === constructorNameIndex && methodProto === protoIndex) {
            superConstructor = i;
            break;
          }
        }
        return [index, kAccPublic2 | kAccConstructor, superConstructor];
      } else {
        return [index, kAccPublic2 | kAccConstructor | kAccNative2, -1];
      }
    });
    const virtualMethods = compressClassMethodIndexes(classMethods.filter(([, name]) => name !== constructorNameIndex).map(([index, , , , accessFlags2]) => {
      return [index, accessFlags2 | kAccPublic2 | kAccNative2];
    }));
    const classData = {
      instanceFields,
      constructorMethods,
      virtualMethods,
      offset: -1
    };
    return {
      index: classIndex,
      accessFlags,
      superClassIndex,
      interfaces: ifaceList,
      sourceFileIndex,
      annotationsDirectory,
      classData
    };
  });
  const interfaceItems = Object.keys(interfaceLists).map((id) => interfaceLists[id]);
  return {
    classes: classItems,
    interfaces: interfaceItems,
    fields: fieldItems,
    methods: methodItems,
    protos: protoItems,
    parameters: parameterItems,
    annotationDirectories,
    annotationSets: annotationSetItems,
    throwsAnnotations: throwsAnnotationItems,
    types: typeItems,
    strings: stringItems
  };
}
function compressClassMethodIndexes(items) {
  let previousIndex = 0;
  return items.map(([index, accessFlags], elementIndex) => {
    let result;
    if (elementIndex === 0) {
      result = [index, accessFlags];
    } else {
      result = [index - previousIndex, accessFlags];
    }
    previousIndex = index;
    return result;
  });
}
function compareNumbers(a, b) {
  return a - b;
}
function compareProtoItems(a, b) {
  const [, , aRetType, aArgTypes] = a;
  const [, , bRetType, bArgTypes] = b;
  if (aRetType < bRetType) {
    return -1;
  }
  if (aRetType > bRetType) {
    return 1;
  }
  const aArgTypesSig = aArgTypes.join("|");
  const bArgTypesSig = bArgTypes.join("|");
  if (aArgTypesSig < bArgTypesSig) {
    return -1;
  }
  if (aArgTypesSig > bArgTypesSig) {
    return 1;
  }
  return 0;
}
function compareFieldItems(a, b) {
  const [aClass, aType, aName] = a;
  const [bClass, bType, bName] = b;
  if (aClass !== bClass) {
    return aClass - bClass;
  }
  if (aName !== bName) {
    return aName - bName;
  }
  return aType - bType;
}
function compareMethodItems(a, b) {
  const [aClass, aProto, aName] = a;
  const [bClass, bProto, bName] = b;
  if (aClass !== bClass) {
    return aClass - bClass;
  }
  if (aName !== bName) {
    return aName - bName;
  }
  return aProto - bProto;
}
function typeToShorty(type) {
  const firstCharacter = type[0];
  return firstCharacter === "L" || firstCharacter === "[" ? "L" : type;
}
function createUleb128(value) {
  if (value <= 127) {
    return [value];
  }
  const result = [];
  let moreSlicesNeeded = false;
  do {
    let slice2 = value & 127;
    value >>= 7;
    moreSlicesNeeded = value !== 0;
    if (moreSlicesNeeded) {
      slice2 |= 128;
    }
    result.push(slice2);
  } while (moreSlicesNeeded);
  return result;
}
function align2(value, alignment) {
  const alignmentDelta = value % alignment;
  if (alignmentDelta === 0) {
    return value;
  }
  return value + alignment - alignmentDelta;
}
function adler32(buffer, offset) {
  let a = 1;
  let b = 0;
  const length = buffer.length;
  for (let i = offset; i < length; i++) {
    a = (a + buffer[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16 | a) >>> 0;
}
var mkdex_default = mkdex;

// node_modules/frida-java-bridge/lib/types.js
var JNILocalRefType = 1;
var vm = null;
var primitiveArrayHandler = null;
function initialize(_vm) {
  vm = _vm;
}
function getType(typeName, unbox, factory) {
  let type = getPrimitiveType(typeName);
  if (type === null) {
    if (typeName.indexOf("[") === 0) {
      type = getArrayType(typeName, unbox, factory);
    } else {
      if (typeName[0] === "L" && typeName[typeName.length - 1] === ";") {
        typeName = typeName.substring(1, typeName.length - 1);
      }
      type = getObjectType(typeName, unbox, factory);
    }
  }
  return Object.assign({ className: typeName }, type);
}
var primitiveTypes = {
  boolean: {
    name: "Z",
    type: "uint8",
    size: 1,
    byteSize: 1,
    defaultValue: false,
    isCompatible(v) {
      return typeof v === "boolean";
    },
    fromJni(v) {
      return !!v;
    },
    toJni(v) {
      return v ? 1 : 0;
    },
    read(address) {
      return address.readU8();
    },
    write(address, value) {
      address.writeU8(value);
    },
    toString() {
      return this.name;
    }
  },
  byte: {
    name: "B",
    type: "int8",
    size: 1,
    byteSize: 1,
    defaultValue: 0,
    isCompatible(v) {
      return Number.isInteger(v) && v >= -128 && v <= 127;
    },
    fromJni: identity,
    toJni: identity,
    read(address) {
      return address.readS8();
    },
    write(address, value) {
      address.writeS8(value);
    },
    toString() {
      return this.name;
    }
  },
  char: {
    name: "C",
    type: "uint16",
    size: 1,
    byteSize: 2,
    defaultValue: 0,
    isCompatible(v) {
      if (typeof v !== "string" || v.length !== 1) {
        return false;
      }
      const code4 = v.charCodeAt(0);
      return code4 >= 0 && code4 <= 65535;
    },
    fromJni(c) {
      return String.fromCharCode(c);
    },
    toJni(s) {
      return s.charCodeAt(0);
    },
    read(address) {
      return address.readU16();
    },
    write(address, value) {
      address.writeU16(value);
    },
    toString() {
      return this.name;
    }
  },
  short: {
    name: "S",
    type: "int16",
    size: 1,
    byteSize: 2,
    defaultValue: 0,
    isCompatible(v) {
      return Number.isInteger(v) && v >= -32768 && v <= 32767;
    },
    fromJni: identity,
    toJni: identity,
    read(address) {
      return address.readS16();
    },
    write(address, value) {
      address.writeS16(value);
    },
    toString() {
      return this.name;
    }
  },
  int: {
    name: "I",
    type: "int32",
    size: 1,
    byteSize: 4,
    defaultValue: 0,
    isCompatible(v) {
      return Number.isInteger(v) && v >= -2147483648 && v <= 2147483647;
    },
    fromJni: identity,
    toJni: identity,
    read(address) {
      return address.readS32();
    },
    write(address, value) {
      address.writeS32(value);
    },
    toString() {
      return this.name;
    }
  },
  long: {
    name: "J",
    type: "int64",
    size: 2,
    byteSize: 8,
    defaultValue: 0,
    isCompatible(v) {
      return typeof v === "number" || v instanceof Int64;
    },
    fromJni: identity,
    toJni: identity,
    read(address) {
      return address.readS64();
    },
    write(address, value) {
      address.writeS64(value);
    },
    toString() {
      return this.name;
    }
  },
  float: {
    name: "F",
    type: "float",
    size: 1,
    byteSize: 4,
    defaultValue: 0,
    isCompatible(v) {
      return typeof v === "number";
    },
    fromJni: identity,
    toJni: identity,
    read(address) {
      return address.readFloat();
    },
    write(address, value) {
      address.writeFloat(value);
    },
    toString() {
      return this.name;
    }
  },
  double: {
    name: "D",
    type: "double",
    size: 2,
    byteSize: 8,
    defaultValue: 0,
    isCompatible(v) {
      return typeof v === "number";
    },
    fromJni: identity,
    toJni: identity,
    read(address) {
      return address.readDouble();
    },
    write(address, value) {
      address.writeDouble(value);
    },
    toString() {
      return this.name;
    }
  },
  void: {
    name: "V",
    type: "void",
    size: 0,
    byteSize: 0,
    defaultValue: void 0,
    isCompatible(v) {
      return v === void 0;
    },
    fromJni() {
      return void 0;
    },
    toJni() {
      return NULL;
    },
    toString() {
      return this.name;
    }
  }
};
var primitiveTypesNames = new Set(Object.values(primitiveTypes).map((t) => t.name));
function getPrimitiveType(name) {
  const result = primitiveTypes[name];
  return result !== void 0 ? result : null;
}
function getObjectType(typeName, unbox, factory) {
  const cache = factory._types[unbox ? 1 : 0];
  let type = cache[typeName];
  if (type !== void 0) {
    return type;
  }
  if (typeName === "java.lang.Object") {
    type = getJavaLangObjectType(factory);
  } else {
    type = getAnyObjectType(typeName, unbox, factory);
  }
  cache[typeName] = type;
  return type;
}
function getJavaLangObjectType(factory) {
  return {
    name: "Ljava/lang/Object;",
    type: "pointer",
    size: 1,
    defaultValue: NULL,
    isCompatible(v) {
      if (v === null) {
        return true;
      }
      if (v === void 0) {
        return false;
      }
      const isWrapper = v.$h instanceof NativePointer;
      if (isWrapper) {
        return true;
      }
      return typeof v === "string";
    },
    fromJni(h, env, owned) {
      if (h.isNull()) {
        return null;
      }
      return factory.cast(h, factory.use("java.lang.Object"), owned);
    },
    toJni(o, env) {
      if (o === null) {
        return NULL;
      }
      if (typeof o === "string") {
        return env.newStringUtf(o);
      }
      return o.$h;
    }
  };
}
function getAnyObjectType(typeName, unbox, factory) {
  let cachedClass = null;
  let cachedIsInstance = null;
  let cachedIsDefaultString = null;
  function getClass() {
    if (cachedClass === null) {
      cachedClass = factory.use(typeName).class;
    }
    return cachedClass;
  }
  function isInstance(v) {
    const klass = getClass();
    if (cachedIsInstance === null) {
      cachedIsInstance = klass.isInstance.overload("java.lang.Object");
    }
    return cachedIsInstance.call(klass, v);
  }
  function typeIsDefaultString() {
    if (cachedIsDefaultString === null) {
      const x = getClass();
      cachedIsDefaultString = factory.use("java.lang.String").class.isAssignableFrom(x);
    }
    return cachedIsDefaultString;
  }
  return {
    name: makeJniObjectTypeName(typeName),
    type: "pointer",
    size: 1,
    defaultValue: NULL,
    isCompatible(v) {
      if (v === null) {
        return true;
      }
      if (v === void 0) {
        return false;
      }
      const isWrapper = v.$h instanceof NativePointer;
      if (isWrapper) {
        return isInstance(v);
      }
      return typeof v === "string" && typeIsDefaultString();
    },
    fromJni(h, env, owned) {
      if (h.isNull()) {
        return null;
      }
      if (typeIsDefaultString() && unbox) {
        return env.stringFromJni(h);
      }
      return factory.cast(h, factory.use(typeName), owned);
    },
    toJni(o, env) {
      if (o === null) {
        return NULL;
      }
      if (typeof o === "string") {
        return env.newStringUtf(o);
      }
      return o.$h;
    },
    toString() {
      return this.name;
    }
  };
}
var primitiveArrayTypes = [
  ["Z", "boolean"],
  ["B", "byte"],
  ["C", "char"],
  ["D", "double"],
  ["F", "float"],
  ["I", "int"],
  ["J", "long"],
  ["S", "short"]
].reduce((result, [shorty, name]) => {
  result["[" + shorty] = makePrimitiveArrayType("[" + shorty, name);
  return result;
}, {});
function makePrimitiveArrayType(shorty, name) {
  const envProto = Env.prototype;
  const nameTitled = toTitleCase(name);
  const spec = {
    typeName: name,
    newArray: envProto["new" + nameTitled + "Array"],
    setRegion: envProto["set" + nameTitled + "ArrayRegion"],
    getElements: envProto["get" + nameTitled + "ArrayElements"],
    releaseElements: envProto["release" + nameTitled + "ArrayElements"]
  };
  return {
    name: shorty,
    type: "pointer",
    size: 1,
    defaultValue: NULL,
    isCompatible(v) {
      return isCompatiblePrimitiveArray(v, name);
    },
    fromJni(h, env, owned) {
      return fromJniPrimitiveArray(h, spec, env, owned);
    },
    toJni(arr, env) {
      return toJniPrimitiveArray(arr, spec, env);
    }
  };
}
function getArrayType(typeName, unbox, factory) {
  const primitiveType = primitiveArrayTypes[typeName];
  if (primitiveType !== void 0) {
    return primitiveType;
  }
  if (typeName.indexOf("[") !== 0) {
    throw new Error("Unsupported type: " + typeName);
  }
  let elementTypeName = typeName.substring(1);
  const elementType = getType(elementTypeName, unbox, factory);
  let numInternalArrays = 0;
  const end = elementTypeName.length;
  while (numInternalArrays !== end && elementTypeName[numInternalArrays] === "[") {
    numInternalArrays++;
  }
  elementTypeName = elementTypeName.substring(numInternalArrays);
  if (elementTypeName[0] === "L" && elementTypeName[elementTypeName.length - 1] === ";") {
    elementTypeName = elementTypeName.substring(1, elementTypeName.length - 1);
  }
  let internalElementTypeName = elementTypeName.replace(/\./g, "/");
  if (primitiveTypesNames.has(internalElementTypeName)) {
    internalElementTypeName = "[".repeat(numInternalArrays) + internalElementTypeName;
  } else {
    internalElementTypeName = "[".repeat(numInternalArrays) + "L" + internalElementTypeName + ";";
  }
  const internalTypeName = "[" + internalElementTypeName;
  elementTypeName = "[".repeat(numInternalArrays) + elementTypeName;
  return {
    name: typeName.replace(/\./g, "/"),
    type: "pointer",
    size: 1,
    defaultValue: NULL,
    isCompatible(v) {
      if (v === null) {
        return true;
      }
      if (typeof v !== "object" || v.length === void 0) {
        return false;
      }
      return v.every(function(element) {
        return elementType.isCompatible(element);
      });
    },
    fromJni(arr, env, owned) {
      if (arr.isNull()) {
        return null;
      }
      const result = [];
      const n = env.getArrayLength(arr);
      for (let i = 0; i !== n; i++) {
        const element = env.getObjectArrayElement(arr, i);
        try {
          result.push(elementType.fromJni(element, env));
        } finally {
          env.deleteLocalRef(element);
        }
      }
      try {
        result.$w = factory.cast(arr, factory.use(internalTypeName), owned);
      } catch (e) {
        factory.use("java.lang.reflect.Array").newInstance(factory.use(elementTypeName).class, 0);
        result.$w = factory.cast(arr, factory.use(internalTypeName), owned);
      }
      result.$dispose = disposeObjectArray;
      return result;
    },
    toJni(elements, env) {
      if (elements === null) {
        return NULL;
      }
      if (!(elements instanceof Array)) {
        throw new Error("Expected an array");
      }
      const wrapper = elements.$w;
      if (wrapper !== void 0) {
        return wrapper.$h;
      }
      const n = elements.length;
      const klassObj = factory.use(elementTypeName);
      const classHandle = klassObj.$borrowClassHandle(env);
      try {
        const result = env.newObjectArray(n, classHandle.value, NULL);
        env.throwIfExceptionPending();
        for (let i = 0; i !== n; i++) {
          const handle2 = elementType.toJni(elements[i], env);
          try {
            env.setObjectArrayElement(result, i, handle2);
          } finally {
            if (elementType.type === "pointer" && env.getObjectRefType(handle2) === JNILocalRefType) {
              env.deleteLocalRef(handle2);
            }
          }
          env.throwIfExceptionPending();
        }
        return result;
      } finally {
        classHandle.unref(env);
      }
    }
  };
}
function disposeObjectArray() {
  const n = this.length;
  for (let i = 0; i !== n; i++) {
    const obj = this[i];
    if (obj === null) {
      continue;
    }
    const dispose2 = obj.$dispose;
    if (dispose2 === void 0) {
      break;
    }
    dispose2.call(obj);
  }
  this.$w.$dispose();
}
function fromJniPrimitiveArray(arr, spec, env, owned) {
  if (arr.isNull()) {
    return null;
  }
  const type = getPrimitiveType(spec.typeName);
  const length = env.getArrayLength(arr);
  return new PrimitiveArray(arr, spec, type, length, env, owned);
}
function toJniPrimitiveArray(arr, spec, env) {
  if (arr === null) {
    return NULL;
  }
  const handle2 = arr.$h;
  if (handle2 !== void 0) {
    return handle2;
  }
  const length = arr.length;
  const type = getPrimitiveType(spec.typeName);
  const result = spec.newArray.call(env, length);
  if (result.isNull()) {
    throw new Error("Unable to construct array");
  }
  if (length > 0) {
    const elementSize = type.byteSize;
    const writeElement = type.write;
    const unparseElementValue = type.toJni;
    const elements = Memory.alloc(length * type.byteSize);
    for (let index = 0; index !== length; index++) {
      writeElement(elements.add(index * elementSize), unparseElementValue(arr[index]));
    }
    spec.setRegion.call(env, result, 0, length, elements);
    env.throwIfExceptionPending();
  }
  return result;
}
function isCompatiblePrimitiveArray(value, typeName) {
  if (value === null) {
    return true;
  }
  if (value instanceof PrimitiveArray) {
    return value.$s.typeName === typeName;
  }
  const isArrayLike = typeof value === "object" && value.length !== void 0;
  if (!isArrayLike) {
    return false;
  }
  const elementType = getPrimitiveType(typeName);
  return Array.prototype.every.call(value, (element) => elementType.isCompatible(element));
}
function PrimitiveArray(handle2, spec, type, length, env, owned = true) {
  if (owned) {
    const h = env.newGlobalRef(handle2);
    this.$h = h;
    this.$r = Script.bindWeak(this, env.vm.makeHandleDestructor(h));
  } else {
    this.$h = handle2;
    this.$r = null;
  }
  this.$s = spec;
  this.$t = type;
  this.length = length;
  return new Proxy(this, primitiveArrayHandler);
}
primitiveArrayHandler = {
  has(target, property) {
    if (property in target) {
      return true;
    }
    return target.tryParseIndex(property) !== null;
  },
  get(target, property, receiver) {
    const index = target.tryParseIndex(property);
    if (index === null) {
      return target[property];
    }
    return target.readElement(index);
  },
  set(target, property, value, receiver) {
    const index = target.tryParseIndex(property);
    if (index === null) {
      target[property] = value;
      return true;
    }
    target.writeElement(index, value);
    return true;
  },
  ownKeys(target) {
    const keys = [];
    const { length } = target;
    for (let i = 0; i !== length; i++) {
      const key = i.toString();
      keys.push(key);
    }
    keys.push("length");
    return keys;
  },
  getOwnPropertyDescriptor(target, property) {
    const index = target.tryParseIndex(property);
    if (index !== null) {
      return {
        writable: true,
        configurable: true,
        enumerable: true
      };
    }
    return Object.getOwnPropertyDescriptor(target, property);
  }
};
Object.defineProperties(PrimitiveArray.prototype, {
  $dispose: {
    enumerable: true,
    value() {
      const ref = this.$r;
      if (ref !== null) {
        this.$r = null;
        Script.unbindWeak(ref);
      }
    }
  },
  $clone: {
    value(env) {
      return new PrimitiveArray(this.$h, this.$s, this.$t, this.length, env);
    }
  },
  tryParseIndex: {
    value(rawIndex) {
      if (typeof rawIndex === "symbol") {
        return null;
      }
      const index = parseInt(rawIndex);
      if (isNaN(index) || index < 0 || index >= this.length) {
        return null;
      }
      return index;
    }
  },
  readElement: {
    value(index) {
      return this.withElements((elements) => {
        const type = this.$t;
        return type.fromJni(type.read(elements.add(index * type.byteSize)));
      });
    }
  },
  writeElement: {
    value(index, value) {
      const { $h: handle2, $s: spec, $t: type } = this;
      const env = vm.getEnv();
      const element = Memory.alloc(type.byteSize);
      type.write(element, type.toJni(value));
      spec.setRegion.call(env, handle2, index, 1, element);
    }
  },
  withElements: {
    value(perform) {
      const { $h: handle2, $s: spec } = this;
      const env = vm.getEnv();
      const elements = spec.getElements.call(env, handle2);
      if (elements.isNull()) {
        throw new Error("Unable to get array elements");
      }
      try {
        return perform(elements);
      } finally {
        spec.releaseElements.call(env, handle2, elements);
      }
    }
  },
  toJSON: {
    value() {
      const { length, $t: type } = this;
      const { byteSize: elementSize, fromJni, read: read2 } = type;
      return this.withElements((elements) => {
        const values = [];
        for (let i = 0; i !== length; i++) {
          const value = fromJni(read2(elements.add(i * elementSize)));
          values.push(value);
        }
        return values;
      });
    }
  },
  toString: {
    value() {
      return this.toJSON().toString();
    }
  }
});
function makeJniObjectTypeName(typeName) {
  return "L" + typeName.replace(/\./g, "/") + ";";
}
function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function identity(value) {
  return value;
}

// node_modules/frida-java-bridge/lib/class-factory.js
var jsizeSize3 = 4;
var {
  ensureClassInitialized: ensureClassInitialized3,
  makeMethodMangler: makeMethodMangler3
} = android_exports;
var kAccStatic2 = 8;
var CONSTRUCTOR_METHOD = 1;
var STATIC_METHOD = 2;
var INSTANCE_METHOD = 3;
var STATIC_FIELD = 1;
var INSTANCE_FIELD = 2;
var STRATEGY_VIRTUAL = 1;
var STRATEGY_DIRECT = 2;
var PENDING_USE = Symbol("PENDING_USE");
var DEFAULT_CACHE_DIR = "/data/local/tmp";
var {
  getCurrentThreadId,
  pointerSize: pointerSize9
} = Process;
var factoryCache = {
  state: "empty",
  factories: [],
  loaders: null,
  Integer: null
};
var vm2 = null;
var api2 = null;
var isArtVm = null;
var wrapperHandler = null;
var dispatcherPrototype = null;
var methodPrototype = null;
var valueOfPrototype = null;
var cachedLoaderInvoke = null;
var cachedLoaderMethod = null;
var ignoredThreads = /* @__PURE__ */ new Map();
var ClassFactory = class _ClassFactory {
  static _initialize(_vm, _api) {
    vm2 = _vm;
    api2 = _api;
    isArtVm = _api.flavor === "art";
    if (_api.flavor === "jvm") {
      ensureClassInitialized3 = ensureClassInitialized2;
      makeMethodMangler3 = makeMethodMangler2;
    }
  }
  static _disposeAll(env) {
    factoryCache.factories.forEach((factory) => {
      factory._dispose(env);
    });
  }
  static get(classLoader) {
    const cache = getFactoryCache();
    const defaultFactory = cache.factories[0];
    if (classLoader === null) {
      return defaultFactory;
    }
    const indexObj = cache.loaders.get(classLoader);
    if (indexObj !== null) {
      const index = defaultFactory.cast(indexObj, cache.Integer);
      return cache.factories[index.intValue()];
    }
    const factory = new _ClassFactory();
    factory.loader = classLoader;
    factory.cacheDir = defaultFactory.cacheDir;
    addFactoryToCache(factory, classLoader);
    return factory;
  }
  constructor() {
    this.cacheDir = DEFAULT_CACHE_DIR;
    this.codeCacheDir = DEFAULT_CACHE_DIR + "/dalvik-cache";
    this.tempFileNaming = {
      prefix: "frida",
      suffix: ""
    };
    this._classes = {};
    this._classHandles = new LRU(10, releaseClassHandle);
    this._patchedMethods = /* @__PURE__ */ new Set();
    this._loader = null;
    this._types = [{}, {}];
    factoryCache.factories.push(this);
  }
  _dispose(env) {
    Array.from(this._patchedMethods).forEach((method2) => {
      method2.implementation = null;
    });
    this._patchedMethods.clear();
    revertGlobalPatches();
    this._classHandles.dispose(env);
    this._classes = {};
  }
  get loader() {
    return this._loader;
  }
  set loader(value) {
    const isInitial = this._loader === null && value !== null;
    this._loader = value;
    if (isInitial && factoryCache.state === "ready" && this === factoryCache.factories[0]) {
      addFactoryToCache(this, value);
    }
  }
  use(className, options = {}) {
    const allowCached = options.cache !== "skip";
    let C = allowCached ? this._getUsedClass(className) : void 0;
    if (C === void 0) {
      try {
        const env = vm2.getEnv();
        const { _loader: loader } = this;
        const getClassHandle = loader !== null ? makeLoaderClassHandleGetter(className, loader, env) : makeBasicClassHandleGetter(className);
        C = this._make(className, getClassHandle, env);
      } finally {
        if (allowCached) {
          this._setUsedClass(className, C);
        }
      }
    }
    return C;
  }
  _getUsedClass(className) {
    let c;
    while ((c = this._classes[className]) === PENDING_USE) {
      Thread.sleep(0.05);
    }
    if (c === void 0) {
      this._classes[className] = PENDING_USE;
    }
    return c;
  }
  _setUsedClass(className, c) {
    if (c !== void 0) {
      this._classes[className] = c;
    } else {
      delete this._classes[className];
    }
  }
  _make(name, getClassHandle, env) {
    const C = makeClassWrapperConstructor();
    const proto = Object.create(Wrapper.prototype, {
      [Symbol.for("n")]: {
        value: name
      },
      $n: {
        get() {
          return this[Symbol.for("n")];
        }
      },
      [Symbol.for("C")]: {
        value: C
      },
      $C: {
        get() {
          return this[Symbol.for("C")];
        }
      },
      [Symbol.for("w")]: {
        value: null,
        writable: true
      },
      $w: {
        get() {
          return this[Symbol.for("w")];
        },
        set(val) {
          this[Symbol.for("w")] = val;
        }
      },
      [Symbol.for("_s")]: {
        writable: true
      },
      $_s: {
        get() {
          return this[Symbol.for("_s")];
        },
        set(val) {
          this[Symbol.for("_s")] = val;
        }
      },
      [Symbol.for("c")]: {
        value: [null]
      },
      $c: {
        get() {
          return this[Symbol.for("c")];
        }
      },
      [Symbol.for("m")]: {
        value: /* @__PURE__ */ new Map()
      },
      $m: {
        get() {
          return this[Symbol.for("m")];
        }
      },
      [Symbol.for("l")]: {
        value: null,
        writable: true
      },
      $l: {
        get() {
          return this[Symbol.for("l")];
        },
        set(val) {
          this[Symbol.for("l")] = val;
        }
      },
      [Symbol.for("gch")]: {
        value: getClassHandle
      },
      $gch: {
        get() {
          return this[Symbol.for("gch")];
        }
      },
      [Symbol.for("f")]: {
        value: this
      },
      $f: {
        get() {
          return this[Symbol.for("f")];
        }
      }
    });
    C.prototype = proto;
    const classWrapper = new C(null);
    proto[Symbol.for("w")] = classWrapper;
    proto.$w = classWrapper;
    const h = classWrapper.$borrowClassHandle(env);
    try {
      const classHandle = h.value;
      ensureClassInitialized3(env, classHandle);
      proto.$l = Model.build(classHandle, env);
    } finally {
      h.unref(env);
    }
    return classWrapper;
  }
  retain(obj) {
    const env = vm2.getEnv();
    return obj.$clone(env);
  }
  cast(obj, klass, owned) {
    const env = vm2.getEnv();
    let handle2 = obj.$h;
    if (handle2 === void 0) {
      handle2 = obj;
    }
    const h = klass.$borrowClassHandle(env);
    try {
      const isValidCast = env.isInstanceOf(handle2, h.value);
      if (!isValidCast) {
        throw new Error(`Cast from '${env.getObjectClassName(handle2)}' to '${klass.$n}' isn't possible`);
      }
    } finally {
      h.unref(env);
    }
    const C = klass.$C;
    return new C(handle2, STRATEGY_VIRTUAL, env, owned);
  }
  wrap(handle2, klass, env) {
    const C = klass.$C;
    const wrapper = new C(handle2, STRATEGY_VIRTUAL, env, false);
    wrapper.$r = Script.bindWeak(wrapper, vm2.makeHandleDestructor(handle2));
    return wrapper;
  }
  array(type, elements) {
    const env = vm2.getEnv();
    const primitiveType = getPrimitiveType(type);
    if (primitiveType !== null) {
      type = primitiveType.name;
    }
    const arrayType2 = getArrayType("[" + type, false, this);
    const rawArray = arrayType2.toJni(elements, env);
    return arrayType2.fromJni(rawArray, env, true);
  }
  registerClass(spec) {
    const env = vm2.getEnv();
    const tempHandles = [];
    try {
      const Class = this.use("java.lang.Class");
      const Method = env.javaLangReflectMethod();
      const invokeObjectMethodNoArgs = env.vaMethod("pointer", []);
      const className = spec.name;
      const interfaces = spec.implements || [];
      const superClass = spec.superClass || this.use("java.lang.Object");
      const dexFields = [];
      const dexMethods = [];
      const dexSpec = {
        name: makeJniObjectTypeName(className),
        sourceFileName: makeSourceFileName(className),
        superClass: makeJniObjectTypeName(superClass.$n),
        interfaces: interfaces.map((iface) => makeJniObjectTypeName(iface.$n)),
        fields: dexFields,
        methods: dexMethods
      };
      const allInterfaces = interfaces.slice();
      interfaces.forEach((iface) => {
        Array.prototype.slice.call(iface.class.getInterfaces()).forEach((baseIface) => {
          const baseIfaceName = this.cast(baseIface, Class).getCanonicalName();
          allInterfaces.push(this.use(baseIfaceName));
        });
      });
      const fields = spec.fields || {};
      Object.getOwnPropertyNames(fields).forEach((name) => {
        const fieldType = this._getType(fields[name]);
        dexFields.push([name, fieldType.name]);
      });
      const baseMethods = {};
      const pendingOverloads = {};
      allInterfaces.forEach((iface) => {
        const h = iface.$borrowClassHandle(env);
        tempHandles.push(h);
        const ifaceHandle = h.value;
        iface.$ownMembers.filter((name) => {
          return iface[name].overloads !== void 0;
        }).forEach((name) => {
          const method2 = iface[name];
          const overloads = method2.overloads;
          const overloadIds = overloads.map((overload) => makeOverloadId(name, overload.returnType, overload.argumentTypes));
          baseMethods[name] = [method2, overloadIds, ifaceHandle];
          overloads.forEach((overload, index) => {
            const id = overloadIds[index];
            pendingOverloads[id] = [overload, ifaceHandle];
          });
        });
      });
      const methods = spec.methods || {};
      const methodNames = Object.keys(methods);
      const methodEntries = methodNames.reduce((result, name) => {
        const entry = methods[name];
        const rawName = name === "$init" ? "<init>" : name;
        if (entry instanceof Array) {
          result.push(...entry.map((e) => [rawName, e]));
        } else {
          result.push([rawName, entry]);
        }
        return result;
      }, []);
      const implMethods = [];
      methodEntries.forEach(([name, methodValue]) => {
        let type = INSTANCE_METHOD;
        let returnType;
        let argumentTypes;
        let thrownTypeNames = [];
        let impl;
        if (typeof methodValue === "function") {
          const m2 = baseMethods[name];
          if (m2 !== void 0 && Array.isArray(m2)) {
            const [baseMethod, overloadIds, parentTypeHandle] = m2;
            if (overloadIds.length > 1) {
              throw new Error(`More than one overload matching '${name}': signature must be specified`);
            }
            delete pendingOverloads[overloadIds[0]];
            const overload = baseMethod.overloads[0];
            type = overload.type;
            returnType = overload.returnType;
            argumentTypes = overload.argumentTypes;
            impl = methodValue;
            const reflectedMethod = env.toReflectedMethod(parentTypeHandle, overload.handle, 0);
            const thrownTypes = invokeObjectMethodNoArgs(env.handle, reflectedMethod, Method.getGenericExceptionTypes);
            thrownTypeNames = readTypeNames(env, thrownTypes).map(makeJniObjectTypeName);
            env.deleteLocalRef(thrownTypes);
            env.deleteLocalRef(reflectedMethod);
          } else {
            returnType = this._getType("void");
            argumentTypes = [];
            impl = methodValue;
          }
        } else {
          if (methodValue.isStatic) {
            type = STATIC_METHOD;
          }
          returnType = this._getType(methodValue.returnType || "void");
          argumentTypes = (methodValue.argumentTypes || []).map((name2) => this._getType(name2));
          impl = methodValue.implementation;
          if (typeof impl !== "function") {
            throw new Error("Expected a function implementation for method: " + name);
          }
          const id = makeOverloadId(name, returnType, argumentTypes);
          const pendingOverload = pendingOverloads[id];
          if (pendingOverload !== void 0) {
            const [overload, parentTypeHandle] = pendingOverload;
            delete pendingOverloads[id];
            type = overload.type;
            returnType = overload.returnType;
            argumentTypes = overload.argumentTypes;
            const reflectedMethod = env.toReflectedMethod(parentTypeHandle, overload.handle, 0);
            const thrownTypes = invokeObjectMethodNoArgs(env.handle, reflectedMethod, Method.getGenericExceptionTypes);
            thrownTypeNames = readTypeNames(env, thrownTypes).map(makeJniObjectTypeName);
            env.deleteLocalRef(thrownTypes);
            env.deleteLocalRef(reflectedMethod);
          }
        }
        const returnTypeName = returnType.name;
        const argumentTypeNames = argumentTypes.map((t) => t.name);
        const signature2 = "(" + argumentTypeNames.join("") + ")" + returnTypeName;
        dexMethods.push([name, returnTypeName, argumentTypeNames, thrownTypeNames, type === STATIC_METHOD ? kAccStatic2 : 0]);
        implMethods.push([name, signature2, type, returnType, argumentTypes, impl]);
      });
      const unimplementedMethodIds = Object.keys(pendingOverloads);
      if (unimplementedMethodIds.length > 0) {
        throw new Error("Missing implementation for: " + unimplementedMethodIds.join(", "));
      }
      const dex = DexFile.fromBuffer(mkdex_default(dexSpec), this);
      try {
        dex.load();
      } finally {
        dex.file.delete();
      }
      const classWrapper = this.use(spec.name);
      const numMethods = methodEntries.length;
      if (numMethods > 0) {
        const methodElementSize = 3 * pointerSize9;
        const methodElements = Memory.alloc(numMethods * methodElementSize);
        const nativeMethods = [];
        const temporaryHandles = [];
        implMethods.forEach(([name, signature2, type, returnType, argumentTypes, impl], index) => {
          const rawName = Memory.allocUtf8String(name);
          const rawSignature = Memory.allocUtf8String(signature2);
          const rawImpl = implement(name, classWrapper, type, returnType, argumentTypes, impl);
          methodElements.add(index * methodElementSize).writePointer(rawName);
          methodElements.add(index * methodElementSize + pointerSize9).writePointer(rawSignature);
          methodElements.add(index * methodElementSize + 2 * pointerSize9).writePointer(rawImpl);
          temporaryHandles.push(rawName, rawSignature);
          nativeMethods.push(rawImpl);
        });
        const h = classWrapper.$borrowClassHandle(env);
        tempHandles.push(h);
        const classHandle = h.value;
        env.registerNatives(classHandle, methodElements, numMethods);
        env.throwIfExceptionPending();
        classWrapper.$nativeMethods = nativeMethods;
      }
      return classWrapper;
    } finally {
      tempHandles.forEach((h) => {
        h.unref(env);
      });
    }
  }
  choose(specifier, callbacks) {
    const env = vm2.getEnv();
    const { flavor } = api2;
    if (flavor === "jvm") {
      this._chooseObjectsJvm(specifier, env, callbacks);
    } else if (flavor === "art") {
      const legacyApiMissing = api2["art::gc::Heap::VisitObjects"] === void 0;
      if (legacyApiMissing) {
        const preA12ApiMissing = api2["art::gc::Heap::GetInstances"] === void 0;
        if (preA12ApiMissing) {
          return this._chooseObjectsJvm(specifier, env, callbacks);
        }
      }
      withRunnableArtThread(vm2, env, (thread) => {
        if (legacyApiMissing) {
          this._chooseObjectsArtPreA12(specifier, env, thread, callbacks);
        } else {
          this._chooseObjectsArtLegacy(specifier, env, thread, callbacks);
        }
      });
    } else {
      this._chooseObjectsDalvik(specifier, env, callbacks);
    }
  }
  _chooseObjectsJvm(className, env, callbacks) {
    const classWrapper = this.use(className);
    const { jvmti } = api2;
    const JVMTI_ITERATION_CONTINUE = 1;
    const JVMTI_HEAP_OBJECT_EITHER = 3;
    const h = classWrapper.$borrowClassHandle(env);
    const tag = int64(h.value.toString());
    try {
      const heapObjectCallback = new NativeCallback((classTag, size, tagPtr2, userData) => {
        tagPtr2.writeS64(tag);
        return JVMTI_ITERATION_CONTINUE;
      }, "int", ["int64", "int64", "pointer", "pointer"]);
      jvmti.iterateOverInstancesOfClass(h.value, JVMTI_HEAP_OBJECT_EITHER, heapObjectCallback, h.value);
      const tagPtr = Memory.alloc(8);
      tagPtr.writeS64(tag);
      const countPtr = Memory.alloc(jsizeSize3);
      const objectsPtr = Memory.alloc(pointerSize9);
      jvmti.getObjectsWithTags(1, tagPtr, countPtr, objectsPtr, NULL);
      const count = countPtr.readS32();
      const objects = objectsPtr.readPointer();
      const handles = [];
      for (let i = 0; i !== count; i++) {
        handles.push(objects.add(i * pointerSize9).readPointer());
      }
      jvmti.deallocate(objects);
      try {
        for (const handle2 of handles) {
          const instance = this.cast(handle2, classWrapper);
          const result = callbacks.onMatch(instance);
          if (result === "stop") {
            break;
          }
        }
        callbacks.onComplete();
      } finally {
        handles.forEach((handle2) => {
          env.deleteLocalRef(handle2);
        });
      }
    } finally {
      h.unref(env);
    }
  }
  _chooseObjectsArtPreA12(className, env, thread, callbacks) {
    const classWrapper = this.use(className);
    const scope = VariableSizedHandleScope.$new(thread, vm2);
    let needle;
    const h = classWrapper.$borrowClassHandle(env);
    try {
      const object = api2["art::JavaVMExt::DecodeGlobal"](api2.vm, thread, h.value);
      needle = scope.newHandle(object);
    } finally {
      h.unref(env);
    }
    const maxCount = 0;
    const instances = HandleVector.$new();
    api2["art::gc::Heap::GetInstances"](api2.artHeap, scope, needle, maxCount, instances);
    const instanceHandles = instances.handles.map((handle2) => env.newGlobalRef(handle2));
    instances.$delete();
    scope.$delete();
    try {
      for (const handle2 of instanceHandles) {
        const instance = this.cast(handle2, classWrapper);
        const result = callbacks.onMatch(instance);
        if (result === "stop") {
          break;
        }
      }
      callbacks.onComplete();
    } finally {
      instanceHandles.forEach((handle2) => {
        env.deleteGlobalRef(handle2);
      });
    }
  }
  _chooseObjectsArtLegacy(className, env, thread, callbacks) {
    const classWrapper = this.use(className);
    const instanceHandles = [];
    const addGlobalReference = api2["art::JavaVMExt::AddGlobalRef"];
    const vmHandle = api2.vm;
    let needle;
    const h = classWrapper.$borrowClassHandle(env);
    try {
      needle = api2["art::JavaVMExt::DecodeGlobal"](vmHandle, thread, h.value).toInt32();
    } finally {
      h.unref(env);
    }
    const collectMatchingInstanceHandles = makeObjectVisitorPredicate(needle, (object) => {
      instanceHandles.push(addGlobalReference(vmHandle, thread, object));
    });
    api2["art::gc::Heap::VisitObjects"](api2.artHeap, collectMatchingInstanceHandles, NULL);
    try {
      for (const handle2 of instanceHandles) {
        const instance = this.cast(handle2, classWrapper);
        const result = callbacks.onMatch(instance);
        if (result === "stop") {
          break;
        }
      }
    } finally {
      instanceHandles.forEach((handle2) => {
        env.deleteGlobalRef(handle2);
      });
    }
    callbacks.onComplete();
  }
  _chooseObjectsDalvik(className, callerEnv, callbacks) {
    const classWrapper = this.use(className);
    if (api2.addLocalReference === null) {
      const libdvm = Process.getModuleByName("libdvm.so");
      let pattern;
      switch (Process.arch) {
        case "arm":
          pattern = "2d e9 f0 41 05 46 15 4e 0c 46 7e 44 11 b3 43 68";
          break;
        case "ia32":
          pattern = "8d 64 24 d4 89 5c 24 1c 89 74 24 20 e8 ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? 85 d2";
          break;
      }
      Memory.scan(libdvm.base, libdvm.size, pattern, {
        onMatch: (address, size) => {
          let wrapper;
          if (Process.arch === "arm") {
            address = address.or(1);
            wrapper = new NativeFunction(address, "pointer", ["pointer", "pointer"]);
          } else {
            const thunk = Memory.alloc(Process.pageSize);
            Memory.patchCode(thunk, 16, (code4) => {
              const cw = new X86Writer(code4, { pc: thunk });
              cw.putMovRegRegOffsetPtr("eax", "esp", 4);
              cw.putMovRegRegOffsetPtr("edx", "esp", 8);
              cw.putJmpAddress(address);
              cw.flush();
            });
            wrapper = new NativeFunction(thunk, "pointer", ["pointer", "pointer"]);
            wrapper._thunk = thunk;
          }
          api2.addLocalReference = wrapper;
          vm2.perform((env) => {
            enumerateInstances(this, env);
          });
          return "stop";
        },
        onError(reason) {
        },
        onComplete() {
          if (api2.addLocalReference === null) {
            callbacks.onComplete();
          }
        }
      });
    } else {
      enumerateInstances(this, callerEnv);
    }
    function enumerateInstances(factory, env) {
      const { DVM_JNI_ENV_OFFSET_SELF: DVM_JNI_ENV_OFFSET_SELF2 } = android_exports;
      const thread = env.handle.add(DVM_JNI_ENV_OFFSET_SELF2).readPointer();
      let ptrClassObject;
      const h = classWrapper.$borrowClassHandle(env);
      try {
        ptrClassObject = api2.dvmDecodeIndirectRef(thread, h.value);
      } finally {
        h.unref(env);
      }
      const pattern = ptrClassObject.toMatchPattern();
      const heapSourceBase = api2.dvmHeapSourceGetBase();
      const heapSourceLimit = api2.dvmHeapSourceGetLimit();
      const size = heapSourceLimit.sub(heapSourceBase).toInt32();
      Memory.scan(heapSourceBase, size, pattern, {
        onMatch: (address, size2) => {
          if (api2.dvmIsValidObject(address)) {
            vm2.perform((env2) => {
              const thread2 = env2.handle.add(DVM_JNI_ENV_OFFSET_SELF2).readPointer();
              let instance;
              const localReference = api2.addLocalReference(thread2, address);
              try {
                instance = factory.cast(localReference, classWrapper);
              } finally {
                env2.deleteLocalRef(localReference);
              }
              const result = callbacks.onMatch(instance);
              if (result === "stop") {
                return "stop";
              }
            });
          }
        },
        onError(reason) {
        },
        onComplete() {
          callbacks.onComplete();
        }
      });
    }
  }
  openClassFile(filePath) {
    return new DexFile(filePath, null, this);
  }
  _getType(typeName, unbox = true) {
    return getType(typeName, unbox, this);
  }
};
function makeClassWrapperConstructor() {
  return function(handle2, strategy, env, owned) {
    return Wrapper.call(this, handle2, strategy, env, owned);
  };
}
function Wrapper(handle2, strategy, env, owned = true) {
  if (handle2 !== null) {
    if (owned) {
      const h = env.newGlobalRef(handle2);
      this.$h = h;
      this.$r = Script.bindWeak(this, vm2.makeHandleDestructor(h));
    } else {
      this.$h = handle2;
      this.$r = null;
    }
  } else {
    this.$h = null;
    this.$r = null;
  }
  this.$t = strategy;
  return new Proxy(this, wrapperHandler);
}
wrapperHandler = {
  has(target, property) {
    if (property in target) {
      return true;
    }
    return target.$has(property);
  },
  get(target, property, receiver) {
    if (typeof property !== "string" || property.startsWith("$") || property === "class") {
      return target[property];
    }
    const unwrap2 = target.$find(property);
    if (unwrap2 !== null) {
      return unwrap2(receiver);
    }
    return target[property];
  },
  set(target, property, value, receiver) {
    target[property] = value;
    return true;
  },
  ownKeys(target) {
    return target.$list();
  },
  getOwnPropertyDescriptor(target, property) {
    if (Object.prototype.hasOwnProperty.call(target, property)) {
      return Object.getOwnPropertyDescriptor(target, property);
    }
    return {
      writable: false,
      configurable: true,
      enumerable: true
    };
  }
};
Object.defineProperties(Wrapper.prototype, {
  [Symbol.for("new")]: {
    enumerable: false,
    get() {
      return this.$getCtor("allocAndInit");
    }
  },
  $new: {
    enumerable: true,
    get() {
      return this[Symbol.for("new")];
    }
  },
  [Symbol.for("alloc")]: {
    enumerable: false,
    value() {
      const env = vm2.getEnv();
      const h = this.$borrowClassHandle(env);
      try {
        const obj = env.allocObject(h.value);
        const factory = this.$f;
        return factory.cast(obj, this);
      } finally {
        h.unref(env);
      }
    }
  },
  $alloc: {
    enumerable: true,
    get() {
      return this[Symbol.for("alloc")];
    }
  },
  [Symbol.for("init")]: {
    enumerable: false,
    get() {
      return this.$getCtor("initOnly");
    }
  },
  $init: {
    enumerable: true,
    get() {
      return this[Symbol.for("init")];
    }
  },
  [Symbol.for("dispose")]: {
    enumerable: false,
    value() {
      const ref = this.$r;
      if (ref !== null) {
        this.$r = null;
        Script.unbindWeak(ref);
      }
      if (this.$h !== null) {
        this.$h = void 0;
      }
    }
  },
  $dispose: {
    enumerable: true,
    get() {
      return this[Symbol.for("dispose")];
    }
  },
  [Symbol.for("clone")]: {
    enumerable: false,
    value(env) {
      const C = this.$C;
      return new C(this.$h, this.$t, env);
    }
  },
  $clone: {
    value(env) {
      return this[Symbol.for("clone")](env);
    }
  },
  [Symbol.for("class")]: {
    enumerable: false,
    get() {
      const env = vm2.getEnv();
      const h = this.$borrowClassHandle(env);
      try {
        const factory = this.$f;
        return factory.cast(h.value, factory.use("java.lang.Class"));
      } finally {
        h.unref(env);
      }
    }
  },
  class: {
    enumerable: true,
    get() {
      return this[Symbol.for("class")];
    }
  },
  [Symbol.for("className")]: {
    enumerable: false,
    get() {
      const handle2 = this.$h;
      if (handle2 === null) {
        return this.$n;
      }
      return vm2.getEnv().getObjectClassName(handle2);
    }
  },
  $className: {
    enumerable: true,
    get() {
      return this[Symbol.for("className")];
    }
  },
  [Symbol.for("ownMembers")]: {
    enumerable: false,
    get() {
      const model = this.$l;
      return model.list();
    }
  },
  $ownMembers: {
    enumerable: true,
    get() {
      return this[Symbol.for("ownMembers")];
    }
  },
  [Symbol.for("super")]: {
    enumerable: false,
    get() {
      const env = vm2.getEnv();
      const C = this.$s.$C;
      return new C(this.$h, STRATEGY_DIRECT, env);
    }
  },
  $super: {
    enumerable: true,
    get() {
      return this[Symbol.for("super")];
    }
  },
  [Symbol.for("s")]: {
    enumerable: false,
    get() {
      const proto = Object.getPrototypeOf(this);
      let superWrapper = proto.$_s;
      if (superWrapper === void 0) {
        const env = vm2.getEnv();
        const h = this.$borrowClassHandle(env);
        try {
          const superHandle = env.getSuperclass(h.value);
          if (!superHandle.isNull()) {
            try {
              const superClassName = env.getClassName(superHandle);
              const factory = proto.$f;
              superWrapper = factory._getUsedClass(superClassName);
              if (superWrapper === void 0) {
                try {
                  const getSuperClassHandle = makeSuperHandleGetter(this);
                  superWrapper = factory._make(superClassName, getSuperClassHandle, env);
                } finally {
                  factory._setUsedClass(superClassName, superWrapper);
                }
              }
            } finally {
              env.deleteLocalRef(superHandle);
            }
          } else {
            superWrapper = null;
          }
        } finally {
          h.unref(env);
        }
        proto.$_s = superWrapper;
      }
      return superWrapper;
    }
  },
  $s: {
    get() {
      return this[Symbol.for("s")];
    }
  },
  [Symbol.for("isSameObject")]: {
    enumerable: false,
    value(obj) {
      const env = vm2.getEnv();
      return env.isSameObject(obj.$h, this.$h);
    }
  },
  $isSameObject: {
    value(obj) {
      return this[Symbol.for("isSameObject")](obj);
    }
  },
  [Symbol.for("getCtor")]: {
    enumerable: false,
    value(type) {
      const slot = this.$c;
      let ctor = slot[0];
      if (ctor === null) {
        const env = vm2.getEnv();
        const h = this.$borrowClassHandle(env);
        try {
          ctor = makeConstructor(h.value, this.$w, env);
          slot[0] = ctor;
        } finally {
          h.unref(env);
        }
      }
      return ctor[type];
    }
  },
  $getCtor: {
    value(type) {
      return this[Symbol.for("getCtor")](type);
    }
  },
  [Symbol.for("borrowClassHandle")]: {
    enumerable: false,
    value(env) {
      const className = this.$n;
      const classHandles = this.$f._classHandles;
      let handle2 = classHandles.get(className);
      if (handle2 === void 0) {
        handle2 = new ClassHandle(this.$gch(env), env);
        classHandles.set(className, handle2, env);
      }
      return handle2.ref();
    }
  },
  $borrowClassHandle: {
    value(env) {
      return this[Symbol.for("borrowClassHandle")](env);
    }
  },
  [Symbol.for("copyClassHandle")]: {
    enumerable: false,
    value(env) {
      const h = this.$borrowClassHandle(env);
      try {
        return env.newLocalRef(h.value);
      } finally {
        h.unref(env);
      }
    }
  },
  $copyClassHandle: {
    value(env) {
      return this[Symbol.for("copyClassHandle")](env);
    }
  },
  [Symbol.for("getHandle")]: {
    enumerable: false,
    value(env) {
      const handle2 = this.$h;
      const isDisposed = handle2 === void 0;
      if (isDisposed) {
        throw new Error("Wrapper is disposed; perhaps it was borrowed from a hook instead of calling Java.retain() to make a long-lived wrapper?");
      }
      return handle2;
    }
  },
  $getHandle: {
    value(env) {
      return this[Symbol.for("getHandle")](env);
    }
  },
  [Symbol.for("list")]: {
    enumerable: false,
    value() {
      const superWrapper = this.$s;
      const superMembers = superWrapper !== null ? superWrapper.$list() : [];
      const model = this.$l;
      return Array.from(new Set(superMembers.concat(model.list())));
    }
  },
  $list: {
    get() {
      return this[Symbol.for("list")];
    }
  },
  [Symbol.for("has")]: {
    enumerable: false,
    value(member) {
      const members = this.$m;
      if (members.has(member)) {
        return true;
      }
      const model = this.$l;
      if (model.has(member)) {
        return true;
      }
      const superWrapper = this.$s;
      if (superWrapper !== null && superWrapper.$has(member)) {
        return true;
      }
      return false;
    }
  },
  $has: {
    value(member) {
      return this[Symbol.for("has")](member);
    }
  },
  [Symbol.for("find")]: {
    enumerable: false,
    value(member) {
      const members = this.$m;
      let value = members.get(member);
      if (value !== void 0) {
        return value;
      }
      const model = this.$l;
      const spec = model.find(member);
      if (spec !== null) {
        const env = vm2.getEnv();
        const h = this.$borrowClassHandle(env);
        try {
          value = makeMember(member, spec, h.value, this.$w, env);
        } finally {
          h.unref(env);
        }
        members.set(member, value);
        return value;
      }
      const superWrapper = this.$s;
      if (superWrapper !== null) {
        return superWrapper.$find(member);
      }
      return null;
    }
  },
  $find: {
    value(member) {
      return this[Symbol.for("find")](member);
    }
  },
  [Symbol.for("toJSON")]: {
    enumerable: false,
    value() {
      const wrapperName = this.$n;
      const handle2 = this.$h;
      if (handle2 === null) {
        return `<class: ${wrapperName}>`;
      }
      const actualName = this.$className;
      if (wrapperName === actualName) {
        return `<instance: ${wrapperName}>`;
      }
      return `<instance: ${wrapperName}, $className: ${actualName}>`;
    }
  },
  toJSON: {
    get() {
      return this[Symbol.for("toJSON")];
    }
  }
});
function ClassHandle(value, env) {
  this.value = env.newGlobalRef(value);
  env.deleteLocalRef(value);
  this.refs = 1;
}
ClassHandle.prototype.ref = function() {
  this.refs++;
  return this;
};
ClassHandle.prototype.unref = function(env) {
  if (--this.refs === 0) {
    env.deleteGlobalRef(this.value);
  }
};
function releaseClassHandle(handle2, env) {
  handle2.unref(env);
}
function makeBasicClassHandleGetter(className) {
  const canonicalClassName = className.replace(/\./g, "/");
  return function(env) {
    const tid = getCurrentThreadId();
    ignore(tid);
    try {
      return env.findClass(canonicalClassName);
    } finally {
      unignore(tid);
    }
  };
}
function makeLoaderClassHandleGetter(className, usedLoader, callerEnv) {
  if (cachedLoaderMethod === null) {
    cachedLoaderInvoke = callerEnv.vaMethod("pointer", ["pointer"]);
    cachedLoaderMethod = usedLoader.loadClass.overload("java.lang.String").handle;
  }
  callerEnv = null;
  return function(env) {
    const classNameValue = env.newStringUtf(className);
    const tid = getCurrentThreadId();
    ignore(tid);
    try {
      const result = cachedLoaderInvoke(env.handle, usedLoader.$h, cachedLoaderMethod, classNameValue);
      env.throwIfExceptionPending();
      return result;
    } finally {
      unignore(tid);
      env.deleteLocalRef(classNameValue);
    }
  };
}
function makeSuperHandleGetter(classWrapper) {
  return function(env) {
    const h = classWrapper.$borrowClassHandle(env);
    try {
      return env.getSuperclass(h.value);
    } finally {
      h.unref(env);
    }
  };
}
function makeConstructor(classHandle, classWrapper, env) {
  const { $n: className, $f: factory } = classWrapper;
  const methodName = basename(className);
  const Class = env.javaLangClass();
  const Constructor = env.javaLangReflectConstructor();
  const invokeObjectMethodNoArgs = env.vaMethod("pointer", []);
  const invokeUInt8MethodNoArgs = env.vaMethod("uint8", []);
  const jsCtorMethods = [];
  const jsInitMethods = [];
  const jsRetType = factory._getType(className, false);
  const jsVoidType = factory._getType("void", false);
  const constructors = invokeObjectMethodNoArgs(env.handle, classHandle, Class.getDeclaredConstructors);
  try {
    const n = env.getArrayLength(constructors);
    if (n !== 0) {
      for (let i = 0; i !== n; i++) {
        let methodId, types2;
        const constructor = env.getObjectArrayElement(constructors, i);
        try {
          methodId = env.fromReflectedMethod(constructor);
          types2 = invokeObjectMethodNoArgs(env.handle, constructor, Constructor.getGenericParameterTypes);
        } finally {
          env.deleteLocalRef(constructor);
        }
        let jsArgTypes;
        try {
          jsArgTypes = readTypeNames(env, types2).map((name) => factory._getType(name));
        } finally {
          env.deleteLocalRef(types2);
        }
        jsCtorMethods.push(makeMethod(methodName, classWrapper, CONSTRUCTOR_METHOD, methodId, jsRetType, jsArgTypes, env));
        jsInitMethods.push(makeMethod(methodName, classWrapper, INSTANCE_METHOD, methodId, jsVoidType, jsArgTypes, env));
      }
    } else {
      const isInterface = invokeUInt8MethodNoArgs(env.handle, classHandle, Class.isInterface);
      if (isInterface) {
        throw new Error("cannot instantiate an interface");
      }
      const defaultClass = env.javaLangObject();
      const defaultConstructor = env.getMethodId(defaultClass, "<init>", "()V");
      jsCtorMethods.push(makeMethod(methodName, classWrapper, CONSTRUCTOR_METHOD, defaultConstructor, jsRetType, [], env));
      jsInitMethods.push(makeMethod(methodName, classWrapper, INSTANCE_METHOD, defaultConstructor, jsVoidType, [], env));
    }
  } finally {
    env.deleteLocalRef(constructors);
  }
  if (jsInitMethods.length === 0) {
    throw new Error("no supported overloads");
  }
  return {
    allocAndInit: makeMethodDispatcher(jsCtorMethods),
    initOnly: makeMethodDispatcher(jsInitMethods)
  };
}
function makeMember(name, spec, classHandle, classWrapper, env) {
  if (spec.startsWith("m")) {
    return makeMethodFromSpec(name, spec, classHandle, classWrapper, env);
  }
  return makeFieldFromSpec(name, spec, classHandle, classWrapper, env);
}
function makeMethodFromSpec(name, spec, classHandle, classWrapper, env) {
  const { $f: factory } = classWrapper;
  const overloads = spec.split(":").slice(1);
  const Method = env.javaLangReflectMethod();
  const invokeObjectMethodNoArgs = env.vaMethod("pointer", []);
  const invokeUInt8MethodNoArgs = env.vaMethod("uint8", []);
  const methods = overloads.map((params) => {
    const type = params[0] === "s" ? STATIC_METHOD : INSTANCE_METHOD;
    const methodId = ptr(params.substr(1));
    let jsRetType;
    const jsArgTypes = [];
    const handle2 = env.toReflectedMethod(classHandle, methodId, type === STATIC_METHOD ? 1 : 0);
    try {
      const isVarArgs = !!invokeUInt8MethodNoArgs(env.handle, handle2, Method.isVarArgs);
      const retType2 = invokeObjectMethodNoArgs(env.handle, handle2, Method.getGenericReturnType);
      env.throwIfExceptionPending();
      try {
        jsRetType = factory._getType(env.getTypeName(retType2));
      } finally {
        env.deleteLocalRef(retType2);
      }
      const argTypes2 = invokeObjectMethodNoArgs(env.handle, handle2, Method.getParameterTypes);
      try {
        const n = env.getArrayLength(argTypes2);
        for (let i = 0; i !== n; i++) {
          const t = env.getObjectArrayElement(argTypes2, i);
          let argClassName;
          try {
            argClassName = isVarArgs && i === n - 1 ? env.getArrayTypeName(t) : env.getTypeName(t);
          } finally {
            env.deleteLocalRef(t);
          }
          const argType = factory._getType(argClassName);
          jsArgTypes.push(argType);
        }
      } finally {
        env.deleteLocalRef(argTypes2);
      }
    } catch (e) {
      return null;
    } finally {
      env.deleteLocalRef(handle2);
    }
    return makeMethod(name, classWrapper, type, methodId, jsRetType, jsArgTypes, env);
  }).filter((m2) => m2 !== null);
  if (methods.length === 0) {
    throw new Error("No supported overloads");
  }
  if (name === "valueOf") {
    ensureDefaultValueOfImplemented(methods);
  }
  const result = makeMethodDispatcher(methods);
  return function(receiver) {
    return result;
  };
}
function makeMethodDispatcher(overloads) {
  const m2 = makeMethodDispatcherCallable();
  Object.setPrototypeOf(m2, dispatcherPrototype);
  m2._o = overloads;
  return m2;
}
function makeMethodDispatcherCallable() {
  const m2 = function() {
    return m2.invoke(this, arguments);
  };
  return m2;
}
dispatcherPrototype = Object.create(Function.prototype, {
  overloads: {
    enumerable: true,
    get() {
      return this._o;
    }
  },
  overload: {
    value(...args) {
      const overloads = this._o;
      const numArgs = args.length;
      const signature2 = args.join(":");
      for (let i = 0; i !== overloads.length; i++) {
        const method2 = overloads[i];
        const { argumentTypes } = method2;
        if (argumentTypes.length !== numArgs) {
          continue;
        }
        const s = argumentTypes.map((t) => t.className).join(":");
        if (s === signature2) {
          return method2;
        }
      }
      throwOverloadError(this.methodName, this.overloads, "specified argument types do not match any of:");
    }
  },
  methodName: {
    enumerable: true,
    get() {
      return this._o[0].methodName;
    }
  },
  holder: {
    enumerable: true,
    get() {
      return this._o[0].holder;
    }
  },
  type: {
    enumerable: true,
    get() {
      return this._o[0].type;
    }
  },
  handle: {
    enumerable: true,
    get() {
      throwIfDispatcherAmbiguous(this);
      return this._o[0].handle;
    }
  },
  implementation: {
    enumerable: true,
    get() {
      throwIfDispatcherAmbiguous(this);
      return this._o[0].implementation;
    },
    set(fn) {
      throwIfDispatcherAmbiguous(this);
      this._o[0].implementation = fn;
    }
  },
  returnType: {
    enumerable: true,
    get() {
      throwIfDispatcherAmbiguous(this);
      return this._o[0].returnType;
    }
  },
  argumentTypes: {
    enumerable: true,
    get() {
      throwIfDispatcherAmbiguous(this);
      return this._o[0].argumentTypes;
    }
  },
  canInvokeWith: {
    enumerable: true,
    get(args) {
      throwIfDispatcherAmbiguous(this);
      return this._o[0].canInvokeWith;
    }
  },
  clone: {
    enumerable: true,
    value(options) {
      throwIfDispatcherAmbiguous(this);
      return this._o[0].clone(options);
    }
  },
  invoke: {
    value(receiver, args) {
      const overloads = this._o;
      const isInstance = receiver.$h !== null;
      for (let i = 0; i !== overloads.length; i++) {
        const method2 = overloads[i];
        if (!method2.canInvokeWith(args)) {
          continue;
        }
        if (method2.type === INSTANCE_METHOD && !isInstance) {
          const name = this.methodName;
          if (name === "toString") {
            return `<class: ${receiver.$n}>`;
          }
          throw new Error(name + ": cannot call instance method without an instance");
        }
        return method2.apply(receiver, args);
      }
      if (this.methodName === "toString") {
        return `<class: ${receiver.$n}>`;
      }
      throwOverloadError(this.methodName, this.overloads, "argument types do not match any of:");
    }
  }
});
function makeOverloadId(name, returnType, argumentTypes) {
  return `${returnType.className} ${name}(${argumentTypes.map((t) => t.className).join(", ")})`;
}
function throwIfDispatcherAmbiguous(dispatcher) {
  const methods = dispatcher._o;
  if (methods.length > 1) {
    throwOverloadError(methods[0].methodName, methods, "has more than one overload, use .overload(<signature>) to choose from:");
  }
}
function throwOverloadError(name, methods, message) {
  const methodsSortedByArity = methods.slice().sort((a, b) => a.argumentTypes.length - b.argumentTypes.length);
  const overloads = methodsSortedByArity.map((m2) => {
    const argTypes2 = m2.argumentTypes;
    if (argTypes2.length > 0) {
      return ".overload('" + m2.argumentTypes.map((t) => t.className).join("', '") + "')";
    } else {
      return ".overload()";
    }
  });
  throw new Error(`${name}(): ${message}
	${overloads.join("\n	")}`);
}
function makeMethod(methodName, classWrapper, type, methodId, retType2, argTypes2, env, invocationOptions2) {
  const rawRetType = retType2.type;
  const rawArgTypes = argTypes2.map((t) => t.type);
  if (env === null) {
    env = vm2.getEnv();
  }
  let callVirtually, callDirectly;
  if (type === INSTANCE_METHOD) {
    callVirtually = env.vaMethod(rawRetType, rawArgTypes, invocationOptions2);
    callDirectly = env.nonvirtualVaMethod(rawRetType, rawArgTypes, invocationOptions2);
  } else if (type === STATIC_METHOD) {
    callVirtually = env.staticVaMethod(rawRetType, rawArgTypes, invocationOptions2);
    callDirectly = callVirtually;
  } else {
    callVirtually = env.constructor(rawArgTypes, invocationOptions2);
    callDirectly = callVirtually;
  }
  return makeMethodInstance([methodName, classWrapper, type, methodId, retType2, argTypes2, callVirtually, callDirectly]);
}
function makeMethodInstance(params) {
  const m2 = makeMethodCallable();
  Object.setPrototypeOf(m2, methodPrototype);
  m2._p = params;
  return m2;
}
function makeMethodCallable() {
  const m2 = function() {
    return m2.invoke(this, arguments);
  };
  return m2;
}
methodPrototype = Object.create(Function.prototype, {
  methodName: {
    enumerable: true,
    get() {
      return this._p[0];
    }
  },
  holder: {
    enumerable: true,
    get() {
      return this._p[1];
    }
  },
  type: {
    enumerable: true,
    get() {
      return this._p[2];
    }
  },
  handle: {
    enumerable: true,
    get() {
      return this._p[3];
    }
  },
  implementation: {
    enumerable: true,
    get() {
      const replacement = this._r;
      return replacement !== void 0 ? replacement : null;
    },
    set(fn) {
      const params = this._p;
      const holder = params[1];
      const type = params[2];
      if (type === CONSTRUCTOR_METHOD) {
        throw new Error("Reimplementing $new is not possible; replace implementation of $init instead");
      }
      const existingReplacement = this._r;
      if (existingReplacement !== void 0) {
        holder.$f._patchedMethods.delete(this);
        const mangler = existingReplacement._m;
        mangler.revert(vm2);
        this._r = void 0;
      }
      if (fn !== null) {
        const [methodName, classWrapper, type2, methodId, retType2, argTypes2] = params;
        const replacement = implement(methodName, classWrapper, type2, retType2, argTypes2, fn, this);
        const mangler = makeMethodMangler3(methodId);
        replacement._m = mangler;
        this._r = replacement;
        mangler.replace(replacement, type2 === INSTANCE_METHOD, argTypes2, vm2, api2);
        holder.$f._patchedMethods.add(this);
      }
    }
  },
  returnType: {
    enumerable: true,
    get() {
      return this._p[4];
    }
  },
  argumentTypes: {
    enumerable: true,
    get() {
      return this._p[5];
    }
  },
  canInvokeWith: {
    enumerable: true,
    value(args) {
      const argTypes2 = this._p[5];
      if (args.length !== argTypes2.length) {
        return false;
      }
      return argTypes2.every((t, i) => {
        return t.isCompatible(args[i]);
      });
    }
  },
  clone: {
    enumerable: true,
    value(options) {
      const params = this._p.slice(0, 6);
      return makeMethod(...params, null, options);
    }
  },
  invoke: {
    value(receiver, args) {
      const env = vm2.getEnv();
      const params = this._p;
      const type = params[2];
      const retType2 = params[4];
      const argTypes2 = params[5];
      const replacement = this._r;
      const isInstanceMethod = type === INSTANCE_METHOD;
      const numArgs = args.length;
      const frameCapacity = 2 + numArgs;
      env.pushLocalFrame(frameCapacity);
      let borrowedHandle = null;
      try {
        let jniThis;
        if (isInstanceMethod) {
          jniThis = receiver.$getHandle();
        } else {
          borrowedHandle = receiver.$borrowClassHandle(env);
          jniThis = borrowedHandle.value;
        }
        let methodId;
        let strategy = receiver.$t;
        if (replacement === void 0) {
          methodId = params[3];
        } else {
          const mangler = replacement._m;
          methodId = mangler.resolveTarget(receiver, isInstanceMethod, env, api2);
          if (isArtVm) {
            const pendingCalls = replacement._c;
            if (pendingCalls.has(getCurrentThreadId())) {
              strategy = STRATEGY_DIRECT;
            }
          }
        }
        const jniArgs = [
          env.handle,
          jniThis,
          methodId
        ];
        for (let i = 0; i !== numArgs; i++) {
          jniArgs.push(argTypes2[i].toJni(args[i], env));
        }
        let jniCall;
        if (strategy === STRATEGY_VIRTUAL) {
          jniCall = params[6];
        } else {
          jniCall = params[7];
          if (isInstanceMethod) {
            jniArgs.splice(2, 0, receiver.$copyClassHandle(env));
          }
        }
        const jniRetval = jniCall.apply(null, jniArgs);
        env.throwIfExceptionPending();
        return retType2.fromJni(jniRetval, env, true);
      } finally {
        if (borrowedHandle !== null) {
          borrowedHandle.unref(env);
        }
        env.popLocalFrame(NULL);
      }
    }
  },
  toString: {
    enumerable: true,
    value() {
      return `function ${this.methodName}(${this.argumentTypes.map((t) => t.className).join(", ")}): ${this.returnType.className}`;
    }
  }
});
function implement(methodName, classWrapper, type, retType2, argTypes2, handler, fallback = null) {
  const pendingCalls = /* @__PURE__ */ new Set();
  const f2 = makeMethodImplementation([methodName, classWrapper, type, retType2, argTypes2, handler, fallback, pendingCalls]);
  const impl = new NativeCallback(f2, retType2.type, ["pointer", "pointer"].concat(argTypes2.map((t) => t.type)));
  impl._c = pendingCalls;
  return impl;
}
function makeMethodImplementation(params) {
  return function() {
    return handleMethodInvocation(arguments, params);
  };
}
function handleMethodInvocation(jniArgs, params) {
  const env = new Env(jniArgs[0], vm2);
  const [methodName, classWrapper, type, retType2, argTypes2, handler, fallback, pendingCalls] = params;
  const ownedObjects = [];
  let self;
  if (type === INSTANCE_METHOD) {
    const C = classWrapper.$C;
    self = new C(jniArgs[1], STRATEGY_VIRTUAL, env, false);
  } else {
    self = classWrapper;
  }
  const tid = getCurrentThreadId();
  env.pushLocalFrame(3);
  let haveFrame = true;
  vm2.link(tid, env);
  try {
    pendingCalls.add(tid);
    let fn;
    if (fallback === null || !ignoredThreads.has(tid)) {
      fn = handler;
    } else {
      fn = fallback;
    }
    const args = [];
    const numArgs = jniArgs.length - 2;
    for (let i = 0; i !== numArgs; i++) {
      const t = argTypes2[i];
      const value = t.fromJni(jniArgs[2 + i], env, false);
      args.push(value);
      ownedObjects.push(value);
    }
    const retval = fn.apply(self, args);
    if (!retType2.isCompatible(retval)) {
      throw new Error(`Implementation for ${methodName} expected return value compatible with ${retType2.className}`);
    }
    let jniRetval = retType2.toJni(retval, env);
    if (retType2.type === "pointer") {
      jniRetval = env.popLocalFrame(jniRetval);
      haveFrame = false;
      ownedObjects.push(retval);
    }
    return jniRetval;
  } catch (e) {
    const jniException = e.$h;
    if (jniException !== void 0) {
      env.throw(jniException);
    } else {
      Script.nextTick(() => {
        throw e;
      });
    }
    return retType2.defaultValue;
  } finally {
    vm2.unlink(tid);
    if (haveFrame) {
      env.popLocalFrame(NULL);
    }
    pendingCalls.delete(tid);
    ownedObjects.forEach((obj) => {
      if (obj === null) {
        return;
      }
      const dispose2 = obj.$dispose;
      if (dispose2 !== void 0) {
        dispose2.call(obj);
      }
    });
  }
}
function ensureDefaultValueOfImplemented(methods) {
  const { holder, type } = methods[0];
  const hasDefaultValueOf = methods.some((m2) => m2.type === type && m2.argumentTypes.length === 0);
  if (hasDefaultValueOf) {
    return;
  }
  methods.push(makeValueOfMethod([holder, type]));
}
function makeValueOfMethod(params) {
  const m2 = makeValueOfCallable();
  Object.setPrototypeOf(m2, valueOfPrototype);
  m2._p = params;
  return m2;
}
function makeValueOfCallable() {
  const m2 = function() {
    return this;
  };
  return m2;
}
valueOfPrototype = Object.create(Function.prototype, {
  methodName: {
    enumerable: true,
    get() {
      return "valueOf";
    }
  },
  holder: {
    enumerable: true,
    get() {
      return this._p[0];
    }
  },
  type: {
    enumerable: true,
    get() {
      return this._p[1];
    }
  },
  handle: {
    enumerable: true,
    get() {
      return NULL;
    }
  },
  implementation: {
    enumerable: true,
    get() {
      return null;
    },
    set(fn) {
    }
  },
  returnType: {
    enumerable: true,
    get() {
      const classWrapper = this.holder;
      return classWrapper.$f.use(classWrapper.$n);
    }
  },
  argumentTypes: {
    enumerable: true,
    get() {
      return [];
    }
  },
  canInvokeWith: {
    enumerable: true,
    value(args) {
      return args.length === 0;
    }
  },
  clone: {
    enumerable: true,
    value(options) {
      throw new Error("Invalid operation");
    }
  }
});
function makeFieldFromSpec(name, spec, classHandle, classWrapper, env) {
  const type = spec[2] === "s" ? STATIC_FIELD : INSTANCE_FIELD;
  const id = ptr(spec.substr(3));
  const { $f: factory } = classWrapper;
  let fieldType;
  const field = env.toReflectedField(classHandle, id, type === STATIC_FIELD ? 1 : 0);
  try {
    fieldType = env.vaMethod("pointer", [])(env.handle, field, env.javaLangReflectField().getGenericType);
    env.throwIfExceptionPending();
  } finally {
    env.deleteLocalRef(field);
  }
  let rtype;
  try {
    rtype = factory._getType(env.getTypeName(fieldType));
  } finally {
    env.deleteLocalRef(fieldType);
  }
  let getValue, setValue;
  const rtypeJni = rtype.type;
  if (type === STATIC_FIELD) {
    getValue = env.getStaticField(rtypeJni);
    setValue = env.setStaticField(rtypeJni);
  } else {
    getValue = env.getField(rtypeJni);
    setValue = env.setField(rtypeJni);
  }
  return makeFieldFromParams([type, rtype, id, getValue, setValue]);
}
function makeFieldFromParams(params) {
  return function(receiver) {
    return new Field([receiver].concat(params));
  };
}
function Field(params) {
  this._p = params;
}
Object.defineProperties(Field.prototype, {
  value: {
    enumerable: true,
    get() {
      const [holder, type, rtype, id, getValue] = this._p;
      const env = vm2.getEnv();
      env.pushLocalFrame(4);
      let borrowedHandle = null;
      try {
        let jniThis;
        if (type === INSTANCE_FIELD) {
          jniThis = holder.$getHandle();
          if (jniThis === null) {
            throw new Error("Cannot access an instance field without an instance");
          }
        } else {
          borrowedHandle = holder.$borrowClassHandle(env);
          jniThis = borrowedHandle.value;
        }
        const jniRetval = getValue(env.handle, jniThis, id);
        env.throwIfExceptionPending();
        return rtype.fromJni(jniRetval, env, true);
      } finally {
        if (borrowedHandle !== null) {
          borrowedHandle.unref(env);
        }
        env.popLocalFrame(NULL);
      }
    },
    set(value) {
      const [holder, type, rtype, id, , setValue] = this._p;
      const env = vm2.getEnv();
      env.pushLocalFrame(4);
      let borrowedHandle = null;
      try {
        let jniThis;
        if (type === INSTANCE_FIELD) {
          jniThis = holder.$getHandle();
          if (jniThis === null) {
            throw new Error("Cannot access an instance field without an instance");
          }
        } else {
          borrowedHandle = holder.$borrowClassHandle(env);
          jniThis = borrowedHandle.value;
        }
        if (!rtype.isCompatible(value)) {
          throw new Error(`Expected value compatible with ${rtype.className}`);
        }
        const jniValue = rtype.toJni(value, env);
        setValue(env.handle, jniThis, id, jniValue);
        env.throwIfExceptionPending();
      } finally {
        if (borrowedHandle !== null) {
          borrowedHandle.unref(env);
        }
        env.popLocalFrame(NULL);
      }
    }
  },
  holder: {
    enumerable: true,
    get() {
      return this._p[0];
    }
  },
  fieldType: {
    enumerable: true,
    get() {
      return this._p[1];
    }
  },
  fieldReturnType: {
    enumerable: true,
    get() {
      return this._p[2];
    }
  },
  toString: {
    enumerable: true,
    value() {
      const inlineString = `Java.Field{holder: ${this.holder}, fieldType: ${this.fieldType}, fieldReturnType: ${this.fieldReturnType}, value: ${this.value}}`;
      if (inlineString.length < 200) {
        return inlineString;
      }
      const multilineString = `Java.Field{
	holder: ${this.holder},
	fieldType: ${this.fieldType},
	fieldReturnType: ${this.fieldReturnType},
	value: ${this.value},
}`;
      return multilineString.split("\n").map((l) => l.length > 200 ? l.slice(0, l.indexOf(" ") + 1) + "...," : l).join("\n");
    }
  }
});
var DexFile = class _DexFile {
  static fromBuffer(buffer, factory) {
    const fileValue = createTemporaryDex(factory);
    const filePath = fileValue.getCanonicalPath().toString();
    const file = new File(filePath, "w");
    file.write(buffer.buffer);
    file.close();
    setReadOnlyDex(filePath, factory);
    return new _DexFile(filePath, fileValue, factory);
  }
  constructor(path, file, factory) {
    this.path = path;
    this.file = file;
    this._factory = factory;
  }
  load() {
    const { _factory: factory } = this;
    const { codeCacheDir } = factory;
    const DexClassLoader = factory.use("dalvik.system.DexClassLoader");
    const JFile = factory.use("java.io.File");
    let file = this.file;
    if (file === null) {
      file = factory.use("java.io.File").$new(this.path);
    }
    if (!file.exists()) {
      throw new Error("File not found");
    }
    JFile.$new(codeCacheDir).mkdirs();
    factory.loader = DexClassLoader.$new(file.getCanonicalPath(), codeCacheDir, null, factory.loader);
    vm2.preventDetachDueToClassLoader();
  }
  getClassNames() {
    const { _factory: factory } = this;
    const DexFile2 = factory.use("dalvik.system.DexFile");
    const optimizedDex = createTemporaryDex(factory);
    const dx = DexFile2.loadDex(this.path, optimizedDex.getCanonicalPath(), 0);
    const classNames = [];
    const enumeratorClassNames = dx.entries();
    while (enumeratorClassNames.hasMoreElements()) {
      classNames.push(enumeratorClassNames.nextElement().toString());
    }
    return classNames;
  }
};
function createTemporaryDex(factory) {
  const { cacheDir, tempFileNaming } = factory;
  const JFile = factory.use("java.io.File");
  const cacheDirValue = JFile.$new(cacheDir);
  cacheDirValue.mkdirs();
  return JFile.createTempFile(tempFileNaming.prefix, tempFileNaming.suffix + ".dex", cacheDirValue);
}
function setReadOnlyDex(filePath, factory) {
  const JFile = factory.use("java.io.File");
  const file = JFile.$new(filePath);
  file.setWritable(false, false);
}
function getFactoryCache() {
  switch (factoryCache.state) {
    case "empty": {
      factoryCache.state = "pending";
      const defaultFactory = factoryCache.factories[0];
      const HashMap = defaultFactory.use("java.util.HashMap");
      const Integer = defaultFactory.use("java.lang.Integer");
      factoryCache.loaders = HashMap.$new();
      factoryCache.Integer = Integer;
      const loader = defaultFactory.loader;
      if (loader !== null) {
        addFactoryToCache(defaultFactory, loader);
      }
      factoryCache.state = "ready";
      return factoryCache;
    }
    case "pending":
      do {
        Thread.sleep(0.05);
      } while (factoryCache.state === "pending");
      return factoryCache;
    case "ready":
      return factoryCache;
  }
}
function addFactoryToCache(factory, loader) {
  const { factories, loaders, Integer } = factoryCache;
  const index = Integer.$new(factories.indexOf(factory));
  loaders.put(loader, index);
  for (let l = loader.getParent(); l !== null; l = l.getParent()) {
    if (loaders.containsKey(l)) {
      break;
    }
    loaders.put(l, index);
  }
}
function ignore(threadId) {
  let count = ignoredThreads.get(threadId);
  if (count === void 0) {
    count = 0;
  }
  count++;
  ignoredThreads.set(threadId, count);
}
function unignore(threadId) {
  let count = ignoredThreads.get(threadId);
  if (count === void 0) {
    throw new Error(`Thread ${threadId} is not ignored`);
  }
  count--;
  if (count === 0) {
    ignoredThreads.delete(threadId);
  } else {
    ignoredThreads.set(threadId, count);
  }
}
function basename(className) {
  return className.slice(className.lastIndexOf(".") + 1);
}
function readTypeNames(env, types2) {
  const names = [];
  const n = env.getArrayLength(types2);
  for (let i = 0; i !== n; i++) {
    const t = env.getObjectArrayElement(types2, i);
    try {
      names.push(env.getTypeName(t));
    } finally {
      env.deleteLocalRef(t);
    }
  }
  return names;
}
function makeSourceFileName(className) {
  const tokens = className.split(".");
  return tokens[tokens.length - 1] + ".java";
}

// node_modules/frida-java-bridge/index.js
var jsizeSize4 = 4;
var pointerSize10 = Process.pointerSize;
var Runtime2 = class {
  ACC_PUBLIC = 1;
  ACC_PRIVATE = 2;
  ACC_PROTECTED = 4;
  ACC_STATIC = 8;
  ACC_FINAL = 16;
  ACC_SYNCHRONIZED = 32;
  ACC_BRIDGE = 64;
  ACC_VARARGS = 128;
  ACC_NATIVE = 256;
  ACC_ABSTRACT = 1024;
  ACC_STRICT = 2048;
  ACC_SYNTHETIC = 4096;
  constructor() {
    this.classFactory = null;
    this.ClassFactory = ClassFactory;
    this.vm = null;
    this.api = null;
    this._initialized = false;
    this._apiError = null;
    this._wakeupHandler = null;
    this._pollListener = null;
    this._pendingMainOps = [];
    this._pendingVmOps = [];
    this._cachedIsAppProcess = null;
    try {
      this._tryInitialize();
    } catch (e) {
    }
  }
  _tryInitialize() {
    if (this._initialized) {
      return true;
    }
    if (this._apiError !== null) {
      throw this._apiError;
    }
    let api3;
    try {
      api3 = api_default();
      this.api = api3;
    } catch (e) {
      this._apiError = e;
      throw e;
    }
    if (api3 === null) {
      return false;
    }
    const vm3 = new VM(api3);
    this.vm = vm3;
    initialize(vm3);
    ClassFactory._initialize(vm3, api3);
    this.classFactory = new ClassFactory();
    this._initialized = true;
    return true;
  }
  _dispose() {
    if (this.api === null) {
      return;
    }
    const { vm: vm3 } = this;
    vm3.perform((env) => {
      ClassFactory._disposeAll(env);
      Env.dispose(env);
    });
    Script.nextTick(() => {
      VM.dispose(vm3);
    });
  }
  get available() {
    return this._tryInitialize();
  }
  get androidVersion() {
    return getAndroidVersion();
  }
  synchronized(obj, fn) {
    const { $h: objHandle = obj } = obj;
    if (!(objHandle instanceof NativePointer)) {
      throw new Error("Java.synchronized: the first argument `obj` must be either a pointer or a Java instance");
    }
    const env = this.vm.getEnv();
    checkJniResult("VM::MonitorEnter", env.monitorEnter(objHandle));
    try {
      fn();
    } finally {
      env.monitorExit(objHandle);
    }
  }
  enumerateLoadedClasses(callbacks) {
    this._checkAvailable();
    const { flavor } = this.api;
    if (flavor === "jvm") {
      this._enumerateLoadedClassesJvm(callbacks);
    } else if (flavor === "art") {
      this._enumerateLoadedClassesArt(callbacks);
    } else {
      this._enumerateLoadedClassesDalvik(callbacks);
    }
  }
  enumerateLoadedClassesSync() {
    const classes = [];
    this.enumerateLoadedClasses({
      onMatch(c) {
        classes.push(c);
      },
      onComplete() {
      }
    });
    return classes;
  }
  enumerateClassLoaders(callbacks) {
    this._checkAvailable();
    const { flavor } = this.api;
    if (flavor === "jvm") {
      this._enumerateClassLoadersJvm(callbacks);
    } else if (flavor === "art") {
      this._enumerateClassLoadersArt(callbacks);
    } else {
      throw new Error("Enumerating class loaders is not supported on Dalvik");
    }
  }
  enumerateClassLoadersSync() {
    const loaders = [];
    this.enumerateClassLoaders({
      onMatch(c) {
        loaders.push(c);
      },
      onComplete() {
      }
    });
    return loaders;
  }
  _enumerateLoadedClassesJvm(callbacks) {
    const { api: api3, vm: vm3 } = this;
    const { jvmti } = api3;
    const env = vm3.getEnv();
    const countPtr = Memory.alloc(jsizeSize4);
    const classesPtr = Memory.alloc(pointerSize10);
    jvmti.getLoadedClasses(countPtr, classesPtr);
    const count = countPtr.readS32();
    const classes = classesPtr.readPointer();
    const handles = [];
    for (let i = 0; i !== count; i++) {
      handles.push(classes.add(i * pointerSize10).readPointer());
    }
    jvmti.deallocate(classes);
    try {
      for (const handle2 of handles) {
        const className = env.getClassName(handle2);
        callbacks.onMatch(className, handle2);
      }
      callbacks.onComplete();
    } finally {
      handles.forEach((handle2) => {
        env.deleteLocalRef(handle2);
      });
    }
  }
  _enumerateClassLoadersJvm(callbacks) {
    this.choose("java.lang.ClassLoader", callbacks);
  }
  _enumerateLoadedClassesArt(callbacks) {
    const { vm: vm3, api: api3 } = this;
    const env = vm3.getEnv();
    const addGlobalReference = api3["art::JavaVMExt::AddGlobalRef"];
    const { vm: vmHandle } = api3;
    withRunnableArtThread(vm3, env, (thread) => {
      const collectClassHandles = makeArtClassVisitor((klass) => {
        const handle2 = addGlobalReference(vmHandle, thread, klass);
        try {
          const className = env.getClassName(handle2);
          callbacks.onMatch(className, handle2);
        } finally {
          env.deleteGlobalRef(handle2);
        }
        return true;
      });
      api3["art::ClassLinker::VisitClasses"](api3.artClassLinker.address, collectClassHandles);
    });
    callbacks.onComplete();
  }
  _enumerateClassLoadersArt(callbacks) {
    const { classFactory: factory, vm: vm3, api: api3 } = this;
    const env = vm3.getEnv();
    const visitClassLoaders = api3["art::ClassLinker::VisitClassLoaders"];
    if (visitClassLoaders === void 0) {
      throw new Error("This API is only available on Android >= 7.0");
    }
    const ClassLoader = factory.use("java.lang.ClassLoader");
    const loaderHandles = [];
    const addGlobalReference = api3["art::JavaVMExt::AddGlobalRef"];
    const { vm: vmHandle } = api3;
    withRunnableArtThread(vm3, env, (thread) => {
      const collectLoaderHandles = makeArtClassLoaderVisitor((loader) => {
        loaderHandles.push(addGlobalReference(vmHandle, thread, loader));
        return true;
      });
      withAllArtThreadsSuspended(() => {
        visitClassLoaders(api3.artClassLinker.address, collectLoaderHandles);
      });
    });
    try {
      loaderHandles.forEach((handle2) => {
        const loader = factory.cast(handle2, ClassLoader);
        callbacks.onMatch(loader);
      });
    } finally {
      loaderHandles.forEach((handle2) => {
        env.deleteGlobalRef(handle2);
      });
    }
    callbacks.onComplete();
  }
  _enumerateLoadedClassesDalvik(callbacks) {
    const { api: api3 } = this;
    const HASH_TOMBSTONE = ptr("0xcbcacccd");
    const loadedClassesOffset = 172;
    const hashEntrySize = 8;
    const ptrLoadedClassesHashtable = api3.gDvm.add(loadedClassesOffset);
    const hashTable = ptrLoadedClassesHashtable.readPointer();
    const tableSize = hashTable.readS32();
    const ptrpEntries = hashTable.add(12);
    const pEntries = ptrpEntries.readPointer();
    const end = tableSize * hashEntrySize;
    for (let offset = 0; offset < end; offset += hashEntrySize) {
      const pEntryPtr = pEntries.add(offset);
      const dataPtr = pEntryPtr.add(4).readPointer();
      if (dataPtr.isNull() || dataPtr.equals(HASH_TOMBSTONE)) {
        continue;
      }
      const descriptionPtr = dataPtr.add(24).readPointer();
      const description = descriptionPtr.readUtf8String();
      if (description.startsWith("L")) {
        const name = description.substring(1, description.length - 1).replace(/\//g, ".");
        callbacks.onMatch(name);
      }
    }
    callbacks.onComplete();
  }
  enumerateMethods(query) {
    const { classFactory: factory } = this;
    const env = this.vm.getEnv();
    const ClassLoader = factory.use("java.lang.ClassLoader");
    return Model.enumerateMethods(query, this.api, env).map((group) => {
      const handle2 = group.loader;
      group.loader = handle2 !== null ? factory.wrap(handle2, ClassLoader, env) : null;
      return group;
    });
  }
  scheduleOnMainThread(fn) {
    this.performNow(() => {
      this._pendingMainOps.push(fn);
      let { _wakeupHandler: wakeupHandler } = this;
      if (wakeupHandler === null) {
        const { classFactory: factory } = this;
        const Handler = factory.use("android.os.Handler");
        const Looper = factory.use("android.os.Looper");
        wakeupHandler = Handler.$new(Looper.getMainLooper());
        this._wakeupHandler = wakeupHandler;
      }
      if (this._pollListener === null) {
        this._pollListener = Interceptor.attach(Process.getModuleByName("libc.so").getExportByName("epoll_wait"), this._makePollHook());
        Interceptor.flush();
      }
      wakeupHandler.sendEmptyMessage(1);
    });
  }
  _makePollHook() {
    const mainThreadId = Process.id;
    const { _pendingMainOps: pending } = this;
    return function() {
      if (this.threadId !== mainThreadId) {
        return;
      }
      let fn;
      while ((fn = pending.shift()) !== void 0) {
        try {
          fn();
        } catch (e) {
          Script.nextTick(() => {
            throw e;
          });
        }
      }
    };
  }
  perform(fn) {
    this._checkAvailable();
    if (!this._isAppProcess() || this.classFactory.loader !== null) {
      try {
        this.vm.perform(fn);
      } catch (e) {
        Script.nextTick(() => {
          throw e;
        });
      }
    } else {
      this._pendingVmOps.push(fn);
      if (this._pendingVmOps.length === 1) {
        this._performPendingVmOpsWhenReady();
      }
    }
  }
  performNow(fn) {
    this._checkAvailable();
    return this.vm.perform(() => {
      const { classFactory: factory } = this;
      if (this._isAppProcess() && factory.loader === null) {
        const ActivityThread = factory.use("android.app.ActivityThread");
        const app = ActivityThread.currentApplication();
        if (app !== null) {
          initFactoryFromApplication(factory, app);
        }
      }
      return fn();
    });
  }
  _performPendingVmOpsWhenReady() {
    this.vm.perform(() => {
      const { classFactory: factory } = this;
      const ActivityThread = factory.use("android.app.ActivityThread");
      const app = ActivityThread.currentApplication();
      if (app !== null) {
        initFactoryFromApplication(factory, app);
        this._performPendingVmOps();
        return;
      }
      const runtime3 = this;
      let initialized = false;
      let hookpoint = "early";
      const handleBindApplication = ActivityThread.handleBindApplication;
      handleBindApplication.implementation = function(data) {
        if (data.instrumentationName.value !== null) {
          hookpoint = "late";
          const LoadedApk = factory.use("android.app.LoadedApk");
          const makeApplication = LoadedApk.makeApplication;
          makeApplication.implementation = function(forceDefaultAppClass, instrumentation) {
            if (!initialized) {
              initialized = true;
              initFactoryFromLoadedApk(factory, this);
              runtime3._performPendingVmOps();
            }
            return makeApplication.apply(this, arguments);
          };
        }
        handleBindApplication.apply(this, arguments);
      };
      const getPackageInfoCandidates = ActivityThread.getPackageInfo.overloads.map((m2) => [m2.argumentTypes.length, m2]).sort(([arityA], [arityB]) => arityB - arityA).map(([_, method2]) => method2);
      const getPackageInfo = getPackageInfoCandidates[0];
      getPackageInfo.implementation = function(...args) {
        const apk = getPackageInfo.call(this, ...args);
        if (!initialized && hookpoint === "early") {
          initialized = true;
          initFactoryFromLoadedApk(factory, apk);
          runtime3._performPendingVmOps();
        }
        return apk;
      };
    });
  }
  _performPendingVmOps() {
    const { vm: vm3, _pendingVmOps: pending } = this;
    let fn;
    while ((fn = pending.shift()) !== void 0) {
      try {
        vm3.perform(fn);
      } catch (e) {
        Script.nextTick(() => {
          throw e;
        });
      }
    }
  }
  use(className, options) {
    return this.classFactory.use(className, options);
  }
  openClassFile(filePath) {
    return this.classFactory.openClassFile(filePath);
  }
  choose(specifier, callbacks) {
    this.classFactory.choose(specifier, callbacks);
  }
  retain(obj) {
    return this.classFactory.retain(obj);
  }
  cast(obj, C) {
    return this.classFactory.cast(obj, C);
  }
  array(type, elements) {
    return this.classFactory.array(type, elements);
  }
  backtrace(options) {
    return backtrace(this.vm, options);
  }
  // Reference: http://stackoverflow.com/questions/2848575/how-to-detect-ui-thread-on-android
  isMainThread() {
    const Looper = this.classFactory.use("android.os.Looper");
    const mainLooper = Looper.getMainLooper();
    const myLooper = Looper.myLooper();
    if (myLooper === null) {
      return false;
    }
    return mainLooper.$isSameObject(myLooper);
  }
  registerClass(spec) {
    return this.classFactory.registerClass(spec);
  }
  deoptimizeEverything() {
    const { vm: vm3 } = this;
    return deoptimizeEverything(vm3, vm3.getEnv());
  }
  deoptimizeBootImage() {
    const { vm: vm3 } = this;
    return deoptimizeBootImage(vm3, vm3.getEnv());
  }
  deoptimizeMethod(method2) {
    const { vm: vm3 } = this;
    return deoptimizeMethod(vm3, vm3.getEnv(), method2);
  }
  _checkAvailable() {
    if (!this.available) {
      throw new Error("Java API not available");
    }
  }
  _isAppProcess() {
    let result = this._cachedIsAppProcess;
    if (result === null) {
      if (this.api.flavor === "jvm") {
        result = false;
        this._cachedIsAppProcess = result;
        return result;
      }
      const readlink = new NativeFunction(Module.getGlobalExportByName("readlink"), "pointer", ["pointer", "pointer", "pointer"], {
        exceptions: "propagate"
      });
      const pathname = Memory.allocUtf8String("/proc/self/exe");
      const bufferSize = 1024;
      const buffer = Memory.alloc(bufferSize);
      const size = readlink(pathname, buffer, ptr(bufferSize)).toInt32();
      if (size !== -1) {
        const exe = buffer.readUtf8String(size);
        result = /^\/system\/bin\/app_process/.test(exe);
      } else {
        result = true;
      }
      this._cachedIsAppProcess = result;
    }
    return result;
  }
};
function initFactoryFromApplication(factory, app) {
  const Process2 = factory.use("android.os.Process");
  factory.loader = app.getClassLoader();
  if (Process2.myUid() === Process2.SYSTEM_UID.value) {
    factory.cacheDir = "/data/system";
    factory.codeCacheDir = "/data/dalvik-cache";
  } else {
    if ("getCodeCacheDir" in app) {
      factory.cacheDir = app.getCacheDir().getCanonicalPath();
      factory.codeCacheDir = app.getCodeCacheDir().getCanonicalPath();
    } else {
      factory.cacheDir = app.getFilesDir().getCanonicalPath();
      factory.codeCacheDir = app.getCacheDir().getCanonicalPath();
    }
  }
}
function initFactoryFromLoadedApk(factory, apk) {
  const JFile = factory.use("java.io.File");
  factory.loader = apk.getClassLoader();
  const dataDir = JFile.$new(apk.getDataDir()).getCanonicalPath();
  factory.cacheDir = dataDir;
  factory.codeCacheDir = dataDir + "/cache";
}
var runtime2 = new Runtime2();
Script.bindWeak(runtime2, () => {
  runtime2._dispose();
});
var frida_java_bridge_default = runtime2;

// src/index.ts
var originalConsoleLog = console.log;
console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  const message = args.map((arg) => {
    try {
      return String(arg);
    } catch (e) {
      return "<Object conversion error>";
    }
  }).join(" ");
  send({
    type: "log",
    message
  });
};
var originalConsoleError = console.error;
console.error = function(...args) {
  originalConsoleError.apply(console, args);
  const message = args.map((arg) => {
    try {
      return String(arg);
    } catch (e) {
      return "<Object conversion error>";
    }
  }).join(" ");
  send({
    type: "error",
    description: message
  });
};
var IL2CPP_INIT_PATTERN = "F4 4F BE A9 FD 7B 01 A9 FD 43 00 91 F3 03 00 AA ?? ?? ?? ?? ?? ?? ?? ?? 00 00 80 52 ?? ?? ?? ?? E0 03 13 AA ?? ?? ?? ?? FD 7B 41 A9 F4 4F C2 A8 C0 03 5F D6";
var IL2CPP_MODULE_NAME = "UnityFramework";
var IL2CPP_RUNTIME_OFFSETS = {
  "il2cpp_init": 0,
  "il2cpp_get_corlib": 96,
  "il2cpp_class_enum_basetype": 136,
  "il2cpp_class_from_system_type": 140,
  "il2cpp_class_is_generic": 144,
  "il2cpp_class_is_inflated": 148,
  "il2cpp_class_is_subclass_of": 152,
  "il2cpp_class_is_abstract": 240,
  "il2cpp_class_is_interface": 252,
  "il2cpp_class_from_il2cpp_type": 160,
  "il2cpp_class_from_name": 168,
  "il2cpp_class_get_fields": 172,
  "il2cpp_class_get_nested_types": 176,
  "il2cpp_class_get_field_from_name": 180,
  "il2cpp_class_get_methods": 184,
  "il2cpp_class_get_name": 188,
  "il2cpp_class_get_namespace": 192,
  "il2cpp_class_get_parent": 196,
  "il2cpp_class_get_declaring_type": 200,
  "il2cpp_class_instance_size": 204,
  "il2cpp_class_is_valuetype": 208,
  "il2cpp_class_get_method_from_name": 398908,
  // Internal function
  "il2cpp_class_get_interfaces": 398468,
  // Internal function
  "il2cpp_class_array_element_size": 296,
  "il2cpp_class_from_type": 300,
  "il2cpp_class_get_type": 308,
  "il2cpp_class_has_attribute": 316,
  "il2cpp_class_is_enum": 320,
  "il2cpp_class_get_image": 332,
  "il2cpp_class_get_assemblyname": 336,
  "il2cpp_class_get_rank": 340,
  "il2cpp_class_is_assignable_from": 3496,
  "il2cpp_class_value_size": 399704,
  // Internal function
  "il2cpp_domain_get": 348,
  "il2cpp_domain_assembly_open": 352,
  "il2cpp_free": 104,
  // Mono.SafeStringMarshal$$GFree_0_0
  "il2cpp_image_get_class": 1340,
  "il2cpp_image_get_class_count": 1316,
  "il2cpp_resolve_icall": 309304,
  // Internal function
  "il2cpp_string_length": 916,
  "il2cpp_string_chars": 920,
  "il2cpp_string_new": 924,
  "il2cpp_thread_current": 940,
  "il2cpp_thread_attach": 944,
  "il2cpp_thread_detach": 340256,
  // Internal function
  "il2cpp_method_get_return_type": 800,
  "il2cpp_method_get_from_reflection": 804,
  "il2cpp_method_get_object": 808,
  "il2cpp_method_get_name": 812,
  "il2cpp_method_is_generic": 816,
  "il2cpp_method_is_inflated": 820,
  "il2cpp_method_is_instance": 824,
  "il2cpp_method_get_param_count": 828,
  "il2cpp_method_get_param_name": 336628,
  // Internal function
  "il2cpp_method_get_param": 832,
  "il2cpp_method_get_class": 836,
  "il2cpp_method_has_attribute": 840,
  "il2cpp_object_get_class": 844,
  "il2cpp_object_get_virtual_method": 848,
  "il2cpp_object_new": 852,
  "il2cpp_type_get_object": 948,
  "il2cpp_type_get_type": 952,
  "il2cpp_type_get_name": 960,
  "il2cpp_field_static_get_value": 383548,
  // Internal function
  "il2cpp_array_class_get": 108,
  "il2cpp_array_length": 112,
  "il2cpp_array_new": 116,
  "il2cpp_assembly_get_image": 132,
  "il2cpp_runtime_class_init": 1948,
  "il2cpp_field_get_name": 620,
  "il2cpp_field_get_flags": 624,
  "il2cpp_field_get_parent": 628,
  "il2cpp_field_get_offset": 632,
  "il2cpp_field_get_type": 636,
  "il2cpp_field_get_value": 640,
  "il2cpp_field_has_attribute": 644
};
function createIl2CppExports(il2cppInitAddress, offsets) {
  const exports = {};
  for (const functionName in offsets) {
    if (offsets.hasOwnProperty(functionName)) {
      const offset = offsets[functionName];
      exports[functionName] = () => {
        const targetAddress = il2cppInitAddress.add(offset);
        return targetAddress;
      };
    }
  }
  return exports;
}
function findIl2cppInitInTextSection() {
  var il2cppModule = null;
  if (Process.platform.valueOf() == "darwin") {
    console.log(`[+] Try find module: ${IL2CPP_MODULE_NAME}`);
    il2cppModule = Process.getModuleByName(IL2CPP_MODULE_NAME);
  } else {
    console.error(`[-] Unsupported platform: ${Process.platform}`);
    return false;
  }
  if (!il2cppModule) {
    console.error(`[-] Cannot find module`);
    return false;
  }
  console.log(`[+] Found: ${il2cppModule.name} (Base: ${il2cppModule.base})`);
  var scanStartAddress = il2cppModule.base;
  var scanSize = il2cppModule.size;
  const sections = il2cppModule.enumerateSections();
  for (const section of sections) {
    if (section.name === "__text") {
      const startAddress = section.address;
      const size = section.size;
      console.log(`[+] Section: ${startAddress} - ${startAddress.add(size)} (Size: ${ptr(size)})`);
      scanStartAddress = startAddress;
      scanSize = size;
      break;
    }
  }
  if (!scanStartAddress || !scanSize) {
    return false;
  }
  console.log(`[+] Start Scan...`);
  const scanResult = Memory.scanSync(scanStartAddress, scanSize, IL2CPP_INIT_PATTERN);
  if (scanResult.length > 0) {
    const result = scanResult[0];
    console.log(`[!!!] Matched!`);
    console.log(`[!!!] Address: ${result.address}`);
    console.log(`[!!!] Offset in Module: ${result.address.sub(il2cppModule.base)}`);
    Il2Cpp.$config.exports = createIl2CppExports(result.address, IL2CPP_RUNTIME_OFFSETS);
    return true;
  }
  return false;
}
var globalConfig = {
  "MagicaClothSimulationFrequency": 120,
  "MagicaClothSimulationCountPerFrame": 5,
  "LowQualityLongSide": 1920,
  "MediumQualityLongSide": 2880,
  "HighQualityLongSide": 3840,
  "LowQualityAdvFactor": 1,
  "MediumQualityAdvFactor": 1.5,
  "HighQualityAdvFactor": 2,
  "MaximumFPS": 60,
  "OrientationModify": false,
  "ForceRotate": false,
  "RemoveImgCover": false,
  "AntiAliasing": 8,
  "ModifyWithToFes": false,
  "LocalizeArchive": false,
  "TargetClientVersion": "",
  "TargetResVersion": "",
  "NovelSingleCharDisplayTime": 0.03,
  "NovelTextAnimationSpeedFactor": 1.3,
  "AutoNovelAuto": false,
  "AutoCloseSubtitle": false,
  "ProxyUrl": "",
  "ProxyUsername": "",
  "ProxyPassword": "",
  "EnableProxy": false,
  "BlockHeartShow": false,
  "BlockCharaCutIn": false,
  "FixPopupLandscape": false,
  "PopupLandscaleScale": 0
};
var hasloaded = false;
function getMaxRefreshRate490() {
  const UnityEngineCoreModule = Il2Cpp.domain.assembly("UnityEngine.CoreModule");
  const UnityScreen = UnityEngineCoreModule.image.class("UnityEngine.Screen");
  const currentResolution = UnityScreen.method("get_currentResolution").invoke();
  var refreshRate = 60;
  if (currentResolution.tryMethod("get_refreshRate")) {
    refreshRate = currentResolution.method("get_refreshRate").invoke();
  } else {
    refreshRate = currentResolution.method("get_refreshRateRatio").invoke().method("get_value").invoke();
  }
  return refreshRate;
}
rpc.exports = {
  setconfig: (cfg) => {
    globalConfig = { ...globalConfig, ...cfg };
    console.log("Config updated");
    if (!hasloaded)
      return;
    const UnityEngineCoreModule = Il2Cpp.domain.assembly("UnityEngine.CoreModule");
    const UnityScreen = UnityEngineCoreModule.image.class("UnityEngine.Screen");
    const UnityApplication = UnityEngineCoreModule.image.class("UnityEngine.Application");
    const EmptyString = Il2Cpp.corlib.class("System.String").field("Empty").value;
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp");
    const SystemDll = Il2Cpp.domain.assembly("System");
    UnityApplication.method("set_targetFrameRate").invoke(Math.min(getMaxRefreshRate490(), globalConfig["MaximumFPS"]));
    const UnityQualitySettings = UnityEngineCoreModule.image.class("UnityEngine.QualitySettings");
    UnityQualitySettings.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"]);
    if (globalConfig["ForceRotate"]) {
      UnityScreen.method("set_orientation").invoke(5);
      UnityScreen.method("set_orientation").invoke(4);
    }
    if (globalConfig.EnableProxy && globalConfig.ProxyUrl) {
      const apiClient = AssemblyCSharp.image.class("Org.OpenAPITools.Client.Configuration").method("get_Default").invoke().method("get_ApiClient").invoke().method("get_RestClient").invoke();
      const proxyUri = SystemDll.image.class("System.Uri").new();
      proxyUri.method(".ctor").overload("System.String").invoke(Il2Cpp.string(globalConfig.ProxyUrl));
      const networkCredential = SystemDll.image.class("System.Net.NetworkCredential").new();
      networkCredential.method(".ctor").overload("System.String", "System.String").invoke(globalConfig.ProxyUsername ? Il2Cpp.string(globalConfig.ProxyUsername) : EmptyString, globalConfig.ProxyPassword ? Il2Cpp.string(globalConfig.ProxyPassword) : EmptyString);
      const webProxy = SystemDll.image.class("System.Net.WebProxy").new();
      webProxy.method(".ctor").overload(proxyUri.class, "System.Boolean", "System.String[]", networkCredential.class).invoke(proxyUri, true, Il2Cpp.array(Il2Cpp.corlib.class("System.String"), 0), networkCredential);
      apiClient.method("set_Proxy").invoke(webProxy);
    }
  },
  getconfig: () => globalConfig
};
var serverResVersion = "";
function getClientVersion() {
  if (frida_java_bridge_default.available) {
    var context = frida_java_bridge_default.use("android.app.ActivityThread").currentApplication().getApplicationContext();
    var packageName = context.getPackageName();
    var pkgInfo = context.getPackageManager().getPackageInfo(packageName, 0);
    return pkgInfo.versionName.value.split(".").map((x) => parseInt(x));
  } else if (Process.platform.valueOf() == "darwin") {
    const clientVersionString = frida_objc_bridge_default.classes.NSBundle.mainBundle().objectForInfoDictionaryKey_("CFBundleShortVersionString").toString();
    return clientVersionString.split(".").map((x) => parseInt(x));
  } else {
    send({
      "type": "error",
      "description": "Unsupported environment"
    });
  }
  return null;
}
function main() {
  if (Process.platform.valueOf() == "darwin") {
    const versionArray = getClientVersion();
    if (!versionArray) {
      return;
    }
    if (versionArray[0] == 4 || versionArray[1] >= 9 || versionArray[0] >= 5) {
      console.log(`LLLL ${versionArray.map((x) => String(x)).join(".")} detected, please wait memory scan`);
      if (!findIl2cppInitInTextSection()) {
        send({
          "type": "error",
          "description": "Cannot find il2cpp_init function"
        });
        return;
      }
      Il2Cpp.$config.unityVersion = "2022.3.62f2";
    }
  }
  Il2Cpp.perform(() => {
    hasloaded = true;
    const UnityEngineCoreModule = Il2Cpp.domain.assembly("UnityEngine.CoreModule");
    const UnityScreen = UnityEngineCoreModule.image.class("UnityEngine.Screen");
    const UnityApplication = UnityEngineCoreModule.image.class("UnityEngine.Application");
    const UnityQualitySettings = UnityEngineCoreModule.image.class("UnityEngine.QualitySettings");
    const UnityRenderPipelinesRuntime = Il2Cpp.domain.assembly("Unity.RenderPipelines.Universal.Runtime");
    const UniversalRenderPipeline = UnityRenderPipelinesRuntime.image.class("UnityEngine.Rendering.Universal.UniversalRenderPipeline");
    const MagicaClothV2 = Il2Cpp.domain.assembly("MagicaClothV2");
    const MagicaManager = MagicaClothV2.image.class("MagicaCloth2.MagicaManager");
    const Core = Il2Cpp.domain.assembly("Core");
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp");
    MagicaManager.method("SetSimulationFrequency").implementation = function(frequency) {
      return this.method("SetSimulationFrequency").invoke(globalConfig["MagicaClothSimulationFrequency"]);
    };
    MagicaManager.method("SetMaxSimulationCountPerFrame").implementation = function(count) {
      return this.method("SetMaxSimulationCountPerFrame").invoke(globalConfig.MagicaClothSimulationCountPerFrame);
    };
    function get_SaveData() {
      return AssemblyCSharp.image.class("Global").method("get_Instance").invoke().method("get_SaveData").invoke();
    }
    const EmptyString = Il2Cpp.corlib.class("System.String").field("Empty").value;
    if (Core.image.tryClass("Alstromeria.ArchiveLiveDataStream") != null) {
      Core.image.class("Alstromeria.ArchiveLiveDataStream").method(".ctor").implementation = function(directoryManager, downloader, fileSystem) {
        const objDownloader = downloader;
        objDownloader.method("IsDownloaded").revert();
        objDownloader.method("IsDownloaded").implementation = function(file) {
          var result = this.method("IsDownloaded").invoke(file);
          if (!result) {
            const objFile = file;
            const name = objFile.method("get_Name").invoke();
            const downloadStatus = this.field("downloadStatus").value;
            const path = this.field("directoryManager").value.method("GetLocalFullPathFromFileName").invoke(name);
            const fileExists = Il2Cpp.corlib.class("System.IO.File").method("Exists").invoke(path);
            if (fileExists) {
              downloadStatus.method("set_Item").invoke(file, 2);
              result = true;
            }
          }
          return result;
        };
        return this.method(".ctor").invoke(directoryManager, downloader, fileSystem);
      };
    }
    function getSize(quality = -1, isLongSide = 1) {
      if (quality == -1) {
        quality = get_SaveData().method("get_RenderTextureQuality").invoke().field("value__").value;
      }
      var size = 0;
      switch (quality) {
        case 1:
          size = globalConfig["MediumQualityLongSide"];
          break;
        case 2:
          size = globalConfig["HighQualityLongSide"];
          break;
        default:
          size = globalConfig["LowQualityLongSide"];
      }
      if (!isLongSide) {
        return Math.floor(size / 16 * 9);
      } else {
        return size;
      }
    }
    if (AssemblyCSharp.image.tryClass("School.LiveMain.SchoolResolution")) {
      let setResolutions2 = function(_liveAreaResolutions) {
        for (let i = 0; i < 3; i++) {
          const LiveResolution = _liveAreaResolutions.method("get_Item").invoke(i);
          LiveResolution.field("_longSide").value = getSize(i, 1);
          LiveResolution.field("_shortSide").value = getSize(i, 0);
        }
      };
      var setResolutions = setResolutions2;
      const SchoolResolution = AssemblyCSharp.image.class("School.LiveMain.SchoolResolution");
      SchoolResolution.initialize();
      SchoolResolution.method("GetResolution").implementation = function(quality, orientation) {
        const _liveAreaResolutions = SchoolResolution.field("_liveAreaResolutions").value;
        const numQuality = quality.field("value__").value;
        const longSide = _liveAreaResolutions.method("get_Item").invoke(numQuality).field("_longSide").value;
        if (getSize(numQuality, 1) != longSide) {
          setResolutions2(_liveAreaResolutions);
        }
        const result = this.method("GetResolution").invoke(quality, orientation);
        return result;
      };
    }
    const AlphaBlendCamera = Core.image.class("Inspix.AlphaBlendCamera");
    var alphaModified = false;
    AlphaBlendCamera.method("UpdateAlpha").implementation = function(newAlpha) {
      const alpha = newAlpha;
      const RenderTextureQuality = get_SaveData().method("get_RenderTextureQuality").invoke();
      const quality = RenderTextureQuality.field("value__").value;
      if (alpha > 0 && alpha < 1) {
        if (!alphaModified && quality > 0) {
          alphaModified = true;
          get_SaveData().method("set_RenderTextureQuality").invoke(quality - 1);
        }
      } else if (alphaModified) {
        alphaModified = false;
        if (quality < 2)
          get_SaveData().method("set_RenderTextureQuality").invoke(quality + 1);
      }
      this.method("UpdateAlpha").invoke(newAlpha);
    };
    Core.image.class("Inspix.Character.IsFocusableChecker").method("SetFocusArea").implementation = function() {
      this.method("SetFocusArea").invoke();
      const focusAreaMaxValue = this.field("focusAreaMaxValue").value;
      const focusAreaMinValue = this.field("focusAreaMinValue").value;
      focusAreaMaxValue.handle.add(0).writeFloat(focusAreaMaxValue.handle.add(0).readFloat() + 0.5);
      focusAreaMinValue.handle.add(0).writeFloat(focusAreaMinValue.handle.add(0).readFloat() - 0.5);
    };
    AssemblyCSharp.image.class("School.LiveMain.FesLiveFixedCamera").method(".ctor").implementation = function(camera, targetTexture, setting, cameraType) {
      const objCameraSetting = setting;
      const CameraType = cameraType;
      objCameraSetting.handle.add(28).writeFloat(1e6);
      objCameraSetting.handle.add(44).writeFloat(360);
      objCameraSetting.handle.add(60).writeFloat(0.1);
      objCameraSetting.handle.add(52).writeFloat(10);
      objCameraSetting.handle.add(56).writeFloat(150);
      const objRenderTexture = targetTexture;
      objRenderTexture.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"]);
      if (CameraType.toString() == "LiveCameraTypeArenaView") {
        objCameraSetting.handle.add(16).writeFloat(0);
        objCameraSetting.handle.add(20).writeFloat(0.9);
        objCameraSetting.handle.add(24).writeFloat(-4);
        objCameraSetting.handle.add(32).writeFloat(0);
        objCameraSetting.handle.add(36).writeFloat(0);
        objCameraSetting.handle.add(40).writeFloat(0);
      } else {
        objCameraSetting.handle.add(16).writeFloat(0);
        objCameraSetting.handle.add(20).writeFloat(7.5);
        objCameraSetting.handle.add(24).writeFloat(0.5);
        objCameraSetting.handle.add(32).writeFloat(90);
        objCameraSetting.handle.add(36).writeFloat(0);
        objCameraSetting.handle.add(40).writeFloat(0);
      }
      return this.method(".ctor").invoke(camera, targetTexture, setting, cameraType);
    };
    AssemblyCSharp.image.class("School.LiveMain.IdolTargetingCamera").method(".ctor").implementation = function(camera, targetTexture, setting) {
      const objCameraSetting = setting;
      objCameraSetting.handle.add(36).writeFloat(1e5);
      objCameraSetting.handle.add(52).writeFloat(360);
      objCameraSetting.handle.add(84).writeFloat(0.05);
      objCameraSetting.handle.add(60).writeFloat(10);
      objCameraSetting.handle.add(64).writeFloat(150);
      objCameraSetting.handle.add(24).writeFloat(0);
      objCameraSetting.handle.add(28).writeFloat(1.2);
      objCameraSetting.handle.add(32).writeFloat(6);
      objCameraSetting.handle.add(40).writeFloat(0);
      objCameraSetting.handle.add(56).writeFloat(56);
      objCameraSetting.handle.add(68).writeFloat(0.1);
      objCameraSetting.handle.add(76).writeFloat(0);
      objCameraSetting.handle.add(80).writeFloat(500);
      const objRenderTexture = targetTexture;
      objRenderTexture.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"]);
      this.method(".ctor").invoke(camera, targetTexture, setting);
      const tracer = this.field("tracer").value;
      const defaultWorldPositionFromIdol = tracer.class.field("defaultWorldPositionFromIdol").value;
      defaultWorldPositionFromIdol.method("Set").invoke(0, 0, 6);
      tracer.class.field("defaultWorldPositionFromIdol").value = defaultWorldPositionFromIdol;
    };
    function modifyStoryCameraRenderTexture(camera) {
      if (!camera.toString().startsWith("StoryCamera")) {
        return;
      }
      const quality = get_SaveData().method("get_RenderTextureQuality").invoke().field("value__").value;
      const RenderTexture = camera.method("get_targetTexture").invoke();
      if (!RenderTexture.isNull()) {
        const RenderTextureHeight = RenderTexture.method("get_height").invoke();
        const RenderTextureWidth = RenderTexture.method("get_width").invoke();
        var factor = 1;
        switch (quality) {
          case 0:
            factor = globalConfig.LowQualityAdvFactor;
            break;
          case 1:
            factor = globalConfig.MediumQualityAdvFactor;
            break;
          case 2:
            factor = globalConfig.HighQualityAdvFactor;
            break;
        }
        RenderTexture.method("set_width").invoke(Math.floor(RenderTextureWidth * factor));
        RenderTexture.method("set_height").invoke(Math.floor(RenderTextureHeight * factor));
        RenderTexture.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"]);
      }
    }
    const CreateRenderTextureDescriptor = UniversalRenderPipeline.method("CreateRenderTextureDescriptor");
    switch (CreateRenderTextureDescriptor.parameterCount) {
      case 6:
        CreateRenderTextureDescriptor.implementation = function(camera, renderScale, isHdrEnabled, msaaSamples, needsAlpha, requiresOpaqueTexture) {
          modifyStoryCameraRenderTexture(camera);
          return this.method("CreateRenderTextureDescriptor").invoke(camera, renderScale, isHdrEnabled, globalConfig["AntiAliasing"], needsAlpha, requiresOpaqueTexture);
        };
        break;
      case 7:
        CreateRenderTextureDescriptor.implementation = function(camera, cameraData, isHdrEnabled, requestHDRColorBufferPrecision, msaaSamples, needsAlpha, requiresOpaqueTexture) {
          modifyStoryCameraRenderTexture(camera);
          return this.method("CreateRenderTextureDescriptor").invoke(camera, cameraData, isHdrEnabled, requestHDRColorBufferPrecision, globalConfig["AntiAliasing"], needsAlpha, requiresOpaqueTexture);
        };
        break;
      default:
        break;
    }
    UnityQualitySettings.method("set_antiAliasing").implementation = function(aa) {
      return this.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"]);
    };
    AssemblyCSharp.image.class("Inspix.PlayerGameViewUtilsImpl").method("SetPortraitImpl").implementation = function() {
      if (!globalConfig["OrientationModify"])
        return this.method("SetPortraitImpl").invoke();
    };
    AssemblyCSharp.image.class("Inspix.PlayerGameViewUtilsImpl").method("SetLandscapeImpl").implementation = function() {
      if (!globalConfig["OrientationModify"])
        return this.method("SetLandscapeImpl").invoke();
    };
    AssemblyCSharp.image.class("Inspix.PlayerGameViewUtilsImpl").method("CurrentOrientationIsImpl").implementation = function() {
      if (globalConfig["OrientationModify"]) {
        return true;
      } else {
        return this.method("CurrentOrientationIsImpl").invoke();
      }
    };
    UnityApplication.method("set_targetFrameRate").implementation = function(fps) {
      const targetFPS = Math.min(getMaxRefreshRate490(), globalConfig["MaximumFPS"]);
      return this.method("set_targetFrameRate").invoke(targetFPS);
    };
    UnityApplication.method("set_targetFrameRate").invoke(Math.min(getMaxRefreshRate490(), globalConfig["MaximumFPS"]));
    UnityQualitySettings.method("set_antiAliasing").invoke(globalConfig["AntiAliasing"]);
    Core.image.class("Inspix.CoverImageCommandReceiver").method("<Awake>b__9_0").implementation = function(value) {
      const objValue = value;
      if (globalConfig["RemoveImgCover"]) {
        objValue.method(".ctor").invoke(EmptyString, objValue.field("SyncTime").value);
      }
      this.method("<Awake>b__9_0").invoke(objValue);
    };
    const FootShadowManipulator = Core.image.class("Inspix.Character.FootShadow.FootShadowManipulator");
    if (FootShadowManipulator.tryMethod("<SetupObserveProperty>b__15_0")) {
      FootShadowManipulator.method("<SetupObserveProperty>b__15_0").implementation = function(value) {
        const objValue = value;
        if (globalConfig.RemoveImgCover) {
          objValue.method(".ctor").invoke(true, objValue.field("SyncTime").value);
        }
        this.method("<SetupObserveProperty>b__15_0").invoke(objValue);
      };
    } else {
      FootShadowManipulator.method("<SetupObserveProperty>b__16_0").implementation = function(value) {
        const objValue = value;
        if (globalConfig.RemoveImgCover) {
          objValue.method(".ctor").invoke(true, objValue.field("SyncTime").value);
        }
        this.method("<SetupObserveProperty>b__16_0").invoke(objValue);
      };
    }
    Core.image.class("Inspix.Character.CharacterVisibleReceiver").method("<SetupReceiveActions>b__9_0").implementation = function(value) {
      const objValue = value;
      if (globalConfig.RemoveImgCover) {
        objValue.method(".ctor").invoke(true, objValue.field("SyncTime").value);
      }
      this.method("<SetupReceiveActions>b__9_0").invoke(objValue);
    };
    var archiveData = {
      archive_url: "",
      live_type: 3,
      chapters: [],
      costume_ids: [],
      timeline_ids: []
    };
    var archiveDataGet;
    AssemblyCSharp.image.class("School.LiveMain.ApiRepository").method("ArchiveGetFesArchiveDataAsync").implementation = function(archiveId) {
      if (globalConfig.LocalizeArchive) {
        send({ type: "archiveDataGet", archive_id: archiveId.content });
        archiveDataGet = recv("archiveData", function(data) {
          archiveData = data.payload;
        });
        archiveDataGet.wait();
      }
      return this.method("ArchiveGetFesArchiveDataAsync").invoke(archiveId);
    };
    AssemblyCSharp.image.class("School.LiveMain.ApiRepository").method("ArchiveGetWithArchiveDataAsync").implementation = function(archiveId) {
      if (globalConfig.LocalizeArchive) {
        send({ type: "archiveDataGet", archive_id: archiveId.content });
        archiveDataGet = recv("archiveData", function(data) {
          archiveData = data.payload;
        });
        archiveDataGet.wait();
      }
      return this.method("ArchiveGetWithArchiveDataAsync").invoke(archiveId);
    };
    const GetWithArchiveDataResponse = AssemblyCSharp.image.class("Org.OpenAPITools.Model.GetWithArchiveDataResponse");
    const GetFesArchiveDataResponse = AssemblyCSharp.image.class("Org.OpenAPITools.Model.GetFesArchiveDataResponse");
    const globalClass = AssemblyCSharp.image.class("Global").method("get_Instance").invoke();
    globalClass.method("get_Resources").invoke().method("TryUpdatedRequestedResourceVersion").implementation = function(serverResver) {
      var result = true;
      if (globalConfig["TargetResVersion"]) {
        result = this.method("TryUpdatedRequestedResourceVersion").invoke(Il2Cpp.string(globalConfig["TargetResVersion"]));
      } else
        result = this.method("TryUpdatedRequestedResourceVersion").invoke(serverResver);
      return result;
    };
    AssemblyCSharp.image.class("Org.OpenAPITools.Client.ApiClient").method("CallApiAsync").implementation = function(path, method2, queryParams, postBody, headerParams, formParams, fileParams, pathParams, contentType, cancellationtoken) {
      const objHeaderParams = headerParams;
      if (serverResVersion) {
        const xresversion = Il2Cpp.string("x-res-version");
        if (objHeaderParams.method("ContainsKey").invoke(xresversion)) {
          objHeaderParams.method("set_Item").invoke(xresversion, Il2Cpp.string(serverResVersion.split("@")[0]));
        }
      }
      const strPath = path.content ?? "";
      if (globalConfig.ModifyWithToFes) {
        if (archiveData.live_type == 2) {
          if (strPath.endsWith("get_fes_archive_data")) {
            path = Il2Cpp.string("/v1/archive/get_with_archive_data");
          } else if (strPath.endsWith("get_fes_timeline_data")) {
            path = Il2Cpp.string("/v1/archive/withlive_info");
            const body = JSON.parse(postBody.content ?? "{}");
            postBody = EmptyString;
            const params = queryParams;
            const classStr = Il2Cpp.corlib.class("System.String");
            const kvPair = Il2Cpp.corlib.class("System.Collections.Generic.KeyValuePair`2").inflate(classStr, classStr);
            const matching = [
              ["live_id", body.ArchivesId],
              ["play_time_second", body.PlayTimeSecond?.toString()],
              ["timeline_unixtime", body.TimelineUnixtime?.toString()]
            ];
            for (const [key, value] of matching) {
              if (!key || !value)
                continue;
              const objKVPair = kvPair.new();
              objKVPair.method("set_Key").invoke(Il2Cpp.string(key));
              objKVPair.method("set_Value").invoke(Il2Cpp.string(value));
              params.method("Add").invoke(objKVPair);
            }
          }
        }
      }
      return this.method("CallApiAsync").invoke(path, method2, queryParams, postBody, headerParams, formParams, fileParams, pathParams, contentType, cancellationtoken);
    };
    var fesCameraCache = {
      CameraType: 1,
      FocusCharacterId: 0
    };
    AssemblyCSharp.image.class("Org.OpenAPITools.Client.ApiClient").method("Serialize").implementation = function(obj) {
      const objObj = obj;
      if (globalConfig.ModifyWithToFes && objObj.class.fullName == "Org.OpenAPITools.Model.SetFesCameraRequest") {
        if (archiveData.live_type == 2) {
          fesCameraCache = {
            CameraType: objObj.method("get_CameraType").invoke().field("value___").value,
            FocusCharacterId: objObj.method("get_FocusCharacterId").invoke()
          };
          objObj.method("set_LiveId").invoke(Il2Cpp.string("2fd5361e-75a5-4442-a006-3cd83f6e20cf"));
          objObj.method("set_CameraType").invoke(1);
          objObj.method("set_FocusCharacterId").invoke(0);
        }
      }
      return this.method("Serialize").invoke(objObj);
    };
    AssemblyCSharp.image.class("Org.OpenAPITools.Client.ApiClient").method("Deserialize").implementation = function(response, returnType) {
      const objResponse = response;
      if (globalConfig.TargetResVersion) {
        const headers = objResponse.method("get_Headers").invoke();
        const Enumerator = headers.method("GetEnumerator").invoke();
        while (Enumerator.method("MoveNext").invoke()) {
          const entry = Enumerator.method("get_Current").invoke();
          if (entry.method("get_Name").invoke().content == "x-res-version") {
            serverResVersion = entry.method("get_Value").invoke().method("Trim").invoke().content ?? "";
            entry.method("set_Value").invoke(Il2Cpp.string(globalConfig["TargetResVersion"]));
            break;
          }
        }
      }
      var objType = returnType;
      const typeName = objType.method("get_FullName").invoke().content ?? "";
      if (globalConfig.LocalizeArchive || globalConfig.ModifyWithToFes) {
        if (globalConfig.ModifyWithToFes) {
          if (archiveData.live_type == 2 && typeName == GetWithArchiveDataResponse.fullName) {
            objType = Il2Cpp.corlib.class("System.Type").method("GetType").overload("System.String").invoke(Il2Cpp.string(GetFesArchiveDataResponse.fullName));
          }
        }
      }
      const result = this.method("Deserialize").invoke(objResponse, objType);
      if ([GetWithArchiveDataResponse.fullName, GetFesArchiveDataResponse.fullName].includes(typeName)) {
        const objData = result;
        const objChapters = objData.method("get_Chapters").invoke();
        if (globalConfig.LocalizeArchive) {
          if (archiveData && archiveData.archive_url) {
            const objCostumeIds = objData.method("get_CostumeIds").invoke();
            const objTimelineIds = objData.method("get_TimelineIds").invoke();
            objData.method("set_ArchiveUrl").invoke(Il2Cpp.string(archiveData.archive_url));
            for (let i = 0; i < objChapters.method("get_Count").invoke(); i++) {
              const chapter = objChapters.method("get_Item").invoke(i);
              if (i < archiveData.chapters.length) {
                chapter.method("set_PlayTimeSecond").invoke(archiveData.chapters[i].play_time_second);
              } else {
                break;
              }
            }
            if (objCostumeIds.method("get_Count").invoke() == 0) {
              archiveData.costume_ids.forEach(function(costume_id) {
                objCostumeIds.method("Add").invoke(costume_id);
              });
            }
            if (objTimelineIds.method("get_Count").invoke() == 0) {
              archiveData.timeline_ids.forEach(function(timeline_id) {
                objTimelineIds.method("Add").invoke(timeline_id);
              });
            }
            objData.method("set_ContentCode").invoke(999);
            if (result.class.fullName == GetWithArchiveDataResponse.fullName) {
              objData.method("set_VideoUrl").invoke(EmptyString);
            }
          }
        }
        if (globalConfig.RemoveImgCover) {
          if (archiveData.live_type == 2) {
            const theVeryFirst = AssemblyCSharp.image.class("Org.OpenAPITools.Model.ArchiveWithliveChapter").new();
            objChapters.method("Insert").invoke(0, theVeryFirst);
          } else {
            const theVeryFirst = AssemblyCSharp.image.class("Org.OpenAPITools.Model.ArchiveFesliveChapter").new();
            objChapters.method("Insert").invoke(0, theVeryFirst);
          }
        }
        if (archiveData.live_type == 2 && globalConfig.ModifyWithToFes || archiveData.live_type == 1) {
          objData.method("set_TicketRank").invoke(6);
          const cameraType = AssemblyCSharp.image.class("Org.OpenAPITools.Model.LiveCameraType");
          const listCameraType = Il2Cpp.corlib.class("System.Collections.Generic.List`1").inflate(cameraType).new();
          objData.method("set_SelectableCameraTypes").invoke(listCameraType);
          [1, 2, 3, 4].forEach((i) => {
            listCameraType.method("Add").invoke(i);
          });
        }
        objData.method("set_HasExtraAdmission").invoke(true);
      } else if (typeName == "Org.OpenAPITools.Model.GetArchiveListResponse") {
        const archiveList = result.method("get_ArchiveList").invoke();
        const enumerator = archiveList.method("GetEnumerator").invoke();
        while (enumerator.method("MoveNext").invoke()) {
          const current = enumerator.method("get_Current").invoke();
          current.method("set_HasExtraAdmission").invoke(true);
          current.method("set_EarnedStarCount").invoke(4);
          current.method("set_TicketRank").invoke(6);
          if (globalConfig.ModifyWithToFes) {
            current.method("set_LiveType").invoke(1);
          }
        }
      } else if (globalConfig.ModifyWithToFes && archiveData.live_type == 2 && typeName == "Org.OpenAPITools.Model.SetFesCameraResponse") {
        result.method("set_CameraType").invoke(fesCameraCache.CameraType);
        result.method("set_FocusCharacterId").invoke(fesCameraCache.FocusCharacterId);
      }
      return result;
    };
    Core.image.class("Hailstorm.Catalog").method("Parse").overload("Hailstorm.Catalog.Manifest", "System.IO.Stream").implementation = function(manifest, stream) {
      if (globalConfig["TargetClientVersion"]) {
        UnityApplication.method("get_version").implementation = function() {
          return Il2Cpp.string(globalConfig["TargetClientVersion"]);
        };
      }
      const result = this.method("Parse").overload("Hailstorm.Catalog.Manifest", "System.IO.Stream").invoke(manifest, stream);
      UnityApplication.method("get_version").revert();
      return result;
    };
    AssemblyCSharp.image.class("Tecotec.StoryUIWindow").method("Setup").implementation = function(skipReturn, skipLine, timesec, seekbar) {
      this.method("Setup").invoke(skipReturn, skipLine, timesec, seekbar);
      if (globalConfig.AutoNovelAuto) {
        this.tryMethod("NovelAutoSpeed")?.invoke(1);
        this.tryMethod("SetNovelWaitInterval")?.invoke(1);
        this.tryMethod("SetNovelTextSpeedMove")?.invoke(1);
      }
      if (globalConfig.AutoCloseSubtitle) {
        const isSubtitle = this.field("menu").value.field("isSubtitle").value;
        if (isSubtitle)
          this.method("OnClickSwitchSubtitle").invoke();
      }
    };
    AssemblyCSharp.image.class("School.Story.NovelView").method("AddTextAsync").implementation = function(text, rubis, durationSec, shouldTapWait, addNewLine) {
      const result = this.method("AddTextAsync").invoke(text, rubis, durationSec, shouldTapWait, addNewLine);
      this.method("ChangeSpeed").invoke(globalConfig.NovelTextAnimationSpeedFactor);
      return result;
    };
    AssemblyCSharp.image.class("Tecotec.AddNovelTextCommand").method("GetDisplayTime").implementation = function(mnemonic) {
      if (!this.method("HasVoice").invoke(mnemonic)) {
        const result = this.method("GetText").invoke(mnemonic);
        const strLength = result.field("Item1").value.length;
        return strLength * globalConfig.NovelSingleCharDisplayTime;
      } else {
        return this.method("GetDisplayTime").invoke(mnemonic);
      }
    };
    AssemblyCSharp.image.class("Tecotec.QuestLive.Live.QuestLiveHeartObject").method("ShowHeart").implementation = function(show) {
      if (globalConfig.BlockHeartShow) {
        return this.method("ShowHeart").invoke(false);
      }
      return this.method("ShowHeart").invoke(show);
    };
    AssemblyCSharp.image.class("Tecotec.QuestLive.Live.QuestLiveCutinCharacter").method("PlaySkillAnimation").implementation = function() {
      if (globalConfig.BlockCharaCutIn) {
        return;
      }
      return this.method("PlaySkillAnimation").invoke();
    };
    AssemblyCSharp.image.class("Inspix.LiveMain.BasePopup").method("OpenAsync").implementation = function() {
      if (globalConfig.FixPopupLandscape) {
        const width = UnityScreen.method("get_width").invoke();
        const height = UnityScreen.method("get_height").invoke();
        if (width > height) {
          if (globalConfig.PopupLandscaleScale < 0.01) {
            this.method("SetLandscapeScaleIfNeed").invoke(height / width);
          } else {
            this.method("SetLandscapeScaleIfNeed").invoke(globalConfig.PopupLandscaleScale);
          }
        }
      }
      return this.method("OpenAsync").invoke();
    };
    console.log("Successfully hooked");
  });
}
setImmediate(() => {
  main();
});
