# KameHouse Browser Testing Infrastructure

Automated and manual browser testing setup for KameHouse navigation redesign and future features.

---

## 📁 Directory Structure

```
browser-tests/
├── README.md                          # This file
├── config.json                        # Test configuration
├── navigation-tests.md                # Detailed test scenarios
├── run-navigation-tests.md            # Step-by-step execution guide
├── screenshots/                       # Test screenshots (gitignored)
│   ├── 01-dashboard-desktop.png
│   ├── 02-my-habits-page.png
│   └── ... (17 more)
└── TEST_REPORT.md                     # Generated test report (gitignored)
```

---

## 🚀 Quick Start

### Prerequisites

1. **Node.js** installed (v18+ recommended)
2. **Frontend dev server** running:
```bash
cd /Users/kevinp/Movies/coomunity-universe/KameHouse/frontend
npm run dev
# Server at http://localhost:5173
```

3. **Backend server** running (for data):
```bash
cd /Users/kevinp/Movies/coomunity-universe/KameHouse/backend
npm run start:dev
# Server at http://localhost:3000
```

4. **Test data** created:
- Test user: test@kamehouse.com / Test123!
- 2-3 habits created
- 1 household with members
- 2-3 chores assigned
- 1-2 favor requests

---

## 🧪 Running Tests

### Method 1: Manual Testing (Recommended for Development)

Use this method during active development:

1. Open `navigation-tests.md`
2. Follow each test scenario step-by-step
3. Manually verify results in browser
4. Take screenshots for documentation

**Best for**: Quick iteration, visual verification, exploratory testing

---

### Method 2: Automated with MCP Puppeteer (Recommended for CI/CD)

Use this method for consistent, repeatable tests:

1. Open `run-navigation-tests.md`
2. Copy MCP Puppeteer commands
3. Execute via Claude with MCP browser tool
4. Review generated screenshots
5. Compile results in TEST_REPORT.md

**Best for**: Regression testing, before deployment, baseline screenshots

**Example workflow**:
```bash
# In Claude chat with MCP enabled:
User: "Run the navigation tests using MCP Puppeteer"
Claude: [Executes commands from run-navigation-tests.md]
User: "Show me screenshot 04-tasks-page-all"
Claude: [Displays screenshot for review]
```

---

### Method 3: Hybrid Approach (Recommended for QA)

Combine both methods:

1. Use automated tests for baseline coverage
2. Use manual tests for edge cases
3. Document findings in TEST_REPORT.md

**Best for**: Pre-release QA, comprehensive testing

---

## 📋 Test Scenarios Covered

### Navigation Tests (Phase 2)
- ✅ Desktop navigation labels and functionality
- ✅ Desktop hover color-coding (purple/blue)
- ✅ Mobile bottom navigation (4 tabs)
- ✅ Mobile "Me" drawer functionality
- ✅ Unified Tasks page (/tasks)
- ✅ Tasks page filters (All/Habits/Chores/Favors)
- ✅ TodayTasksWidget on Dashboard
- ✅ Cross-feature navigation flow
- ✅ Responsive behavior (desktop/tablet/mobile)
- ✅ Empty states and error handling

### Future Test Scenarios (Phase 3+)
- ⏳ KameHouse page restructure
- ⏳ Family Pulse widget
- ⏳ Household goals feature
- ⏳ Enhanced urgency system
- ⏳ Real-time notifications

---

## 🎯 Test Configuration

Edit `config.json` to customize:

```json
{
  "baseUrl": "http://localhost:5173",
  "testUser": {
    "email": "test@kamehouse.com",
    "password": "Test123!"
  },
  "viewport": {
    "desktop": { "width": 1440, "height": 900 },
    "tablet": { "width": 768, "height": 1024 },
    "mobile": { "width": 375, "height": 812 }
  },
  "screenshots": {
    "enabled": true,
    "directory": "./screenshots"
  }
}
```

---

## 📸 Screenshot Management

### Automatic Naming Convention
```
[sequence]-[feature]-[viewport].png

Examples:
01-dashboard-desktop.png
11-mobile-tasks-page.png
17-task-card-colors.png
```

### Storage
- **Location**: `browser-tests/screenshots/`
- **Git**: Added to .gitignore (too large for repo)
- **Backup**: Store in Google Drive or similar for team access

### Baseline vs Current
- **Baseline**: First test run, establishes expected state
- **Current**: Subsequent runs, compared against baseline
- **Visual Diff**: Use tools like Percy or BackstopJS for automated comparison

---

## 📊 Reporting

### Generate Test Report

After running tests, document in `TEST_REPORT.md`:

```markdown
# Navigation Test Report
**Date**: 2025-11-09
**Tester**: Kevin
**Branch**: main
**Commit**: 2581d81

## Summary
- Total Tests: 12
- Passed: 12 ✅
- Failed: 0 ❌
- Blocked: 0 ⚠️

## Critical Findings
- All navigation paths functional
- Color-coding system works as expected
- Mobile bottom nav performs well
- No console errors detected

## Screenshots
See /browser-tests/screenshots/ for visual verification

## Recommendations
- Deploy to staging for user testing
- Monitor task completion metrics
- Gather user feedback on navigation clarity
```

