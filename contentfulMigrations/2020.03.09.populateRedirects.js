const fs = require('fs')

const forward = async (migration, { makeRequest }) => {
  // Get existing entries so we can link to them
  const pages = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=page&limit=1000`
  })
  const dynamicPages = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=dynamicPage&limit=1000`
  })
  const externalLinks = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=externalLink&limit=1000`
  })

  // Load the json file that has the data we need to populate
  const filename = '../data/2020.03.06.redirectData.js'
  const rawData = fs.readFileSync(filename)
  const json = JSON.parse(rawData)
  console.log('Number of entries:', json.length)
  await json.forEach(async (item) => {
    // Check existing records and see if they match the target. If so, we'll link a reference to it
    let linkedEntry = pages.items.concat(dynamicPages.items).find(entry => entry.fields.slug && item.target === ('/' + entry.fields.slug['en-US']))
    if (!linkedEntry) {
      linkedEntry = externalLinks.items.find(entry => entry.fields.url && (item.target === entry.fields.url['en-US'] || (item.target + '/') === entry.fields.url['en-US']))
    }
    return makeRequest({
      method: 'POST',
      url: '/entries',
      headers: {
        'X-Contentful-Content-Type': 'redirect'
      },
      data: {
        fields: {
          fromPath: { 'en-US': item.path },
          toLink: linkedEntry ? {
            'en-US': {
              sys: {
                type: 'Link',
                linkType: 'Entry',
                id: linkedEntry.sys.id,
              },
            },
          } : null,
          toPath: linkedEntry ? null : { 'en-US': item.target },
          forwardPath: { 'en-US': !!item.forwardPath },
          forwardQuery: { 'en-US': !!item.forwardQuery }
        }
      }
    }).then(response => {
      // Now publish the entry
      return makeRequest({
        method: 'PUT',
        url: `/entries/${response.sys.id}/published`,
        headers: {
          'X-Contentful-Version': response.sys.version
        }
      })
    })
  })
}

module.exports = forward