import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'
import { XyoNetworkNodePayloadWrapper } from './XyoNetworkNodePayloadWrapper'
import { XyoNetworkPayload, XyoNetworkSchema } from './XyoNetworkPayload'

const kerplunk = async (): Promise<XyoNetworkPayload> => {
  return {
    name: 'Kerplunk',
    nodes: [
      (await XyoNetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network'))?.payload,
      (await XyoNetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network'))?.payload,
    ].filter((item) => item) as XyoNetworkNodePayload[],
    schema: XyoNetworkSchema,
    slug: 'kerplunk',
  }
}

const main = async (): Promise<XyoNetworkPayload> => {
  return {
    name: 'Main',
    nodes: [
      (await XyoNetworkNodePayloadWrapper.known('main-archivist-xyo-network'))?.payload,
      (await XyoNetworkNodePayloadWrapper.known('location-diviner-xyo-network'))?.payload,
    ].filter((item) => item) as XyoNetworkNodePayload[],
    schema: XyoNetworkSchema,
    slug: 'main',
  }
}

const local = async (): Promise<XyoNetworkPayload> => {
  return {
    name: 'Local',
    nodes: [
      (await XyoNetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network'))?.payload,
      (await XyoNetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network'))?.payload,
    ].filter((item) => item) as XyoNetworkNodePayload[],
    schema: XyoNetworkSchema,
    slug: 'local',
  }
}

export const knownNetworks = async (): Promise<XyoNetworkPayload[]> => [await kerplunk(), await main(), await local()]
