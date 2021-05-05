declare module 'courtRegister' {
  export type CourtDtoPage = schemas['CourtDtoPage']
  export type CourtDto = schemas['CourtDto']

  interface schemas {
    /** Court Update Record */
    UpdateCourtDto: {
      /** Name of the court */
      courtName: string
      /** Description of the court */
      courtDescription?: string
      /** Type of court */
      courtType: string
      /** Whether the court is still active */
      active: boolean
    }
    /** Building */
    BuildingDto: {
      /** Unique ID of the building */
      id: number
      /** Court Id for this building */
      courtId: string
      /** Sub location code for referencing building */
      subCode?: string
      /** Building Name */
      buildingName?: string
      /** Street Number and Name */
      street?: string
      /** Locality */
      locality?: string
      /** Town/City */
      town?: string
      /** County */
      county?: string
      /** Postcode */
      postcode?: string
      /** Country */
      country?: string
      /** List of contacts for this building by type */
      contacts?: schemas['ContactDto'][]
    }
    /** Contact */
    ContactDto: {
      /** Unique ID of the contact */
      id: number
      /** Court Id for this contact */
      courtId: string
      /** Building Id for this contact */
      buildingId: number
      /** Type of contact */
      type: 'TEL' | 'FAX'
      /** Details of the contact */
      detail?: string
    }
    /** Court Information */
    CourtDto: {
      /** Court ID */
      courtId: string
      /** Name of the court */
      courtName: string
      /** Description of the court */
      courtDescription?: string
      type: schemas['CourtTypeDto']
      /** Whether the court is still active */
      active: boolean
      /** List of buildings for this court entity */
      buildings?: schemas['BuildingDto'][]
    }
    /** Court Type */
    CourtTypeDto: {
      /** Type of court */
      courtType: string
      /** Description of the type of court */
      courtName: string
    }
    ErrorResponse: {
      status: number
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    /** Building Update Record */
    UpdateBuildingDto: {
      /** Building Name */
      buildingName?: string
      /** Street Number and Name */
      street?: string
      /** Locality */
      locality?: string
      /** Town/City */
      town?: string
      /** County */
      county?: string
      /** Postcode */
      postcode?: string
      /** Country */
      country?: string
      /** Sub location code for referencing building */
      subCode?: string
    }
    /** Contact */
    UpdateContactDto: {
      /** Type of contact */
      type: 'TEL' | 'FAX'
      /** Details of the contact */
      detail: string
    }
    /** Court Insert Record */
    InsertCourtDto: {
      /** Court ID */
      courtId: string
      /** Name of the court */
      courtName: string
      /** Description of the court */
      courtDescription?: string
      /** Type of court */
      courtType: string
      /** Whether the court is still active */
      active: boolean
    }
    CourtDtoPage: {
      content?: schemas['CourtDto'][]
      pageable?: schemas['Pageable']
      last?: boolean
      totalPages?: number
      totalElements?: number
      size?: number
      number?: number
      sort?: schemas['Sort']
      first?: boolean
      numberOfElements?: number
      empty?: boolean
    }
    Pageable: {
      page?: number
      size?: number
      sort?: string[]
    }
    Sort: {
      sorted?: boolean
      unsorted?: boolean
      empty?: boolean
    }
  }
}
