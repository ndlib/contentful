import React from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import {
  Card,
  CardDragHandle,
  DropdownList,
  DropdownListItem,
  EntryCard,
  IconButton,
  SectionHeading,
} from '@contentful/forma-36-react-components'

const getPublishStatus = (entry) => {
  if (entry.sys.archivedAt) {
    return 'archived'
  } else if (!entry.sys.publishedAt) {
    return 'draft'
  } else if (new Date(entry.sys.updatedAt).getTime() > new Date(entry.sys.publishedAt).getTime() + (1000 * 2)) {
    // Room for a little slop here.. Sometimes the updated at date is a few miliseconds after the published date,
    // even though the last change was the publish itself.
    return 'changed'
  }

  return 'published'
}

const DragHandle = SortableHandle(() => <CardDragHandle>Reorder item</CardDragHandle>)

const SortableEntry = SortableElement(props => <div>{props.children}</div>)

export const SortableList = SortableContainer(props => {
  return (
    <div id={props.fieldId} name={props.fieldId} className='entryList'>
      {props.entries.map((entry, index) => entry.sys ? (
        <SortableEntry key={`${entry.sys.id}-${index}`} index={index}>
          <EntryCard
            title={typy(entry.fields, `${props.typeDetails[entry.sys.contentType.sys.id].titleField}[en-US]`).safeString}
            status={getPublishStatus(entry)}
            contentType={props.typeDetails[entry.sys.contentType.sys.id].name}
            size='small'
            className='entryCard'
            withDragHandle
            cardDragHandleComponent={<DragHandle />}
            onClick={() => props.onEdit(entry.sys.id)}
            dropdownListElements={(
              <DropdownList>
                <DropdownListItem onClick={() => props.onEdit(entry.sys.id)}>Edit</DropdownListItem>
                <DropdownListItem onClick={() => props.onRemove(entry.sys.id)}>Remove</DropdownListItem>
              </DropdownList>
            )}
          />
        </SortableEntry>
      ) : (
        <SortableEntry key={`${entry}-${index}`} index={index}>
          <Card key={entry} style={{ position: 'relative' }}>
            <SectionHeading>ENTRY IS MISSING OR INACCESSIBLE</SectionHeading>
            <IconButton
              buttonType='muted'
              className='missingEntryDelete'
              label='Delete'
              iconProps={{
                icon: 'Close',
                size: 'small',
              }}
              testId='delete-entry-button'
              onClick={() => props.onRemove(entry)}
            />
          </Card>
        </SortableEntry>
      ))}
    </div>
  )
})

SortableList.propTypes = {
  fieldId: PropTypes.string,
  entries: PropTypes.array,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  typeDetails: PropTypes.object,
}

export default SortableList