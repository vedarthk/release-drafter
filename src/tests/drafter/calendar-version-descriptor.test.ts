import { CalendarVersionDescriptor } from 'src/actions/drafter/lib/build-release-payload/calendar-version-descriptor'
import { describe, expect, it } from 'vitest'

describe('CalendarVersionDescriptor', () => {
  const now = new Date(2026, 2, 20) // 2026-03-20

  it('increments patch for same-day release', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: '20260320.3', name: 'Release' },
      { now },
    )

    expect(descriptor.caldate).toBe('20260320')
    expect(descriptor.patch).toBe('4')
    expect(descriptor.resolvedVersion).toBe('20260320.4')
  })

  it('resets patch to 1 for a new day', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: '20260319.5', name: 'Release' },
      { now },
    )

    expect(descriptor.caldate).toBe('20260320')
    expect(descriptor.patch).toBe('1')
    expect(descriptor.resolvedVersion).toBe('20260320.1')
  })

  it('starts at patch 1 with no previous release', () => {
    const descriptor = new CalendarVersionDescriptor(undefined, { now })

    expect(descriptor.caldate).toBe('20260320')
    expect(descriptor.patch).toBe('1')
    expect(descriptor.resolvedVersion).toBe('20260320.1')
  })

  it('strips tag prefix before parsing', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: 'v20260320.3', name: 'Release' },
      { tagPrefix: 'v', now },
    )

    expect(descriptor.caldate).toBe('20260320')
    expect(descriptor.patch).toBe('4')
    expect(descriptor.resolvedVersion).toBe('20260320.4')
  })

  it('falls back to name when tag does not match', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: 'not-a-version', name: '20260320.2' },
      { now },
    )

    expect(descriptor.patch).toBe('3')
    expect(descriptor.resolvedVersion).toBe('20260320.3')
  })

  it('renders a custom version template', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: '20260320.1', name: 'Release' },
      { now },
    )

    expect(descriptor.rendered('$CALDATE.$PATCH')).toBe('20260320.2')
    expect(descriptor.rendered('cal-$CALDATE-p$PATCH')).toBe('cal-20260320-p2')
  })

  it('increments patch when tag has prefix but tag-prefix is not configured', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: 'v20260320.4', name: 'Release' },
      { now },
    )

    expect(descriptor.caldate).toBe('20260320')
    expect(descriptor.patch).toBe('5')
    expect(descriptor.resolvedVersion).toBe('20260320.5')
  })

  it('starts at patch 1 when previous release tag is not calver format', () => {
    const descriptor = new CalendarVersionDescriptor(
      { tag_name: 'v1.2.3', name: 'Some release' },
      { now },
    )

    expect(descriptor.caldate).toBe('20260320')
    expect(descriptor.patch).toBe('1')
    expect(descriptor.resolvedVersion).toBe('20260320.1')
  })

  it('pads month and day with zeros', () => {
    const jan = new Date(2026, 0, 5) // 2026-01-05
    const descriptor = new CalendarVersionDescriptor(undefined, { now: jan })

    expect(descriptor.caldate).toBe('20260105')
    expect(descriptor.resolvedVersion).toBe('20260105.1')
  })
})
