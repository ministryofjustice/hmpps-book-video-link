import type { ValidationError } from '../../middleware/validationMiddleware'

export const errorTypes = {
  missingMainLocation: {
    text: 'Select a prison room for the court hearing video link',
    href: '#selectMainAppointmentLocation',
  },
  preLocation: {
    missing: {
      text: 'Select a prison room for the pre-court hearing briefing',
      href: '#selectPreAppointmentLocation',
    },
    different: {
      text: 'Select a different room for the pre-court hearing to the room for the court hearing briefing',
      href: '#selectPreAppointmentLocation',
    },
  },
  postLocation: {
    missing: {
      text: 'Select a prison room for the post-court hearing briefing',
      href: '#selectPostAppointmentLocation',
    },
    different: {
      text: 'Select a different room for the post-court hearing to the room for the court hearing briefing',
      href: '#selectPostAppointmentLocation',
    },
  },
  commentLength: {
    text: 'Maximum length should not exceed 3600 characters',
    href: '#comment',
  },
}

export default function validate(form: Record<string, string>): ValidationError[] {
  const {
    preAppointmentRequired,
    postAppointmentRequired,
    selectPreAppointmentLocation,
    selectPostAppointmentLocation,
    selectMainAppointmentLocation,
    comment,
  } = form

  const errors: ValidationError[] = []

  if (!selectMainAppointmentLocation) errors.push(errorTypes.missingMainLocation)
  if (preAppointmentRequired === 'true' && !selectPreAppointmentLocation) errors.push(errorTypes.preLocation.missing)
  if (postAppointmentRequired === 'true' && !selectPostAppointmentLocation) errors.push(errorTypes.postLocation.missing)
  if (comment && comment.length > 3600) errors.push(errorTypes.commentLength)

  if (
    preAppointmentRequired === 'true' &&
    selectPreAppointmentLocation &&
    selectMainAppointmentLocation &&
    selectPreAppointmentLocation === selectMainAppointmentLocation
  ) {
    errors.push(errorTypes.preLocation.different)
  }

  if (
    postAppointmentRequired === 'true' &&
    selectMainAppointmentLocation &&
    selectPostAppointmentLocation &&
    selectPostAppointmentLocation === selectMainAppointmentLocation
  ) {
    errors.push(errorTypes.postLocation.different)
  }

  return errors
}
