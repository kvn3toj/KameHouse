# KameHouse Browser Navigation Tests

This document contains browser test scenarios for the KameHouse navigation redesign.
Use these with the MCP Puppeteer tool or manually during development.

---

## Prerequisites

1. **Start the development server**:
```bash
cd frontend
npm run dev
# Server should be running at http://localhost:5173
```

2. **Ensure test data exists**:
- Create test user: test@kamehouse.com / Test123!
- Create at least 2 habits
- Create at least 1 household with family members
- Create at least 2 chores
- Create at least 1 favor request

---

## Test Scenario 1: Desktop Navigation Flow

**Objective**: Verify new desktop navigation labels and functionality

### Steps:
1. Navigate to `http://localhost:5173`
2. Login with test credentials
3. Verify navigation bar shows: `Home | My Habits | Achievements | Family Hub | House Tasks`
4. Click each navigation item and verify:
   - **Home**: Goes to Dashboard (/)
   - **My Habits**: Goes to Habits page (/habits)
   - **Achievements**: Goes to Achievements page (/achievements)
   - **Family Hub**: Goes to KameHouse page (/kamehouse)
   - **House Tasks**: Goes to Chores page (/chores)
5. Hover each nav item and verify color-coding:
   - **My Habits, Achievements**: Purple tint on hover
   - **Family Hub, House Tasks**: Blue tint on hover
6. Verify active state: White background + bottom border

**Expected Result**:
✅ All navigation items work correctly
✅ Color-coding is visible and subtle
✅ Active states are clear
✅ No broken links

**Screenshot**: Save as `desktop-navigation-bar.png`

---

## Test Scenario 2: Mobile Bottom Navigation

**Objective**: Verify new 4-tab mobile navigation structure

### Steps:
1. Navigate to `http://localhost:5173`
2. Resize viewport to 375x812 (mobile)
3. Login with test credentials
4. Verify bottom navigation shows 4 tabs: `🏠 Home | ✅ Tasks | 👥 House | 👤 Me`
5. Tap each tab and verify:
   - **Home**: Goes to Dashboard
   - **Tasks**: Goes to Tasks page (/tasks) - NEW
   - **House**: Goes to Family Hub (/kamehouse)
   - **Me**: Opens drawer with options
6. Tap **Me** tab and verify drawer shows:
   - Achievements (with count badge if any)
   - My Habits
   - My Chores
   - Logout
7. Close drawer, verify other tabs still work
8. Check active tab highlighting

**Expected Result**:
✅ 4 tabs visible and functional
✅ Tasks tab navigates to new /tasks page
✅ Me drawer opens with all options
✅ Active state highlighting works
✅ No layout issues on mobile

**Screenshots**:
- `mobile-bottom-nav.png`
- `mobile-me-drawer.png`

---

## Test Scenario 3: TodayTasksWidget on Dashboard

**Objective**: Verify widget displays top priority tasks

### Steps:
1. Navigate to Dashboard (/)
2. Scroll to find "🎯 Today's Priorities" widget
3. Verify widget shows:
   - Section header with task count
   - "View All" button
   - Up to 5 task cards
4. Check each task card displays:
   - Task type badge (HABIT/CHORE/FAVOR)
   - URGENT badge (if high priority)
   - Task title
   - Due info / streak info
   - Reward chips (XP, Gold, Credits)
   - Arrow button to navigate
5. Click "View All" button → should go to /tasks
6. Click a task card → should go to /tasks
7. Verify color-coding:
   - Habits: Purple accent
   - Chores: Blue accent
   - Favors: Green accent

**Expected Result**:
✅ Widget shows aggregated tasks
✅ High-priority tasks appear first
✅ All navigation works
✅ Color-coding is visible
✅ Empty state shows if no tasks

**Screenshot**: `dashboard-tasks-widget.png`

---

## Test Scenario 4: Unified Tasks Page

**Objective**: Verify new /tasks page functionality

