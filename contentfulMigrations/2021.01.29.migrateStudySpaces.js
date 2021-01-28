const forward = (migration) => {
  const space = migration.editContentType('space')
  space.editField('features')
    .items({
      type: 'Symbol',
      validations: [
        {
          in: [
            'Conversation allowed',
            'Group study',
            'Individual study',
            'Multimedia available',
            'Computers',
            'Open late',
            'Quiet study',
            'Whiteboard access',
            'Whiteboard',
            'Natural Light',
          ],
        },
      ],
    })

  migration.transformEntries({
    contentType: 'space',
    from: ['features'],
    to: ['features'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      // If there are no features, don't change it
      if (!fromFields.features || !fromFields.features[currentLocale]) {
        return
      }

      let outFeatures = fromFields.features[currentLocale]
      if (outFeatures.includes('Multimedia available')) {
        outFeatures.push('Computers')
      }
      if (outFeatures.includes('Whiteboard access')) {
        outFeatures.push('Whiteboard')
      }
      outFeatures = outFeatures.filter(feat => feat != 'Open late')

      return {
        features: outFeatures,
      }
    }
  })

  space.editField('features')
    .items({
      type: 'Symbol',
      validations: [
        {
          in: [
            'Conversation allowed',
            'Group study',
            'Individual study',
            'Computers',
            'Open late',
            'Quiet study',
            'Whiteboard',
            'Natural Light',
          ],
        },
      ],
    })
}

const reverse = (migration) => {
  const space = migration.editContentType('space')
  space.editField('features')
    .items({
      type: 'Symbol',
      validations: [
        {
          in: [
            'Conversation allowed',
            'Group study',
            'Individual study',
            'Multimedia available',
            'Computers',
            'Open late',
            'Quiet study',
            'Whiteboard access',
            'Whiteboard',
            'Natural Light',
          ],
        },
      ],
    })

  migration.transformEntries({
    contentType: 'space',
    from: ['features'],
    to: ['features'],
    transformEntryForLocale: (fromFields, currentLocale) => {
      // If there are no features, don't change it
      if (!fromFields.features || !fromFields.features[currentLocale]) {
        return
      }

      let outFeatures = fromFields.features[currentLocale]
      if (outFeatures.includes('Computers')) {
        outFeatures.push('Multimedia available')
      }
      if (outFeatures.includes('Whiteboard')) {
        outFeatures.push('Whiteboard access')
      }

      return {
        features: outFeatures,
      }
    }
  })

  space.editField('features')
    .items({
      type: 'Symbol',
      validations: [
        {
          in: [
            'Conversation allowed',
            'Group study',
            'Individual study',
            'Multimedia available',
            'Open late',
            'Quiet study',
            'Whiteboard access',
            'Natural Light',
          ],
        },
      ],
    })
}

module.exports = forward