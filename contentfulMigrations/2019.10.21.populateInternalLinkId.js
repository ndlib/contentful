// Generate id for Internal Links based on referenced page's slug
const forward = async (migration, { makeRequest }) => {
  // Get pages so we can match their sys.id with reference ids inside the internal links
  const pages = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=page&limit=1000`
  })

  // Now update the content and generate an id based on the page slugs, since that should be sane enough to satisfy
  migration.transformEntries({
    contentType: 'internalLink',
    from: ['page', 'title', 'context'],
    to: ['id'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      // If there's no page linked, don't bother trying. These will have to be manually remediated.
      if (!fromFields.page || !fromFields.page[currentLocale]) {
        return
      }
      const matchingPage = pages.items.find(page => page.sys.id === fromFields.page[currentLocale].sys.id)
      // Abort if page is not found or it is missing a slug
      if (!matchingPage) {
        console.log('No page found for internal link:', fromFields.title[currentLocale])
        return
      }
      if (!matchingPage.fields || !matchingPage.fields.slug || !matchingPage.fields.slug['en-US']) {
        console.log('No slug found for page:', matchingPage.sys.id, '| Referenced by internal link:', fromFields.title[currentLocale])
        return
      }

      // For non-subjects, append -link so that we don't have conflicts when multiple internal links have the same page
      const idValue = (fromFields.context && fromFields.context[currentLocale] === 'Subject')
        ? matchingPage.fields.slug['en-US']
        : `${matchingPage.fields.slug['en-US']}-link`
      return {
        id: idValue,
      }
    }
  })
}

const reverse = (migration) => {
  migration.transformEntries({
    contentType: 'internalLink',
    from: ['id'],
    to: ['id'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      return {
        id: '',
      }
    }
  })
}

module.exports = forward
