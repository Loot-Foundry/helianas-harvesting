import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import jsonfile from 'jsonfile';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { deleteAsync } from 'del';

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

gulp.task('compileJS', () => {
  const modules = jsonfile.readFileSync(modulePath);
  return gulp.src(modules.includes.filter(file => file.endsWith('.js')), { base: './', cwd: __dirname })
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-modules-amd']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest((file) => {
      if (file.base) {
        const relativePath = relative('./', file.base);
        return join(distPath, relativePath);
      }
      return distPath;
    }));
});

gulp.task('clean', () => {
  return deleteAsync(distPath);
});

gulp.task('default', gulp.series('clean', 'copyFiles', 'compileJS'));
