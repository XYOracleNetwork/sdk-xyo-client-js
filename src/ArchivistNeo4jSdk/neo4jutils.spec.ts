import { neo4jEntries2String, obj2Neo4jEntries } from './neo4jutils'

test('checking happy path', () => {
  const entries = obj2Neo4jEntries({ testNumber: 1, testObject: { objNumber: 2, objString: 'to' }, testString: 'test' })
  console.log(JSON.stringify(entries, null, 2))
  const entriesString = neo4jEntries2String(entries)
  console.log(`entriesString: ${entriesString}`)
})
