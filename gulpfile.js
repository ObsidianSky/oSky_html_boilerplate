'use strict';

var gulp = require('gulp'),
    spritesmith = require('gulp.spritesmith'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    rigger = require('gulp-rigger'),
    changed = require('gulp-changed'),
    cssmin = require('gulp-cssmin'),
    concatCss = require('gulp-concat-css'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
    stripCssComments = require('gulp-strip-css-comments');

var path = {
    build: { 
        html: 'html/',
        css: 'html/css/',
        js: 'html/js',
        img: 'html/img/',
        libs: 'html/libs',
        fonts: 'html/fonts/'
    },
    dev: { 
        html: 'dev/*.*', 
        css: 'dev/css/**/*.css',
        less: 'dev/less/all.less',
        js: 'dev/js/**/*.js',
        img: 'dev/img/**/*.*',
        sprites: 'dev/img/sprites/*.*',
        libs: 'dev/libs/**/*.js',
        fonts: 'dev/fonts/**/*.*'
    },
    watch: { 
        html: 'dev/*.*',
        templates: 'dev/templates/*.*',
        css: 'dev/css/**/*.css',
        less: 'dev/less/**/*.less',
        js: 'dev/js/**/*.js',
        img: 'dev/img/**/*.*',
        sprite: 'dev/img/sprites/*.*',
        libs: 'dev/libs/**/*.*',
        fonts: 'dev/fonts/**/*.*'
    },
    clean: './html'
};
 
gulp.task('connect', function() {
  connect.server({
    root: 'app',
    livereload: true
  });
});

gulp.task('html:build', function(){
    gulp.src(path.dev.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(connect.reload());
   
})

gulp.task('js:build', function () {
    gulp.src(path.dev.js)
    .pipe(gulp.dest(path.build.js))
    .pipe(connect.reload());

});

gulp.task('libs:build', function () {
    gulp.src(path.dev.libs)
    .pipe(uglify())
    .pipe(concat('libs.js'))
    .pipe(gulp.dest(path.build.libs))
    .pipe(connect.reload());
   
});

gulp.task('sprite:build', function() {
    var spriteData = 
        gulp.src(path.dev.sprites) 
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'icons.less',
            cssFormat: 'less',
            algorithm: 'top-down',
            imgPath: '../img/sprite.png'
        }));
    spriteData.img.pipe(gulp.dest('./dev/img')); 
    spriteData.css.pipe(gulp.dest('./dev/less')); 
    
});

gulp.task('less:build', function () {
    gulp.src(path.dev.less) 
    .pipe(less()).on('error', function(err){
        console.log(err);
    })  
    .pipe(prefixer()) 
    .pipe(stripCssComments())
    .pipe(cssmin())
    .pipe(gulp.dest(path.build.css))
    .pipe(connect.reload());
});

gulp.task('css:build', function () {
    gulp.src(path.dev.css) 
    .pipe(concatCss('libs.css'))
    .pipe(stripCssComments())
    .pipe(cssmin())
    .pipe(gulp.dest(path.build.css))
    .pipe(connect.reload());
});

gulp.task('image:build', function () {
    gulp.src([path.dev.img, '!dev/img/sprites/*.*'])
    .pipe(changed(path.build.img))
    .pipe(imagemin({
        progressive: true,
        use: [pngquant()],
        interlaced: true
    })).on('error', function(err){
        console.log(err);
    })  
    .pipe(gulp.dest(path.build.img))
    .pipe(connect.reload());
});

gulp.task('image:optimize', function(){
    gulp.src(path.dev.img) 
    .pipe(gulp.dest(path.build.img))
    .pipe(connect.reload());
});

gulp.task('fonts:build', function() {
    gulp.src(path.dev.fonts)
    .pipe(gulp.dest(path.build.fonts))
    .pipe(connect.reload());
});

gulp.task('build', [
    'html:build',
    'libs:build',
    'js:build',
    'sprite:build',
    'css:build',
    'less:build',
    'image:build',
    'fonts:build'
]);


gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['connect', 'build', 'watch']);

gulp.task('watch', function(){
    watch([path.watch.templates], function(event, cb) {
        gulp.start('html:build');
    }); 

    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    }); 

    watch([path.watch.css], function(event, cb) {
        gulp.start('css:build');
    });

    watch([path.watch.less], function(event, cb) {
        gulp.start('less:build');
    });

    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });

    watch([path.watch.libs], function(event, cb) {
        gulp.start('libs:build');
    });

    watch([path.watch.img,'!dev/img/sprites/*.*'], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.sprite], function(event, cb) {
        gulp.start('sprite:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });

});