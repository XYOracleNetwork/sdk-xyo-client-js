import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import {
  JsonPatch,
  JsonPatchDivinerConfig,
  JsonPatchDivinerConfigSchema,
  JsonPatchDivinerSchema,
  PayloadJsonPatcher,
} from '@xyo-network/diviner-jsonpatch-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

export type JsonPatchDivinerParams = DivinerParams<AnyConfigSchema<JsonPatchDivinerConfig>>

export abstract class AbstractJsonPatchDiviner<TParams extends JsonPatchDivinerParams = JsonPatchDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [JsonPatchDivinerConfigSchema]

  protected override divineHandler(payloads?: Payload[]): Payload[] {
    const jsonpatchs: JsonPatch[] = []
    if (this.config.jsonpatch) {
      jsonpatchs.push({ jsonpatch: this.config.jsonpatch, schema: JsonPatchDivinerSchema })
    }
    return jsonpatchs.map((jsonpatch) => payloads?.map(this.jsonpatcher(jsonpatch)) || []).flat()
  }

  protected abstract jsonpatcher<TSource extends Payload = Payload, TDestination extends Payload = Payload>(
    jsonpatch: JsonPatch,
  ): PayloadJsonPatcher<TSource, TDestination>
}
