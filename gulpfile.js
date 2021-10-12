const { src, dest, series, watch } = require('gulp')
const concat = require('gulp-concat')
const htmlMin = require('gulp-htmlmin')
const autoprefixes = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const svgSprite = require('gulp-svg-sprite')
const image = require('gulp-image')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify-es').default
const notify = require('gulp-notify')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const browserSync = require('browser-sync').create()

const clean = () => {
  return del(['dist'])
}

const resources = () => {
  return src('src/resources/**')
  .pipe(dest('dist'))
}

/*Версия dev. Команда gulp dev на выходе получили папку dist с не минифицироваными источниками*/
const stylesDev = () => {
  return src('src/styles/**/*.css')
  .pipe(sourcemaps.init())/*Он здесь чтобы header в браузере был видень*/
  .pipe(concat('main.css'))
  .pipe(autoprefixes ({
    cascade: false   
  }))   
  .pipe(sourcemaps.write())/*Он здесь чтобы header в браузере был видень*/
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const htmlMinifyDev = () => {
  return src('src/**/*.html')
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

/*svgSprites общий для всех*/
const svgSprites = () => {
  return src('src/images/svg/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: '../bathtub.svg'
        }
      }
    }))  
    .pipe(dest('dist/images'))
}

const scriptsDev = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
  .pipe(sourcemaps.init())/*Минификация что он здесь делает?*/
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('app.js'))
  .pipe(sourcemaps.write())/*Минификация что он здесь делает?*/
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

watch('src/**/*.html', htmlMinifyDev);
watch('src/styles/**/*.css', stylesDev);
watch('src/js/**/*.js', scriptsDev);
watch('src/resources/**', resources)

/*Версия build. Команда gulp build, получили все с минифицироваными источниками. Продакшн для заказчика*/
const styles = () => {
  return src('src/styles/**/*.css')
  .pipe(concat('main.css'))
  .pipe(autoprefixes ({
    cascade: false    
  }))
  .pipe(cleanCSS ({
    level: 2
  }))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const htmlMinify = () => {
  return src('src/**/*.html')
  .pipe(htmlMin ({
    collapseWhitespace: true,
  }))
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

/*images общий для всех*/
const images = () => {
  return src ([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/*.svg',
    'src/images/**/*.jpeg',
  ])
  .pipe(image())
  .pipe(dest('dist/images'))
}

const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
  .pipe(babel({
    presets: ['@babel/env']
  }))
  .pipe(concat('app.js'))
  .pipe(uglify(/*{
    toplevel: trueСкрыть код 1 уровнем?
  }*/).on('error', notify.onError()))  
  .pipe(dest('dist'))
  .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init ({
    server: {
      baseDir: 'dist'
    }
  })
}

watch('src/**/*.html', htmlMinify)
watch('src /**/*.css', styles)
watch('src/js/**/*.js', scripts)
watch('src/images/svg/**/*.svg', svgSprites)

//Здесь они не нужны. Не удалять!
// exports.styles = styles 
//exports.scripts = scripts
// exports.htmlMinify = htmlMinify
// exports.default = series( clean, resources, htmlMinify, scripts, styles, images, svgSprites, watchfiles)

exports.build = series(clean, resources, htmlMinify, scripts, styles, images, svgSprites, watchFiles);
exports.dev = series(clean, resources, htmlMinifyDev, scriptsDev, stylesDev, images, svgSprites, watchFiles);



