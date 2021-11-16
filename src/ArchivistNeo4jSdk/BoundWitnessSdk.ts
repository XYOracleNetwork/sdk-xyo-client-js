import { assertEx } from '@xylabs/sdk-js'
import neo4j from 'neo4j-driver'
import { Driver } from 'neo4j-driver-core'

import { XyoBoundWitnessWrapper } from '../BoundWitness'
import { XyoBoundWitness } from '../models'
import { neo4jEntries2String, obj2Neo4jEntries } from './neo4jutils'

class BoundWitnessSdk {
  private _archive: string
  private _driver?: Driver
  constructor(url: string, un: string, pw: string, archive: string) {
    this._archive = archive
    this._driver = neo4j.driver(url, neo4j.auth.basic(un, pw))
  }

  public close() {
    this._driver?.close()
    this._driver = undefined
  }

  public async fetchCount() {
    const session = this._driver?.session()
    if (session) {
      try {
        return (await session.run('MATCH (n:Block) RETURN COUNT(n) as count')).records[0].get('count').low
      } finally {
        session?.close()
      }
    }
  }

  public async insert(item: XyoBoundWitness) {
    const _timestamp = Date.now()
    const wrapper = new XyoBoundWitnessWrapper(item)
    const session = this._driver?.session()
    const paramsString = neo4jEntries2String(obj2Neo4jEntries({ ...item, _timestamp, hash: wrapper.sortedHash() }))
    try {
      return (
        await session?.run(
          `
          CREATE (n:Block ${paramsString}) RETURN n.hash
          `
        )
      )?.records.map((record) => record.toObject() as XyoBoundWitness)
    } finally {
      session?.close()
    }
  }

  public async findByHash(hash: string) {
    const session = this._driver?.session()
    try {
      return (await session?.run(`MATCH (u:Block) ${hash} RETURN u`))?.records.map(
        (record) => record.toObject() as XyoBoundWitness
      )
    } finally {
      session?.close()
    }
  }

  public async sample(size: number) {
    assertEx(size <= 10, `size must be <= 10 [${size}]`)
    const session = this._driver?.session()
    const count = await this.fetchCount()
    const randomOffset = Math.random() * count
    try {
      return (
        await session?.run(`START t=node(*) 
      MATCH (a)-[:LEADS_TO]->(t) 
      RETURN a
      SKIP {${randomOffset}} LIMIT {size}`)
      )?.records.map((record) => record.toObject() as XyoBoundWitness)
    } finally {
      session?.close()
    }
  }

  public async insertMany(items: XyoBoundWitness[]) {
    const _timestamp = Date.now()
    const session = this._driver?.session()
    try {
      let results: XyoBoundWitness[] = []
      const promises = items.map(async (item) => {
        const wrapper = new XyoBoundWitnessWrapper(item)
        results = results.concat(
          (
            await session?.run(
              `CREATE u:Block ${JSON.stringify({ ...item, _timestamp, hash: wrapper.sortedHash() })} RETURN u`
            )
          )?.records.map((record) => record.toObject() as XyoBoundWitness) ?? []
        )
      })
      await Promise.allSettled(promises)
    } finally {
      session?.close()
    }
  }
}

export default BoundWitnessSdk
