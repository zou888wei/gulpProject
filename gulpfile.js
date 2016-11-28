var gulp = require('gulp'),                       // gulp引入
    util = require('gulp-util'),                  // 基础工具 打印在日志
    clean = require('gulp-clean'),                // 清理文件
    rename = require('gulp-rename'),              // 重命名
    rev  = require('gulp-rev'),                   // 加MD5后缀
    revCollector = require('gulp-rev-collector'), // 路径替换
    cssmin = require('gulp-minify-css'),          // 压缩css
    uglify = require('gulp-uglify'),              // 压缩js  
    autoprefixer = require('gulp-autoprefixer'),  // css增加私有变量前缀  
    jshint = require('gulp-jshint'),              // js检测
    less = require('gulp-less'),                  // 转换less用的  
    notify = require('gulp-notify'),              // 提示信息
    concat = require('gulp-concat'),              // 合并  
    flatten = require('gulp-flatten'),            // 移动指定文件  
    gulpif  = require('gulp-if'),                 // if判断，用来区别生产环境还是开发环境的
    connect = require('gulp-connect'),            // 自动刷新(gulp-livereload) 
    plumber = require('gulp-plumber'),            // 显示错误
    sourcemaps = require('gulp-sourcemaps'),     // 配合LESS使用
    runSequence = require('run-sequence');        //执行顺序，避免

// 循环获取路径
var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');

//// webpack
//var webpack = require('webpack');
//var webpackConfig = require('./webpack.config.js');

// 
var scriptsPath = 'lib/tel/';

// 获取路径
function getFolders(dir){
  return fs.readdirSync(dir)
    .filter(function(file){
    return fs.statSync(path.join(dir, file)).isDirectory();
  })
}

// 压缩前先删除原文件
gulp.task('dels', function(){
  gulp.src(['dist/css/**', 'dist/js/**','dist/tel/**', 'subst/css/**','subst/js/**'],{ read:false })
    .pipe(clean());
})

// 修改主样式时只删除主样式的源文件
gulp.task('delparent', function(){
  gulp.src(['dist/css/**','subst/css/**'],{ read:false })
    .pipe(clean());
})

// 修改子样式时删除子样式中的源文件
gulp.task('delson',function(){
  gulp.src(['dist/tel/**/css/**','dist/tel/**/subst/**'],{ read:false })
    .pipe(clean());
})

// 删除主体JS
gulp.task('deljs', function(){
  gulp.src(['dist/js/**','subst/js/**'],{ read:false })
    .pipe(clean());
})

// less 编译 
gulp.task('lessT', function(){
  gulp.src('lib/css/*.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({ compress: true }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css/'))
    .pipe(notify({ message: 'less task ok' }));
})

// css 压缩
gulp.task('cleanCssT', function(){
  setTimeout(function() {
    gulp.src(['dist/css/*.css'])
      .pipe(plumber())
      .pipe(concat('main.css'))
      .pipe(cssmin())
      .pipe(rename({ suffix: '.min' }))
      .pipe(rev())
      .pipe(gulp.dest('dist/css/'))
      .pipe(notify({ message: 'cleanss task ok' }))
      .pipe(rev.manifest())
      .pipe(gulp.dest('subst/css/'))
      .pipe(notify({ message: 'subst-css task ok' }));
    }, 4000)//延迟8秒执行文件合并，确保原始文件生成
})



// copy子文件
gulp.task('tels', function(){
  setTimeout(function() {
    gulp.src(['lib/tel/**/**/*','!lib/tel/**/less/*'])
      .pipe(plumber())
      .pipe(gulp.dest('dist/tel/'))
  },1000);
})

// 编译子文件中less
gulp.task('csslien', function(){
  setTimeout(function() {
    var folders = getFolders(scriptsPath);
    var tasks = folders.map(function(folders){
  //    console.log(path.join(scriptsPath, folders + '/less', '/*.less'));
      return gulp.src(path.join(scriptsPath, folders + '/less', '/*.less'))
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(less({ compress: true }))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/tel/' + folders +'/css/'))
        .pipe(notify({ message: folders + 'task ok' }));
    });
    return merge(tasks);
  }, 1000)//延迟8秒执行文件合并，确保原始文件生成
})

