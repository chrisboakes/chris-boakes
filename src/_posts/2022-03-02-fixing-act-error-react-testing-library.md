---
layout: post
title:  "Fixing React Testing Library 'test was not wrapped in act' warning"
description: "How to fix the 'test was not wrapped in act' warning from React Testing Library'"
date:   2022-03-02 13:00:00
url: "/fixing-test-was-not-wrapped-in-act-react-testing-library"
categories: ['unit-testing', 'javascript', 'vitest', 'react-testing-library']
excerpt: "When writing tests with React Testing Library, developers often run into the 'React state updates should be wrapped into act' warning."
---

When writing tests with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), developers often run into the following warning:

```sh
Warning: An update to *** inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser.
```

In this article, we will look at some common approaches to solve this issue.

## Why not just wrap the test in "act"?

Let's consider the following example:

```js
it('throws an act warning', async () => {
    render(<ActWarning />);

    userEvent.click(screen.getByRole('button', {
        name: 'Copy',
    });

    expect(clipboardWriteMock).toHaveBeenCalledWith('foo bar');
});
```

Given the warning, you may try wrapping the action which triggers a state change in `act`:

```js
act(() => {
    userEvent.click(screen.getByRole('button', {
        name: 'Copy',
    });
});
```

However, React Testing Library already has async utilities that automatically wrap these events in `act`.

## Wait before asserting

The most common and easiest way to fix this is to simply ensure that we wait for the assertion when there is an async call. Using the example above:

```js
it('does not throw an act warning', async () => {
    render(<ActWarning />);

    await userEvent.click(screen.getByRole('button', {
        name: 'Copy',
    }));

    await waitFor(() => {
        expect(clipboardWriteMock).toHaveBeenCalledWith('foo bar');
    });
});
```

In this case, the button click triggers an asynchronous call and state change - we want to wait for this before asserting.

We may use something visual to ensure that the assertion fires at the right time. For example:

```js
it('does not throw an act warning', async () => {
    render(<ActWarning />);

    await userEvent.click(screen.getByRole('button', {
        name: 'Copy',
    }));

    await waitForElementToBeRemoved(screen.getByText('Loading'));

    expect(clipboardWriteMock).toHaveBeenCalledWith('foo bar');
});
```

In this instance, we wait for the UI to change before asserting.

## Fix unnecessary re-renders

While wrapping your assertion or action in a wait might make the warning go away, it's also worth digging into why you're getting it in the first place. Our example above is fine because we're expecting a state change after an asynchronous call, but you might also find your component to be unnecessarily re-rendering. For more information, see [this article](https://medium.com/hootsuite-engineering/react-re-render-optimization-7d369e0bf701).

## Upgrade testing-library dependency

In our codebase, we noticed a lot of act warnings suddenly appear even though we were asserting like above. Simply upgrading from:

```sh
"@testing-library/react": "13.4.0"
```

To:

```sh
"@testing-library/react": "14.0.0"
```

Seemed to fix a bug where React Testing Library was requiring us to wrap the actions (rather than assertions) in waits.

## Conclusion

While there are many reasons why you might encounter this error, hopefully this post gives you some direction. You can find the example [on GitHub here](https://github.com/chrisboakes/react-testing-examples/tree/main/src/act-warning).