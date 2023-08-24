const createReader = (multiformats) => {
  const { CID } = multiformats
  /* eslint-disable max-depth */
  const links = function* (decoded, path = []) {
    if (typeof decoded !== 'object' || !decoded) return
    for (const key of Object.keys(decoded)) {
      const _path = path.slice()
      _path.push(key)
      const val = decoded[key]
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (let i = 0; i < val.length; i++) {
            const __path = _path.slice()
            __path.push(i)
            const o = val[i]
            const cid = CID.asCID(o)
            if (cid) {
              yield [__path.join('/'), cid]
            } else if (typeof o === 'object') {
              yield* links(o, __path)
            }
          }
        } else {
          const cid = CID.asCID(val)
          if (cid) {
            yield [_path.join('/'), cid]
          } else {
            yield* links(val, _path)
          }
        }
      }
    }
  }

  const tree = function* (decoded, path = []) {
    if (typeof decoded !== 'object' || !decoded) return
    for (const key of Object.keys(decoded)) {
      const _path = path.slice()
      _path.push(key)
      yield _path.join('/')
      const val = decoded[key]
      if (val && typeof val === 'object' && !CID.asCID(val)) {
        if (Array.isArray(val)) {
          for (let i = 0; i < val.length; i++) {
            const __path = _path.slice()
            __path.push(i)
            const o = val[i]
            yield __path.join('/')
            if (typeof o === 'object' && !CID.asCID(o)) {
              yield* tree(o, __path)
            }
          }
        } else {
          yield* tree(val, _path)
        }
      }
    }
  }
  /* eslint-enable max-depth */

  class Reader {
    constructor(decoded) {
      Object.defineProperty(this, 'decoded', {
        get: () => decoded,
      })
    }

    get(path) {
      let node = this.decoded
      path = path.split('/').filter((x) => x)
      while (path.length) {
        const key = path.shift()
        if (node[key] === undefined) {
          throw new Error(`Object has no property ${key}`)
        }
        node = node[key]
        const cid = CID.asCID(node)
        if (cid) return { remaining: path.join('/'), value: cid }
      }
      return { value: node }
    }

    links() {
      return links(this.decoded)
    }

    tree() {
      return tree(this.decoded)
    }
  }
  return (decoded) => new Reader(decoded)
}

export default createReader
