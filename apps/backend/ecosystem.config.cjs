/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'index.js',

      env_file: '.env.production',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
