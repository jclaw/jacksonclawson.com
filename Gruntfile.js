
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Automatically run a task when a file changes
        watch: {
            styles: {
                files: [
                    'scss/*'
                ],
                tasks: 'compass:dev'
            }
        },
        // Compile scss
        compass: {
            dev: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'stylesheets',
                    // specify: 'scss/app.scss',
                    sourcemap: true
                }
            }
        },
        // configure jekyll build and serve tasks
        shell : {
            jekyllBuild : {
                command: "jekyll build"
            },
            jekyllServe : {
                command: "jekyll serve"
            },
            jekyllServe_nobuild : {
                command: "jekyll serve --skip-initial-build"
            },
            compress_images: {
                command: "cd _site/public; mogrify -verbose -strip -interlace Plane -sampling-factor 4:2:0 -resize 400x400 */*.jpg"
            }
        }
    });

    // Load the plugin that provides the "compass" task.
    grunt.loadNpmTasks('grunt-contrib-compass');
    // load plugin for live sass compiling.
    grunt.loadNpmTasks('grunt-contrib-watch');
    // load shell task runner
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('serve_compressed', ['compass', 'shell:jekyllBuild', 'shell:compress_images', 'shell:jekyllServe_nobuild'])

    // default tasks
    grunt.registerTask('default', ['compass', 'shell:jekyllServe']);

};
