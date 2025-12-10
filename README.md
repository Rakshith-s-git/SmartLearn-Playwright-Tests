# SmartLearn Playwright Automation

This is a sample Playwright-based automation framework for a fictional Learning Management System (SmartLearn). It demonstrates UI and API testing, accessibility checks, CI integration, and structured test design suitable for Smart Working's QA Automation Engineer role.

## Tech Stack
- Playwright Test (@playwright/test)
- JavaScript
- GitHub Actions (CI) (sample workflow included)
- Playwright HTML Reporter (built-in)

## Setup

```bash
# 1. Clone or extract this project
cd smartlearn-playwright

# 2. Install dependencies
npm install

# 3. Run tests (headless)
npm test

# 4. Run a single test file or headed mode
npm run test:headed

# 5. View HTML report
npm run test:report
```

## Project Structure
- `tests/` - Playwright test suites
- `pages/` - Page Object Model classes
- `utils/` - API client and helpers
- `.github/workflows/ci.yml` - Example CI workflow for GitHub Actions

## What to add / improve
- Integrate Allure reporting (optional)
- Add more tests for accessibility & performance
- Integrate with Bitbucket Pipelines if preferred
- Add test data management and fixtures

