interface TestPayload {
  number_field: number
  object_field: {
    number_value: number
    string_value: string
  }
  string_field: string
  timestamp: number
}

export default TestPayload
