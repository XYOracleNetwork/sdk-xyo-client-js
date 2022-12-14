import { getTask } from './getTask'

describe('getTask', () => {
  it('gets the job', () => {
    const task = getTask()
    expect(task).toBeFunction()
  })
})
