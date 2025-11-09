# 🏠 KameHouse

> **Gamified household task cooperation.** Turn chores into quests, habits into XP, and daily tasks into achievements.

Inspired by **Duolingo's** engagement patterns and **Yousician's** skill progression, KameHouse makes household cooperation fun, rewarding, and trackable.

---

## ✨ Features

### MVP (v0.1.0)
- **Habit Tracking**: Build positive habits, break negative ones with +/- buttons
- **Daily Tasks**: Simple todo checklist with calendar integration
- **Gamification System**: Earn XP, level up, track health, collect gold and gems
- **Streak Tracking**: Build momentum with daily streaks and streak bonuses
- **User Profiles**: Avatar, stats, level badge, and gamification dashboard

### Future Phases
- **Achievement System**: Unlock badges and special rewards
- **Shop & Equipment**: Purchase items, customize avatar, unlock power-ups
- **Attributes System**: STR, INT, CON, PER - RPG-style character progression
- **Social Features**: Leaderboards, household teams, challenge friends
- **Seasonal Events**: Limited-time quests and exclusive items

---

## 🎮 Philosophy

KameHouse is built on three core principles:

1. **Progress Visibility**: Every completed task shows tangible progress (XP, gold, streaks)
2. **Positive Reinforcement**: Celebrate wins, forgive mistakes, encourage comebacks
3. **Household Cooperation**: Make shared tasks feel like shared adventures

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20 or higher
- **PostgreSQL** 16 or higher
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/coomunity/kamehouse.git
cd kamehouse

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your DATABASE_URL

# Run database migrations
cd backend
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### Development

```bash
# Terminal 1: Start backend API (port 3000)
cd backend
npm run start:dev

# Terminal 2: Start frontend dev server (port 5173)
cd frontend
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 📁 Project Structure

```
KameHouse/
├── frontend/              # React 19 + Vite + TypeScript PWA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── features/      # Feature modules (habits, gamification)
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── services/      # API client
│   │   ├── theme/         # Material-UI theme (Sacred Geometry)
│   │   └── types/         # TypeScript types
│   └── package.json
│
├── backend/               # NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, users, habits)
│   │   ├── common/        # Shared utilities, guards, interceptors
│   │   └── prisma.service.ts
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
├── .claude/               # Guardian Council AI agents
│   └── agents/            # Specialized development agents
│       ├── aria.md        # Frontend & UX
│       ├── cronos.md      # Backend & APIs
│       ├── sage.md        # Testing & QA
│       ├── atlas.md       # DevOps & Infrastructure
│       ├── kira.md        # Documentation
│       ├── eunoia.md      # Design System
│       └── ana.md         # Orchestration
│
├── docs/                  # Documentation
│   ├── planning/          # Planning documents
│   ├── architecture/      # Architecture diagrams
│   └── api/               # API documentation
│
└── README.md              # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Lightning-fast build tool
- **Material-UI 7** - Component library with Sacred Geometry theming
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state and caching
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **PWA** - Offline support and installability

### Backend
- **NestJS 11** - Scalable Node.js framework
- **Prisma 6** - Modern ORM with type safety
- **PostgreSQL 16** - Reliable relational database
- **JWT** - Secure authentication
- **class-validator** - DTO validation
- **bcrypt** - Password hashing

### Testing
- **Vitest** - Fast unit testing
- **Playwright** - E2E testing
- **Jest** - Backend testing
- **Testing Library** - React component testing

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel** - Frontend deployment (planned)
- **Railway** - Backend deployment (planned)

---

## 🎨 Design System

KameHouse is built on **Sacred Geometry** principles:

- **Golden Ratio (φ = 1.618)**: Typography scale, layout proportions
- **Fibonacci Sequence**: Spacing scale (8, 13, 21, 34, 55, 89)
- **Harmonious Colors**: Intentional color relationships
- **Natural Motion**: Smooth, purposeful animations

See [EUNOIA's design guide](./.claude/agents/eunoia.md) for full details.

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test              # Run all tests
npm run test:ui           # Visual test UI
npm run test:coverage     # Coverage report

# Backend tests
cd backend
npm run test              # Unit tests
npm run test:cov          # Coverage report
npm run test:e2e          # E2E tests
```

**Coverage targets:**
- Overall: 80% minimum
- Critical paths (auth, gamification): 95%

---

## 🤝 Contributing

KameHouse uses the **Guardian Council** for development - specialized AI agents that handle different aspects of the project.

### Development Workflow

1. **Pick a feature** from GitHub Issues or create one
2. **Invoke the appropriate Guardian** (see `.claude/agents/README.md`)
3. **Implement with tests** - All features must have >80% test coverage
4. **Document** - Update API docs and user guides
5. **Create PR** - Include Guardian collaboration notes

### Guardian Quick Reference

| Guardian | Specialty | Invoke For |
|----------|-----------|------------|
| **ARIA** | Frontend & UX | React components, Material-UI, animations |
| **CRONOS** | Backend & APIs | NestJS modules, Prisma schemas, endpoints |
| **SAGE** | Testing & QA | Tests, coverage, quality assurance |
| **ATLAS** | DevOps | CI/CD, deployment, infrastructure |
| **KIRA** | Documentation | READMEs, API docs, user guides |
| **EUNOIA** | Design System | Theme, components, visual harmony |
| **ANA** | Orchestration | Complex features, coordination |

See [Guardian Council Guide](./.claude/agents/README.md) for full details.

---

## 📚 Documentation

- **[Architecture](./docs/architecture/)** - System design and patterns
- **[API Reference](./docs/api/)** - Backend API documentation
- **[Guardian Council](./.claude/agents/README.md)** - AI agent collaboration guide
- **[Design System](./.claude/agents/eunoia.md)** - Sacred Geometry and theming

---

## 🗺️ Roadmap

### Phase 1: Core Habits & Gamification (MVP) ✅ *Current*
- [x] Project setup and architecture
- [ ] User authentication (JWT)
- [ ] Habit tracking system (CRUD)
- [ ] Daily tasks (todo list)
- [ ] Gamification (XP, levels, streaks)
- [ ] User dashboard

### Phase 2: Social & Achievements
- [ ] Achievement system
- [ ] Leaderboards (daily, weekly, monthly)
- [ ] Household teams
- [ ] Friend challenges

### Phase 3: Shop & Customization
- [ ] Item marketplace
- [ ] Avatar customization
- [ ] Equipment system with bonuses
- [ ] Inventory management

### Phase 4: Advanced Features
- [ ] Attributes system (STR, INT, CON, PER)
- [ ] Seasonal events
- [ ] Quest system (beyond daily tasks)
- [ ] Mobile apps (React Native)

---

## 🏆 Credits

### Inspiration
- **Duolingo** - Streak mechanics and daily engagement patterns
- **Yousician** - Progressive skill development
- **Habitica** - Gamified habit tracking (reference screenshots)

### Built by CoomUnity Ecosystem
KameHouse is an **independent project** using the CoomUnity Guardian Council and design philosophy.

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🌟 Vision

> *"Every household task is an opportunity for growth. Every habit completed is a step toward a better life. KameHouse makes progress visible, cooperation fun, and transformation achievable."*

**Welcome home. Time to level up. 🏠✨**

---

**Questions?** Open an issue or check the [Guardian Council](./.claude/agents/README.md).
**Want to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md).
