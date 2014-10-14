module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';',
        stripBanners: true,
      },
      lib: {
        src : [
          'lib/*.js',
          '!lib/concat'
        ],
        dest: 'lib/concat/lib.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('myConcat', [
    'concat'
  ]);

};
