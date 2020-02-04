const forward = async (migration, { makeRequest }) => {
  const callRanges = migration.editContentType('collectionCallRanges')

  // User-friendly names
  callRanges.name('Collection Call Ranges')
  callRanges.editField('collectionSublibrary').name('Collection Sublibrary')

  callRanges.createField('floor')
    .name('Floor')
    .type('Link')
    .linkType('Entry')
    .validations([
      { linkContentType: ['floor'] }
    ])

  callRanges.createField('servicePoint')
    .name('Service Point')
    .type('Link')
    .linkType('Entry')
    .validations([
      { linkContentType: ['servicePoint'] }
    ])

  // Get all floors so we can look them up by slug and use their sys.id for references
  const floors = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=floor&limit=1000`
  })
  const archivesSpRequest = await makeRequest({
    method: 'GET',
    url: '/entries?content_type=servicePoint&fields.slug=universityarchives',
  })
  if (archivesSpRequest.items.length != 1) {
    console.error('Unable to find University Archives service point.')
    return
  }
  const archivesSpId = archivesSpRequest.items[0].sys.id
  const rbscSpRequest = await makeRequest({
    method: 'GET',
    url: '/entries?content_type=servicePoint&fields.slug=rarebooksspecialcollections',
  })
  if (rbscSpRequest.items.length != 1) {
    console.error('Unable to find RBSC service point.')
    return
  }
  const rbscSpId = rbscSpRequest.items[0].sys.id

  migration.transformEntries({
    contentType: 'collectionCallRanges',
    from: ['floorSlug', 'collectionSublibrary'],
    to: ['floor', 'servicePoint'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      let slug = fromFields.floorSlug[currentLocale]
      let sp

      if (slug === 'hesburgh-1st-floor-archv') {
        slug = 'hesburgh-1st-floor'
        sp = archivesSpId
      } else if (slug === 'hesburgh-1st-floor-rbsc') {
        slug = 'hesburgh-1st-floor'
        sp = rbscSpId
      }

      const match = floors.items.find(floor => floor.fields.slug[currentLocale] === slug)
      if (!match) {
        console.log('No floor found with slug:', fromFields.floorSlug[currentLocale], '| Sublibrary:', fromFields.collectionSublibrary[currentLocale])
        return
      }

      return {
        floor: {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: match.sys.id,
          },
        },
        servicePoint: {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: sp,
          },
        },
      }
    }
  })

  // Correct the service points that were pointing to the special rbsc and archives "floors"
  // WARNING: This part is not reversible!
  const hesburghFirstFloor = floors.items.find(floor => floor.fields.slug['en-US'] === 'hesburgh-1st-floor')
  if (!hesburghFirstFloor) {
    console.log('Unable to find Hesburgh 1st Floor.')
    return
  }
  const archivesFloor = floors.items.find(floor => floor.fields.slug['en-US'] === 'hesburgh-1st-floor-archv')
  if (!archivesFloor) {
    console.log('Unable to find University Archives floor.')
    return
  }
  const rbscFloor = floors.items.find(floor => floor.fields.slug['en-US'] === 'hesburgh-1st-floor-rbsc')
  if (!rbscFloor) {
    console.log('Unable to find RBSC floor.')
    return
  }
  migration.transformEntries({
    contentType: 'servicePoint',
    from: ['floor'],
    to: ['floor'],
    shouldPublish: true,
    transformEntryForLocale: function (fromFields, currentLocale) {
      // Skip any service points with no floor
      if (!fromFields.floor || !fromFields.floor[currentLocale]) {
        return
      }
      // Ignore everything except the specific entries we are interested in
      if (![archivesFloor.sys.id, rbscFloor.sys.id].includes(fromFields.floor[currentLocale].sys.id)) {
        return
      }

      return {
        floor: {
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: hesburghFirstFloor.sys.id,
          },
        },
      }
    }
  })
}

const reverse = (migration) => {
  const callRanges = migration.editContentType('collectionCallRanges')
  callRanges.deleteField('floor')
  callRanges.deleteField('servicePoint')

  callRanges.editField('collectionSublibrary').name('collection-sublibrary')
  callRanges.name('CollectionCallRanges')
}

module.exports = forward
