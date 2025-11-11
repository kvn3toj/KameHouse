# Phase 5A: LETS-First Experience - Implementation Guide

## Status: IN PROGRESS

### Completed ✅
1. **Backend Schema Updates**
   - Added `HouseholdSizeTier` enum (SMALL, MEDIUM, LARGE, CLAN)
   - Added `HouseholdStage` enum (FORMING, STORMING, NORMING, PERFORMING)
   - Added `TrustLevel` enum to FavorTransaction (LOW, MEDIUM, HIGH)
   - Added `sizeTier`, `memberCount`, `stage`, `healthScore` to Household model
   - Migration applied successfully: `20251110213114_add_dunbar_layers_household_config`

2. **Frontend Utilities Created**
   - `src/lib/lets-feedback.ts` - Emotional feedback system based on balance
   - `src/components/LetsBalanceHero.tsx` - Hero component for LETS balance display

3. **Strategic Documents**
   - `DUNBARS_LAYERS_APPLICATION.md` - Technical analysis
   - `ROADMAP_NARRATIVE_V2.md` - Simplified narrative roadmap

### In Progress 🔄
4. **Templo.tsx Redesign** - Make LETS the centerpiece

---

## Step-by-Step Implementation: Templo.tsx Redesign

### Current Structure Problems
- LETS balance is buried inside "Available Favors" section (line ~738)
- 6+ major sections competing for attention (Leaderboard, Bulletin, Favors, Members, etc.)
- No clear visual hierarchy emphasizing LETS as THE game
- Quick Actions don't adapt to balance state

### Target LETS-First Structure

