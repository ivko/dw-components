module.exports = function (grunt) {
    // load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            vendor: {
                files: {
                    'src/libs/jquery.calendars.js': [
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.islamic.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker.ext.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-ar.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-bg.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-de.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-el.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-en-GB.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-es.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-fr.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-hr.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-it.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-ja.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-nl.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-pl.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-pt-BR.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-ru.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-sv.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.picker-zh-CN.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.plus.js',
                        'bower_components/dw-shared/Components/Widgets/DateTime/calendars/js/jquery.calendars.ummalqura.js'
                    ],
                    'src/libs/globalize.js': [
                        'bower_components/dw-shared/Components/Globalize/globalize.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-ar.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-bg.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-de.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-de-CH.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-el.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-en-GB.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-en-US.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-es.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-fr.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-hr.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-it.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-ja.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-nl.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-pl.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-pt.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-ru.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-sv.js',
                        'bower_components/dw-shared/Components/Globalize/globalize.culture-zh.js'
                    ],
                    'src/libs/slick.grid.js': [
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.core.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.grid.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.rowselectionmodel.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.cellselectionmodel.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.cellrangeselector.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.cellrangedecorator.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.autotooltips.js',
                        'bower_components/dw-shared/Components/Widgets/slickGrid/js/slick.droppable.js'
                    ],
                    'src/libs/bootstrap.js': [
                        'bower_components/bootstrap/js/tooltip.js',
                        'bower_components/bootstrap/js/popover.js',
                        'bower_components/bootstrap/js/collapse.js'
                    ]
                },
            },
        },
        copy: {
            main: {
                files: [
                    { src: 'bower_components/requirejs/require.js', dest: 'src/libs/require.js' },
                    { src: 'bower_components/dw-shared/Scripts/jquery-ui-1.11.4.custom.js', dest: 'src/libs/jquery-ui.js' },
                    { src: 'bower_components/text/text.js', dest: 'src/libs/text.js' },
                    { src: 'bower_components/knockout/dist/knockout.debug.js', dest: 'src/libs/knockout.js' },
                    { src: 'bower_components/jquery/dist/jquery.js', dest: 'src/libs/jquery.js' },
                    { src: 'bower_components/mootools/dist/mootools-core.js', dest: 'src/libs/mootools-core.js' },
                    { src: 'bower_components/dw-shared/Scripts/Mootools/mootools-interfaces.js', dest: 'src/libs/mootools-interfaces.js' },
                    { src: 'bower_components/sammy/lib/sammy.js', dest: 'src/libs/sammy.js' },
//                    { src: 'bower_components/bootstrap/dist/js/bootstrap.js', dest: 'src/libs/bootstrap.js' },
                    { src: 'bower_components/js-beautify/js/lib/beautify.js', dest: 'src/libs/beautify.js' },
                    { src: 'bower_components/js-beautify/js/lib/beautify-css.js', dest: 'src/libs/beautify-css.js' },
                    { src: 'bower_components/js-beautify/js/lib/beautify-html.js', dest: 'src/libs/beautify-html.js' },
                    { src: 'bower_components/jsrender/jsrender.js', dest: 'src/libs/jsrender.js'},
                    { src: 'bower_components/moment/moment.js', dest: 'src/libs/moment.js' },
                    { src: 'bower_components/dw-shared/Components/jquery.plugin.js', dest: 'src/libs/jquery.plugin.js'},
                    { src: 'bower_components/dw-shared/Components/Widgets/DateTime/dateEntry/jquery.dateentry.js', dest: 'src/libs/jquery.dateentry.js' },
                    { src: 'bower_components/dw-shared/Components/Widgets/DateTime/dateTimeEntry/jquery.datetimeentry.js', dest: 'src/libs/jquery.datetimeentry.js' },
                    { src: 'bower_components/dw-shared/Components/Widgets/DateTime/timeEntry/jquery.timeentry.js', dest: 'src/libs/jquery.timeentry.js' },
                    //{ src: 'bower_components/cldrjs/dist/cldr.js', dest: 'src/libs/cldr.js'},
                    //{ src: 'bower_components/globalize/dist/globalize.js', dest: 'src/libs/globalize.js'},
                    //{ cwd: 'bower_components/cldrjs/dist/cldr', src: '**', expand: true, dest: 'src/libs/cldr' },
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
    
    grunt.registerTask('install', ['concat', 'copy']);
    
     // the default task (running "grunt" in console) is "watch"
     grunt.registerTask('default', ['watch']);
};