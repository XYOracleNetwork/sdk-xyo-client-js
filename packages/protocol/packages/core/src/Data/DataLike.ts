import { BigNumber } from '@xylabs/bignumber'

import { XyoAbstractData } from './AbstractData'

export type DataLike = string | BigNumber | Uint8Array | XyoAbstractData

/** @deprecated use DataLike instead */
export type XyoDataLike = DataLike
