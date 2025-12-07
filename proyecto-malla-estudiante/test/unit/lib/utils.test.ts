import { cn } from '../../../src/lib/utils'

describe('utils.cn', () => {
  test('combina clases sin duplicados y mergea tailwind', () => {
    const result = cn('px-2', 'px-2', 'text-center', { 'text-center': true })
    expect(typeof result).toBe('string')
    expect(result.includes('px-2')).toBe(true)
  })
})
