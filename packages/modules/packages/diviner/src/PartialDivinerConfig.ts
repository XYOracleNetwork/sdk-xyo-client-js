import { XyoDivinerConfig } from './Config'

export type PartialDivinerConfig<T extends XyoDivinerConfig> = Omit<T, 'schema'> & {
  schema?: T['schema']
}
