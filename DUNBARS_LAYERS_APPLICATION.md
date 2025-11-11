# Dunbar's Layers Application to KameHouse

## Executive Summary

This document applies human-scale game design research from "Prácticas de diseño para juegos en línea a escala humana" (Project Horseshoe 2018) to KameHouse's LETS reciprocity game and household dynamics.

**Key Findings:**
- Optimal household size: **50±18 members** (good friends layer)
- Expected concurrent friends: **5-7 members online**
- Recommended max without hierarchy: **150 members**
- LETS activities should scale across trust levels

---

## 1. Dunbar's Layers Overview

### Relationship Layers

| Layer | Size | Type | Time Investment | Trust Level | Support Type |
|-------|------|------|----------------|-------------|--------------|
| **Layer 1** | 1.5 | Intimate partner | Continuous | Highest | Everything |
| **Layer 2** | 5 | Intimate friends | 200+ hours | Very High | Crisis support |
| **Layer 3** | 15 | Best friends | 90-110 hours | High | Sympathy support |
| **Layer 4** | 50 | Good friends | 40-60 hours | Medium | Emotional/economic |
| **Layer 5** | 150 | Casual friends | 10-40 hours | Low-Medium | Information sharing |
| **Layer 6** | 500 | Acquaintances | Variable | Low | Recognition only |

### Friendship Formation Requirements

**4 Key Ingredients:**
1. **Proximity**: Regular interaction frequency
2. **Similarity**: Perceived shared values/interests
3. **Reciprocity**: Mutual exchange cycles
4. **Disclosure**: Safe vulnerability sharing

**Time to Friendship:**
- Casual friend: 40-60 hours
- Good friend: 90-110 hours
- Best friend: 200+ hours

---

## 2. Household Size Recommendations

### Tier System Based on Dunbar's Layers

#### Tier 1: Small House (2-7 members)
- **Dunbar Layer**: Intimate friends (Layer 2)
- **Characteristics**:
  - Highest possible trust
  - Crisis-level support capability
  - All members know each other deeply
  - Minimal governance needed
- **Use Cases**: Nuclear families, roommates, very close friend groups
- **LETS Activities**: All trust levels supported
- **Concurrency**: 1-3 friends online typically

#### Tier 2: Medium House (8-20 members)
- **Dunbar Layer**: Best friends (Layer 3)
- **Characteristics**:
  - Very high trust
  - Sympathy and emotional support
  - Most members know each other well
  - Light coordination needed
- **Use Cases**: Extended families, close-knit communities, intentional communities
- **LETS Activities**: Medium-high trust favors work well
- **Concurrency**: 2-4 friends online typically

#### Tier 3: Large House (21-68 members) ⭐ **RECOMMENDED DEFAULT**
- **Dunbar Layer**: Good friends (Layer 4)
- **Characteristics**:
  - Medium trust baseline
  - Natural self-organizing size
  - Most stable configuration
  - Diverse skills/resources
  - Moderate coordination needed
- **Use Cases**: Neighborhoods, co-ops, large extended families, intentional communities
- **LETS Activities**: All types work with proper trust matching
- **Concurrency**: 5-7 friends online typically (optimal for multiplayer activities)
- **Why Recommended**:
  - Research shows 50±18 is most stable natural group size
  - Best balance of diversity and cohesion
  - Sufficient concurrency for engaging activities
  - Self-organizing without heavy governance

#### Tier 4: Clan House (69-200 members)
- **Dunbar Layer**: Casual friends (Layer 5)
- **Characteristics**:
  - Variable trust levels
  - Requires formal structure/hierarchy
  - Sub-groups naturally form
  - Active governance essential
- **Use Cases**: Large co-housing, communes, villages, organizational units
- **LETS Activities**: Needs trust layers and sub-group features
- **Concurrency**: 7-20 friends online
- **Requirements**:
  - Sub-group/circle feature
  - Elected/appointed coordinators
  - Formal rules and policies
  - Dispute resolution system

### Recommended Configuration

**Default Limits:**
- **Minimum**: 2 members (requires at least one other person)
- **Soft Maximum**: 65 members (UI prompts about governance at 50+)
- **Hard Maximum**: 200 members (technical limit, requires clan features)

**Rationale:**
- 50±18 (32-68) is the "sweet spot" for human-scale cooperation
- Groups >150 require formal hierarchy (unnecessary complexity for MVP)
- Focus on deep relationships over scale aligns with LETS philosophy

---

## 3. Concurrency Analysis

### Expected Friend Availability

Using formulas from research with KameHouse parameters:

**Assumptions:**
- Household size: 50 members (recommended tier)
- Social time share: 50% (user spends half social time in KameHouse)
- Concurrency ratio: 10:1 (highly social app)
- Friends in household: 50 (all members)

**Calculations:**

```
Friends online now = (Friends in household × Social time share) / Concurrency ratio
                   = (50 × 0.5) / 10
                   = 2.5 friends online on average
```

**Distribution by Layer:**
- Intimate friends online: ~0.3 (rarely all online together)
- Best friends online: ~0.8 (1 best friend online occasionally)
- Good friends online: ~2.5 (2-3 good friends online typically)
- Casual friends online: ~7.5 (7-8 casual friends online)

### Design Implications

1. **Core LETS activities should support 2-5 concurrent players**
2. **Asynchronous features are essential** (most friends offline)
3. **Notification system critical** to alert when specific friends come online
4. **Scheduling tools needed** for activities requiring 3+ specific people
5. **Trust-matching important** (don't require best friend trust from casual friends)

---

## 4. LETS Activity Trust Mapping

### Activity Categories by Trust Level

#### Low Trust (Casual Friends - Strangers)
**Characteristics:**
- Low cost of rejection
- Observable/verifiable
- Clear boundaries
- Quick completion
- 1-10 LETS credits

**Examples:**
- Share a recipe
- Recommend a product
- Answer a quick question
- Like/comment on bulletin post
- Share a link/article
- Rate a local business
- Give a compliment
- Share a parking spot
- Lend a book for 1 week

**Design Pattern:**
- Opening: Simple request
- Opportunity: Easy to say yes/no
- Response: Quick action
- Acknowledgment: Automatic credit transfer

#### Medium Trust (Good Friends)
**Characteristics:**
- Moderate cost of rejection
- Time investment: 15 min - 2 hours
- May require planning
- Some vulnerability
- 10-50 LETS credits

**Examples (Current System):**
- Grocery shopping help
- Ride to appointment
- Babysitting for 2 hours
- Help with moving furniture
- Cook a meal
- Dog walking for a day
- Tech support visit
- Garden help (3 hours)
- Event planning assistance

**Design Pattern:**
- Opening: Detailed request with time/date
- Opportunity: Negotiation possible
- Response: Confirmed commitment
- Acknowledgment: Manual completion + review

#### High Trust (Best Friends - Intimate)
**Characteristics:**
- High cost of rejection (relationship damage)
- Significant time: 2+ hours or ongoing
- Requires deep trust
- Vulnerability/sensitivity
- 50-200 LETS credits
- May be reciprocal by nature (not transactional)

**Examples:**
- Emergency crisis support
- Overnight pet/child care
- Major life event help (wedding, funeral)
- Emotional support during difficulty
- Long-term mentorship
- Share living space temporarily
- Significant financial advice
- Medical appointment accompaniment
- Weekly meal prep partnership

**Design Pattern:**
- Opening: Personal request with context
- Opportunity: Requires relationship history check
- Response: High commitment signal
- Acknowledgment: May not require LETS credits (beyond economy)

### Trust Level Detection

**Automatic Indicators:**
1. **Interaction time**: Track total hours of completed favors between two members
   - <40 hours = Casual
   - 40-90 hours = Good
   - 90-200 hours = Best
   - 200+ hours = Intimate
2. **Reciprocity rate**: Mutual favor completion percentage
3. **Response time**: How quickly they respond to each other
4. **Favor acceptance rate**: Percentage of accepted requests
5. **Disclosure level**: Use of "private favor" vs "public favor" feature

**UI Implementation:**
- Show "friendship level" badge on member profiles
- Filter favors by recommended trust level
- Warn when requesting high-trust favor from low-trust connection
- Celebrate friendship milestones

---

## 5. Reciprocity Loop Design

### Current LETS Flow Audit

**Existing Pattern:**
1. **Opening**: User creates favor request → Costs: time to write, vulnerability
2. **Opportunity**: Other members see request → Can accept/ignore
3. **Response**: Member accepts favor → Costs: time commitment, credits (debt)
4. **Acknowledgment**: Requester marks complete → Credits transfer

**Status**: ✅ Good foundation, follows reciprocity pattern

### Recommended Enhancements

#### 1. Add Consent Mechanisms
- **Before Opening**: "Are you sure you want to request this? It will be visible to [X members]"
- **Before Response**: Show requester's trust level and reciprocity history
- **Before Acknowledgment**: "Confirm [Name] completed this favor to your satisfaction"

#### 2. Support Escalation & Rejection
- **Escalation**: Allow favor acceptor to request higher payment (negotiation)
- **Rejection Handling**:
  - "Not interested" (silent, no notification)
  - "Can't right now" (suggests alternative time)
  - "Need more info" (opens dialogue)

#### 3. Add Loop Variations
- **Counter-offer**: "I can do X instead of Y for Z credits"
- **Partial completion**: "I can do half of this now"
- **Bundling**: "I'll do this if you also need [related favor]"

#### 4. Reduce Rejection Cost
- Make ignoring a request non-visible (no "seen by" feature)
- Allow anonymous "I'd help but can't because..." feedback
- Suggest alternative helpers automatically

---

## 6. Group Trust Development

### Tuckman's Stages Applied to Households

#### Forming (Week 1-2)
**What's Happening:**
- Members just joined
- Learning names, roles, norms
- Politeness, testing boundaries

**KameHouse Features:**
- Ice breaker prompts on bulletin board
- "Get to know you" favor suggestions
- Member introduction cards
- Household charter creation tool

#### Storming (Week 3-6)
**What's Happening:**
- Conflicts emerge from different norms
- Frustration with pace/style
- Power dynamics surface

**KameHouse Features:**
- Conflict resolution tools
- Anonymous feedback to coordinators
- Norm negotiation threads
- Expectation alignment workshops

#### Norming (Week 7-12)
**What's Happening:**
- Shared norms establish
- Trust increases
- Collaboration improves

**KameHouse Features:**
- Codify household norms in settings
- Celebrate trust milestones
- Unlock high-trust favors
- Create household traditions

#### Performing (Month 4+)
**What's Happening:**
- High trust achieved
- Complex coordinated tasks possible
- Organic self-organization

**KameHouse Features:**
- Advanced favor types available
- Household projects (multi-week goals)
- External reputation building
- Mentoring new households

### Measuring Trust Development

**Household Health Score (0-100):**

```typescript
type HouseholdHealth = {
  stage: 'forming' | 'storming' | 'norming' | 'performing';
  score: number; // 0-100
  metrics: {
    avgRelationshipAge: number; // days
    favorCompletionRate: number; // percentage
    reciprocityBalance: number; // std deviation of balances
    interactionDistribution: number; // % members with >3 interactions
    conflictResolutionRate: number; // resolved / total conflicts
  };
  recommendations: string[];
};
```

**Calculation:**
- **Forming**: Age <30 days, completion rate >50% → Score: 25-45
- **Storming**: Age 30-90 days, completion rate >60%, conflicts present → Score: 46-65
- **Norming**: Age 90-180 days, completion rate >75%, low conflict → Score: 66-85
- **Performing**: Age >180 days, completion rate >85%, high interaction → Score: 86-100

---

## 7. Implementation Roadmap

### Phase 1: Backend - Household Size Constraints (Week 1)

**Files to Modify:**
- `backend/prisma/schema.prisma`: Add size tier enum and validation
- `backend/src/modules/household/household.service.ts`: Add size validation logic
- `backend/src/modules/household/household.controller.ts`: Add tier endpoints

**Changes:**
```prisma
enum HouseholdSizeTier {
  SMALL    // 2-7
  MEDIUM   // 8-20
  LARGE    // 21-68
  CLAN     // 69-200
}

model Household {
  // ... existing fields
  sizeTier      HouseholdSizeTier @default(LARGE)
  maxMembers    Int                @default(65)
  memberCount   Int                @default(0)
}
```

### Phase 2: Frontend - Household Health Metrics (Week 2)

**Files to Create:**
- `frontend/src/lib/household-health-api.ts`: API client for health metrics
- `frontend/src/components/HouseholdHealthCard.tsx`: Visual health display

**Files to Modify:**
- `frontend/src/pages/Templo.tsx`: Add health card above LETS balance

**Features:**
- Visual health score (0-100)
- Stage indicator (forming/storming/norming/performing)
- Recommendations list
- Trust development progress

### Phase 3: LETS Trust Levels (Week 3-4)

**Files to Create:**
- `frontend/src/components/TrustBadge.tsx`: Show friendship level
- `frontend/src/components/FavorTrustFilter.tsx`: Filter by trust level

**Files to Modify:**
- `backend/src/modules/favors/favor.entity.ts`: Add `trustLevel` field
- `frontend/src/pages/Marketplace.tsx`: Show trust indicators

**Features:**
- Label favors by trust level (Low/Medium/High)
- Show friendship level on member profiles
- Filter marketplace by compatible trust level
- Warn when trust mismatch detected

### Phase 4: Friendship Tracking (Week 5-6)

**Files to Create:**
- `backend/src/modules/relationships/relationships.module.ts`: New module
- `backend/src/modules/relationships/relationship.entity.ts`: Track friendship time
- `frontend/src/components/FriendshipMilestone.tsx`: Celebration modal

**Features:**
- Track interaction time between members
- Calculate friendship level (casual/good/best/intimate)
- Show relationship history timeline
- Celebrate milestones (40h, 90h, 200h)

### Phase 5: Concurrency Optimization (Week 7-8)

**Files to Modify:**
- `backend/src/modules/favors/favors.service.ts`: Add async scheduling
- `frontend/src/components/FavorScheduler.tsx`: New component

**Features:**
- Schedule favors for specific times
- Notify when target friend comes online
- Show "best time to request" suggestions
- Support asynchronous favor completion

---

## 8. Success Metrics

### Household Health Metrics
- Average household stage progression (target: 90 days to norming)
- Percentage of households reaching "performing" stage
- Average household health score by size tier

### Relationship Metrics
- Distribution of relationships across Dunbar's Layers
- Average time to reach each friendship level
- Reciprocity balance (target: std dev <30 credits)

### Engagement Metrics
- Favor completion rate by trust level
- Average concurrent friends during active sessions
- Percentage of members with >3 active relationships

### LETS Economy Metrics
- Transaction velocity (credits exchanged per week)
- Balance distribution (target: normal distribution around 0)
- Favor acceptance rate by trust match quality

---

## 9. Key Insights from Research

### What Makes KameHouse Different

**Traditional Social Apps:**
- Focus on weak ties (acquaintances)
- Scale to millions
- Shallow interactions
- FOMO-driven engagement

**KameHouse (Human-Scale):**
- Focus on strong ties (close friends)
- Scale to 50-200 max
- Deep reciprocal interactions
- Trust-driven engagement

### Core Design Principles

1. **Small is Beautiful**: 50±18 members is optimal, not a limitation
2. **Trust Takes Time**: 40-200 hours to build real friendship
3. **Async First**: Most friends offline most of the time
4. **Match Trust to Task**: Don't ask casual friends for intimate favors
5. **Reciprocity is Universal**: All humans understand give-and-take
6. **Transparency Builds Trust**: Show balances, history, patterns
7. **Celebrate Progress**: Acknowledge relationship milestones

### Anti-Patterns to Avoid

❌ **Don't**: Optimize for viral growth
✅ **Do**: Optimize for relationship depth

❌ **Don't**: Hide failures and rejections
✅ **Do**: Normalize "no" and make rejection low-cost

❌ **Don't**: Force synchronous activities
✅ **Do**: Design for asynchronous collaboration

❌ **Don't**: Allow households >200 without governance
✅ **Do**: Require structure and hierarchy at scale

❌ **Don't**: Treat all relationships equally
✅ **Do**: Scale features to appropriate Dunbar's Layer

---

## 10. Next Steps

### Immediate Actions

1. ✅ **This Document**: Create strategic analysis ← YOU ARE HERE
2. **Backend Schema**: Add household size tiers and constraints
3. **Templo Enhancement**: Add household health card
4. **Trust Labels**: Add trust level to favor types
5. **Documentation**: Update main roadmap with Dunbar's principles

### Future Enhancements

- Friendship formation tracking and milestones
- Advanced reciprocity loop features (negotiation, escalation)
- Sub-group/circle features for households >50
- Household stage guidance (forming → performing)
- Relationship timeline and history visualization

---

## Conclusion

Applying Dunbar's Layers to KameHouse reveals that our current architecture is well-aligned with human-scale design principles. The LETS reciprocity game naturally maps to friendship formation through **reciprocity** (one of the four key ingredients).

**Key Recommendation**: Focus on the **50±18 member household** as the optimal configuration. This size:
- Supports enough concurrency for engaging activities (5-7 friends online)
- Allows diverse skills and resources
- Maintains self-organizing cooperation without heavy governance
- Aligns with the "good friends" layer where economic support naturally happens

By implementing the trust-level mapping and household health metrics, we can guide users toward deeper, more meaningful relationships rather than shallow, transactional interactions.

**The goal is not to scale to millions of users, but to help thousands of small communities thrive.**

---

**Document Version**: 1.0
**Date**: 2025-11-10
**Based On**: "Prácticas de diseño para juegos en línea a escala humana" (Project Horseshoe 2018)
**Author**: KameHouse Development Team
