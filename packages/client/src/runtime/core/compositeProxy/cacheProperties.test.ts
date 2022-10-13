import { cacheProperties } from './cacheProperties'
import { createCompositeProxy } from './createCompositeProxy'

test('caches getPropertyValue calls', () => {
  const getPropertyValue = jest.fn().mockReturnValue(1)
  const layer = cacheProperties({
    getKeys() {
      return ['prop']
    },
    getPropertyValue,
  })

  const proxy = createCompositeProxy({} as Record<string, number>, [layer])

  expect(proxy.prop).toBe(1)
  expect(proxy.prop).toBe(1)

  expect(getPropertyValue).toBeCalledTimes(1)
})

test('keeps separate cache entries for separate properties', () => {
  const getPropertyValue = jest.fn().mockImplementation((key) => {
    return key === 'first' ? 1 : 2
  })

  const layer = cacheProperties({
    getKeys() {
      return ['first', 'second']
    },
    getPropertyValue,
  })

  const proxy = createCompositeProxy({} as Record<string, number>, [layer])

  expect(proxy.first).toBe(1)
  expect(proxy.first).toBe(1)
  expect(proxy.second).toBe(2)
  expect(proxy.second).toBe(2)

  expect(getPropertyValue).toBeCalledTimes(2)
})
