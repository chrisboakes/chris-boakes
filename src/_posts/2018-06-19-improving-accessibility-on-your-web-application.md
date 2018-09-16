---
layout: post
title:  "Improving Accessibility On Your Web Application"
date:   2018-06-19 09:28:59
category: accessibility
---

# Improving Accessibility On Your Web Application

Advancing my knowledge around the topic of accessibility has been something I've been doing a lot recently. With this knowledge came the realisation that previous web applications I'd worked on could do with some improvements in this field. Ideally accessibility should be a consideration from the inception of the project and shouldn't be implemented after the application has already been built. However there are a few *quick wins* which could fundamentally improve the accessibility of your web application post-build. While this article will skim the surface of a larger topic, it aims to focus on a few impactful concepts.

## Rewrite your `alt` tags

I found the `alt` attribute generally did exist on my `img` tags, however it wasn't necessarily helpful to those with sight impairments. As an example, the `alt` text for a pie chart shouldn't read 'Pie chart' because it doesn't contain equivalent information as if they were to see it. Would your current `alt` tag accurately describe the image to someone with a sight impairment? If not, you should consider rewriting it.

## Give your links context

If you try navigating a web application by links alone, you will notice there is no context to links such as 'read more' or 'see more'. To a user with no sight impairment they make sense within the structure but to screen readers they often don't. Instead of making long links such as 'Read more about the history of the United Kingdom' which may break your layout. I recommend using the approach outlined in this ['I thought title text improved accessibility. I was wrong.' article](https://silktide.com/i-thought-title-text-improved-accessibility-i-was-wrong/). To illustrate, your markup could be:

```html
<a href="/history" class="u-more">
	Read more<span class="u-visually-hidden"> about the history of the United Kingdom</span>
</a>
```

Your CSS would then be:

```css
.u-visually-hidden {
	height: 1px;
	overflow: hidden;
	position: absolute;
	top: -10px;
	width: 1px;
}
```

You may notice I'm not assigning the visually hidden text `display: none`. This is because screen readers don't always honour this.

### Links in paragraphs

Consider how you use links within paragraphs. For example:

*It was found in a recent [survey](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0136643) that Rhinos have a very low population number.*

A screen reader will give the user a list of links on the page. Would the word 'survey' give an indication of where the link will take the user? Probably not. If we wrote the same sentance like so:

*In a recent survey, '[An Island-Wide Survey of the Last Wild Population of the Sumatran Rhinoceros](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0136643)' it was found that Rhinos have a very low population number.*

A user navigating the website by links would understand the destination of the link.


## Accessible Semantics

Your heading structure should make sense with the page hierarchy. [A lot of people who use screen readers will try and navigate your page through the headings](http://www.heydonworks.com/article/responses-to-the-screen-reader-strategy-survey) and then read relevant content associated with it.

Semantics are extremely important for screen readers. They can detect all kinds of tags and can help describe areas of your application. Have you implemented the `<main>` tag? Screen readers like JAWS offer a keyboard shortcut to access the main page content. Taking into account tags such as `<nav>` or `<aside>` can also be helpful to describe the type of content that's being read.

*Further reading: [Extending Semantics & Accessibility](https://learn.shayhowe.com/advanced-html-css/semantics-accessibility/)*

## Accessible Site Navigation

Often when working on navigation, developers will use a visual device to highlight which page the user is on. The markup may look like so:

```html
<ul class="c-site-nav">
	<li><a href="/" class="c-site-nav__item">Home</a></li>
	<li><a href="/about" class="c-site-nav__item c-site-nav__item--current">About</a></li>
	<li><a href="/contact" class="c-site-nav__item">Contact</a></li>
</ul>
```

We would then use the class modifier to visually distinguish this link in CSS. The problem here is:

* There's no signifier to screen readers which is the current page
* In the context of the document we don't know the role of this unordered list

We could greatly improve it by structuring it like so:

```html
<nav role="navigation">
	<ul class="c-site-nav">
		<li><a href="/" class="c-site-nav__item">Home</a></li>
		<li>
			<a href="/about" class="c-site-nav__item c-site-nav__item--current">
				<span class="u-visually-hidden">Current Page: </span>About
			</a>
		</li>
		<li><a href="/contact" class="c-site-nav__item">Contact</a></li>
	</ul>
</nav>
```

We would then use the CSS technique to visually hide the phrase 'Current Page: '. In this example we're telling the screen reader the purpose of the list and letting the user know which page they're on without aesthetically changing anything.

## Accessible Forms

If your form isn't accessible, a sight impaired user will struggle to fully interact with your application.

### Fields

Ensure every form field on your website has an associated `<label>` field with a `for` attribute. The `placeholder` attribute should only be used to provide supplemental information and shouldn't be relied upon to provide the purpose of the field.

### Error Messages

Give helpful error messages and be specific with your feedback. If there's a validation error what can the user do to correct the problem? Providing the feedback 'There was a problem with your email address' if the email is not valid isn't as helpful as 'Please provide a valid email address'.

Markup for each error message should be connected with the associated field to give context to which field there was a problem with.

*Further reading: [Creating Accessible Forms](https://webaim.org/techniques/forms/)*
