[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/thoughtworks/build-your-own-radar?sort=semver)](https://github.com/thoughtworks/build-your-own-radar/releases/latest)
[![Thoughtworks](https://circleci.com/gh/thoughtworks/build-your-own-radar.svg?style=shield)](https://circleci.com/gh/thoughtworks/build-your-own-radar)
[![Stars](https://badgen.net/github/stars/thoughtworks/build-your-own-radar)](https://github.com/thoughtworks/build-your-own-radar)
[![Docker Hub Pulls](https://img.shields.io/docker/pulls/wwwthoughtworks/build-your-own-radar.svg)](https://hub.docker.com/r/wwwthoughtworks/build-your-own-radar)
[![GitHub contributors](https://badgen.net/github/contributors/thoughtworks/build-your-own-radar?color=cyan)](https://github.com/thoughtworks/build-your-own-radar/graphs/contributors)
[![Prettier-Standard Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/sheerun/prettier-standard)
[![AGPL License](https://badgen.net/github/license/thoughtworks/build-your-own-radar)](https://github.com/thoughtworks/build-your-own-radar)

> **🎉 This is now a STATIC FRONTEND-ONLY application!** No backend server required.  
> Data is loaded directly by the frontend using public URLs. See [STATIC_FE_MIGRATION.md](STATIC_FE_MIGRATION.md) for details.

A library that generates an interactive radar, inspired by [thoughtworks.com/radar](http://thoughtworks.com/radar).

## Demo

You can see this in action at https://radar.thoughtworks.com. If you plug in [this data](https://docs.google.com/spreadsheets/d/1GBX3-jzlGkiKpYHF9RvVtu6GxSrco5OYTBv9YsOTXVg/edit#gid=0) you'll see [this visualization](https://radar.thoughtworks.com/?sheetId=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1GBX3-jzlGkiKpYHF9RvVtu6GxSrco5OYTBv9YsOTXVg%2Fedit%23gid%3D0).

## How To Use

The easiest way to use the app out of the box is to provide a _public_ Google Sheet ID from which all the data will be fetched. You can enter that ID into the input field and your radar will be generated once you click the submit button. The data must conform to the format below for the radar to be generated correctly.

### Setting up your data

You need to make your data public in a form we can digest.

Create a Google Sheet. Give it at least the below column headers, and put in the content that you want:

| name          | ring   | quadrant               | isNew | description                                             |
| ------------- | ------ | ---------------------- | ----- | ------------------------------------------------------- |
| Composer      | adopt  | tools                  | TRUE  | Although the idea of dependency management ...          |
| Canary builds | trial  | techniques             | FALSE | Many projects have external code dependencies ...       |
| Apache Kylin  | assess | platforms              | TRUE  | Apache Kylin is an open source analytics solution ...   |
| JSF           | hold   | languages & frameworks | FALSE | We continue to see teams run into trouble using JSF ... |

### Want to show blip movement information?

If you want to show movement of blips, add the optional column `status` to your dataset.

This column accepts the following case-insensitive values :

- `New` - appearing on the radar for the first time
- `Moved In` - moving towards the center of the radar
- `Moved Out` - moving towards the edge of the radar
- `No Change` - no change in position

### Sharing the sheet

- In Google Sheets, click on "Share".
- On the pop-up that appears, set the General Access as "Anyone with the link" and add "Viewer" permission.
- Use the URL link of the sheet.

The URL will be similar to [https://docs.google.com/spreadsheets/d/1waDG0_W3-yNiAaUfxcZhTKvl7AUCgXwQw8mdPjCz86U/edit](https://docs.google.com/spreadsheets/d/1waDG0_W3-yNiAaUfxcZhTKvl7AUCgXwQw8mdPjCz86U/edit). In theory we are only interested in the part between '/d/' and '/edit' but you can use the whole URL if you want.

### Private Google Sheet support

Private Google Sheets are not supported in the current public-only flow.

Use a sheet with **Anyone with the link** + **Viewer** permission.

### Building the radar

Paste the URL in the input field on the home page.

That's it!

**_Note:_** When using the BYOR app on [radar.thoughtworks.com](https://radar.thoughtworks.com), the ring and quadrant names should be among the values mentioned in the [example above](#setting-up-your-data). This holds good for Google Sheet inputs.
For a self hosted BYOR app, there is no such condition on the names. Instructions to specify custom names are in the [next section](#more-complex-usage).

Check [this page](https://www.thoughtworks.com/radar/byor) for step by step guidance.

### More complex usage

To create the data representation, you can use the Google Sheet [factory](/src/util/factory.js) methods.

The app fetches public Google Sheets via XLSX export URL and parses data on the frontend. The input data is sanitized by whitelisting HTML tags with [sanitize-html](https://github.com/punkave/sanitize-html).

The application uses [webpack](https://webpack.github.io/) to package dependencies and minify all .js and .scss files.

Google OAuth credentials are not required for the current public-only Google Sheets flow.

To enable Google Tag Manager, add the following environment variable.

```
export GTM_ID=[GTM ID]
```

To enable Adobe Launch, add the following environment variable.

```
export ADOBE_LAUNCH_SCRIPT_URL=[Adobe Launch URL]
```

To specify custom ring and/or quadrant names, add the following environment variables with the desired values.

```
export RINGS='["Adopt", "Trial", "Assess", "Hold"]'
export QUADRANTS='["Techniques", "Platforms", "Tools", "Languages & Frameworks"]'
```

## Docker Image

We have released BYOR as a docker image for our users. The image is available in our [DockerHub Repo](https://hub.docker.com/r/wwwthoughtworks/build-your-own-radar/). To pull and run the image, run the following commands.

```
$ docker pull wwwthoughtworks/build-your-own-radar
$ docker run --rm -p 8080:80 wwwthoughtworks/build-your-own-radar:latest
$ open http://localhost:8080
```

**_Notes:_**

- The other environment variables mentioned in the previous section can be used with `docker run` as well.
- Docker images for all the [releases](https://github.com/thoughtworks/build-your-own-radar/releases) are available with their respective tags (eg: `wwwthoughtworks/build-your-own-radar:v1.0.0`).

**_Notes:_**

- For setting the `publicPath` in the webpack config while using this image, the path can be passed as an environment variable called `ASSET_PATH`.

## Contribute

All tasks are defined in `package.json`.

Pull requests are welcome; please write tests whenever possible.
Make sure you have nodejs installed. You can run `nvm use` to use the version used by this repo.

- `git clone git@github.com:thoughtworks/build-your-own-radar.git`
- `npm install`
- `npm run quality` - to run the linter and the unit tests
- `npm run dev` - to run application in localhost:8080. This will watch the .js and .css files and rebuild on file changes

## End to End Tests

To run End to End tests, start the dev server and follow the required steps below:

- To run in headless mode:

  - add a new environment variable `TEST_URL` and set it to 'http://localhost:8080'
  - `npm run test:e2e-headless`

- To run in debug mode:
  - add a new environment variable `TEST_URL` and set it to 'http://localhost:8080'
  - `npm run e2e`
  - Select 'E2E Testing' and choose the browser
  - Click on the spec to run it's tests

**_Notes:_**

- End to end tests should use publicly accessible Google Sheets inputs.
- `CLIENT_ID` and `API_KEY` are not required for the current Google Sheets flow.

### Don't want to install node? Run with one line docker

     $ docker run -p 8080:8080 -v $PWD:/app -w /app -it node:18 /bin/sh -c 'npm install && npm run dev'

After building it will start on `localhost:8080`.
