import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import arrayMove from 'array-move'
import {
  FormLabel,
  HelpText,
  Paragraph,
  Spinner,
  TextLink,
  ValidationMessage,
} from '@contentful/forma-36-react-components'
import NewEntryDropdown from './NewEntryDropdown'
import SortableList from './SortableList'

const ScopedItemList = (props) => {
  const references = props.items || []
  const [fullEntries, setFullEntries] = useState(null)

  const update = useCallback((entryArray) => {
      // References is just the sys from the full entries
      const newRefs = entryArray.filter(entry => entry.sys).map(entry => ({
        sys: {
          id: entry.sys.id,
          linkType: entry.sys.type,
          type: 'Link',
        },
      }))
      props.onChange({
        target: {
          value: newRefs,
        },
      })

      setFullEntries([...entryArray])
    },
    [props],
)

  const onSortStart = useCallback((_, event) => event.preventDefault(), [])
  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }) => {
      if (newIndex !== oldIndex) {
        const newItems = arrayMove(fullEntries, oldIndex, newIndex)
        update(newItems)
      }
    },
    [fullEntries, update],
  )

  // First we have to look up the full items that are referenced, because the sdk only returns the sys values
  if (fullEntries === null) {
    const entryIds = references.map(reference => typy(reference, 'sys.id').safeString)
    props.space.getEntries({
      'sys.id[in]': entryIds.join(','),
      limit: 1000,
    }).then(response => {
      const items = typy(response, 'items').safeArray
      const allEntries = []
      // Loop through the references and append items because we want to maintain that order
      references.forEach(reference => {
        const entry = items.find(item => item.sys.id === reference.sys.id)
        if (entry) {
          allEntries.push(entry)
        } else {
          // Push just the entry id so it will show up in the list and allow us to remove it
          allEntries.push(reference.sys.id)
        }
      })
      update(allEntries)
    })
  }

  const editEntry = (id) => {
    props.navigator.openEntry(id, { slideIn: { waitForClose: true }}).then(updated => {
      // Update the information by replacing the array item
      if (updated.entity) {
        const existingIndex = fullEntries.findIndex(full => ((full && full.sys) ? full.sys.id === updated.entity.sys.id : full))
        if (existingIndex >= 0) {
          fullEntries.splice(existingIndex, 1, updated.entity)
          update(fullEntries)
        }
      } else {
        removeEntry(id)
      }
    })
  }

  const removeEntry = (id) => {
    const existingIndex = fullEntries.findIndex(full => (full.sys ? full.sys.id : full) === id)
    if (existingIndex >= 0) {
      fullEntries.splice(existingIndex, 1)
      update(fullEntries)
    }
  }

  const addEntries = (newEntries) => {
    const newList = fullEntries.concat(typy(newEntries).safeArray)
    update(newList)
  }

  const linkEntries = () => {
    if (!props.types.length) {
      props.dialogs.openAlert({
        title: 'Select content types',
        message: 'Please select from the list of content types first.',
        confirmLabel: 'Okay',
      })
      return
    }
    props.dialogs.selectMultipleEntries({ contentTypes: props.types }).then(entries => {
      if (typy(entries).isArray) {
        // Only add entries which aren't already part of the list.
        const newEntries = entries.filter(entry => !fullEntries.some(compare => compare.sys.id === entry.sys.id))
        const newList = fullEntries.concat(newEntries)
        update(newList)
      }
    })
  }

  // Map content type ids to an object so they are easier to look up later
  // Also do the same for the
  const contentTypes = props.space.getCachedContentTypes()
  const typeMap = {}
  contentTypes.forEach(contentType => {
    typeMap[contentType.sys.id] = {
      name: contentType.name,
      titleField: contentType.displayField
    }
  })

  return (
    <React.Fragment>
      <FormLabel htmlFor={props.control.fieldId} required={props.control.field.required}>
        {props.control.field.name}
      </FormLabel>
      {props.validationMessage && (
        <ValidationMessage>
          {props.validationMessage}
        </ValidationMessage>
      )}
      {fullEntries === null ? (
        <div>
          <Spinner size='large' /> <Paragraph className='loadingText'>Loading item list...</Paragraph>
        </div>
      ) : (
        <div className='entryList'>
          <SortableList
            fieldId={props.control.fieldId}
            entries={fullEntries}
            onEdit={editEntry}
            onRemove={removeEntry}
            typeDetails={typeMap}
            useDragHandle
            axis='y'
            onSortStart={onSortStart}
            onSortEnd={onSortEnd}
          />
          <NewEntryDropdown types={props.types} typeDetails={typeMap} navigator={props.navigator} onCreate={addEntries} />
          <span style={{ marginRight: '2rem' }} />
          <TextLink linkType='primary' icon='Link' onClick={linkEntries}>
            Link existing entries
          </TextLink>
        </div>
      )}
      {typy(props.control, 'settings.helpText').safeString && (
        <HelpText>
          {props.control.settings.helpText}
        </HelpText>
      )}
    </React.Fragment>
  )
}

ScopedItemList.propTypes = {
  dialogs: PropTypes.shape({
    selectMultipleEntries: PropTypes.func.isRequired,
  }).isRequired,
  navigator: PropTypes.shape({
    openEntry: PropTypes.func.isRequired,
  }).isRequired,
  space: PropTypes.shape({
    getEntries: PropTypes.func.isRequired,
  }).isRequired,
  control: PropTypes.shape({
    fieldId: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    settings: PropTypes.object,
  }).isRequired,
  items: PropTypes.array,
  types: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
}

export default ScopedItemList