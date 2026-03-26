import { getCalverVersionInfo } from 'src/actions/drafter/lib/build-release-payload/get-calver-version-info'
import { describe, expect, it } from 'vitest'

describe('getCalverVersionInfo', () => {
  const now = new Date(2026, 2, 20) // 2026-03-20

  it('returns correct calver version info with no previous release', () => {
    const info = getCalverVersionInfo({
      lastRelease: undefined,
      config: { 'version-template': '$CALDATE.$PATCH' },
      input: {},
      now,
    })

    expect(info.$RESOLVED_VERSION).toBe('20260320.1')
    expect(info.$CALDATE).toBe('20260320')
    expect(info.$RESOLVED_VERSION_PATCH).toBe('1')
    expect(info.$RESOLVED_VERSION_MAJOR).toBeNull()
    expect(info.$RESOLVED_VERSION_MINOR).toBeNull()
    expect(info.$RESOLVED_VERSION_PRERELEASE).toBeNull()
  })

  it('increments patch for same-day release', () => {
    const info = getCalverVersionInfo({
      lastRelease: { tag_name: '20260320.2', name: 'Release' },
      config: { 'version-template': '$CALDATE.$PATCH' },
      input: {},
      now,
    })

    expect(info.$RESOLVED_VERSION).toBe('20260320.3')
    expect(info.$CALDATE).toBe('20260320')
    expect(info.$RESOLVED_VERSION_PATCH).toBe('3')
  })

  it('returns empty strings for $NEXT_* variables', () => {
    const info = getCalverVersionInfo({
      lastRelease: undefined,
      config: { 'version-template': '$CALDATE.$PATCH' },
      input: {},
      now,
    })

    expect(info.$NEXT_MAJOR_VERSION).toBe('')
    expect(info.$NEXT_MINOR_VERSION).toBe('')
    expect(info.$NEXT_PATCH_VERSION).toBe('')
    expect(info.$NEXT_PRERELEASE_VERSION).toBe('')
    expect(info.$NEXT_MAJOR_VERSION_MAJOR).toBeNull()
    expect(info.$NEXT_MINOR_VERSION_MINOR).toBeNull()
    expect(info.$NEXT_PATCH_VERSION_PATCH).toBeNull()
    expect(info.$NEXT_PRERELEASE_VERSION_PRERELEASE).toBeNull()
  })

  it('respects custom version template', () => {
    const info = getCalverVersionInfo({
      lastRelease: { tag_name: '20260320.1', name: 'Release' },
      config: { 'version-template': 'cal-$CALDATE-p$PATCH' },
      input: {},
      now,
    })

    expect(info.$RESOLVED_VERSION).toBe('cal-20260320-p2')
  })

  it('uses explicit version input as-is', () => {
    const info = getCalverVersionInfo({
      lastRelease: { tag_name: '20260320.1', name: 'Release' },
      config: { 'version-template': '$CALDATE.$PATCH' },
      input: { version: 'custom-version-1.0' },
      now,
    })

    expect(info.$RESOLVED_VERSION).toBe('custom-version-1.0')
    expect(info.$CALDATE).toBeNull()
    expect(info.$RESOLVED_VERSION_PATCH).toBeNull()
  })

  it('strips tag prefix when resolving', () => {
    const info = getCalverVersionInfo({
      lastRelease: { tag_name: 'v20260320.5', name: 'Release' },
      config: {
        'version-template': '$CALDATE.$PATCH',
        'tag-prefix': 'v',
      },
      input: {},
      now,
    })

    expect(info.$RESOLVED_VERSION).toBe('20260320.6')
    expect(info.$RESOLVED_VERSION_PATCH).toBe('6')
  })
})
