/* eslint-disable */

// SVG Plugin will find this variable on build and creates
// the sprite file in the specified path
let __svg__ = {
    path: '../_img/svgs/**/*.svg',
    name: './src/assets/build/svg-sprite.svg'
};

// Load The SVG Sprite using
let svgSprite = {
    filename: './assets/build/svg-sprite.svg'
};

require('webpack-svgstore-plugin/src/helpers/svgxhr')(svgSprite);