### Steps:
1. Navigate to `/tasks` (or tap Tasks tab on mobile)
2. Verify page layout:
   - Header: "📋 My Tasks"
   - Stats chips: To Do count, Completed count, category counts
   - Filter tabs: All | Habits | Chores | Favors
   - Two-column grid: To Do | Completed
3. Test filter tabs:
   - Click "Habits" → only habits show
   - Click "Chores" → only chores show
   - Click "Favors" → only favors show
   - Click "All" → all tasks show
4. Verify To Do column:
   - Shows incomplete tasks
   - Sorted by urgency (URGENT first)
   - Action buttons present
5. Verify Completed column:
   - Shows completed tasks
   - Grayed out / strikethrough
   - No action buttons
6. Test task actions:
   - Click "Complete Habit" on a habit → should mark complete
   - Click "Accept Favor" on a favor → should accept
   - Verify success toast appears
7. Click Refresh button → data reloads

**Expected Result**:
✅ Page loads without errors
✅ All filters work correctly
✅ Task aggregation is accurate
✅ Actions complete successfully
✅ Visual design matches mockups
✅ Responsive on all viewports

**Screenshots**:
- `tasks-page-all.png`
- `tasks-page-habits-filter.png`
- `tasks-page-mobile.png`

---

## Test Scenario 5: Cross-Feature Navigation Flow

**Objective**: Verify seamless navigation between features

### Steps:
1. Start on Dashboard
2. Click task card in TodayTasksWidget → goes to /tasks ✓
3. From /tasks, click "My Habits" in top nav → goes to /habits ✓
4. From /habits, click "Home" in top nav → goes to Dashboard ✓
5. From Dashboard, tap "Tasks" in bottom nav (mobile) → goes to /tasks ✓
6. From /tasks, tap "House" in bottom nav → goes to /kamehouse ✓
7. From /kamehouse, tap "Me" in bottom nav → opens drawer ✓
8. From drawer, tap "Achievements" → goes to /achievements ✓
9. From /achievements, tap "Home" → goes to Dashboard ✓

**Expected Result**:
✅ All navigation paths work
✅ No broken links
✅ Browser history works correctly
✅ Active states update properly
✅ No layout shifts between pages

**Screenshot**: N/A (flow test)

---

## Test Scenario 6: Color-Coding Visual Verification

**Objective**: Confirm color-coding system is subtle but effective

### Steps:
1. Navigate to Dashboard
2. Take screenshot of navigation bar (resting state)
3. Hover over "My Habits" → should show purple tint
4. Hover over "Family Hub" → should show blue tint
5. Navigate to Tasks page
6. Verify task card backgrounds:
   - Habits: `rgba(103, 58, 183, 0.1)` (purple)
   - Chores: `rgba(33, 150, 243, 0.1)` (blue)
   - Favors: `rgba(76, 175, 80, 0.1)` (green)
7. Check if color-coding aids recognition without being overwhelming

**Expected Result**:
✅ Colors are subtle but distinguishable
✅ Purple = personal, Blue = household, Green = favors
✅ Hover states enhance visibility
✅ Accessibility: Sufficient contrast ratios

**Screenshots**:
- `color-coding-nav-hover.png`
- `color-coding-task-cards.png`

---

## Test Scenario 7: Urgency Indicators

**Objective**: Verify urgency system works correctly

### Steps:
1. Create a chore due in < 6 hours
2. Navigate to Dashboard
3. Verify chore shows in TodayTasksWidget with:
   - 🔥 URGENT badge
   - ⏰ "Due in Xh" countdown
   - Red border on card
4. Navigate to /tasks
5. Verify same chore appears at top of To Do column
6. Complete the chore
7. Verify it moves to Completed column
8. Create a habit with 7+ day streak
9. Verify it shows HIGH urgency (appears near top)
10. Check streak indicator: "🔥 7 day streak"

**Expected Result**:
✅ Urgency badges show correctly
✅ Countdown timers accurate
✅ Sorting respects urgency
✅ Streak indicators motivate completion
✅ Visual design conveys urgency

