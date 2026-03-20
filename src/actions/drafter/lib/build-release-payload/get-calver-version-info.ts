import type { Config, ExclusiveInput } from '../../config'
import type { findPreviousReleases } from '../find-previous-releases'
import { CalendarVersionDescriptor } from './calendar-version-descriptor'

type Release = Exclude<
  Awaited<ReturnType<typeof findPreviousReleases>>['lastRelease'],
  undefined
>

export const getCalverVersionInfo = (params: {
  lastRelease: Pick<Release, 'tag_name' | 'name'> | undefined
  config: Pick<Config, 'version-template' | 'tag-prefix'>
  input: Pick<ExclusiveInput, 'version' | 'tag' | 'name'>
  now?: Date
}) => {
  const { lastRelease, config, input, now } = params

  const explicitVersion = input.version || input.tag || input.name
  if (explicitVersion) {
    // Use the explicit version as-is
    return {
      $NEXT_MAJOR_VERSION: '',
      $NEXT_MAJOR_VERSION_MAJOR: null,
      $NEXT_MAJOR_VERSION_MINOR: null,
      $NEXT_MAJOR_VERSION_PATCH: null,
      $NEXT_MINOR_VERSION: '',
      $NEXT_MINOR_VERSION_MAJOR: null,
      $NEXT_MINOR_VERSION_MINOR: null,
      $NEXT_MINOR_VERSION_PATCH: null,
      $NEXT_PATCH_VERSION: '',
      $NEXT_PATCH_VERSION_MAJOR: null,
      $NEXT_PATCH_VERSION_MINOR: null,
      $NEXT_PATCH_VERSION_PATCH: null,
      $NEXT_PRERELEASE_VERSION: '',
      $NEXT_PRERELEASE_VERSION_PRERELEASE: null,
      $RESOLVED_VERSION: explicitVersion,
      $RESOLVED_VERSION_MAJOR: null,
      $RESOLVED_VERSION_MINOR: null,
      $RESOLVED_VERSION_PATCH: null,
      $RESOLVED_VERSION_PRERELEASE: null,
      $CALDATE: null,
    }
  }

  const descriptor = new CalendarVersionDescriptor(lastRelease, {
    tagPrefix: config['tag-prefix'],
    now,
  })

  return {
    $NEXT_MAJOR_VERSION: '',
    $NEXT_MAJOR_VERSION_MAJOR: null,
    $NEXT_MAJOR_VERSION_MINOR: null,
    $NEXT_MAJOR_VERSION_PATCH: null,
    $NEXT_MINOR_VERSION: '',
    $NEXT_MINOR_VERSION_MAJOR: null,
    $NEXT_MINOR_VERSION_MINOR: null,
    $NEXT_MINOR_VERSION_PATCH: null,
    $NEXT_PATCH_VERSION: '',
    $NEXT_PATCH_VERSION_MAJOR: null,
    $NEXT_PATCH_VERSION_MINOR: null,
    $NEXT_PATCH_VERSION_PATCH: null,
    $NEXT_PRERELEASE_VERSION: '',
    $NEXT_PRERELEASE_VERSION_PRERELEASE: null,
    $RESOLVED_VERSION: descriptor.rendered(config['version-template']),
    $RESOLVED_VERSION_MAJOR: null,
    $RESOLVED_VERSION_MINOR: null,
    $RESOLVED_VERSION_PATCH: descriptor.patch,
    $RESOLVED_VERSION_PRERELEASE: null,
    $CALDATE: descriptor.caldate,
  }
}
