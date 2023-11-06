const path = require('path')
const Image = require('@11ty/eleventy-img')
const fs = require('fs');
const unsupportedFormats = ['.gif'];
const outputDir = './_site/img/'

module.exports = function (eleventyConfig) {
  function relativeToInputPath (inputPath, relativeFilePath) {
    const split = inputPath.split('/')
    split.pop()

    return path.resolve(split.join(path.sep), relativeFilePath)
  }
  function relativeToImgPath (relativeFilePath) {
    const split = relativeFilePath.split('/')

    return `/img/${split[1]}`
  }

  eleventyConfig.addShortcode('image', async function imageShortcode (src, alt, sizes, klass) {
    // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
    const file = relativeToInputPath(this.page.inputPath, src)
    const { ext } = path.parse(src);

    if (unsupportedFormats.includes(ext)) {
      if(alt === undefined) {
        throw new Error(`Missing \`alt\` attribute on eleventy-img shortcode from: ${src}`);
      }
      // TODO
      // use fs.copyFile to manually copy this file to your output dir
      // based on this: https://github.com/11ty/eleventy-img/blob/46fe08739c70326bab34bbb5208b6c91891d38be/generate-html.js#L19
      const newFile = src.split('/')[1]
      fs.copyFile(file, `${outputDir}${newFile}`, (err) => {
        if (err) {
          throw new Error(err)
        }
      })
      return `<img src="/img/${newFile}" alt="${alt}" />`;
    } else {
      const metadata = await Image(file, {
        widths: [300, 600, 900, 1200],
        formats: ['avif', 'jpeg'],
        outputDir: outputDir
      })

      const imageAttributes = {
        class: klass,
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async'
      }

      // You bet we throw an error on a missing alt (alt="" works okay)
      return Image.generateHTML(metadata, imageAttributes)
    }
  })
}
