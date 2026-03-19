## [0.1.1] - 2026-03-19

### Added
- Flyway database migration support for production schema management
- Initial schema migration (V1)
- Initial admin user migration (V2)

### Changed
- Set Hibernate DDL auto to `none` to allow Flyway to manage schema
- Fixed Cloudflare Pages deployment pipeline to correctly build and deploy the React web frontend
- Improved Android build pipeline caching and Gradle performance flags to reduce build times