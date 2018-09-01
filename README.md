# Jekyll Starter Repo

A boilerplate for starting a basic [Jekyll](https://jekyllrb.com/) website. Compiled using Jekyll and webpack config from [Laravel Mix](https://github.com/JeffreyWay/laravel-mix).

## Setup

Install node packages

```sh
yarn install
```

To build for production, run:

```sh
yarn run production
```

If you get a jekyll error with the above command, run:

```sh
jekyll build
```

To watch files and start a local server, run:

```sh
yarn run watch
```

The server address will then be output in your terminal.

If you need to test on other devices on the same network use [Browser Sync](https://browsersync.io/). `cd` to the root of the project and run:

```sh
browser-sync start --server 'public' --files 'public'
```

This will output an External IP.

*Note*, you should use browser sync at the same time as the above watch command.

## Jekyll Template Structure

The `public` directory is rebuilt every time the project is built. You should therefore place no files in this directory.

### Posts
Create a new `.md` file in `src/_posts`. This will then be compiled using the template `src/_layouts/post.html`. The default route is `/:categories/:title/`. This can be updated in the `_config.yml` file.

### Pages
Create a new 'PAGENAME.html' file in the root of the `src` folder.

### Categories
Ensure your post has your categories assigned. When creating a new category, create a file for its hub page in `src/category/CATEGORYNAME.md`, this should contain the category name and reference the layout file like so (for the category 'test'):

```html
---
category: test
layout: category
---
```

### Images

Images should be placed in `src/assets/img`. These will then be moved into `public/assets/img` when the project is built.

### SVG Sprite

Place any SVGs to be included in the SVG sprite in `src/_img/svgs`. *Note*, the `yarn run watch` command will not watch this folder. You need to run either `yarn run production` or `yarn run dev` to compile the sprite.

## Dependencies

### [Yarn](https://yarnpkg.com/en/)

### [Jekyll](https://jekyllrb.com/)

Install command line tool
```sh
xcode-select --install
```

Check ruby is at least 2.3.3

```sh
ruby -v
2.3.3
```

Install Jekyll

```sh
gem install bundler jekyll
```

## Resources

[This cheatsheet](https://devhints.io/jekyll) is particularly helpful when working with Jekyll.
