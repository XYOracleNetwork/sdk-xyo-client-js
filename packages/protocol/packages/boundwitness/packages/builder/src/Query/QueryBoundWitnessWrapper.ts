import { assertEx } from '@xylabs/assert'
import { compact } from '@xylabs/lodash'
import { QueryBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload'
import { Payload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class QueryBoundWitnessWrapper<T extends Query = Query> extends BoundWitnessWrapper<QueryBoundWitness> {
  private _payloadsWithoutQuery: PayloadWrapper<Payload>[] | undefined
  private _query: T | undefined

  static async parseQuery<T extends Query = Query>(obj: unknown, payloads?: Payload[]): Promise<QueryBoundWitnessWrapper<T>> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to QueryBoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as QueryBoundWitnessWrapper<T>
        const wrapper =
          castWrapper instanceof QueryBoundWitnessWrapper
            ? castWrapper
            : new QueryBoundWitnessWrapper<T>(
                await PayloadBuilder.build(obj as QueryBoundWitness),
                payloads ? await Promise.all(payloads.map((payload) => PayloadBuilder.build(payload))) : undefined,
              )
        /*if (!wrapper.valid) {
          console.warn(`Parsed invalid QueryBoundWitness ${JSON.stringify(wrapper.errors.map((error) => error.message))}`)
        }*/
        return wrapper
      }
    }
    throw new Error(`Unable to parse [${typeof obj}]`)
  }

  async getQuery(): Promise<T> {
    const payloadMap = await this.payloadsDataHashMap()
    this._query = this._query ?? (payloadMap[this.boundwitness.query] as T | undefined)
    return assertEx(this._query, () => `Missing Query [${this.boundwitness}]`)
  }

  override async getWrappedPayloads(): Promise<PayloadWrapper<Payload>[]> {
    this._payloadsWithoutQuery =
      this._payloadsWithoutQuery ??
      (await Promise.all(
        compact(
          (
            await PayloadHasher.filterExclude(
              (await super.getWrappedPayloads()).map((wrapper) => wrapper.jsonPayload()),
              this.jsonPayload().query,
            )
          ).map((payload) => PayloadWrapper.wrap(payload)),
        ),
      ))
    return this._payloadsWithoutQuery
  }
}
