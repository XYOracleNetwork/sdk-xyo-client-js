import { expect } from 'chai'

import EntryBuilder from './EntryBuilder'

describe('EntryBuilder tests', () => {
  it('checking happy path', () => {
    let builder = new EntryBuilder()
    expect(builder).to.be.a('object')
    builder = builder.schema('network.xyo.entry')
    expect(builder).to.be.a('object')
    builder = builder.addresses(['1234567890'])
    expect(builder).to.be.a('object')
    const json = builder.build()
    expect(json).to.be.a('object')
  })
  it('checking unhappy path [no schema]', () => {
    let builder = new EntryBuilder()
    expect(builder).to.be.a('object')
    builder = builder.addresses(['1234567890'])
    expect(builder).to.be.a('object')
    expect(() => builder.build()).to.throw('Missing schema')
  })
  it('checking unhappy path [no addresses]', () => {
    let builder = new EntryBuilder()
    expect(builder).to.be.a('object')
    builder = builder.schema('network.xyo.entry')
    expect(builder).to.be.a('object')
    expect(() => builder.build()).to.throw('Missing addresses')
  })
  it('checking unhappy path [empty addresses]', () => {
    let builder = new EntryBuilder()
    expect(builder).to.be.a('object')
    builder = builder.schema('network.xyo.entry')
    expect(builder).to.be.a('object')
    builder = builder.addresses([])
    expect(builder).to.be.a('object')
    expect(() => builder.build()).to.throw('Invalid address array length')
  })
})
