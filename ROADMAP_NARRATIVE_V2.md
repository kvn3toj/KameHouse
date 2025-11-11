# KameHouse: The Equilibrium of Reciprocity

## The Story We're Building

KameHouse is a **cooperative household game** where the core mechanic is the **equilibrium of reciprocity**—the natural human dance of giving and receiving, helping and being helped. Through the LETS (Local Exchange Trading System) economy, we gamify the ancient practice of mutual aid and make visible the invisible threads of support that bind communities together.

---

## The Core Game: LETS Reciprocity Loop

### The Game Mechanic

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  REQUEST FAVOR  →  ACCEPT FAVOR  →  COMPLETE FAVOR  │
│        ↓               ↓                  ↓          │
│   I need help    I can help you    Credits transfer │
│   (-credits)     (+credits)         Balance shifts  │
│        ↑               ↑                  ↑          │
│  └─────────────────────────────────────────┘        │
│                EQUILIBRIUM SEEKING                   │
│           (Everyone gravitates toward 0)             │
└──────────────────────────────────────────────────────┘
```

**The Goal**: Not to accumulate credits, but to **maintain equilibrium**
- Positive balance = You've given more → Opportunity to receive
- Negative balance = You've received more → Opportunity to give
- Zero balance = Perfect reciprocity → Harmony achieved

**The Insight**: In a healthy household, balances naturally oscillate around zero as members continuously exchange support. The game is won when **everyone's needs are met** through **mutual aid**, not when anyone "gets ahead."

---

## User Journey: From Stranger to Family

### Act 1: Discovery & Forming (Week 1-2)

**Player State**: New member, curious but cautious

#### Scene 1: First Login
- **Welcome Modal**: "Welcome to your Templo! This is where your household thrives together."
- **LETS Onboarding**: Learn about mutual credit, see balance at 0, understand debt is OK
- **Ice Breaker**: "Share your superpower! What can you help others with?"

#### Scene 2: First Request
- **Tutorial Quest**: "Request your first favor! Try something small like 'Share a recipe' or 'Recommend a movie'"
- **Low Stakes**: Start with **low-trust activities** (10 credits or less)
- **Social Proximity**: See other members' profiles, learn names, find similarities

**Emotional Arc**: Curiosity → Tentative participation → First connection

**Dunbar's Layer**: Moving from stranger (500+) to acquaintance (150-500)

**Household Stage**: **Forming** — Learning norms, testing boundaries

---

### Act 2: Engagement & Storming (Week 3-6)

**Player State**: Active participant, building routines

#### Scene 3: Building Reciprocity
- **Acceptance**: Accept someone else's favor request
- **First Debt**: Balance goes negative (first time)
  - **System Message**: "You're in debt! That's perfect—LETS allows this. Now you can accept favors to balance out."
- **Pattern Recognition**: Notice the rhythm of give-and-take

#### Scene 4: Trust Development
- **Medium-Trust Activities Unlock**: After 40 hours interaction → "You and Sarah are now good friends! You can request bigger favors."
- **Negotiation**: Use counter-offers and scheduling for complex favors
- **Conflict**: Experience rejection or misalignment
  - **System Support**: "Not everyone can help right now. Try asking someone else or adjusting the timing."

**Emotional Arc**: Routine → Trust building → Navigating conflicts → Resilience

**Dunbar's Layer**: Casual friend (150) → Good friend (50)

**Household Stage**: **Storming** — Different expectations surface, norms being negotiated

---

### Act 3: Deepening & Norming (Week 7-12)

**Player State**: Trusted member, emotionally invested

#### Scene 5: Friendship Milestones
- **90-Hour Mark**: "You and Alex are now best friends! You've collaborated for 90+ hours."
- **High-Trust Activities Unlock**: Crisis support, emotional labor, significant time commitments (50-200 credits)
- **Household Traditions**: Participate in recurring events (weekly dinners, movie nights)

#### Scene 6: Household Health
- **Norming Stage Reached**: System celebrates: "Your household is norming! Shared expectations are emerging."
- **Health Score Visible**: See household at 75/100 health
- **Contributions Recognized**: Achievement unlocked: "Pillar of the Community" (100 favors completed)

**Emotional Arc**: Belonging → Pride → Commitment → Deep care

**Dunbar's Layer**: Good friend (50) → Best friend (15)

**Household Stage**: **Norming** — Shared norms established, trust solidified

---

### Act 4: Mastery & Performing (Month 4+)

**Player State**: Household elder, mentor to new members

#### Scene 7: Advanced Cooperation
- **Complex Projects**: Multi-week household goals (garden renovation, group vacation planning)
- **Mentorship**: Help onboard new members, share LETS philosophy
- **Autonomy**: Household self-organizes without needing central coordination

#### Scene 8: Equilibrium Achieved
- **Balance Oscillation**: Player's balance swings naturally -50 to +50, always returning to equilibrium
- **Mastery**: Understand that debt and credit are just "taking turns" in a perpetual dance
- **Meta-Game**: Focus shifts from individual balance to **household harmony score**

**Emotional Arc**: Mastery → Stewardship → Transcendence (focus beyond self)

**Dunbar's Layer**: Best friend (15) → Intimate friend (5)

**Household Stage**: **Performing** — High-trust collaboration, seamless coordination

---

## Simplified Architecture

### Three Core Spaces

```
┌─────────────────────────────────────────────────────────┐
│                    KAMEHOUSE UNIVERSE                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │    HOME     │  │   TEMPLO    │  │      ME      │   │
│  │  Dashboard  │  │  Household  │  │   Personal   │   │
│  │   (Daily)   │  │    (Hub)    │  │    (Self)    │   │
│  └─────────────┘  └─────────────┘  └──────────────┘   │
│                                                         │
│        ↓               ↓                 ↓              │
│                                                         │
│  📊 My Today     🏛️ THE GAME      👤 My Growth         │
│  • Habits        • LETS Balance   • Achievements       │
│  • Tasks         • Favors         • Habits             │
│  • Summary       • Members        • Profile            │
│                  • Bulletin       • Settings           │
│                  • Chores                              │
│                  • Health                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### The Templo: Game Center

