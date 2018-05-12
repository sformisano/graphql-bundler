const assert = require('assert')
const rewire = require('rewire')
let _parseResolversFileTest = null

describe('_parseResolversFile function', () => {
  beforeEach(() => {
    _parseResolversFileTest = rewire('../src/_parseResolversFile')
  })

  it('loads the contents of the file passed as argument', () => {
    const testInput = 'path/to/another/file.js'
    const resolvers = {
      [testInput]: {Query: {hello: () => {}}}
    }

    _parseResolversFileTest.__set__('_getFileContent', (file) => {
      return resolvers[file]
    })

    assert.strictEqual(_parseResolversFileTest(testInput), resolvers[testInput])
  })

  context('assertThrowsMissingValidResolversObjectError', () => {
    const assertThrowsMissingValidResolversObjectError = (inputFile) => {
      const missingValidResolverErrorRegex = new RegExp(`The resolvers file must export an object literal.`)

      _parseResolversFileTest.__set__('_getFileContent', (file) => {
        return file
      })

      assert.throws(() => {
        _parseResolversFileTest(inputFile)
      }, (err) => {
        return (err instanceof Error) && missingValidResolverErrorRegex.test(err.toString())
      })
    }

    it('throws an error if the resolversObject argument is not an object literal', () => {
      assertThrowsMissingValidResolversObjectError('')
      assertThrowsMissingValidResolversObjectError(true)
      assertThrowsMissingValidResolversObjectError(false)
      assertThrowsMissingValidResolversObjectError(null)
      assertThrowsMissingValidResolversObjectError(undefined)
      assertThrowsMissingValidResolversObjectError(5)
      assertThrowsMissingValidResolversObjectError(Symbol('str'))
      assertThrowsMissingValidResolversObjectError([])
      assertThrowsMissingValidResolversObjectError([1, 2, 3])
    })
  })

  it('throws an error if properties of the resolvers object literal are not valid graphql base types', () => {
    const testInput = 'path/to/another/file.js'
    const resolvers = {
      [testInput]: {
        badProperty1: 1,
        badProperty2: 2,
        badPropertyX: 'x'
      }
    }

    _parseResolversFileTest.__set__('_getFileContent', (file) => {
      return resolvers[file]
    })

    assert.throws(() => {
      _parseResolversFileTest(testInput)
    }, (err) => {
      const regex = new RegExp(`The following properties are not valid graphql base types: ${Object.keys(resolvers[testInput]).join(', ')}`)
      return (err instanceof Error) && regex.test(err.toString())
    })
  })
})