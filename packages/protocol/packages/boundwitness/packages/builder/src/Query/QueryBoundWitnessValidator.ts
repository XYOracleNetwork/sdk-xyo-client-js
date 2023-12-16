import { assertEx } from '@xylabs/assert'
import { handleError } from '@xylabs/error'
import { QueryBoundWitness, QueryBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadSetPayload, Query } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class QueryBoundWitnessValidator<T extends Query = Query> extends BoundWitnessValidator<QueryBoundWitness> {
  private _query: PayloadWrapper<T> | undefined

  protected override get expectedSchema(): string {
    return QueryBoundWitnessSchema
  }

  static isQueryBoundWitnessValidator(obj: unknown) {
    return (obj as QueryBoundWitnessValidator)?.constructor === QueryBoundWitnessValidator
  }

  override async validate() {
    return [
      ...(await super.validate()),
      // ...this.validateResultSet()
    ]
  }

  async validateResultSet() {
    const errors: Error[] = []
    try {
      const resultSetHash = assertEx(this.obj.resultSet, 'Missing ResultSet')
      const wrapper = BoundWitnessWrapper.parse(this.obj)
      const resultSet = PayloadWrapper.wrap<PayloadSetPayload>((await wrapper.payloadMap())[resultSetHash] as PayloadSetPayload)
      const required = resultSet?.payload().required
      if (required) {
        for (const [key, value] of Object.entries(required)) {
          const found = wrapper.payloadSchemas.reduce((count, schema) => {
            return count + (schema === key ? 1 : 0)
          }, 0)
          if (found !== value) {
            errors.push(Error(`validateResultSet: Missing Schema [${key}:${found}:${value}]`))
          }
        }
      }
    } catch (ex) {
      handleError(ex, (error) => {
        errors.push(error)
      })
    }
    return errors
  }
}
