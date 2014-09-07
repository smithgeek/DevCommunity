module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-ts");
    grunt.initConfig({
        ts: {
            // Browser code
            client_dev: {
                src: ["server/public/**/*.ts", "UnitTests/Client/**/*.ts"],
                options: {
                    removeComments: false
                }
            },
            
            // Server code
            server_dev: {
                src: ["server/*.ts", "server/routes/*.ts", "UnitTests/Server/**/*.ts"],
                options: {
                    module: 'commonjs',
                    sourceMap: false,
                    removeComments: false
                }
            },
        },
    });
    grunt.registerTask('build', ['ts:client_dev', 'ts:server_dev']);
    grunt.registerTask('build_server', ['ts:server_dev']);
    grunt.registerTask('build_client', ['ts:client_dev']);
}