---

## 🛠️ Developer Workflow

### Adding New Tests

1. **Create test scenario** in `navigation-tests.md`:
```markdown
## Test Scenario X: Feature Name

### Steps:
1. Navigate to page
2. Perform action
3. Verify result

### Expected Result:
✅ Feature works correctly
```

2. **Add automated commands** to `run-navigation-tests.md`

3. **Update config.json** if new settings needed

4. **Run test** and capture screenshots

5. **Document results** in TEST_REPORT.md

---

### Before Committing Code

Run this checklist:

- [ ] Run navigation tests (automated or manual)
- [ ] Review all screenshots for regressions
- [ ] Check browser console for errors
- [ ] Test on multiple viewports
- [ ] Verify empty states
- [ ] Test error handling
- [ ] Update test scenarios if features changed
- [ ] Document any new bugs found

---

## 🔧 Troubleshooting

### Tests Fail to Start

**Problem**: "Cannot connect to http://localhost:5173"

**Solutions**:
1. Ensure dev server is running: `npm run dev`
2. Check port is not in use: `lsof -i :5173`
3. Verify frontend/.env has correct settings

---

### Authentication Issues

**Problem**: "Invalid credentials" during login

**Solutions**:
1. Verify test user exists in database
2. Check backend is running and connected to DB
3. Use correct credentials from config.json
4. Clear browser cookies/localStorage

---

### Screenshot Failures

**Problem**: Screenshots are blank or black

**Solutions**:
1. Increase wait time after navigation (2-3 seconds)
2. Ensure elements are rendered before screenshot
3. Check viewport size is adequate
4. Try different browser (Chrome vs Firefox)

---

### Mobile Tests Not Working

**Problem**: Mobile viewport not resizing correctly

**Solutions**:
1. Use MCP Puppeteer with explicit width/height
2. Clear browser cache
3. Test on actual mobile device for validation

---

## 📝 Best Practices

### Test Organization
- Keep test scenarios focused and atomic
- Use descriptive names for screenshots
- Document expected vs actual results
- Update tests when features change

### Screenshot Strategy
- Capture key states (loading, loaded, error)
- Use consistent viewport sizes
- Name files sequentially for easy review
- Include timestamps in reports

### Continuous Testing
- Run tests before every PR
- Run tests after every deployment
- Keep baseline screenshots up-to-date
- Automate regression detection

---

## 🚀 CI/CD Integration (Future)

### GitHub Actions Workflow (Draft)

```yaml
name: Browser Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  browser-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend && npm install
          cd backend && npm install
      - name: Start servers
        run: |
          cd backend && npm run start:dev &
          cd frontend && npm run dev &
          sleep 10
      - name: Run Puppeteer tests
        run: npm run test:browser
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: test-screenshots
          path: frontend/browser-tests/screenshots
```

---

## 🤝 Contributing

### Adding Test Coverage

1. Identify untested feature
2. Write test scenario in `navigation-tests.md`
3. Create MCP Puppeteer commands
4. Run test and verify
5. Submit PR with new test documentation

### Improving Test Infrastructure

1. Propose enhancement in GitHub Issue
2. Update config.json if needed
3. Modify test runner scripts
4. Document changes in README
5. Submit PR with rationale

---

## 📚 Resources

### Documentation
- [MCP Puppeteer Docs](https://docs.claude.com/)
- [Puppeteer API](https://pptr.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Tools
- **Percy**: Visual regression testing
- **BackstopJS**: Screenshot comparison
- **Playwright**: Alternative to Puppeteer
- **Cypress**: E2E testing framework

---

## 📅 Test Maintenance Schedule

### Daily (During Active Development)
- Run smoke tests on Dashboard and Tasks page
- Check for console errors
- Verify critical paths work

### Weekly
- Full navigation test suite
- Update baseline screenshots if intentional changes
- Review and triage any new bugs

### Before Release
- Complete test coverage (all scenarios)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device testing (iOS, Android)
- Performance profiling
- Accessibility audit (WCAG 2.1 AA)

---

## 🎉 Success Metrics

Track these after deploying tested features:

- **Test Coverage**: % of features with test scenarios
- **Bug Detection Rate**: Bugs found in testing vs production
- **Test Execution Time**: Time to run full suite
- **Screenshot Diffs**: Visual regressions caught
- **CI/CD Pass Rate**: % of builds passing tests

---

## 📞 Support

Questions or issues with browser testing?

- **Documentation**: Check `navigation-tests.md` and this README
- **Bugs**: Open GitHub Issue with "browser-test" label
- **Improvements**: Submit PR with proposed changes
- **Questions**: Ask in team Slack #dev-testing channel

---

**Last Updated**: 2025-11-09
**Maintained by**: KameHouse Dev Team
**Version**: 1.0 (Navigation Redesign Phase)
