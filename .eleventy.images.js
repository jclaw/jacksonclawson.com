const path = require('path')
const Image = require('@11ty/eleventy-img')

module.exports = function (eleventyConfig) {
  function relativeToInputPath (inputPath, relativeFilePath) {
    const split = inputPath.split('/')
    split.pop()

    return path.resolve(split.join(path.sep), relativeFilePath)
  }

  eleventyConfig.addShortcode('image', async function imageShortcode (src, alt, sizes) {
    // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
    const file = relativeToInputPath(this.page.inputPath, src)
    const metadata = await Image(file, {
      widths: [300, 600, 900, 1200],
      formats: ['avif', 'jpeg'],
      outputDir: './_site/img/'
    })

    const imageAttributes = {
      alt,
      sizes,
      loading: 'lazy',
      decoding: 'async'
    }

    // You bet we throw an error on a missing alt (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes)
  })
}
