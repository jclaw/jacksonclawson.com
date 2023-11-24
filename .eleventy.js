const Image = require('@11ty/eleventy-img')
const pluginBundle = require('@11ty/eleventy-plugin-bundle')

const pluginImages = require('./.eleventy.images.js')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginBundle, {
    bundles: ["basecss"]
  });
  eleventyConfig.addPlugin(pluginImages)

  eleventyConfig.addPassthroughCopy('img')

  eleventyConfig.addWatchTarget('css/')
  eleventyConfig.addWatchTarget('js/')

  eleventyConfig.setServerOptions({
    liveReload: false
  })

  eleventyConfig.addCollection('projectsByPriority', (collection) =>
    collection.getFilteredByGlob('projects/**/*.liquid').map((project) => {
      let split = project.inputPath.split('/')
      let projectFolder = split[2]
      project.imgPath = `./projects/${projectFolder}`
      return project
    }).sort((a, b) => {
      if (a.data.priority > b.data.priority) return -1
      else if (a.data.priority < b.data.priority) return 1
      else return 0
    })
  )
}
