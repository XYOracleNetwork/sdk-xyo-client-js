import { Payload } from './Payload'

export const isPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: Payload | null): x is T => x?.schema === schema
}

export const notPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x?: Payload | null): x is T => x?.schema !== schema
}
