import { Currency } from './Currency'
import { Token } from './Token'

export type ValueBasis = Partial<Record<Currency | Token, string | undefined>>
