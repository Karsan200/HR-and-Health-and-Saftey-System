## [V0.4.0] - 2026-04-20

### Added
- Implemented logout for the desktop admin panel and mobile app, which invalidates the user's refresh token and clears the authentication cookie
- Improved MFA setup flow, it now stores the secret key in a secure cookie for 10 minutes in case the user needs to refresh the page during setup
- Ability to view clock ins and clock outs for employees in the desktop admin panel, with filtering options
- Functionality to override/add clock ins and clock outs for employees in the desktop admin panel, which updates the attendance records accordingly
- Document distribution system on the desktop admin panel, allowing admins to upload documents and assign them to specific employees or the whole company, with support for policies, SOPs, handbooks and payslips
- Functionality to add employees on the desktop admin panel
- Settings to set silent hours for notifications for admins on the desktop admin panel
- Notification page on the desktop admin panel to demonstrate recent activity such as leave requests
- Functionality to view and manage risk assessment and hazard report on the desktop admin panel
- Ability to review signatures for documents sent out on the desktop admin panel
- BLE advertisement on the mobile app to allow the app to broadcast a BLE advertisement with a specific UUID for the user so it is detectable by the Raspberry Pi Pico firmware
- Full implementation of the BLE firmware for the Raspberry Pi Pico to detect BLE advertisements and record and upload data to the backend
- Backend implementation for the BLE firmware, including API endpoints to receive data from the firmware and store it in the database
- Backend implementation for a background task that runs through clock in events and uses it to update or create new attendance records for employees
- Banner to clock in page on the mobile app which features the user's earliest clock in event for that day
- V0.4.0 flyway database migration (V6) to account for changes in this version

### Fixed
- Issue where themes were not being applied correctly in the backend if less than 3 custom theme colours were selected in the mobile app
- Issue where specific leave times did not show for leave details on the desktop calendar
- Various QoL improvements to the mobile app

## [V0.3.1] - 2026-04-13

### Added
- Added logging for all API endpoints to log any internal server errors that occur with a stack trace
- V0.3.1 flyway database migration (V5) to account for changes in this version

### Fixed
- Fixed bug where requires signature column was not in the documents or hazards table causing a 500 error in production

## [V0.3.0] - 2026-04-09

### Added
- Dashboard and Navbar for the web app
- Web app profile page so admins can view and edit their details
- Mobile app personal page — view hazard reports, signed policies, and SOPs
- Mobile app documents page — view all available documentation, pending and signed
- Mobile app payslip page — view all payslips, with document download support
- Mobile app handbook page — view the current company handbook
- Manager holiday/events calendar to view all employee leave and events, with filtering options on the web app
- Ability to view and manage all users in the system, with filtering options on the web app
- V0.3.0 flyway database migration (V4) to account for changes in this version

### Fixed
- Various QoL improvements to the mobile app

## [V0.2.0] - 2026-03-31

### Added
- Ability to book leave for specific hours of a day or full days in the mobile app
- Accessibility settings in the mobile app to allow users to use large text, dyslexia friendly font and highlighted text
- Authentication flow for the desktop admin panel, enforcing username/password and MFA. Provides options to setup MFA if it's the first time using the panel, and checks if the user's screen size is too small for the app
- Scan functionality for the firmware Raspberry Pi pico to check for BLE advertisements and check for UUIDs
- V0.2.0 flyway database migration (V3) to account for changes in this version
- App icon for mobile app of the Rent-A-Tech logo

### Fixed
- Issue where all default colour presents were highlighted by default in the mobile app
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