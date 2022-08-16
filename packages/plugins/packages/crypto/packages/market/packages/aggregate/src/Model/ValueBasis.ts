import { PartialRecord } from '@xylabs/sdk-js'

import { Currency } from './Currency'
import { Token } from './Token'

export type ValueBasis = PartialRecord<Currency | Token, string | undefined>
