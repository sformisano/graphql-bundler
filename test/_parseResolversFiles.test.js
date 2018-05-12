const assert = require('assert')
const rewire = require('rewire')
let _parseResolversFilesTest = null

describe('_parseResolversFiles function', () => {
  beforeEach(() => {
    _parseResolversFilesTest = rewire('../src/_parseResolversFiles')
  })

  it('returns an object with the bundled resolver methods organised by type', () => {
    const resolvers = {
      '/file1.js': {
        Query: {
          q1: () => {},
          q2: () => {}
        },
        Mutation: {
          m1: () => {},
          m2: () => {}
        },
        Subscription: {
          s1: () => {},
          s2: () => {}
        }
      },
      '/file2.js': {
        Query: {
          q3: () => {},
          q4: () => {}
        },
        Mutation: {
          m3: () => {},
          m4: () => {}
        },
        Subscription: {
          s3: () => {},
          s4: () => {}
        }
      }
    }

    _parseResolversFilesTest.__set__('_parseResolversFile', (file) => {
      return resolvers[file]
    })

    const output = _parseResolversFilesTest(Object.keys(resolvers))

    assert(output.hasOwnProperty('Query'))
    assert(output.Query.hasOwnProperty('q1'))
    assert(output.Query.hasOwnProperty('q2'))
    assert(output.Query.hasOwnProperty('q3'))
    assert(output.Query.hasOwnProperty('q4'))

    assert(output.hasOwnProperty('Mutation'))
    assert(output.Mutation.hasOwnProperty('m1'))
    assert(output.Mutation.hasOwnProperty('m2'))
    assert(output.Mutation.hasOwnProperty('m3'))
    assert(output.Mutation.hasOwnProperty('m4'))

    assert(output.hasOwnProperty('Subscription'))
    assert(output.Subscription.hasOwnProperty('s1'))
    assert(output.Subscription.hasOwnProperty('s2'))
    assert(output.Subscription.hasOwnProperty('s3'))
    assert(output.Subscription.hasOwnProperty('s4'))
  })

  it('throws an error if there are multiple resolver methods of the same type with the same name', () => {
    const resolvers = {
      '/session.js': {
        Mutation: {
          login: () => {},
          logout: () => {}
        }
      },
      '/user.js': {
        Mutation: {
          signup: () => {},
          updateProfile: () => {},
          login: () => {}
        }
      }
    }

    _parseResolversFilesTest.__set__('_parseResolversFile', (file) => {
      return resolvers[file]
    })

    assert.throws(() => {
      _parseResolversFilesTest(Object.keys(resolvers))
    }, (err) => {
      const multipleResolversErrorMsg = `There are multiple entries of type Mutation called login.`
      const multipleResolversRegex = new RegExp(multipleResolversErrorMsg)
      return (err instanceof Error) && multipleResolversRegex.test(err.toString())
    })
  })
})
