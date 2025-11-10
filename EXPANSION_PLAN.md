# 🏰 KameHouse Expansion Plan - Complete Feature Set

## 🎯 Vision
Transform KameHouse into the ultimate household coordination app with beautiful UI, gamification, and localhost simplicity.

---

## 📋 Implementation Phases

### **Phase 1: Foundation - Chore Rotation System** 🔄
**Priority**: CRITICAL (most requested household feature)
**Complexity**: Medium
**Time**: 2-3 hours

**Database Models**:
```prisma
model ChoreTemplate {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  title       String
  description String?
  icon        String?
  difficulty  Int      @default(1) // 1-5
  xpReward    Int      @default(20)
  goldReward  Int      @default(10)
  letsCredit  Int      @default(5) // LETS credits for completion
  frequency   ChoreFrequency @default(WEEKLY)
  estimatedTime Int?   // minutes
  photoRequired Boolean @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  assignments ChoreAssignment[]
}

enum ChoreFrequency {
  DAILY
  WEEKLY
  BIWEEKLY
  MONTHLY
}

model ChoreAssignment {
  id           String   @id @default(uuid())
  choreId      String
  chore        ChoreTemplate @relation(fields: [choreId], references: [id])
  assignedTo   String
  user         User     @relation(fields: [assignedTo], references: [id])
  weekStarting DateTime @db.Date
  isCompleted  Boolean  @default(false)
  completedAt  DateTime?
  photoUrl     String?
  notes        String?
  swappedWith  String?  // User ID if chore was swapped
  createdAt    DateTime @default(now())

  @@unique([choreId, weekStarting, assignedTo])
}
```

**Backend Endpoints**:
- POST `/api/chores/templates` - Create chore template
- GET `/api/chores/templates/:householdId` - List templates
- POST `/api/chores/assign` - Auto-assign chores for the week
- GET `/api/chores/my-week` - Get my chores for this week
- POST `/api/chores/:id/complete` - Mark chore done
- POST `/api/chores/:id/swap` - Request chore swap

**Frontend Components**:
- `ChoreBoard.tsx` - Main chore dashboard
- `ChoreCard.tsx` - Individual chore display
- `ChoreTemplateForm.tsx` - Create/edit templates
- `SwapChoreDialog.tsx` - Swap request UI

**Beautiful UI Features**:
- Kanban-style board (To Do / In Progress / Done)
- Drag-and-drop chore swapping
- Photo upload on completion
- Confetti animation on complete
- Rotating assignment visualization

---

### **Phase 2: House Bulletin Board** 📋
**Priority**: HIGH (communication hub)
**Complexity**: Low
**Time**: 1-2 hours

**Database Models**:
```prisma
model Announcement {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  title       String
  content     String
  type        AnnouncementType @default(INFO)
  isPinned    Boolean  @default(false)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  reactions   AnnouncementReaction[]
}

enum AnnouncementType {
  INFO
  URGENT
  EVENT
  REMINDER
  POLL
}

model AnnouncementReaction {
  id             String   @id @default(uuid())
  announcementId String
  announcement   Announcement @relation(fields: [announcementId], references: [id])
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  emoji          String   // 👍 ❤️ 😂 etc.
  createdAt      DateTime @default(now())

  @@unique([announcementId, userId, emoji])
}
```

**Frontend Components**:
- `BulletinBoard.tsx` - Pinterest-style board
- `AnnouncementCard.tsx` - Individual post
- `CreateAnnouncementDialog.tsx` - New post
- `EmojiReactionBar.tsx` - React with emojis

**Beautiful UI**:
- Masonry layout (Pinterest style)
- Color-coded by type (urgent = red, event = purple)
- Animated emoji reactions
- Rich text editor for posts

---

### **Phase 3: Shared Shopping List** 🛒
**Priority**: HIGH (daily practical need)
**Complexity**: Low-Medium
**Time**: 1.5-2 hours

**Database Models**:
```prisma
model ShoppingList {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  name        String   @default("Main List")
  items       ShoppingItem[]
  createdAt   DateTime @default(now())
}

model ShoppingItem {
  id             String   @id @default(uuid())
  listId         String
  list           ShoppingList @relation(fields: [listId], references: [id])
  name           String
  quantity       Int      @default(1)
  unit           String?  // "kg", "lbs", "pack", etc.
  category       String?  // "Produce", "Dairy", etc.
  addedBy        String
  user           User     @relation(fields: [addedBy], references: [id])
  isPurchased    Boolean  @default(false)
  purchasedBy    String?
  purchaser      User?    @relation("Purchaser", fields: [purchasedBy], references: [id])
  cost           Float?
  createdAt      DateTime @default(now())
}
```

**Frontend Components**:
- `ShoppingList.tsx` - Main list view
- `AddItemDialog.tsx` - Quick add
- `ShoppingHistory.tsx` - Past purchases
- `ReceiptSplitter.tsx` - Split costs

