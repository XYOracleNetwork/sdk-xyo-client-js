import { assertEx } from '@xylabs/assert'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import { isPayloadDivinerQueryPayload, PayloadDivinerConfigSchema, PayloadDivinerParams } from '@xyo-network/diviner-payload-model'
import { Payload } from '@xyo-network/payload-model'

export class MemoryPayloadDiviner<TParams extends PayloadDivinerParams = PayloadDivinerParams> extends PayloadDiviner<TParams> {
  static override configSchemas = [PayloadDivinerConfigSchema]

  override async divine(payloads?: Payload[]): Promise<Payload[]> {
    const filter = assertEx(payloads?.filter(isPayloadDivinerQueryPayload)?.pop(), 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.readArchivist(), 'Unable to resolve archivist')
    const { schemas, limit, offset, order } = filter
    let all = await assertEx(archivist.all, 'Archivist does not support "all"')()
    if (order === 'desc') all = all.reverse()
    if (schemas?.length) all = all.filter((bw) => schemas.includes(bw.schema))
    const parsedLimit = limit || all.length
    const parsedOffset = offset || 0
    return all.slice(parsedOffset, parsedLimit)
  }
}
