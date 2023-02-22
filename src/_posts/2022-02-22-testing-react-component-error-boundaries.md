---
layout: post
title:  "Testing React Component Error Boundaries"
description: "How to test thrown errors from a react component within an error boundary"
date:   2022-02-22 13:00:00
url: "/testing-react-component-error-boundaries"
categories: ['unit-testing', 'javascript', 'vitest', 'react-testing-library']
excerpt: "I've been working with error boundaries in React. Here's how to effectively test thrown errors by components wrapped in an error boundary using Vitest and React Testing Library."
---

I've been working with [error boundaries](https://reactjs.org/docs/error-boundaries.html) in React. The basic idea is that you can catch any thrown errors during the render phase of your application without disrupting the entire render. This can be helpful to avoid error messages that would otherwise disrupt the user's flow:

![Throw error in the middle of a page](/assets/img/blog/testing-react-component-error-boundary-browser.png)

You might structure your code to look like this:

```jsx
<main>
    <Header />

    <Navigation />

    <ErrorBoundary>
        <Child />
    </ErrorBoundary>
</main>
```

With this structure, if any of the child components throw an error during rendering, the error boundary will catch it.

It's worth noting that error boundaries won't catch errors inside event handlers.

I won't go into how to create an error boundary component here since there's a great example [in the docs](https://reactjs.org/docs/error-boundaries.html).

One challenge I faced was testing the component that throws the error in the first place.

## Testing a thrown error on render

We can test an error that's thrown during the initial render:

```jsx
const Foo: FC = () => {
	throw new Error('Oh no');
};
```

Like so:

```jsx
test('component should throw', () => {
    expect(() => render(<Foo />)).toThrow();
});
```

The test will pass but there will be some noise in the output:

```
Error: Uncaught [Error: Oh no]
```

So we need to `spyOn` the console error:

```jsx
test('component should throw', () => {
    vi.spyOn(console, 'error').mockImplementation(() => null);

    expect(() => render(<Foo />)).toThrow();
});
```

Our test should then pass.

## Testing an asynchronously thrown error

If your component throws an error asynchronously, our approach will differ. For example:

```jsx
const Foo: FC = () => {
	try {
        await fetch('foo-endpoint');
    } catch (error) {
        throw new Error(error.message);
    }
};
```

If we try to test it in the same was as the synchronous example, we'll hit this error:

```
AssertionError: expected [Function] to throw an error
```

This is because the error happens after the initial render. In a browser, this will be caught by our error boundary so that's how we can test it:

```jsx
test('async component should throw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => null);

    render(
        <ErrorBoundary
            ErrorComponent={<div>Error Boundary</div>}
        >
            <Foo />
        </ErrorBoundary>
    );

    await waitFor(() => {
        expect(screen.getByText('Error Boundary')).toBeVisible();
    });
});
```

In this example, we still need to spyOn the console because the test will pass, but we'll run into the same issue as the synchronous example. We then wrap our component in an error boundary with a mocked component. We then use `react-testing-library`s [waitFor](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor) to wait for the async method to throw and update the component.