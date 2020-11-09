import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { t as typy } from 'typy'
import {
  Button,
  FormLabel,
  HelpText,
  IconButton,
  Modal,
  TextInput,
  Tooltip,
  ValidationMessage,
} from '@contentful/forma-36-react-components'

const LockedTextField = (props) => {
  const sys = props.entry.getSys()

  const [published, setPublished] = useState(!!sys.publishedVersion)
  const [locked, setLocked] = useState(published)
  const [showModal, setShowModal] = useState(false)
  const id = props.control.fieldId

  const dismissModal = () => {
    setShowModal(false)
  }
  const unlock = () => {
    setLocked(false)
    dismissModal()
  }

  props.entry.onSysChanged((newSys) => {
    if (!published && newSys.publishedVersion) {
      setPublished(true)
      setLocked(true)
    }
  })

  return (
    <React.Fragment>
      <FormLabel htmlFor={id} required={props.control.field.required}>
        {props.control.field.name}
      </FormLabel>
      {locked && (
        <Tooltip content='Unlock published field'>
          <IconButton
            buttonType='primary'
            label='Unlock published field'
            iconProps={{
              icon: 'Lock',
              size: 'medium',
              className: 'lockButton',
            }}
            testId='unlock-button'
            onClick={() => setShowModal(true)}
          />
        </Tooltip>
      )}
      {props.validationMessage && (
        <ValidationMessage>
          {props.validationMessage}
        </ValidationMessage>
      )}
      <TextInput
        id={id}
        name={id}
        type='text'
        value={props.value}
        onChange={props.onChange}
        disabled={locked}
        autoComplete='off'
        data-lpignore={true}
      />
      {typy(props.control, 'settings.helpText').safeString && (
        <HelpText>
          {props.control.settings.helpText}
        </HelpText>
      )}
      <Modal title='Unlock published field' isShown={showModal} onClose={dismissModal}>
        {() => (
          <React.Fragment>
            <Modal.Header title='Warning! Changing a published entry ID field' />
            <Modal.Content>
              Changing this field can cause problems for any applications currently using it.
              <br /><br />
              If published, your content will not show correctly until your applications are updated to consume the new ID.
            </Modal.Content>
            <Modal.Controls>
              <Button buttonType='primary' onClick={unlock}>
                Unlock field for editing
              </Button>
              <Button buttonType='muted' onClick={dismissModal}>
                Cancel
              </Button>
            </Modal.Controls>
          </React.Fragment>
        )}
      </Modal>
    </React.Fragment>
  )
}

LockedTextField.propTypes = {
  entry: PropTypes.shape({
    onSysChanged: PropTypes.func.isRequired,
  }).isRequired,
  control: PropTypes.shape({
    fieldId: PropTypes.string.isRequired,
    field: PropTypes.object.isRequired,
    settings: PropTypes.object,
  }).isRequired,
  type: PropTypes.oneOf(['number', 'date', 'time', 'text', 'password', 'email', 'search', 'url']),
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  validationMessage: PropTypes.string,
}

LockedTextField.defaultProps = {
  type: 'text',
}

export default LockedTextField
