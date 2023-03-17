import { Payload } from './Payload'

export const isPayloadOfSchemaType = <T extends Payload>(schema: string) => {
  return (x: Payload): x is T => x.schema === schema
}
