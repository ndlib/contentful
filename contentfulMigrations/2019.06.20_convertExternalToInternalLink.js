const forward = async (migration, { makeRequest }) => {

  // Fetch preliminary data that we need to link up records
  const externalLinks = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=externalLink&limit=1000`
  })
  const pages = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=page&limit=1000`
  })

  // MIGRATE SERVICE POINTS
  migration.transformEntries({
    contentType: 'servicePoint',
    from: ['relatedWebPage'],
    to: ['relatedWebPage'],
    transformEntryForLocale: async (fromFields, currentLocale) => {
      // Only modify entries that have a web page linked
      if (!fromFields.relatedWebPage || !fromFields.relatedWebPage[currentLocale]) {
        return
      }
      // Only migrate if the Web Page is an External Link AND we can find a Page to migrate it to
      const matchingExternalLink = externalLinks.items.find(ext => ext.sys.id === fromFields.relatedWebPage[currentLocale].sys.id)
      const matchingPage = (matchingExternalLink && matchingExternalLink.fields.url && matchingExternalLink.fields.url[currentLocale])
        ? pages.items.find(page => {
            return page.fields.slug && page.fields.slug[currentLocale] &&
              ('/' + page.fields.slug[currentLocale]) === matchingExternalLink.fields.url[currentLocale]
          })
        : null
      if (!matchingExternalLink) {
        return
      }
      if (!matchingPage) {
        console.log('No page found for url:', matchingExternalLink.fields.url['en-US'])
        return
      }

      console.log('External Link "' + matchingExternalLink.fields.title['en-US'] + '" --> Page "' + matchingPage.fields.title['en-US'] + '"')
      return {
        relatedWebPage: {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: matchingPage.sys.id,
          },
        },
      }
    }
  })

  // MIGRATE EXTERNAL LINKS TO INTERNAL LINKS
  const linksToMigrate = []
  externalLinks.items.forEach(ext => {
    // Ignore external links that don't have a url or really are pointing to external sites
    // The ones that should be internal links will all start with /
    if (!ext.fields.url || !ext.fields.url['en-US'] || !ext.fields.url['en-US'].startsWith('/')) {
      return
    }
    const matchingPage = pages.items.find(page => page.fields.slug && page.fields.slug['en-US'] &&
      ('/' + page.fields.slug['en-US']) === ext.fields.url['en-US']
    )
    if (matchingPage) {
      // We should transform this external link into an internal link, linking to the same page
      linksToMigrate.push({ externalLink: ext, page: matchingPage })
    } else {
      // If there is no matching page, this probably means it's built into usurper and is not in contentful.
      // We can't use an internal link in that case.
      console.log('No page found for url:', ext.fields.url['en-US'])
      return
    }
  })

  // Do the migration to convert the relevant external links to internal links
  migration.transformEntriesToType({
    sourceContentType: 'externalLink',
    targetContentType: 'internalLink',
    from: ['title', 'url'],
    shouldPublish: true,
    updateReferences: false,
    removeOldEntries: false,
    identityKey: (fields) => {
      return fields.url ? fields.url['en-US'] : null
    },
    transformEntryForLocale: (fromFields, currentLocale) => {
      // If there's no url it's not even a legit external link... What is that doing here?
      if (!fromFields.url || !fromFields.url[currentLocale]) {
        console.log('No url for External Link:', fromFields.title[currentLocale])
        return
      }
      const migrationData = linksToMigrate.find((data) => data.externalLink.fields.url[currentLocale] === fromFields.url[currentLocale])
      if (!migrationData) {
        // It was not one of the external links we identified as needing to migrate. Leave it alone.
        return
      }

      const usePageTitle = fromFields.title[currentLocale] === migrationData.page.fields.title[currentLocale]
      const entryTitle = usePageTitle ? `Link to ${migrationData.page.fields.title[currentLocale]}` : fromFields.title[currentLocale]
      console.log(`External Link "${fromFields.title[currentLocale]}" --> CREATE Internal Link "${entryTitle}"`)
      return {
        title: entryTitle,
        page: {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: migrationData.page.sys.id,
          },
        },
        usePageTitle: usePageTitle,
        context: 'Unspecified',
      }
    }
  })

  // AFTER the internal links have been created, we can do yet another migration to update references in link groups
}

const reverse = (migration) => {
  // Reversing this would probably impact more than just the ones that were transformed, and it's kind of complicated.
  // We shouldn't have to reverse any of this anyway. The impact is not very big and we could just remediate by hand.
}

module.exports = forward
