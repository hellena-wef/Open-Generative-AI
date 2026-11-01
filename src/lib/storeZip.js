// Minimal ZIP writer ("stored", no compression) for packing training photos.
// JPEGs are already compressed, so deflate would gain nothing; this keeps us dependency-free.
// files: [{ name: string, data: Uint8Array }] -> Uint8Array (a valid .zip)

const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        t[n] = c >>> 0;
    }
    return t;
})();

export function crc32(bytes) {
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

export function storeZip(files) {
    const enc = new TextEncoder();
    const local = [];
    const central = [];
    let offset = 0;
    for (const { name, data } of files) {
        const nameBytes = enc.encode(name);
        const crc = crc32(data);
        const head = new DataView(new ArrayBuffer(30));
        head.setUint32(0, 0x04034b50, true); // local file header
        head.setUint16(4, 20, true);         // version needed
        head.setUint16(6, 0x0800, true);     // UTF-8 names
        head.setUint16(8, 0, true);          // stored
        head.setUint32(14, crc, true);
        head.setUint32(18, data.length, true);
        head.setUint32(22, data.length, true);
        head.setUint16(26, nameBytes.length, true);
        local.push(new Uint8Array(head.buffer), nameBytes, data);

        const cen = new DataView(new ArrayBuffer(46));
        cen.setUint32(0, 0x02014b50, true);  // central directory header
        cen.setUint16(4, 20, true);
        cen.setUint16(6, 20, true);
        cen.setUint16(8, 0x0800, true);
        cen.setUint16(10, 0, true);
        cen.setUint32(16, crc, true);
        cen.setUint32(20, data.length, true);
        cen.setUint32(24, data.length, true);
        cen.setUint16(28, nameBytes.length, true);
        cen.setUint32(42, offset, true);
        central.push(new Uint8Array(cen.buffer), nameBytes);
        offset += 30 + nameBytes.length + data.length;
    }
    const centralSize = central.reduce((n, b) => n + b.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);      // end of central directory
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    const parts = [...local, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(parts.reduce((n, b) => n + b.length, 0));
    let p = 0;
    for (const b of parts) { out.set(b, p); p += b.length; }
    return out;
}
