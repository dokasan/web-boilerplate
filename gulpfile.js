var gulp = require('gulp'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    gulpsync = require('gulp-sync')(gulp),
    less = require('gulp-less'),
    connect = require('gulp-connect'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache');

var src = './src';
var dest = './build';
var manifest = './manifest';

var urlconfig = {
    less: {
        all: src + '/style/**/*.less',
        src: src + '/style/less/*.less',
        tmp: src + '/style/css',
        dest: dest + '/style/css',
        rev: manifest + '/rev/style'
    },
    js: {
        all: src + '/js/**/*.js',
        src: src + '/js/*.js',
        dest: dest + '/js',
        rev: manifest + '/rev/js'
    },
    image: {
        all: src + '/img/**/*',
        src: src + '/img/*',
        dest: dest + '/img',
        rev: manifest + '/rev/img'
    },
    clean: {
        src: dest
    },
    rev:{// 使用rev重设html资源路径
        revJson: manifest + '/rev/**/*.json',
        src: src + "/**/*.html",
        dest: dest,
    }
}

// 创建一个服务器
gulp.task('server', function() {
    connect.server({
        port: 7070,
        root: './build',
        livereload:true
    });
});

// 页面重载
gulp.task('reload', function () {
    return gulp.src('./build/**/*.*')
      .pipe(connect.reload());
});

// less 处理任务
gulp.task('lessTocss', function() {
    return gulp.src(urlconfig.less.src)
        .pipe(less())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest(urlconfig.less.tmp))
        .pipe(rev())
        .pipe(gulp.dest(urlconfig.less.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(urlconfig.less.rev))
        .pipe(notify({ message: 'css文件处理完成' }));
});

// JS处理任务
gulp.task('scripts', function() {
    return gulp.src(urlconfig.js.src)              //引入所有需处理的JS
        .pipe(rev())                              //set hash key  
        .pipe(uglify())                           //压缩JS
        .pipe(gulp.dest(urlconfig.js.dest))       //压缩版输出
        .pipe(rev.manifest())                     
        .pipe(gulp.dest(urlconfig.js.rev))
        .pipe(notify({ message: 'JS文件处理完成' }));
});

// 图片处理任务
gulp.task('images', function() {
    return gulp.src(urlconfig.image.src)        //引入所有需处理的图片
        .pipe(rev())
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))      //压缩图片
        .pipe(gulp.dest(urlconfig.image.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest(urlconfig.image.rev))
        .pipe(notify({ message: '图片处理完成' }));
});

// 替换HTML的资源文件路径
gulp.task('rev', function() {
    return gulp.src([urlconfig.rev.revJson, urlconfig.rev.src])
        .pipe( revCollector({
            replaceReved: true,
        }) )
        .pipe( gulp.dest(urlconfig.rev.dest) );
});


// 目标目录清理
gulp.task('clean', function() {
    return gulp.src(urlconfig.clean.src)
        .pipe(clean());
});

gulp.task('watch', function() {
    gulp.watch(['src/style/*.less'], ['lessTocss']);
    gulp.watch(['src/js/*.js'], ['scripts']);
    gulp.watch(['src/img/*'], ['images']);
    gulp.watch(['src/**'], ['rev', 'reload']);
});

gulp.task('default', gulpsync.sync(['clean', ['lessTocss', 'scripts', 'images', ['rev', 'server', 'watch']]]));