import { NetworkNodePayload } from './NetworkNodePayload'
import { NetworkNodePayloadWrapper } from './NetworkNodePayloadWrapper'
import { NetworkPayload, NetworkSchema } from './NetworkPayload'

const kerplunk = async (): Promise<NetworkPayload> => {
  return {
    name: 'Kerplunk',
    nodes: [
      (await NetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network'))?.jsonPayload(),
      (await NetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network'))?.jsonPayload(),
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'kerplunk',
  }
}

const main = async (): Promise<NetworkPayload> => {
  return {
    name: 'Main',
    nodes: [
      (await NetworkNodePayloadWrapper.known('main-archivist-xyo-network'))?.payload(),
      (await NetworkNodePayloadWrapper.known('location-diviner-xyo-network'))?.payload(),
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'main',
  }
}

const local = async (): Promise<NetworkPayload> => {
  return {
    name: 'Local',
    nodes: [
      (await NetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network'))?.payload(),
      (await NetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network'))?.payload(),
    ].filter(Boolean) as NetworkNodePayload[],
    schema: NetworkSchema,
    slug: 'local',
  }
}

export const knownNetworks = async (): Promise<NetworkPayload[]> => [await kerplunk(), await main(), await local()]
