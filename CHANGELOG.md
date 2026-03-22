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