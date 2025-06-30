module.exports = (serverless) => ({
  bundle: true,
  minify: false,
  sourcemap: true,
  target: 'node20',
  format: 'cjs',
  platform: 'node',
  keepNames: true,
  external: [
    'aws-sdk',
    '@aws-sdk/*'
  ]
});