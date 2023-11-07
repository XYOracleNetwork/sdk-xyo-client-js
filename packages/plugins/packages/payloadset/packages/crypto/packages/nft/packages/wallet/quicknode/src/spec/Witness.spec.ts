import { Account } from '@xyo-network/account'

import { ApiGraphqlWitness, GraphqlQuery, GraphqlQuerySchema } from '../Witness'

const endpoint = 'https://api.quicknode.com/graphql'

describe('ApiGraphqlWitness', () => {
  it('Expected Success', async () => {
    const publicAddress = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
    const witness = await ApiGraphqlWitness.create({ account: Account.randomSync(), endpoint })
    const query: GraphqlQuery = {
      query: `query Query {
        ethereum {
          walletByAddress(address: "${publicAddress}") {
            walletNFTs (first: ${1}) {
              edges {
                node {
                  nft {
                    contractAddress
                    metadata
                    tokenId
                    externalUrl
                    name
                  }
                }
              }
            }
          }
        }
      }`,
      schema: GraphqlQuerySchema,
      variables: {},
    }
    const results = await witness.observe([query])
    expect(results).toBeArrayOfSize(1)
  })
})
