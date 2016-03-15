# Service Manual Frontend

Service Manual Frontend is a public-facing app to display the majority of documents
on the /government part of GOV.UK. It is a replacement for the public-facing
parts of the [Whitehall](https://github.com/alphagov/whitehall) application.

## Screenshots

![A  Case Study](https://raw.githubusercontent.com/alphagov/service-manual-frontend/master/docs/assets/case-study-screenshot.png)

## Live examples

- [gov.uk/government/case-studies/2013-elections-in-swaziland](https://www.gov.uk/government/case-studies/2013-elections-in-swaziland)
- [gov.uk/government/statistics/announcements/diagnostic-imaging-dataset-for-september-2015](https://www.gov.uk/government/statistics/announcements/diagnostic-imaging-dataset-for-september-2015)

## Technical documentation

This is a Ruby on Rails application that fetches documents from
[content-store](https://github.com/alphagov/content-store) and displays them.

### Dependencies

- [content-store](https://github.com/alphagov/content-store) - provides documents
- [static](https://github.com/alphagov/static) - provides shared GOV.UK assets and templates.

### Running the application

`./startup.sh`

The app should start on http://localhost:3090 or
http://service-manual-frontend.dev.gov.uk on GOV.UK development machines.

### Running the test suite

The test suite relies on the presence of the
[govuk-content-schemas](http://github.com/alphagov/govuk-content-schemas)
repository. If it is present at the same directory level as
the service-manual-frontend repository then run the tests with:

`bundle exec rake`

Or to specify the location explicitly:

`GOVUK_CONTENT_SCHEMAS_PATH=/some/dir/govuk-content-schemas bundle exec rake`

#### Visual regression tests

Use [Wraith](http://bbc-news.github.io/wraith/) ("A responsive screenshot
comparison tool") to generate a visual diff to compare rendering changes in this
application. Wraith has some dependencies you'll [need to install](http://bbc-news.github.io/wraith/os-install.html).

First, on `master` branch, run:
```
wraith history test/wraith/config.yaml
```

Then, on a branch with your changes, run:
```
wraith latest test/wraith/config.yaml
```

This will generate image diffs comparing the two runs, including a browseable
gallery of the output, in `tmp/wraith`.

## Licence

[MIT License](LICENCE)
