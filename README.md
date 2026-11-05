
# Light Blue Dashboard - free and open source admin dashboard template
The [Light Blue Dashboard](https://flatlogic.com/admin-dashboards/light-blue-html5/demo), a free and open-source admin dashboard template, features an awesome transparent design and responsive layout built with Bootstrap. This repository offers a sneak peek through a limited free version of Light Blue, with [full bootstrap 4](https://flatlogic.com/admin-dashboards/light-blue-html5/demo),     [React](https://flatlogic.com/admin-dashboards/light-blue-react/demo), and [Angular](https://flatlogic.com/admin-dashboards/light-blue-angular/demo) versions accessible via our website, providing versatile development options for creating intuitive and visually appealing [business software](https://flatlogic.com/) interfaces.

[View Demo](https://flatlogic.github.io/light-blue-dashboard/) | [Download](https://github.com/flatlogic/light-blue-dashboard/archive/master.zip) | [Full version](https://flatlogic.com/admin-dashboards/light-blue-html5) | [More templates](https://flatlogic.com/admin-dashboards) | [Support forum](https://flatlogic.com/forum)



[![header_illustration_fb](https://user-images.githubusercontent.com/24964748/47848527-a75aee80-dddf-11e8-82ae-b5472e20df7f.png)](https://flatlogic.github.io/light-blue-dashboard/)

## Features

Using this template you will be able to leverage lots of built-in components and thus focus on building features that set you apart from competitors rather than bulding everything from scratch. Lite version of a Light Blue Dashboard includes following features and pages:
* Bootstrap & SCSS
* Unique transparent design
* Responsive layout
* Styled Bootstrap components like buttons, modals, etc
* Dashboard sample
* Typography
* Tables
* Notifications
* Base charts
* Icons
* Maps

All other features like themining, login, additional pages, etc are available in [full version](https://flatlogic.com/admin-dashboards/light-blue-html5/demo).

[![full-version](https://user-images.githubusercontent.com/24964748/47848874-c4dc8800-dde0-11e8-93e7-a78c1e098207.png)](https://flatlogic.com/admin-dashboards/light-blue-html5/demo)

## Quick Start

#### 1. Get the latest version

You can start by cloning the latest version of Light Blue Dashboard on your local machine by running:

```shell
$ git clone -o light-blue-dashboard -b master --single-branch \
      https://github.com/flatlogic/light-blue-dashboard.git MyApp
$ cd MyApp
```

#### 2. Install dependencies with Node 22.23 or newer

```sh
npm ci
npm run install:client
```

The npm lock is canonical for build tools. The pinned Bower manifest retains the
browser libraries and their existing public asset paths. The retired Grunt,
node-sass and grunt-handlebars-layouts dependency trees are replaced by Gulp 5,
Dart Sass and Handlebars 4 with the maintained layout helper.

#### 3. Build and serve

```sh
npm run build              # expanded development CSS and unminified app scripts
npm run build:production   # compressed CSS and minified app scripts
npm start                  # development build/server, no automatic browser window
npm run watch              # rebuild on source changes
```

Open `http://127.0.0.1:43195` when serving. Both build modes preserve layout
blocks, `conditionClass` active/inverse behaviour, legacy `CSS:` imports, fonts,
images, and the same page URLs. The legacy `dist-*` task names are available
through local Gulp instead of a global Grunt installation.

#### 4. Verify changes

```sh
npm run build:production
npm test
npm run test:e2e
npm audit
```

The artifact tests check helper/importer contracts, every generated page and
local script/style URL, CSS asset resolution, binary byte preservation, and
backport idempotence/input validation.
Browser tests use installed Chrome; they check seven pages, chart canvases and
real PJAX transitions, settings controls, and both Bootstrap vulnerability
payloads. Google Maps requires the existing external API key/service
and is documented separately from the local smoke checks.

Only static legacy Select2/DataTables images are retained under `src/vendor` to
satisfy existing stylesheet URL contracts. Their licenses, upstream versions and
SHA256 hashes are recorded alongside them. No old JavaScript or dependency
metadata is moved into that directory. The former unavailable HTTP Sparkline URL
is replaced by the pinned official npm archive, preserving its `lib/.../index.js`
URL through the build.

Npm audit covers the build tree, while Bower browser versions require a separate
advisory check. In particular Underscore is pinned to 1.13.8, which fixes
[the recursion DoS advisory](https://github.com/advisories/GHSA-qpx9-hpmf-5gmw).

## Integration & Customization
[![integration sample](https://user-images.githubusercontent.com/24964748/47849384-7334fd00-dde2-11e8-8329-dc4b9d8927d0.png)](https://flatlogic.com/services/admin-template-integration)

Light Blue Dashboard is a part of [admin dashboard solution](https://flatlogic.com/services/admin-template-integration) provided by Flatlogic. We can integrate admin dashboards with such systems as your accounting software, customer relationship management (CRM) system, email management, marketing automation, website analytics program, etc. With this dashboard, the owner of the website (platform) can easily track orders and their success rate, track social metrics such as the most popular referring social media sites and their appropriate URLs, monitor sales states and periods of growth to better understand what makes users tick. [Contact us](https://flatlogic.com/contact) to learn more.

## Support
For any additional information please go to our [**support forum**](https://flatlogic.com/forum) and raise your questions or feedback provide there. We highly appreciate your participation!

## How can I support developers?
- Star our GitHub repo :star:
- [Tweet about it](https://twitter.com/intent/tweet?text=Amazing%20dashboard%20built%20with%20NodeJS,%20React%20and%20Bootstrap!&url=https://github.com/flatlogic/sing-app&via=flatlogic).
- Create pull requests, submit bugs, suggest new features or documentation updates :wrench:
- Follow [@flatlogic on Twitter](https://twitter.com/flatlogic).
- Subscribe to Flatlogic newsletter at [flatlogic.com](https://flatlogic.com/)
- Like our page on [Facebook](https://www.facebook.com/flatlogic/) :thumbsup:

## Premium themes
Looking for premium themes and templates? Check out our other template at [flatlogic.com](https://flatlogic.com/admin-dashboards).

## License

Light Blue Dashboard is [MIT](https://github.com/flatlogic/light-blue-dashboard/blob/master/LICENSE.txt)-licensed.

Bootstrap 3 is end of life. The `bootstrap-sass` 3.4.3 wrapper embeds Bootstrap
3.4.1, so installation and builds apply the official Debian backports for
[the tooltip/popover advisory](https://github.com/advisories/GHSA-q58r-hwc8-rm9j)
and [the data-loading-text advisory](https://github.com/advisories/GHSA-vxmc-5x29-h64v).
Exact source and patch checksums, provenance, and the fail-fast apply step are
recorded in [build/bootstrap-patches](build/bootstrap-patches/README.md). Both raw
and minified bundles are patched. These local fixes do not change upstream
version metadata or make Bootstrap 3 supported; future advisories still require
review. No advisory is dismissed or hidden.

The tracked `docs/` demo is regenerated from the production build. Its library
scripts are limited to those referenced by the rendered pages; obsolete vendor
test runners and unused library copies are removed. Images, licenses, public
URLs, page content and application features are retained.
