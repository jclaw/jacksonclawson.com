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
      const newFile = src.split('/')[1]
      fs.copyFile(file, `${outputDir}${newFile}`, (err) => {
        if (err) {
          throw new Error(err)
        }
      })
      return `<img src="/img/${newFile}" alt="${alt}" class="${klass}" />`;
    } else {
      const metadata = await Image(file, {
        widths: [750, 1300, 1900, 2400, 2700, 3300],
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

      return Image.generateHTML(metadata, imageAttributes)
    }
  })
}
