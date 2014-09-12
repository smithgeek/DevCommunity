module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    
    grunt.initConfig({
        ts: {
            // Browser Code
            client_dev: {
                src: ["source/Client/**/*.ts", "source/Tests/Client/**/*.ts", "source/Common/**/*.ts", "source/Typings/Client/**/*.ts", "source/Typings/Common/**/*.ts"],
                outDir: "site/public/assets/js/",
                options: {
                    module: 'commonjs',
                    removeComments: false,
                }
            },
            
            // Server code
            server_dev: {
                src: ["source/Server/**/*.ts", "source/Tests/Server/**/*.ts", "source/Common/**/*.ts", "source/Typings/Server/**/*.ts", "source/Typings/Common/**/*.ts"],
                outDir: "site",
                options: {
                    module: 'commonjs',
                    sourceMap: false,
                    removeComments: false
                }
            },
            
            client_rel:{
                src: ["source/Client/**/*.ts", "source/Common/**/*.ts", "source/Typings/Client/**/*.ts", "source/Typings/Common/**/*.ts"],
                outDir: "obj/rel/client/",
                options: {
                    module: 'commonjs',
                    removeComments: true,
                }            
            },
            // Server code
            server_rel: {
                src: ["source/Server/**/*.ts", "source/Common/**/*.ts", "source/Typings/Server/**/*.ts", "source/Typings/Common/**/*.ts"],
                outDir: "site",
                options: {
                    module: 'commonjs',
                    sourceMap: false,
                    removeComments: false
                }
            },            
        },
        
        browserify: {
            client_dev: {
                src: ['site/public/assets/js/Client/**/*.js', 'site/public/assets/js/Common/**/*.js'],
                dest: 'site/public/assets/js/main.js',
            },
            client_rel: {
                src: ['obj/rel/client/**/*.js'],
                dest: 'site/public/assets/js/main.js',
            },
        },
        
        uglify: {
            client_rel: {
                files: {
                    'site/public/assets/js/main.js': ['site/public/assets/js/main.js'],
                },
                options: {
                    mangle: false
                },
            }
        },
        clean: ["site/Common", "site/Server", "site/Tests", "site/.baseDir.js", "site/public/assets/js", "obj/rel"]
    });
    
    grunt.registerTask('build_server', ['ts:server_dev']);
    grunt.registerTask('build_client', ['ts:client_dev', 'browserify:client_dev']);
    grunt.registerTask('build', ['build_client', 'build_server']);
    
    grunt.registerTask('build_server_rel', ['ts:server_rel']);
    grunt.registerTask('build_client_rel', ['ts:client_rel', 'browserify:client_rel', 'uglify:client_rel']);
    grunt.registerTask('build_rel', ['clean', 'build_client_rel', 'build_server_rel']);
}