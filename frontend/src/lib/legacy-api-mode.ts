export function legacyApiEnabled() {
  return (
    process.env.NEXT_PUBLIC_DATA_MODE === 'legacy' &&
    process.env.MAGICLED_ENABLE_LEGACY_API === 'true'
  );
}
