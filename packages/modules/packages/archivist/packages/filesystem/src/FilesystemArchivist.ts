import { readFile } from 'node:fs/promises'

import { assertEx } from '@xylabs/assert'
import { handleError } from '@xylabs/error'
import { Hash } from '@xylabs/hex'
import { PromisableArray } from '@xylabs/promise'
import { HDWallet } from '@xyo-network/account'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import {
  ArchivistAllQuerySchema,
  ArchivistCommitQuerySchema,
  ArchivistConfig,
  ArchivistInstance,
  ArchivistParams,
} from '@xyo-network/archivist-model'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'
import {
  Payload, Schema, WithStorageMeta,
} from '@xyo-network/payload-model'

export interface FileSystemArchivistData {
  payloads: Payload[]
}

export const FilesystemArchivistConfigSchema = 'network.xyo.archivist.filesystem.config' as const
export type FilesystemArchivistConfigSchema = typeof FilesystemArchivistConfigSchema

export type FilesystemArchivistConfig = ArchivistConfig<{
  filePath?: string
  schema: FilesystemArchivistConfigSchema
}>

export type FilesystemArchivistParams = ArchivistParams<AnyConfigSchema<FilesystemArchivistConfig>>

/** @description Currently only a read-only archivist that loads payloads from filesystem
 * but allows for future expansion to read/write
 */
@creatableModule()
export class FilesystemArchivist<TParams extends FilesystemArchivistParams = FilesystemArchivistParams>
  extends AbstractArchivist<TParams>
  implements ArchivistInstance {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, FilesystemArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = FilesystemArchivistConfigSchema

  private _memoryArchivist?: MemoryArchivist

  get filePath() {
    return this.config?.filePath ?? 'archivist.xyo.json'
  }

  override get queries() {
    return [ArchivistAllQuerySchema, ArchivistCommitQuerySchema, ...super.queries]
  }

  private get memoryArchivist() {
    return assertEx(this._memoryArchivist)
  }

  private static dataFromRawJson(rawJson: string) {
    const data: FileSystemArchivistData = JSON.parse(rawJson)
    assertEx(typeof data === 'object', () => 'Archivist Data must be object')
    assertEx(Array.isArray(data.payloads), () => 'Archivist Data "payloads" field must be array of payloads')
    return data
  }

  protected override allHandler(): PromisableArray<WithStorageMeta<Payload>> {
    return this.memoryArchivist.all()
  }

  protected override clearHandler(): void | Promise<void> {
    return this.memoryArchivist.clear()
  }

  protected override async commitHandler(): Promise<BoundWitness[]> {
    return await this.memoryArchivist.commit()
  }

  protected override deleteHandler(hashes: Hash[]): PromisableArray<Hash> {
    return this.memoryArchivist.delete(hashes)
  }

  protected override async getHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    return await this.memoryArchivist.get(hashes)
  }

  protected override async insertHandler(payloads: Payload[]): Promise<WithStorageMeta<Payload>[]> {
    return await this.memoryArchivist.insert(payloads)
  }

  protected override async startHandler() {
    await super.startHandler()
    this._memoryArchivist = await MemoryArchivist.create({ account: await HDWallet.random() })
    try {
      const data = FilesystemArchivist.dataFromRawJson(await this.rawJsonFromFile())
      await this._memoryArchivist.insert(data.payloads)
    } catch (ex) {
      handleError(ex, (error) => {
        this.logger?.error(error.message)
      })
      return false
    }
    return true
  }

  private async rawJsonFromFile() {
    return await readFile(this.filePath, { encoding: 'utf8' })
  }
}