// 子文件css 压缩
gulp.task('cssrev', function(){
  setTimeout(function() {
    var folders = getFolders(scriptsPath);
    var tasks = folders.map(function(folders){
      return gulp.src(['dist/tel/' + folders +'/css/*.css'])
        .pipe(plumber())
        .pipe(concat('mains.css'))
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(rev())
        .pipe(gulp.dest('dist/tel/' + folders +'/css/'))
        .pipe(notify({ message: 'csslien task ok' }))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/tel/' + folders +'/subst/'))
        .pipe(notify({ message: 'csslien-subst task ok' }));
    });
    return merge(tasks);
  }, 4000)//延迟8秒执行文件合并，确保原始文件生成
})
// js 检测
gulp.task('jshints', function(){
  return gulp.src(['lib/js/*.js'])
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(notify({ message: 'jshint task ok' }));
})

// js 压缩合并
gulp.task('uglifys', function(){
  return gulp.src(['lib/js/*.js'])
    .pipe(plumber())
    .pipe(concat('index.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/js'))
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({ message: 'uglify task ok'}))
    .pipe(rev.manifest())
    .pipe(gulp.dest('subst/js/'))
    .pipe(notify({ message: 'subst-js task ok'}));
})

//gulp.task("webpack", function(callback){
//  var myConfig = Object.create(webpackConfig);
//  webpack(
//    myConfig,
//    function(err,stats) {
//      callback();
//    })
//})

// 替换index外部链接
gulp.task('substs', function(){
  setTimeout(function() {
    gulp.src(['subst/css/*.json','index.html'])
      .pipe(plumber())
      .pipe(revCollector({
          replaceReved: true
      }))
      .pipe(gulp.dest('./'))
      .pipe(notify({ message: 'substCss task ok'}));
    }, 4000)//延迟8秒执行文件合并，确保原始文件生成
})

gulp.task('substjs', function(){
  setTimeout(function() {
    gulp.src(['subst/js/*.json','index.html'])
      .pipe(plumber())
      .pipe(revCollector({
          replaceReved: true
      }))
      .pipe(gulp.dest('./'))
      .pipe(notify({ message: 'substJs task ok'}));
    }, 4000)//延迟8秒执行文件合并，确保原始文件生成
})

gulp.task('substson', function(){
  setTimeout(function() {
    var folders = getFolders(scriptsPath);
    var tasks = folders.map(function(folders){
      return gulp.src(['dist/tel/' + folders +'/subst/*.json', 'dist/tel/' + folders +'/*.html'])
        .pipe(plumber())
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('dist/tel/' + folders +'/'))
        .pipe(notify({ message: 'substson task ok'}));
    });
    return merge(tasks);
  }, 8000)//延迟8秒执行文件合并，确保原始文件生成
})

// 本地启动路由
gulp.task('connectServer', function(){
  connect.server({
    root: './',
    port: 3000,
    livereload: true
  });
  gulp.start('watch');
})

// 刷新html
gulp.task('html', function(){
  gulp.src('index.html')
    .pipe(connect.reload());
})

// 刷新子html
gulp.task('htmlson', function(){
  var folders = getFolders(scriptsPath);
  var tasks = folders.map(function(folders){
    return gulp.src(['dist/tel/' + folders +'/*.html'])
      .pipe(connect.reload());
  });
  return merge(tasks);
})

// 监听
gulp.task('watch', function(){
  gulp.watch('./lib/css/*.less', ['buildson']);
  gulp.watch('./lib/js/*.js', ['jsrev']);
  gulp.watch('./index.html',['html']);
  gulp.watch('./subst/css/*',['substs']);
  gulp.watch('./subst/js/*',['substjs']);
  gulp.watch('./dist/tel/**/*.html',['htmlson']);
  gulp.watch('./lib/tel/**/less/*.less',['copyson'])
})

// 监听主页面JS变动
gulp.task('jsrev',['deljs'], function(done){
  runSequence(
    'jshints',
    'uglifys',
    'substjs',
    done
  );
})

// 监听子文件CSS变动
gulp.task('copyson',['delson'],function(done){
  runSequence(
    'copy',
    done
  );
})


// 默认启动后copy子文件
gulp.task('copy',function(done){
  runSequence(
    'csslien',
    'cssrev',
    'substson',
    done
  );
});

// 监听主文件CSS变动
gulp.task('buildson', ['delparent'], function(done){
  runSequence(
    'build',
    done
  );
})

// 默认启动后先清理文件再编译
gulp.task('build', function(done){
  runSequence(
    'lessT',
    'cleanCssT',
    'substs',
    done
  );
});

// 默认启动
gulp.task('default', ['connectServer','dels','tels'], function(done){
  runSequence(
    'build',
    'jsrev',
    'copy',
    done
  );
});