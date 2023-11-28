import { assertEx } from '@xylabs/assert'
import { asHex } from '@xylabs/hex'
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

import { RelativeDirectionConstantLookup } from './RelativeDirectionConstantLookup'

const MAX_ZOOM = 124

export const isQuadkey = (obj: { type: string }) => obj?.type === Quadkey.type

const FULL_MASK = 2n ** 256n - 1n
const ZOOM_MASK = 0xffn << 248n
const ID_MASK = ZOOM_MASK ^ FULL_MASK

const assertMaxBitUint = (value: bigint, bits = 256n) => {
  assertEx(value < 2n ** bits && value >= 0, 'Not a 256 Bit Uint!')
}

export class Quadkey {
  static Zero = Quadkey.from(0, 0n)
  static root = new Quadkey()
  static type = 'Quadkey'

  type = Quadkey.type

  private _geoJson?: GeoJson

  constructor(private key = 0n) {
    assertMaxBitUint(key)
    this.guessZoom()
  }

  get base16String() {
    return this.id.toString(16).padStart(62, '0')
  }

  get base4Hash() {
    return this.id.toString(4).padStart(this.zoom, '0')
  }

  get base4HashLabel() {
    const hash = this.base4Hash
    return hash.length === 0 ? 'fhr' : hash
  }

  get boundingBox(): MercatorBoundingBox {
    return tileToBoundingBox(this.tile)
  }

  get center() {
    const result = boundingBoxToCenter(this.boundingBox)
    return new LngLat(result[0], result[1])
  }

  get children() {
    assertEx(this.zoom < MAX_ZOOM - 1, 'Can not get children of bottom tiles')
    const result: Quadkey[] = []
    const shiftedId = this.id << 2n
    for (let i = 0n; i < 4n; i++) {
      result.push(new Quadkey().setId(shiftedId | i).setZoom(this.zoom + 1))
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

  get id() {
    return this.key & ID_MASK
  }

  get parent(): Quadkey | undefined {
    if (this.zoom > 0) {
      return new Quadkey().setId(this.id >> 2n).setZoom(this.zoom - 1)
    }
  }

  get siblings() {
    const siblings = assertEx(this.parent?.children, `siblings: parentChildren ${this.base4Hash}`)
    const filteredSiblings = siblings.filter((quadkey) => quadkey.key !== this.key)
    assertEx(filteredSiblings.length === 3, `siblings: expected 3 [${filteredSiblings.length}]`)
    return filteredSiblings
  }

  get tile(): MercatorTile {
    return tileFromQuadkey(this.base4Hash)
  }

  get valid() {
    //check for additional data outside zoom scope
    return this.id.toString(4) === this.base4Hash.padStart(64, '0')
  }

  get zoom() {
    //zoom is stored in top byte
    return Number((this.key & ZOOM_MASK) >> 248n)
  }

  static from(zoom: number, id: bigint) {
    return new Quadkey().setId(id).setZoom(zoom)
  }

  static fromArrayBuffer(zoom: number, id: ArrayBuffer) {
    return new Quadkey().setId(BigInt(`0x${asHex(id, true)}`)).setZoom(zoom)
  }

  static fromBase16String(value: string) {
    return new Quadkey(BigInt(`0x${asHex(value, true)}`))
  }

  static fromBase4String(value?: string) {
    if (value === 'fhr' || value === '' || value === undefined) {
      return Quadkey.root
    }
    let id = 0n
    for (let i = 0; i < value.length; i++) {
      const nibble = parseInt(value[i])
      assertEx(nibble < 4 && nibble >= 0, `Invalid Base4 String: ${value}`)
      id = (id << 2n) | BigInt(nibble)
    }
    return new Quadkey().setId(id).setZoom(value.length)
  }

  static fromBoundingBox(boundingBox: MercatorBoundingBox, zoom: number) {
    const tiles = tilesFromBoundingBox(boundingBox, Math.floor(zoom))
    const result: Quadkey[] = []
    for (const tile of tiles) {
      result.push(assertEx(Quadkey.fromTile(tile), 'Bad Quadkey'))
    }

    return result
  }

  static fromLngLat(point: LngLatLike, zoom: number) {
    const tile = tileFromPoint(LngLat.convert(point), zoom)
    const quadkeyString = tileToQuadkey(tile)
    return Quadkey.fromBase4String(quadkeyString)
  }

  static fromString(zoom: number, id: string, base = 16) {
    switch (base) {
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
    return new Quadkey(this.key)
  }

  equals(obj: Quadkey): boolean {
    return obj.key == this.key
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

  setId(id: bigint) {
    assertMaxBitUint(id, 248n)
    this.setKey(this.zoom, id)
    return this
  }

  setKey(zoom: number, key: bigint) {
    assertMaxBitUint(key)
    this.key = key
    this.setZoom(zoom)
    return this
  }

  setZoom(zoom: number) {
    assertEx(zoom < MAX_ZOOM, `Invalid zoom [${zoom}] max=${MAX_ZOOM}`)
    this.key = (this.key & ID_MASK) | (BigInt(zoom) << 248n)
    return this
  }

  toJSON(): string {
    return this.base4HashLabel
  }

  toString() {
    return this.base4Hash
  }

  protected guessZoom() {
    const quadkeySimple = this.id.toString(4)
    this.setZoom(quadkeySimple.length)
  }
}
