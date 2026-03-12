# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.15](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.15)
### Fixed
- Sort credential list by updated date (desc by default)

## [2.1.14](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.14)
- This release does not include any code changes. It was created to republish the Docker image after an issue affecting the image generated for the previous version.

## [2.1.13](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.13)
### Changed
- Update revocation endpoint and change the way the way the Credential Status List URL is obtained to make it compatible with BitstringStatusListEntry.

## [2.1.12](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.12)
### Changed
- Make color of texts in home and credential management pages customizable.

## [2.1.11](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.11)
### Changed
- UI adjustments in home and management page.

## [2.1.10](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.10)
### Changed
- Configure colors relying on a single environment variable, `THEME_NAME`, which determines which CSS bundle is loaded. Each theme encapsulates all its CSS variables in a dedicated bundle. Previously, theming was handled through four separate color environment variables.
- Button colors on the landing page are now configurable and depend on CSS variables defined in the selected theme bundle.

## [2.1.9](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.9)
### Changed
- Configure logo and favicon using the `ASSETS_BASE_URL` environment variable combined with asset-specific paths.


## [2.1.8](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.8)
### Added
- Altia and ISBE favicons.

### Changed
- Rename DOME favicon.

## [2.1.7](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.7)
### Changed
- Changed credential management labels

## [2.1.6](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.6)
### Added
- Allow signature for LEAR Credential Machine.

### Fixed
- Adjust scroll effect in home page so that the login button is clearly visible.
- Fix the texts in the Dashboard table footer.

## [2.1.5](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.5)
### Fixed
- English grammar and clarity fixes in home and credential offer stepper pages.

### Removed
- Outdated text in home page.

## [2.1.4](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.4)
### Changed
- Removed hardcoded "DOME" references.

## [2.1.3](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.3)
### Added
- Added environment variable `sys_admin` to set credential powers "domain" field and display it in issuance form and credential details page.

### Fixed
- Added translations for the country selector.

## [2.1.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.2)
### Added
- Admin organization identifier is now configurable.
- Get and display contact email in credential details page.
- Get and display organization identifier in management page.

### Changed 
- Changed "create-as-signer" route for "create-on-behalf".

### Fixed
- Add missing translations.


## [2.1.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.1)
### Added 
- Set language from browser or using the default from environment.

### Changed 
- Add missing translations.

## [2.1.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.1.0)
### Added 
- Admins can add Certification-upload power to LEARCredentialMachine.

### Changed
- When issuing LEARCredentialMachine as not-signer, set credential_owner_email with the mandatee email of the vc in the access token.
- Change "as Signer" for "(on behalf)" in Management page button.

### Fixed
- Label "engineVersion" in credential details page.

## [2.0.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v2.0.0)
### Added
- Credential revokation.
- Gx-label credentials view.
- LEARCredentialMachine Issuance.

### Fixed
- Fill LEARCredentialMachine Details fields correctly.
- Show "Send reminder" button for LEARCredentialMachine.
- Show spinner while sending LEARCredentialMachine issuance request.
- In LEARCredentialMachine issuance form, don't show missing key alert if key is already generated.
- Adjust credential type selector width so that the type can be read.
- In management page, align buttons.
- When opening credentials search bar, automatically select input box so user can write directly in it.

### Changed
- LEARCredentialEmployee model (mandator, mandatee, power).
- Normalize displayed texts from "LEARCredentialX" to "LEAR Credential X" across UI labels.
- Update api-path-constants endpoints.
- Issuer field can be string or object.

## [1.13.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.13.1)
### Fixed
- Fix error handling for auth errors.
- Don't show test Wallet URL in PRD environment.

## [1.13.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.13.0)
### Added
- Implementation of configure signature.

## [1.12.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.12.2)
### Fixed
- Changed default wallet URLs to ".eu"

## [1.12.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.12.1)
### Fixed
- Fixed error dialog messages for credential offer stepper.


