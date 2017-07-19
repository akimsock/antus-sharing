# Antus

Antus est une application Client pour *****

## Version

```bash
 V0.1.0
```

## Prerequisites
Make sure you have installed all of the following prerequisites on your development machine:
* Git - [Download & Install Git](https://git-scm.com/downloads). OSX and Linux machines typically have this already installed.
* Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
* MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port (27017).
* Bower - You're going to use the [Bower Package Manager](http://bower.io/) to manage your front-end packages. Make sure you've installed Node.js and npm first, then install bower globally using npm:

```bash
$ npm install -g bower
```


### Cloning The GitHub Repository
The recommended way to get Antus is to use git to directly clone the Antus repository:

```bash
$ git clone git@github.com:akimsock/antus-sharing.git
```

### Downloading The Repository Zip File
Another way to get and use the Antus is to download a zip copy from the [master branch on GitHub](https://codeload.github.com/akimsock/antus-sharing/zip/master).
You can also do this using the `wget` command:

```bash
$ wget https://codeload.github.com/akimsock/antus-sharing/zip/master
```


## Quick Install
Once you've downloaded the boilerplate and installed all the prerequisites, you're just a few steps away from starting to develop your ANTUS application.


To install the dependencies, run this in the application folder from the command-line:

```bash
$ npm install
```


## Running Your Application

Run your application using npm:

```bash
$ npm start
```

Your application should run on port 3000 with the *development* environment configuration, so in your browser just go to [http://localhost:3000](http://localhost:3000)

That's it! Your application should be running. To proceed with your development, check the other sections in this documentation.
If you encounter any problems, try the Troubleshooting section.

Explore `config/env/development.js` for development environment configuration options.

### Running in Production mode
To run your application with *production* environment configuration:

```bash
$ npm run start:prod
```

Explore `config/env/production.js` for production environment configuration options.

## Testing Your Application
You can run the full test suite included with MEAN.JS with the test task:

```bash
$ npm test
```
This will run both the server-side tests (located in the `app/tests/` directory) and the client-side tests (located in the `public/modules/*/tests/`).

To execute only the server tests, run the test:server task:

```bash
$ npm run test:server
```

To execute only the server tests and run again only changed tests, run the test:server:watch task:

```bash
$ npm run test:server:watch
```

And to run only the client tests, run the test:client task:

```bash
$ npm run test:client
```

## Running your application with Gulp

The Antus project integrates Gulp as build tools and task automation.

We have wrapped Gulp tasks with npm scripts so that regardless of the build tool running the project is transparent to you.

To use Gulp directly, you need to first install it globally:

```bash
$ npm install gulp -g
```

Then start the development environment with:

```bash
$ gulp
```

To run your application with *production* environment configuration, execute gulp as follows:

```bash
$ gulp prod
```

It is also possible to run any Gulp tasks using npm's run command and therefore use locally installed version of gulp, for example: `npm run gulp eslint`


## License
[The MIT License](LICENSE.md)
