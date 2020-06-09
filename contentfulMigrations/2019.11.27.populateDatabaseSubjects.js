// NOTE: This requires neat-csv npm package. Before running this script, you must run the following:
// npm install neat-csv -g
// npm link neat-csv
const neatCsv = require('neat-csv')
const fs = require('fs')
const path = require('path')

const subjectFields = Array(6).fill().map((val, index) => `Subject ${index+1}`)
const bestBetFields = Array(15).fill().map((val, index) => `Best Bets ${index+1}`)
const fieldNames = subjectFields.concat(bestBetFields)

const forward = async (migration, { makeRequest }) => {
  // Fetch internalLinks since these serve as the subjects we will be associating the databases with
  const fetchLinks = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=internalLink&fields.context=Subject&limit=1000`
  })
  const internalLinks = fetchLinks.items || []

  // We also need to get pages since the display name sometimes uses the page's title rather than the internal link's
  const fetchPages = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=page&limit=1000`
  })
  const pages = fetchPages.items || []

  // Load the CSV file that has the data we need to populate
  const filename = path.resolve(__dirname, '../data/2020.05.18.databaseSubjects.csv')
  const csvData = {}
  const csvRaw = fs.readFileSync(filename)
  const rows = await neatCsv(csvRaw)
  rows.forEach(row => {
    // Create a dict with the system number as the key. Pad system number to match contentful data
    const sysNum = row['Sys no.'].padStart(9, '0')
    csvData[sysNum] = {
      ...row,
      'Sys no.': sysNum,
    }
  })

  console.log(`Importing subjects for ${Object.keys(csvData).length} Resources.`)

    migration.transformEntries({
      contentType: 'resource',
      from: ['alephSystemNumber', 'title', 'subjects', 'bestBets', 'multidisciplinary'],
      to: ['subjects', 'bestBets', 'multidisciplinary'],
      shouldPublish: true,
      transformEntryForLocale: function (fromFields, currentLocale) {
        // If there's no aleph number it won't be on the spreadsheet, so skip it.
        if (!fromFields.alephSystemNumber || !fromFields.alephSystemNumber[currentLocale]) {
          return
        }
        const systemNumber = fromFields.alephSystemNumber[currentLocale].padStart(9, '0')
        const csvRow = csvData[systemNumber]
        // If missing from the spreadsheet, output a warning and continue with the next item
        if (!csvRow) {
          console.warn(`Resource ${systemNumber} (${fromFields.title[currentLocale]}) does not exist on spreadsheet.`)
          return
        }
        // If the row does not contain any subjects, nothing to do but skip it
        const hasSubjects = fieldNames.some(fieldName => csvRow[fieldName])
        if (!hasSubjects) {
          return
        }

        // Item is valid and has subjects on the spreadsheet. Convert each subject to a reference to the respective internalLink (subject) in Contentful.
        const subjectRefs = []
        const bestBetRefs = []
        let multidisciplinary = fromFields.multidisciplinary ? !!fromFields.multidisciplinary[currentLocale] : false
        fieldNames.forEach(fieldName => {
          const subjectName = csvRow[fieldName]
          if (subjectName) {
            // This is a special name which will toggle the multidisciplinary boolean field
            if (subjectName === 'Multidisciplinary') {
              multidisciplinary = true
              return // Move on to the next item. This isn't a "real" subject
            }
            // Look for matching internalLink in order to create subject reference
            const match = internalLinks.find(link => {
              // If internal link title matches subject, we found the right one
              if (link.fields.title['en-US'].toLowerCase().replace('link to ', '') === subjectName.toLowerCase()) {
                return true
              }
              // Find the page the internal link references and compare subject against THAT title
              const linkedPage = pages.find(page => link.fields.page && page.sys.id === link.fields.page['en-US'].sys.id)
              return linkedPage && linkedPage.fields.title['en-US'].toLowerCase() === subjectName.toLowerCase()
            })
            if (match) {
              const ref = {
                sys: {
                  type: 'Link',
                  linkType: 'Entry',
                  id: match.sys.id,
                }
              }
              fieldName.toLowerCase().includes('best bet') ? bestBetRefs.push(ref) : subjectRefs.push(ref)
            } else {
              console.warn(`Issue processing ${systemNumber} (${fromFields.title[currentLocale]}. No subject found with the name "${subjectName}". Subject will be omitted.`)
            }
          }
        })
        return {
          subjects: subjectRefs,
          bestBets: bestBetRefs,
          multidisciplinary: multidisciplinary,
        }
      }
    })
}

const reverse = (migration) => {
  console.warn('WARNING: This will remove ALL subjects from EVERY Resource! Are you sure?')
  migration.transformEntries({
    contentType: 'resource',
    from: ['subjects', 'bestBets'],
    to: ['subjects', 'bestBets'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      // Don't modify entries that already have no subjects. There's no point.
      if ((!fromFields.subjects || !fromFields.subjects[currentLocale] || !fromFields.subjects[currentLocale].length) &&
      (!fromFields.bestBets || !fromFields.bestBets[currentLocale] || !fromFields.bestBets[currentLocale].length)) {
        return
      }
      return {
        subjects: [],
        bestBets: [],
      }
    }
  })
}

module.exports = forward
