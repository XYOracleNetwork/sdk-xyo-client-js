import { domainExists } from './domainExists'

/**
 * Validates a XYO schema structure and existence
 */
class SchemaValidator {
  public schema: string
  constructor(schema: string) {
    this.schema = schema
  }

  private _parts?: string[]

  /**
   * The schema converted into a string array split on '.'
   *
   * @returns string[]
   */
  get parts() {
    this._parts = this._parts ?? this.schema.split('.')
    return this._parts
  }

  /**
   * Levels in the schema
   *
   * @returns number
   */
  get levels(): number {
    return this.parts.length
  }

  /**
   * Checks whether the schema is all lowercase
   *
   * @returns boolean
   */
  get isLowercase(): boolean {
    return this.schema === this.schema.toLowerCase()
  }

  /**
   *
   * Get a domain for the schema at a certain level
   *
   * @param level - Zero based level to check
   * @returns string
   */
  private domainLevel(level: number): string {
    return this.parts
      .slice(0, level + 1)
      .reverse()
      .join('.')
  }

  private _rootDomain?: string

  /**
   * The rootDomain is the first two levels of the schema, in reverse order
   * This can be used to determine who 'owns' that schema, based on domain
   * registration
   *
   * @returns string
   */
  get rootDomain(): string {
    this._rootDomain = this._rootDomain ?? this.domainLevel(1)
    return this._rootDomain
  }

  /**
   * Checks if the root domain validates via DNS resolution
   *
   * @returns boolean
   */
  public async rootDomainExists() {
    return await domainExists(this.rootDomain)
  }

  /**
   * Determines how many levels of the schema's reverse domain
   * pass DNS resolution
   *
   * @returns number (0 if none exist)
   */
  public async domainExistanceDepth() {
    let level = 0
    while (level < this.levels) {
      if (!(await domainExists(this.domainLevel(level)))) {
        break
      }
      level += 1
    }
    return level
  }

  /**
   * Run all the validations
   * @param checkExistance - boolean
   * @returns Error[]
   */

  public async allDynamic() {
    const errors: Error[] = []
    if (this.schema.length === 0) errors.push(new Error('schema missing'))
    else if (!(await this.rootDomainExists()))
      errors.push(new Error(`schema root domain must exist [${this.rootDomain}]`))
    return errors
  }

  /**
   * Run all static validations
   * @returns Error[]
   */

  public all() {
    const errors: Error[] = []
    if (this.schema.length === 0) errors.push(new Error('schema missing'))
    else if (this.levels < 3) errors.push(new Error(`schema levels < 3 [${this.levels}, ${this.schema}]`))
    else if (!this.isLowercase) errors.push(new Error(`schema not lowercase [${this.schema}]`))
    return errors
  }
}

export { SchemaValidator }
