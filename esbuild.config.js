const { build } = require('esbuild')
const { resolve } = require('path')
const fs = require('fs')

// Garantir que o diretório static exista
if (!fs.existsSync('build/static')) {
  fs.mkdirSync('build/static', { recursive: true })
}

// Criar um arquivo SVG vazio para o logo
fs.writeFileSync(
  'build/static/logo.svg',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>',
)

build({
  entryPoints: ['src/server.ts'],
  outdir: 'build',
  bundle: true,
  minify: false,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
  external: ['@prisma/client'],
  loader: {
    '.ts': 'ts',
  },
  alias: {
    '@': resolve(__dirname, 'src'),
  },
}).catch(() => process.exit(1))
