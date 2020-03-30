---
layout: post
title:  "Building a REST API from Google Sheets with AWS Lambda and API Gateway"
description: "Tutorial on building a REST API using the Google Developer API, AWS Lambda and AWS Gateway"
date:   2018-09-01 09:28:59
categories: ['serverless', 'node', 'aws', 'lambda', 'api']
excerpt: "I came across a community group who had been managing a Google sheet to detail data about which local businesses are delivering during the Coronavirus crisis. I used this sheet as a backend for an API I built using Lambda and API Gateway."
---

I recently came across a [Facebook group](http://www.brightonquarantine.co.uk/) in Brighton which acts as a community for local businesses who are delivering locally during the Coronavirus crisis. All of the data was aggregated on a [Google Sheet](https://docs.google.com/spreadsheets/d/17xHoC2RrEHs0T_8q6SfMKWwvD-fBxzrU1qL7XVAfa8Y/edit?fbclid=IwAR2tf_wjxyfU90v0-IaCRcbbyswzpX3jJdi48RoLnB-8N0hr5t9aq9U-DXc#gid=0) - massive credit to the moderators for collecting and creating the data. I'd recently been experimenting with [Svelte](https://svelte.dev/) and [Sapper](https://sapper.svelte.dev/) at work and thought I'd spend the weekend building a small microsite using data from the spreadsheet.

This was the result: [brightonquarantine.co.uk](http://www.brightonquarantine.co.uk/)

This article is a guide to build the API used by the front-end of the website.

### Prequisites

- Ensure you have a spreadsheet of data set up with the first row being labels for your columns
- Have an [AWS account](https://aws.amazon.com/account/)

## Integrating the Google API

Let's start by getting the data from Google sheets. For the time being, we're going to get the data outputting in the terminal (we'll do the Lambda integration later).

### Create a new project

Firstly make a new directory, `cd` to it and run:

```sh
npm init
```

Fill out the information as prompted, ignoring anything you don't need to fill out. Then run:

```sh
npm install google-spreadsheet
```

This will fetch the code from [this repository](https://www.npmjs.com/package/google-spreadsheet).

### Authenticate the request

In your browser:

- Head over to the [Google Developers Console](https://console.developers.google.com/) and create a new project
- Now go to **Enable APIs and Services** and enable the **Google Drive API**
- Now navigate to **Create Credentials**:
	- Select **Google Drive API** from *Which API are you using?*
	- Select **Web server** from *Where will you be calling the API from*
	- Select **Application data** from *What data will you be accessing?*
	- Select **No** for the *API with App Engine* question
	- Create some credentials (setting the *Role* as **Editor**)
	- Ensure **JSON** is selected

The above steps should prompt a download of a JSON file. Rename this file to `client_secret.json` and put it in the directory we created above.

Create a new file in this spreadsheet called `index.js` and open this file in your IDE.

Open your `client_secret.json` file and copy the email address (without the quotation marks) next to `client_email`.

Go to the spreadsheet you originally created and share it with this email address.

### Making our first request

Head back over to the browser and fetch the [ID of the spreadsheet](https://stackoverflow.com/questions/36061433/how-to-do-i-locate-a-google-spreadsheet-id) from the URL.

In `index.js` paste the following (including the string of the spreadsheet ID when we instantiate `GoogleSpreadsheet`):

```js
// Get spreadsheet npm package
const { GoogleSpreadsheet } = require('google-spreadsheet');
// Paste the spreadsheet ID
const sheet = new GoogleSpreadsheet();

// Asynchronously get the data
async function getData() {
	// Authenticate using the JSON file we set up earlier
   await sheet.useServiceAccountAuth(require('./client_secret.json'));
   await sheet.loadInfo();
	
	// Get the first tab's data
   const tab = sheet.sheetsByIndex[0];
	
	// Log out the title
   console.log(tab.title);
}

// Call the above method
getData();
```

In your terminal, from the directory you're working in, run:

```sh
node index.js
```

If everything has been set up correctly you should see the title of your sheet's first tab.

### Get row data

We're now going to fetch some row data. Replace the `getData` method with this one:

```js
// Asynchronously get the data
async function getData() {
    // Authenticate using the JSON file we set up earlier
    await sheet.useServiceAccountAuth(require('./client_secret.json'));
    await sheet.loadInfo();

    // Get the first tab's data
    const tab = sheet.sheetsByIndex[0];

    // Get row data
    const rows = await tab.getRows();

    // Empty array for our data
    let data = [];

    // If we have data
    if (rows.length > 0) {
        // Iterate through the array
        // and push the data from the 'Name' column
        // of your spreadsheet
        rows.forEach(row => {
            data.push(row['Name']);
        });
    }
    
    console.log(data);

    // Return the data JSON encoded
    return JSON.stringify(data);
}
```

This should log out all of the data in the 'Name' column of your spreadsheet.

### Clean up data

We'll add one more method to clean up our data. Depending on your column names, you'll need to alter this method to return everything you need from your spreadsheet. Above the `getData` method, add this method in:

```js
// Add the data we want into an object
function cleanData(data) {
	return {
		name: data['Name'],
		phone: data['Phone Number'],
		website: data['Website']
	}
}
```

Inside the `getData` method replace the current `data.push` line to this:

```js
data.push(cleanData(row));
```

Run the script again and you should see an array of objects.

Remove any `console.log` and we're ready to move onto the next step.

## Lambda time

Now that we've got the Google API working let's make our Lambda. Login to your AWS account and follow [these steps](https://docs.aws.amazon.com/lambda/latest/dg/getting-started-create-function.html) to create a test Lambda function.

Once you've run **Test** and it's all working, let's add our code:

- ZIP the directory we've been working in
- In the Lambda project, select **Upload a .zip file** under *Code entry type* and upload the ZIP we just created
- Make sure you move all of the files from this directory into the parent folder

We're going to need to make a few minor modifications to the script to make it compatible with Lambda. Firstly, in the inline editor, delete the call to `getData` and replace it with the following:

```js
exports.handler = async (event) => {

    const data = await getData();
    
    const response = {
        "statusCode": 200,
        "body": data,
        "isBase64Encoded": false
    };

    return response;
}
```

Click **Test** and you should see all of the data logged out.

## API Gateway

Now that our Lambda is working we'll need to set up an API we can call to run it.

Navigate to [API Gateway](https://aws.amazon.com/api-gateway/) and follow the steps listed under **Create a "Hello World" API** [here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-create-api-as-simple-proxy-for-lambda.html). Synching up your Lambda and choosing a meaningful name.

You now should have a URL we can run GET requests on.

## Wrapping up

Now that we have our Lambda synced up to API gateway we're ready to start making requests to it on the front-end of the site.