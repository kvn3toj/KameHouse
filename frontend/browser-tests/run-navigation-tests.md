# Automated Navigation Test Runner

This document contains step-by-step instructions to run automated browser tests using MCP Puppeteer.

---

## Prerequisites

1. **Start the dev server**:
```bash
cd /Users/kevinp/Movies/coomunity-universe/KameHouse/frontend
npm run dev
```

2. **Verify server is running**:
- Open http://localhost:5173 in browser
- Should see KameHouse login page

3. **Prepare test data**:
- Create test user or use existing credentials
- Have at least 2-3 habits, chores, and favors

---

## Test Execution Steps

Copy and execute these commands one by one using Claude's MCP Puppeteer tool.

### Step 1: Initialize Browser & Navigate to Login

```
Navigate to login page and take initial screenshot
```

**Command**: Navigate to http://localhost:5173

**Expected**: Login page loads successfully

---

### Step 2: Login with Test Credentials

```
Fill login form and submit
```

**Commands**:
1. Fill email: input[type="email"] with "test@kamehouse.com"
2. Fill password: input[type="password"] with "Test123!"
3. Click submit button

**Expected**: Successfully logs in and redirects to Dashboard

---

### Step 3: Capture Dashboard - Desktop View

```
Take screenshot of dashboard with TodayTasksWidget
```

**Command**: Take screenshot at 1440x900 named "01-dashboard-desktop"

**Verify**:
- Top navigation bar visible with: Home | My Habits | Achievements | Family Hub | House Tasks
- TodayTasksWidget showing "🎯 Today's Priorities"
- Widget displays up to 5 tasks with urgency indicators
- "View All" button present

---

### Step 4: Test Desktop Navigation - Click My Habits

```
Navigate to My Habits page
```

**Commands**:
1. Click button containing "My Habits"
2. Wait 1 second
3. Take screenshot named "02-my-habits-page"

**Verify**:
- URL is http://localhost:5173/habits
- "My Habits" nav item has active state (white background)
- Page loads correctly with habit cards

---

### Step 5: Navigate to Family Hub

```
Test household navigation
```

**Commands**:
1. Click button containing "Family Hub"
2. Wait 1 second
3. Take screenshot named "03-family-hub-page"

**Verify**:
- URL is http://localhost:5173/kamehouse
- "Family Hub" nav item has active state
- Page shows household information or create household prompt

---

### Step 6: Navigate to NEW Tasks Page

```
Test unified Tasks page - PRIMARY TEST
```

**Commands**:
1. Navigate to http://localhost:5173/tasks
2. Wait 2 seconds (allow data to load)
3. Take screenshot named "04-tasks-page-all"

**Verify** (CRITICAL):
- Page header shows "📋 My Tasks"
- Stats chips visible: "X To Do", "Y Completed", category counts
- Filter tabs present: All | Habits | Chores | Favors
- Two-column layout: To Do | Completed
- Task cards show in To Do column
- Color-coded backgrounds (purple/blue/green)

---

### Step 7: Test Tasks Page - Habits Filter

```
Filter to show only habits
```

**Commands**:
1. Click button containing "Habits" (in filter tabs)
2. Wait 500ms
3. Take screenshot named "05-tasks-page-habits-filter"

**Verify**:
- Only habit cards visible
- Stats chips update
- Filter tab "Habits" is highlighted

---

### Step 8: Test Tasks Page - Chores Filter

```
Filter to show only chores
```

**Commands**:
1. Click button containing "Chores" (in filter tabs)
2. Wait 500ms
3. Take screenshot named "06-tasks-page-chores-filter"

**Verify**:
- Only chore cards visible
- Blue accent backgrounds
- Stats chips update

---

### Step 9: Test Tasks Page - Favors Filter

```
Filter to show only favors
```

**Commands**:
1. Click button containing "Favors" (in filter tabs)
2. Wait 500ms
3. Take screenshot named "07-tasks-page-favors-filter"

