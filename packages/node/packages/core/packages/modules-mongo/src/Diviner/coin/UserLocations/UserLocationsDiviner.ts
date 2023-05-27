import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { ArchivistModule } from '@xyo-network/archivist'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { DivinerWrapper, XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { CoinUserLocationsDiviner } from '@xyo-network/diviner-coin-user-locations-abstract'
import { DivinerParams } from '@xyo-network/diviner-model'
import { LocationPayload, LocationSchema } from '@xyo-network/location-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import compact from 'lodash/compact'

export type CoinCurrentUserWitnessSchema = 'co.coinapp.current.user.witness'
export const CoinCurrentUserWitnessSchema: CoinCurrentUserWitnessSchema = 'co.coinapp.current.user.witness'

export type CoinCurrentUserWitnessPayload = Payload<{
  balance?: number
  daysOld?: number
  deviceId?: string
  geomines?: number
  planType?: string
  schema: CoinCurrentUserWitnessSchema
  uid: string
}>

export type CoinCurrentLocationWitnessSchema = 'co.coinapp.current.location.witness'
export const CoinCurrentLocationWitnessSchema: CoinCurrentLocationWitnessSchema = 'co.coinapp.current.location.witness'

export type CoinCurrentLocationWitnessPayload = Payload<{
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  quadkey: string
  schema: CoinCurrentLocationWitnessSchema
  speedKph: number
}>

export const isLocationPayload = (x?: Payload | null): x is LocationPayload => x?.schema === LocationSchema

export type CoinUserLocationsDivinerParams<T extends Payload = Payload> = DivinerParams<
  AnyConfigSchema<XyoArchivistPayloadDivinerConfig<T>>,
  {
    bws: BoundWitnessDiviner
    payloads: ArchivistModule
  }
>

export class MemoryCoinUserLocationsDiviner<
  TParams extends CoinUserLocationsDivinerParams = CoinUserLocationsDivinerParams,
> extends CoinUserLocationsDiviner<TParams> {
  static override configSchema = XyoArchivistPayloadDivinerConfigSchema

  async divine(payloads?: Payload[]): Promise<Payload<LocationPayload>[]> {
    const user = payloads?.find<CoinCurrentUserWitnessPayload>(
      (payload): payload is CoinCurrentUserWitnessPayload => payload?.schema === CoinCurrentUserWitnessSchema,
    )
    // If this is a query we support
    if (user) {
      const wrapper = new PayloadWrapper(user)
      // TODO: Extract relevant query values here
      this.logger?.log('CoinUserLocationsDiviner.Divine: Processing query')
      // Simulating work
      const diviner = DivinerWrapper.wrap(this.params.bws, this.account)
      const filter = { payload_hashes: [await wrapper.hashAsync()], schema: BoundWitnessDivinerQuerySchema }
      const bwList = ((await diviner.divine([filter])) as BoundWitness[]) || []
      const locationHashes = bwList
        .map((bw) => {
          const locations: string[] = []
          for (let i = 0; i < bwList.length; i++) {
            if (bw?.payload_schemas[i] === CoinCurrentLocationWitnessSchema) {
              locations.push(assertEx(bw?.payload_hashes[i], 'Missing hash'))
            }
          }
          return locations
        })
        .flat()
      const locations = compact(await this.params.payloads.get(locationHashes)) as unknown as LocationPayload[]
      this.logger?.log('CoinUserLocationsDiviner.Divine: Processed query')
      return locations
    }
    // else return empty response
    return []
  }
}
