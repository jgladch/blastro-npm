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
    },

    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          watch: ['lib/*.js', 'server.js', 'Gruntfile.js'],
          ignore: ['lib/concat/*', 'node_modules', 'issnode.yml']
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'lib/*.js',
          '!lib/concat/*.js',
        ],
        tasks: [
          'build'
        ]
      }
    },

    shell: {
      options: {
        stdout: true,
        stderr: true,
        async: true,
        failOnError: true
      },
      azure: {
        //This command will need to change if you change name of branch
        command: 'git push azure js:master'
      },
      blastro: {
        //This command will need to change if you change name of branch
        command: 'git push origin js:master'
      },
      hackreactor: {
        //This command will need to change if you change name of branch
        command: 'git push hr js:master'
      },
      nodemon: {
        command: 'grunt nodemon'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('build', ['concat']);

  grunt.registerTask('dev', ['build', 'watch']);

  grunt.registerTask('deploy', ['push'])

  grunt.registerTask('push', function(n) {
    if(grunt.option('prod')) {
      grunt.task.run(['shell:azure']);
    } else {
      grunt.task.run(['shell:blastro', 'shell:hackreactor']);
    }
  });
};
