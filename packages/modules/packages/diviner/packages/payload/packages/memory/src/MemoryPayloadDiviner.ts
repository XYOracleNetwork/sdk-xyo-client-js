import { assertEx } from '@xylabs/assert'
import { DivinerModule, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import {
  isPayloadDivinerQueryPayload,
  PayloadDivinerConfigSchema,
  PayloadDivinerParams,
  PayloadDivinerQueryPayload,
} from '@xyo-network/diviner-payload-model'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload, WithMeta } from '@xyo-network/payload-model'

export class MemoryPayloadDiviner<
  TParams extends PayloadDivinerParams = PayloadDivinerParams,
  TIn extends PayloadDivinerQueryPayload = PayloadDivinerQueryPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut> = DivinerModuleEventData<DivinerModule<TParams>, TIn, TOut>,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  static override configSchemas = [PayloadDivinerConfigSchema]

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const filter = assertEx(payloads?.filter(isPayloadDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.getArchivist(), 'Unable to resolve archivist')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { schemas, limit, offset, hash, order, schema, $meta, $hash, ...props } = filter as WithMeta<TIn>
    let all = (await archivist.all?.()) as TOut[]
    if (all) {
      if (order === 'desc') all = all.reverse()
      if (schemas?.length) all = all.filter((payload) => schemas.includes(payload.schema))
      if (Object.keys(props).length > 0) {
        const additionalFilterCriteria = Object.entries(props)
        for (const [prop, filter] of additionalFilterCriteria) {
          const property = prop as keyof TOut
          all = Array.isArray(filter)
            ? all.filter((payload) =>
                filter.every((value) => {
                  const prop = payload?.[property]
                  //TODO: This seems to be written just to check arrays, and now that $meta is there, need to check type?
                  return Array.isArray(prop) && prop.includes?.(value)
                }),
              )
            : all.filter((payload) => payload?.[property] === filter)
        }
      }
      const parsedLimit = limit ?? all.length
      const parsedOffset = offset || 0
      return offset === undefined
        ? (async () => {
            const allPairs = await Promise.all(all.map<Promise<[string, TOut]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]))
            if (hash) {
              //remove all until found
              while (allPairs.length > 0 && allPairs[0][0] !== hash) {
                allPairs.shift()
              }
              //remove it if found
              if (allPairs.length > 0 && allPairs[0][0] === hash) {
                allPairs.shift()
              }
            }
            return allPairs.map(([, payload]) => payload)
          })()
        : all.slice(parsedOffset, parsedLimit)
    } else {
      throw new Error('Archivist does not support "all"')
    }
  }
}
