import type { ExclusiveInput } from 'src/actions/drafter/config'
import {
  actionInputSchema,
  configSchema,
  mergeInputAndConfig,
} from 'src/actions/drafter/config'
import { buildReleasePayload } from 'src/actions/drafter/lib/build-release-payload/build-release-payload'
import type { findPreviousReleases } from 'src/actions/drafter/lib/find-previous-releases'
import { beforeEach, describe, expect, it } from 'vitest'
import { mockContext } from '../mocks'

type LastRelease = Awaited<
  ReturnType<typeof findPreviousReleases>
>['lastRelease']

const input = {
  publish: false,
  'config-name': 'release-drafter.yml',
  token: 'test',
} as ExclusiveInput

describe('buildReleasePayload with calver', () => {
  beforeEach(async () => {
    await mockContext('push')
  })

  it('generates calver version when versioning is calver', () => {
    const config = mergeInputAndConfig({
      config: configSchema.parse({
        template: '$CHANGES',
        references: ['master'],
        versioning: 'calver',
      }),
      input: actionInputSchema.parse({
        token: 'test',
      }),
    })

    const result = buildReleasePayload({
      commits: [],
      config,
      input,
      lastRelease: undefined,
      pullRequests: [],
    })

    // Should produce a calver version like YYYYMMDD.1
    expect(result.resolvedVersion).toMatch(/^\d{8}\.1$/)
    expect(result.majorVersion).toBeNull()
    expect(result.minorVersion).toBeNull()
    expect(result.patchVersion).toBe('1')
  })

  it('increments calver patch for same-day release', () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${year}${month}${day}`

    const config = mergeInputAndConfig({
      config: configSchema.parse({
        template: '$CHANGES',
        references: ['master'],
        versioning: 'calver',
      }),
      input: actionInputSchema.parse({
        token: 'test',
      }),
    })

    const result = buildReleasePayload({
      commits: [],
      config,
      input,
      lastRelease: {
        tag_name: `${todayStr}.3`,
        name: 'Previous release',
      } as LastRelease,
      pullRequests: [],
    })

    expect(result.resolvedVersion).toBe(`${todayStr}.4`)
    expect(result.patchVersion).toBe('4')
  })

  it('defaults version-template to $CALDATE.$PATCH when calver is set', () => {
    const config = mergeInputAndConfig({
      config: configSchema.parse({
        template: '$RESOLVED_VERSION',
        references: ['master'],
        versioning: 'calver',
      }),
      input: actionInputSchema.parse({
        token: 'test',
      }),
    })

    // The default version-template should have been overridden to $CALDATE.$PATCH
    expect(config['version-template']).toBe('$CALDATE.$PATCH')

    const result = buildReleasePayload({
      commits: [],
      config,
      input,
      lastRelease: undefined,
      pullRequests: [],
    })

    expect(result.body).toMatch(/^\d{8}\.1$/)
  })

  it('keeps semver behavior when versioning is semver (default)', () => {
    const config = mergeInputAndConfig({
      config: configSchema.parse({
        template: '$RESOLVED_VERSION',
        references: ['master'],
      }),
      input: actionInputSchema.parse({
        token: 'test',
      }),
    })

    expect(config.versioning).toBe('semver')

    const result = buildReleasePayload({
      commits: [],
      config,
      input,
      lastRelease: {
        tag_name: 'v1.2.3',
        name: 'Previous release',
      } as LastRelease,
      pullRequests: [],
    })

    // Default semver behavior: patch increment
    expect(result.resolvedVersion).toBe('1.2.4')
    expect(result.majorVersion).toBe('1')
    expect(result.minorVersion).toBe('2')
    expect(result.patchVersion).toBe('4')
  })
})
