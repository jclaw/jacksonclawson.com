const Image = require('@11ty/eleventy-img')
const pluginBundle = require('@11ty/eleventy-plugin-bundle')

const pluginImages = require('./.eleventy.images.js')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginBundle)
  eleventyConfig.addPlugin(pluginImages)

  // Copy the `img` and `css` folders to the output
  eleventyConfig.addPassthroughCopy('img')

  eleventyConfig.addWatchTarget('css/')
  eleventyConfig.addWatchTarget('js/')

  eleventyConfig.addCollection('projectsByPriority', (collection) =>
    collection.getFilteredByGlob('projects/**/*.md').sort((a, b) => {
      if (a.data.priority > b.data.priority) return -1
      else if (a.data.priority < b.data.priority) return 1
      else return 0
    })
  )
}
