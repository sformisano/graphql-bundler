const assert = require('assert')
const rewire = require('rewire')
let getBundledGraphQLResolvers = null

describe('getBundledGraphQLResolvers function', () => {
  beforeEach(() => {
    getBundledGraphQLResolvers = rewire('../src/getBundledGraphQLResolvers')
  })

  it('returns cached resolvers if the resolverFiles is not an array but an object with the "cached" resolvers property', () => {
    const globPattern = 'foo/bar/*.js'
    const resolversOutput = 'resolvers data'
    const cachedResolvers = {
      [globPattern]: resolversOutput
    }

    getBundledGraphQLResolvers.__set__('cachedResolvers', cachedResolvers)

    getBundledGraphQLResolvers.__set__('getFilesMatchingGlob', () => {
      return ['file.js']
    })

    getBundledGraphQLResolvers.__set__('_parseResolversFiles', () => {
      return resolversOutput
    })

    getBundledGraphQLResolvers(globPattern)

    assert.ok(cachedResolvers.hasOwnProperty(globPattern))
    assert.strictEqual(cachedResolvers[globPattern], resolversOutput)
  })

  it('bundles and returns the resolvers in the files matching the glob patterns passed as argument', () => {
    const inputPattern = 'some/pattern'
    const files = {
      [inputPattern]: ['file1.js', 'file2.js', 'file9.js']
    }

    getBundledGraphQLResolvers.__set__('getFilesMatchingGlob', (patternArg) => {
      return files[patternArg]
    })

    getBundledGraphQLResolvers.__set__('_parseResolversFiles', (files) => {
      return {bundled: files}
    })

    const output = getBundledGraphQLResolvers(inputPattern)

    assert.strictEqual(output.bundled, files[inputPattern])
  })

  it('saves the bundled resolvers in the cache', () => {
    const globPattern = 'foo/bar/*.js'
    const cachedResolvers = getBundledGraphQLResolvers.__get__('cachedResolvers')
    const resolversOutput = 'resolvers data'

    getBundledGraphQLResolvers.__set__('getFilesMatchingGlob', () => {
      return ['file.js']
    })

    getBundledGraphQLResolvers.__set__('_parseResolversFiles', () => {
      return resolversOutput
    })

    getBundledGraphQLResolvers(globPattern)

    assert.ok(cachedResolvers.hasOwnProperty(globPattern))
    assert.notEqual(cachedResolvers[globPattern].indexOf(resolversOutput), -1)
  })
})
