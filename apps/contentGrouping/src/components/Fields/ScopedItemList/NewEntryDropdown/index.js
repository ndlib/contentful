import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import {
  Dropdown,
  DropdownList,
  DropdownListItem,
  Icon,
  TextLink,
} from '@contentful/forma-36-react-components'

const NewEntryDropdown = (props) => {
  const [open, setOpen] = useState(false)

  const createEntry = (contentType) => {
    setOpen(false)
    props.navigator.openNewEntry(contentType, { slideIn: { waitForClose: true }}).then(created => {
      props.onCreate(created.entity)
    })
  }

  return (
    <Dropdown
      key={props.types}
      isOpen={open}
      onClose={() => setOpen(false)}
      toggleElement={(
        <TextLink linkType='primary' icon='Plus' onClick={() => setOpen(!open)}>
          Create new entry and link<Icon icon='ChevronDown' className='linkTextIcon' />
        </TextLink>
      )}
    >
      <DropdownList>
        <DropdownListItem isTitle>Content Types</DropdownListItem>
        {typy(props.types).safeArray.map(contentType => (
          <DropdownListItem key={contentType} onClick={() => createEntry(contentType)}>
            {typy(props, `typeDetails.${contentType}.name`).safeString}
          </DropdownListItem>
        ))}
      </DropdownList>
    </Dropdown>
  )
}

NewEntryDropdown.propTypes = {
  types: PropTypes.array,
  typeDetails: PropTypes.object,
  navigator: PropTypes.shape({
    openNewEntry: PropTypes.func.isRequired,
  }).isRequired,
  onCreate: PropTypes.func.isRequired,
}

export default NewEntryDropdown
