import { assertEx } from '@xylabs/assert'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { ElevationPayload, ElevationSchema } from '@xyo-network/elevation-payload-plugin'
import { GeographicCoordinateSystemLocation, Location, LocationPayload, QuadkeyLocation } from '@xyo-network/location-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { Quadkey } from '@xyo-network/quadkey'
import { MercatorBoundingBox } from '@xyo-network/sdk-geo'
import { WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness-model'
// eslint-disable-next-line import/no-named-as-default
import GeoTIFF, { fromFile, GeoTIFFImage } from 'geotiff'

export type ElevationWitnessConfigSchema = 'network.xyo.elevation.config'
export const ElevationWitnessConfigSchema: ElevationWitnessConfigSchema = 'network.xyo.elevation.config'

export interface TiffImages {
  northEast?: Promise<GeoTIFFImage>
  southEast?: Promise<GeoTIFFImage>
  west?: Promise<GeoTIFFImage>
}

export interface Tiffs {
  northEast?: Promise<GeoTIFF>
  southEast?: Promise<GeoTIFF>
  west?: Promise<GeoTIFF>
}

export interface TiffImageInfo {
  bbox: number[]
  height: number
  origin: number[]
  resolution: number[]
  samplesPerPixel: number
  tileHeight: number
  tileWidth: number
  width: number
}

export interface TiffImageInfos {
  northEast?: Promise<TiffImageInfo>
  southEast?: Promise<TiffImageInfo>
  west?: Promise<TiffImageInfo>
}

export type ElevationWitnessConfig = WitnessConfig<{
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

export const locationToQuadkey = (location: Location, zoom = 16) => {
  return assertEx(
    (location as QuadkeyLocation).quadkey
      ? Quadkey.fromString(zoom, (location as QuadkeyLocation).quadkey)
      : Quadkey.fromLngLat(
          { lat: (location as GeographicCoordinateSystemLocation).latitude, lng: (location as GeographicCoordinateSystemLocation).longitude },
          zoom,
        ),
  )
}

export type ElevationWitnessParams = WitnessParams<AnyConfigSchema<ElevationWitnessConfig>>

export class ElevationWitness<TParams extends ElevationWitnessParams = ElevationWitnessParams>
  extends AbstractWitness<TParams>
  implements WitnessModule
{
  static override configSchemas = [ElevationWitnessConfigSchema]

  private _tiffImages: TiffImages = {}
  private _tiffInfos: TiffImageInfos = {}
  private _tiffs: Tiffs = {}

  get quadkeys() {
    return this.config.locations?.map((location) => locationToQuadkey(location)) ?? []
  }

  get uri() {
    return this.config?.uri ?? 'https://api.open-elevation.com/api/v1/lookup'
  }

  get zoom() {
    return this.config?.zoom ?? 16
  }

  async getSection(section: keyof Tiffs): Promise<GeoTIFF> {
    if (!this._tiffs[section]) {
      this._tiffs[section] = (async () => {
        return await fromFile(assertEx(this.config.files?.[section], `Missing file in config [${section}]`))
      })()
    }

    return await assertEx(this._tiffs[section], `Failed to load section [${section}]`)
  }

  async getSectionImage(section: keyof TiffImages): Promise<GeoTIFFImage> {
    if (!this._tiffImages[section]) {
      this._tiffImages[section] = (async () => {
        return await (await this.getSection(section)).getImage()
      })()
    }

    return await assertEx(this._tiffImages[section], `Failed to load section [${section}]`)
  }

  async getSectionInfo(section: keyof TiffImageInfos): Promise<TiffImageInfo> {
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

  protected override async observeHandler(payloads?: Payload[]): Promise<Payload[]> {
    const quadkeys: Quadkey[] = [
      ...(payloads?.map((location) => locationToQuadkey(location as LocationPayload)) ?? []),
      ...this.quadkeys.map((quadkey) => (typeof quadkey === 'string' ? Quadkey.fromString(12, quadkey) : quadkey)),
    ]
    const results: ElevationPayload[] = await Promise.all(
      quadkeys.map(async (quadkey) => {
        const infoNE = await this.getSectionInfo('northEast')
        const infoSE = await this.getSectionInfo('southEast')
        const infoW = await this.getSectionInfo('west')

        const westBoundingBox = new MercatorBoundingBox([infoW.bbox[0], infoW.bbox[1], infoW.bbox[2], infoW.bbox[3]])
        const northEastBoundingBox = new MercatorBoundingBox([infoNE.bbox[0], infoNE.bbox[1], infoNE.bbox[2], infoNE.bbox[3]])
        const southEastBoundingBox = new MercatorBoundingBox([infoSE.bbox[0], infoSE.bbox[1], infoSE.bbox[2], infoSE.bbox[3]])
        const isWest = westBoundingBox.contains(quadkey.center)
        const isNorthEast = northEastBoundingBox.contains(quadkey.center)
        const isSouthEast = southEastBoundingBox.contains(quadkey.center)
        const sectionToUse = isWest ? 'west' : isNorthEast ? 'northEast' : isSouthEast ? 'southEast' : null
        const section = await this.getSectionImage(assertEx(sectionToUse, 'Unsupported Area'))
        const sectionInfo = await this.getSectionInfo(assertEx(sectionToUse, 'Unsupported Area'))

        const bb = quadkey.boundingBox
        const window = [
          Math.ceil(-(sectionInfo.origin[0] - bb.getWest()) / infoW.resolution[0]),
          Math.ceil(-(sectionInfo.origin[1] - bb.getNorth()) / sectionInfo.resolution[1]),
          Math.ceil(-(sectionInfo.origin[0] - bb.getEast()) / sectionInfo.resolution[0]),
          Math.ceil(-(sectionInfo.origin[1] - bb.getSouth()) / sectionInfo.resolution[1]),
        ]

        const data = await section.readRasters({
          height: 1,
          width: 1,
          window,
        })

        const elevation = JSON.parse(JSON.stringify(data.at(0)))?.['0']

        return { elevation, schema: ElevationSchema }
      }),
    )
    return results.flat()
  }
}
