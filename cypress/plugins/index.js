/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require('fs-extra')
const path = require('path')
const allureWriter = require('@shelex/cypress-allure-plugin/writer')
const { MongoClient } = require('mongodb')

function getConfigurationByFile (file) {
  const pathToConfigFile = path.resolve(
    '',
    'cypress/config-files',
        `${file}.json`
  )

  return fs.readJson(pathToConfigFile)
}

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  allureWriter(on, config)

  const file = config.env.fileConfig || 'b2c'

  on('task', {
    connectToMongoDB({mongoURI,mongoDB,mongoDBCollection,filterKey,orderId}) {
    return new Promise((resolve) => {
      MongoClient.connect(mongoURI, (err, client) => {
        if (err) {
          console.log(`MONGO CONNECTION ERROR: ${err}`)
          throw err
        } else {
          const db = client.db(mongoDB)
          console.log("Collection --- " + mongoDBCollection + " --- filter is --- "+ filterKey)
          db.collection(mongoDBCollection).find({}).toArray(function (error, docs) {
            if (error) {
              console.log(`Error while fetching documents from collection: ${error}`)
              client.close()
              return null  
            }
            let docsLength = docs.length
            for(let i = 0; i < docsLength; i++ ){
              if(docs[i][filterKey] == orderId){
                client.close()
                resolve(docs[i])
                return docs[i]
              }
            }       
          })
        }

        })
        
      });
    } 
  }) 

  return getConfigurationByFile(file)
}