**What it is**: The sacred household center where the LETS reciprocity game unfolds

**Core Elements**:

1. **LETS Balance Card** ← THE GAME STATE
   - Current balance: -50 to +50 (typical oscillation)
   - Visual progress bar showing position
   - Context message: "You're in debt—accept favors to balance!"
   - Transaction summary: Credits earned vs spent
   - Onboarding: Explain LETS principles

2. **Marketplace Tab** ← THE GAME ACTIONS (Request/Accept)
   - Browse available favor requests from household
   - Filter by trust level (Low/Medium/High)
   - Accept favors → Earn credits, help others
   - Track active commitments

3. **My Favors Tab** ← THE GAME PROGRESS
   - Create new favor requests → Spend credits, get help
   - Track your requests: Pending, Active, Completed
   - Mark favors complete → Transfer credits
   - Review history

4. **Members Tab** ← THE GAME PLAYERS
   - See household roster
   - View trust levels (casual/good/best friend)
   - Check individual balance (optional: anonymous mode)
   - Send direct favor requests

5. **Household Health Card** ← THE GAME METASCORE
   - Overall health: 0-100
   - Stage: Forming/Storming/Norming/Performing
   - Recommendations: "Host an event to build trust"
   - Trust development progress

6. **Bulletin Board Tab** ← THE GAME SOCIAL
   - Announcements and updates
   - Discussion threads
   - Event planning
   - Household culture building

### The Home: Personal Dashboard

**What it is**: Your daily command center, personal to you

**Core Elements**:
- **Habit tracker**: Personal rituals and routines
- **Task list**: Private to-dos
- **Today's summary**: Habits completed, tasks done, favors pending
- **Quick actions**: Create favor, log habit, view household

### The Me: Personal Growth

**What it is**: Your private space for self-reflection and identity

**Core Elements**:
- **Achievements**: Unlocked through LETS participation
- **Habit history**: Long-term trends
- **Profile settings**: Preferences, notifications
- **Relationship map**: Friendship levels with each member

---

## Game Progression System

### Levels of Mastery

#### Level 1: Newcomer (Week 1-2)
**Unlocked:**
- Low-trust favors (1-10 credits)
- Basic bulletin board access
- View household members

**Goals:**
- Complete first favor request
- Accept first favor
- Reach 10 total interactions

**Achievements:**
- "First Steps" — Request your first favor
- "Helping Hand" — Complete your first favor
- "Neighbor" — Meet all household members

---

#### Level 2: Contributor (Week 3-6)
**Unlocked:**
- Medium-trust favors (10-50 credits)
- Favor scheduling
- Counter-offers and negotiation
- Bulletin board posting

**Goals:**
- Reach 40 hours total interaction (good friend with someone)
- Complete 25 favors
- Maintain balance between -30 and +30

**Achievements:**
- "Good Neighbor" — 25 favors completed
- "Trusted Friend" — Reach good friend level with 3 people
- "Balanced" — Maintain -20 to +20 balance for 2 weeks

---

#### Level 3: Pillar (Week 7-12)
**Unlocked:**
- High-trust favors (50-200 credits)
- Multi-day project coordination
- Mentor role for new members
- Household event creation

**Goals:**
- Reach 90 hours with someone (best friend)
- Complete 100 favors
- Help household reach "norming" stage