**Beautiful UI**:
- Swipe-to-complete items
- Auto-categorization with icons
- Who added what (avatar badges)
- Receipt photo upload
- Auto-LETS credit distribution

---

### **Phase 4: Meal Planning Calendar** 🍳
**Priority**: HIGH (cooking coordination)
**Complexity**: Medium
**Time**: 2 hours

**Database Models**:
```prisma
model MealPlan {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  cookId      String
  cook        User     @relation(fields: [cookId], references: [id])
  date        DateTime @db.Date
  mealType    MealType
  recipeName  String
  servings    Int      @default(1)
  ingredients String?  // JSON array
  letsCredit  Int      @default(10) // Credits for cooking
  attendees   String[] // Array of user IDs
  notes       String?
  photoUrl    String?
  createdAt   DateTime @default(now())
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}
```

**Frontend Components**:
- `MealCalendar.tsx` - Weekly calendar view
- `MealPlanDialog.tsx` - Sign up to cook
- `RecipeCard.tsx` - Recipe display
- `DietaryPreferences.tsx` - User preferences

**Beautiful UI**:
- Calendar with meal cards
- Drag-and-drop meal planning
- Recipe photo previews
- "Who's eating?" RSVP system
- Leftover tracking

---

### **Phase 5: Team Challenges** 🏆
**Priority**: MEDIUM (gamification boost)
**Complexity**: Medium
**Time**: 2 hours

**Database Models**:
```prisma
model TeamChallenge {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  title       String
  description String
  type        ChallengeType
  goal        Int      // Target value
  currentProgress Int @default(0)
  startDate   DateTime
  endDate     DateTime
  xpReward    Int
  goldReward  Int
  gemsReward  Int
  isActive    Boolean  @default(true)
  participants ChallengeParticipant[]
  createdAt   DateTime @default(now())
}

enum ChallengeType {
  COLLECTIVE  // Whole house works together
  COMPETITIVE // Individuals compete
  COOPERATIVE // Need X% participation
}

model ChallengeParticipant {
  id          String   @id @default(uuid())
  challengeId String
  challenge   TeamChallenge @relation(fields: [challengeId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  contribution Int    @default(0)
  hasCompleted Boolean @default(false)

  @@unique([challengeId, userId])
}
```

**Frontend Components**:
- `ChallengesPage.tsx` - Active challenges
- `ChallengeCard.tsx` - Progress display
- `CreateChallengeDialog.tsx` - New challenge
- `TeamProgressBar.tsx` - Collective progress

**Beautiful UI**:
- Animated progress bars
- Countdown timers
- Leaderboard for competitive
- Confetti on team win
- Challenge badges

---

### **Phase 6: Dibs/Reservation System** 🎯
**Priority**: MEDIUM
**Complexity**: Low-Medium
**Time**: 1.5 hours

**Database Models**:
```prisma
model Resource {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  name        String   // "TV", "Washing Machine", "Parking Spot 1"
  type        ResourceType
  icon        String?
  reservations Reservation[]
  createdAt   DateTime @default(now())
}

enum ResourceType {
  APPLIANCE
  SPACE
  VEHICLE
  ENTERTAINMENT
  OTHER
}

model Reservation {
  id         String   @id @default(uuid())
  resourceId String
  resource   Resource @relation(fields: [resourceId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  startTime  DateTime
  endTime    DateTime
  purpose    String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
}
```

**Frontend Components**:
- `ResourceCalendar.tsx` - Time slot view
- `ReserveDialog.tsx` - Book resource
- `MyReservations.tsx` - User's bookings

**Beautiful UI**:
- Timeline view with color-coded blocks
- Drag to resize time slots
- Conflict detection
- Auto-cancel unused reservations

---

### **Phase 7: Expense Tracker** 💰
**Priority**: HIGH (money management)
**Complexity**: Medium
**Time**: 2 hours

**Database Models**:
```prisma
model SharedExpense {
  id          String   @id @default(uuid())
  householdId String
  household   Household @relation(fields: [householdId], references: [id])
  paidBy      String
  payer       User     @relation("ExpensePayer", fields: [paidBy], references: [id])
  amount      Float
  category    ExpenseCategory
  description String
  receiptUrl  String?
  date        DateTime @db.Date
  splits      ExpenseSplit[]
  createdAt   DateTime @default(now())
}

enum ExpenseCategory {
  GROCERIES
  UTILITIES
  RENT
  SUPPLIES
  ENTERTAINMENT
  OTHER
}

model ExpenseSplit {
  id         String   @id @default(uuid())
  expenseId  String
  expense    SharedExpense @relation(fields: [expenseId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  amount     Float
  isPaid     Boolean  @default(false)
  paidAt     DateTime?

  @@unique([expenseId, userId])
}
```

