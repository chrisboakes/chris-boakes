---
layout: post
title:  "Static and serverless with Nuxt.js, Vuex, Contentful, Netlify"
date:   2018-09-01 09:28:59
categories: ['serverless', 'javascript', 'vuejs', 'contentful', 'netlify']
excerpt: "I'm a big fan of Vue.js and Vuex for state management. Combine this with Nuxt and you can generate a static version of your Vue application and give your users a speedy site served from HTML files."
---

# Static and serverless with Nuxt.js, Vuex, Contentful, Netlify

As a front-end developer, the rise of static site generators combined with serverless architecture is an extremely appealing way to work. While not suited to every purpose, there are a lot of reasons to love statically served sites. It can take the hassle out of managing/maintaining server infrastructure and can provide a speedy way to serve your page because you're serving pre-rendered HTML instead of waiting for your database or API to return data. As a front-end developer do you really want to spend your time configuring how your server sends mail? Probably not. There are plenty of [services](https://thepowerofserverless.info/services.html) and APIs that can help take care of this for you.

I'm a big fan of [Vue.js](https://vuejs.org/) and [Vuex](https://vuex.vuejs.org/) for state management. Combine this with [Nuxt](https://nuxtjs.org/) and you can generate a static version of your Vue application and give your users a speedy site served from HTML files.

On previous projects, I've used [Jekyll](https://jekyllrb.com/) to achieve a similar result. This can work well if the logic of your site is basic.

