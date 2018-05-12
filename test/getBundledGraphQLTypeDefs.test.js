const assert = require('assert')
const rewire = require('rewire')
let getBundledGraphQLTypeDefs = null

describe('getBundledGraphQLTypeDefs function', () => {
  beforeEach(() => {
    getBundledGraphQLTypeDefs = rewire('../src/getBundledGraphQLTypeDefs')
  })

  it('returns cached schema if there is a cached version of the schema generated through the glob passed as argument', () => {
    const testFilePath = 'file1.js'
    let testCachedSchemas = {
      [testFilePath]: 'test cached schema contents'
    }

    getBundledGraphQLTypeDefs.__set__('cachedSchemas', testCachedSchemas)
    assert.strictEqual(getBundledGraphQLTypeDefs(testFilePath), testCachedSchemas[testFilePath])
  })

  it('returns a string with the concatenated contents of all the files matching the glob pattern argument', () => {
    const pathsToContent = {
      '/first/match': 'First Match Content',
      '/second/match': 'Second Match Content',
      '/third/match': 'Third Match Content'
    }

    getBundledGraphQLTypeDefs.__set__('fs', {
      readFileSync: (path) => {
        return pathsToContent[path]
      }
    })

    getBundledGraphQLTypeDefs.__set__('getFilesMatchingGlob', () => {
      return Object.keys(pathsToContent)
    })

    Object.keys(pathsToContent).forEach((path) => {
      assert.notEqual(getBundledGraphQLTypeDefs('').indexOf(pathsToContent[path]), -1)
    })
  })

  it('collapses multiple spaces into one within the string output', () => {
    const inputContent = 'Content  with   many     spaces        to            collapse'
    const parsedContent = 'Content with many spaces to collapse'

    getBundledGraphQLTypeDefs.__set__('fs', {
      readFileSync: () => {
        return inputContent
      }
    })

    getBundledGraphQLTypeDefs.__set__('getFilesMatchingGlob', () => {
      return ['something to make fake readFileSync call happen']
    })

    assert.notEqual(getBundledGraphQLTypeDefs('').indexOf(parsedContent), -1)
  })

  it('collapses multiple line breaks into two', () => {
    const inputContent = "Content\nwith\n\n\n\n\n\n\nmany\n\n\nline breaks to\n\n\n\ncollapse"
    const parsedContent = "Content\nwith\n\nmany\n\nline breaks to\n\ncollapse"

    getBundledGraphQLTypeDefs.__set__('fs', {
      readFileSync: () => {
        return inputContent
      }
    })

    getBundledGraphQLTypeDefs.__set__('getFilesMatchingGlob', () => {
      return ['something to make fake readFileSync call happen']
    })

    assert.notEqual(getBundledGraphQLTypeDefs('').indexOf(parsedContent), -1)
  })

  it('prepends the "extend" keyword to graphql types declarations starting from the 2nd instance of each base type (Query/Mutation/Subscription)', () => {
    const inputContent = 'type Query type Mutation type Subscription type Query type Mutation type Subscription type Query type Mutation type Subscription'
    const parsedContent = 'type Query type Mutation type Subscription extend type Query extend type Mutation extend type Subscription extend type Query extend type Mutation extend type Subscription'

    getBundledGraphQLTypeDefs.__set__('fs', {
      readFileSync: () => {
        return inputContent
      }
    })

    getBundledGraphQLTypeDefs.__set__('getFilesMatchingGlob', () => {
      return ['something to make fake readFileSync call happen']
    })

    assert.notEqual(getBundledGraphQLTypeDefs('').indexOf(parsedContent), -1)
  })

  it('saves the bundled schema in the cache', () => {
    const globPattern = 'some/pattern/again'
    const inputContent = 'the file content'
    let cachedSchemas =  getBundledGraphQLTypeDefs.__get__('cachedSchemas')

    getBundledGraphQLTypeDefs.__set__('getFilesMatchingGlob', () => {
      return ['something to make fake readFileSync call happen']
    })

    getBundledGraphQLTypeDefs.__set__('fs', {
      readFileSync: () => {
        return inputContent
      }
    })

    getBundledGraphQLTypeDefs(globPattern)
    assert.ok(cachedSchemas.hasOwnProperty(globPattern))
    assert.notEqual(cachedSchemas[globPattern].indexOf(inputContent), -1)
  })
})
