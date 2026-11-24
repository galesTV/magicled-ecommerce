export function testCheckoutEnabled(): boolean {
  if (
    process.env.ENABLE_TEST_CHECKOUT !== 'true' ||
    process.env.E2E_ENABLE_TEST_CHECKOUT !== 'true'
  )
    return false;
  try {
    const backend = new URL(process.env.BACKEND_API_URL || '');
    return (
      backend.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(backend.hostname)
    );
  } catch {
    return false;
  }
}
