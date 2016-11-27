module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                preserveComments: false
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'dist/<%= pkg.name %>.min.css': 'src/<%= pkg.name %>.scss'
                }
            },
            dev: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'dist/<%= pkg.name %>.css': 'src/<%= pkg.name %>.scss'
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['src/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        watch: {
            JS: {
                files: ['src/<%= pkg.name %>.js'],
                tasks: ['concat']
            },
            CSS: {
                files: ['src/<%= pkg.name %>.scss'],
                tasks: ['sass']
            },
            JSMIN: {
                files: ['src/<%= pkg.name %>.js'],
                tasks: ['uglify']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify', 'sass:dev', 'sass:dist']);
};