**Screenshot**: `urgency-indicators.png`

---

## Test Scenario 8: Empty States

**Objective**: Verify empty states are helpful and actionable

### Steps:
1. Complete all habits, chores, and favors
2. Navigate to Dashboard
3. Verify TodayTasksWidget shows:
   - "✨ You're All Caught Up!"
   - Encouraging message
   - CTAs: "Browse Habits" and "Check Family Tasks"
4. Navigate to /tasks
5. Filter to "Habits"
6. If no habits, verify shows: "No tasks found. Try changing filter..."
7. Check Completed column shows completed tasks
8. Test each empty state for clarity

**Expected Result**:
✅ Empty states are encouraging, not boring
✅ CTAs guide next steps
✅ Messaging is positive and motivating
✅ No broken layouts when empty

**Screenshots**:
- `empty-state-widget.png`
- `empty-state-tasks.png`

---

## Test Scenario 9: Responsive Behavior

**Objective**: Verify layouts adapt across viewports

### Steps:
1. Start at 1440x900 (desktop)
   - Verify top navigation bar visible
   - Verify bottom navigation hidden
   - Verify Tasks page two-column layout
2. Resize to 768x1024 (tablet)
   - Verify top navigation still visible
   - Verify bottom navigation appears
   - Verify Tasks page maintains layout
3. Resize to 375x812 (mobile)
   - Verify top navigation collapses to menu
   - Verify bottom navigation prominent
   - Verify Tasks page stacks columns vertically
4. Test touch interactions on mobile
5. Check for layout shifts, broken elements

**Expected Result**:
✅ All breakpoints render correctly
✅ No horizontal scroll
✅ Touch targets adequate size (44x44px min)
✅ Text remains readable
✅ No content cutoff

**Screenshots**:
- `responsive-desktop.png`
- `responsive-tablet.png`
- `responsive-mobile.png`

---

## Test Scenario 10: Performance & Loading States

**Objective**: Verify loading states and performance

### Steps:
1. Clear browser cache
2. Navigate to Dashboard
3. Observe TodayTasksWidget loading state:
   - Should show CircularProgress spinner
   - Should transition smoothly to content
4. Navigate to /tasks
5. Observe page loading:
   - Should show loading spinner
   - Should load within 2 seconds
6. Click filter tabs rapidly
7. Verify no flickering or layout shift
8. Click Refresh button
9. Verify data reloads without full page refresh
10. Check browser DevTools Console for errors

**Expected Result**:
✅ Loading states are clear
✅ No console errors
✅ Page loads < 2 seconds
✅ Smooth transitions
✅ No layout shift (CLS score good)

**Screenshot**: N/A (performance test)

---

## Test Scenario 11: Error Handling

**Objective**: Verify graceful error handling

### Steps:
1. Stop backend server
2. Navigate to Dashboard
3. Verify TodayTasksWidget shows:
   - Error state: "Failed to load tasks"
   - Not crashing the entire page
4. Navigate to /tasks
5. Verify error state shows:
   - Alert message
   - Retry option (Refresh button)
6. Restart backend server
7. Click Refresh
8. Verify data loads successfully
9. Test network failures (throttle to offline)
10. Check error messages are user-friendly

**Expected Result**:
✅ Errors don't crash the app
✅ Error messages are clear and actionable
✅ Retry mechanisms work
✅ Page remains functional for other features

**Screenshot**: `error-state.png`

---

## Automated Test Script (Puppeteer)

Below is a sample script to automate these tests using MCP Puppeteer tool:

