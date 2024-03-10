const Image = require('@11ty/eleventy-img')
const pluginBundle = require('@11ty/eleventy-plugin-bundle')

const pluginImages = require('./.eleventy.images.js')
const pluginYouTube = require("eleventy-plugin-youtube-embed");
const embedVimeo = require("eleventy-plugin-vimeo-embed");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginBundle, {
    bundles: ["basecss"]
  });
  eleventyConfig.addPlugin(pluginImages)
  eleventyConfig.addPlugin(embedVimeo)
  eleventyConfig.addPlugin(pluginYouTube, {
    modestBranding: true,
    lite: {
      responsive: true,
      thumbnailQuality: 'maxresdefault'
    }
  })

  eleventyConfig.addPassthroughCopy('img')

  eleventyConfig.addWatchTarget('css/')
  eleventyConfig.addWatchTarget('js/')

  eleventyConfig.setServerOptions({
    liveReload: false
  })

  eleventyConfig.addCollection('projectsByPriority', (collection) => {
    let projects = []
    projects.push(...collection.getFilteredByGlob('projects/**/*.liquid'))
    projects.push(...collection.getFilteredByGlob('projects/**/*.md'))

    const result = projects.map((project) => {
      let split = project.inputPath.split('/')
      let projectFolder = split[2]
      project.imgPath = `./projects/${projectFolder}`
      return project
    }).sort((a, b) => {
      if (a.data.priority > b.data.priority) return -1
      else if (a.data.priority < b.data.priority) return 1
      else return 0
    })
    return result
  })
}