**Achievements:**
- "Pillar of the Community" — 100 favors completed
- "Best Friend" — 90+ hours with someone
- "Harmonizer" — Help achieve household health >75

---

#### Level 4: Elder (Month 4+)
**Unlocked:**
- Complex multi-week projects
- Household governance participation
- Cross-household connections (future feature)
- Mentorship program access

**Goals:**
- Reach 200 hours with someone (intimate friend)
- Complete 250 favors
- Help household reach "performing" stage

**Achievements:**
- "Elder" — 250 favors, 6+ months in household
- "Soul Friend" — 200+ hours with someone
- "Household Harmony" — Health score >90 for 4 weeks

---

## Game Balance: The Equilibrium Algorithm

### How The System Self-Balances

```typescript
// Household Equilibrium Metrics
type EquilibriumState = {
  averageBalance: number;        // Should be ~0 (sum is always 0)
  balanceStdDev: number;         // Target: <30 credits
  transactionVelocity: number;   // Credits/week (higher = more active)
  reciprocityRate: number;       // % of debts repaid within 30 days
  concentrationRisk: number;     // Gini coefficient (0 = equal, 1 = concentrated)
};

// Healthy household targets:
// - averageBalance: 0 (mathematical guarantee)
// - balanceStdDev: 15-30 (natural oscillation)
// - transactionVelocity: 50-200 credits/week for 50-person household
// - reciprocityRate: >80% (most debts get paid back)
// - concentrationRisk: <0.3 (not dominated by a few members)
```

### Natural Balancing Mechanisms

1. **Debt Creates Opportunity**: When you're in debt, you're motivated to accept favors
2. **Credit Creates Generosity**: When you have surplus, you can afford to request help
3. **Social Pressure**: Extreme balances become visible and prompt action
4. **Time Decay**: Very old debts/credits get gentle reminders
5. **Trust Limits**: Can't request >100 credit favor if you're at -80 balance

### Anti-Gaming Measures