```javascript
// Run this via MCP Puppeteer or save as a Node.js script

const tests = [
  {
    name: 'Desktop Navigation',
    viewport: { width: 1440, height: 900 },
    steps: [
      { action: 'navigate', url: 'http://localhost:5173' },
      { action: 'fill', selector: 'input[type="email"]', value: 'test@kamehouse.com' },
      { action: 'fill', selector: 'input[type="password"]', value: 'Test123!' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'wait', duration: 2000 },
      { action: 'screenshot', name: 'desktop-dashboard' },
      { action: 'click', selector: 'a[href="/tasks"]' },
      { action: 'wait', duration: 1000 },
      { action: 'screenshot', name: 'desktop-tasks-page' },
    ]
  },
  {
    name: 'Mobile Navigation',
    viewport: { width: 375, height: 812 },
    steps: [
      { action: 'navigate', url: 'http://localhost:5173' },
      { action: 'fill', selector: 'input[type="email"]', value: 'test@kamehouse.com' },
      { action: 'fill', selector: 'input[type="password"]', value: 'Test123!' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'wait', duration: 2000 },
      { action: 'screenshot', name: 'mobile-dashboard' },
      { action: 'click', selector: 'button[aria-label="Tasks"]' },
      { action: 'wait', duration: 1000 },
      { action: 'screenshot', name: 'mobile-tasks-page' },
    ]
  }
];

// Execute tests...
```

---

## Test Report Template

After running tests, document results in this format:

```markdown
# Browser Test Report - Navigation Redesign
**Date**: YYYY-MM-DD
**Tester**: [Your Name]
**Environment**: [Development/Staging]
**Browser**: Chrome/Firefox/Safari [Version]

## Summary
- Total Tests: 11
- Passed: X
- Failed: Y
- Blocked: Z

## Test Results

### ✅ PASSED: Desktop Navigation Flow
- All navigation items work correctly
- Color-coding visible on hover
- Active states clear
- Screenshot: `desktop-navigation-bar.png`

### ❌ FAILED: Mobile Bottom Navigation
- Issue: "Tasks" tab not highlighting when active
- Steps to reproduce: ...
- Expected: Active state should show
- Actual: No visual indication
- Screenshot: `mobile-nav-bug.png`

### ⚠️ BLOCKED: TodayTasksWidget
- Reason: No test data available (no habits created)
- Action: Create test fixtures

## Issues Found
1. [BUG] Task card alignment broken on iPad Pro viewport
2. [UX] Empty state message needs improvement
3. [Performance] Tasks page takes 3s to load with 50+ tasks

## Recommendations
- Add loading skeleton for Tasks page
- Improve empty state messaging
- Fix responsive layout for tablet viewports

## Next Steps
- Fix critical bugs
- Re-test failed scenarios
- Deploy to staging for QA review
```

---

## Quick Reference: MCP Puppeteer Commands

```bash
# Navigate to URL
mcp__puppeteer__puppeteer_navigate(url: "http://localhost:5173")

# Take screenshot
mcp__puppeteer__puppeteer_screenshot(name: "dashboard", width: 1440, height: 900)

# Click element
mcp__puppeteer__puppeteer_click(selector: "button.submit")

# Fill input
mcp__puppeteer__puppeteer_fill(selector: "input[type='email']", value: "test@test.com")

# Hover element
mcp__puppeteer__puppeteer_hover(selector: "a.nav-link")

# Evaluate JavaScript
mcp__puppeteer__puppeteer_evaluate(script: "document.querySelector('.widget').innerText")
```

---

## Checklist for Manual Testing

Before merging navigation changes, verify:

- [ ] Desktop navigation labels are clear
- [ ] Mobile bottom nav has 4 tabs
- [ ] Tasks page loads and functions correctly
- [ ] TodayTasksWidget shows on Dashboard
- [ ] Color-coding is visible but subtle
- [ ] All navigation paths work (no 404s)
- [ ] Active states update properly
- [ ] Responsive behavior works across viewports
- [ ] Loading states are present
- [ ] Error handling is graceful
- [ ] Empty states are helpful
- [ ] Urgency indicators work
- [ ] Task actions complete successfully
- [ ] No console errors
- [ ] Performance is acceptable (<2s load)

---

## Notes

- Keep this document updated as features evolve
- Add new test scenarios for future phases
- Share test results with team before deployment
- Use screenshots as baseline for regression testing

**Last Updated**: 2025-11-09
**Version**: 2.0 (Post Navigation Redesign)
