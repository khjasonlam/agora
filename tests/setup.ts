// Global test setup — filter known, harmless noise from the test output.

const _warn = console.warn
console.warn = (msg: unknown, ...args: unknown[]) => {
  if (typeof msg === 'string' && msg.includes('<Suspense>')) return
  _warn(msg, ...args)
}
