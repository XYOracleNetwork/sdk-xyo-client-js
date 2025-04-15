const config = {
  entryPointStrategy: 'packages',
  entryPoints: ['packages/**'],
  out: 'docs',
  plugin: ['typedoc-plugin-markdown'],
  exclude: ['**/docs/**', '**/spec/**', '**/*.spec.*', '**/*.d.ts'],
  excludeExternals: true,
  excludePrivate: true,
  excludeProtected: true,
  includeVersion: true,
  packageOptions: { entryPoints: ['src/index.ts', 'src/index-*.ts'] },
}

export default config
