# Rationale

Working in a WordPress agency has some amazing benefits: the close and constant communication, learning, code review and so forth. It also allows projects to get the benefit of many different, more specialized developers. Perhaps we have someone "hop in" on a project to write some complex JS. Or someone who is an expert with caching can come in and make some tweaks.

This is great until you realize that it can take _hours_ for a developer to collect all the resources necessary to create a development environment: Theme repositories, plugins, databases, and configuration details.

Instead of having to communicate these details and let the developer churn through them, we thought it would be awesome to represent each project using a single json file. A lightweight json file can be easily passed around. Development environment ramp-up is reduced to two steps:

1. Put vvv.json into a folder
2. `cd` into that folder and run `yo vvv:bootstrap`

After step two, the site is running on VVV, including host file mapping, databases, all of it. Hours of developer on-boarding is reduced to minutes. Developers will be able to hop in and out of projects faster than ever. Collaboration becomes effortless.