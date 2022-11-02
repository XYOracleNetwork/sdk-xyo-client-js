import { BigNumber } from '@xylabs/bignumber'
import { Buffer } from '@xylabs/buffer'
import { assertEx } from '@xylabs/sdk-js'
import {
  boundingBoxToCenter,
  GeoJson,
  MercatorBoundingBox,
  MercatorTile,
  tileFromPoint,
  tileFromQuadkey,
  tilesFromBoundingBox,
  tileToBoundingBox,
  tileToQuadkey,
} from '@xyo-network/sdk-geo'
import { LngLat, LngLatLike } from 'mapbox-gl'

import { bitShiftLeft, bitShiftRight, padHex } from './utils'

export * from './utils'

const MAX_ZOOM = 124

export const isQuadkey = (obj: { type: string }) => obj?.type === Quadkey.type

const RelativeDirectionConstantLookup: Record<string, number> = {
  e: 1,
  n: -2,
  s: 2,
  w: -1,
}

export class Quadkey {
  static Zero = Quadkey.from(0, Buffer.alloc(31, 0))
  static root = new Quadkey()
  static type = 'Quadkey'

  public type = Quadkey.type

  private _geoJson?: GeoJson
  private key = Buffer.alloc(32)

  constructor(key = Buffer.alloc(32)) {
    key.copy(this.key, this.key.length - key.length)
    this.guessZoom()
  }

  get base10String() {
    return this.bigNumber.toString(10)
  }

  get base4Hash() {
    const bn = new BigNumber(this.id.toString('hex'), 16)
    const zoom = this.zoom
    if (zoom === 0) {
      return ''
    }
    let quadkeySimple = bn.toString(4)
    while (quadkeySimple.length < zoom) {
      quadkeySimple = `0${quadkeySimple}`
    }
    return quadkeySimple
  }

  get base4HashLabel() {
    const hash = this.base4Hash
    return hash.length === 0 ? 'fhr' : hash
  }

  get bigNumber() {
    return new BigNumber(`${this.key.toString('hex')}`, 'hex')
  }

  get boundingBox(): MercatorBoundingBox {
    return tileToBoundingBox(this.tile)
  }

  get buffer() {
    return this.key
  }

  get center() {
    const result = boundingBoxToCenter(this.boundingBox)
    return new LngLat(result[0], result[1])
  }

  get children() {
    assertEx(this.zoom < MAX_ZOOM - 1, 'Can not get children of bottom tiles')
    const result: Quadkey[] = []
    const shiftedId = bitShiftLeft(bitShiftLeft(this.id))
    for (let i = 0; i < 4; i++) {
      const currentLastByte = shiftedId.readUInt8(shiftedId.length - 1)
      shiftedId.writeUInt8((currentLastByte & 0xfc) | i, shiftedId.length - 1)
      result.push(new Quadkey().setId(shiftedId).setZoom(this.zoom + 1))
    }
    return result
  }

  get gridLocation() {
    const tileData = tileFromQuadkey(this.base4Hash)

    return {
      col: 2 ** tileData[2] - tileData[1] - 1,
      row: tileData[0],
      zoom: tileData[2],
    }
  }

  get hex() {
    return `0x${this.key.toString('hex')}`
  }

  get id() {
    return this.buffer.slice(1)
  }

  get parent(): Quadkey | undefined {
    if (this.zoom > 0) {
      return new Quadkey().setId(bitShiftRight(bitShiftRight(this.id))).setZoom(this.zoom - 1)
    }
  }

  get siblings() {
    const siblings = assertEx(this.parent?.children, `siblings: parentChildren ${this.base4Hash}`)
    const filteredSiblings = siblings.filter((quadkey) => this.compareTo(quadkey) !== 0)
    assertEx(filteredSiblings.length === 3, `siblings: expected 3 [${filteredSiblings.length}]`)
    return filteredSiblings
  }

  get tile(): MercatorTile {
    return tileFromQuadkey(this.base4Hash)
  }

  get valid() {
    const zoom = this.zoom
    const shift = (MAX_ZOOM - zoom) * 2
    const id = this.id
    let testId = id
    for (let i = 0; i < shift; i++) {
      testId = bitShiftLeft(testId)
    }
    for (let i = 0; i < shift; i++) {
      testId = bitShiftRight(testId)
    }
    return testId.compare(id) === 0
  }

  get zoom() {
    return this.buffer.readUInt8(0)
  }

  static from(zoom: number, id: Buffer) {
    return new Quadkey().setId(id).setZoom(zoom)
  }

  static fromBase10String(value: string) {
    return new Quadkey(Buffer.from(padHex(new BigNumber(value, 10).toString(16)), 'hex'))
  }

  static fromBase16String(value: string) {
    const valueToUse = value.startsWith('0x') ? value.slice(2) : value
    return new Quadkey(Buffer.from(padHex(valueToUse), 'hex'))
  }

  static fromBase4String(value?: string) {
    if (value === 'fhr' || value === '') {
      return Quadkey.root
    }
    if (value && value.length && value.length > 0) {
      const quadkey = new Quadkey(Buffer.from(padHex(new BigNumber(value, 4).toString(16)), 'hex')).setZoom(value.length)
      return quadkey.valid ? quadkey : undefined
    }
  }

  static fromBoundingBox(boundingBox: MercatorBoundingBox, zoom: number) {
    const tiles = tilesFromBoundingBox(boundingBox, Math.floor(zoom))
    const result: Quadkey[] = []
    for (const tile of tiles) {
      result.push(assertEx(Quadkey.fromTile(tile), 'Bad Quadkey'))
    }

    return result
  }

