// This field will update dynamically depending on entry specifics. It may add extra UI controls, but all of the
// data ultimately gets stored in a single json field on the backend.
import React from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import {
  FieldGroup,
  Option,
  SelectField,
} from '@contentful/forma-36-react-components'
import KeyValueList from '../Fields/KeyValueList'

const ExtraData = (props) => {
  const extraFields = []

  const onFieldChange = (key, value) => {
    const newObj = {
      target: {
        value: {
          ...typy(props, 'value').safeObjectOrEmpty,
          [key]: value,
        },
      },
    }
    props.onChange(newObj)
  }

  const validContentTypes = props.sdk.entry.fields.contentTypes.getValue() || []
  if (validContentTypes.includes('person')) {
    const presenterFieldId = 'presenterType'
    extraFields.push({
      id: presenterFieldId,
      required: true,
      children: (
        <SelectField
          id={presenterFieldId}
          name={presenterFieldId}
          labelText='Presenter Type'
          value={typy(props.value, presenterFieldId).safeString}
          onChange={(event) => onFieldChange(presenterFieldId, event.target.value)}
        >
          <Option value=''>Choose a value</Option>
          <Option value='Instructor'>Instructor</Option>
          <Option value='Presenter'>Presenter</Option>
          <Option value='Speaker'>Speaker</Option>
          <Option value='Keynote'>Keynote</Option>
          <Option value='Facilitator'>Facilitator</Option>
          <Option value='Moderator'>Moderator</Option>
          <Option value='Convener'>Convener</Option>
          <Option value='Panelist'>Panelist</Option>
          <Option value='Discussant'>Discussant</Option>
        </SelectField>
      )
    })
  }

  // Always include a catch-all field for additional properties
  const exclude = extraFields.map(field => field.id)
  extraFields.push({
    id: 'extraData',
    children: <KeyValueList control={props.control} value={props.value} onChange={props.onChange} exclude={exclude} />
  })

  return (
    <React.Fragment>
      {extraFields.map(extraField => (
        <FieldGroup className='f36-margin--l fieldGroup' key={extraField.id}>
          {extraField.children}
        </FieldGroup>
      ))}
    </React.Fragment>
  )
}

ExtraData.propTypes = {
  sdk: PropTypes.shape({
    entry: PropTypes.shape({
      fields: PropTypes.shape({
        contentTypes: PropTypes.shape({
          getValue: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  control: PropTypes.shape({
    fieldId: PropTypes.string.isRequired,
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
}

export default ExtraData
