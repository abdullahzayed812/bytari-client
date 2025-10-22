module.exports = function (api) {
  api.cache(false); // Disable cache for debugging
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/constants': './constants', 
            '@/lib': './lib',
            '@/providers': './providers',
            '@/assets': './assets',
            '@/mocks': './mocks',
          },
        },
      ],
    ],
  };
};
