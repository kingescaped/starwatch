module.exports = ({ config }) => {
  const rawBase = (process.env.EXPO_WEB_BASE_URL ?? '').trim();
  const baseUrl = rawBase ? `/${rawBase.replace(/^\/+|\/+$/g, '')}` : '';
  return {
    ...config,
    experiments: {
      ...config.experiments,
      ...(baseUrl ? { baseUrl } : {}),
    },
  };
};
