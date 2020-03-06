const forward = async (migration, { makeRequest }) => {
  // Fetch all buildings so we can use their titles during migration
  const buildings = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=building&limit=1000`
  })
  // Some of the floors have a prefix that slightly differs from the building's name. Include those prefixes here
  // and they will be removed, regardless of what the building's title is.
  const banList = ['Geddes Hall', 'Mendoza', 'LaFortune', 'London', 'Tantur', 'Hesburgh Center', 'Rome Global Gateway', 'Hayes-Healy', 'Reyniers', 'Nieuwland']

  migration.transformEntries({
    contentType: 'floor',
    from: ['title', 'floorNumber', 'building'],
    to: ['title', 'floorNumber'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.building || !fromFields.building[currentLocale]) {
        console.log('INVALID:', fromFields.title[currentLocale])
        return
      }

      const oldTitle = fromFields.title[currentLocale]
      let newTitle = oldTitle
      let floorNumber

      // Check for building and remove the building's name from the title
      const match = buildings.items.find(building => building.sys.id === fromFields.building[currentLocale].sys.id)
      if (!match) {
        console.log('Unable to find matching building for item:', fromFields.title[currentLocale])
        return
      } else {
        // Remove the building title itself
        newTitle = newTitle.replace(match.fields.title[currentLocale], '').trim()
        // Also remove all terms in the banList, which are basically variations on the building titles
        banList.forEach(term => {
          newTitle = newTitle.replace(term, '').trim()
        })
      }

      // Look through the titles for a number and use that to populate the floor number field
      const matches = newTitle.match(/\d+/g)
      floorNumber = newTitle.includes('Lower Level') ? -1 : (matches ? parseInt(matches[0]) : null)

      if (newTitle === oldTitle) {
        if (!floorNumber || (fromFields.floorNumber && floorNumber === fromFields.floorNumber[currentLocale])) {
          console.log('UNMODIFIED:', oldTitle)
          return // Do not republish if title was not changed
        } else {
          console.log('Adding floor number:', oldTitle, '=', floorNumber)
        }
      } else {
        console.log('Converting:', oldTitle, '–>', newTitle)
      }
      return {
        title: newTitle,
        floorNumber,
      }
    }
  })
}

const reverse = async (migration, { makeRequest }) => {
  // We can't exactly restore the titles from before migration, but this is as close as we can get
  // Fetch all buildings so we can use their titles during migration
  const buildings = await makeRequest({
    method: 'GET',
    url: `/entries?content_type=building&limit=1000`
  })

  migration.transformEntries({
    contentType: 'floor',
    from: ['title', 'floorNumber', 'building'],
    to: ['title', 'floorNumber'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      if (!fromFields.building || !fromFields.building[currentLocale]) {
        console.log('INVALID:', fromFields.title[currentLocale])
        return
      }

      const oldTitle = fromFields.title[currentLocale]
      let newTitle = oldTitle

      // Check for building and remove the building's name from the title
      const match = buildings.items.find(building => building.sys.id === fromFields.building[currentLocale].sys.id)
      if (!match) {
        console.log('Unable to find matching building for item:', fromFields.title[currentLocale])
        return
      } else {
        newTitle = match.fields.title[currentLocale] + ' ' + oldTitle
      }

      return {
        title: newTitle,
        floorNumber: null,
      }
    }
  })
}

module.exports = forward
