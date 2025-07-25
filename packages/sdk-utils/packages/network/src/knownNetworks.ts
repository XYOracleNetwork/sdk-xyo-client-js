import type { Hash } from '@xylabs/hex'

import type { NetworkNodePayload } from './NetworkNodePayload.ts'
import { NetworkNodePayloadWrapper } from './NetworkNodePayloadWrapper.ts'
import type { NetworkPayload } from './NetworkPayload.ts'
import { NetworkSchema } from './NetworkPayload.ts'

const kerplunk = async (): Promise<NetworkPayload> => {
  return {
    name: 'Kerplunk',
    nodes: [
      (await NetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network' as Hash))?.payload,
      (await NetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network' as Hash))?.payload,
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'kerplunk',
  }
}

const main = async (): Promise<NetworkPayload> => {
  return {
    name: 'Main',
    nodes: [
      (await NetworkNodePayloadWrapper.known('main-archivist-xyo-network' as Hash))?.payload,
      (await NetworkNodePayloadWrapper.known('location-diviner-xyo-network' as Hash))?.payload,
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'main',
  }
}

const local = async (): Promise<NetworkPayload> => {
  return {
    name: 'Local',
    nodes: [
      (await NetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network' as Hash))?.payload,
      (await NetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network' as Hash))?.payload,
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'local',
  }
}

const custom = async (): Promise<NetworkPayload> => {
  return {
    name: 'Custom',
    nodes: [
      (await NetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network' as Hash))?.payload,
      (await NetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network' as Hash))?.payload,
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'custom',
  }
}

export const knownNetworks = async (): Promise<NetworkPayload[]> => [await kerplunk(), await main(), await local(), await custom()]
