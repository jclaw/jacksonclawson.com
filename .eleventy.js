const pluginBundle = require("@11ty/eleventy-plugin-bundle");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pluginBundle);

    // Copy the `img` and `css` folders to the output
    eleventyConfig.addPassthroughCopy("img");

    eleventyConfig.addWatchTarget("css/");
    eleventyConfig.addWatchTarget("js/");
};
