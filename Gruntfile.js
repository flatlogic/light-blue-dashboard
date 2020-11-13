module.exports = function(grunt) {
    "use strict";
    var ENV = grunt.option('env') || 'development'; // pass --env=production to compile minified css
    var fs = require('fs');
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: {
            srcFolder: './src',
            distFolder: './dist'
        },

        // compiles handlebars template to html
        'handlebarslayouts': {
            templates: {
                files: {
                    '<%= config.distFolder %>/*.html': '<%= config.srcFolder %>/*.hbs'
                },
                options: {
                    partials: [
                        '<%= config.srcFolder %>/partials/*.hbs'
                    ],
                    context: {
                        productionEnv: ENV == 'production',
                        title: '<%= pkg.description %>',
                        preHtml: '<!-- <%= pkg.name %> - v<%= pkg.version %> - ' +
                            '<%= grunt.template.today("yyyy-mm-dd") %> -->\n',
                        /**
                         * Returns {clazz} if {val2} is present inside {val1} and if inverse is false or unset
                         * Returns {clazz} if {val2} is NOT present inside {val1} and if inverse is true
                         */
                        conditionClass: function(clazz, val1, val2, inverse){
                            // whether to inverse operation. returns 'class' if there is no val1 inside val2
                            inverse = typeof inverse == "undefined" ? false : inverse;
                            return val2.split(' ').indexOf(val1) == -1 ^ inverse ? '' : clazz;
                        }
                    }
                }
            }
        },

        // compile sass to css
        sass: {
            options: {
                importer:  function(url, prev, done) {
                    if ((/^CSS:/.test(url))) { // if indexOf == true then url.indexOf == 0 == false
                        return {
                            contents: fs.readFileSync(url.replace('CSS:../../.', '') + '.css').toString()
                        }
                    } else {
                        return {
                            file: url
                        }
                    }
                },
                sourcemap: 'none'
            },
            dist: {
                options: {
                    outputStyle: 'expanded',
                    precision: 10
                },
                files: {
                    "<%= config.distFolder %>/css/application.css":"<%= config.srcFolder %>/sass/application.scss"
                }
            },
            min: {
                options: {
                    outputStyle: 'compressed'
                },
                files: {
                    "<%= config.distFolder %>/css/application.min.css":"<%= config.srcFolder %>/sass/application.scss"
                }
            }
        },

        clean: {
            images: ['<%= config.distFolder %>/img'],
            scripts: ['<%= config.distFolder %>/js'],
            server: ['<%= config.distFolder %>/server'],
            libs: ['<%= config.distFolder %>/lib'],
            all: ['<%= config.distFolder %>']
        },

        // copy images & other static assets
        copy: {
            images: {
                expand: true,
                cwd: '<%= config.srcFolder %>/',
                src: 'img/**',
                dest: '<%= config.distFolder %>/'
            },
            scripts: {
                expand: true,
                cwd: '<%= config.srcFolder %>/',
                src: 'js/**',
                dest: '<%= config.distFolder %>/'
            },
            json: {
                expand: true,
                cwd: '<%= config.srcFolder %>/',
                src: 'js/**/*.json',
                dest: '<%= config.distFolder %>/'
            },
            server: {
                expand: true,
                cwd: '<%= config.srcFolder %>/',
                src: 'server/**',
                dest: '<%= config.distFolder %>/'
            },
            libs: {
                expand: true,
                cwd: 'bower_components',
                src: ['**/*.js', '**/*.png', '**/*.gif'],
                dest: '<%= config.distFolder %>/lib/',

                //copy js files from bower_packages only if they are not sources
                filter: function(filepath){
                    return filepath.indexOf('src') == -1;
                }
            },
            fontGoogle: {
                expand: true,
                cwd: '<%= config.srcFolder %>/sass/',
                src: 'fonts/**',
                dest: '<%= config.distFolder %>/css/'
            },
            fontBootstrap: {
                expand: true,
                cwd: 'bower_components/bootstrap-sass/assets',
                src: 'fonts/**',
                dest: '<%= config.distFolder %>/css/'
            },
            fontAwesome: {
                expand: true,
                cwd: 'bower_components/font-awesome/fonts',
                src: '**/*.*',
                dest: '<%= config.distFolder %>/css/fonts/font-awesome'
            },
            syncTransparentDarkStyles: {
                expand: true,
                cwd: 'html-transparent/src/sass',
                src: ['_base.scss', '_font.scss', '_general.scss', '_mixins.scss', '_override-bootstrap.scss',
                    '_override-custom-libs.scss', '_override-libs.scss', '_override-messenger.scss', '_print.scss',
                    '_responsive.scss', '_utils.scss', '_widgets.scss', 'application.scss' ],
                dest: 'html-white/src/sass'
            },
            syncWhiteStyles: {
                expand: true,
                cwd: 'html-transparent/src/sass',
                src: ['_base.scss', '_font.scss', '_general.scss', '_mixins.scss', '_override-bootstrap.scss',
                    '_override-custom-libs.scss', '_override-libs.scss', '_override-messenger.scss', '_print.scss',
                    '_responsive.scss', '_utils.scss', '_widgets.scss', 'application.scss' ],
                dest: 'html-transparent-dark/src/sass'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            build: {
                files: [{
                    expand: true,
                    cwd: '<%= config.srcFolder %>',
                    src: 'js/**/*.js',
                    dest: '<%= config.distFolder %>/'
                }]
            }
        },

        watch: {
            templates: {
                files: ['<%= config.srcFolder %>/*.hbs', '<%= config.srcFolder %>/partials/*.hbs'],
                tasks: ['handlebarslayouts']
            },
            syncSass: {
                files: ['<%= config.srcFolder %>/sass/**.scss', '<%= config.srcFolder %>/sass/**.sass'],
                tasks: ['copy:syncTransparentDarkStyles', 'copy:syncWhiteStyles']
            },
            sass: {
                files: ['<%= config.srcFolder %>/sass/**.scss', '<%= config.srcFolder %>/sass/**.sass'],
                tasks: ['dist-sass']
            },
            scripts: {
                files: ['<%= config.srcFolder %>/js/**.js', '<%= config.srcFolder %>/js/**.json'],
                tasks: ['dist-scripts']
            },
            images: {
                files: ['<%= config.srcFolder %>/img/**'],
                tasks: ['clean:images', 'copy:images']
            },
            server: {
                files: ['<%= config.srcFolder %>/server/**'],
                tasks: ['clean:server', 'copy:server']
            },
            libs: {
                files: ['bower_components/**'],
                tasks: ['dist-libs']
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-handlebars-layouts");

    // minify scripts for production environment or just copy for development
    grunt.registerTask('dist-scripts', ['clean:scripts', 'copy:json', ENV == 'production' ? 'uglify' : 'copy:scripts']);


    var distSass = ['sass:dist', 'copy:fontAwesome', 'copy:fontGoogle', 'copy:fontBootstrap'];
    if (ENV == 'production') {
        distSass = ['sass:min', 'copy:fontAwesome', 'copy:fontGoogle', 'copy:fontBootstrap'];
    }
    grunt.registerTask('dist-sass', distSass);

    // assemble html files
    grunt.registerTask('dist-templates', ['handlebarslayouts']);

    // copy images & server blocks
    grunt.registerTask('dist-misc', ['clean:images', 'copy:images', 'clean:server', 'copy:server']);

    // copy libs
    grunt.registerTask('dist-libs', ['clean:libs', 'copy:libs']);

    grunt.registerTask('dist-watch', ['watch']);

    // Default task(s)
    grunt.registerTask('default', ['clean:all', 'dist-sass', 'dist-templates', 'dist-scripts', 'dist-libs', 'dist-misc']);

};
