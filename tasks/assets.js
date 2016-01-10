module.exports = (grunt) => {
  // syntax
  'use strict';
  // modules
  const gm = require('gm');
  const path = require('path');
  const util = require('util');
  const fs = require('fs');
  const async = require('async');
  // map grunt
  const log = grunt.log;
  // defaults
  let defaults = {
    platforms: [{
      name: 'ios',
      icons: require('ios-icons')(),
      splashs: require('ios-splash')()
    }, {
      name: 'android',
      icons: require('android-icons')(),
      splashs: require('android-splash')()
    }]
  }

  function run (tasks, done) {
    //done(false);
    async.parallel(tasks, (error, results) => {
      if (error) {
        log.fail(`Error -> Processing images`);
      }
      done(true);
    });
  }

  // icon tasks
  function icon(src, dst, size) {
    return (callback) => {
      gm(src)
        .resize(size.width || size.height, size.height || size.width, '!')
        .gravity('Center')
        .write(dst, error => {
          if (error) {
            log.error(error);
          } else {
            callback(null, `${dst}`);
          }
        });
    };
  }

  // splash tasks
  function splash(src, dst, size, callback) {
    return (callback) => {
      // resizing with graphicsmagick
      gm(src)
        .resize(size.width, size.height || size.width, '!')
        .gravity('Center')
        .write(dst, function(error) {
          if (error) {
            log.error(error);
          } else {
            callback(null, `Success -> ${dst}`);
          }
        });
    };
  }

  function mkdir(dir) {
    grunt.file.mkdir(dir);
  }

  grunt.registerMultiTask('assets', 'Creates icons, splash screens, or store assets for a Cordova project', function() {
    // console.log(this);
    let done = this.async(),
      tasks = [],
      platform;
    // being explicit
    tasks.length = 0;

    // merging task-specific and/or target-specific options witht the defaults
    let options = this.options({
      config: 'config.xml',
      platforms: ['ios', 'android'],
      icon: './icon.png',
      splash: './splash.png',
      expand: true
    });

    // so, in case just a string was passed in
    if (grunt.util.kindOf(options.platforms) !== 'array') {
      options.platforms = [options.platforms];
    }

    // filter for available platforms
    options.platforms = options.platforms.filter(platform => {
      for (var i in defaults.platforms) {
        if (defaults.platforms[i].name === platform) {
          return true;
        }
      }
      return false;
    });

    // process the platforms
    defaults.platforms.forEach(platform => {
      // ok, do we have the available platforms in the queue?
      if (options.platforms.indexOf(platform.name) !== -1) {
        // check for icons
        if (fs.statSync(options.icon).isFile()) {
          let dir = options.expand ? path.join(this.files[0].dest, 'icons', platform.name) : this.files[0].dest;
          // create dir
          mkdir(dir);
          // queue the creation tasks
          platform.icons.forEach(i => {
            let file = path.join(dir, i.name);
            tasks.push(icon(options.icon, file, i))
          });
        }

        // check for splashs
        if (fs.statSync(options.splash).isFile()) {
          let dir = options.expand ? path.join(this.files[0].dest, 'splashs', platform.name) : this.files[0].dest;
          // create dir
          mkdir(dir);
          // queue the creation tasks
          platform.splashs.forEach(s => {
            let file = path.join(dir, s.name);
            tasks.push(splash(options.splash, file, s))
          });
        }
      }
    });

    if (tasks.length > 0) {
      run(tasks, done);
    } else {
     // done();
    }
  });
}
