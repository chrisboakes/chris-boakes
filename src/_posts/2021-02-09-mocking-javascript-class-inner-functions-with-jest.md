---
layout: post
title:  "Mocking JavaScript Class Inner Functions With Jest"
description: "How to mock one class being called from another with Jest"
date:   2021-02-09 13:00:00
url: "/mocking-javascript-class-inner-functions-with-jest"
categories: ['jest', 'unit-testing', 'javascript']
excerpt: "I was recently writing unit tests for a project and I wanted to test whether a function in one class had been called by a parent class. Sounds simple right? I found it a bit trickier than anticipated so wanted to share my learnings."
---

I was recently writing unit tests for a project and I wanted to test whether a function in one class had been called by a parent class. Sounds simple right?

I found it a bit trickier than anticipated so thought I'd share my learnings:

## Set Up

Firstly, let's use a simple example of two JavaScript classes:

#### Class Bar

```js
class Bar {
	greetWorld( message ) {
		console.log( message );
	}
}

export default Bar;
```

#### Class Foo

We import bar and call the `helloWorld` function when we invoke `greetWorld`:

```js
import Bar from './bar';

class Foo {
	constructor() {
		this.bar = new Bar();
	}

	helloWorld() {
		this.bar.greetWorld( 'Hello World' );
	}
}

export default Foo;
```

## Initial attempt at testing helloWorld

We want to verify that the `helloWorld` function has called the `greetWorld` function in our `Bar` class. Here was my initial attempt (*note: this **doesn't** work*):

```js
import Foo from './foo';
import Bar from './bar';

describe( 'helloWorld', () => {
	it ( 'should call greetWorld', () => {
		const foo = new Foo();
		const bar = new Bar();

		jest.spyOn( bar, 'greetWorld' );

		foo.helloWorld();

		expect( bar.greetWorld ).toHaveBeenCalledTimes( 1 );
	});
});
```

Run this and you'll get:

```js
expect(jest.fn()).toHaveBeenCalledTimes(expected)

Expected number of calls: 1
Received number of calls: 0
```

The call from `helloWorld` to `greetWorld` hasn't registered.

## Correctly testing helloWorld

Looking in the [Jest docs](https://jestjs.io/docs/en/es6-class-mocks#calling-jestmockdocsenjest-objectjestmockmodulename-factory-options-with-the-module-factory-parameter) there are many ways to mock classes. I wanted a simple inline way of mocking it and here's how I did it:

```js
import Foo from './foo';
import Bar from './bar';

const mockGreetWorld = jest.fn();

jest.mock( './bar', () => {
	return jest.fn().mockImplementation(() => {
		return {
			greetWorld: mockGreetWorld
		};
	});
});

describe( 'helloWorld', () => {
	it ( 'should call greetWorld', () => {
		const foo = new Foo();
		const bar = new Bar();

		foo.helloWorld();

		expect( bar.greetWorld ).toHaveBeenCalledTimes( 1 );
	});
});
```

In this instance, we've called `jest.mock` with a module factory parameter. We *cannot* assign `greetWorld: jest.fn()`, it will fail:

```js
// This will fail
jest.mock( './bar', () => {
	return jest.fn().mockImplementation(() => {
		return {
			greetWorld: jest.fn()
		};
	});
});
```

One of the limitations of using the module factory parameter is that `jest.mock` is hoisted to the top of the file so you cannot first define a variale and then use it in the factory. The only exception is made for variables that start with the word `mock`, so this will work:

```js
// This will work
const mockGreetWorld = jest.fn();

jest.mock( './bar', () => {
	return jest.fn().mockImplementation(() => {
		return {
			greetWorld: mockGreetWorld
		};
	});
});
```

But this will fail:

```js
// This will fail
const barGreetWorld = jest.fn();

jest.mock( './bar', () => {
	return jest.fn().mockImplementation(() => {
		return {
			greetWorld: barGreetWorld
		};
	});
});
```

You can read more about this way of mocking classes in the Jest documentation [here](https://jestjs.io/docs/en/es6-class-mocks#calling-jestmockdocsenjest-objectjestmockmodulename-factory-options-with-the-module-factory-parameter).
