import { assertEx } from '@xylabs/assert'
import { ElevationPayload, ElevationSchema } from '@xyo-network/elevation-payload-plugin'
import { GeographicCoordinateSystemLocation, Location, LocationPayload, QuadkeyLocation } from '@xyo-network/location-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Quadkey } from '@xyo-network/quadkey'
import { MercatorBoundingBox } from '@xyo-network/sdk-geo'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
// eslint-disable-next-line import/no-named-as-default
import GeoTIFF, { fromFile, GeoTIFFImage } from 'geotiff'
import merge from 'lodash/merge'

export type ElevationWitnessConfigSchema = 'network.xyo.elevation.config'
export const ElevationWitnessConfigSchema: ElevationWitnessConfigSchema = 'network.xyo.elevation.config'

interface TiffImages {
  northEast?: Promise<GeoTIFFImage>
  southEast?: Promise<GeoTIFFImage>
  west?: Promise<GeoTIFFImage>
}

interface Tiffs {
  northEast?: Promise<GeoTIFF>
  southEast?: Promise<GeoTIFF>
  west?: Promise<GeoTIFF>
}

interface TiffImageInfo {
  bbox: number[]
  height: number
  origin: number[]
  resolution: number[]
  samplesPerPixel: number
  tileHeight: number
  tileWidth: number
  width: number
}

interface TiffImageInfos {
  northEast?: Promise<TiffImageInfo>
  southEast?: Promise<TiffImageInfo>
  west?: Promise<TiffImageInfo>
}

export type ElevationWitnessConfig = XyoWitnessConfig<{
  files?: {
    northEast: string
    southEast: string
    west: string
  }
  locations?: LocationPayload[]
  schema: ElevationWitnessConfigSchema
  uri?: string

  zoom?: number
}>

const locationToQuadkey = (location: Location, zoom = 24) => {
  return assertEx(
    (location as QuadkeyLocation).quadkey
      ? Quadkey.fromString(24, (location as QuadkeyLocation).quadkey)
      : Quadkey.fromLngLat(
          { lat: (location as GeographicCoordinateSystemLocation).latitude, lng: (location as GeographicCoordinateSystemLocation).longitude },
          zoom,
        ),
  )
}

export class ElevationWitness extends AbstractWitness<ElevationWitnessConfig> {
  static override configSchema = ElevationWitnessConfigSchema

  private _tiffImages: TiffImages = {}
  private _tiffInfos: TiffImageInfos = {}
  private _tiffs: Tiffs = {}

  public get quadkeys() {
    return this.config.locations?.map((location) => locationToQuadkey(location)) ?? []
  }

  public get uri() {
    return this.config?.uri ?? 'https://api.open-elevation.com/api/v1/lookup'
  }

  public get zoom() {
    return this.config?.zoom ?? 24
  }

  static override async create(params?: ModuleParams<ElevationWitnessConfig>): Promise<ElevationWitness> {
    return (await super.create(params)) as ElevationWitness
  }

  public async getSection(section: keyof Tiffs): Promise<GeoTIFF> {
    if (!this._tiffs[section]) {
      this._tiffs[section] = (async () => {
        return await fromFile(assertEx(this.config.files?.[section], `Missing file in config [${section}]`))
      })()
    }

    return await assertEx(this._tiffs[section], `Failed to load section [${section}]`)
  }

  public async getSectionImage(section: keyof TiffImages): Promise<GeoTIFFImage> {
    if (!this._tiffImages[section]) {
      this._tiffImages[section] = (async () => {
        return await (await this.getSection(section)).getImage()
      })()
    }

    return await assertEx(this._tiffImages[section], `Failed to load section [${section}]`)
  }

  public async getSectionInfo(section: keyof TiffImageInfos): Promise<TiffImageInfo> {
    if (!this._tiffInfos[section]) {
      this._tiffInfos[section] = (async () => {
        const image = await this.getSectionImage(section)
        return {
          bbox: image.getBoundingBox(),
          height: image.getHeight(),
          origin: image.getOrigin(),
          resolution: image.getResolution(),
          samplesPerPixel: image.getSamplesPerPixel(),
          tileHeight: image.getTileHeight(),
          tileWidth: image.getTileWidth(),
          width: image.getWidth(),
        }
      })()
    }

    return await assertEx(this._tiffInfos[section], `Failed to load section [${section}]`)
  }

  override async observe(payloads?: LocationPayload[]): Promise<XyoPayload[]> {
    const quadkeys: Quadkey[] = [
      ...(payloads?.map((location) => locationToQuadkey(location)) ?? []),
      ...this.quadkeys.map((quadkey) => (typeof quadkey === 'string' ? Quadkey.fromString(24, quadkey) : quadkey)),
    ]
    const results: ElevationPayload[] = await Promise.all(
      quadkeys.map(async (quadkey) => {
        if (quadkey) {
          const infoNE = await this.getSectionInfo('northEast')
          const infoSE = await this.getSectionInfo('southEast')
          const infoW = await this.getSectionInfo('west')
          const sectionWest = await this.getSection('west')
          console.log(`InfoNE: ${JSON.stringify(infoNE, null, 2)}`)
          console.log(`InfoSE: ${JSON.stringify(infoSE, null, 2)}`)
          console.log(`InfoW: ${JSON.stringify(infoW, null, 2)}`)
          const westBoundingBox = new MercatorBoundingBox([infoW.bbox[0], infoW.bbox[1], infoW.bbox[2], infoW.bbox[3]])
          const northEastBoundingBox = new MercatorBoundingBox([infoNE.bbox[0], infoNE.bbox[1], infoNE.bbox[2], infoNE.bbox[3]])
          const southEastBoundingBox = new MercatorBoundingBox([infoSE.bbox[0], infoSE.bbox[1], infoSE.bbox[2], infoSE.bbox[3]])
          const isWest = westBoundingBox.contains(quadkey.center)
          const isNorthEast = northEastBoundingBox.contains(quadkey.center)
          const isSouthEast = southEastBoundingBox.contains(quadkey.center)
          if (isWest) {
            const bb = quadkey.boundingBox
            console.log(`BB: ${JSON.stringify(bb)}`)
            const data = await sectionWest.readRasters({
              bbox: [bb.getWest(), bb.getNorth(), bb.getEast(), bb.getSouth()],
              resX: 0.1,
              resY: 0.1,
            } as any)
            console.log(`Data: ${JSON.stringify(data, null, 2)}`)
          }
        }
        return { elevation: 0, schema: ElevationSchema }
      }),
    )
    return await super.observe(results?.map((result, index) => merge({}, result, payloads?.[index], { schema: ElevationSchema })))
  }
}
