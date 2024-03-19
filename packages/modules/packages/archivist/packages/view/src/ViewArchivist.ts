import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistConfig,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import { AnyConfigSchema, creatableModule, ModuleIdentifier, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { PayloadWithMeta } from '@xyo-network/payload-model'

export const ViewArchivistConfigSchema = 'network.xyo.archivist.view.config'
export type ViewArchivistConfigSchema = typeof ViewArchivistConfigSchema

export type ViewArchivistConfig = ArchivistConfig<
  {
    originArchivist?: ModuleIdentifier
  },
  ViewArchivistConfigSchema
>

export type ViewArchivistParams<TConfig extends AnyConfigSchema<ViewArchivistConfig> = AnyConfigSchema<ViewArchivistConfig>> = ModuleParams<TConfig>

@creatableModule()
export class ViewArchivist<
    TParams extends ViewArchivistParams<AnyConfigSchema<ViewArchivistConfig>> = ViewArchivistParams,
    TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
  >
  extends AbstractArchivist<TParams, TEventData>
  implements ArchivistInstance, ModuleInstance
{
  static override configSchemas = [ViewArchivistConfigSchema]

  private _originArchivistInstance?: ArchivistInstance

  get originArchivist() {
    return assertEx(this.config.originArchivist, () => 'originArchivist not configured')
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistNextQuerySchema, ...super.queries]
  }

  async originArchivistInstance() {
    this._originArchivistInstance =
      this._originArchivistInstance ?? assertEx(await this.resolve(this.originArchivist, { identity: isArchivistInstance, required: true }))
    return this._originArchivistInstance
  }

  protected override async allHandler(): Promise<PayloadWithMeta[]> {
    return (await (await this.originArchivistInstance()).all?.()) ?? []
  }

  protected override async getHandler(hashes: Hash[]): Promise<PayloadWithMeta[]> {
    return await (await this.originArchivistInstance()).get(hashes)
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<PayloadWithMeta[]> {
    return (await (await this.originArchivistInstance()).next?.(options)) ?? []
  }
}
