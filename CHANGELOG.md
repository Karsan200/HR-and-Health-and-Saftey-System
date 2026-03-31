## [V0.2.0] - 2026-03-31

### Added
- V0.2.0 flyway database migration (V3) to account for changes in this version

### Fixed
- (QoL) Issue with padding on the login screen for the mobile app where there is no bottom padding
- (QoL) Issue with padding on the pin code screen for the mobile app where there is no bottom padding, removed the profile icon to make it so you do not need to scroll to get to the keypad for smaller phones

## [V0.1.3] - 2026-03-22

### Changed
- New API method for summary boxes, endpoint is /api/leave/summary
- Updated backend logic for calendar to handle timed leave, not just full day leave

### Fixed
- Date detail now reflects hours of leave
- Bug which didn't display last day of leave correctly has been fixed

## [V0.1.2] - 2026-03-19

### Fixed
- Removed -SNAPSHOT suffix from version number for production release, and changed port so that the Jenkins pipeline can locate the built jar file.

## [V0.1.1] - 2026-03-19

### Added
- Flyway database migration support for production schema management
- Initial schema migration (V1)
- Initial admin user migration (V2)

### Changed
- Set Hibernate DDL auto to `none` to allow Flyway to manage schema
- Fixed Cloudflare Pages deployment pipeline to correctly build and deploy the React web frontend
- Improved Android build pipeline caching and Gradle performance flags to reduce build times