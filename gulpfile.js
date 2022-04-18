'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*'],
    replaceString: /\bgulp[\-.]/
});

const sources = {
    "sass_main": "dev/sass/main.scss",
    "js": [
        'dev/js/main.js'
    ],
    "sass": [
        'dev/sass/**/**.scss',
        'dev/sass/main.scss'
    ],
    "input_js": {
    },
    "input_sass": {
    },
    "import_css": [],
    "import_js": [],
};

const dest = {
    "css": 'css',
    "js": 'js',
    "img": 'img',
    "font": 'fonts',
};

function scss() {
    for (const[key, value] of Object.entries(sources.input_sass)) {
        gulp.src(key)
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(plugins.concat(value))
            .pipe(gulp.dest(dest.css));
    }

    return gulp.src(sources.sass_main)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(plugins.concat('main.min.css'))
        .pipe(gulp.dest(dest.css));
}

function scripts() {
    for (const[key, value] of Object.entries(sources.input_js)) {
        gulp.src(key)
            .pipe(plugins.concat(value))
            .pipe(plugins.uglify())
            .pipe(gulp.dest(dest.js));
    }

    return gulp.src(sources.js)
        .pipe(plugins.concat('app.min.js'))
        .pipe(
            babel({
                presets: [
                    [
                        "@babel/env",
                        {
                        modules: false,
                        },
                    ],
                ],
            })
        )
        .pipe(gulp.dest(dest.js));
}

function importCSS() {
    return gulp.src(sources.import_css)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(plugins.concat('vendor.min.css'))
        .pipe(gulp.dest(dest.css));
}

function importJS() {
    return gulp.src(sources.import_js)
        .on('error', function(err) {
            plugins.notify().write(err);
            this.emit('end');
        })
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(dest.js))
        .pipe(plugins.notify({
            title: "Import JS",
            subtitle: "Done!",
            message: "Done compiling Import Javascript files",
            sound: "Beep"
        }));
}

function watch() {
    gulp.watch(sources.js, scripts);
    gulp.watch(sources.sass, scss);
    
    for (const [key, vlaue] of Object.entries(sources.input_js)) {
        gulp.watch(key, scripts);
    }

    for (const [key, vlaue] of Object.entries(sources.input_sass)) {
        gulp.watch(key, scripts);
    }
}

exports.scss = scss;
exports.scripts = scripts;
exports.importCSS = importCSS;
exports.importJS = importJS;
exports.watch = watch;

if (sources.import_css.length != 0 && sources.import_js.length != 0 ) {
    gulp.task('build', gulp.series(importCSS, importJS, scss, scripts));
    gulp.task('default', gulp.series(importCSS, importJS, scss, scripts, watch));
} else {
    gulp.task('build', gulp.series(scss, scripts));
    gulp.task('default', gulp.series(scss, scripts, watch));
}