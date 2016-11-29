# gulp-saucelabs
[![Build Status](https://travis-ci.org/bytbil/gulp-saucelabs.svg)](https://travis-ci.org/bytbil/gulp-saucelabs)

Gulp plugin for running tests using SauceLabs automated tests feature to run on several different browsers

## Install

```
npm install --save-dev gulp-saucelabs
```


## Usage
### Simple Usage
```javascript
var saucelabs = require('gulp-saucelabs');
gulp.task('saucelabs', saucelabs(config));
```

## Options
Example:
```javascript
var config = {
    username: 'foo-bar',
    key: 'xxxx-xxxx-xxxx-xxxx-xxxx',
    urls: ['http://localhost:3000/tests/index.html'],
    testname: 'My test',
    framework: 'qunit',
    browsers: [
        {
            browserName: "MicrosoftEdge",
            platform: "Windows 10",
            version: "latest"
        },
        {
            browserName: "internet explorer",
            version: "11",
            platform: "Windows 8.1"
        },
        {
            browserName: "internet explorer",
            version: "10",
            platform: "Windows 8"
        }
    ],
    onTestSuiteComplete: function(status) {
        if (status) {
            console.log('All tests passed!');
        }
    }
    ...
}
```

#### `username`
Username to SauceLabs. If not provided, uses the value of SAUCE_USERNAME environment variable. _Optional_

#### `key`
Accesskey for SauceLabs. If not provided, uses the value of SAUCE_ACCESS_KEY environment variable. _Optional_

#### `build`
The build number for this test. _Optional_

#### `urls`
An array or URLs that will be loaded in the browsers, one after another. _Required_

#### `framework`
Which framework to test. Options: `qunit`, `jasmine`, `mocha`, `yui`, `custom`. _Required_

#### `testname`
name of the test, displayed on the SauceLabs dashboard. _Optional_

#### `tags`
An array of strings, to be added as tags to the test on Sauce Labs. _Optional_

#### `tunneled`
Defaults to true; Won't launch a Sauce Connect tunnel if set to false. _Optional_

#### `tunnelArgs`
Array of optional arguments to be passed to the Sauce Connect tunnel. example: `['--debug', '--direct-domains', 'google.com']`. See [here](https://saucelabs.com/docs/connect) for further documentation.

#### `sauceConfig`
Map of extra parameters to be passed to sauce labs. example: `{'video-upload-on-pass': false, 'idle-timeout': 60}`. See [here](https://saucelabs.com/docs/additional-config) for further documentation.

#### `pollInterval`
Number of milliseconds between each retry to see if a test is completed or not (default: 2000). _Optional_

#### `statusCheckAttempts`
Number of times to attempt to see if a test is completed or not (default: 90).  Effectively, your tests have `statusCheckAttempts * pollInterval` seconds to complete (Thus, 180s by default).  Set to `-1` to try forever. _Optional_

#### `throttled`
Maximum number of unit test pages which will be sent to Sauce Labs concurrently.  Exceeding your SauceLabs' allowed concurrency can lead to test failures if you have a lot of unit test pages. _Optional_

#### `maxDuration`
Maximum duration of a test, this is actually a Selenium Capability. SauceLabs defaults to 180 seconds for js unit tests. _Optional_

#### `browsers`
An array of objects representing the [various browsers](https://saucelabs.com/platforms) on which this test should run. _Optional_

#### `onTestComplete`
A callback that is called every time a unit test for a page is complete. Runs per page, per browser configuration. Receives two arguments `(result, callback)`. `result` is the javascript object exposed to SauceLabs as the results of the test. `callback` must be called, node-style (having arguments `err`, `result` where result is a true/false boolean which sets the test result reported to the command line). _Optional_

#### `onTestSuiteComplete`
A callback that is called when all tests have run and the tunnel has been closed down. The callback receives one argument (boolean) which is true if all tests passed, otherwise false.

#### `maxRetries`
Specifies how many times the timed out tests should be retried (default: 0). _Optional_

#### `public`
The [job visibility level](https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options#TestConfigurationOptions-JobVisibility). Defaults to 'team'. _Optional_


Contribution
---------
Forked from https://github.com/axemclion/grunt-saucelabs

Changelog
---------
####0.1.0####