For the purposes of this article we'll look at how we can make a simple blog by integrating a CMS and use a [webhook](https://en.wikipedia.org/wiki/Webhook) to trigger an update. We'll need to use a static file host of which [there are many](https://thepowerofserverless.info/services.html#static-hosting). For this article, we'll be using [Netlify](https://www.netlify.com/) because it's a great static file host and it's super easy to work with. We'll also need to use a CMS and what better than [Contentful](https://www.contentful.com/) (seeing as it has a [tasty Javascript SDK](https://github.com/contentful/contentful.js/)).

To get started, you'll need to create an account on:

* [Contentful](https://www.contentful.com/sign-up/) for your CMS
* [Netlify](https://app.netlify.com/signup?_ga=2.77260182.2001511072.1529676923-1931852304.1529676923) for your static file hosting

## Get set up with Nuxt

Make sure you have the [Vue CLI](https://cli.vuejs.org/guide/creating-a-project.html#installation) installed. Run through the installation instructions in the [Nuxt community starter template](https://github.com/nuxt-community/starter-template) README. We'll be using this as the basis for our work. Once you've installed all of your packages, run `yarn dev` and visit [http://localhost:3000](http://localhost:3000) in your browser. You should see something like this:

![Nuxt starter](/assets/img/blog/nuxt-demo-image-1.png)

## Structure

### Clean up

The starter template gives us a nice directory structure already. Start by clearing out the `pages/index.vue` file so it just contains:

```html
<template>
    <div class="container"></div>
</template>
```

Add a title and link in the `layouts/default.vue` page above the `<nuxt/>` element:

```html
<h1 class="site-title">
    <nuxt-link :to="{ path: '/' }" class="site-title__link">
        Nuxt Demo
    </nuxt-link>
</h1>
```

You should now have a blank page just containing your site title.

### Vuex

If you've worked with Vuex before, Nuxt has a slightly different configuration. You can either configure it in [classic mode](https://nuxtjs.org/guide/vuex-store/#classic-mode) or [modules mode](https://nuxtjs.org/guide/vuex-store/#modules-mode). We'll go with the latter. Instead of globally configuring the store, we'll export the state as a function and mutations and actions as objects; Nuxt will take care of the rest. Create a file in the `store` directory called `posts.js`:

```js
export const state = () => ({
    posts: []
})

export const mutations = {
    setPosts(state, payload) {
        state.posts = payload
    }
}

export const actions = {

}
```

Here we're creating an empty posts array and a setter which we'll fill later with data from Contentful.

## Integrating Contentful

### Contentful CMS Setup

[Login to Contentful](https://be.contentful.com/login) and create a new space. When you're in the space, create a new **Content model** called **Blog Post** with an API identifier of **blogPost**. Add four fields to it:

1. **Text** (Short text) with the name of **Title** and the field ID of **title**
2. **Text** (Short text) with the name of **Slug** and the field ID of **slug**
3. **Text** (Short text) with the name of **Description** and the field ID of **description**
4. **Text** (Long text) with the name of **Content** and the field ID of **content**

Save this configuration, navigate to Content, add a new Entry with our new content model, fill it out with dummy data and hit **Publish**.

### SDK Integration & Environment Management

Contentful has a [JavaScript SDK](https://github.com/contentful/contentful.js) which is what we'll be using to fetch our post data.

* Add this SDK to the project: `yarn add contentful` (or `npm install contentful --save`).
* Add the [@nuxtjs/dotenv](https://github.com/nuxt-community/dotenv-module) module: `yarn add @nuxtjs/dotenv`. This will help keep our API keys secret.

Open `nuxt.config.js` and add the following object to the `module.exports` object:

```js
modules: ['@nuxtjs/dotenv']
```

Create a new file in the root of our project with the filename `.env`. This is where we'll store our API keys. Add this file to your list of gitignored files to ensure these are not pushed to your git repo. Have your Space ID (Settings > General Settings) ready and add a new Content Delivery Access Token (Settings > API Keys). In the `.env` file, assign them:

```bash
CTF_SPACE_ID=YOUR_SPACE_ID
CTF_CD_ACCESS_TOKEN=YOUR_ACCESS_TOKEN
```

Create a new file in the `plugins` directory called `contentful.js` and initialise Contentful with our keys:

```js
require('dotenv').config()
const contentful = require('contentful')

module.exports = contentful.createClient({
    space: process.env.CTF_SPACE_ID,
    accessToken: process.env.CTF_CD_ACCESS_TOKEN
})
```

### Getting our first posts

In our `pages/index.vue` file, we'll add a computed property for our posts and an asynchronous method to call our store to fetch the data.

```html
<script>
export default {
    computed: {
        posts() {
            return this.$store.state.posts.posts
        }
    },
    async fetch({ store, params }) {
        await store.dispatch('posts/getPosts', params.slug)
    }
}
</script>
```

*Notice how we don't need to import our Vuex state? Thanks Nuxt.*

Next, add a new method in `store/posts.js`:

```js
async getPosts({commit}) {

}
```

This is where we'll make our call to Contentful to fetch our posts so let's start by initialising Contentful at the top of the file:

```js
import client from '../plugins/contentful'
```

Now use [Contentful's getEntries method](https://contentful.github.io/contentful.js/contentful/6.1.1/ContentfulClientAPI.html#.getEntries) to fetch our data:

```js
async getPosts({commit}) {
    await client.getEntries({
        content_type: 'blogPost'
    }).then((response) => {
	    if (response.items.length > 0) {
        	commit('setPosts', response.items)
        }
    }).catch(console.error)
}
```

After the getEntries method we're setting the state's post object to the response of our API and (for now) catching any errors by logging them in the console.

Build your files. If you get the error *\* fs in ./node_modules/dotenv/lib/main.js is not defined*, add the following to your nuxt config in the `extend` method of the build object:

```js
config.node = {
	fs: 'empty'
}
```

We should now have assigned our response to the state's post object so we just need to display the data. Navigate to `pages/index.vue` and edit our container div:

```html
<div class="container">
    <h2>Latest posts</h2>
    <ul>
        <li v-if="posts" v-for="(post, index) in posts" :key="index">
            <nuxt-link :to="post.fields.slug">{{ post.fields.title }}</nuxt-link>
        </li>
    </ul>
</div>
```

We're looping through the posts array and using the [nuxt-link](https://nuxtjs.org/api/components-nuxt-link/) (which is the same as `router-link` if you've used [Vue Router](https://router.vuejs.org/api/) before) component to create a link to a single post which we'll setup in next.

Visit the site in your browser and you should see something like this:

![Nuxt Demo Image](/assets/img/blog/nuxt-demo-image-2.png)


## Dynamic routing for our single post view

We need to set up a template for our single post. Because we won't want to create static files for each post we'll need to create a dynamic template to house these posts. Create a new template called `_slug.vue` in the pages directory and add the following code for now:

```html
<template>
    <div class="single-post"></div>
</template>
```

Our route will now work but won't display anything. Let's configure this page with Vuex and flow the data down into this template making sure we're inline with [the principle of separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns).

Create a new store `store/post.js` and structure it in a similar way to our posts:

```js
import client from '../plugins/contentful'

export const state = () => ({
    currentPost: {},
    isLoading: true
})

export const mutations = {
    setCurrentPost(state, payload) {
        state.currentPost = payload
    },
    setLoading(state, payload) {
        state.isLoading = payload
    }
}

export const actions = {

}
```

This should look familiar. Notice we're assigning an `isLoading` boolean. This will act as a quick and easy way to let the user know we're waiting for data from Contentful.

Let's add an asynchronous method to our actions object to get data for our page from the `slug` field:

```js
async getPostBySlug({commit}, slug) {
	commit('setLoading', true);
	await client.getEntries({
		content_type: 'blogPost',
		'fields.slug': slug
	}).then((response) => {
		commit('setCurrentPost', response.items[0]);
		commit('setLoading', false);
    }).catch(console.error);
}
```

Once we've found a match, we'll assign the state's `currentPost` to the first match from our search using the mutation we wrote earlier.

Now we just need to flow this data down into our `_slug.vue` template.

Firstly, add a script to the bottom of the file to assign our computed `currentPost` & `isLoading` properties and to trigger [Nuxt's fetch method](https://nuxtjs.org/api/pages-fetch/) to call our Vuex action to get the data from Contentful for our post:

```html
<script>
export default {
    computed: {
        currentPost() {
            return this.$store.state.post.currentPost
        },
        isLoading() {
            return this.$store.state.post.isLoading
        }
    },
    async fetch({ store, params }) {
        await store.dispatch('post/getPostBySlug', params.slug)
    }
}
</script>
```

It's worth reading [Contentful's data model](https://www.contentful.com/developers/docs/concepts/data-model/) to understand how the data we receive from Contentful is structured. To display the content on the page we'll be using the `fields` object. Here's how the markup will look:

```html
<div class="single-post">
    <div v-if="!isLoading" class="single-post__article">
    	<h1 class="single-post__title">
            {{ currentPost.fields.title }}
        </h1>
        <div class="single-post__content">
            {{ currentPost.fields.content }}
        </div>
    </div>
    <p v-else class="single-post__loading">
        Loading
    </p>
</div>
```

Firstly, we have a conditional to check if we're still waiting for data from Contentful and if so, we'll display a loading message. The rest should be self explanatory.

Have a look at it in your browser and you should see content for your single post.

If you've added any markdown elements in your content you may notice that they aren't rendered as HTML. You'll need to use a package to do so. Add [@nuxtjs/markdownit](https://github.com/nuxt-community/modules/tree/master/packages/markdownit) `yarn add @nuxtjs/markdownit` and declare it as a module in your nuxt config file (you should now have two modules):

```js
modules: ['@nuxtjs/dotenv', '@nuxtjs/markdownit'],
markdownit: {
	injected: true
},
```

We've also configured it's injection here. Now parse the content in your `slug.vue` file by replacing our pre-existing `single-post__content` div with the following:

```html
<div class="single-post__content" v-html="$md.render(currentPost.fields.content)"></div>
```

Your content should now display as HTML.

## Statically generating our site

If you run `yarn generate` you'll notice that Nuxt creates a new directory in the root of our project called `dist`. It hasn't statically generated our site quite yet. We'll need to configure the nuxt config file to do so.

Let's use [Nuxt's generate property](https://nuxtjs.org/api/configuration-generate/). Start by adding a new object to `nuxt.config.js` called 'generate' with an empty [routes](https://nuxtjs.org/api/configuration-generate/#routes) method:

```js
generate: {
    routes: () => {

    }
}
```

This is where we'll configure our dynamic route by getting our posts from Contentful when the generate method is called. Start by adding the following to the top of the nuxt config file:

```js
require('dotenv').config()
const contentful = require('contentful')
```

This enables us to use the environment variables in our `.env` file to authenticate our Contentful posts call (just like we did before). We want to use the Contentful SDK again to get our data so we've assigned that variable.

Going back to our `routes` method:

```js
routes: () => {
    const client = contentful.createClient({
        space:  process.env.CTF_SPACE_ID,
        accessToken: process.env.CTF_CD_ACCESS_TOKEN
    });

    return client.getEntries({
        content_type: 'blogPost'
    }).then((response) => {
        return response.items.map(entry => {
            return {
                route: entry.fields.slug,
                payload: entry
            };
        });
    });
}
```

We're initialising Contentful and then fetching all entries and mapping the reponse by assigning the post's slug to the route.

Run `yarn generate` again and you'll notice Nuxt has created a directory structure of posts containing static files; exactly what we want.

## Deploying to Netlify

Firstly, make sure you've pushed your project to [Github](https://github.com/) (or GitLab/Bitbucket) and run through steps 1 and 2 of the 'Create a new site' process. When you get to step 3, your build command will be `yarn generate` and your publish directory will be 'dist'. Make sure you click 'Show advanced' and assign the keys and values in your `.env` file here. When you're ready, hit 'Deploy site'.

Wait a few minutes while Netlify pulls down the packages it needs to deploy your site and runs the generate command. Once the deployment is successfully complete it will generate a domain for you and you should be able to view your site.

By default, Netlify will build and update your site if you push any changes to the branch you picked to deploy from but this doesn't solve the issue of triggering a change if we post something new to Contentful.

### Netlify build hook

To trigger a change from Contentful we can use [Netlify's build hook](https://www.netlify.com/docs/webhooks/). Navigate to 'Build & deploy' under 'Settings' in the Netlify control panel and click 'Add build hook', name it and save it. Netlify should have generated you a build hook URL which can be used in Contentful to trigger a build.

In your Contentful admin panel, go to 'Settings', 'Webhooks' and add a new one. Call it something like 'Deploy to Netlify', paste in the build hook URL from Netlify into the URL field. Next, select 'Only Selected Events' under the 'Trigger this webhook for:' option, configure which events you want to trigger a build with and hit save.

If you navigate back to Netlify, you should see your deployment building on the 'Deploys' page in the CMS. Once it's finished you should see **PUBLISHED** status message next to the deployment. Check your Netlify generated URL and you should see your new post.

## Wrapping it up

You should now have a basic statically generated blog page with dynamic single post routing. I've put all of the code written in this article in this [nuxt-contentful-demo Github repository](https://github.com/chrisboakes/nuxt-contentful-demo). To extend the learnings in this article further I recommend reading the:

* The [Contentful JavaScript SDK docs](https://contentful.github.io/contentful.js/contentful/6.1.1/)
* The [Nuxt.js docs](https://nuxtjs.org/guide)
* [This comprehensive list of serverless services](https://thepowerofserverless.info/services.html)
