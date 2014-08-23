# Contributing
Contributing is a four-step process:

1. Install the vvv generator for development
2. Log development tasks as Github issues
3. Write code
4. Pull request

## Installing for Development
The easiest way to install the vvv generator is via npm, as described in getting started. For reference,
that command is `npm install generator-vvv`.

To contribute though, we'll need a fork and clone of the generator in a place we can develop with it.
This is a three step process:

1. Create a fork of [https://github.com/lkwdwrd/generator-vvv](lkwdwrd/generator-vvv)
2. Clone that fork anywhere on your local machine
3. `cd` into the cloned directory and run `npm link`

The `npm link` command will symlink the cloned directory to global npm modules to make it available for yo.

At this point, you may use your favorite text editor, create branches (and switch between them), and so
on. Running `yo vvv` and its sub-generators will run your forked copy on your current branch.

## Issue Tracking
Issue tracking is via [https://github.com/lkwdwrd/generator-vvv/issues](github)

All contributed code (all pull requests) should have an accompanying issue.

At this point, as we are working toward our initial milestones, not every commit
will have an associated issue. Those with direct commit access can directly commit.

## Write Code
There aren't a great many guidelines here. There is an .editorconfig file that should help enforce
 code style. In addition, keep in mind that there are a few different toolsets in play: Yo and grunt (and
 therefore node), bash (shell), Varying Vagrant Vagrants, and wp-cli.

 We should strive to respect the way all of those toolsets operate by using functions and helpers
 for each toolset when available.

## Pull Request
Use the Github pull request interface to request a merge against the master branch.
