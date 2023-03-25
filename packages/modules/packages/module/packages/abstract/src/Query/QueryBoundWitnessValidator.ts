import { assertEx } from '@xylabs/assert'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { XyoQuery, XyoQueryBoundWitness, XyoQueryBoundWitnessSchema } from '@xyo-network/module-model'
import { PayloadSetPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export class QueryBoundWitnessValidator<T extends XyoQuery = XyoQuery> extends BoundWitnessValidator<XyoQueryBoundWitness> {
  private _query: PayloadWrapper<T> | undefined

  protected override get expectedSchema(): string {
    return XyoQueryBoundWitnessSchema
  }

  static isQueryBoundWitnessValidator(obj: unknown) {
    return (obj as QueryBoundWitnessValidator)?.constructor === QueryBoundWitnessValidator
  }

  override validate() {
    return [
      ...super.validate(),
      // ...this.validateResultSet()
    ]
  }

  validateResultSet() {
    const errors: Error[] = []
    try {
      const resultSetHash = assertEx(this.obj.resultSet, 'Missing ResultSet')
      const wrapper = BoundWitnessWrapper.parse(this.obj)
      const resultSet = PayloadWrapper.parse<PayloadSetPayload>(wrapper.payloads[resultSetHash] as PayloadSetPayload)
      const required = resultSet?.payload.required
      if (required) {
        Object.entries(required).forEach(([key, value]) => {
          const found = wrapper.payloadSchemas.reduce((count, schema) => {
            return count + (schema === key ? 1 : 0)
          }, 0)
          if (found !== value) {
            errors.push(Error(`validateResultSet: Missing Schema [${key}:${found}:${value}]`))
          }
        })
      }
    } catch (ex) {
      errors.push(ex as Error)
    }
    return errors
  }
}
