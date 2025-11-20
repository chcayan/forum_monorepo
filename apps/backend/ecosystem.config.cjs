/* eslint-disable no-undef */
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/apps/backend/src/index.js',
      watch: ['dist'],
      ignore_watch: ['node_modules', 'uploads'],
      env_file: '.env.production',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
