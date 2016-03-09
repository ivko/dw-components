module.exports = function (grunt) {
    // load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    { src: 'bower_components/requirejs/require.js', dest: 'src/vendor/require.js' },
                    { src: 'bower_components/text/text.js', dest: 'src/vendor/text.js' },
                    { src: 'bower_components/knockout/dist/knockout.debug.js', dest: 'src/vendor/knockout.js' },
                    { src: 'bower_components/jquery/dist/jquery.js', dest: 'src/vendor/jquery.js' },
                    { src: 'bower_components/mootools/dist/mootools-core.js', dest: 'src/vendor/mootools.js' },
                    { src: 'bower_components/sammy/lib/sammy.js', dest: 'src/vendor/sammy.js' }
                ]
            }
        },
        watch: {
            files: "less/*.less",
            tasks: ["less"]
        },
        // "less"-task configuration
        less: {
            // production config is also available
            development: {
                files: {
                    // compilation.css  :  source.less
                    "src/css/style.css": "less/style.less"
                }
            }
        }
    });
    
    grunt.registerTask('install', ['copy']);
    
     // the default task (running "grunt" in console) is "watch"
     grunt.registerTask('default', ['watch']);
};