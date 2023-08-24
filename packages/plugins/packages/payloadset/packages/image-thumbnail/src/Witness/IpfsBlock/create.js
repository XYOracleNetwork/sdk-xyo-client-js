import withIs from 'class-is'
import transform from 'lodash/transform'

import createReader from './reader.js'

const readonly = (value) => ({
  get: () => value,
  set: () => {
    throw new Error('Cannot set read-only property')
  },
})

const immutableTypes = new Set(['number', 'string', 'boolean'])

export default (multiformats) => {
  const { bytes, CID, multihash, multicodec } = multiformats ?? {}
  const { coerce, isBinary } = bytes ?? {}
  const copyBinary = (value) => {
    const b = coerce(value)
    return coerce(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength))
  }
  const reader = createReader(multiformats)

  const clone = (obj) =>
    transform(obj, (result, value, key) => {
      const cid = CID.asCID(value)
      if (cid) {
        result[key] = cid
      } else if (isBinary(value)) {
        result[key] = copyBinary(value)
      } else if (typeof value === 'object' && value !== null) {
        result[key] = clone(value)
      } else {
        result[key] = value
      }
    })

  class Block {
    constructor(opts) {
      if (!opts) throw new Error('Block options are required')
      if (opts.cid) opts.cid = CID.asCID(opts.cid)
      if (typeof opts.codec === 'number') {
        opts.code = opts.codec
        opts.codec = multicodec.get(opts.code).name
      }
      if (typeof opts.source === 'undefined' && typeof opts.data === 'undefined') {
        throw new Error('Block instances must be created with either an encode source or data')
      }
      if (typeof opts.source !== 'undefined' && !opts.codec && !opts.code) {
        throw new Error('Block instances created from source objects must include desired codec')
      }
      if (opts.data && !opts.cid && !opts.codec && !opts.code) {
        throw new Error('Block instances created from data must include cid or codec')
      }
      if (!opts.cid && !opts.algo) opts.algo = 'sha2-256'
      // Do our best to avoid accidental mutations of the options object after instantiation
      // Note: we can't actually freeze the object because we mutate it once per property later
      opts = Object.assign({}, opts)
      Object.defineProperty(this, 'opts', readonly(opts))
    }

    source() {
      if (this.opts.cid || this.opts.data || this._encoded || this._decoded) return null
      if (!this.opts.source) return null
      return this.opts.source
    }

    async cid() {
      if (this.opts.cid) return this.opts.cid
      const hash = await multihash.hash(this.encodeUnsafe(), this.opts.algo)
      const cid = CID.create(1, this.code, hash)
      this.opts.cid = cid
      // https://github.com/bcoe/c8/issues/135
      /* c8 ignore next */
      return cid
    }

    get codec() {
      if (this.opts.code) {
        this.opts.codec = multicodec.get(this.opts.code).name
      }
      if (this.opts.cid) {
        this.opts.codec = multicodec.get(this.opts.cid.code).name
      }
      return this.opts.codec
    }

    get code() {
      if (this.opts.cid) return this.opts.cid.code
      if (!this.opts.code) {
        this.opts.code = multicodec.get(this.codec).code
      }
      return this.opts.code
    }

    async validate() {
      // if we haven't created a CID yet we know it will be valid :)
      if (!this.opts.cid) return true
      const cid = await this.cid()
      const data = this.encodeUnsafe()
      // https://github.com/bcoe/c8/issues/135
      /* c8 ignore next */
      return multihash.validate(cid.multihash, data)
    }

    _encode() {
      this._encoded = this.opts.data || multicodec.get(this.code).encode(this.opts.source)
    }

    encode() {
      if (!this._encoded) this._encode()
      return copyBinary(this._encoded)
    }

    encodeUnsafe() {
      if (!this._encoded) this._encode()
      return this._encoded
    }

    _decode() {
      if (typeof this.opts.source !== 'undefined') this._decoded = this.opts.source
      else {
        const { decode } = multicodec.get(this.code)
        this._decoded = decode(this._encoded || this.opts.data)
      }
      return this._decoded
    }

    decode() {
      // TODO: once we upgrade to the latest data model version of
      // dag-pb that @gozala wrote we should be able to remove this
      // and treat it like every other codec.
      /* c8 ignore next */
      if (this.codec === 'dag-pb') return this._decode()
      if (!this._decoded) this._decode()
      const tt = typeof this._decoded
      if (tt === 'number' || tt === 'boolean') {
        // return any immutable types
        return this._decoded
      }
      if (isBinary(this._decoded)) return copyBinary(this._decoded)
      if (immutableTypes.has(typeof this._decoded) || this._decoded === null) {
        return this._decoded
      }
      return clone(this._decoded)
    }

    decodeUnsafe() {
      if (!this._decoded) this._decode()
      return this._decoded
    }

    reader() {
      return reader(this.decodeUnsafe())
    }

    async equals(block) {
      if (block === this) return true
      const cid = await this.cid()
      if (CID.asCID(block)) return cid.equals(CID.asCID(block))
      // https://github.com/bcoe/c8/issues/135
      /* c8 ignore next */
      return cid.equals(await block.cid())
    }
  }

  const BlockWithIs = withIs(Block, { className: 'Block', symbolName: '@ipld/block' })
  BlockWithIs.encoder = (source, codec, algo) => new BlockWithIs({ algo, codec, source })
  BlockWithIs.decoder = (data, codec, algo) => new BlockWithIs({ algo, codec, data })
  BlockWithIs.create = (data, cid) => {
    if (typeof cid === 'string') cid = CID.from(cid)
    return new BlockWithIs({ cid, data })
  }
  BlockWithIs.multiformats = multiformats
  BlockWithIs.CID = CID
  return BlockWithIs
}
