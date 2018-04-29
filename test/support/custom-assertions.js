import * as _ from 'lodash'
import * as stringifyObject from 'stringify-object-es5'
import {heredoc} from '../../src/wrap/common-tags'

export default function customAssertions (assert) {
  assert._isEqual = (actual, expected) => {
    if (!_.isEqual(actual, expected)) {
      throw new Error(heredoc`
        ERROR: lodash _.isEqual assertion failed.

        Expected value:
        ${stringify(expected)}

        Actual value:
        ${stringify(actual)}

      `)
    }
  }

  assert._isNotEqual = (actual, expected) => {
    if (!_.isEqual(actual, expected)) {
      throw new Error(heredoc`
        ERROR: lodash !_.isEqual assertion failed.

        Expected this value:
        ${stringify(expected)}

        NOT to equal this value:
        ${stringify(actual)}

        But it totally did.

      `)
    }
  }

  assert.containsAll = (actual, expectedItems) => {
    _.each(expectedItems, (expectedItem) => {
      if (!_.includes(actual, expectedItem)) {
        throw new Error(heredoc`
          Error: expected ${stringify(actual)} to contain ${stringify(expectedItem)}

          But it did not.
        `)
      }
    })
  }

  assert.deepEqualSet = (actual, expected) => {
    assert.deepEqual(Array.from(actual), expected)
  }

  assert.doesntThrow = (func) => {
    func()
  }

  // Ensure func throws a message, with @@@ serving as a wildcard (e.g. for
  // expunging absolute paths or timestamps)
  assert.throwsMessage = (func, expectedMessage) => {
    try {
      func()
      throw new Error(heredoc`
        Error: expected function to throw, but it did not.

        Function:
        ${func.toString}
      `)
    } catch (e) {
      const allGood = _.every(expectedMessage.split('@@@'), expectedMessageChunk =>
        _.includes(e.message, expectedMessageChunk)
      )
      if (!allGood) {
        throw new Error(heredoc`
          Error: expected function to throw message, but it did not.
          (@@@ acts as a wildcard that is ignored)

          Function:
          ${func.toString()}

          Expected message to contain:
          ${expectedMessage}

          Actual message was:
          ${e.message}
        `)
      }
    }
  }
}

const stringify = (thing) =>
  stringifyObject(thing, {
    indent: '  ',
    singleQuotes: false,
    inlineCharacterLimit: 65
  })
