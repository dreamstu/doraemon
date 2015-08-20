module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        bowercopy:{
            copy:{
                files:{
                    'public/libs/jquery.min.js':'jquery/dist/jquery.min.js',
                    'public/libs/jquery.min.map':'jquery/dist/jquery.min.map',
                    'public/libs/vue.min.js':'vue/dist/vue.min.js'
                }
            }
        }
    });

    grunt.registerTask('default', ['bowercopy']);

}
