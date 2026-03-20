import * as core from '@actions/core'
import type { Config } from '../../config'
import type { findPreviousReleases } from '../find-previous-releases'
import { renderTemplate } from './render-template'

type Release = Exclude<
  Awaited<ReturnType<typeof findPreviousReleases>>['lastRelease'],
  undefined
>

const CALVER_PATTERN = /^(\d{8})\.(\d+)$/

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

export class CalendarVersionDescriptor {
  public caldate: string
  public patch: string
  public resolvedVersion: string

  constructor(
    lastRelease: Pick<Release, 'tag_name' | 'name'> | undefined,
    opt?: {
      tagPrefix?: Config['tag-prefix']
      now?: Date
    },
  ) {
    const now = opt?.now ?? new Date()
    const today = formatDate(now)

    const tagFromTagName = this._stripTag(lastRelease?.tag_name, opt?.tagPrefix)
    const tagFromName = this._stripTag(lastRelease?.name, opt?.tagPrefix)

    const match =
      tagFromTagName?.match(CALVER_PATTERN) ||
      tagFromName?.match(CALVER_PATTERN) ||
      null

    if (match && match[1] === today) {
      this.caldate = today
      this.patch = String(Number.parseInt(match[2], 10) + 1)
    } else {
      this.caldate = today
      this.patch = '1'
    }

    this.resolvedVersion = `${this.caldate}.${this.patch}`

    if (!match && lastRelease) {
      core.info(
        `Previous release tag "${lastRelease.tag_name}" does not match calver format. Starting at ${this.resolvedVersion}.`,
      )
    }
  }

  private _stripTag(
    input: string | null | undefined,
    tagPrefix: string | undefined,
  ): string | undefined {
    if (!input) return undefined
    return tagPrefix && input.startsWith(tagPrefix)
      ? input.slice(tagPrefix.length)
      : input
  }

  public rendered(template: string) {
    return renderTemplate({
      template,
      object: {
        $CALDATE: this.caldate,
        $PATCH: this.patch,
      },
    })
  }
}
