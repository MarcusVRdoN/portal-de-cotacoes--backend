const { nodeExternalsPlugin } = require('esbuild-node-externals');

module.exports = () => {
  return {
    packager: 'npm',
    bundle: true,
    minify: true,
    sourcemap: true,
    target: 'node20',
    platform: 'node',
    mainFields: ['module', 'main'],
    external: [
      '@prisma/client',
      '.prisma',
      '.prisma/client',
      '@prisma/client/default',
      '.prisma/client/default'
    ],
    plugins: [
      nodeExternalsPlugin({

      }),
    ],
    loader: {
      '.node': 'copy',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  };
};