# 🎨 KameHouse Unified Design System

This document describes the unified design system that ensures visual coherence across all pages.

## 📦 Quick Start

```tsx
// Import unified components
import {
  PageContainer,
  StatusCard,
  StatCard,
  EmptyState,
  Icon,
  COLORS,
  SPACING,
  COMPONENTS,
} from '@/components/ui';

// Use in your page
export const MyPage = () => {
  return (
    <PageContainer
      title="Page Title"
      subtitle="Page description"
      action={<Button>Add New</Button>}
    >
      {/* Your content */}
    </PageContainer>
  );
};
```

## 🎨 Color System

### Usage

```tsx
import { COLORS } from '@/components/ui';

// Primary brand color
<Box sx={{ color: COLORS.primary.main }} />

// Success state
<Box sx={{ backgroundColor: COLORS.success.subtle }} />

// Text colors
<Typography color={COLORS.text.secondary} />
```

### Available Colors

**KameHouse uses ONLY 4 core colors** (from the Habits page):

- `COLORS.primary` - Purple/Indigo (#6366F1) - Level, brand, primary actions
- `COLORS.success` - Green (#10B981) - XP, achievements, completion
- `COLORS.warning` - Yellow/Amber (#F59E0B) - Gold, streaks, attention
- `COLORS.error` - Red (#EF4444) - Health, errors, critical states
- `COLORS.neutral` - Gray scale (50-900) - Text and borders only

Each color has variants:
- `.main` - Primary shade
- `.light` - Lighter variant
- `.dark` - Darker variant
- `.subtle` - 10% opacity background
- `.hover` - 4% opacity hover state

## 🔢 Spacing System

Fibonacci-based spacing for harmonic proportions:

```tsx
import { SPACING } from '@/components/ui';

<Box sx={{
  p: SPACING.md,           // 21px padding
  mt: SPACING.lg,          // 34px top margin
  gap: SPACING.sm,         // 13px gap
}} />
```

Available values:
- `SPACING.xs` - 8px
- `SPACING.sm` - 13px
- `SPACING.md` - 21px
- `SPACING.lg` - 34px
- `SPACING.xl` - 55px
- `SPACING.xxl` - 89px

## 🎭 Components

### PageContainer

Unified page wrapper with consistent header and spacing:

```tsx
<PageContainer
  title="Habits"
  subtitle="Build your daily rituals"
  maxWidth="lg"
  action={<Button>Create Habit</Button>}
>
  {/* Page content */}
</PageContainer>
```

### StatusCard

Card with status indicator:

```tsx
<StatusCard
  title="Complete morning routine"
  description="Exercise and meditation"
  status="pending"
  statusLabel="In Progress"
  icon={<Icon name="habits" />}
  action={<Button>Mark Complete</Button>}
  onClick={() => handleClick()}
/>
```

### StatCard

Display numerical statistics:

```tsx
<StatCard
  label="Current Streak"
  value={7}
  icon={<Icon name="streak" />}
  trend={{ value: 2, label: "this week" }}
  color="warning"
/>
```

### EmptyState

Consistent empty states:

```tsx
<EmptyState
  icon={<Icon name="habits" />}
  title="No habits yet"
  description="Create your first habit to get started"
  action={{
    label: "Create Habit",
    onClick: () => navigate('/habits/new')
  }}
/>
```

### Icon

Unified icon system:

```tsx
<Icon name="home" />
<Icon name="dashboard" fontSize="large" color="primary" />
<Icon name="habits" sx={{ fontSize: 32 }} />
```

Available icons (see `theme/design-system.ts` for full list):
- Navigation: `home`, `dashboard`, `habits`, `quests`, `achievements`
- Actions: `add`, `edit`, `delete`, `save`, `cancel`
- Status: `complete`, `pending`, `error`, `warning`
- And many more...

## 📐 Layout Constants

```tsx
import { LAYOUT } from '@/components/ui';

// AppBar height
height: LAYOUT.appBar.height  // 64px

// Container widths
maxWidth: LAYOUT.container.lg  // 1280px
```

## 🎨 Component Styles

Pre-configured component styles:

```tsx
import { COMPONENTS } from '@/components/ui';

// Standard card
<Card sx={COMPONENTS.card.standard} />

// Interactive card (with hover)
<Card sx={COMPONENTS.card.interactive} />

// Primary button
<Button {...COMPONENTS.button.primary} />
```

## 🎯 Status Colors

```tsx
import { STATUS_COLORS, HELPERS } from '@/components/ui';

// Get status color
const color = STATUS_COLORS.completed;  // Green

// Get status badge styles
const badgeStyle = HELPERS.getStatusBadge('pending');

// Get progress color based on percentage
const progressColor = HELPERS.getProgressColor(75);  // Info blue
```

## 🌈 Gradients

```tsx
import { GRADIENTS } from '@/components/ui';

<Box sx={{
  background: GRADIENTS.primary,
  // or
  background: GRADIENTS.success,
}} />
```

## 📋 Example Page

Complete example using the unified system:

```tsx
import {
  PageContainer,
  StatusCard,
  StatCard,
  EmptyState,
  Icon,
  SPACING,
  COLORS,
} from '@/components/ui';
import { Grid, Button } from '@mui/material';

export const HabitsPage = () => {
  const habits = useHabits();

  return (
    <PageContainer
      title="My Habits"
      subtitle="Build consistent daily rituals"
      action={<Button startIcon={<Icon name="add" />}>New Habit</Button>}
    >
      {/* Stats Grid */}
      <Grid container spacing={SPACING.sm} sx={{ mb: SPACING.lg }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Active Streak"
            value={7}
            icon={<Icon name="streak" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Level"
            value={5}
            icon={<Icon name="level" />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Habits List */}
      {habits.length > 0 ? (
        <Grid container spacing={SPACING.sm}>
          {habits.map((habit) => (
            <Grid item xs={12} key={habit.id}>
              <StatusCard
                title={habit.name}
                description={habit.description}
                status={habit.status}
                icon={<Icon name="habits" />}
                action={<Button>Complete</Button>}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={<Icon name="habits" />}
          title="No habits yet"
          description="Create your first habit to start building consistency"
          action={{
            label: "Create Habit",
            onClick: () => navigate('/habits/new')
          }}
        />
      )}
    </PageContainer>
  );
};
```

## ✅ Best Practices

1. **Always use `PageContainer`** for consistent page layout
2. **Use design system colors** instead of hardcoded hex values
3. **Use `Icon` component** instead of importing MUI icons directly
4. **Use `SPACING` constants** for consistent spacing
5. **Use pre-built components** (StatusCard, StatCard) when possible
6. **Use semantic colors** (success, warning, error) for status indicators

## 🚫 Don't Do This

```tsx
// ❌ Don't hardcode colors
<Box sx={{ color: '#6366F1' }} />

// ❌ Don't import icons directly
import HomeIcon from '@mui/icons-material/Home';

// ❌ Don't use random spacing values
<Box sx={{ p: 3, mt: 2.5 }} />

// ❌ Don't create custom page layouts
<Box sx={{ maxWidth: 1200, margin: 'auto' }}>
```

## ✅ Do This Instead

```tsx
// ✅ Use design system colors
<Box sx={{ color: COLORS.primary.main }} />

// ✅ Use unified Icon component
<Icon name="home" />

// ✅ Use spacing constants
<Box sx={{ p: SPACING.md, mt: SPACING.lg }} />

// ✅ Use PageContainer
<PageContainer maxWidth="lg">
```

## 📊 Migration Guide

To migrate existing pages to the unified system:

1. Replace page wrapper with `PageContainer`
2. Replace hardcoded colors with `COLORS.*`
3. Replace icon imports with `<Icon name="..." />`
4. Replace cards with `StatusCard` or `StatCard`
5. Replace empty states with `EmptyState`
6. Use `SPACING.*` for all spacing values

---

**For questions or additions, update `/theme/design-system.ts`**
