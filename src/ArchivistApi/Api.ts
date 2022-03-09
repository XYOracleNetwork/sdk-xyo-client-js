import { Huri } from '../Huri'
import { XyoBoundWitness, XyoPayload } from '../models'
import { XyoArchivistArchiveApi } from './Archive'
import { XyoArchivistApiBase } from './Base'
import { XyoArchivistApiConfig } from './Config'
import { XyoArchivistDomainApi } from './Domain'
import { PutArchiveRequest } from './models'

class XyoArchivistApi extends XyoArchivistApiBase {
  private _archive?: XyoArchivistArchiveApi
  public get archive(): XyoArchivistArchiveApi {
    this._archive = this._archive ?? new XyoArchivistArchiveApi(this.config)
    return this._archive
  }

  private _domain?: XyoArchivistDomainApi
  public get domain(): XyoArchivistDomainApi {
    this._domain = this._domain ?? new XyoArchivistDomainApi(this.config)
    return this._domain
  }

  /** @deprecated use archive.get() */
  public async getArchives() {
    return await this.archive.get()
  }

  /** @deprecated use archive.get(archive) */
  public async getArchive(archive: string) {
    return (await this.archive.get(archive)).pop()
  }

  /** @deprecated use archive.put */
  public async putArchive(archive: string, data: PutArchiveRequest = { accessControl: false }) {
    return await this.archive.put(archive, data)
  }

  /** @deprecated use archive.settings.keys.get */
  public async getArchiveKeys() {
    return await this.archive.settings.keys.get()
  }

  /** @deprecated use archive.settings.keys.post */
  public async postArchiveKey() {
    return await this.archive.settings.keys.post()
  }

  /** @deprecated use archive.block.post */
  public async postBoundWitnesses(boundWitnesses: XyoBoundWitness[]) {
    return await this.archive.block.post(boundWitnesses)
  }

  /** @deprecated use archive.block.post */
  public async postBoundWitness(entry: XyoBoundWitness) {
    return await this.archive.block.post([entry])
  }

  /** @deprecated use archive.block.getStats */
  public async getBoundWitnessStats() {
    return await this.archive.block.getStats()
  }

  /** @deprecated use archive.block.getByHash */
  public async getBoundWitnessByHash(hash: string) {
    return await this.archive.block.getByHash(hash)
  }

  /** @deprecated use archive.block.getBefore */
  public async getBoundWitnessesBefore(timestamp: number, limit = 20) {
    return await this.archive.block.getBefore(timestamp, limit)
  }

  /** @deprecated use archive.block.getAfter */
  public async getBoundWitnessesAfter(timestamp: number, limit = 20) {
    return await this.archive.block.getAfter(timestamp, limit)
  }

  /** @deprecated use archive.block.getPayloadsByHash */
  public async getBoundWitnessPayloadsByHash(hash: string) {
    return await this.archive.block.getByHash(hash)
  }

  /** @deprecated use archive.block.getMostRecent */
  public async getBoundWitnessMostRecent(limit = 20) {
    return await this.archive.block.getMostRecent(limit)
  }

  /** @deprecated use archive.block.getSample */
  public async getBoundWitnessSample(size: number) {
    return await this.archive.block.getSample(size)
  }

  /** @deprecated use archive.payload.getStats */
  public async getStats() {
    return await this.archive.payload.getStats()
  }

  /** @deprecated use archive.payload.getByHash */
  public async getPayloadByHash(hash: string) {
    return await this.archive.payload.getByHash(hash)
  }

  /** @deprecated use archive.payload.repairByHash */
  public async repairPayloadByHash(hash: string) {
    return await this.archive.payload.repairByHash(hash)
  }

  /** @deprecated use archive.payload.getMostRecent */
  public async getPayloadsMostRecent(limit = 20) {
    return await this.archive.payload.getMostRecent(limit)
  }

  /** @deprecated use archive.payload.getSample */
  public async getPayloadSample(size: number) {
    return await this.archive.payload.getSample(size)
  }

  public async get(huri: Huri | string) {
    const huriObj = typeof huri === 'string' ? new Huri(huri) : huri
    return (await this.axios.get<XyoPayload | XyoBoundWitness[]>(huriObj.href, this.axiosRequestConfig)).data
  }

  /**
   * @deprecated use constructor instead
   * */
  static get(config: XyoArchivistApiConfig) {
    return new XyoArchivistApi(config)
  }
}

export { XyoArchivistApi }
