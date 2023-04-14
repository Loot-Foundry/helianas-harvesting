import gulp from 'gulp';
import jsonfile from 'jsonfile';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { deleteAsync } from 'del';
import { rollup } from 'rollup';
import rollupTerser from '@rollup/plugin-terser';

const __dirname = dirname(fileURLToPath(import.meta.url));

const modulePath = join(__dirname, 'module.json');
const distPath = join(__dirname, 'dist');

gulp.task('copyFiles', () => {
  const module = jsonfile.readFileSync(modulePath);
  return gulp.src(module.includes, { base: './', cwd: __dirname })
    .pipe(gulp.dest((file) => {
      if (file.base) {
        const relativePath = relative('./', file.base);
        return join(distPath, relativePath);
      }
      return distPath;
    }));
});

gulp.task('compileJS', async () => {
  const modules = jsonfile.readFileSync(modulePath);
  const jsFiles = modules.includes.filter(file => file.endsWith('.js'));
  for (const jsFile of jsFiles) {
    const bundle = await rollup({
      input: jsFile,
      plugins: [
        rollupTerser()
      ]
    });
    const outputFilePath = join(distPath, jsFile);
    await bundle.write({
      file: outputFilePath,
      format: 'esm',
      sourcemap: true,
    });
  }
});

gulp.task('clean', () => {
  return deleteAsync(distPath);
});

gulp.task('default', gulp.series('clean', 'copyFiles', 'compileJS'));
