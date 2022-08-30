import { XyoDivinerConfig } from './Config'

export type PartialDivinerConfig<T extends XyoDivinerConfig> = Omit<T, 'schema' | 'targetSchema'> & {
  schema?: T['schema']
  targetSchema?: T['targetSchema']
}