  static fromBuffer(value: Buffer) {
    return Quadkey.fromBase16String(value.toString('hex'))
  }

  static fromLngLat(point: LngLatLike, zoom: number) {
    const tile = tileFromPoint(LngLat.convert(point), zoom)
    const quadkeyString = tileToQuadkey(tile)
    return Quadkey.fromBase4String(quadkeyString)
  }

  static fromString(zoom: number, id: string, base = 10) {
    switch (base) {
      case 10:
        return Quadkey.fromBase10String(id)?.setZoom(zoom)
      case 16:
        return Quadkey.fromBase16String(id).setZoom(zoom)
      default:
        throw Error(`Invalid base [${base}]`)
    }
  }

  static fromTile(tile: MercatorTile) {
    return Quadkey.fromBase4String(tileToQuadkey(tile))
  }

  childrenByZoom(zoom: number) {
    // if we are limiting by zoom, and we are already at that limit, just return this quadkey
    if (zoom && zoom === this.zoom) {
      return [this]
    }

    // recursively get children
    let deepResult: Quadkey[] = []
    for (const quadkey of this.children) {
      deepResult = deepResult.concat(quadkey.childrenByZoom(zoom))
    }
    return deepResult
  }

  clone() {
    return Quadkey.fromBase10String(this.base10String)
  }

  compareTo(quadkey: Quadkey) {
    return this.bigNumber.cmp(quadkey.bigNumber)
  }

  equals(obj: Quadkey): boolean {
    return obj.base4HashLabel == this.base4HashLabel
  }

  geoJson() {
    this._geoJson = this._geoJson ?? new GeoJson(this.base4Hash)
    return this._geoJson
  }

  getGridBoundingBox(size: number) {
    const hash = this.base4Hash
    let index = 0
    let left = 0
    let top = 0
    let blockSize = size
    while (index < hash.length) {
      blockSize >>= 1
      switch (hash[index]) {
        case '1':
          left += blockSize
          break
        case '2':
          top += blockSize
          break
        case '3':
          left += blockSize
          top += blockSize
          break
      }
      index++
    }
    if (blockSize < 2) {
      blockSize = 2
    }
    return {
      height: blockSize,
      left,
      top,
      width: blockSize,
    }
  }

  /** @deprecated use .gridLocation instead */
  getGridLocation() {
    return this.gridLocation
  }

  isInBoundingBox(boundingBox: MercatorBoundingBox) {
    const tileBoundingBox = tileToBoundingBox(this.tile)
    return (
      boundingBox.contains(tileBoundingBox.getNorthEast()) ||
      boundingBox.contains(tileBoundingBox.getNorthWest()) ||
      boundingBox.contains(tileBoundingBox.getSouthEast()) ||
      boundingBox.contains(tileBoundingBox.getSouthWest())
    )
  }

  relative(direction: string) {
    const directionConstant = assertEx(RelativeDirectionConstantLookup[direction], 'Invalid direction')
    let quadkey = this.base4Hash
    if (quadkey.length === 0) {
      return this
    }
    let index = quadkey.length - 1
    while (index >= 0) {
      let number = parseInt(quadkey.charAt(index))
      number += directionConstant
      if (number > 3) {
        number -= 4
        quadkey = quadkey.substring(0, index) + number.toString() + quadkey.substring(index + 1)
        index--
      } else if (number < 0) {
        number += 4
        quadkey = quadkey.substring(0, index) + number.toString() + quadkey.substring(index + 1)
        index--
      } else {
        index = -1
      }
    }
    return Quadkey.fromBase4String(quadkey)
  }

  setId(id: Buffer) {
    this.setKey(this.zoom, id)
    return this
  }

  setKey(zoom: number, id: Buffer) {
    id.copy(this.key, this.key.length - id.length)
    this.key.writeUInt8(zoom, 0)
    return this
  }

  setZoom(zoom: number) {
    assertEx(zoom < MAX_ZOOM, `Invalid zoom [${zoom}] max=${MAX_ZOOM}`)
    this.setKey(zoom, this.id)
    return this
  }

  /** @deprecated use .base10String*/
  toBase10String() {
    return this.base10String
  }

  /** @deprecated use .base4Hash */
  toBase4Hash() {
    return this.base4Hash
  }

  /** @deprecated use .base4HashLabel */
  toBase4HashLabel() {
    const hash = this.base4HashLabel
    return hash.length === 0 ? 'fhr' : hash
  }

  /** @deprecated use .bigNumber */
  toBigNumber() {
    return this.bigNumber
  }

  /** @deprecated use .boundingBox */
  toBoundingBox(): MercatorBoundingBox {
    return this.boundingBox
  }

  /** @deprecated use .buffer */
  toBuffer() {
    return this.buffer
  }

  /** @deprecated use .center */
  toCenter() {
    return this.center
  }

  /** @deprecated use .hex instead */
  toHex() {
    return this.hex
  }

  toJSON(): string {
    return this.base4HashLabel
  }

  toShortString() {
    const buffer = this.buffer
    const part1 = buffer.slice(0, 2)
    const part2 = buffer.slice(buffer.length - 2, buffer.length)
    return `${part1.toString('hex')}...${part2.toString('hex')}`
  }

  toString() {
    return `0x${padHex(this.bigNumber.toString(16))}`
  }

  /** @deprecated use .tile instead */
  public toTile(): MercatorTile {
    return this.tile
  }

  protected guessZoom() {
    const bn = new BigNumber(this.id.toString('hex'), 16)
    const quadkeySimple = bn.toString(4)
    this.setZoom(quadkeySimple.length)
  }
}