**Frontend Components**:
- `ExpenseDashboard.tsx` - Overview
- `AddExpenseDialog.tsx` - New expense
- `SplitCalculator.tsx` - Auto-split
- `SettlementPage.tsx` - Who owes who

**Beautiful UI**:
- Pie charts for categories
- Receipt photo upload
- Auto-calculate splits
- Integration with LETS balance
- Monthly summary

---

### **Phase 8: Photo Verification** 📸
**Priority**: LOW (enhancement)
**Complexity**: Medium
**Time**: 1.5 hours

**Implementation**:
- Add `photoUrl` fields to existing models
- File upload API endpoint
- Store files locally in `/uploads` folder
- Before/after photo comparisons

**Frontend Components**:
- `PhotoUpload.tsx` - Camera/upload
- `PhotoGallery.tsx` - House progress feed
- `BeforeAfterSlider.tsx` - Comparison view

---

### **Phase 9: Enhanced Gamification** ⚡
**Priority**: MEDIUM (fun factor)
**Complexity**: Low-Medium
**Time**: 2 hours

**Database Models**:
```prisma
model PowerUp {
  id          String   @id @default(uuid())
  name        String
  description String
  icon        String
  gemCost     Int
  type        PowerUpType
  duration    Int?     // minutes, if applicable
  isActive    Boolean  @default(true)
}

enum PowerUpType {
  CHORE_SWAP
  SKIP_DAY
  DOUBLE_XP
  INSTANT_COMPLETE
  REVEAL_BONUS
}

model UserPowerUp {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  powerUpId  String
  powerUp    PowerUp  @relation(fields: [powerUpId], references: [id])
  purchasedAt DateTime @default(now())
  usedAt     DateTime?
  expiresAt  DateTime?
}
```

**Features**:
- Combo multipliers
- Streak bonuses
- Power-up shop
- Seasonal events
- Special achievements

---

### **Phase 10: Polish & Mobile** 📱
**Priority**: ONGOING
**Complexity**: Medium
**Time**: Continuous

**Enhancements**:
- PWA installation prompt
- Push notifications
- Offline mode
- Dark mode
- Accessibility improvements
- Mobile-optimized layouts

---

## 🎨 Design System

### Color Palette
```typescript
const houseTheme = {
  primary: '#6366F1',      // Indigo (existing)
  secondary: '#8B5CF6',    // Purple
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue

  // Feature-specific
  chores: '#EC4899',       // Pink
  meals: '#F97316',        // Orange
  shopping: '#14B8A6',     // Teal
  bulletin: '#8B5CF6',     // Purple
  challenges: '#F59E0B',   // Gold
}
```

### Component Library
- Material-UI 7 (existing)
- Framer Motion (animations)
- React Beautiful DnD (drag-drop)
- Recharts (analytics)
- React Calendar (scheduling)

---

## 📦 File Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── chores/
│   │   ├── bulletin/
│   │   ├── shopping/
│   │   ├── meals/
│   │   ├── challenges/
│   │   ├── reservations/
│   │   ├── expenses/
│   │   └── powerups/
│   └── uploads/          // Local file storage

frontend/
├── src/
│   ├── pages/
│   │   ├── Chores.tsx
│   │   ├── Bulletin.tsx
│   │   ├── Shopping.tsx
│   │   ├── Meals.tsx
│   │   ├── Challenges.tsx
│   │   ├── Reservations.tsx
│   │   └── Expenses.tsx
│   ├── components/
│   │   ├── chores/
│   │   ├── bulletin/
│   │   └── shared/
│   └── hooks/
│       └── useHousehold.ts
```

---

## 🚀 Implementation Strategy

### Day 1: Foundation
- ✅ Design all Prisma schemas
- ✅ Create migrations
- ✅ Set up backend modules

### Day 2-3: Core Features
- Build Chore System (full stack)
- Build Bulletin Board (full stack)
- Build Shopping List (full stack)

### Day 4-5: Coordination
- Build Meal Planner (full stack)
- Build Team Challenges (full stack)

### Day 6-7: Financial & Utility
- Build Expense Tracker (full stack)
- Build Reservation System (full stack)

### Day 8: Gamification
- Build PowerUps system
- Enhanced achievements
- Combo system

### Day 9: Polish
- Photo verification
- Animations
- Mobile optimization

### Day 10: Testing
- End-to-end testing
- Family beta testing
- Bug fixes

---

## 🎯 Success Metrics

### Technical
- ✅ All features work offline-first
- ✅ No external dependencies (localhost only)
- ✅ < 3 second page loads
- ✅ Mobile responsive all pages

### User Experience
- ✅ Beautiful, intuitive UI
- ✅ < 3 clicks to complete any task
- ✅ Delightful animations
- ✅ Clear visual feedback

### Household Impact
- ✅ Reduced chore conflicts
- ✅ Better meal coordination
- ✅ Transparent finances
- ✅ Increased household harmony

---

**Ready to build?** Let's start with Phase 1: Chore Rotation System! 🚀
