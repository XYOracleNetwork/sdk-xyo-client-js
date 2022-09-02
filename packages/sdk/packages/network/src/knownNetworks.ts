import { XyoNetworkNodePayload } from './XyoNetworkNodePayload'
import { XyoNetworkNodePayloadWrapper } from './XyoNetworkNodePayloadWrapper'
import { XyoNetworkPayload, XyoNetworkPayloadSchema } from './XyoNetworkPayload'

const kerplunk = (): XyoNetworkPayload => {
  return {
    name: 'Kerplunk',
    nodes: [
      XyoNetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network')?.payload,
      XyoNetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network')?.payload,
    ].filter((item) => item) as XyoNetworkNodePayload[],
    schema: XyoNetworkPayloadSchema,
    slug: 'kerplunk',
  }
}

const main = (): XyoNetworkPayload => {
  return {
    name: 'Main',
    nodes: [
      XyoNetworkNodePayloadWrapper.known('main-archivist-xyo-network')?.payload,
      XyoNetworkNodePayloadWrapper.known('location-diviner-xyo-network')?.payload,
    ].filter((item) => item) as XyoNetworkNodePayload[],
    schema: XyoNetworkPayloadSchema,
    slug: 'main',
  }
}

const local = (): XyoNetworkPayload => {
  return {
    name: 'Local',
    nodes: [
      XyoNetworkNodePayloadWrapper.known('kerplunk-archivist-xyo-network')?.payload,
      XyoNetworkNodePayloadWrapper.known('beta-location-diviner-xyo-network')?.payload,
    ].filter((item) => item) as XyoNetworkNodePayload[],
    schema: XyoNetworkPayloadSchema,
    slug: 'local',
  }
}

export const knownNetworks = (): XyoNetworkPayload[] => [kerplunk(), main(), local()]