- **No hoarding**: High positive balance gives diminishing returns (can't unlock anything)
- **No bankruptcy**: Negative balances don't limit participation (by design)
- **Transparency**: All transactions visible to household (builds trust, prevents exploitation)
- **Trust matching**: Can't request high-trust favor from low-trust connection
- **Completion required**: Credits don't transfer until work is confirmed done

---

## Technical Implementation Phases

### ✅ Phase 1-3: Foundation (COMPLETED)
- User authentication
- Household creation/joining
- Basic LETS balance tracking
- Favor request/accept/complete flow
- Achievements system
- Dashboard and Templo views

### ✅ Phase 4A-4B: Navigation & Polish (COMPLETED)
- Templo as centerpiece
- LETS balance visualization with progress bars
- LETS onboarding education
- MeDrawer and HouseSettingsDrawer
- Mobile-first navigation (3-tab)
- Desktop navigation (Templo + Achievements + Drawers)

### 🔄 Phase 5: Dunbar's Layers Integration (IN PROGRESS)
**Goal**: Apply human-scale design principles

**Backend Changes**:
- Add household size tiers (Small/Medium/Large/Clan)
- Add size validation (max 200 members)
- Create household health metrics API
- Track member-to-member interaction time

**Frontend Changes**:
- Add Household Health Card to Templo
- Show household stage (forming/storming/norming/performing)
- Display recommendations for trust building
- Add size tier indicator

**Duration**: 2 weeks

---

### 📋 Phase 6: Trust Levels & Friendship (NEXT)
**Goal**: Match activities to appropriate relationship depth

**Backend Changes**:
- Add favor trust level field (Low/Medium/High)
- Create relationships table (track interaction time)
- Calculate friendship levels automatically
- Add friendship milestone events

**Frontend Changes**:
- Show trust level badge on all favors
- Add TrustBadge component to member profiles
- Filter marketplace by compatible trust level
- Celebrate friendship milestones (40h, 90h, 200h)
- Add "friendship level" to member cards

**New Components**:
- `TrustBadge.tsx`: Visual indicator of relationship depth
- `FriendshipMilestone.tsx`: Celebration modal
- `RelationshipTimeline.tsx`: History visualization

**Duration**: 3 weeks

---

### 📋 Phase 7: Advanced Reciprocity Features (FUTURE)
**Goal**: Richer negotiation and interaction patterns

**Features**:
- Favor scheduling (pick specific date/time)
- Counter-offers and negotiation
- Bundled favors (I'll do X if you do Y)
- Recurring favors (weekly meal prep partnership)
- Multi-person favors (need 3 people for moving day)
- Favor templates (save common requests)

**Duration**: 4 weeks

---

### 📋 Phase 8: Household Stages & Guidance (FUTURE)
**Goal**: Support groups through Tuckman's stages

**Features**:
- Stage-specific onboarding
- Forming: Ice breakers, introductions
- Storming: Conflict resolution tools, norm discussion
- Norming: Codify household rules, celebration
- Performing: Advanced projects, mentorship
- Automated recommendations based on stage

**Duration**: 3 weeks

---

### 📋 Phase 9: Chore Garden Visualization (FUTURE)
**Goal**: Gamify household maintenance with visual metaphor

**Concept**: Shared household as a garden that members tend together
- Each chore = plant that needs care
- Completed chore = plant blooms
- Neglected chore = plant wilts
- Collective maintenance = thriving garden

**Duration**: 4 weeks

---

### 📋 Phase 10: Household Harmony Garden (FUTURE)
**Goal**: Visualize relationship health and reciprocity

**Concept**: Each member-to-member relationship is a plant
- New relationship = seedling
- Active reciprocity = watered, grows
- Milestone reached = flowers/fruit
- Neglected relationship = wilts
- Household harmony = beautiful garden

**Duration**: 4 weeks

---

## Success Metrics: How We Know It's Working

### Player-Level Metrics

**Engagement:**
- Daily active users (DAU): >60% of household
- Weekly favor participation: >80% of members
- Average session length: 10-15 minutes
- Return rate after 30 days: >70%

**Progression:**
- Time to first favor requested: <24 hours
- Time to first favor completed: <3 days
- Time to good friend (40h): 4-8 weeks
- Time to best friend (90h): 3-6 months

**Balance:**
- Average balance: 0 (mathematical guarantee)
- Balance std deviation: 15-30 credits
- % of members with balance -50 to +50: >80%
- Reciprocity rate (debts repaid): >80%

### Household-Level Metrics

**Health:**
- Average household health score: 65-85
- % of households reaching norming stage: >60%
- % of households reaching performing stage: >30%
- Time to norming stage: 6-12 weeks

**Social Fabric:**
- Average friendship level distribution:
  - Casual friends (40h): 80% of pairs
  - Good friends (90h): 40% of pairs
  - Best friends (200h): 15% of pairs
- Average concurrent online friends: 5-7
- % of members with >3 active relationships: >70%

**Economy:**
- Transaction velocity: 50-200 credits/week (50-person household)
- Favor completion rate: >85%
- Average favor value: 15-30 credits
- % of favors matched to correct trust level: >80%

---

## Design Principles: Our North Star

### 1. Reciprocity is Sacred
Every feature should reinforce the give-and-take cycle. Avoid one-way flows.

### 2. Transparency Builds Trust
Make balances, transactions, and patterns visible. Sunlight is the best disinfectant.

### 3. Debt is Opportunity
Negative balance is not failure—it's an invitation to receive help and restore equilibrium.

### 4. Small is Beautiful
Optimize for 50±18 members, not millions. Deep relationships > shallow connections.

### 5. Trust Takes Time
Respect Dunbar's Layers. Don't ask casual friends for intimate favors.

### 6. Async First
Design for the reality that most friends are offline most of the time.

### 7. Celebrate Progress
Acknowledge milestones, growth, and harmony achieved.

### 8. No Winners or Losers
The goal is collective thriving, not individual accumulation.

---

## The Vision: Where We're Going

### Year 1: Household Mastery
- 1,000 households actively using KameHouse
- 50,000 total users across all households
- 90% of households reaching "norming" stage
- 100,000+ favors completed monthly
- Average household health score: 75/100

### Year 2: Network Effects
- Cross-household connections (lending between households)
- Regional "festivals" (multi-household events)
- Shared resource library (tools, equipment)
- Mentorship program (experienced households help new ones)

### Year 3: Global Movement
- 10,000 households worldwide
- Multi-language support
- Research partnerships studying mutual aid
- Open-source LETS engine for other communities
- Documentary: "The Households That Thrived"

---

## Conclusion: The Game We're Playing

KameHouse is not about points, levels, or status. It's about **equilibrium**—the natural human dance of giving and receiving. The LETS reciprocity game makes this dance visible, measurable, and joyful.

**We win when**:
- Balances oscillate around zero
- Trust deepens over time
- Needs are met through mutual aid
- Households reach the "performing" stage
- Members say "I couldn't imagine life without this community"

**The ultimate achievement**:
Not a full credit balance, but a full heart. Not independence, but **interdependence**. Not winning alone, but **thriving together**.

---

**"The goal is not to accumulate, but to circulate. Not to hoard, but to flow. Not to win, but to belong."**

---

**Roadmap Version**: 2.0 (Narrative Edition)
**Date**: 2025-11-10
**Core Game**: Equilibrium of Reciprocity
**Philosophy**: Human-Scale Cooperation through LETS Mutual Credit
