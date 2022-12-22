import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { AbstractDiviner, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { LocationPayload, LocationSchema } from '@xyo-network/location-payload-plugin'
import { BoundWitnessesArchivist, PayloadArchivist, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayload, XyoPayloads } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Job, JobProvider } from '@xyo-network/shared'
import compact from 'lodash/compact'

import { COLLECTIONS } from '../../../collections'
import { getBaseMongoSdk } from '../../../Mongo'

export type CoinCurrentUserWitnessSchema = 'co.coinapp.current.user.witness'
export const CoinCurrentUserWitnessSchema: CoinCurrentUserWitnessSchema = 'co.coinapp.current.user.witness'

export type CoinCurrentUserWitnessPayload = XyoPayload<{
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

export type CoinCurrentLocationWitnessPayload = XyoPayload<{
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  quadkey: string
  schema: CoinCurrentLocationWitnessSchema
  speedKph: number
}>

export const isLocationPayload = (x?: XyoPayload | null): x is LocationPayload => x?.schema === LocationSchema

export class CoinUserLocationsDiviner extends AbstractDiviner implements CoinUserLocationsDiviner, JobProvider {
  constructor(
    protected readonly account: Account = new Account(),
    protected readonly payloads: PayloadArchivist,
    protected readonly bws: BoundWitnessesArchivist,
    protected readonly sdk: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads),
  ) {
    super({ account, config: { schema: XyoArchivistPayloadDivinerConfigSchema } })
  }

  get jobs(): Job[] {
    return [
      {
        name: 'CoinUserLocationsDiviner.DivineUserLocationsBatch',
        schedule: '10 minute',
        task: async () => await this.divineUserLocationsBatch(),
      },
    ]
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayloads<LocationPayload>> {
    const user = payloads?.find<CoinCurrentUserWitnessPayload>(
      (payload): payload is CoinCurrentUserWitnessPayload => payload?.schema === CoinCurrentUserWitnessSchema,
    )
    // If this is a query we support
    if (user) {
      const wrapper = new PayloadWrapper(user)
      // TODO: Extract relevant query values here
      this.logger?.log('CoinUserLocationsDiviner.Divine: Processing query')
      // Simulating work
      const bwList = (await this.bws.find({ payload_hashes: [wrapper.hash] })) ?? []
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
      const locations = compact(await this.payloads.get(locationHashes)) as unknown as LocationPayload[]
      this.logger?.log('CoinUserLocationsDiviner.Divine: Processed query')
      return locations
    }
    // else return empty response
    return []
  }

  private divineUserLocationsBatch = async () => {
    this.logger?.log('CoinUserLocationsDiviner.DivineUserLocationsBatch: Divining user locations for batch')
    // TODO: Any background/batch processing here
    await Promise.resolve()
    this.logger?.log('CoinUserLocationsDiviner.DivineUserLocationsBatch: Divined user locations for batch')
  }
}
