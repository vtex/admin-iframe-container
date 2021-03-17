# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.0] - 2021-03-17

### Changed

- `admin-ui` to version `0.84.2`.

## [2.1.0] - 2021-03-08

### Changed

- Remove `admin-proxy` dependency.

### Fixed

- Iframe height increasing on catalog.

## [2.0.0] - 2021-01-19

### Added

- `@vtex/admin-ui` library.
- `@vtex/admin-ui-icons` library.
- `core` components that uses admin-ui.

### Removed

- `vtex.styleguide` in favor of `@vtex/admin-ui`.

### Changed

- Refactor all components to `typescript`.
- Links from `vtexcommerce` to `admin-proxy`.

## [1.1.0] - 2020-11-10

### Added

- `customHeightGap` prop to allow a defining the Iframe's height gap on a flexible fashion.

### Removed

- Unused imports from the `Iframe.js` and `iframeUtils.js` files.
- Rollback v1.0.9

## [1.0.9] - 2019-09-26

### Added

- Prevent to show a black page while iframe is in loading.
- Force reload when lost session.

## [1.0.8] - 2019-08-09

## [1.0.7] - 2019-08-09

### Fixed

- remove unused test devDependencies with vulnerable dependencies.

## [1.0.6] - 2019-07-26

## [1.0.5] - 2019-07-22

### Fixed

- Fixed navigation on admin intregations config screen.

## [1.0.4] - 2019-07-19

### Fixed

- Fixed duplicated browser history entries when navigating with admin sidebar.

## [1.0.3] - 2019-07-17

### Removed

- Remove myuser old admin from the legacy admins whitelist

## [1.0.2] - 2019-07-17

## [1.0.1] - 2019-07-17

### Fixed

- Allow to ignore all legacy path when admin requested.
