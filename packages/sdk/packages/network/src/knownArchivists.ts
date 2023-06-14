import { NetworkNodePayload, NetworkNodeSchema } from './NetworkNodePayload'

const kerplunkArchivist = (): NetworkNodePayload => {
  return {
    docs: 'https://beta.archivist.xyo.network/api',
    name: 'XYO Shared Archivist (kerplunk)',
    schema: NetworkNodeSchema,
    slug: 'kerplunk',
    type: 'archivist',
    uri: 'https://beta.api.archivist.xyo.network',
    web: 'https://beta.archivist.xyo.network',
  }
}

const mainArchivist = (): NetworkNodePayload => {
  return {
    docs: 'https://archivist.xyo.network/api',
    name: 'XYO Shared Archivist (main)',
    schema: NetworkNodeSchema,
    slug: 'main',
    type: 'archivist',
    uri: 'https://api.archivist.xyo.network',
    web: 'https://archivist.xyo.network',
  }
}

const localArchivist = (): NetworkNodePayload => {
  return {
    docs: 'http://localhost:8080/api',
    name: 'XYO Shared Archivist (local)',
    schema: NetworkNodeSchema,
    slug: 'local',
    type: 'archivist',
    uri: 'http://localhost:8080',
    web: 'http://localhost:8081',
  }
}

export const knownArchivists = (): NetworkNodePayload[] => [kerplunkArchivist(), mainArchivist(), localArchivist()]
