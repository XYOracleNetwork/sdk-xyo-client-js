import { assertEx } from '@xylabs/assert'
import { PayloadHasher } from '@xyo-network/core'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerConfigSchema, PayloadDivinerParams } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'

export class MemoryPayloadDiviner<TParams extends PayloadDivinerParams = PayloadDivinerParams> extends PayloadDiviner<TParams> {
  static override configSchemas = [PayloadDivinerConfigSchema]

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload[]> {
    const filter = assertEx(payloads?.filter(isPayloadDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const { schemas, limit, offset, hash, order, schema: _schema, ...props } = filter
    let all = await archivist.all?.()
    if (all) {
      if (order === 'desc') all = all.reverse()
      if (schemas?.length) all = all.filter((bw) => schemas.includes(bw.schema))
      if (Object.keys(props).length > 0) {
        const additionalFilterCriteria = Object.entries(props)
        for (const [key, value] of additionalFilterCriteria) {
          const prop = key as keyof Payload
          all = all.filter((bw) => bw?.[prop] === value)
          // TODO: Handle Array vs other types
        }
      }
      const parsedLimit = limit || all.length
      const parsedOffset = offset || 0
      return parsedOffset
        ? all.slice(parsedOffset, parsedLimit)
        : (async () => {
            const allPairs = await Promise.all(
              all.map<Promise<[string, Payload]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
            )
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
    } else {
      throw Error('Archivist does not support "all"')
    }
  }
}
