---
layout: post
title:  "Working with the Payment Request API"
date:   2018-07-29 09:28:59
categories: ['payment-request-api', 'javascript']
excerpt: "One of things that irks me about the usability of shopping online is the inconsistent checkout experience between different merchants. Do I really need to enter the same delivery/billing address, card number, CVC code etc. into every websites specific form? Enter the Payment Request API."
---

One of things that irks me about the usability of shopping online is the inconsistent checkout experience between different merchants. Do I really need to enter the same delivery/billing address, card number, CVC code etc. into every websites specific form? Sure, browsers have an autofill feature to help but forms themselves can be structured differently and I find myself having to correct these details a lot of the time. Plus if I have to go through this experience on my mobile device it can be even more frustrating due to slow connections and poor responsive UX.

## What is the Payment Request API?

The Payment Request API is a ['W3C Candidate Recommendation'](https://www.w3.org/TR/payment-request/) for a consistent checkout experience by standardising the checkout proceedure. It's there to act as an intermediary between users, sellers and payment methods. It works cross browser and replaces the traditional checkout model by allowing merchants to accept payments with a single API call. It also has a consistent UI. Basically, it makes the checkout proceedure much easier.

Here's how the modal looks in Chrome:

![Payment Request Modal](/assets/img/blog/payment-request-api-example.jpg)

## Using the Payment Request API

[It's supported in Chrome, Safari and Edge](https://caniuse.com/#feat=payment-request) but annoyingly is not on by default in Firefox (even though it's supported). Therefore we'll need to check if the browser supports it which can easily be done:

```js
if (window.PaymentRequest) {

} else {
	// Fallback code here
}
```

Inside this conditional, let's set a few variables. Firstly, we will accept both debit and credit cards:

```js
const supportedPaymentMethods = [{
    supportedMethods: ['basic-card']
}]
```

Now let's some dummy checkout details:

```js
const checkoutDetails = {
    total: {
        label: 'Total',
        amount: {
            currency: 'GBP',
            value: 100
        }
    },
	displayItems: [
	    {
	        label: 'T-shirt',
	        amount: {
	            currency: 'GBP',
	            value: 90
	        }
	    },
	    {
	        label: 'Postage',
	        amount: {
	            currency: 'GBP',
	            value: 10
	        }
	    }
	]
}
```

We can also require some information from the user:

```js
const options = {
	requestPayerName: true,
	requestPayerEmail: true
}
```

Finally, let's bind these to the `PaymentRequest`:

```js
let pay = new PaymentRequest(
    supportedPaymentMethods,
    checkoutDetails,
    options
)
```

Now we need to set up a function to handle the request to use the PaymentRequest API:

```js
makePayment() {
	if (this.pay.canMakePayment()) {
		this.pay.show().then((paymentResponse) => {
			sendPayment(paymentResponse)
		}).catch((err) => {
			console.log('ERROR', err)
		})
	} else {
		throw new Error('Sorry, we cannot make the payment right now.')
	}
}
```

Firstly we check to see if the browser can make the payment, if not we'll throw an error (feel free to handle this gracefully). If it can we'll initiate the browser's payment modal and bind a promise to it. If all was successful we'll call a method to send our payment.

```js
sendPayment(paymentResponse) {
	console.log(paymentResponse);
}
```

It's at this juncture you'd hand over the payment data to whichever payment processor you like. For example, [here's how Stripe accepts this response](https://stripe.com/docs/payment-request-api).

Now all we need to do is bind this functionality to something which, for the purposes of this demonstration, will be on the click of a button:

```html
<button class="js-pay">Pay For Something</button>
```

Let's create a method to call in the aforementioned conditional:

```js
setPayment() {
	document.querySelector('.js-pay').onclick = (e) => {
		e.preventDefault()
		makePayment()
	}
}
```

And now let's call this method after we've assigned the `PaymentRequest` to a variable:

```js
setPayment();
```

## Conclusion

You can find all of the [code from this demo on my Codepen](https://codepen.io/chrisboakes/pen/ajBzbb). This is a very basic implementation. You can [read more about the proposed spec here](https://www.w3.org/TR/payment-request/) and there's a comprehensive Google deepdive which you can [read here](https://developers.google.com/web/fundamentals/payments/deep-dive-into-payment-request).