**Verify**:
- Only favor cards visible (or empty state if none)
- Green accent backgrounds
- "Accept Favor" buttons present

---

### Step 10: Return to Dashboard

```
Navigate back to home
```

**Commands**:
1. Click button containing "Home" in top nav
2. Wait 1 second
3. Scroll to TodayTasksWidget section
4. Take screenshot named "08-dashboard-widget-detail"

**Verify**:
- Back on Dashboard
- TodayTasksWidget visible
- Tasks aggregated from all types

---

### Step 11: Click "View All" in Widget

```
Test widget navigation to Tasks page
```

**Commands**:
1. Click button containing "View All" (in TodayTasksWidget)
2. Wait 1 second
3. Take screenshot named "09-widget-to-tasks-navigation"

**Verify**:
- Navigates to /tasks
- Seamless transition
- No layout shift

---

### Step 12: Mobile View - Resize to 375x812

```
Test mobile responsive design
```

**Commands**:
1. Navigate to http://localhost:5173 (refresh if needed)
2. Resize viewport to 375x812
3. Wait 1 second
4. Take screenshot named "10-mobile-dashboard"

**Verify**:
- Bottom navigation bar visible with 4 tabs
- Tabs: 🏠 Home | ✅ Tasks | 👥 House | 👤 Me
- Top navigation collapsed or hidden
- Content adapts to mobile width

---

### Step 13: Test Mobile Bottom Nav - Tasks Tab

```
Tap Tasks tab on mobile
```

**Commands**:
1. Click element with aria-label="Tasks" or button containing "Tasks"
2. Wait 1 second
3. Take screenshot named "11-mobile-tasks-page"

**Verify**:
- Navigates to /tasks
- Tasks tab highlighted/active
- Page layout adapts to mobile (single column)
- Touch targets adequate size

---

### Step 14: Test Mobile Bottom Nav - House Tab

```
Tap House tab on mobile
```

**Commands**:
1. Click element containing "House" in bottom nav
2. Wait 1 second
3. Take screenshot named "12-mobile-house-page"

**Verify**:
- Navigates to /kamehouse
- House tab highlighted
- Page renders correctly on mobile

---

### Step 15: Test Mobile "Me" Drawer

```
Tap Me tab to open drawer
```

**Commands**:
1. Click element containing "Me" in bottom nav
2. Wait 500ms
3. Take screenshot named "13-mobile-me-drawer"

**Verify** (CRITICAL):
- Drawer slides up from bottom
- Shows: Achievements, My Habits, My Chores, Logout
- Achievement count badge visible (if any new)
- Drawer has rounded top corners

---

### Step 16: Test Me Drawer - Navigate to Achievements

```
Click Achievements in drawer
```

**Commands**:
1. Click element containing "Achievements" in drawer
2. Wait 1 second
3. Take screenshot named "14-mobile-achievements-page"

**Verify**:
- Drawer closes
- Navigates to /achievements
- Me tab still highlighted (or closes)

---

### Step 17: Return to Desktop View

```
Switch back to desktop for final tests
```

**Commands**:
1. Navigate to http://localhost:5173
2. Resize viewport to 1440x900
3. Wait 1 second

---

### Step 18: Test Color-Coding - Hover My Habits

```
Verify purple hover tint on personal features
```

**Commands**:
1. Hover over button containing "My Habits"
2. Take screenshot named "15-hover-my-habits"

**Verify**:
- Purple tint appears on hover
- Color: rgba(186, 104, 200, 0.15)
- Subtle but visible

---

### Step 19: Test Color-Coding - Hover Family Hub

```
Verify blue hover tint on household features
```

**Commands**:
1. Hover over button containing "Family Hub"
2. Take screenshot named "16-hover-family-hub"

**Verify**:
- Blue tint appears on hover
- Color: rgba(66, 165, 245, 0.15)
- Distinct from purple

