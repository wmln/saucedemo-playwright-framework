# pages/

Page Object Model (POM) files. One file per page or major component.

Rules:
- Page Objects expose locators as `readonly` class properties
- Methods represent user actions (click, fill, submit)
- No `expect()` assertions inside Page Objects
- Navigate in `navigate()` method using relative paths (baseURL is set in config)