## [1.12.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.12.0)
### Changed
- Adapt details page to 3 credential types (LEARCredentialEmployee, LEARCredentialMachine and VerifiableCertification)
- Add "basic information" in details page (credential type, validity, valid-from, valid-until)
- Change route to create procedure as signer from "create2/admin" to "create-as-signer"

## [1.11.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.11.0)
### Changed
- Refactored and renamed some environment variables
- Renamed some directories and files
- Moved some environment variables to application constants to remove unnecessary complexity
### Added
- Added some minor fixes

## [1.10.3](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.10.3)
### Modify
- Change CREDENTIAL_OFFER_URI env name to CREDENTIAL_OFFER_URL.

## [1.10.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.10.2)
### Fixed
- Fix error to handle email failure.

## [1.10.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.10.1)
### Fixed
- Fix error during credential detail visualization

## [1.10.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.10.0)
### Added
- Added button to sign credential when sync flux fails
### Fixed
- Small fixes

## [1.9.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.9.0)
### Added
- Access by role and policies.

## [1.8.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.8.2)
### Added
- Solution to spelling error.

## [1.8.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.8.1)
### Added
- Display credential issuer information in the credential detail view.

## [1.8.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.8.0)
### Added
- Compatibility with LEARCredential V2

## [1.7.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.7.1)
### Added
- When leaving credential offer stepper (after clicking "Leave" on refresh popup) and being redirected to home, show warning popup.
- Environment variable for knowledge wallet.
### Changed
- In Mandator, remove placeholders
- Restructuring the navbar.
### Fixed
- After logout, if the user tries to access the dashboard again, it redirects them back to the login.

## [1.7.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.7.0)
### Added
- Updating to Angular 18 and dependencies.
- Change in the navbar, with dropdown logout and settings.
- Creation of configuration component and policy verification.

## [1.6.3](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.6.3)
### Fixed
- In credential issuance form, after clicking on remove power icon, don't remove power if user clicks "Cancel"

### Changed
- In credential issuance form, remove back arrow
- In details page, make back arrow bigger
- In credential offer Step 1, center 

## [1.6.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.6.2)
### Fixed
- In credential offer stepper, when clicking refresh button, close popup and don't leave while it's refreshing

## [1.6.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.6.1)
### Added
- Added customized colors for navbar and logo.

## [1.5.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.5.0)
### Added
- Search bar in credentials dashboard
- Success popup after creating credential and after sending reminder
- In credential offer step 2, added popup to refresh offer when it is about to expire. If not refreshed, redirects to the home page.
- In details and credential issuance pages, "Back" button

### Changed
- In credentials dashboard, changed order of columns and added color to status indicators
- Send Reminder button is positioned at the bottom of the details page
- In navbar, organization name appears below the username
- Updated button styles in dashboard, form and stepper

## [1.4.3](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.4.3)
### Fixed
- Translations are applied to all components

## [1.4.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.4.2)
### Fixed
- In non-PRD environments, in the first step of the stepper, show a link to access the same-environment Wallet

## [1.4.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.4.1)
### Added
- Test Wallet url for getting credential offer through same-device flow in the same environment

## [1.4.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.4.0)
### Added
- Same-device flow: user can get credential with a signel device, without need to scan QR
- Stepper to get credential offer

## [1.3.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.3.0)
### Changed
- Add new attribute to the credentials view
- Disable the credential view for unknown credentials type

## [1.2.7](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.7)
### Added
- User is now redirected after send reminder
- A dialog with spinner appears while waiting for server response

### Changed
- Floating elements are unified, there is only dialogs with confirm and error styles.
- Unified styles (Blinker font, primary color)

### Fixed
- Sort arrow and header style corresponds to relative column state (sorting or not sorting)


## [1.2.6](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.6)
### Changed
- Refactor architecture to Standalone

## [1.2.5](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.5)
### Fixed
- When logging out, the cache is cleared, and the session with the identity provider is terminated

