/* eslint-disable complexity */
import { assertEx } from '@xylabs/assert'
import { removeFields } from '@xylabs/object'
import type { DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import type { PayloadDivinerParams, PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { isPayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, WithMeta } from '@xyo-network/payload-model'

import { hasTimestamp } from './hasTimestamp.ts'

export class MemoryPayloadDiviner<
  TParams extends PayloadDivinerParams = PayloadDivinerParams,
  TIn extends PayloadDivinerQueryPayload = PayloadDivinerQueryPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends PayloadDiviner<TParams, TIn, TOut, TEventData> {
  protected override async divineHandler(payloads?: TIn[]): Promise<WithMeta<TOut>[]> {
    const filter = assertEx(payloads?.filter(isPayloadDivinerQueryPayload)?.pop(), () => 'Missing query payload')
    if (!filter) return []
    const archivist = assertEx(await this.archivistInstance(), () => 'Unable to resolve archivist')
    const {
      schemas, limit, offset, hash, order = 'desc', timestamp, ...props
    } = removeFields(filter as WithMeta<TIn>, ['schema', '$meta', '$hash'])
    let all = (await archivist.all?.()) as WithMeta<TOut>[]
    if (all) {
      if (order === 'desc') all = all.reverse()
      if (schemas?.length) all = all.filter(payload => schemas.includes(payload.schema))
      if (timestamp !== undefined) {
        // If there was no order supplied with the original
        if (filter.order === undefined) {
          // filter for timestamp equality
          all = all.filter(hasTimestamp).filter(payload => payload.timestamp === timestamp)
        } else {
          // filter for greater than/less than or equal to
          all
            = order === 'asc'
              ? all.filter(hasTimestamp).filter(payload => payload.timestamp >= timestamp)
              : all.filter(hasTimestamp).filter(payload => payload.timestamp <= timestamp)
        }
      }
      if (Object.keys(props).length > 0) {
        const additionalFilterCriteria = Object.entries(props)
        for (const [prop, filter] of additionalFilterCriteria) {
          const property = prop as keyof TOut
          all
            = Array.isArray(filter)
              ? all.filter(payload =>
                filter.every((value) => {
                  const prop = payload?.[property]
                  // TODO: This seems to be written just to check arrays, and now that $meta is there, need to check type?
                  return Array.isArray(prop) && prop.includes?.(value)
                }))
              : all.filter(payload => payload?.[property] === filter)
        }
      }
      const parsedLimit = limit ?? all.length
      const parsedOffset = offset || 0
      return offset === undefined
        ? (async () => {
            const allPairs = await PayloadBuilder.hashPairs(all)
            if (hash) {
              // remove all until found
              while (allPairs.length > 0 && allPairs[0][1] !== hash) {
                allPairs.shift()
              }
              // remove it if found
              if (allPairs.length > 0 && allPairs[0][1] === hash) {
                allPairs.shift()
              }
            }
            return allPairs.map(([payload]) => payload).slice(parsedOffset, parsedOffset + parsedLimit)
          })()
        : all.slice(parsedOffset, parsedOffset + parsedLimit)
    } else {
      throw new Error('Archivist does not support "all"')
    }
  }
}
