const dataMode = process.env.NEXT_PUBLIC_DATA_MODE || 'api';

export const apiEnabled = dataMode === 'api';
export const demoEnabled =
  dataMode === 'demo' &&
  (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_MAGICLED_PREVIEW === 'true');