```
┌─────────────────────────────────────────────────────┐
│  TEMPLO: THE LETS GAME                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🏛️ [Household Name]                                │
│                                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃  LETS BALANCE HERO (The Game State)          ┃  │
│  ┃  - Giant balance number                      ┃  │
│  ┃  - Emotional feedback                        ┃  │
│  ┃  - Visual progress bar                       ┃  │
│  ┃  - Contextual call-to-action                 ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Contextual Actions (Based on Balance)        │ │
│  │ - In debt? → "Accept a Favor" (prominent)    │ │
│  │ - In credit? → "Request Help" (prominent)    │ │
│  │ - Balanced? → "Browse Favors" (neutral)      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  📋 Active Favors (My Participation)                │
│  - Favors I'm doing for others                     │
│  - Favors others are doing for me                  │
│  - Pending requests I can accept                   │
│                                                     │
│  🤝 Available Opportunities (Browse & Accept)       │
│  - Open favor requests from household              │
│  - Filter by trust level                           │
│  - Quick accept actions                            │
│                                                     │
│  📢 Household Updates (Secondary)                   │
│  - Bulletin board posts                            │
│  - Recent activity                                 │
│                                                     │
│  👥 Members & Stats (Tertiary)                      │
│  - Member directory                                │
│  - Leaderboard (if needed)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Key Changes Required

#### 1. Import the New Component

```typescript
// At top of Templo.tsx, add:
import LetsBalanceHero from '@/components/LetsBalanceHero';
import { getBalanceFeedback } from '@/lib/lets-feedback';
```

#### 2. Move LETS Balance to Top (After Header)

**Current Location:** Line ~738, nested in "LETS Economy - Available Favors" section

**Target Location:** Right after header (around line ~573), before ActiveNowWidget

```typescript
return (
  <Container maxWidth="lg">
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            🏛️ {household.name}
          </Typography>
          {household.description && (
            <Typography variant="body1" color="text.secondary">
              {household.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <IconButton color="error" onClick={handleLeaveHousehold}>
            <LeaveIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ============================================ */}
      {/* LETS BALANCE HERO - THE GAME STATE          */}
      {/* ============================================ */}
      {balance && (
        <LetsBalanceHero
          balance={balance}
          onPrimaryAction={() => {
            const feedback = getBalanceFeedback(balance.balance);
            // If in debt, navigate to available favors
            if (balance.balance < -5) {
              document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              // If in credit/balanced, open request dialog
              setRequestFavorDialogOpen(true);
            }
          }}
          onSecondaryAction={() => {
            document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* ActiveNow widget (keep for household pulse) */}
      <ActiveNowWidget
        pendingFavorsCount={pendingFavorsCount}
        choresDueCount={choresDueCount}
        newPostsCount={newPostsCount}
        householdName={household.name}
      />

      {/* ... rest of content ... */}
    </Box>
  </Container>
);
```

#### 3. Remove Old LETS Balance Card

**Location to Remove:** Lines ~738-840 (the current LETS balance card inside "Available Favors" section)

- Keep the favor list itself
- Remove the nested balance card (it's now at the top as hero)
- Simplify the "Available Favors" section to just show the list

#### 4. Restructure "Quick Actions" to Be Contextual

**Current:** Fixed actions (Request Favor, Post Update)

**Target:** Dynamic based on balance state

```typescript
{/* Contextual Quick Actions based on Balance */}
{balance && (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        ⚡ {getBalanceFeedback(balance.balance).emoji} What Would You Like to Do?
      </Typography>
      <Grid container spacing={2}>
        {/* Primary action based on balance */}
        {balance.balance < -5 ? (
          // In debt: emphasize accepting favors
          <>
            <Grid item xs={12} sm={8}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                color="warning"
                startIcon={<FavorIcon />}
                onClick={() => document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}
              >
                Accept a Favor (Rebalance)
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setRequestFavorDialogOpen(true)}
                sx={{ py: 1.5 }}
              >
                Request Help
              </Button>
            </Grid>
          </>
        ) : balance.balance > 5 ? (
          // In credit: encourage requesting help
          <>
            <Grid item xs={12} sm={8}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                color="info"
                startIcon={<AddIcon />}
                onClick={() => setRequestFavorDialogOpen(true)}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}
              >
                Request Help (You've Earned It!)
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                startIcon={<FavorIcon />}
                onClick={() => document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ py: 1.5 }}
              >
                Browse Favors
              </Button>
            </Grid>
          </>
        ) : (
          // Balanced: neutral options
          <>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<FavorIcon />}
                onClick={() => document.getElementById('available-favors-section')?.scrollIntoView({ behavior: 'smooth' })}
                sx={{ py: 1.5 }}
              >
                Accept a Favor
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setRequestFavorDialogOpen(true)}
                sx={{ py: 1.5 }}
              >
                Request a Favor
              </Button>
            </Grid>
          </>
        )}

        {/* Secondary action: bulletin post */}
        <Grid item xs={12}>
          <Button
            variant="text"
            fullWidth
            startIcon={<BulletinIcon />}
            onClick={() => setCreateAnnouncementDialogOpen(true)}
          >
            Post an Update to Bulletin Board
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)}
```

#### 5. Consolidate Favor Sections

**Current:** Separate sections for "Available Favors" and implicitly "My Requests"

**Target:** Unified LETS interface with tabs

```typescript
{/* ============================================ */}
{/* UNIFIED LETS INTERFACE                      */}
{/* ============================================ */}
<Card id="available-favors-section" sx={{ mb: 3 }}>
  <CardContent>
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs value={letsTab} onChange={(e, v) => setLetsTab(v)}>
        <Tab label="Available Favors" icon={<Badge badgeContent={pendingFavorsCount} color="error"><FavorIcon /></Badge>} />
        <Tab label="My Active Favors" icon={<Badge badgeContent={myActiveFavorsCount} color="primary"><CheckCircleIcon /></Badge>} />
        <Tab label="Completed History" />
      </Tabs>
    </Box>

    {/* Tab content */}
    {letsTab === 0 && (
      // Available favors to accept
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          🤝 Help Your Household
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Accept a favor to earn LETS credits and support your household
        </Typography>
        {/* Favor list here */}
      </Box>
    )}

    {letsTab === 1 && (
      // My active favors (doing for others + others doing for me)
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          📋 Your Active Commitments
        </Typography>
        {/* Split into: Favors I'm doing | Favors I requested */}
      </Box>
    )}

    {letsTab === 2 && (
      // Completed history
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          ✅ Completed Favors
        </Typography>
        {/* Transaction history */}
      </Box>
    )}
  </CardContent>
</Card>
```

#### 6. Demote Secondary Sections

**Current:** Leaderboard and Bulletin have equal prominence

**Target:** Make them clearly secondary/tertiary

- Move Leaderboard below LETS interface (or remove if not essential)
- Keep Bulletin but make it smaller and collapsed by default
- Add Members section at bottom (collapsible)

```typescript
{/* Bulletin Board - Collapsed by default */}
<Card sx={{ mb: 3 }}>
  <CardContent>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h6" fontWeight={600}>
        📢 Bulletin Board
        {newPostsCount > 0 && (
          <Chip label={`${newPostsCount} new`} size="small" color="primary" sx={{ ml: 1 }} />
        )}
      </Typography>
      <IconButton onClick={() => setShowBulletin(!showBulletin)}>
        <ExpandIcon sx={{ transform: showBulletin ? 'rotate(180deg)' : 'none' }} />
      </IconButton>
    </Box>

    <Collapse in={showBulletin}>
      <Divider sx={{ my: 2 }} />
      {/* Bulletin content */}
    </Collapse>
  </CardContent>
</Card>
```

---

## Additional Changes Needed

### 1. Add `letsTab` State

```typescript
// Add near other state declarations (around line ~78)
const [letsTab, setLetsTab] = useState(0); // 0 = Available, 1 = My Active, 2 = History
```

### 2. Calculate Additional Counts

```typescript
// Add near pendingFavorsCount calculation (around line ~538)
const myActiveFavorsCount = transactions.filter((t) =>
  t.status === 'ACCEPTED' && (t.requesterId === user?.id || t.assigneeId === user?.id)
).length;
```

### 3. Update Balance API Response Type

Ensure `UserBalance` type includes:
```typescript
// In src/types/transaction.ts
export interface UserBalance {
  balance: number;
  isInDebt: boolean;
  creditsEarned?: number;
  creditsSpent?: number;
  favorsDone?: number;
  favorsReceived?: number;
  householdStats?: {
    healthScore: number;
    activeMembers: number;
  };
}
```

---

## Implementation Checklist

- [ ] Import new components at top of Templo.tsx
- [ ] Move LETS Balance to hero position (after header)
- [ ] Remove old nested LETS balance card
- [ ] Implement contextual Quick Actions
- [ ] Add tabs state (`letsTab`)
- [ ] Create unified LETS interface with tabs
- [ ] Calculate `myActiveFavorsCount`
- [ ] Demote Leaderboard section (collapse by default)
- [ ] Demote Bulletin section (collapse by default)
- [ ] Add Members section at bottom (collapsible)
- [ ] Update Balance type if needed
- [ ] Test: Balance display updates correctly
- [ ] Test: Contextual actions change based on balance
- [ ] Test: Tab navigation works
- [ ] Test: All favors still visible and actionable

---

## Visual Design Principles

### Hierarchy (Top to Bottom)
1. **THE GAME** (LETS Balance Hero) - 40% visual weight
2. **THE ACTIONS** (Contextual Quick Actions) - 20% visual weight
3. **THE GAME INTERFACE** (Unified LETS Tabs) - 30% visual weight
4. **THE CONTEXT** (Bulletin, Members, etc.) - 10% visual weight

### Color Coding
- **Debt (Red/Orange)**: "Opportunity to contribute"
- **Balance (Green)**: "Perfect equilibrium"
- **Credit (Blue)**: "You've earned support"

### Emotional Language
- Avoid: "You owe", "negative balance", "in the red"
- Use: "Your household needs you", "opportunity to help", "you've earned support"

---

## Testing Checklist

### Balance States to Test
- [ ] Severe debt (< -50): Shows urgent message, red theme
- [ ] Moderate debt (-50 to -20): Shows opportunity message, orange theme
- [ ] Slight debt (-20 to -5): Shows almost balanced, light orange
- [ ] Equilibrium (-5 to +5): Shows perfect balance, green
- [ ] Slight credit (+5 to +20): Shows positive contribution, light green
- [ ] Moderate credit (+20 to +50): Shows strong contributor, blue
- [ ] High credit (> +50): Shows community pillar, bright blue

### User Flows to Test
- [ ] User in debt can easily find and accept favors
- [ ] User in credit can easily request help
- [ ] Balanced user sees equal emphasis on both actions
- [ ] LETS hero is immediately visible on page load
- [ ] Call-to-action buttons scroll to relevant sections
- [ ] All existing functionality still works (accept, complete, decline)

---

## Success Metrics

After implementing Phase 5A, measure:
- **Time to first action**: How quickly do new users understand what to do?
- **Balance comprehension**: Do users understand debt is OK?
- **Action alignment**: Do users in debt accept favors? Do users in credit request help?
- **Visual hierarchy**: Eye-tracking or user feedback on "what's most important on this page?"

**Target:** 90% of users should immediately understand LETS is the main game, and 80% should take contextually appropriate actions based on their balance.

---

## Next Steps After Phase 5A

Once Templo redesign is complete:
- **Phase 5B**: Narrative onboarding flow (first-time user tutorial)
- **Phase 5C**: Unified rewards (chores grant LETS credits)
- **Phase 5D**: Enhanced balance visualization (animations, milestones)

---

**Status**: Ready for implementation
**Estimated Time**: 2-3 hours
**Risk Level**: Medium (significant UI refactor, but no backend changes needed)
**Rollback Plan**: Git branch for easy revert if issues arise
