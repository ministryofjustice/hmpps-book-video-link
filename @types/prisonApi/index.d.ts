/* eslint-disable camelcase */
declare module 'prisonApi' {
  export type OffenderBooking = schemas['OffenderBooking']
  export type Location = schemas['Location']
  export type Prison = schemas['PrisonContactDetail']
  export type InmateDetail = schemas['InmateDetail']
  export type PrisonerDetail = schemas['PrisonerDetail']
  export type PrisonContactDetail = schemas['PrisonContactDetail']
  export type Agency = schemas['Agency']

  interface schemas {
    /**
     * Access Role
     */
    AccessRole: {
      /**
       * role code of the parent role
       */
      parentRoleCode?: string
      /**
       * unique code for the access role
       */
      roleCode: string
      /**
       * ADMIN or GENERAL
       */
      roleFunction?: string
      /**
       * internal role id
       */
      roleId?: number
      /**
       * name of the access role
       */
      roleName?: string
    }
    /**
     * Prisoner Account Balance
     */
    Account: {
      /**
       * Cash sub account balance.
       */
      cash: number
      /**
       * Currency of these balances.
       */
      currency: string
      /**
       * Damage obligation balance.
       */
      damageObligations: number
      /**
       * Saves sub account balance.
       */
      savings: number
      /**
       * Spends sub account balance.
       */
      spends: number
    }
    /**
     * Account Balance
     */
    AccountBalance: {
      /**
       * Cash balance
       */
      cash?: number
      /**
       * Saving balance
       */
      savings?: number
      /**
       * Spends balance
       */
      spends?: number
    }
    /**
     * Account Transaction
     */
    AccountTransaction: {
      /**
       * Amount in pence
       */
      amount: number
      /**
       * Date of the transaction
       */
      date: string
      /**
       * Transaction description
       */
      description: string
      /**
       * Transaction ID
       */
      id: string
      /**
       * The type of transaction
       */
      type: components['schemas']['CodeDescription']
    }
    /**
     * Account Transactions
     */
    AccountTransactions: {
      /**
       * List of account transactions
       */
      transactions?: components['schemas']['AccountTransaction'][]
    }
    /**
     * Active Offender
     */
    ActiveOffender: {
      /**
       * found
       */
      found?: boolean
      /**
       * offender
       */
      offender?: components['schemas']['OffenderId']
    }
    /**
     * An Offender's Address
     */
    AddressDto: {
      /**
       * Address Type
       */
      addressType?: string
      /**
       * The address usages/types
       */
      addressUsages?: components['schemas']['AddressUsageDto'][]
      /**
       * Comment
       */
      comment?: string
      /**
       * Country
       */
      country?: string
      /**
       * County
       */
      county?: string
      /**
       * Date ended
       */
      endDate?: string
      /**
       * Flat
       */
      flat?: string
      /**
       * Locality
       */
      locality?: string
      /**
       * No Fixed Address
       */
      noFixedAddress: boolean
      /**
       * The phone number associated with the address
       */
      phones?: components['schemas']['Telephone'][]
      /**
       * Postal Code
       */
      postalCode?: string
      /**
       * Premise
       */
      premise?: string
      /**
       * Primary Address
       */
      primary: boolean
      /**
       * Date Added
       */
      startDate?: string
      /**
       * Street
       */
      street?: string
      /**
       * Town
       */
      town?: string
    }
    /**
     * An Offender's address usage
     */
    AddressUsageDto: {
      activeFlag?: boolean
      addressId?: number
      addressUsage?: string
      addressUsageDescription?: string
    }
    /**
     * An overview of an adjudication
     */
    Adjudication: {
      /**
       * Charges made as part of the adjudication
       */
      adjudicationCharges?: components['schemas']['AdjudicationCharge'][]
      /**
       * Adjudication Number
       */
      adjudicationNumber?: number
      /**
       * Agency Id
       */
      agencyId?: string
      /**
       * Agency Incident Id
       */
      agencyIncidentId?: number
      /**
       * Party Sequence
       */
      partySeq?: number
      /**
       * Report Time
       */
      reportTime?: string
    }
    /**
     * A charge which was made as part of an adjudication
     */
    AdjudicationCharge: {
      /**
       * Offence Finding Code
       */
      findingCode?: string
      /**
       * Offence Code
       */
      offenceCode?: string
      /**
       * Offence Description
       */
      offenceDescription?: string
      /**
       * Charge Id
       */
      oicChargeId?: string
    }
    /**
     * Detail about an individual Adjudication
     */
    AdjudicationDetail: {
      /**
       * Adjudication Number
       */
      adjudicationNumber?: number
      /**
       * Establishment
       */
      establishment?: string
      /**
       * Hearings
       */
      hearings?: components['schemas']['Hearing'][]
      /**
       * Incident Details
       */
      incidentDetails?: string
      /**
       * Incident Time
       */
      incidentTime?: string
      /**
       * Interior Location
       */
      interiorLocation?: string
      /**
       * Report Number
       */
      reportNumber?: number
      /**
       * Report Time
       */
      reportTime?: string
      /**
       * Report Type
       */
      reportType?: string
      /**
       * Reporter First Name
       */
      reporterFirstName?: string
      /**
       * Reporter Last Name
       */
      reporterLastName?: string
    }
    /**
     * A type of offence that can be made as part of an adjudication
     */
    AdjudicationOffence: {
      /**
       * Offence Code
       */
      code?: string
      /**
       * Offence Description
       */
      description?: string
      /**
       * Offence Id
       */
      id?: string
    }
    AdjudicationSearchResponse: {
      /**
       * Complete list of agencies where this offender has had adjudications
       */
      agencies?: components['schemas']['Agency'][]
      /**
       * A complete list of the type of offences that this offender has had adjudications for
       */
      offences?: components['schemas']['AdjudicationOffence'][]
      /**
       * Search results
       */
      results?: components['schemas']['Adjudication'][]
    }
    /**
     * Adjudication Summary for offender
     */
    AdjudicationSummary: {
      /**
       * Number of proven adjudications
       */
      adjudicationCount: number
      /**
       * List of awards / sanctions
       */
      awards: components['schemas']['Award'][]
      /**
       * Offender Booking Id
       */
      bookingId: number
    }
    /**
     * Agency Details
     */
    Agency: {
      /**
       * Agency is active
       */
      active?: boolean
      /**
       * Agency identifier.
       */
      agencyId: string
      /**
       * Agency type.
       */
      agencyType: string
      /**
       * Agency description.
       */
      description: string
      /**
       * Agency  long description.
       */
      longDescription: string
    }
    /**
     * Agency Establishment Type
     */
    AgencyEstablishmentType: {
      /**
       * Code.
       */
      code: string
      /**
       * Description.
       */
      description: string
    }
    /**
     * Agency Establishment Types
     */
    AgencyEstablishmentTypes: {
      /**
       * Agency id
       */
      agencyId: string
      /**
       * The establishment types for the agency.
       */
      establishmentTypes?: components['schemas']['AgencyEstablishmentType'][]
    }
    /**
     * Alert
     */
    Alert: {
      /**
       * True / False based on alert status
       */
      active: boolean
      /**
       * First name of the user who added the alert
       */
      addedByFirstName?: string
      /**
       * Last name of the user who added the alert
       */
      addedByLastName?: string
      /**
       * Alert Code
       */
      alertCode: string
      /**
       * Alert Code Description
       */
      alertCodeDescription: string
      /**
       * Alert Id
       */
      alertId: number
      /**
       * Alert Type
       */
      alertType: string
      /**
       * Alert Type Description
       */
      alertTypeDescription: string
      /**
       * Offender booking id.
       */
      bookingId: number
      /**
       * Alert comments
       */
      comment: string
      /**
       * Date the alert was created
       */
      dateCreated: string
      /**
       * Date the alert expires
       */
      dateExpires?: string
      /**
       * True / False based on presence of expiry date
       */
      expired: boolean
      /**
       * First name of the user who expired the alert
       */
      expiredByFirstName?: string
      /**
       * Last name of the user who expired the alert
       */
      expiredByLastName?: string
      /**
       * Offender Unique Reference
       */
      offenderNo: string
    }
    /**
     * Update an alert
     */
    AlertChanges: {
      /**
       * Alert comment
       */
      comment?: string
      /**
       * Date the alert became inactive
       */
      expiryDate?: string
    }
    AlertCreated: { alertId?: number }
    /**
     * Offender Alert
     */
    AlertV1: {
      /**
       * Date the alert became effective
       */
      alert_date: string
      /**
       * Code and description identifying the sub type of alert
       */
      alert_sub_type: components['schemas']['CodeDescription']
      /**
       * Code and description identifying the type of alert
       */
      alert_type: components['schemas']['CodeDescription']
      /**
       * Free Text Comment
       */
      comment?: string
      /**
       * Alert Type
       */
      expiry_date?: string
      /**
       * ACTIVE or INACTIVE (Inactive alerts will have a expiry date of today or earlier
       */
      status?: 'ACTIVE' | 'INACTIVE'
    }
    /**
     * Alerts
     */
    Alerts: {
      /**
       * Alerts
       */
      alerts?: components['schemas']['AlertV1'][]
    }
    /**
     * Alias
     */
    Alias: {
      /**
       * Age of Offender
       */
      age: number
      /**
       * Date of creation
       */
      createDate: string
      /**
       * Date of Birth of Offender
       */
      dob: string
      /**
       * Ethnicity
       */
      ethnicity?: string
      /**
       * First name of offender alias
       */
      firstName: string
      /**
       * Gender
       */
      gender: string
      /**
       * Last name of offender alias
       */
      lastName: string
      /**
       * Middle names of offender alias
       */
      middleName?: string
      /**
       * Type of Alias
       */
      nameType?: string
    }
    /**
     * Default values to be applied when creating each appointment
     */
    AppointmentDefaults: {
      /**
       * The scheduled event subType
       */
      appointmentType: string
      /**
       * A comment that applies to all the appointments in this request.
       */
      comment?: string
      /**
       * The date and time at which the appointments end. ISO 8601 Date-time format. endTime, if present, must be later than startTime.
       */
      endTime?: string
      /**
       * The identifier of the appointments' Location. The location must be situated in the requestor's case load.
       */
      locationId: number
      /**
       * The date and time at which the appointments start. ISO 8601 Date-time format. startTime must be in the future.
       */
      startTime: string
    }
    /**
     * Detail for creating an appointment for a particular bookingId where values should differ from the defaults
     */
    AppointmentDetails: {
      /**
       * The Booking id of the offender for whom the appointment is to be created.
       */
      bookingId: number
      /**
       * The Appointment's details. When present this value replaces the default comment.
       */
      comment?: string
      /**
       * A replacement for the default endTime. ISO 8601 date-time format.  This value, when present, must be later than the default startTime, or the startTime in this object if it is defined.
       */
      endTime?: string
      /**
       * A replacement for the default startTime. ISO 8601 date-time format.  This value, when present, must be in the future.
       */
      startTime?: string
    }
    /**
     * Details for creating appointments in bulk
     */
    AppointmentsToCreate: {
      /**
       * The default values to be applied to each new appointment. An individual appointment may change the startTime, add or change the endTime and provide text for that appointment's comment.
       */
      appointmentDefaults: components['schemas']['AppointmentDefaults']
      /**
       * The details for creating each appointment.  A Missing value falls back to the default value if present. Mandatory, but an empty list is accepted.
       */
      appointments: components['schemas']['AppointmentDetails'][]
      /**
       * If present specifies the number of times to repeat the appointments and the period of the repeat
       */
      repeat?: components['schemas']['Repeat']
    }
    /**
     * HDC Approval Status
     */
    ApprovalStatus: {
      /**
       * Approval status. Must be one of the 'HDC_APPROVE' reference codes
       */
      approvalStatus: string
      /**
       * Approval status date. ISO-8601 format. YYYY-MM-DD
       */
      date: string
      /**
       * Refused reason. Must be one of the 'HDC_REJ_RSN' reference codes
       */
      refusedReason?: string
    }
    /**
     * Assessment
     */
    Assessment: {
      /**
       * Date of assessment approval
       */
      approvalDate?: string
      /**
       * The assessment creation agency id
       */
      assessmentAgencyId?: string
      /**
       * Identifies the type of assessment
       */
      assessmentCode?: string
      /**
       * Comment from assessor
       */
      assessmentComment?: string
      /**
       * Date assessment was created
       */
      assessmentDate?: string
      /**
       * Assessment description
       */
      assessmentDescription?: string
      /**
       * Sequence number of assessment within booking
       */
      assessmentSeq?: number
      /**
       * The status of the assessment
       */
      assessmentStatus?: 'A' | 'I' | 'P'
      /**
       * Staff member who made the assessment
       */
      assessorId?: number
      /**
       * Username who made the assessment
       */
      assessorUser?: string
      /**
       * Booking number
       */
      bookingId?: number
      /**
       * Indicates the presence of a cell sharing alert
       */
      cellSharingAlertFlag?: boolean
      /**
       * Classification description
       */
      classification?: string
      /**
       * Classification code
       */
      classificationCode?: string
      /**
       * Date of next review
       */
      nextReviewDate?: string
      /**
       * Offender number (e.g. NOMS Number).
       */
      offenderNo?: string
    }
    /**
     * Assigned Living Unit
     */
    AssignedLivingUnit: {
      /**
       * Agency Id
       */
      agencyId: string
      /**
       * Name of the agency where this living unit resides
       */
      agencyName: string
      /**
       * Living Unit Desc
       */
      description: string
      /**
       * location Id
       */
      locationId: number
    }
    /**
     * Available Dates
     */
    AvailableDates: {
      /**
       * Available Dates
       */
      dates?: string[]
    }
    /**
     * Adjudication award / sanction
     */
    Award: {
      /**
       * Optional details
       */
      comment?: string
      /**
       * Number of days duration
       */
      days?: number
      /**
       * Start of sanction
       */
      effectiveDate: string
      /**
       * Id of hearing
       */
      hearingId: number
      /**
       * hearing record sequence number
       */
      hearingSequence: number
      /**
       * Compensation amount
       */
      limit?: number
      /**
       * Number of months duration
       */
      months?: number
      /**
       * Type of award
       */
      sanctionCode: string
      /**
       * Award type description
       */
      sanctionCodeDescription?: string
      /**
       * Award status (ref domain OIC_SANCT_ST)
       */
      status?: string
      /**
       * Award status description
       */
      statusDescription?: string
    }
    /**
     * Sentence Details
     */
    BaseSentenceDetail: {
      /**
       * APD - the offender's actual parole date.
       */
      actualParoleDate?: string
      /**
       * ARD - calculated automatic (unconditional) release date for offender.
       */
      automaticReleaseDate?: string
      /**
       * CRD - calculated conditional release date for offender.
       */
      conditionalReleaseDate?: string
      /**
       * DPRRD - Detention training order post recall release date
       */
      dtoPostRecallReleaseDate?: string
      /**
       * ERSED - the date on which offender will be eligible for early removal (under the Early Removal Scheme for foreign nationals).
       */
      earlyRemovalSchemeEligibilityDate?: string
      /**
       * ETD - early term date for offender.
       */
      earlyTermDate?: string
      /**
       * Effective sentence end date
       */
      effectiveSentenceEndDate?: string
      /**
       * HDCAD - the offender's actual home detention curfew date.
       */
      homeDetentionCurfewActualDate?: string
      /**
       * HDCED - date on which offender will be eligible for home detention curfew.
       */
      homeDetentionCurfewEligibilityDate?: string
      /**
       * LTD - late term date for offender.
       */
      lateTermDate?: string
      /**
       * LED - date on which offender licence expires.
       */
      licenceExpiryDate?: string
      /**
       * MTD - mid term date for offender.
       */
      midTermDate?: string
      /**
       * NPD - calculated non-parole date for offender (relating to the 1991 act).
       */
      nonParoleDate?: string
      /**
       * PED - date on which offender is eligible for parole.
       */
      paroleEligibilityDate?: string
      /**
       * PRRD - calculated post-recall release date for offender.
       */
      postRecallReleaseDate?: string
      /**
       * ROTL - the date on which offender will be released on temporary licence.
       */
      releaseOnTemporaryLicenceDate?: string
      /**
       * SED - date on which sentence expires.
       */
      sentenceExpiryDate?: string
      /**
       * Date on which minimum term is reached for parole (indeterminate/life sentences).
       */
      tariffDate?: string
      /**
       * TERSED - Tariff early removal scheme eligibility date
       */
      tariffEarlyRemovalSchemeEligibilityDate?: string
      /**
       * TUSED - top-up supervision expiry date for offender.
       */
      topupSupervisionExpiryDate?: string
    }
    /**
     * Bed assignment history entry
     */
    BedAssignment: {
      /**
       * Agency of living unit
       */
      agencyId?: string
      /**
       * Date the offender was assigned to a living unit.
       */
      assignmentDate?: string
      /**
       * Date and time the offender was moved to a living unit.
       */
      assignmentDateTime?: string
      /**
       * Date an offender was moved out of the living unit
       */
      assignmentEndDate?: string
      /**
       * Date and time an offender was moved out of the living unit
       */
      assignmentEndDateTime?: string
      /**
       * Assignment reason code
       */
      assignmentReason?: string
      /**
       * Bed assignment sequence. Used as a primary key when combined with the booking id
       */
      bedAssignmentHistorySequence?: number
      /**
       * Unique, numeric booking id. Used as a primary key when combined with the bed assignment sequence
       */
      bookingId?: number
      /**
       * Description of living unit (e.g. cell)
       */
      description?: string
      /**
       * Identifier of living unit (e.g. cell) that offender is assigned to.
       */
      livingUnitId?: number
      /**
       * the staff member responsible for the movement of a prisoner
       */
      movementMadeBy?: string
    }
    /**
     * Offender Booking
     */
    Booking: {
      /**
       * Booking Active?
       */
      booking_active: boolean
      /**
       * End date of Booking
       */
      booking_ended?: string
      /**
       * Bookings
       */
      booking_no: string
      /**
       * Start Date of Booking
       */
      booking_started: string
      /**
       * Legal Cases
       */
      legal_cases?: components['schemas']['LegalCase'][]
      /**
       * Location of Offender
       */
      location?: components['schemas']['Location']
      /**
       * Release Date
       */
      release_date?: string
    }
    BookingActivity: { activityId?: number; bookingId?: number }
    /**
     * Bookings
     */
    Bookings: {
      /**
       * Bookings
       */
      bookings?: components['schemas']['Booking'][]
    }
    /**
     * Case Load
     */
    CaseLoad: {
      /**
       * Case Load ID
       */
      caseLoadId: string
      /**
       * Functional Use of the case load
       */
      caseloadFunction?: 'ADMIN' | 'GENERAL'
      /**
       * Indicates that this caseload in the context of a staff member is the current active
       */
      currentlyActive: boolean
      /**
       * Full description of the case load
       */
      description: string
      /**
       * Type of case load
       */
      type: 'APP' | 'COMM' | 'INST'
    }
    /**
     * Case Note
     */
    CaseNote: {
      /**
       * Agency Code where Case Note was made.
       */
      agencyId?: string
      /**
       * Ordered list of amendments to the case note (oldest first)
       */
      amendments: components['schemas']['CaseNoteAmendment'][]
      /**
       * Name of staff member who created case note (lastname, firstname)
       */
      authorName: string
      /**
       * Booking Id of offender
       */
      bookingId: number
      /**
       * Case Note Id (unique)
       */
      caseNoteId: number
      /**
       * Date and Time of Case Note creation
       */
      creationDateTime: string
      /**
       * Date and Time of when case note contact with offender was made
       */
      occurrenceDateTime: string
      /**
       * The initial case note information that was entered
       */
      originalNoteText: string
      /**
       * Source Type
       */
      source: string
      /**
       * Id of staff member who created case note
       */
      staffId: number
      /**
       * Case Note Sub Type
       */
      subType: string
      /**
       * Case Note Sub Type Description
       */
      subTypeDescription?: string
      /**
       * Case Note Text
       */
      text: string
      /**
       * Case Note Type
       */
      type: string
      /**
       * Case Note Type Description
       */
      typeDescription?: string
    }
    /**
     * Case Note Amendment
     */
    CaseNoteAmendment: {
      /**
       * Additional Case Note Information
       */
      additionalNoteText: string
      /**
       * Name of the user amending the case note (lastname, firstname)
       */
      authorName: string
      /**
       * Date and Time of Case Note creation
       */
      creationDateTime: string
    }
    /**
     * Case Note Count Detail
     */
    CaseNoteCount: {
      /**
       * Offender booking id
       */
      bookingId: number
      /**
       * Number of case notes of defined type and subType for offender.
       */
      count: number
      /**
       * Count includes case notes occurring on or after this date (in YYYY-MM-DD format).
       */
      fromDate?: string
      /**
       * Case note sub-type.
       */
      subType: string
      /**
       * Count includes case notes occurring on or before this date (in YYYY-MM-DD format).
       */
      toDate?: string
      /**
       * Case note type.
       */
      type: string
    }
    /**
     * Case Note Event
     */
    CaseNoteEvent: {
      /**
       * Date and Time of when case note contact with offender was made
       */
      contactTimestamp: string
      /**
       * Case Note Text
       */
      content: string
      /**
       * Agency Code where Case Note was made.
       */
      establishmentCode?: string
      /**
       * Case Note Id (unique)
       */
      id: number
      /**
       * Offender Noms Id
       */
      nomsId: string
      /**
       * Case Note Type and Sub Type
       */
      noteType: string
      /**
       * Date and Time of notification of event
       */
      notificationTimestamp: string
      /**
       * Name of staff member who created case note (lastname, firstname)
       */
      staffName: string
    }
    /**
     * Case Note Type Staff Usage
     */
    CaseNoteStaffUsage: {
      /**
       * Case Note Sub Type
       */
      caseNoteSubType: string
      /**
       * Case Note Type
       */
      caseNoteType: string
      /**
       * Last case note of this type
       */
      latestCaseNote: string
      /**
       * Number of case notes of this type/subtype
       */
      numCaseNotes: number
      /**
       * Staff ID
       */
      staffId: number
    }
    /**
     * Case Note Type Staff Usage Request
     */
    CaseNoteStaffUsageRequest: {
      /**
       * Only case notes occurring on or after this date (in YYYY-MM-DD format) will be considered.  If not defined then the numMonth before the current date, unless a toDate is defined when it will be numMonths before toDate
       */
      fromDate?: string
      /**
       * Number of month to look forward (if fromDate only defined), or back (if toDate only defined). Default is 1 month
       */
      numMonths?: number
      /**
       * a list of staff numbers to search.
       */
      staffIds: number[]
      /**
       * Case note sub-type.
       */
      subType?: string
      /**
       * Only case notes occurring on or before this date (in YYYY-MM-DD format) will be considered. If not defined then the current date will be used, unless a fromDate is defined when it will be numMonths after fromDate
       */
      toDate?: string
      /**
       * Case note type.
       */
      type?: string
    }
    /**
     * Case Note Type Usage
     */
    CaseNoteUsage: {
      /**
       * Case Note Sub Type
       */
      caseNoteSubType: string
      /**
       * Case Note Type
       */
      caseNoteType: string
      /**
       * Last case note of this type
       */
      latestCaseNote: string
      /**
       * Number of case notes of this type/subtype
       */
      numCaseNotes: number
      /**
       * Offender No
       */
      offenderNo: string
    }
    /**
     * Case Note Type Usage Request
     */
    CaseNoteUsageRequest: {
      /**
       * Optional agency Id to filter by
       */
      agencyId?: string
      /**
       * Only case notes occurring on or after this date (in YYYY-MM-DD format) will be considered.  If not defined then the numMonth before the current date, unless a toDate is defined when it will be numMonths before toDate
       */
      fromDate?: string
      /**
       * Number of month to look forward (if fromDate only defined), or back (if toDate only defined). Default is 1 month
       */
      numMonths?: number
      /**
       * a list of offender numbers to search.
       */
      offenderNos: string[]
      /**
       * staff Id to use in search (optional).
       */
      staffId?: number
      /**
       * Case note sub-type.
       */
      subType?: string
      /**
       * Only case notes occurring on or before this date (in YYYY-MM-DD format) will be considered. If not defined then the current date will be used, unless a fromDate is defined when it will be numMonths after fromDate
       */
      toDate?: string
      /**
       * Case note type.
       */
      type?: string
    }
    /**
     * Caseload Update
     */
    CaseloadUpdate: {
      /**
       * Caseload
       */
      caseload: string
      /**
       * Number of users enabled to access API
       */
      numUsersEnabled: number
    }
    /**
     * Categorisation detail for an offender
     */
    CategorisationDetail: {
      /**
       * Booking Id
       */
      bookingId: number
      /**
       * Category code
       */
      category: string
      /**
       * Initial categorisation comment
       */
      comment?: string
      /**
       * The assessment committee code (reference code in domain 'ASSESS_COMM')
       */
      committee: string
      /**
       * Next review date for recategorisation, defaults to current date + 6 months, if not provided
       */
      nextReviewDate?: string
      /**
       * The prison to be transferred to
       */
      placementAgencyId: string
    }
    /**
     * Categorisation detail for an offender
     */
    CategorisationUpdateDetail: {
      /**
       * Sequence number
       */
      assessmentSeq: number
      /**
       * Booking Id
       */
      bookingId: number
      /**
       * Category code
       */
      category?: string
      /**
       * Initial categorisation comment
       */
      comment?: string
      /**
       * The assessment committee code (reference code in domain 'ASSESS_COMM')
       */
      committee?: string
      /**
       * Next review date for recategorisation
       */
      nextReviewDate?: string
    }
    /**
     * Categorisation approval detail for an offender
     */
    CategoryApprovalDetail: {
      /**
       * Approved result category comment
       */
      approvedCategoryComment?: string
      /**
       * Approved placement prison
       */
      approvedPlacementAgencyId?: string
      /**
       * Approved placement prison comment
       */
      approvedPlacementText?: string
      /**
       * Sequence number. Only used to check consistency
       */
      assessmentSeq?: number
      /**
       * Booking Id
       */
      bookingId: number
      /**
       * Category code, reference code in domain 'SUP_LVL_TYPE'
       */
      category: string
      /**
       * Overall comment
       */
      committeeCommentText?: string
      /**
       * Date of approval
       */
      evaluationDate: string
      /**
       * Next review date (date of re-assessment, remains unchanged if not provided)
       */
      nextReviewDate?: string
      /**
       * Department, reference code in domain 'ASSESS_COMM'. Normally 'REVIEW'
       */
      reviewCommitteeCode: string
    }
    /**
     * Categorisation approval detail for an offender
     */
    CategoryRejectionDetail: {
      /**
       * Sequence number
       */
      assessmentSeq: number
      /**
       * Booking Id
       */
      bookingId: number
      /**
       * Overall comment
       */
      committeeCommentText?: string
      /**
       * Date of rejection
       */
      evaluationDate: string
      /**
       * Department, reference code in domain 'ASSESS_COMM'. Normally 'REVIEW'
       */
      reviewCommitteeCode: string
    }
    /**
     * Cell move result
     */
    CellMoveResult: {
      /**
       * Identifier of agency that offender is associated with.
       */
      agencyId: string
      /**
       * Description of living unit (e.g. cell) that offender is assigned to.
       */
      assignedLivingUnitDesc?: string
      /**
       * Identifier of living unit (e.g. cell) that offender is assigned to.
       */
      assignedLivingUnitId?: number
      /**
       * Bed assignment sequence associated with the entry created for this cell move
       */
      bedAssignmentHistorySequence?: number
      /**
       * Unique, numeric booking id.
       */
      bookingId: number
    }
    /**
     * Offender Charge
     */
    Charge: {
      /**
       * Band
       */
      band?: components['schemas']['CodeDescription']
      /**
       * Charge Active
       */
      charge_active?: boolean
      /**
       * Convicted
       */
      convicted?: boolean
      /**
       * Disposition
       */
      disposition?: components['schemas']['CodeDescription']
      /**
       * Imprisonment Status
       */
      imprisonment_status?: components['schemas']['CodeDescription']
      /**
       * Most Serious Offence
       */
      most_serious?: boolean
      /**
       * Offence
       */
      offence?: components['schemas']['CodeDescription']
      /**
       * Result
       */
      result?: components['schemas']['CodeDescription']
      /**
       * Severity Ranking
       */
      severity_ranking?: string
      /**
       * Statute
       */
      statute?: components['schemas']['CodeDescription']
    }
    /**
     * Code Description
     */
    CodeDescription: {
      /**
       * Code
       */
      code?: string
      /**
       * Description
       */
      desc?: string
    }
    /**
     * Contact
     */
    Contact: {
      /**
       * Active indicator flag.
       */
      activeFlag: boolean
      /**
       * Approved Visitor
       */
      approvedVisitorFlag: boolean
      /**
       * Aware of charges against prisoner
       */
      awareOfChargesFlag: boolean
      /**
       * Offender Booking Id for this contact
       */
      bookingId: number
      /**
       * Can be contacted
       */
      canBeContactedFlag: boolean
      /**
       * Comments
       */
      commentText?: string
      /**
       * Link to root offender ID
       */
      contactRootOffenderId?: number
      /**
       * Contact type
       */
      contactType: string
      /**
       * Contact type text
       */
      contactTypeDescription?: string
      /**
       * Date time the contact was created
       */
      createDateTime: string
      /**
       * Is an emergency contact
       */
      emergencyContact: boolean
      /**
       * Date made inactive
       */
      expiryDate?: string
      /**
       * First Name
       */
      firstName: string
      /**
       * Last name of the contact
       */
      lastName: string
      /**
       * Middle Names
       */
      middleName?: string
      /**
       * Indicates that the contact is Next of Kin Type
       */
      nextOfKin: boolean
      /**
       * id of the person contact
       */
      personId?: number
      /**
       * Relationship to prisoner
       */
      relationship: string
      /**
       * Relationship text
       */
      relationshipDescription?: string
      /**
       * ID of the relationship (internal)
       */
      relationshipId?: number
    }
    /**
     * Contacts Details for offender
     */
    ContactDetail: {
      bookingId: number
      nextOfKin: components['schemas']['Contact'][]
      otherContacts: components['schemas']['Contact'][]
    }
    /**
     * Contact List
     */
    ContactList: {
      /**
       * Available Dates
       */
      contacts?: components['schemas']['ContactPerson'][]
    }
    /**
     * Contact Person
     */
    ContactPerson: {
      /**
       * Active
       */
      active?: boolean
      /**
       * Approved Visitor
       */
      approved_visitor?: boolean
      /**
       * Contact Type
       */
      contact_type?: components['schemas']['CodeDescription']
      /**
       * Date of Birth
       */
      date_of_birth?: string
      /**
       * Gender
       */
      gender?: components['schemas']['CodeDescription']
      /**
       * Given Name
       */
      given_name?: string
      /**
       * ID
       */
      id?: number
      /**
       * Middle Names
       */
      middle_names?: string
      /**
       * Relationship Type
       */
      relationship_type?: components['schemas']['CodeDescription']
      /**
       * Restrictions
       */
      restrictions?: components['schemas']['VisitRestriction'][]
      /**
       * Last Name
       */
      surname?: string
    }
    /**
     * Offender court case details
     */
    CourtCase: {
      /**
       * Agency details
       */
      agency?: components['schemas']['Agency']
      /**
       * The begin date
       */
      beginDate?: string
      /**
       * The case information number
       */
      caseInfoNumber?: string
      /**
       * The prefix of the case number
       */
      caseInfoPrefix?: string
      /**
       * The case sequence number for the offender
       */
      caseSeq?: number
      /**
       * The case status
       */
      caseStatus?: 'ACTIVE' | 'CLOSED' | 'INACTIVE'
      /**
       * The case type
       */
      caseType?: string
      /**
       * Court hearings associated with the court case
       */
      courtHearings?: components['schemas']['CourtHearing'][]
      /**
       * The case identifier
       */
      id?: number
    }
    /**
     * Summary data for a scheduled court event
     */
    CourtEvent: {
      /**
       * The booking active flag
       */
      bookingActiveFlag: boolean
      /**
       * The booking in or out status - either IN or OUT
       */
      bookingInOutStatus: string
      /**
       * The comment text stored against this event
       */
      commentText: string
      /**
       * Date and time the record was created in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      createDateTime: string
      /**
       * The direction code (IN or OUT)
       */
      directionCode: string
      /**
       * The planned date and time of the end of the event in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      endTime: string
      /**
       * The event class (from COURT_EVENTS)
       */
      eventClass: string
      /**
       * The date on which the event is scheduled to occur
       */
      eventDate: string
      /**
       * The internal event ID
       */
      eventId: number
      /**
       * The event status - either SCH (scheduled) or COMP (completed)
       */
      eventStatus: string
      /**
       * The event sub-type
       */
      eventSubType: string
      /**
       * The event type
       */
      eventType: string
      /**
       * The agency code
       */
      fromAgency: string
      /**
       * The from agency description
       */
      fromAgencyDescription: string
      /**
       * Judge name, where available
       */
      judgeName: string
      /**
       * Offender number (NOMS ID)
       */
      offenderNo: string
      /**
       * The planned date and time of the start of the event in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      startTime: string
      /**
       * The agency code to which the transfer will be made (if an agency)
       */
      toAgency: string
      /**
       * The to agency description
       */
      toAgencyDescription: string
    }
    /**
     * Basic Summary data for a scheduled court event
     */
    CourtEventBasic: {
      /**
       * The agency code of the court
       */
      court: string
      /**
       * The court description
       */
      courtDescription?: string
      /**
       * The event description
       */
      eventDescription?: string
      /**
       * The court event subtype (from MOVE_RSN reference data)
       */
      eventSubType: string
      /**
       * Whether hold ordered by the court at this hearing
       */
      hold?: boolean
      /**
       * Offender number (NOMS ID)
       */
      offenderNo: string
      /**
       * The planned date and time of the start of the event in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      startTime: string
    }
    /**
     * Represents a court hearing for an offender court case.
     */
    CourtHearing: {
      /**
       * The date and start time of the court hearing in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      dateTime?: string
      /**
       * The court hearing identifier.
       */
      id?: number
      /**
       * The location of the court for the hearing.
       */
      location?: components['schemas']['Agency']
    }
    /**
     * Supports amending a scheduled court hearing date and time for an offender.
     */
    CourtHearingDateAmendment: {
      /**
       * The date and time of the court hearing in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      hearingDateTime: string
    }
    /**
     * Represents court hearings for an offender booking.
     */
    CourtHearings: { hearings?: components['schemas']['CourtHearing'][] }
    /**
     * Create new alert
     */
    CreateAlert: {
      /**
       * Code identifying the sub type of alert
       */
      alertCode: string
      /**
       * Date the alert became effective
       */
      alertDate: string
      /**
       * Code identifying type of alert
       */
      alertType: string
      /**
       * Free Text Comment
       */
      comment?: string
    }
    /**
     * Transaction to Create
     */
    CreateTransaction: {
      /**
       * Amount of transaction in pence, hence 1634 is £16.34
       */
      amount?: number
      /**
       * Client Transaction Id
       */
      client_transaction_id?: string
      /**
       * A reference unique to the client making the post. Maximum size 64 characters, only alphabetic, numeric, '-' and '_' are allowed
       */
      client_unique_ref?: string
      /**
       * Description of the Transaction
       */
      description?: string
      /**
       * Valid transaction type for the prison_id
       */
      type?: 'CANT' | 'CASHD' | 'DTDS' | 'MRPR' | 'MTDS' | 'PHONE' | 'REFND' | 'RELA' | 'RELS'
    }
    /**
     * An Email Address
     */
    Email: {
      /**
       * Email
       */
      email?: string
    }
    /**
     * General API Error Response
     */
    ErrorResponse: {
      /**
       * Detailed description of problem with remediation hints aimed at application developer.
       */
      developerMessage?: string
      /**
       * An (optional) application-specific error code.
       */
      errorCode?: number
      /**
       * Provision for further information about the problem (e.g. a link to a FAQ or knowledge base article).
       */
      moreInfo?: string
      /**
       * Response status code (will typically mirror HTTP status code).
       */
      status: number
      /**
       * Concise error reason for end-user consumption.
       */
      userMessage: string
    }
    /**
     * Offender Event
     */
    Event: {
      eventData?: string
      /**
       * Unique indentifier for event
       */
      id: number
      /**
       * Offender Noms Id
       */
      nomsId: string
      /**
       * Prison ID
       */
      prisonId: string
      /**
       * Date and time the event occurred
       */
      timestamp: string
      /**
       * Type of event
       */
      type: string
    }
    /**
     * Events
     */
    Events: {
      /**
       * Events
       */
      events?: components['schemas']['Event'][]
    }
    /**
     * HDC Curfew Check
     */
    HdcChecks: {
      /**
       * HDC Checks passed date. ISO-8601 format. YYYY-MM-DD
       */
      date: string
      /**
       * HDC Checks passed flag
       */
      passed: boolean
    }
    /**
     * An Adjudication Hearing
     */
    Hearing: {
      /**
       * Comment
       */
      comment?: string
      /**
       * Establishment
       */
      establishment?: string
      /**
       * Adjudicator First name
       */
      heardByFirstName?: string
      /**
       * Adjudicator Last name
       */
      heardByLastName?: string
      /**
       * Hearing Time
       */
      hearingTime?: string
      /**
       * Hearing Type
       */
      hearingType?: string
      /**
       * Hearing Location
       */
      location?: string
      /**
       * OIC Hearing ID
       */
      oicHearingId?: number
      /**
       * Other Representatives
       */
      otherRepresentatives?: string
      /**
       * Hearing Results
       */
      results?: components['schemas']['HearingResult'][]
    }
    /**
     * A result from a hearing
     */
    HearingResult: {
      /**
       * Finding
       */
      finding?: string
      /**
       * Offence Description
       */
      offenceDescription?: string
      /**
       * Offence Type
       */
      offenceType?: string
      /**
       * OIC Offence Code
       */
      oicOffenceCode?: string
      /**
       * Plea
       */
      plea?: string
      sanctions?: components['schemas']['Sanction'][]
    }
    /**
     * Hold Response
     */
    Hold: {
      /**
       * Amount in pence
       */
      amount?: number
      /**
       * Client unique reference
       */
      client_unique_ref?: string
      /**
       * Description
       */
      description?: string
      /**
       * Entry date
       */
      entry_date?: string
      /**
       * Hold Number
       */
      hold_number?: number
      /**
       * Hold until date
       */
      hold_until_date?: string
      /**
       * Reference number
       */
      reference_no?: string
    }
    /**
     * Home Detention Curfew information
     */
    HomeDetentionCurfew: {
      /**
       * Approval status. Will be one of the 'HDC_APPROVE' reference codes
       */
      approvalStatus?: string
      /**
       * Approval status date. ISO-8601 format. YYYY-MM-DD
       */
      approvalStatusDate: string
      /**
       * HDC Checks passed date. ISO-8601 format. YYYY-MM-DD
       */
      checksPassedDate?: string
      /**
       * HDC Checks passed flag
       */
      passed?: boolean
      /**
       * Refused reason. Will be one of the 'HDC_REJ_RSN' reference codes
       */
      refusedReason?: string
    }
    /**
     * IEP Level
     */
    IepLevel: {
      /**
       * A long description of the IEP level value
       */
      iepDescription: string
      /**
       * The IEP level. Must be one of the reference data values in domain 'IEP_LEVEL'. Typically BAS (Basic), ENH (Enhanced), ENT (Entry) or STD (Standard)
       */
      iepLevel: string
    }
    IepLevelAndComment: {
      /**
       * A comment (reason for change) for the new IEP Level
       */
      comment: string
      /**
       * The IEP level. Must be one of the reference data values in domain 'IEP_LEVEL'. Typically BAS (Basic), ENH (Enhanced), ENT (Entry) or STD (Standard)
       */
      iepLevel: string
    }
    /**
     * Prisoner Photo
     */
    Image: {
      /**
       * Base64 Encoded JPEG data
       */
      image?: string
    }
    /**
     * Image Detail
     */
    ImageDetail: {
      /**
       * Date of image capture
       */
      captureDate: string
      /**
       * Image ID
       */
      imageId: number
      /**
       * Orientation of the image
       */
      imageOrientation: string
      /**
       * Image Type
       */
      imageType: string
      /**
       * Image view information
       */
      imageView: string
      /**
       * Object ID
       */
      objectId?: number
    }
    /**
     * Incident Case
     */
    IncidentCase: {
      /**
       * Agency where incident happened
       */
      agencyId?: string
      /**
       * Incident Case ID
       */
      incidentCaseId: number
      /**
       * Date the incident took place
       */
      incidentDate: string
      /**
       * Details about the case
       */
      incidentDetails?: string
      /**
       * Current Status of Incident
       */
      incidentStatus: 'AWAN' | 'CLOSE' | 'DUP' | 'INAME' | 'INAN' | 'INREQ' | 'IUP' | 'PIU'
      /**
       * Time when incident occurred
       */
      incidentTime: string
      /**
       * Title of the case
       */
      incidentTitle: string
      /**
       * Type of incident
       */
      incidentType:
        | 'ABSCOND'
        | 'ASSAULT'
        | 'ATT_ESCAPE'
        | 'ATT_ESC_E'
        | 'BARRICADE'
        | 'BOMB'
        | 'BREACH'
        | 'CLOSE_DOWN'
        | 'CON_INDISC'
        | 'DAMAGE'
        | 'DEATH'
        | 'DEATH_NI'
        | 'DISORDER'
        | 'DRONE'
        | 'DRUGS'
        | 'ESCAPE_ESC'
        | 'ESCAPE_EST'
        | 'FIND'
        | 'FIND1'
        | 'FINDS'
        | 'FINDS1'
        | 'FIRE'
        | 'FIREARM_ETC'
        | 'FOOD_REF'
        | 'HOSTAGE'
        | 'KEY_LOCK'
        | 'KEY_LOCKNEW'
        | 'MISC'
        | 'MOBILES'
        | 'RADIO_COMP'
        | 'REL_ERROR'
        | 'ROOF_CLIMB'
        | 'SELF_HARM'
        | 'TOOL_LOSS'
        | 'TRF'
        | 'TRF2'
        | 'TRF3'
      /**
       * Parties Involved in case
       */
      parties?: components['schemas']['IncidentParty'][]
      /**
       * Date when incident reported
       */
      reportDate: string
      /**
       * Time incident reported
       */
      reportTime: string
      /**
       * Staff ID who created report
       */
      reportedStaffId: number
      /**
       * Is the response completed?
       */
      responseLockedFlag?: boolean
      /**
       * Question And Answer Responses
       */
      responses?: components['schemas']['IncidentResponse'][]
    }
    /**
     * Incident Party
     */
    IncidentParty: {
      /**
       * Booking Id of offender involved
       */
      bookingId: number
      /**
       * Additional Comments
       */
      commentText: string
      /**
       * Incident Case ID
       */
      incidentCaseId: number
      /**
       * Outcome Code
       */
      outcomeCode: string
      /**
       * Role in the Incident
       */
      participationRole: string
      /**
       * Sequence or each party member
       */
      partySeq: number
      /**
       * Person (non-staff) ID (optional)
       */
      personId?: number
      /**
       * Staff Member ID (optional)
       */
      staffId?: number
    }
    /**
     * Incident Reponses
     */
    IncidentResponse: {
      /**
       * The Answer to the Question
       */
      answer: string
      /**
       * The Question
       */
      question: string
      /**
       * Sequence of presented Questions
       */
      questionSeq: number
      /**
       * ID for Questionnaire Answer
       */
      questionnaireAnsId: number
      /**
       * ID for Questionnaire Question
       */
      questionnaireQueId: number
      /**
       * Staff Id recording comment
       */
      recordStaffId?: number
      /**
       * Additional comments for the response to the question
       */
      responseCommentText?: string
      /**
       * Date response was recorded
       */
      responseDate?: string
    }
    /**
     * Offender basic detail
     */
    InmateBasicDetails: {
      agencyId: string
      assignedLivingUnitId?: number
      bookingId: number
      bookingNo: string
      dateOfBirth: string
      firstName: string
      lastName: string
      middleName?: string
      offenderNo: string
    }
    /**
     * Inmate Detail
     */
    InmateDetail: {
      /**
       * number of active alerts
       */
      activeAlertCount?: number
      /**
       * Indicates that the offender is currently in prison
       */
      activeFlag: boolean
      /**
       * Age of offender
       */
      age?: number
      /**
       * Identifier of agency to which the offender is associated.
       */
      agencyId?: string
      /**
       * List of alert details
       */
      alerts?: components['schemas']['Alert'][]
      /**
       * List of Alerts
       */
      alertsCodes?: string[]
      /**
       * Aliases
       */
      aliases?: components['schemas']['Alias'][]
      /**
       * List of assessments
       */
      assessments?: components['schemas']['Assessment'][]
      /**
       * Where the offender is staying
       */
      assignedLivingUnit?: components['schemas']['AssignedLivingUnit']
      /**
       * Identifier of living unit (e.g. cell) that offender is assigned to.
       */
      assignedLivingUnitId?: number
      /**
       * Country of birth
       */
      birthCountryCode?: string
      /**
       * Place of birth
       */
      birthPlace?: string
      /**
       * Offender Booking Id
       */
      bookingId?: number
      /**
       * Booking Number
       */
      bookingNo?: string
      /**
       * Category description (from list of assessments)
       */
      category?: string
      /**
       * Category code (from list of assessments)
       */
      categoryCode?: string
      /**
       * CSRA (Latest assessment with cellSharing=true from list of assessments)
       */
      csra?: string
      /**
       * Date of Birth of offender
       */
      dateOfBirth: string
      /**
       * Image Id Ref of Offender
       */
      facialImageId?: number
      /**
       * First Name
       */
      firstName: string
      /**
       * Identifiers
       */
      identifiers?: components['schemas']['OffenderIdentifier'][]
      /**
       * The prisoner's imprisonment status.
       */
      imprisonmentStatus?: string
      /**
       * In/Out Status
       */
      inOutStatus: 'IN' | 'OUT'
      /**
       * number of inactive alerts
       */
      inactiveAlertCount?: number
      /**
       * Interpreter required
       */
      interpreterRequired?: boolean
      /**
       * Preferred spoken language
       */
      language?: string
      /**
       * Last Name
       */
      lastName: string
      /**
       * Legal Status
       */
      legalStatus?:
        | 'CIVIL_PRISONER'
        | 'CONVICTED_UNSENTENCED'
        | 'DEAD'
        | 'IMMIGRATION_DETAINEE'
        | 'INDETERMINATE_SENTENCE'
        | 'OTHER'
        | 'RECALL'
        | 'REMAND'
        | 'SENTENCED'
        | 'UNKNOWN'
      /**
       * current prison or outside with last movement information.
       */
      locationDescription?: string
      /**
       * Middle Name(s)
       */
      middleName?: string
      /**
       * Offence History
       */
      offenceHistory?: components['schemas']['OffenceHistoryDetail'][]
      /**
       * Internal Offender ID
       */
      offenderId: number
      /**
       * Offender Unique Reference
       */
      offenderNo: string
      /**
       * Personal Care Needs
       */
      personalCareNeeds?: components['schemas']['PersonalCareNeed'][]
      /**
       * A set of physical attributes
       */
      physicalAttributes?: components['schemas']['PhysicalAttributes']
      /**
       * List of physical characteristics
       */
      physicalCharacteristics?: components['schemas']['PhysicalCharacteristic'][]
      /**
       * List of physical marks
       */
      physicalMarks?: components['schemas']['PhysicalMark'][]
      /**
       * The prisoner's IEP Status
       */
      privilegeSummary?: components['schemas']['PrivilegeSummary']
      /**
       * List of profile information
       */
      profileInformation?: components['schemas']['ProfileInformation'][]
      /**
       * Recall
       */
      recall?: boolean
      /**
       * Date prisoner was received into the prison.
       */
      receptionDate?: string
      /**
       * Religion of the prisoner
       */
      religion?: string
      /**
       * Internal Root Offender ID
       */
      rootOffenderId: number
      /**
       * Sentence Detail
       */
      sentenceDetail?: components['schemas']['SentenceDetail']
      /**
       * Current Sentence Terms
       */
      sentenceTerms?: components['schemas']['OffenderSentenceTerms'][]
      /**
       * Status of prisoner
       */
      status: 'ACTIVE IN' | 'ACTIVE OUT'
      /**
       * Preferred written language
       */
      writtenLanguage?: string
    }
    /**
     * Internal Location
     */
    InternalLocation: {
      /**
       * Description
       */
      description?: string
      /**
       * Levels
       */
      levels?: components['schemas']['TypeValue'][]
    }
    /**
     * Key worker allocation details
     */
    KeyWorkerAllocationDetail: {
      /**
       * Agency Id
       */
      agencyId: string
      /**
       * Date and time of the allocation
       */
      assigned: string
      /**
       * Offender Booking Id
       */
      bookingId: number
      /**
       * First Name
       */
      firstName: string
      /**
       * Description of the location within the prison
       */
      internalLocationDesc: string
      /**
       * Last Name
       */
      lastName: string
      /**
       * Middle Name(s)
       */
      middleNames?: string
      /**
       * Offender Unique Reference
       */
      offenderNo: string
      /**
       * The key worker's Staff Id
       */
      staffId: number
    }
    /**
     * Keyworker Details
     */
    Keyworker: {
      /**
       * Staff member's first name.
       */
      firstName: string
      /**
       * Staff member's last name.
       */
      lastName: string
      /**
       * Current number allocated
       */
      numberAllocated: number
      /**
       * Unique identifier for staff member.
       */
      staffId: number
      /**
       * Status of staff member.
       */
      status: string
      /**
       * Identifier for staff member image.
       */
      thumbnailId?: number
    }
    /**
     * Language
     */
    Language: {
      /**
       * whether an interpreter is required
       */
      interpreter_required?: boolean
      /**
       * Spoken language
       */
      preferred_spoken?: components['schemas']['CodeDescription']
    }
    /**
     * Legal Case
     */
    LegalCase: {
      /**
       * Case Active
       */
      case_active?: boolean
      /**
       * Case Information Number
       */
      case_info_number?: string
      /**
       * Case Started Date
       */
      case_started?: string
      /**
       * Charges
       */
      charges?: components['schemas']['Charge'][]
      /**
       * Court
       */
      court?: components['schemas']['CodeDescription']
      /**
       * Legal Case Type
       */
      legal_case_type?: components['schemas']['CodeDescription']
    }
    /**
     * Live Roll
     */
    LiveRoll: {
      /**
       * Noms Ids
       */
      noms_ids?: string[]
    }
    LocalTime: {
      hour?: number
      minute?: number
      nano?: number
      second?: number
    }
    /**
     * Location Details
     */
    Location: {
      /**
       * Identifier of Agency this location is associated with.
       */
      agencyId: string
      /**
       * Current occupancy of location.
       */
      currentOccupancy?: number
      /**
       * Location description.
       */
      description: string
      internalLocationCode?: string
      /**
       * Location identifier.
       */
      locationId: number
      /**
       * Location prefix. Defines search prefix that will constrain search to this location and its subordinate locations.
       */
      locationPrefix?: string
      /**
       * Location type.
       */
      locationType: string
      /**
       * What events this room can be used for.
       */
      locationUsage?: string
      /**
       * Operational capacity of the location.
       */
      operationalCapacity?: number
      /**
       * Identifier of this location's parent location.
       */
      parentLocationId?: number
      /**
       * User-friendly location description.
       */
      userDescription?: string
    }
    /**
     * Cell Locations are grouped for unlock lists as a 2 level tree. The two levels are referred to as Location and Sub-Location in the prisonstaffhub UI. Each (location/sub-location) group has a name that is understood by prison officers and also serves as a key to retrieve the corresponding Cell Locations and information about their occupants.
     */
    LocationGroup: {
      /**
       * The child groups of this group
       */
      children: components['schemas']['LocationGroup'][]
      /**
       * A key for the group
       */
      key: string
      /**
       * The name of the group
       */
      name: string
    }
    /**
     * Military Record
     */
    MilitaryRecord: {
      /**
       * Description
       */
      description?: string
      /**
       * Discharge location
       */
      dischargeLocation?: string
      /**
       * Disciplinary action code
       */
      disciplinaryActionCode?: string
      /**
       * Disciplinary action description
       */
      disciplinaryActionDescription?: string
      /**
       * End date
       */
      endDate?: string
      /**
       * Enlistment location
       */
      enlistmentLocation?: string
      /**
       * Military branch code
       */
      militaryBranchCode: string
      /**
       * Military branch description
       */
      militaryBranchDescription: string
      /**
       * Military discharge code
       */
      militaryDischargeCode?: string
      /**
       * Military discharge description
       */
      militaryDischargeDescription?: string
      /**
       * Military rank code
       */
      militaryRankCode?: string
      /**
       * Military rank description
       */
      militaryRankDescription?: string
      /**
       * Selective services flag
       */
      selectiveServicesFlag: boolean
      /**
       * Service number
       */
      serviceNumber?: string
      /**
       * Start date
       */
      startDate: string
      /**
       * The unit number
       */
      unitNumber?: string
      /**
       * War zone code
       */
      warZoneCode?: string
      /**
       * War zone description
       */
      warZoneDescription?: string
    }
    /**
     * Military Records
     */
    MilitaryRecords: {
      /**
       * Military Records
       */
      militaryRecords?: components['schemas']['MilitaryRecord'][]
    }
    /**
     * Prisoner Custody Status
     */
    Movement: {
      /**
       * Comment
       */
      commentText?: string
      /**
       * Timestamp when the external movement record was created
       */
      createDateTime: string
      /**
       * IN or OUT
       */
      directionCode: string
      /**
       * Agency travelling from
       */
      fromAgency: string
      /**
       * Description of the agency travelling from
       */
      fromAgencyDescription: string
      /**
       * City offender was received from
       */
      fromCity?: string
      /**
       * Movement date
       */
      movementDate: string
      /**
       * Description of movement reason
       */
      movementReason: string
      /**
       * Movement time
       */
      movementTime: components['schemas']['LocalTime']
      /**
       * ADM (admission), CRT (court), REL (release), TAP (temporary absence) or TRN (transfer)
       */
      movementType: 'ADM' | 'CRT' | 'REL' | 'TAP' | 'TRN'
      /**
       * Description of the movement type
       */
      movementTypeDescription: string
      /**
       * Display Prisoner Number (UK is NOMS ID)
       */
      offenderNo: string
      /**
       * Agency travelling to
       */
      toAgency: string
      /**
       * Description of the agency travelling to
       */
      toAgencyDescription: string
      /**
       * City offender was sent to
       */
      toCity?: string
    }
    /**
     * Establishment roll count in and out numbers
     */
    MovementCount: {
      /**
       * Number of prisoners arrived so far on given date
       */
      in: number
      /**
       * Number of prisoners that have left so far on given date
       */
      out: number
    }
    /**
     * Summary data for a completed movement
     */
    MovementSummary: {
      /**
       * The arresting agency location ID
       */
      arrestAgencyLocId?: string
      /**
       * Comment
       */
      commentText?: string
      /**
       * Timestamp when the external movement record was created in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      createDateTime: string
      /**
       * IN or OUT
       */
      directionCode: string
      /**
       * The escort code
       */
      escortCode?: string
      /**
       * The escort text
       */
      escortText?: string
      /**
       * The internal event ID
       */
      eventId: number
      /**
       * Agency travelling from
       */
      fromAgency: string
      /**
       * Description of the agency travelling from
       */
      fromAgencyDescription: string
      /**
       * City offender was received from
       */
      fromCity?: string
      /**
       * Internal schedule reason code
       */
      internalScheduleReasonCode?: string
      /**
       * Internal schedule type
       */
      internalScheduleType?: string
      /**
       * Description of movement reason
       */
      movementReason: string
      /**
       * Movement date and time in Europe/London local time format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      movementTime: string
      /**
       * ADM (admission), CRT (court), REL (release), TAP (temporary absence) or TRN (transfer)
       */
      movementType: 'ADM' | 'CRT' | 'REL' | 'TAP' | 'TRN'
      /**
       * Description of the movement type
       */
      movementTypeDescription: string
      /**
       * Offender number (NOMS ID)
       */
      offenderNo: string
      /**
       * Agency travelling to
       */
      toAgency: string
      /**
       * Description of the agency travelling to
       */
      toAgencyDescription: string
      /**
       * City offender was sent to
       */
      toCity?: string
      /**
       * To prov stat code - from offender_external_movements
       */
      toProvStatCode?: string
    }
    /**
     * Creation details for a new appointment
     */
    NewAppointment: {
      /**
       * Corresponds to the scheduled event subType
       */
      appointmentType: string
      /**
       * Details of appointment
       */
      comment?: string
      /**
       * Date and time at which event ends
       */
      endTime?: string
      /**
       * Location at which the appointment takes place.
       */
      locationId: number
      /**
       * Date and time at which event starts
       */
      startTime: string
    }
    /**
     * New Offender Booking
     */
    NewBooking: {
      /**
       * A unique correlation id for idempotent request control.
       */
      correlationId?: string
      /**
       * The offender's CRO (Criminal Records Office) number.
       */
      croNumber?: string
      /**
       * The offender's date of birth. Must be specified in YYYY-MM-DD format. Current has to match YJAF allowed DOB
       */
      dateOfBirth: string
      /**
       * A code representing the offender's ethnicity (from the ETHNICITY reference domain).
       */
      ethnicity?:
        | 'A9'
        | 'B1'
        | 'B2'
        | 'B9'
        | 'M1'
        | 'M2'
        | 'M3'
        | 'M9'
        | 'NS'
        | 'O1'
        | 'O2'
        | 'O9'
        | 'W1'
        | 'W2'
        | 'W3'
        | 'W8'
        | 'W9'
      /**
       * An external system identifier for the offender or offender booking. This may be useful if the booking is being created by an external system.
       */
      externalIdentifier?: string
      /**
       * A code representing the type of external identifier specified in <i>externalIdentifier</> property (from ID_TYPE reference domain).
       */
      externalIdentifierType?:
        | 'CRO'
        | 'DL'
        | 'EXTERNAL_REL'
        | 'HMPS'
        | 'HOREF'
        | 'LIDS'
        | 'MERGED'
        | 'MERGE_HMPS'
        | 'NINO'
        | 'NOMS'
        | 'NPD'
        | 'PASS'
        | 'PNC'
        | 'SPNC'
        | 'STAFF'
        | 'YJAF'
      /**
       * The offender's first name.
       */
      firstName: string
      /**
       * A code representing the offender's gender (from the SEX reference domain).
       */
      gender: 'F' | 'M' | 'NK' | 'NS' | 'REF'
      /**
       * The offender's last name.
       */
      lastName: string
      /**
       * The offender's middle name.
       */
      middleName1?: string
      /**
       * An additional middle name for the offender.
       */
      middleName2?: string
      /**
       * A unique offender number. If set, a new booking will be created for an existing offender. If not set, a new offender and new offender booking will be created (subject to de-duplication checks).
       */
      offenderNo?: string
      /**
       * The offender's PNC (Police National Computer) number.
       */
      pncNumber?: string
      /**
       * Prison ID (Agency ID) of where to place offender
       */
      prisonId?: string
      /**
       * A code representing the reason for the offender's admission.
       */
      reason:
        | '24'
        | '25'
        | '26'
        | '27'
        | '29'
        | 'A'
        | 'ADMN'
        | 'B'
        | 'C'
        | 'CCOM'
        | 'CLIF'
        | 'CONR'
        | 'CRT'
        | 'D'
        | 'DCYP'
        | 'DHMP'
        | 'E'
        | 'ELR'
        | 'ETB'
        | 'F'
        | 'FINE'
        | 'FOREIGN'
        | 'G'
        | 'H'
        | 'HLF'
        | 'I'
        | 'IMMIG'
        | 'INT'
        | 'INTER'
        | 'J'
        | 'JAIL'
        | 'K'
        | 'L'
        | 'LICR'
        | 'M'
        | 'MED'
        | 'N'
        | 'O'
        | 'P'
        | 'PSUS'
        | 'PSYC'
        | 'Q'
        | 'R'
        | 'RDTO'
        | 'RECA'
        | 'RHDC'
        | 'RMND'
        | 'S'
        | 'SENT'
        | 'T'
        | 'TRN'
        | 'TRNCRT'
        | 'TRNTAP'
        | 'U'
        | 'V'
        | 'W'
        | 'Y'
        | 'YDET'
        | 'Z'
      /**
       * A code representing a suffix to apply to offender's name (from SUFFIX reference domain).
       */
      suffix?: 'I' | 'II' | 'III' | 'IV' | 'IX' | 'JR' | 'SR' | 'V' | 'VI' | 'VII' | 'VIII'
      /**
       * A code representing the offender's title (from TITLE reference domain).
       */
      title?:
        | 'BR'
        | 'DAME'
        | 'DR'
        | 'FR'
        | 'IMAM'
        | 'LADY'
        | 'LORD'
        | 'MISS'
        | 'MR'
        | 'MRS'
        | 'MS'
        | 'RABBI'
        | 'REV'
        | 'SIR'
        | 'SR'
      /**
       * A flag to indicate that the offender is a youth/young offender (or not). Defaults to false if not specified.
       */
      youthOffender?: boolean
    }
    /**
     * New Case Note
     */
    NewCaseNote: {
      /**
       * Date and Time of when case note contact with offender was made
       */
      occurrenceDateTime?: string
      /**
       * Case Note Sub Type
       */
      subType: string
      /**
       * Case Note Text
       */
      text: string
      /**
       * Case Note Type
       */
      type: string
    }
    /**
     * Offence Details
     */
    OffenceDetail: {
      /**
       * Prisoner booking id
       */
      bookingId: number
      /**
       * Reference Code
       */
      offenceCode: string
      /**
       * Description of offence
       */
      offenceDescription: string
      /**
       * Statute code
       */
      statuteCode: string
    }
    /**
     * Offence History Item
     */
    OffenceHistoryDetail: {
      /**
       * Prisoner booking id
       */
      bookingId: number
      /**
       * Court case id
       */
      caseId?: number
      /**
       * Latest court date associated with the offence
       */
      courtDate?: string
      /**
       * Identifies the main offence per booking
       */
      mostSerious: boolean
      /**
       * Reference Code
       */
      offenceCode: string
      /**
       * Date the offence took place
       */
      offenceDate: string
      /**
       * Description associated with the offence code
       */
      offenceDescription: string
      /**
       * End date if range the offence was believed to have taken place
       */
      offenceRangeDate?: string
      /**
       * Primary result code
       */
      primaryResultCode?: string
      /**
       * Conviction flag for Primary result
       */
      primaryResultConviction?: boolean
      /**
       * Description for Primary result
       */
      primaryResultDescription?: string
      /**
       * Secondary result code
       */
      secondaryResultCode?: string
      /**
       * Conviction flag for Secondary result
       */
      secondaryResultConviction?: boolean
      /**
       * Description for Secondary result
       */
      secondaryResultDescription?: string
      /**
       * Statute code
       */
      statuteCode: string
    }
    /**
     * Offender
     */
    Offender: {
      /**
       * List of offender’s aliases
       */
      aliases?: components['schemas']['OffenderAlias'][]
      /**
       * indicates whether the offender has been convicted or is on remand
       */
      convicted?: boolean
      /**
       * CRO Number
       */
      cro_number?: string
      /**
       * Cell Sharing Risk Assessment
       */
      csra?: components['schemas']['CodeDescription']
      /**
       * Date of Birth
       */
      date_of_birth?: string
      /**
       * Diet
       */
      diet?: components['schemas']['CodeDescription']
      /**
       * Ethnicity
       */
      ethnicity?: components['schemas']['CodeDescription']
      /**
       * Gender
       */
      gender?: components['schemas']['CodeDescription']
      /**
       * Given Name
       */
      given_name?: string
      /**
       * IEP Level
       */
      iep_level?: components['schemas']['CodeDescription']
      /**
       * Imprisonment Status
       */
      imprisonment_status?: components['schemas']['CodeDescription']
      /**
       * Language
       */
      language?: components['schemas']['Language']
      /**
       * Middle Names
       */
      middle_names?: string
      /**
       * Nationalities
       */
      nationalities?: string
      /**
       * PNC Number
       */
      pnc_number?: string
      /**
       * Religion
       */
      religion?: components['schemas']['CodeDescription']
      /**
       * Security Categorisation
       */
      security_category?: components['schemas']['CodeDescription']
      /**
       * Suffix
       */
      suffix?: string
      /**
       * Last Name
       */
      surname?: string
      /**
       * Title
       */
      title?: string
    }
    /**
     * Offender Alias
     */
    OffenderAlias: {
      /**
       * Date of Birth
       */
      date_of_birth?: string
      /**
       * Given Name
       */
      given_name?: string
      /**
       * Middle Names
       */
      middle_names?: string
      /**
       * Surname
       */
      surname?: string
    }
    /**
     * Offender Booking Summary
     */
    OffenderBooking: {
      /**
       * Offender's current age.
       */
      age: number
      /**
       * Identifier of agency that offender is associated with.
       */
      agencyId: string
      /**
       * List of offender's current alert types.
       */
      alertsCodes: string[]
      /**
       * List of offender's current alert codes.
       */
      alertsDetails: string[]
      /**
       * List of offender's alias names.
       */
      aliases?: string[]
      /**
       * Description of living unit (e.g. cell) that offender is assigned to.
       */
      assignedLivingUnitDesc?: string
      /**
       * Identifier of living unit (e.g. cell) that offender is assigned to.
       */
      assignedLivingUnitId?: number
      /**
       * Identifier of officer (key worker) to which offender is assigned.
       */
      assignedOfficerUserId?: string
      /**
       * Unique, numeric booking id.
       */
      bookingId: number
      /**
       * Booking number.
       */
      bookingNo?: string
      /**
       * The Cat A/B/C/D of the offender
       */
      categoryCode?: 'A' | 'B' | 'C' | 'D' | 'I' | 'J'
      /**
       * Convicted Status
       */
      convictedStatus?: 'Convicted' | 'Remand'
      /**
       * Offender date of birth.
       */
      dateOfBirth: string
      /**
       * Identifier of facial image of offender.
       */
      facialImageId?: number
      /**
       * Offender first name.
       */
      firstName: string
      /**
       * The IEP Level of the offender (UK Only)
       */
      iepLevel?: string
      /**
       * The imprisonment status of the offender
       */
      imprisonmentStatus?: string
      /**
       * Offender last name.
       */
      lastName: string
      /**
       * Legal Status
       */
      legalStatus?:
        | 'CIVIL_PRISONER'
        | 'CONVICTED_UNSENTENCED'
        | 'DEAD'
        | 'IMMIGRATION_DETAINEE'
        | 'INDETERMINATE_SENTENCE'
        | 'OTHER'
        | 'RECALL'
        | 'REMAND'
        | 'SENTENCED'
        | 'UNKNOWN'
      /**
       * Offender middle name.
       */
      middleName?: string
      /**
       * Offender number (e.g. NOMS Number).
       */
      offenderNo: string
    }
    /**
     * Prisoner with categorisation data
     */
    OffenderCategorise: {
      /**
       * Date categorisation was approved if any
       */
      approvalDate?: string
      /**
       * Approver First Name if any
       */
      approverFirstName?: string
      /**
       * Approver Last Name if any
       */
      approverLastName?: string
      /**
       * Categorisation status
       */
      assessStatus?: 'A' | 'I' | 'P' | 'null'
      /**
       * Categorisation date if any
       */
      assessmentDate?: string
      /**
       * Sequence number within booking
       */
      assessmentSeq?: number
      /**
       * assessment type
       */
      assessmentTypeId?: number
      bookingId: number
      /**
       * Categoriser First Name
       */
      categoriserFirstName?: string
      /**
       * Categoriser Last Name
       */
      categoriserLastName?: string
      /**
       * Categorisation
       */
      category?: string
      /**
       * Prisoner First Name
       */
      firstName: string
      /**
       * Prisoner Last Name
       */
      lastName: string
      /**
       * Next Review Date - for recategorisations
       */
      nextReviewDate?: string
      /**
       * Display Prisoner Number
       */
      offenderNo: string
      /**
       * Where in the categorisation workflow the prisoner is
       */
      status: 'AWAITING_APPROVAL' | 'UNCATEGORISED'
    }
    /**
     * Offender cell details
     */
    OffenderCell: {
      /**
       * List of attributes
       */
      attributes?: components['schemas']['OffenderCellAttribute'][]
      /**
       * Capacity
       */
      capacity?: number
      /**
       * Description
       */
      description?: string
      /**
       * The case identifier
       */
      id?: number
      /**
       * Number of occupants
       */
      noOfOccupants?: number
      /**
       * Description
       */
      userDescription?: string
    }
    /**
     * Offender cell details
     */
    OffenderCellAttribute: {
      /**
       * Attribute code
       */
      code?: string
      /**
       * Attribute description
       */
      description?: string
    }
    /**
     * Damage obligation for an offender
     */
    OffenderDamageObligationModel: {
      /**
       * Amount paid
       */
      amountPaid?: number
      /**
       * Original amount to pay
       */
      amountToPay?: number
      /**
       * Comment
       */
      comment?: string
      /**
       * Currency of these amounts.
       */
      currency?: string
      /**
       * The end date time when the damage obligation ended
       */
      endDateTime?: string
      /**
       * Identifier of damage obligation
       */
      id?: number
      /**
       * Offender number
       */
      offenderNo?: string
      /**
       * Prison the damages occurred
       */
      prisonId?: string
      /**
       * Reference number
       */
      referenceNumber?: string
      /**
       * The start date time when the damage obligation started
       */
      startDateTime?: string
      /**
       * Status
       */
      status?: string
    }
    /**
     * Offender damage obligation response
     */
    OffenderDamageObligationResponse: {
      /**
       * List of offender damage obligations
       */
      damageObligations?: components['schemas']['OffenderDamageObligationModel'][]
    }
    /**
     * Offender Event
     */
    OffenderEvent: {
      addressEndDate?: string
      addressId?: number
      addressUsage?: string
      agencyIncidentId?: number
      agencyLocationId?: string
      alertCode?: string
      alertDateTime?: string
      alertSeq?: number
      alertType?: string
      aliasOffenderId?: number
      assessmentSeq?: number
      bedAssignmentSeq?: number
      bookingId?: number
      bookingNumber?: string
      caseNoteId?: number
      chargeSeq?: number
      conditionCode?: string
      directionCode?: string
      escortCode?: string
      eventDatetime?: string
      eventId?: string
      eventType?: string
      expiryDateTime?: string
      findingCode?: string
      fromAgencyLocationId?: string
      identifierType?: string
      identifierValue?: string
      imprisonmentStatusSeq?: number
      incidentCaseId?: number
      incidentPartySeq?: number
      incidentQuestionSeq?: number
      incidentRequirementSeq?: number
      incidentResponseSeq?: number
      livingUnitId?: number
      mailAddressFlag?: string
      movementDateTime?: string
      movementReasonCode?: string
      movementSeq?: number
      movementType?: string
      nomisEventType?: string
      offenderId?: number
      offenderIdDisplay?: string
      offenderSentenceConditionId?: number
      oicHearingId?: number
      oicOffenceId?: number
      ownerClass?: string
      ownerId?: number
      personId?: number
      pleaFindingCode?: string
      previousBookingNumber?: string
      previousOffenderId?: number
      primaryAddressFlag?: string
      resultSeq?: number
      riskPredictorId?: number
      rootOffenderId?: number
      sanctionSeq?: number
      sentenceCalculationId?: number
      sentenceSeq?: number
      toAgencyLocationId?: string
    }
    /**
     * offender ID
     */
    OffenderId: {
      /**
       * ID
       */
      id?: number
    }
    /**
     * Offender Identifier
     */
    OffenderIdentifier: {
      /**
       * The booking ID for this identifier
       */
      bookingId?: number
      /**
       * Related caseload type
       */
      caseloadType?: string
      /**
       * Issuing Authority Information
       */
      issuedAuthorityText?: string
      /**
       * Date of issue
       */
      issuedDate?: string
      /**
       * The offender number for this identifier
       */
      offenderNo?: string
      /**
       * Type of offender identifier
       */
      type: string
      /**
       * The value of the offender identifier
       */
      value: string
    }
    /**
     * Details required for IEP review for offender
     */
    OffenderIepReview: {
      /**
       * Booking ID of offender
       */
      bookingId: number
      /**
       * The current cell location of Offender
       */
      cellLocation: string
      /**
       * The current IEP level for offender
       */
      currentLevel?: string
      /**
       * Offender first name
       */
      firstName: string
      /**
       * Offender last name
       */
      lastName: string
      /**
       * Date of last IEP review
       */
      lastReviewTime?: string
      /**
       * Offender middle name
       */
      middleName?: string
      /**
       * Number for case notes of type NEG and subtype IEP_WARN
       */
      negativeIeps: number
      /**
       * Offender Number
       */
      offenderNo: string
      /**
       * Number for case notes of type POS and subtype IEP_ENC
       */
      positiveIeps: number
      /**
       * Number of proven adjudications
       */
      provenAdjudications: number
    }
    /**
     * Summary of an offender counted as Establishment Roll - In
     */
    OffenderIn: {
      bookingId: number
      dateOfBirth: string
      firstName: string
      /**
       * Description for Agency travelling from
       */
      fromAgencyDescription: string
      /**
       * Id for Agency travelling from
       */
      fromAgencyId: string
      /**
       * City offender was received from
       */
      fromCity?: string
      lastName: string
      /**
       * Description of the offender's (internal) location
       */
      location: string
      middleName?: string
      /**
       * Movement date time
       */
      movementDateTime: string
      /**
       * Movement time
       */
      movementTime: components['schemas']['LocalTime']
      /**
       * Display Prisoner Number
       */
      offenderNo: string
      /**
       * Description for Agency travelling to
       */
      toAgencyDescription: string
      /**
       * Id for Agency travelling to
       */
      toAgencyId: string
      /**
       * City offender was sent to
       */
      toCity?: string
    }
    /**
     * Summary of an offender counted as Establishment Roll - Reception
     */
    OffenderInReception: {
      /**
       * Booking Id
       */
      bookingId: number
      dateOfBirth: string
      firstName: string
      lastName: string
      /**
       * Display Prisoner Number
       */
      offenderNo: string
    }
    /**
     * Offender Key Worker record representation (to facilitate data migration)
     */
    OffenderKeyWorker: {
      /**
       * Y
       */
      active: string
      /**
       * Agency Id
       */
      agencyId: string
      /**
       * Date and time allocation was assigned
       */
      assigned: string
      /**
       * Date and time allocation record was created
       */
      created: string
      /**
       * Username of user who created allocation record
       */
      createdBy: string
      /**
       * Date and time allocation expired
       */
      expired?: string
      /**
       * Date and time allocation record was last modified
       */
      modified?: string
      /**
       * Username of user who last modified allocation record
       */
      modifiedBy?: string
      /**
       * Offender Unique Reference
       */
      offenderNo: string
      /**
       * The key worker's Staff Id
       */
      staffId: number
      /**
       * Username of user who processed allocation
       */
      userId: string
    }
    /**
     * Prisoner Movement
     */
    OffenderMovement: {
      bookingId: number
      dateOfBirth: string
      /**
       * IN or OUT
       */
      directionCode: string
      firstName: string
      /**
       * Agency travelling from
       */
      fromAgency: string
      /**
       * Description for Agency travelling from
       */
      fromAgencyDescription: string
      lastName: string
      middleName?: string
      /**
       * Movement date
       */
      movementDate: string
      /**
       * Reason code for the movement
       */
      movementReason: string
      /**
       * Description of the movement reason
       */
      movementReasonDescription: string
      /**
       * Movement time
       */
      movementTime: components['schemas']['LocalTime']
      /**
       * ADM (admission), CRT (court), REL (release), TAP (temporary absence) or TRN (transfer)
       */
      movementType: 'ADM' | 'CRT' | 'REL' | 'TAP' | 'TRN'
      /**
       * Description of the movement type
       */
      movementTypeDescription: string
      /**
       * Display Prisoner Number (UK is NOMS ID)
       */
      offenderNo: string
      /**
       * Agency travelling to
       */
      toAgency: string
      /**
       * Description for Agency travelling to
       */
      toAgencyDescription: string
    }
    /**
     * Offender non-association
     */
    OffenderNonAssociation: {
      /**
       * Description of the agency (e.g. prison) the offender is assigned to.
       */
      agencyDescription: string
      /**
       * Description of living unit (e.g. cell) the offender is assigned to.
       */
      assignedLivingUnitDescription: string
      /**
       * Id of living unit (e.g. cell) the offender is assigned to.
       */
      assignedLivingUnitId: number
      /**
       * The offenders first name
       */
      firstName: string
      /**
       * The offenders last name
       */
      lastName: string
      /**
       * The offenders number
       */
      offenderNo: string
      /**
       * The non-association reason code
       */
      reasonCode: string
      /**
       * The non-association reason description
       */
      reasonDescription: string
    }
    /**
     * Offender non-association detail
     */
    OffenderNonAssociationDetail: {
      /**
       * The person who authorised the non-association (free text).
       */
      authorisedBy?: string
      /**
       * Additional free text comments related to the non-association.
       */
      comments?: string
      /**
       * Date and time the mom-association is effective from. In Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      effectiveDate: string
      /**
       * Date and time the mom-association expires. In Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      expiryDate?: string
      /**
       * The offender with whom not to associate.
       */
      offenderNonAssociation: components['schemas']['OffenderNonAssociation']
      /**
       * The non-association reason code
       */
      reasonCode: string
      /**
       * The non-association reason description
       */
      reasonDescription: string
      /**
       * The non-association type code
       */
      typeCode: string
      /**
       * The non-association type description
       */
      typeDescription: string
    }
    /**
     * Offender non-association details
     */
    OffenderNonAssociationDetails: {
      /**
       * Description of the agency (e.g. prison) the offender is assigned to.
       */
      agencyDescription: string
      /**
       * Description of living unit (e.g. cell) the offender is assigned to.
       */
      assignedLivingUnitDescription: string
      /**
       * Id of living unit (e.g. cell) the offender is assigned to.
       */
      assignedLivingUnitId: number
      /**
       * The offenders first name
       */
      firstName: string
      /**
       * The offenders last name
       */
      lastName: string
      /**
       * Offender non-association details
       */
      nonAssociations?: components['schemas']['OffenderNonAssociationDetail'][]
      /**
       * The offenders number
       */
      offenderNo: string
    }
    /**
     * The NOMS Offender Number
     */
    OffenderNumber: {
      /**
       * offenderNumber
       */
      offenderNumber?: string
    }
    /**
     * Summary of an offender 'currently out' according to Establishment Roll
     */
    OffenderOut: {
      bookingId: number
      dateOfBirth: string
      firstName: string
      lastName: string
      /**
       * The prisoner's internal location (Cell)
       */
      location: string
      /**
       * Display Prisoner Number
       */
      offenderNo: string
    }
    /**
     * Offender out today details
     */
    OffenderOutTodayDto: {
      dateOfBirth: string
      firstName: string
      lastName: string
      /**
       * Offender Unique Reference
       */
      offenderNo: string
      /**
       * Reason for out movement
       */
      reasonDescription?: string
      timeOut: components['schemas']['LocalTime']
    }
    /**
     * Offender Relationship
     */
    OffenderRelationship: {
      /**
       * unique external Id
       */
      externalRef?: string
      /**
       * First Name
       */
      firstName: string
      /**
       * Surname
       */
      lastName: string
      /**
       * id of the person contact
       */
      personId?: number
      /**
       * Relationship to inmate (e.g. COM or POM, etc.)
       */
      relationshipType: string
    }
    /**
     * Offender Sentence Calculation
     */
    OffenderSentenceCalc: {
      /**
       * Agency Id
       */
      agencyLocationId: string
      /**
       * Offender booking id.
       */
      bookingId: number
      /**
       * First Name
       */
      firstName: string
      /**
       * Last Name
       */
      lastName: string
      /**
       * Offender Unique Reference
       */
      offenderNo: string
      /**
       * Offender Sentence Detail Information
       */
      sentenceDetail?: components['schemas']['BaseSentenceDetail']
    }
    /**
     * Offender Sentence Detail
     */
    OffenderSentenceDetail: {
      /**
       * Agency Description
       */
      agencyLocationDesc: string
      /**
       * Agency Id
       */
      agencyLocationId: string
      /**
       * Offender booking id.
       */
      bookingId: number
      /**
       * Offender date of birth.
       */
      dateOfBirth: string
      /**
       * Identifier of facial image of offender.
       */
      facialImageId?: number
      /**
       * First Name
       */
      firstName: string
      /**
       * Description of the location within the prison
       */
      internalLocationDesc: string
      /**
       * Last Name
       */
      lastName: string
      /**
       * Offender Unique Reference
       */
      offenderNo: string
      /**
       * Offender Sentence Detail Information
       */
      sentenceDetail?: components['schemas']['SentenceDetail']
    }
    /**
     * Offender Sentence terms details for booking id
     */
    OffenderSentenceTerms: {
      /**
       * Offender booking id.
       */
      bookingId: number
      /**
       * Court case id
       */
      caseId: string
      /**
       * Sentence number which this sentence follows if consecutive, otherwise concurrent.
       */
      consecutiveTo?: number
      /**
       * Sentence length days.
       */
      days?: number
      /**
       * Fine amount.
       */
      fineAmount: number
      /**
       * Whether this is a life sentence.
       */
      lifeSentence: boolean
      /**
       * Sentence line number
       */
      lineSeq: number
      /**
       * Sentence length months.
       */
      months?: number
      /**
       * Sentence number within booking id.
       */
      sentenceSequence: number
      /**
       * Sentence start date
       */
      sentenceStartDate: string
      /**
       * Sentence term code.
       */
      sentenceTermCode: string
      /**
       * Sentence type, using reference data from table SENTENCE_CALC_TYPES.
       */
      sentenceType?: string
      /**
       * Sentence type description.
       */
      sentenceTypeDescription?: string
      /**
       * Start date of sentence term.
       */
      startDate: string
      /**
       * Sentence term number within sentence.
       */
      termSequence: number
      /**
       * Sentence length weeks.
       */
      weeks?: number
      /**
       * Sentence length years.
       */
      years?: number
    }
    /**
     * Offender Summary
     */
    OffenderSummary: {
      /**
       * Agency description (if known)
       */
      agencyLocationDesc?: string
      /**
       * Agency Id (if known)
       */
      agencyLocationId?: string
      /**
       * A unique booking id.
       */
      bookingId: number
      /**
       * Set to Y or N to indicate if the person is currently in prison. If not set, status is not known.
       */
      currentlyInPrison?: string
      /**
       * The offender's first name.
       */
      firstName: string
      /**
       * Internal location description (if known)
       */
      internalLocationDesc?: string
      /**
       * Internal location id (if known)
       */
      internalLocationId?: string
      /**
       * The offender's last name.
       */
      lastName: string
      /**
       * The offender's middle name(s).
       */
      middleNames?: string
      /**
       * The offender's unique offender number (aka NOMS Number in the UK).
       */
      offenderNo: string
      /**
       * A code representing a suffix that is applied to offender's name (from SUFFIX reference domain).
       */
      suffix?: string
      /**
       * A code representing the offender's title (from TITLE reference domain).
       */
      title?: string
    }
    /**
     * Offender transaction details
     */
    OffenderTransactionHistoryDto: {
      /**
       * Offender Sub Account
       */
      accountType?: string
      /**
       * The place the transaction took place
       */
      agencyId?: string
      /**
       * Currency of these amounts.
       */
      currency?: string
      /**
       * Transaction Date
       */
      entryDate?: string
      /**
       * Transaction Description
       */
      entryDescription?: string
      /**
       * Offender Id
       */
      offenderId?: number
      /**
       * Offender number
       */
      offenderNo?: string
      /**
       * Transaction Amount
       */
      penceAmount?: number
      /**
       * Posting type. Denotes the direction of money moving in or out of the account
       */
      postingType?: string
      /**
       * Transaction Reference Number
       */
      referenceNumber?: string
      /**
       * List of related transaction details
       */
      relatedOffenderTransactions?: components['schemas']['RelatedTransactionDetails'][]
      /**
       * Transaction Sequence
       */
      transactionEntrySequence?: number
      /**
       * Transaction Id
       */
      transactionId?: number
      /**
       * Transaction Type
       */
      transactionType?: string
    }
    PageOfBedAssignment: {
      content?: components['schemas']['BedAssignment'][]
      empty?: boolean
      first?: boolean
      last?: boolean
      number?: number
      numberOfElements?: number
      pageable?: components['schemas']['Pageable']
      size?: number
      sort?: components['schemas']['Sort']
      totalElements?: number
      totalPages?: number
    }
    PageOfOffenderNumber: {
      content?: components['schemas']['OffenderNumber'][]
      empty?: boolean
      first?: boolean
      last?: boolean
      number?: number
      numberOfElements?: number
      pageable?: components['schemas']['Pageable']
      size?: number
      sort?: components['schemas']['Sort']
      totalElements?: number
      totalPages?: number
    }
    PageOfPrisonerInformation: {
      content?: components['schemas']['PrisonerInformation'][]
      empty?: boolean
      first?: boolean
      last?: boolean
      number?: number
      numberOfElements?: number
      pageable?: components['schemas']['Pageable']
      size?: number
      sort?: components['schemas']['Sort']
      totalElements?: number
      totalPages?: number
    }
    PageOfVisitWithVisitorsOfVisitDetails: {
      content?: components['schemas']['VisitWithVisitorsOfVisitDetails'][]
      empty?: boolean
      first?: boolean
      last?: boolean
      number?: number
      numberOfElements?: number
      pageable?: components['schemas']['Pageable']
      size?: number
      sort?: components['schemas']['Sort']
      totalElements?: number
      totalPages?: number
    }
    Pageable: {
      offset?: number
      pageNumber?: number
      pageSize?: number
      paged?: boolean
      sort?: components['schemas']['Sort']
      unpaged?: boolean
    }
    /**
     * Payment Response
     */
    PaymentResponse: {
      /**
       * Message returned from a payment
       */
      message?: string
    }
    /**
     * PersonIdentifier
     */
    PersonIdentifier: {
      /**
       * The identifier type
       */
      identifierType: string
      /**
       * The most recent identifier value of that type.
       */
      identifierValue: string
    }
    /**
     * Personal Care Need
     */
    PersonalCareNeed: {
      /**
       * Comment Text
       */
      commentText?: string
      /**
       * End Date
       */
      endDate?: string
      /**
       * Problem Code
       */
      problemCode?: string
      /**
       * Problem Description
       */
      problemDescription?: string
      /**
       * Problem Status
       */
      problemStatus?: string
      /**
       * Problem Type
       */
      problemType?: string
      /**
       * Start Date
       */
      startDate?: string
    }
    /**
     * Personal Care Needs
     */
    PersonalCareNeeds: {
      /**
       * Offender No
       */
      offenderNo?: string
      /**
       * Personal Care Needs
       */
      personalCareNeeds?: components['schemas']['PersonalCareNeed'][]
    }
    /**
     * Physical Attributes
     */
    PhysicalAttributes: {
      /**
       * Ethnicity
       */
      ethnicity: string
      /**
       * Gender
       */
      gender: string
      /**
       * Height in Centimetres
       */
      heightCentimetres: number
      /**
       * Height in Feet
       */
      heightFeet: number
      /**
       * Height in Inches
       */
      heightInches: number
      /**
       * Height in Metres (to 2dp)
       */
      heightMetres: number
      /**
       * Ethnicity Code
       */
      raceCode: string
      /**
       * Weight in Kilograms
       */
      weightKilograms: number
      /**
       * Weight in Pounds
       */
      weightPounds: number
    }
    /**
     * Physical Characteristic
     */
    PhysicalCharacteristic: {
      /**
       * Type of physical characteristic
       */
      characteristic: string
      /**
       * Detailed information about the physical characteristic
       */
      detail: string
      /**
       * Image Id Ref
       */
      imageId?: number
      /**
       * Type code of physical characteristic
       */
      type: string
    }
    /**
     * Physical Mark
     */
    PhysicalMark: {
      /**
       * Where on the body
       */
      bodyPart: string
      /**
       * More information
       */
      comment: string
      /**
       * Image Id Ref
       */
      imageId?: number
      /**
       * Image orientation
       */
      orientation: string
      /**
       * Left or Right Side
       */
      side: string
      /**
       * Type of Mark
       */
      type: string
    }
    /**
     * Contacts details for agency
     */
    PrisonContactDetail: {
      /**
       * Type of address.
       */
      addressType: string
      /**
       * Identifier of agency/prison.
       */
      agencyId: string
      /**
       * Type of agency.
       */
      agencyType: string
      /**
       * Address city.
       */
      city: string
      /**
       * Address country.
       */
      country: string
      /**
       * Agency description.
       */
      description: string
      /**
       * Formatted agency description.
       */
      formattedDescription: string
      /**
       * Describes the geographic location.
       */
      locality: string
      /**
       * List of Telephone details
       */
      phones: components['schemas']['Telephone'][]
      /**
       * Address postcode.
       */
      postCode: string
      /**
       * The Prison name.
       */
      premise: string
    }
    /**
     * Captures what is needed for cancellation of a scheduled prison to prison move.
     */
    PrisonMoveCancellation: {
      /**
       * The reason code for cancellation of the move.
       */
      reasonCode: 'ADMI' | 'OCI' | 'TRANS'
    }
    /**
     * Represents the data required to schedule a prison to court hearing for an offender.
     */
    PrisonToCourtHearing: {
      /**
       * Any comments related to the court case.
       */
      comments?: string
      /**
       * The future date and time of the court hearing in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      courtHearingDateTime: string
      /**
       * The prison (agency code) where the offender will be moved from.
       */
      fromPrisonLocation: string
      /**
       * The court (agency code) where the offender will moved to.
       */
      toCourtLocation: string
    }
    /**
     * Prisoner Details
     */
    PrisonerDetail: {
      /**
       * The prisoner's country of birth.
       */
      birthCountry?: string
      /**
       * Status code of prisoner's latest conviction.
       */
      convictedStatus?: 'Convicted' | 'Remand'
      /**
       * The prisoner's CRO (Criminal Records Office) number.
       */
      croNumber?: string
      /**
       * The prisoner's current working date of birth (in YYYY-MM-DD format).
       */
      currentWorkingBirthDate: string
      /**
       * The prisoner's current working first name.
       */
      currentWorkingFirstName: string
      /**
       * The prisoner's current working last name.
       */
      currentWorkingLastName: string
      /**
       * Flag (Y or N) to indicate if prisoner is currently in prison.
       */
      currentlyInPrison: string
      /**
       * The prisoner's date of birth (in YYYY-MM-DD format).
       */
      dateOfBirth: string
      /**
       * The prisoner's ethnicity.
       */
      ethnicity?: string
      /**
       * The prisoner's ethnicity code.
       */
      ethnicityCode?: string
      /**
       * The prisoner's first name.
       */
      firstName: string
      /**
       * The prisoner's gender.
       */
      gender: string
      /**
       * The prisoner's imprisonment status.
       */
      imprisonmentStatus?: string
      /**
       * The prisoner's imprisonment status description.
       */
      imprisonmentStatusDesc?: string
      /**
       * Name of the location where the prisoner resides (if in prison)
       */
      internalLocation?: string
      /**
       * The prisoner's last name.
       */
      lastName: string
      /**
       * ID of prisoner's latest booking.
       */
      latestBookingId?: number
      /**
       * Name of the prison where the prisoner resides (if in prison).
       */
      latestLocation?: string
      /**
       * Latest location ID of a prisoner (if in prison).
       */
      latestLocationId?: string
      /**
       * Legal Status
       */
      legalStatus?:
        | 'CIVIL_PRISONER'
        | 'CONVICTED_UNSENTENCED'
        | 'DEAD'
        | 'IMMIGRATION_DETAINEE'
        | 'INDETERMINATE_SENTENCE'
        | 'OTHER'
        | 'RECALL'
        | 'REMAND'
        | 'SENTENCED'
        | 'UNKNOWN'
      /**
       * The prisoner's marital status.
       */
      maritalStatus?: string
      /**
       * The prisoner's middle name(s).
       */
      middleNames?: string
      /**
       * The prisoner's nationality.
       */
      nationalities?: string
      /**
       * The prisoner's unique offender number (aka NOMS Number in the UK).
       */
      offenderNo: string
      /**
       * The prisoner's PNC (Police National Computer) number.
       */
      pncNumber?: string
      /**
       * Date prisoner was received into the prison.
       */
      receptionDate?: string
      /**
       * The prisoner's religion.
       */
      religion?: string
      /**
       * The prisoner's religion code.
       */
      religionCode?: string
      /**
       * The prisoner's gender code.
       */
      sexCode: string
      /**
       * The prisoner's name suffix.
       */
      suffix?: string
      /**
       * The prisoner's title.
       */
      title?: string
    }
    /**
     * Prisoner Search Criteria
     */
    PrisonerDetailSearchCriteria: {
      /**
       * If <i>true</i>, offenders that match any of the specified criteria will be returned. The default search behaviour is to only return offenders that match <i>all</i> of the specified criteria. If the <i>prioritisedMatch</i> parameter is also set <i>true</i>, this parameter will only impact the behaviour of searching using offender name and date of birth criteria.
       */
      anyMatch?: boolean
      /**
       * The offender's CRO (Criminal Records Office) number.
       */
      croNumber?: string
      /**
       * The offender's date of birth. Cannot be used in conjunction with <i>dobFrom</i> or <i>dobTo</i>. Must be specified using YYYY-MM-DD format.
       */
      dob?: string
      /**
       * Start date for offender date of birth search. If <i>dobTo</i> is not specified, an implicit <i>dobTo</i> value of <i>dobFrom</i> + 10 years will be applied. If <i>dobTo</i> is specified, it will be adjusted, if necessary, to ensure it is not more than 10 years after <i>dobFrom</i>. Cannot be used in conjunction with <i>dob</i>. Must be specified using YYYY-MM-DD format.
       */
      dobFrom?: string
      /**
       * End date for offender date of birth search. If <i>dobFrom</i> is not specified, an implicit <i>dobFrom</i> value of <i>dobTo</i> - 10 years will be applied. Cannot be used in conjunction with <i>dob</i>. Must be specified using YYYY-MM-DD format.
       */
      dobTo?: string
      /**
       * The first name of the offender.
       */
      firstName?: string
      /**
       * Offender's gender code (F - Female, M - Male, NK - Not Known or NS - Not Specified).
       */
      gender?: 'ALL' | 'F' | 'M' | 'NK' | 'NS'
      /**
       * If true the result set should include a row for every matched alias.  If the request includes some combination of firstName, lastName and dateOfBirth then this will be a subset of the OFFENDERS records for one or more offenders. Otherwise it will be every OFFENDERS record for each match on the other search criteria. Default is false.
       */
      includeAliases?: boolean
      /**
       * The last name of the offender.
       */
      lastName?: string
      /**
       * Offender's location filter (IN, OUT or ALL) - defaults to ALL.
       */
      location?: 'ALL' | 'IN' | 'OUT'
      /**
       * Max Date Range, applied to <i>dobFrom</i> or <i>dobTo</i>, default is 10, max allowed is 10
       */
      maxYearsRange?: number
      /**
       * The middle name(s) of the offender.
       */
      middleNames?: string
      /**
       * List of offender Numbers (NOMS ID)
       */
      offenderNos?: string[]
      /**
       * If <i>true</i>, the search will use partial, start-of-name matching of offender names (where provided). For example, if <i>lastName</i> criteria of 'AD' is specified, this will match an offender whose last name is 'ADAMS' but not an offender whose last name is 'HADAD'. This will typically increase the number of matching offenders found. This parameter can be used with any other search processing parameter (e.g. <i>prioritisedMatch</i> or <i>anyMatch</i>).
       */
      partialNameMatch?: boolean
      /**
       * The offender's PNC (Police National Computer) number.
       */
      pncNumber?: string
      /**
       * If <i>true</i>, search criteria prioritisation is used and searching/matching will stop as soon as one or more matching offenders are found. The criteria priority is:<br/><br/>1. <i>offenderNo</i><br/> 2. <i>pncNumber</i><br/>3. <i>croNumber</i><br/>4. <i>firstName</i>, <i>lastName</i>, <i>dob</i> <br/>5. <i>dobFrom</i>, <i>dobTo</i><br/><br/>As an example of how this works, if this parameter is set <i>true</i> and an <i>offenderNo</i> is specified and an offender having this offender number is found, searching will stop and that offender will be returned immediately. If no offender matching the specified <i>offenderNo</i> is found, the search will be repeated using the next priority criteria (<i>pncNumber</i>) and so on. Note that offender name and date of birth criteria have the same priority and will be used together to search for matching offenders.
       */
      prioritisedMatch?: boolean
    }
    /**
     * Prisoner Identifier
     */
    PrisonerIdentifier: {
      /**
       * Prisoner Identifier
       */
      id: string
    }
    /**
     * Prisoner Information
     */
    PrisonerInformation: {
      /**
       * Date of admission into this prison
       */
      admissionDate?: string
      /**
       * Date Prisoner booking was initial made
       */
      bookingBeginDate?: string
      /**
       * Booking Id (Internal)
       */
      bookingId: number
      /**
       * Category of this prisoner
       */
      categoryCode?: string
      /**
       * Status of prisoner in community
       */
      communityStatus: 'ACTIVE IN' | 'ACTIVE OUT'
      /**
       * Date of Birth
       */
      dateOfBirth: string
      /**
       * Indicated that is English speaking
       */
      englishSpeaking: boolean
      /**
       * Establishment Code for prisoner
       */
      establishmentCode: string
      /**
       * Gender
       */
      gender: string
      /**
       * Given Name 1
       */
      givenName1: string
      /**
       * Given Name 2
       */
      givenName2?: string
      /**
       * Last Name
       */
      lastName: string
      /**
       * Legal Status
       */
      legalStatus?:
        | 'CIVIL_PRISONER'
        | 'CONVICTED_UNSENTENCED'
        | 'DEAD'
        | 'IMMIGRATION_DETAINEE'
        | 'INDETERMINATE_SENTENCE'
        | 'OTHER'
        | 'RECALL'
        | 'REMAND'
        | 'SENTENCED'
        | 'UNKNOWN'
      /**
       * Offender Identifier
       */
      nomsId: string
      /**
       * Confirmed, actual, approved, provisional or calculated release date for offender, according to offender release date algorithm.<h3>Algorithm</h3><ul><li>If there is a confirmed release date, the offender release date is the confirmed release date.</li><li>If there is no confirmed release date for the offender, the offender release date is either the actual parole date or the home detention curfew actual date.</li><li>If there is no confirmed release date, actual parole date or home detention curfew actual date for the offender, the release date is the later of the nonDtoReleaseDate or midTermDate value (if either or both are present)</li></ul>
       */
      releaseDate?: string
      /**
       * Requested Name
       */
      requestedName?: string
      /**
       * Level 1 Location Unit Code
       */
      unitCode1?: string
      /**
       * Level 2 Location Unit Code
       */
      unitCode2?: string
      /**
       * Level 3 Location Unit Code
       */
      unitCode3?: string
    }
    /**
     * Prisoner Schedule
     */
    PrisonerSchedule: {
      /**
       * Booking id for offender
       */
      bookingId?: number
      /**
       * Offender cell
       */
      cellLocation: string
      /**
       * Comment
       */
      comment: string
      /**
       * Date and time at which event ends
       */
      endTime?: string
      /**
       * Event code
       */
      event: string
      /**
       * Description of event code
       */
      eventDescription: string
      /**
       * Activity id if any. Used to attend or pay the event
       */
      eventId?: number
      /**
       * Location of the event
       */
      eventLocation: string
      /**
       * Id of an internal event location
       */
      eventLocationId?: number
      /**
       * Attendance, possible values are the codes in the 'PS_PA_OC' reference domain
       */
      eventOutcome?: string
      /**
       * The event's status. Includes 'CANC', meaning cancelled for 'VISIT'
       */
      eventStatus: string
      /**
       * Event type, e.g. VISIT, APP, PRISON_ACT
       */
      eventType: string
      /**
       * Activity excluded flag
       */
      excluded?: boolean
      /**
       * Offender first name
       */
      firstName: string
      /**
       * Offender last name
       */
      lastName: string
      /**
       * The code for the activity location
       */
      locationCode?: string
      /**
       * The number which (uniquely) identifies the internal location associated with the Scheduled Event (Prisoner Schedule)
       */
      locationId: number
      /**
       * Offender number (e.g. NOMS Number)
       */
      offenderNo: string
      /**
       * No-pay reason
       */
      outcomeComment?: string
      /**
       * Activity paid flag
       */
      paid?: boolean
      /**
       * Amount paid per activity session in pounds
       */
      payRate?: number
      /**
       * Possible values are the codes in the 'PERFORMANCE' reference domain
       */
      performance?: string
      /**
       * Date and time at which event starts
       */
      startTime: string
      /**
       * Event scheduled has been suspended
       */
      suspended?: boolean
      /**
       * Activity time slot
       */
      timeSlot?: 'AM' | 'ED' | 'PM'
    }
    /**
     * Incentive & Earned Privilege Details
     */
    PrivilegeDetail: {
      /**
       * Identifier of Agency this privilege entry is associated with.
       */
      agencyId: string
      /**
       * Offender booking identifier.
       */
      bookingId: number
      /**
       * Further details relating to this privilege entry.
       */
      comments?: string
      /**
       * Effective date of IEP level.
       */
      iepDate: string
      /**
       * The IEP level (e.g. Basic, Standard or Enhanced).
       */
      iepLevel: string
      /**
       * Effective date & time of IEP level.
       */
      iepTime?: string
      /**
       * Identifier of user related to this privilege entry.
       */
      userId?: string
    }
    /**
     * Incentive & Earned Privilege Summary
     */
    PrivilegeSummary: {
      /**
       * Offender booking identifier.
       */
      bookingId: number
      /**
       * The number of days since last review.
       */
      daysSinceReview: number
      /**
       * Effective date of current IEP level.
       */
      iepDate: string
      /**
       * All IEP detail entries for the offender (most recent first).
       */
      iepDetails?: components['schemas']['PrivilegeDetail'][]
      /**
       * The current IEP level (e.g. Basic, Standard or Enhanced).
       */
      iepLevel: 'Basic' | 'Enhanced' | 'Standard'
      /**
       * Effective date & time of current IEP level.
       */
      iepTime?: string
    }
    /**
     * Profile Information
     */
    ProfileInformation: {
      /**
       * Profile Question
       */
      question: string
      /**
       * Profile Result Answer
       */
      resultValue: string
      /**
       * Type of profile information
       */
      type: string
    }
    /**
     * Offender property container details
     */
    PropertyContainer: {
      /**
       * The type of container
       */
      containerType?: string
      /**
       * The location id of the property container
       */
      location?: components['schemas']['Location']
      /**
       * The case sequence number for the offender
       */
      sealMark?: string
    }
    /**
     * Questionnaire
     */
    Questionnaire: {
      /**
       * Code to identify this questionnaire
       */
      code: string
      /**
       * ID internal of this Questionnaire
       */
      questionnaireId: number
      /**
       * List of Questions (with Answers) for this Questionnaire
       */
      questions: components['schemas']['QuestionnaireQuestion'][]
    }
    /**
     * Questionnaire Answer
     */
    QuestionnaireAnswer: {
      answerActiveFlag: boolean
      answerDesc: string
      answerExpiryDate: string
      answerListSeq: number
      answerSeq: number
      commentRequiredFlag: boolean
      dateRequiredFlag: boolean
      /**
       * ID for this Answer
       */
      questionnaireAnsId: number
    }
    /**
     * Questionnaire Question
     */
    QuestionnaireQuestion: {
      answers: components['schemas']['QuestionnaireAnswer'][]
      multipleAnswerFlag: boolean
      nextQuestionnaireQueId: number
      questionActiveFlag: boolean
      questionDesc: string
      questionExpiryDate: string
      questionListSeq: number
      questionSeq: number
      questionnaireQueId: number
    }
    /**
     * Reasonable Adjustment
     */
    ReasonableAdjustment: {
      /**
       * The agency id where the adjustment was created
       */
      agencyId?: string
      /**
       * Comment Text
       */
      commentText?: string
      /**
       * End Date
       */
      endDate?: string
      /**
       * Start Date
       */
      startDate?: string
      /**
       * Treatment Code
       */
      treatmentCode?: string
      /**
       * Treatment Description
       */
      treatmentDescription?: string
    }
    /**
     * Reasonable Adjustments
     */
    ReasonableAdjustments: {
      /**
       * Reasonable Adjustments
       */
      reasonableAdjustments?: components['schemas']['ReasonableAdjustment'][]
    }
    /**
     * Recall Offender Booking
     */
    RecallBooking: {
      /**
       * The offender's date of birth. Must be specified in YYYY-MM-DD format.
       */
      dateOfBirth: string
      /**
       * The offender's first name.
       */
      firstName: string
      /**
       * A code representing the offender's gender (from the SEX reference domain).
       */
      gender: string
      /**
       * The offender's last name.
       */
      lastName: string
      /**
       * A unique offender number.
       */
      offenderNo: string
      /**
       * Prison ID (Agency ID) of where to place offender
       */
      prisonId?: string
      /**
       * A code representing the reason for the offender's recall. 'B' = Recall from HDC. 'Y' = Recall from DTO.
       */
      reason: 'B' | 'Y'
      /**
       * A flag to indicate that the offender is a youth/young offender (or not). Defaults to false if not specified.
       */
      youthOffender?: boolean
    }
    /**
     * Reference Code
     */
    ReferenceCode: {
      /**
       * Reference data item active indicator flag.
       */
      activeFlag: 'N' | 'Y'
      /**
       * Reference data item code.
       */
      code: string
      /**
       * Reference data item description.
       */
      description: string
      /**
       * Reference data item domain.
       */
      domain: string
      /**
       * Expired Date
       */
      expiredDate?: string
      /**
       * List Sequence
       */
      listSeq?: number
      /**
       * Parent reference data item code.
       */
      parentCode?: string
      /**
       * Parent reference data item domain.
       */
      parentDomain?: string
      /**
       * List of subordinate reference data items associated with this reference data item.
       */
      subCodes?: components['schemas']['ReferenceCode'][]
      /**
       * System Data Flag
       */
      systemDataFlag?: 'N' | 'Y'
    }
    /**
     * Reference Code Data
     */
    ReferenceCodeInfo: {
      /**
       * Reference data item active indicator flag.
       */
      activeFlag: 'N' | 'Y'
      /**
       * Reference data item description.
       */
      description: string
      /**
       * Expired Date
       */
      expiredDate?: string
      /**
       * List Sequence
       */
      listSeq?: number
      /**
       * Parent reference data item code.
       */
      parentCode?: string
      /**
       * Parent reference data item domain.
       */
      parentDomain?: string
      /**
       * System Data Flag
       */
      systemDataFlag?: 'N' | 'Y'
    }
    /**
     * Offender transaction drill down details
     */
    RelatedTransactionDetails: {
      /**
       * Bonus payment
       */
      bonusPay?: number
      /**
       * Calendar date the payment was processed
       */
      calendarDate?: string
      /**
       * Event id the payment is associated with
       */
      eventId?: number
      /**
       * Transaction details id
       */
      id?: number
      /**
       * Payment amount
       */
      payAmount?: number
      /**
       * Pay type code
       */
      payTypeCode?: string
      /**
       * Piece work amount
       */
      pieceWork?: number
      /**
       * Transaction Sequence
       */
      transactionEntrySequence?: number
      /**
       * Transaction Id
       */
      transactionId?: number
    }
    /**
     * Summary data for a scheduled offender release
     */
    ReleaseEvent: {
      /**
       * The approved release date
       */
      approvedReleaseDate: string
      /**
       * The booking active flag
       */
      bookingActiveFlag: boolean
      /**
       * The booking in or out status - either IN or OUT
       */
      bookingInOutStatus: string
      /**
       * Any comment text entered against this event
       */
      commentText: string
      /**
       * Date and time the record was created in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      createDateTime: string
      /**
       * The event class - usually EXT_MOV
       */
      eventClass: string
      /**
       * The internal event ID
       */
      eventId: number
      /**
       * The event status - either SCH (scheduled) or COMP (completed)
       */
      eventStatus: string
      /**
       * The agency code from which the release will be made
       */
      fromAgency: string
      /**
       * The agency description
       */
      fromAgencyDescription: string
      /**
       * The movement reason code - from OFFENDER_IND_SCHEDULE
       */
      movementReasonCode: string
      /**
       * The movement reason description from reference data
       */
      movementReasonDescription: string
      /**
       * The movement type code - from OFFENDER_IND_SCHEDULE
       */
      movementTypeCode: string
      /**
       * The movement type description from reference data
       */
      movementTypeDescription: string
      /**
       * Offender number (NOMS ID)
       */
      offenderNo: string
      /**
       * The planned release date
       */
      releaseDate: string
    }
    Repeat: {
      /**
       * The total number of appointments. Must be greater than 0
       */
      count: number
      /**
       * The period at which the appointment should repeat.
       */
      repeatPeriod: 'DAILY' | 'FORTNIGHTLY' | 'MONTHLY' | 'WEEKDAYS' | 'WEEKLY'
    }
    /**
     * Request move offender to cell swap
     */
    RequestMoveToCellSwap: {
      /**
       * The date / time of the move (defaults to current)
       */
      dateTime?: string
      /**
       * The reason code for the move (from reason code domain CHG_HOUS_RSN) (defaults to ADM)
       */
      reasonCode?: string
    }
    /**
     * Request release of prisoner
     */
    RequestToReleasePrisoner: {
      /**
       * Additional comments about the release
       */
      commentText?: string
      /**
       * Reason code for the release, reference domain is MOVE_RSN
       */
      movementReasonCode?:
        | 'AR'
        | 'AU'
        | 'BD'
        | 'BL'
        | 'CE'
        | 'CR'
        | 'D1'
        | 'D2'
        | 'D3'
        | 'D4'
        | 'D5'
        | 'D6'
        | 'DA'
        | 'DD'
        | 'DE'
        | 'DEC'
        | 'DL'
        | 'DS'
        | 'ER'
        | 'ESCP'
        | 'ETR'
        | 'EX'
        | 'HC'
        | 'HD'
        | 'HE'
        | 'HP'
        | 'HR'
        | 'HU'
        | 'IF'
        | 'MRG'
        | 'NCS'
        | 'NG'
        | 'NP'
        | 'PD'
        | 'PF'
        | 'PX'
        | 'RE'
        | 'RW'
        | 'SC'
        | 'UAL'
      /**
       * The time the release occurred, if not supplied it will be the current time
       */
      releaseTime: string
    }
    /**
     * Represents the data required for transferring a prisoner to a new location
     */
    RequestToTransferOut: {
      /**
       * Additional comments about the release
       */
      commentText?: string
      /**
       * The escort type of the move.
       */
      escortType: string
      /**
       * The time the movement occurred, if not supplied it will be the current time
       */
      movementTime: string
      /**
       * The location to be moved to.
       */
      toLocation: string
      /**
       * Reason code for the transfer, reference domain is MOVE_RSN
       */
      transferReasonCode?: string
    }
    /**
     * Establishment roll count numbers for a housing block, wing, or reception etc.
     */
    RollCount: {
      /**
       * All empty beds
       */
      availablePhysical: number
      /**
       * No of residential prisoners
       */
      bedsInUse: number
      /**
       * No of residential prisoners actually in
       */
      currentlyInCell: number
      /**
       * No of residential prisoners out
       */
      currentlyOut: number
      /**
       * Wing, houseblock etc. name
       */
      livingUnitDesc: string
      /**
       * Id of location
       */
      livingUnitId: number
      /**
       * Total capacity including unavailable cells
       */
      maximumCapacity: number
      /**
       * Available empty beds
       */
      netVacancies: number
      /**
       * Total capacity not including unavailable cells
       */
      operationalCapacity: number
      /**
       * No of unavailable cells
       */
      outOfOrder: number
    }
    /**
     * An Adjudication Sanction
     */
    Sanction: {
      /**
       * Comment
       */
      comment?: string
      /**
       * Compensation Amount
       */
      compensationAmount?: number
      /**
       * Consecutive Sanction Seq
       */
      consecutiveSanctionSeq?: number
      /**
       * Effective
       */
      effectiveDate?: string
      /**
       * Sanction Days
       */
      sanctionDays?: number
      /**
       * Sanction Months
       */
      sanctionMonths?: number
      /**
       * Sanction Seq
       */
      sanctionSeq?: number
      /**
       * Sanction Type
       */
      sanctionType?: string
      /**
       * Sanction status
       */
      status?: string
      /**
       * Status Date
       */
      statusDate?: string
    }
    /**
     * Represents the data required for scheduling a prison to prison move.
     */
    SchedulePrisonToPrisonMove: {
      /**
       * The escort type of the move.
       */
      escortType: string
      /**
       * The prison (agency code) to be moved from.
       */
      fromPrisonLocation: string
      /**
       * The date and time of the move in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      scheduledMoveDateTime: string
      /**
       * The prison (agency code) to be moved to.
       */
      toPrisonLocation: string
    }
    /**
     * Scheduled appointment
     */
    ScheduledAppointmentDto: {
      /**
       * Agency the appointment belongs to
       */
      agencyId?: string
      /**
       * Appointment code
       */
      appointmentTypeCode?: string
      /**
       * Description of appointment type
       */
      appointmentTypeDescription?: string
      /**
       * Staff member who created the appointment
       */
      createUserId?: string
      /**
       * Date the appointment is scheduled
       */
      date?: string
      /**
       * Date and time at which appointment ends
       */
      endTime?: string
      /**
       * Offender first name
       */
      firstName?: string
      /**
       * Appointment id
       */
      id?: number
      /**
       * Offender last name
       */
      lastName?: string
      /**
       * Description of location the appointment is held
       */
      locationDescription?: string
      /**
       * Id of location the appointment is held
       */
      locationId?: number
      /**
       * Offender number (e.g. NOMS Number)
       */
      offenderNo?: string
      /**
       * Date and time at which appointment starts
       */
      startTime?: string
    }
    /**
     * Scheduled Event
     */
    ScheduledEvent: {
      /**
       * The agency ID for the booked internal location
       */
      agencyId?: string
      /**
       * Offender booking id
       */
      bookingId: number
      /**
       * Date and time at which event ends
       */
      endTime?: string
      /**
       * Class of event
       */
      eventClass: string
      /**
       * Date on which event occurs
       */
      eventDate: string
      /**
       * Activity id if any. Used to attend or pay an activity.
       */
      eventId?: number
      /**
       * Location at which event takes place (could be an internal location, agency or external address).
       */
      eventLocation?: string
      /**
       * Id of an internal event location
       */
      eventLocationId?: number
      /**
       * Activity attendance, possible values are the codes in the 'PS_PA_OC' reference domain.
       */
      eventOutcome?: string
      /**
       * Code identifying underlying source of event data
       */
      eventSource: string
      /**
       * Source-specific code for the type or nature of the event
       */
      eventSourceCode?: string
      /**
       * Source-specific description for type or nature of the event
       */
      eventSourceDesc?: string
      /**
       * Status of event
       */
      eventStatus: string
      /**
       * Sub type (or reason) of scheduled event (as a code)
       */
      eventSubType: string
      /**
       * Description of scheduled event sub type
       */
      eventSubTypeDesc: string
      /**
       * Type of scheduled event (as a code)
       */
      eventType: string
      /**
       * Description of scheduled event type
       */
      eventTypeDesc: string
      /**
       * The code for the activity location
       */
      locationCode?: string
      /**
       * Activity no-pay reason.
       */
      outcomeComment?: string
      /**
       * Activity paid flag.
       */
      paid?: boolean
      /**
       * Amount paid per activity session in pounds
       */
      payRate?: number
      /**
       * Activity performance, possible values are the codes in the 'PERFORMANCE' reference domain.
       */
      performance?: string
      /**
       * Date and time at which event starts
       */
      startTime?: string
    }
    /**
     * Represents the data for a scheduled prison to prison move.
     */
    ScheduledPrisonToPrisonMove: {
      /**
       * The location of the prison to move from.
       */
      fromPrisonLocation?: components['schemas']['Agency']
      /**
       * The identifier for the scheduled prison to prison move.
       */
      id?: number
      /**
       * The date and start time of the move in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      scheduledMoveDateTime?: string
      /**
       * The location of the prison to move to.
       */
      toPrisonLocation?: components['schemas']['Agency']
    }
    /**
     * Secondary language
     */
    SecondaryLanguage: {
      /**
       * Booking id
       */
      bookingId?: number
      /**
       * Reading proficiency
       */
      canRead?: boolean
      /**
       * Speaking proficiency
       */
      canSpeak?: boolean
      /**
       * Writing proficiency
       */
      canWrite?: boolean
      /**
       * Language code
       */
      code?: string
      /**
       * Language description
       */
      description?: string
    }
    /**
     * Sentence adjustments
     */
    SentenceAdjustmentDetail: {
      /**
       * Number of additional days awarded
       */
      additionalDaysAwarded?: number
      /**
       * Number of lawfully at large days
       */
      lawfullyAtLarge?: number
      /**
       * Number of recall sentence remand days
       */
      recallSentenceRemand?: number
      /**
       * Number of recall sentence tagged bail days
       */
      recallSentenceTaggedBail?: number
      /**
       * Number of remand days
       */
      remand?: number
      /**
       * Number of restored additional days awarded
       */
      restoredAdditionalDaysAwarded?: number
      /**
       * Number of special remission days
       */
      specialRemission?: number
      /**
       * Number of tagged bail days
       */
      taggedBail?: number
      /**
       * Number unlawfully at large days
       */
      unlawfullyAtLarge?: number
      /**
       * Number of unused remand days
       */
      unusedRemand?: number
    }
    /**
     * Sentence Details
     */
    SentenceDetail: {
      /**
       * APD - the offender's actual parole date.
       */
      actualParoleDate?: string
      /**
       * ADA - days added to sentence term due to adjustments.
       */
      additionalDaysAwarded?: number
      /**
       * ARD - calculated automatic (unconditional) release date for offender.
       */
      automaticReleaseDate?: string
      /**
       * ARD (override) - automatic (unconditional) release override date for offender.
       */
      automaticReleaseOverrideDate?: string
      /**
       * Offender booking id.
       */
      bookingId: number
      /**
       * CRD - calculated conditional release date for offender.
       */
      conditionalReleaseDate?: string
      /**
       * CRD (override) - conditional release override date for offender.
       */
      conditionalReleaseOverrideDate?: string
      /**
       * Confirmed release date for offender.
       */
      confirmedReleaseDate?: string
      /**
       * DPRRD - Detention training order post recall release date
       */
      dtoPostRecallReleaseDate?: string
      /**
       * DPRRD (override) - detention training order post-recall release override date for offender
       */
      dtoPostRecallReleaseDateOverride?: string
      /**
       * ERSED - the date on which offender will be eligible for early removal (under the Early Removal Scheme for foreign nationals).
       */
      earlyRemovalSchemeEligibilityDate?: string
      /**
       * ETD - early term date for offender.
       */
      earlyTermDate?: string
      /**
       * Effective sentence end date
       */
      effectiveSentenceEndDate?: string
      /**
       * HDCAD - the offender's actual home detention curfew date.
       */
      homeDetentionCurfewActualDate?: string
      /**
       * HDCED - date on which offender will be eligible for home detention curfew.
       */
      homeDetentionCurfewEligibilityDate?: string
      /**
       * LTD - late term date for offender.
       */
      lateTermDate?: string
      /**
       * LED - date on which offender licence expires.
       */
      licenceExpiryDate?: string
      /**
       * MTD - mid term date for offender.
       */
      midTermDate?: string
      /**
       * Release date for non-DTO sentence (if applicable). This will be based on one of ARD, CRD, NPD or PRRD.
       */
      nonDtoReleaseDate?: string
      /**
       * Indicates which type of non-DTO release date is the effective release date. One of 'ARD', 'CRD', 'NPD' or 'PRRD'.
       */
      nonDtoReleaseDateType: 'ARD' | 'CRD' | 'NPD' | 'PRRD'
      /**
       * NPD - calculated non-parole date for offender (relating to the 1991 act).
       */
      nonParoleDate?: string
      /**
       * NPD (override) - non-parole override date for offender.
       */
      nonParoleOverrideDate?: string
      /**
       * PED - date on which offender is eligible for parole.
       */
      paroleEligibilityDate?: string
      /**
       * PRRD - calculated post-recall release date for offender.
       */
      postRecallReleaseDate?: string
      /**
       * PRRD (override) - post-recall release override date for offender.
       */
      postRecallReleaseOverrideDate?: string
      /**
       * Confirmed, actual, approved, provisional or calculated release date for offender, according to offender release date algorithm.<h3>Algorithm</h3><ul><li>If there is a confirmed release date, the offender release date is the confirmed release date.</li><li>If there is no confirmed release date for the offender, the offender release date is either the actual parole date or the home detention curfew actual date.</li><li>If there is no confirmed release date, actual parole date or home detention curfew actual date for the offender, the release date is the later of the nonDtoReleaseDate or midTermDate value (if either or both are present)</li></ul>
       */
      releaseDate?: string
      /**
       * ROTL - the date on which offender will be released on temporary licence.
       */
      releaseOnTemporaryLicenceDate?: string
      /**
       * SED - date on which sentence expires.
       */
      sentenceExpiryDate?: string
      /**
       * Sentence start date.
       */
      sentenceStartDate: string
      /**
       * Date on which minimum term is reached for parole (indeterminate/life sentences).
       */
      tariffDate?: string
      /**
       * TERSED - Tariff early removal scheme eligibility date
       */
      tariffEarlyRemovalSchemeEligibilityDate?: string
      /**
       * TUSED - top-up supervision expiry date for offender.
       */
      topupSupervisionExpiryDate?: string
    }
    Sort: { empty?: boolean; sorted?: boolean; unsorted?: boolean }
    /**
     * Staff Details
     */
    StaffDetail: {
      /**
       * Date of Birth of Staff Member
       */
      dateOfBirth?: string
      /**
       * Staff member's first name.
       */
      firstName: string
      /**
       * Gender of Staff Member
       */
      gender?: 'F' | 'M' | 'NK' | 'NS' | 'REF'
      /**
       * Staff member's last name.
       */
      lastName: string
      /**
       * Unique identifier for staff member.
       */
      staffId: number
      /**
       * Status of staff member.
       */
      status: 'ACTIVE' | 'INACTIVE'
      /**
       * Identifier for staff member image.
       */
      thumbnailId?: number
    }
    /**
     * Staff Details with position and role
     */
    StaffLocationRole: {
      /**
       * Agency description.
       */
      agencyDescription?: string
      /**
       * Agency at which staff member is performing role.
       */
      agencyId: string
      /**
       * Date of Birth of Staff Member
       */
      dateOfBirth?: string
      /**
       * Staff member's first name.
       */
      firstName: string
      /**
       * Date from which staff member is actively performing role.
       */
      fromDate: string
      /**
       * Gender of Staff Member
       */
      gender?: 'F' | 'M' | 'NK' | 'NS' | 'REF'
      /**
       * Number of hours worked per week by staff member.
       */
      hoursPerWeek?: number
      /**
       * Staff member's last name.
       */
      lastName: string
      /**
       * A code that defines staff member's position at agency.
       */
      position: string
      /**
       * Description of staff member's position at agency.
       */
      positionDescription?: string
      /**
       * A code that defines staff member's role at agency.
       */
      role: string
      /**
       * Description of staff member's role at agency.
       */
      roleDescription?: string
      /**
       * A code the defines staff member's schedule type.
       */
      scheduleType?: string
      /**
       * Description of staff member's schedule type.
       */
      scheduleTypeDescription?: string
      /**
       * Unique identifier for staff member.
       */
      staffId: number
      /**
       * Status of staff member.
       */
      status: 'ACTIVE' | 'INACTIVE'
      /**
       * Identifier for staff member image.
       */
      thumbnailId?: number
      /**
       * Date on which staff member stops actively performing role.
       */
      toDate?: string
    }
    /**
     * Staff Role
     */
    StaffRole: {
      /**
       * A code that defines staff member's role at agency.
       */
      role: string
      /**
       * Description of staff member's role at agency.
       */
      roleDescription?: string
    }
    /**
     * Staff User Role
     */
    StaffUserRole: {
      /**
       * caseload that this role belongs to, (NOMIS only)
       */
      caseloadId?: string
      /**
       * role code of the parent role
       */
      parentRoleCode?: string
      /**
       * code for this role
       */
      roleCode: string
      /**
       * Role Id
       */
      roleId: number
      /**
       * Full text description of the role type
       */
      roleName: string
      /**
       * Staff Id
       */
      staffId: number
      /**
       * Staff username
       */
      username: string
    }
    /**
     * Transaction to Create
     */
    StorePaymentRequest: {
      /**
       * Amount of the payment in pence, hence 1634 is £16.34
       */
      amount?: number
      /**
       * Client transaction identifier
       */
      client_transaction_id?: string
      /**
       * Description of the payment
       */
      description?: string
      /**
       * Valid payment type for the prison
       */
      type?: 'ADJ' | 'A_EARN'
    }
    /**
     * Telephone Details
     */
    Telephone: {
      /**
       * Telephone extention number
       */
      ext?: string
      /**
       * Telephone number
       */
      number: string
      /**
       * Telephone type
       */
      type: string
    }
    /**
     * Transaction Response
     */
    Transaction: {
      /**
       * ID of created transaction
       */
      id?: string
    }
    /**
     * Transfer Response
     */
    Transfer: {
      /**
       * Current Location
       */
      current_location?: components['schemas']['CodeDescription']
      /**
       * Transaction
       */
      transaction?: components['schemas']['Transaction']
    }
    /**
     * A scheduled offender movement event
     */
    TransferEvent: {
      /**
       * The booking active flag
       */
      bookingActiveFlag: boolean
      /**
       * The booking in or out status - either IN or OUT from offender bookings
       */
      bookingInOutStatus: string
      /**
       * Date and time the record was created in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      createDateTime: string
      /**
       * The direction code (IN or OUT)
       */
      directionCode: string
      /**
       * The planned date and time of the end of the event in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      endTime: string
      /**
       * Engagement code
       */
      engagementCode: string
      /**
       * The escort code
       */
      escortCode: string
      /**
       * The event class - from OFFENDER_IND_SCHEDULES
       */
      eventClass: string
      /**
       * The date on which the event is scheduled to occur
       */
      eventDate: string
      /**
       * The internal event ID
       */
      eventId: number
      /**
       * The event status - either SCH or COMP
       */
      eventStatus: string
      /**
       * The event sub-type - from OFFENDER_IND_SCHEDULES
       */
      eventSubType: string
      /**
       * The event type - from OFFENDER_IND_SCHEDULES
       */
      eventType: string
      /**
       * The agency code from which the event will start
       */
      fromAgency: string
      /**
       * The from agency description
       */
      fromAgencyDescription: string
      /**
       * The name of the judge where known
       */
      judgeName: string
      /**
       * Offender number(NOMS ID)
       */
      offenderNo: string
      /**
       * The outcome reason code - from offender_ind_schedules
       */
      outcomeReasonCode: string
      /**
       * The performance code
       */
      performanceCode: string
      /**
       * The planned date and time of the start of the event in Europe/London (ISO 8601) format without timezone offset e.g. YYYY-MM-DDTHH:MM:SS.
       */
      startTime: string
      /**
       * The agency code to which the transfer will be made (if an agency)
       */
      toAgency: string
      /**
       * The to agency description
       */
      toAgencyDescription: string
      /**
       * The destination city when available
       */
      toCity: string
    }
    /**
     * The container object for transfer and movement events
     */
    TransferSummary: {
      /**
       * List of scheduled or completed court events
       */
      courtEvents?: components['schemas']['CourtEvent'][]
      /**
       * List of confirmed movements
       */
      movements?: components['schemas']['MovementSummary'][]
      /**
       * List of scheduled or completed release events
       */
      releaseEvents?: components['schemas']['ReleaseEvent'][]
      /**
       * List of scheduled or completed offender events
       */
      transferEvents?: components['schemas']['TransferEvent'][]
    }
    /**
     * Transfer to Savings Transaction
     */
    TransferTransaction: {
      /**
       * Amount of transaction in pence, hence 1634 is £16.34
       */
      amount?: number
      /**
       * Client Transaction Id
       */
      client_transaction_id?: string
      /**
       * A reference unique to the client making the post. Maximum size 64 characters, only alphabetic, numeric, '-' and '_' are allowed
       */
      client_unique_ref?: string
      /**
       * Description of the Transaction
       */
      description?: string
    }
    /**
     * Detail of result of transfer transaction
     */
    TransferTransactionDetail: {
      /**
       * Credit Transaction
       */
      creditTransaction?: components['schemas']['Transaction']
      /**
       * Debit Transaction
       */
      debitTransaction?: components['schemas']['Transaction']
      /**
       * Transaction Id
       */
      transactionId?: number
    }
    /**
     * Type Value
     */
    TypeValue: {
      /**
       * Type
       */
      type?: string
      /**
       * Value
       */
      value?: string
    }
    /**
     * Date Unavailability Reasons
     */
    UnavailabilityReason: {
      /**
       * Banned
       */
      banned?: boolean
      /**
       * Existing Visits
       */
      existing_visits?: components['schemas']['Visit'][]
      /**
       * External Movement
       */
      external_movement?: boolean
      /**
       * Out of Vo
       */
      out_of_vo?: boolean
    }
    /**
     * Attendance details.  This is used to update the attendance details of an offender
     */
    UpdateAttendance: {
      /**
       * Attendance outcome, possible values are the codes in the 'PS_PA_OC' reference domain.
       */
      eventOutcome: 'ABS' | 'ACCAB' | 'ATT' | 'CANC' | 'NREQ' | 'REST' | 'SUS' | 'UNACAB'
      /**
       * Free text comment, maximum length 240 characters.
       */
      outcomeComment?: string
      /**
       * Possible values are the codes in the 'PERFORMANCE' reference domain, mandatory for eventOutcome 'ATT'.
       */
      performance?: 'ACCEPT' | 'GOOD' | 'POOR' | 'STANDARD' | 'UNACCEPT'
    }
    /**
     * Attendance details.  This is used to update the attendance details of multiple bookings
     */
    UpdateAttendanceBatch: {
      /**
       * set of booking and activity ids
       */
      bookingActivities: components['schemas']['BookingActivity'][]
      /**
       * Attendance outcome, possible values are the codes in the 'PS_PA_OC' reference domain.
       */
      eventOutcome: 'ABS' | 'ACCAB' | 'ATT' | 'CANC' | 'NREQ' | 'REST' | 'SUS' | 'UNACAB'
      /**
       * Free text comment, maximum length 240 characters.
       */
      outcomeComment?: string
      /**
       * Possible values are the codes in the 'PERFORMANCE' reference domain, mandatory for eventOutcome 'ATT'.
       */
      performance?: 'ACCEPT' | 'GOOD' | 'POOR' | 'STANDARD' | 'UNACCEPT'
    }
    /**
     * Update Case Note
     */
    UpdateCaseNote: {
      /**
       * Updated Case Note Text
       */
      text: string
    }
    /**
     * User Details
     */
    UserDetail: {
      /**
       * Status of the User Account
       */
      accountStatus: 'ACTIVE' | 'CAREER' | 'INACT' | 'MAT' | 'SAB' | 'SICK' | 'SUS'
      /**
       * Indicate if the account is active
       */
      active: boolean
      /**
       * Current Active Caseload
       */
      activeCaseLoadId?: string
      /**
       * Indicates the user account has expired
       */
      expiredFlag?: boolean
      /**
       * Date the user account has expired
       */
      expiryDate?: string
      /**
       * First Name
       */
      firstName: string
      /**
       * Last Name
       */
      lastName: string
      /**
       * Date the user account was locked
       */
      lockDate: string
      /**
       * The User account is locked
       */
      lockedFlag?: boolean
      /**
       * Staff Id
       */
      staffId: number
      /**
       * Image Thumbnail Id
       */
      thumbnailId?: number
      /**
       * Username
       */
      username: string
    }
    /**
     * User Role
     */
    UserRole: {
      /**
       * caseload that this role belongs to, (NOMIS only)
       */
      caseloadId?: string
      /**
       * role code of the parent role
       */
      parentRoleCode?: string
      /**
       * code for this role
       */
      roleCode: string
      /**
       * Role Id
       */
      roleId: number
      /**
       * Full text description of the role type
       */
      roleName: string
    }
    /**
     * Visit Details
     */
    Visit: {
      /**
       * Id
       */
      id?: number
      /**
       * Slot
       */
      slot?: string
    }
    /**
     * Balances of visit orders and privilege visit orders
     */
    VisitBalances: {
      /**
       * Balance of privilege visit orders remaining
       */
      remainingPvo: number
      /**
       * Balance of visit orders remaining
       */
      remainingVo: number
    }
    /**
     * Visit details
     */
    VisitDetails: {
      /**
       * Description of cancellationReason code
       */
      cancelReasonDescription?: string
      /**
       * Reason if not attended
       */
      cancellationReason?: string
      /**
       * Date and time at which event ends
       */
      endTime?: string
      /**
       * Whether attended or not
       */
      eventOutcome: string
      /**
       * Description of eventOutcome code
       */
      eventOutcomeDescription?: string
      /**
       * Status of event
       */
      eventStatus: string
      /**
       * Description of eventStatus code
       */
      eventStatusDescription?: string
      /**
       * Name of main visitor
       */
      leadVisitor?: string
      /**
       * Location at which event takes place (could be an internal location, agency or external address).
       */
      location?: string
      /**
       * Relationship of main visitor to offender
       */
      relationship?: string
      /**
       * Description of relationship code
       */
      relationshipDescription?: string
      /**
       * Date and time at which event starts
       */
      startTime: string
      /**
       * Social or official
       */
      visitType: string
      /**
       * Description of visitType code
       */
      visitTypeDescription?: string
    }
    /**
     * Visit Restriction
     */
    VisitRestriction: {
      /**
       * Comment Text
       */
      comment_text?: string
      /**
       * Effective Date
       */
      effective_date?: string
      /**
       * Expiry Date
       */
      expiry_date?: string
      /**
       * Type
       */
      type?: components['schemas']['CodeDescription']
    }
    /**
     * Visit slots Details
     */
    VisitSlotCapacity: {
      /**
       * Adults Booked
       */
      adults_booked?: number
      /**
       * Capacity
       */
      capacity?: number
      /**
       * Groups Booked
       */
      groups_booked?: number
      /**
       * Max Adults
       */
      max_adults?: number
      /**
       * Max Groups
       */
      max_groups?: number
      /**
       * Time
       */
      time?: string
      /**
       * Visitors Booked
       */
      visitors_booked?: number
    }
    /**
     * Visit slots with capacity
     */
    VisitSlots: {
      /**
       * List of visit slots with capacity
       */
      slots?: components['schemas']['VisitSlotCapacity'][]
    }
    /**
     * List of visitors for a visit
     */
    VisitWithVisitorsOfVisitDetails: {
      /**
       * Visit Information
       */
      visitDetails: components['schemas']['VisitDetails']
      /**
       * List of visitors on visit
       */
      visitors: components['schemas']['Visitor'][]
    }
    /**
     * Visitor
     */
    Visitor: {
      /**
       * Date of birth of visitor
       */
      dateOfBirth?: string
      /**
       * First name of visitor
       */
      firstName?: string
      /**
       * Last name of visitor
       */
      lastName?: string
      /**
       * Flag marking the visitor as main or not
       */
      leadVisitor?: boolean
      /**
       * Person id of visitor
       */
      personId?: number
      /**
       * Relationship of visitor to offender
       */
      relationship?: string
    }
  }
}
