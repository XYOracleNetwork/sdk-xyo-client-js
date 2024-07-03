/* eslint-disable max-nested-callbacks */
import { AbstractBridge } from '@xyo-network/bridge-abstract'

// TODO: Implement standard test suite for all Bridges here and then run
// against specific bridges
export const generateBridgeTests = (title: string, bridge: AbstractBridge) => {
  describe(title, () => {
    describe('HttpBridge', () => {
      describe('By name', () => {
        it('should handle the case by name', () => {
          // Add your test logic here
        })
      })

      describe('By address', () => {
        it('should handle the case by address', () => {
          // Add your test logic here
        })
      })

      describe('By exposed/unexposed', () => {
        describe('Pre Exposed', () => {
          it('should handle the case when pre exposed', () => {
            // Add your test logic here
          })
        })

        describe('Post Exposed', () => {
          it('should handle the case when post exposed', () => {
            // Add your test logic here
          })
        })

        describe('Post Unexposed', () => {
          it('should handle the case when post unexposed', () => {
            // Add your test logic here
          })
        })
      })

      describe('By parent/sibling/child/grandchild', () => {
        describe('ParentNode', () => {
          it('should handle the case for ParentNode', () => {
            // Add your test logic here
          })

          describe('Bridge', () => {
            it('should handle the case for Bridge', () => {
              // Add your test logic here
            })
          })

          describe('SiblingNode', () => {
            it('should handle the case for SiblingNode', () => {
              // Add your test logic here
            })

            describe('ChildNode', () => {
              it('should handle the case for ChildNode', () => {
                // Add your test logic here
              })
            })
          })
        })

        describe('GrandchildNode', () => {
          it('should handle the case for GrandchildNode', () => {
            // Add your test logic here
          })
        })
      })
    })
  })
}
