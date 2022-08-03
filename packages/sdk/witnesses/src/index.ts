export * from './Adhoc'
export * from './Id'
export * from './NonFungibleToken'

import { XyoLocationWitness as XyoLocationWitnessImported } from '@xyo-network/location-payload-plugin'

/** @deprecated import from @xyo-network/location-payload-plugin instead */
const XyoLocationWitness = XyoLocationWitnessImported

// eslint-disable-next-line deprecation/deprecation
export { XyoLocationWitness }
