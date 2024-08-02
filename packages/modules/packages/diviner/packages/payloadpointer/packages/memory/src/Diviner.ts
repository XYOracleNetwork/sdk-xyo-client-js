import { assertEx } from '@xylabs/assert'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { AbstractDiviner } from '@xyo-network/diviner-abstract'
import { BoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-abstract'
import { asDivinerInstance, DivinerInstance, DivinerModuleEventData } from '@xyo-network/diviner-model'
import { PayloadDiviner } from '@xyo-network/diviner-payload-abstract'
import {
  isPointerPayload,
  PayloadPointerDivinerConfigSchema,
  PayloadPointerDivinerParams,
  PointerPayload,
} from '@xyo-network/diviner-payload-pointer-model'
import { Payload, Schema } from '@xyo-network/payload-model'

import { findPayload } from './findPayload.ts'

export class PayloadPointerDiviner<
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
    if (!pointer) return []
    const archivist = await this.getConfigArchivist()
    const boundWitnessDiviner = await this.getBoundWitnessDiviner()
    const payloadDiviner = await this.getPayloadDiviner()
    const result = (await findPayload(archivist, boundWitnessDiviner, payloadDiviner, pointer)) as TOut | undefined
    return result ? [result] : []
  }

  /**
   * Returns the archivist instance for the given config
   * @returns The archivist instance corresponding to the config
   */
  private async getBoundWitnessDiviner(): Promise<BoundWitnessDiviner> {
    const name = assertEx(this.config?.boundWitnessDiviner, () => 'Missing archivist in config')
    const mod = assertEx(await this.resolve(name), () => `Config.boundWitnessDiviner module value of ${name} not resolved`)
    const diviner = assertEx(asDivinerInstance(mod), () => `Module ${name} is not an BoundWitnessDiviner`)
    return diviner as BoundWitnessDiviner
  }

  /**
   * Returns the archivist instance for the given config
   * @returns The archivist instance corresponding to the config
   */
  private async getConfigArchivist(): Promise<ArchivistInstance> {
    const name = assertEx(this.config?.archivist, () => 'Missing archivist in config')
    return assertEx(await this.getArchivist(), () => `Config.archivist module value of ${name} not resolved`)
  }

  /**
   * Returns the archivist instance for the given config
   * @returns The archivist instance corresponding to the config
   */
  private async getPayloadDiviner(): Promise<PayloadDiviner> {
    const name = assertEx(this.config?.payloadDiviner, () => 'Missing payloadDiviner in config')
    const mod = assertEx(await this.resolve(name), () => `Config.payloadDiviner module value of ${name} not resolved`)
    const diviner = assertEx(asDivinerInstance(mod), () => `Module ${name} is not an PayloadDiviner`)
    return diviner as PayloadDiviner
  }
}