## [1.2.4](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.4)
### Fixed
- When selecting the power "Certification" with the action "Attest", it didn't allow the credential to be created.

## [1.2.3](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.3)
### Added
- Added profile env variable
### Fixed
- Fix error in vc serialization from the user data

## [1.2.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.2)
### Fixed
- In credential management, fix "New create credential" button to redirect to proper route
- In credential form as a signer, show mandator form and signer panel after refreshing
- In credential form, fix validation (add length and character restrictions and error messages)
- In credential form, don't allow user to introduce 'VAT-' prefix in organization identifier field
- In credential form, don't add prefix to phone number input after submitting
- In credential form, disable already added power options and show messages when user has no added power options or has a power option without selected action
- In credential form phone input, make label go up only after clicking

## [1.2.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.1)
### Changed
- Fix several bugs

## [1.2.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.2.0)
### Changed
- The authentication logic has been changed from Role-Based Access Control (RBAC) to Policy-Based Access Control (PBAC) to enhance granularity and flexibility in permission management.
### Fixed
- The literal "Product Offer" has been replaced with "ProductOffering" in the selection of powers.

## [1.1.8](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.8)
### Fixed
- In credential procedures table, differentiate active sort arrow

## [1.1.7](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.7)
### Changed
- In credential procedures list, add limit to name column width and change title to "Full name"
- In credential procedures list, change datetime format of "updated" column
- In credential procedures list, change pagination to 10/25/50 visible objects at a time.
### Fixed
- In credential procedures table, make sort arrow always visible
- Fix credential procedures table responsiveness

## [1.1.6](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.6)
### Fixed
- In credential form, show error 'already added option' every time is needed
- In credential procedures list, don't log them

## [1.1.5](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.5)
### Fixed
- In credential form, capitalize "mobile phone" placeholder
- In credential form, sort countries dropdown alphabetically
- In credential form, make phone-prefix and country validation independent

## [1.1.4](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.3)
### Fixed
- Redirect to credentials list after New Credential form submit

## [1.1.3](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.3)
### Fixed
- Scroll to see more button
- Fav icon

## [1.1.2](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.2)
### Fixed
- The display name of the user logged in is now using the first name and last name of the user instead of the email

## [1.1.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.1)
### Fixed
- In credential details page, show Send reminder button only if VC status is WITHDRAWN or PEND_DOWNLOAD

## [1.1.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.1.0)
### Added 
- Sorting by status, name, and updated date in the credentials list in Backoffice 
- Requirement of at least one power in the credential creation form 
### Changed
- Issuance API contract 
- Phone number optional in credential creation form
- Changed DomePlatform power to Certification ("Upload") power 
- Button "DOCS" on Home Page now points to the Knowledge Base
- Button "LearnMore" on Home Page now points to the Knowledge Base
- "Dome" text from powers now displayed with proper capitalization
### Removed
- In home wallet section, verifier link and introductory text
### Fixed 
- In home wallet section, QR and link were not set as env variable
- Entire row in credentials list is now clickable in Backoffice 
- Display of Mandator information in credential details view 
- Removed the power combo box from the credential details view as it was unnecessary 
- Placeholder text now displayed for Mandator in credential creation form (previously showed dummy data) 
- Prevented selection of the same power more than once in credential creation form 
- Restricted issuance without a signature in the Flux module 
- Hidden signer row and buttons based on user role
- Link to wallet added on Home Page 
- QR code linking to wallet added on Home Page 

## [1.0.1](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.0.1)
### Changed
- Make sorting of credentials list case-insensitive
- Save credential api path and contract

## [1.0.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v1.0.0)
### Added
-Authentication configuration
-Credential Creation
-Credential Managment
-Credential Issuance

## [0.6.0](https://github.com/in2workspace/in2-issuer-ui/releases/tag/v0.6.0)
### Added
- Landing Page
