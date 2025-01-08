const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components/'),
      '@pages': path.resolve(__dirname, 'src/pages/'),
      '@contexts': path.resolve(__dirname, 'src/contexts/'),
      '@utils': path.resolve(__dirname, 'src/utilities/'),
      '@api': path.resolve(__dirname, 'src/api/'),
    },
  },
};