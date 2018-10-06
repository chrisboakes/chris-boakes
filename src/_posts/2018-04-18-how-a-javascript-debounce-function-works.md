---
layout: post
title:  "Understanding how a JavaScript ES6 debounce function works"
description: "A look into how debouncing in JavaScript actually works"
excerpt: "I was asked recently how debouncing works in JavaScript. I knew why I should use it, what it did and that the ES6 helper function I'd been using was short and easy to read through. However I didn't grasp what was going on 'under the hood'."
date:   2018-04-18 09:28:59
categories: ['debounce', 'javascript']
---

I was asked recently how debouncing works in JavaScript. I knew why I should use it, what it did and that the ES6 helper function I'd been using was short and easy to read through. However I didn't grasp *how* it works. Let's start by taking a look at a commonly used debounce function:

```js
debounce(callback, wait) {
    let timeout;
    return (...args) => {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(context, args), wait);
    };
}
```

## Why you'd want to use debounce

Say you want to detect how far a user has scrolled down a page and, when they reach a certain point, you lazy load an image. You'd bind a scroll listener like so:

```js
window.addEventListener('scroll', () => {
	// Check how far the user has scrolled
});
```

The problem here is the quantity of times it's fired. It will run as many times as the browser chooses run it whilst the user is scrolling. This can be quite taxing for the browser. We should really be enforcing a limit on how often this is run. In comes debounce.

## What debounce does

It's common practice to use either a debounce or throttle to limit the amount of times the browser runs our callback function. The difference being:

**Throttle** - fire the callback *while* the action is being performed for the defined iteration time. For example, I set the iteration gap to 500 milliseconds. As the user scrolls, our callback will run every 500 milliseconds.

**Debounce** - fire the callback *after* the action has finished for the defined amount of time. For example, I set the wait time to 500 milliseconds. 500 milliseconds after the user has finished scrolling, our callback function will fire.

If we were to apply our debounce method to the above scroll listener, it would look like this:

```js
window.addEventListener('scroll', throttle(() => {
	// Check how far the user has scrolled
}, 500));
```

Our user would scroll and *after* they haven't scrolled for 500 milliseconds, our callback function would run.

## Debounce line by line

The debounce function is actually quite readable. Let's break it down, starting from the top:

* Allow for two arguments to be passed to our function `callback` and `wait`. `wait` is how long after the action has finished we want to wait before our `callback` function is called.
* Define a variable: `let timeout;`. This is `undefined` for the time being.
* Return an arrow function: `return (...args) => {`. This will be returned every time the method is called.
* Apply context for scope `const context = this;` (we'll discuss scoping in the next section)
* Clear the timeout if the timeout exists `clearTimeout(timeout);`
* Define `timeout` as `setTimeout` and apply our callback function to it: `timeout = setTimeout(() => func.apply(context, args), wait);`

## How it works

The `clearTimeout` method is resetting the timeout each time the function is called. Finally, **if the function is NOT called within the `wait` amount of time** then our callback method will finally be called.

To understand how the scope of this works, we need to understand how the browser deals with `setTimeout`. To do this, let's talk about the 'execution context' and 'execution stack'.

* **Execution Context** - every time you invoke or use a function in JavaScript a new context is created with its own set of variables, functions etc.
* **Global Execution Context** - the global environment JavaScript executes on. *Note* there can only one of these.
* **Execution Stack** - the list of execution contexts that will run synchronously, line by line

In the context of `setTimeout`, every iteration brings the method running inside of it to the top of the execution stack. When it runs, it creates its own execution context.

You might see why you may have a scoping issue here: `this` would not reference the initial context it was called from; it would instead reference its current execution context.

Fortunately in ES6, arrow functions use 'lexical scoping' (which basically means it uses *this* from the surrounding code). We can keep the scope of our original scope by passing it a reference to the execution context that we called it from.

## Conclusion

While the debounce function itself is only 8 lines long, it covers a lot of different concepts. It's easy to read through but is harder understand exactly how it works.
