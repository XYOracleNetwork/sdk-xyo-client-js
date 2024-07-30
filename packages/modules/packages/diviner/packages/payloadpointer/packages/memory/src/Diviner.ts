import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { asDivinerInstance, DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import {
  isPayloadPointer,
  isPointerPayload,
  PayloadPointerDivinerConfigSchema,
  PayloadPointerDivinerParams,
  PointerPayload,
} from '@xyo-network/diviner-payload-pointer-model'
import { Payload, Schema } from '@xyo-network/payload-model'

import { findPayload } from './findPayload.js'

export class JsonPathDiviner<
  TParams extends PayloadPointerDivinerParams = PayloadPointerDivinerParams,
  TIn extends PointerPayload = PointerPayload,
  TOut extends Payload = Payload,
  TEventData extends DivinerModuleEventData<DivinerInstance<TParams, TIn, TOut>, TIn, TOut> = DivinerModuleEventData<
    DivinerInstance<TParams, TIn, TOut>,
    TIn,
    TOut
  >,
> extends AbstractDiviner<TParams, TIn, TOut, TEventData> {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, PayloadPointerDivinerConfigSchema]
  static override readonly defaultConfigSchema: Schema = PayloadPointerDivinerConfigSchema

  protected override async divineHandler(payloads?: TIn[]): Promise<TOut[]> {
    const pointer = payloads?.find(isPointerPayload)
    await Promise.resolve()
    const archivist = asArchivistInstance(await this.resolve(this.config.archivist))
    const boundWitnessDiviner = asDivinerInstance(await this.resolve(this.config.boundWitnessDiviner)) as BoundWitnessDiviner
    const payloadDiviner = asDivinerInstance(await this.resolve(this.config.payloadDiviner)) as PayloadDiviner
    if (archivist && boundWitnessDiviner && payloadDiviner && pointer) {
      const result = (await findPayload(archivist, boundWitnessDiviner, payloadDiviner, pointer)) as TOut | undefined
      if (result) return [result]
    }
    return []
  }
}
