import { assertEx, Hash } from '@xylabs/sdk-js'
import { AbstractArchivist, StorageClassLabel } from '@xyo-network/archivist-abstract'
import {
  ArchivistAllQuerySchema,
  ArchivistConfig,
  ArchivistGetQuerySchema,
  ArchivistInstance,
  ArchivistModuleEventData,
  ArchivistNextOptions,
  ArchivistNextQuerySchema,
  ArchivistParams,
  isArchivistInstance,
} from '@xyo-network/archivist-model'
import {
  AnyConfigSchema,
  labeledCreatableModule,
  ModuleIdentifier,
  ModuleInstance,
  ModuleLimitationViewLabel,
} from '@xyo-network/module-model'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'

export const ViewArchivistConfigSchema = 'network.xyo.archivist.view.config' as const
export type ViewArchivistConfigSchema = typeof ViewArchivistConfigSchema

export type ViewArchivistConfig = ArchivistConfig<
  {
    originArchivist?: ModuleIdentifier
  },
  ViewArchivistConfigSchema
>

export type ViewArchivistParams<TConfig extends AnyConfigSchema<ViewArchivistConfig> = AnyConfigSchema<ViewArchivistConfig>> = ArchivistParams<TConfig>

@labeledCreatableModule()
export class ViewArchivist<
  TParams extends ViewArchivistParams<AnyConfigSchema<ViewArchivistConfig>> = ViewArchivistParams,
  TEventData extends ArchivistModuleEventData = ArchivistModuleEventData,
>
  extends AbstractArchivist<TParams, TEventData>
  implements ArchivistInstance, ModuleInstance {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, ViewArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = ViewArchivistConfigSchema
  static override readonly labels = { ...ModuleLimitationViewLabel, [StorageClassLabel]: 'proxy' }

  private _originArchivistInstance?: ArchivistInstance

  get originArchivist() {
    return assertEx(this.config.originArchivist, () => 'originArchivist not configured')
  }

  override get queries() {
    return [ArchivistGetQuerySchema, ArchivistAllQuerySchema, ArchivistNextQuerySchema, ...super.queries]
  }

  async originArchivistInstance() {
    this._originArchivistInstance
      = this._originArchivistInstance ?? assertEx(await this.resolve(this.originArchivist, { identity: isArchivistInstance, required: true }))
    return this._originArchivistInstance
  }

  /** @deprecated use next instead */
  protected override async allHandler(): Promise<WithStorageMeta<Payload>[]> {
    // eslint-disable-next-line sonarjs/deprecation
    return (await (await this.originArchivistInstance()).all?.()) ?? []
  }

  protected override async getHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    return await (await this.originArchivistInstance()).get(hashes)
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    return (await (await this.originArchivistInstance()).next?.(options)) ?? []
  }
}
