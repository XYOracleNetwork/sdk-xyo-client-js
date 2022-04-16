import { BigNumber } from '@xylabs/sdk-js'

import { XyoAbstractData } from './AbstractData'

export type XyoDataLike = string | Buffer | BigNumber | Uint8Array | XyoAbstractData
