const _ = require('lodash')
const _parseResolversFiles = require('./_parseResolversFiles')
const getFilesMatchingGlob = require('get-files-matching-glob')

/**
 * Cache for resolvers.
 * @type {Object}
 */
let cachedResolvers = {}

/**
 * Takes a glob pattern matching resolver files, bundles them together, and returns them as resolvers object.
 * Returns cached data when multiple requests with the same glob patterns are triggered.
 *
 * @param {string} globPattern
 * @returns {Object}
 */
module.exports =  (globPattern) => {
  if (cachedResolvers.hasOwnProperty(globPattern)) {
    return cachedResolvers[globPattern]
  }

  let resolverFiles = getFilesMatchingGlob(globPattern)

  if (_.isPlainObject(resolverFiles) && resolverFiles.hasOwnProperty('cached')) {
    resolverFiles = resolverFiles.cached
  }

  const graphqlResolvers = _parseResolversFiles(resolverFiles)

  cachedResolvers[globPattern] = graphqlResolvers

  return graphqlResolvers
}