# Contributing
Contributing is a four-step process:

1. Install the vvv generator for development
2. Log development tasks as Github issues
3. Write code
4. Pull request

## Installing for Development
The easiest way to install the vvv generator is via npm, as described in getting started. For reference, that command is `npm install generator-vvv`.

To contribute, however, you will need to fork and clone the generator instead.

1. Use the github interface at [https://github.com/lkwdwrd/generator-vvv](lkwdwrd/generator-vvv) to create a fork of this project to your own github account.
2. Clone that fork anywhere on your local machine
3. `cd` into the cloned directory and run `npm link`

The `npm link` command will symlink the cloned directory to global npm modules to make it available for yo. Do you you should have a global install of yo and grunt as well (`npm install -g yo grunt`).

At this point, you may use your favorite text editor, create branches, and so
on. Running `yo vvv` and its sub-generators will run your forked copy on your current branch.

## Issue Tracking
Issue tracking is via [https://github.com/lkwdwrd/generator-vvv/issues](github)

All contributed code (all pull requests) should have an accompanying issue.

At this point, as we are working toward our initial milestones, not every commit
will have an associated issue. Those with direct commit access can directly commit.

## Write Code
There aren't a great many guidelines here. There is an .editorconfig file that should help enforce code style. In addition, keep in mind that there are a few different toolsets in play: [Yeoman](http://yeoman.io/) and [grunt](http://gruntjs.com/) (and therefore [node](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/)), bash (shell, running inside the VM, so yes, even on Windows), [Varying Vagrant Vagrants](https://github.com/Varying-Vagrant-Vagrants/VVV), [Composer](https://getcomposer.org/), and [WP-CLI](http://wp-cli.org/).

We should strive to respect the way all of those toolsets operate by using functions and helpers for each toolset when available.

## Pull Request
Use the Github pull request interface to request a merge against the master branch. As features get added and stabilized, releases will be released to NPM. [SemVer](http://semver.org/) will be respected to the best of our ability as far as releases are concerned.