---

### Step 20: Final Verification - Tasks Page Card Colors

```
Verify task card background colors
```

**Commands**:
1. Navigate to http://localhost:5173/tasks
2. Wait 2 seconds
3. Take screenshot named "17-task-card-colors"

**Verify**:
- Habit cards: Purple background (rgba(103, 58, 183, 0.1))
- Chore cards: Blue background (rgba(33, 150, 243, 0.1))
- Favor cards: Green background (rgba(76, 175, 80, 0.1))
- Colors aid quick recognition

---

## Test Results Summary

After completing all steps, compile results:

### ✅ Passed Tests:
- [ ] Desktop navigation labels updated
- [ ] Desktop color-coding on hover works
- [ ] Mobile bottom navigation has 4 tabs
- [ ] Mobile "Me" drawer functions correctly
- [ ] Unified Tasks page loads and displays
- [ ] Tasks page filters work (All/Habits/Chores/Favors)
- [ ] TodayTasksWidget shows on Dashboard
- [ ] Widget "View All" navigates to Tasks
- [ ] Task cards have correct color-coding
- [ ] Responsive design works across viewports
- [ ] No console errors during navigation
- [ ] All navigation paths functional

### ❌ Failed Tests:
- [ ] [Describe any failures here]

### 🐛 Bugs Found:
- [ ] [List any bugs discovered]

---

## Screenshots Location

All screenshots saved to: `/Users/kevinp/Movies/coomunity-universe/KameHouse/frontend/browser-tests/screenshots/`

Expected screenshots (20 total):
1. 01-dashboard-desktop.png
2. 02-my-habits-page.png
3. 03-family-hub-page.png
4. 04-tasks-page-all.png
5. 05-tasks-page-habits-filter.png
6. 06-tasks-page-chores-filter.png
7. 07-tasks-page-favors-filter.png
8. 08-dashboard-widget-detail.png
9. 09-widget-to-tasks-navigation.png
10. 10-mobile-dashboard.png
11. 11-mobile-tasks-page.png
12. 12-mobile-house-page.png
13. 13-mobile-me-drawer.png
14. 14-mobile-achievements-page.png
15. 15-hover-my-habits.png
16. 16-hover-family-hub.png
17. 17-task-card-colors.png

---

## Quick MCP Puppeteer Reference

### Navigate
```
mcp__puppeteer__puppeteer_navigate
- url: "http://localhost:5173/tasks"
```

### Screenshot
```
mcp__puppeteer__puppeteer_screenshot
- name: "test-screenshot"
- width: 1440
- height: 900
```

### Click
```
mcp__puppeteer__puppeteer_click
- selector: "button[type='submit']"
```

### Fill
```
mcp__puppeteer__puppeteer_fill
- selector: "input[type='email']"
- value: "test@kamehouse.com"
```

### Hover
```
mcp__puppeteer__puppeteer_hover
- selector: "a.nav-link"
```

### Evaluate
```
mcp__puppeteer__puppeteer_evaluate
- script: "document.title"
```

---

## Troubleshooting

**Issue**: "Failed to navigate"
- **Fix**: Ensure dev server is running on port 5173
- **Check**: `lsof -i :5173` should show node process

**Issue**: "Selector not found"
- **Fix**: Wait longer after page load (add wait steps)
- **Check**: Inspect element in browser DevTools

**Issue**: Screenshots empty/black
- **Fix**: Increase wait time after navigation
- **Check**: Ensure elements are rendered before screenshot

**Issue**: Login fails
- **Fix**: Verify test user exists in database
- **Check**: Backend logs for authentication errors

---

## Next Steps After Testing

1. **Review all screenshots** for visual regressions
2. **Document any bugs** in GitHub Issues
3. **Update test scenarios** if new features added
4. **Share results** with team before merging
5. **Re-run tests** after bug fixes

---

**Last Updated**: 2025-11-09
**Version**: 1.0
