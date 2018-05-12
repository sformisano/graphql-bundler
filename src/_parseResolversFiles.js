const _parseResolversFile = require('./_parseResolversFile')
const _baseGraphQLTypes = require('../data/_baseGraphQLTypes')

/**
 * Runs individual resolvers file validation on all files, merges resolvers, checks for
 * duplicates and returns the merged resolvers object.
 *
 * @param {String[]} resolverFiles
 * @private
 */
module.exports = (resolverFiles) => {
  let allResolvers = {}

  resolverFiles.forEach(file => {
    const fileResolvers = _parseResolversFile(file)

    _baseGraphQLTypes.forEach(type => {
      if (!fileResolvers.hasOwnProperty(type)) {
        return false
      }

      if (!allResolvers.hasOwnProperty(type)) {
        allResolvers[type] = {}
      }

      const allResolversTypeDataKeys = Object.keys(allResolvers[type])
      const fileTypeDataKeys = Object.keys(fileResolvers[type])

      const duplicates = fileTypeDataKeys.filter((key) => {
        return allResolversTypeDataKeys.indexOf(key) !== -1
      })

      if (duplicates.length) {
        throw new Error(`There are multiple entries of type ${type} called ${duplicates.join(', ')}.`)
      }

      Object.assign(allResolvers[type], fileResolvers[type])
    })
  })

  return allResolvers
}