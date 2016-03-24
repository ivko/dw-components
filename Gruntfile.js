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
                    { src: 'bower_components/sammy/lib/sammy.js', dest: 'src/vendor/sammy.js' },
                    { src: 'bower_components/bootstrap/dist/js/bootstrap.js', dest: 'src/vendor/bootstrap.js' },
                    { src: 'bower_components/js-beautify/js/lib/beautify.js', dest: 'src/vendor/beautify.js' },
                    { src: 'bower_components/js-beautify/js/lib/beautify-css.js', dest: 'src/vendor/beautify-css.js' },
                    { src: 'bower_components/js-beautify/js/lib/beautify-html.js', dest: 'src/vendor/beautify-html.js' },
                    { src: 'bower_components/jsrender/jsrender.js', dest: 'src/vendor/jsrender.js'},
                    //{ cwd: 'bower_components/jquery-ui/ui', src: '**', expand: true, dest: 'src/vendor/jquery-ui' }
                ]
            }
        },
        watch: {
            files: "src/css/*.less",
            tasks: ["less"]
        },
        // "less"-task configuration
        less: {
            // production config is also available
            development: {
                files: {
                    // compilation.css  :  source.less
                    "src/css/style.css": "src/css/style.less"
                }
            }
        }
    });
    
    grunt.registerTask('install', ['copy']);
    
     // the default task (running "grunt" in console) is "watch"
     grunt.registerTask('default', ['watch']);
};