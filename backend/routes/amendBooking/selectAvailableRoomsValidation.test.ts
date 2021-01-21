import validator, { errorTypes } from './selectAvailableRoomsValidation'

describe('SelectAvailableRoomsValidation', () => {
  const form = {
    preAppointmentRequired: 'true',
    postAppointmentRequired: 'true',
    selectPreAppointmentLocation: '2',
    selectMainAppointmentLocation: '1',
    selectPostAppointmentLocation: '3',
    comment: 'Some comment',
  } as Record<string, string>

  describe('checking for missing form values', () => {
    it('should return an error when no pre location is selected', () => {
      expect(validator({ ...form, selectPreAppointmentLocation: '' })).toStrictEqual([errorTypes.preLocation.missing])
    })

    it('should return an error when no main location is selected', () => {
      expect(validator({ ...form, selectMainAppointmentLocation: '' })).toStrictEqual([errorTypes.missingMainLocation])
    })

    it('should return an error when no post location is selected', () => {
      expect(validator({ ...form, selectPostAppointmentLocation: '' })).toStrictEqual([errorTypes.postLocation.missing])
    })

    it('should return multiply errors when many form values are missing', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '',
          selectMainAppointmentLocation: '',
          selectPostAppointmentLocation: '',
        })
      ).toStrictEqual([errorTypes.missingMainLocation, errorTypes.preLocation.missing, errorTypes.postLocation.missing])
    })
  })

  describe('checking for difference of locations', () => {
    it('should return an error when the pre location and main location are the same', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '1',
          selectMainAppointmentLocation: '1',
        })
      ).toStrictEqual([errorTypes.preLocation.different])
    })

    it('should return an error when the post location and main location are the same', () => {
      expect(
        validator({
          ...form,
          selectMainAppointmentLocation: '1',
          selectPostAppointmentLocation: '1',
        })
      ).toStrictEqual([errorTypes.postLocation.different])
    })

    it('should not return an error when the pre, main and post locations are all different', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '2',
          selectMainAppointmentLocation: '1',
          selectPostAppointmentLocation: '3',
        })
      ).toStrictEqual([])
    })

    it('should not return an error when the pre and post locations are the same but different to the main location', () => {
      expect(
        validator({
          ...form,
          selectPreAppointmentLocation: '2',
          selectMainAppointmentLocation: '1',
          selectPostAppointmentLocation: '2',
        })
      ).toStrictEqual([])
    })
  })

  describe('checking maximum comment length validation', () => {
    it('should return an error when a comment exceeds 3600 characters', () => {
      expect(
        validator({
          ...form,
          comment: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vel gravida massa. Nullam at ultrices ipsum. Sed vel congue felis. Nam hendrerit eu diam vel sodales. Mauris pulvinar nisl in lorem lobortis ornare. Morbi in malesuada ipsum. Mauris varius, tellus a auctor ultrices, erat enim gravida tellus, sit amet porta nulla enim vitae nisi. Nulla facilisi. Mauris vel lorem id ex volutpat tristique. Phasellus luctus libero vitae risus vehicula, et mattis magna molestie. Fusce vel ligula in felis suscipit commodo. Donec eu lorem sit amet velit mollis posuere ac non dolor. Phasellus eget tristique ante, sed gravida odio. Nulla lacinia justo quis est efficitur, eget volutpat ante molestie. Quisque pulvinar odio in ante mattis malesuada. Nullam nulla velit, placerat at tortor sit amet, pharetra commodo mi. Praesent dapibus congue est sit amet consectetur. Proin eleifend vel tellus non feugiat. Nullam et felis venenatis, aliquam mi fringilla, venenatis sem. Quisque ullamcorper, lectus quis lobortis laoreet, ante sem rhoncus eros, vel dignissim lacus magna quis ipsum. Nunc vehicula ex massa, eu mattis sem gravida nec. In augue nunc, mollis et volutpat eu, tincidunt eu nunc. Aliquam egestas, orci in fermentum dignissim, enim odio pellentesque lacus, non ornare nibh ante eget nibh. Phasellus ut scelerisque metus. Aenean scelerisque libero sit amet lorem laoreet, sit amet pretium lacus porttitor. Curabitur ullamcorper ipsum nulla, non maximus risus pellentesque at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis cursus urna sed interdum pretium. Integer dignissim sed nisi at rutrum. Nulla pulvinar aliquet luctus. Proin congue lacus id arcu ultrices pellentesque. Duis quis vulputate nisi. Ut quis pulvinar est. Sed mi turpis, semper vel magna sit amet, viverra porta quam. Nam scelerisque consectetur ex id elementum. Vestibulum blandit ultrices porta. Praesent sollicitudin elit nec felis egestas, vitae lobortis massa ultrices. Sed non efficitur libero. Praesent vehicula enim vitae lectus condimentum sodales a at nibh. Integer sollicitudin diam in commodo consectetur. Aliquam erat volutpat. Cras pellentesque nisl faucibus, ultrices velit eu, rhoncus magna. Sed placerat, felis vel tempus volutpat, ligula tortor vehicula mi, vel varius velit neque non augue. Cras interdum aliquam ante, eget hendrerit nisi scelerisque non. Etiam et justo vel sem feugiat eleifend. Curabitur feugiat mattis gravida. Proin tristique, arcu ut interdum consequat, lacus lectus convallis ex, sed tempor nisi ipsum quis lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean euismod purus vel dolor pretium eleifend. Fusce vel tellus scelerisque, dapibus nulla ac, cursus est. In et laoreet magna. Aenean tristique pretium sollicitudin. Integer eu nibh velit. Sed vestibulum et quam eu interdum. Ut tempor posuere lacus, quis efficitur felis cursus eget. Morbi nunc mauris, facilisis quis leo eu, volutpat malesuada mi. Phasellus vel condimentum est, non lobortis ex. In urna tellus, pharetra nec augue eget, aliquet hendrerit odio. Fusce pellentesque enim orci, id blandit nisi ultrices et. Pellentesque ac luctus arcu. Praesent sit amet dolor vel urna rutrum facilisis. Donec tincidunt quis nunc in mattis. Ut vitae lacus elementum, imperdiet dolor eu, dignissim ligula. Fusce maximus purus ut ornare vulputate. Mauris sit amet bibendum tellus. Phasellus vulputate nisi dictum, convallis mauris at, porttitor metus. Etiam imperdiet pulvinar urna ac maximus. Fusce mollis ante. Fusce mollis anteeee.`,
        })
      ).toStrictEqual([errorTypes.commentLength])
    })

    it('should not return an error when a comment is less than 3600 characters', () => {
      expect(
        validator({
          ...form,
          comment: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vel gravida massa. Nullam at ultrices ipsum. Sed vel congue felis. Nam hendrerit eu diam vel sodales. Mauris pulvinar nisl in lorem lobortis ornare. Morbi in malesuada ipsum. Mauris varius, tellus a auctor ultrices, erat enim gravida tellus, sit amet porta nulla enim vitae nisi. Nulla facilisi. Mauris vel lorem id ex volutpat tristique. Phasellus luctus libero vitae risus vehicula, et mattis magna molestie. Fusce vel ligula in felis suscipit commodo. Donec eu lorem sit amet velit mollis posuere ac non dolor. Phasellus eget tristique ante, sed gravida odio. Nulla lacinia justo quis est efficitur, eget volutpat ante molestie. Quisque pulvinar odio in ante mattis malesuada. Nullam nulla velit, placerat at tortor sit amet, pharetra commodo mi. Praesent dapibus congue est sit amet consectetur. Proin eleifend vel tellus non feugiat. Nullam et felis venenatis, aliquam mi fringilla, venenatis sem. Quisque ullamcorper, lectus quis lobortis laoreet, ante sem rhoncus eros, vel dignissim lacus magna quis ipsum. Nunc vehicula ex massa, eu mattis sem gravida nec. In augue nunc, mollis et volutpat eu, tincidunt eu nunc. Aliquam egestas, orci in fermentum dignissim, enim odio pellentesque lacus, non ornare nibh ante eget nibh. Phasellus ut scelerisque metus. Aenean scelerisque libero sit amet lorem laoreet, sit amet pretium lacus porttitor. Curabitur ullamcorper ipsum nulla, non maximus risus pellentesque at. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis cursus urna sed interdum pretium. Integer dignissim sed nisi at rutrum. Nulla pulvinar aliquet luctus. Proin congue lacus id arcu ultrices pellentesque. Duis quis vulputate nisi. Ut quis pulvinar est. Sed mi turpis, semper vel magna sit amet, viverra porta quam. Nam scelerisque consectetur ex id elementum. Vestibulum blandit ultrices porta. Praesent sollicitudin elit nec felis egestas, vitae lobortis massa ultrices. Sed non efficitur libero. Praesent vehicula enim vitae lectus condimentum sodales a at nibh. Integer sollicitudin diam in commodo consectetur. Aliquam erat volutpat. Cras pellentesque nisl faucibus, ultrices velit eu, rhoncus magna. Sed placerat, felis vel tempus volutpat, ligula tortor vehicula mi, vel varius velit neque non augue. Cras interdum aliquam ante, eget hendrerit nisi scelerisque non. Etiam et justo vel sem feugiat eleifend. Curabitur feugiat mattis gravida. Proin tristique, arcu ut interdum consequat, lacus lectus convallis ex, sed tempor nisi ipsum quis lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Aenean euismod purus vel dolor pretium eleifend. Fusce vel tellus scelerisque, dapibus nulla ac, cursus est. In et laoreet magna. Aenean tristique pretium sollicitudin. Integer eu nibh velit. Sed vestibulum et quam eu interdum. Ut tempor posuere lacus, quis efficitur felis cursus eget. Morbi nunc mauris, facilisis quis leo eu, volutpat malesuada mi. Phasellus vel condimentum est, non lobortis ex. In urna tellus, pharetra nec augue eget, aliquet hendrerit odio. Fusce pellentesque enim orci, id blandit nisi ultrices et. Pellentesque ac luctus arcu. Praesent sit amet dolor vel urna rutrum facilisis. Donec tincidunt quis nunc in mattis. Ut vitae lacus elementum, imperdiet dolor eu, dignissim ligula. Fusce maximus purus ut ornare vulputate. Mauris sit amet bibendum tellus. Phasellus vulputate nisi dictum, convallis mauris at, porttitor metus. Etiam imperdiet pulvinar urna ac maximus. Fusce mollis ante. Fusce mollis antee.`,
        })
      ).toStrictEqual([])
    })
  })
})
