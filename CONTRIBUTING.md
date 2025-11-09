# Contributing to KameHouse

Thank you for your interest in contributing to KameHouse! This guide will help you get started.

---

## 🌟 Development Philosophy

KameHouse uses the **Guardian Council** - specialized AI agents that collaborate on different aspects of development. This approach ensures:
- **Specialized expertise** in each domain
- **Consistent quality** across the codebase
- **Clear ownership** of features
- **Collaborative development** that scales

See [.claude/agents/README.md](./.claude/agents/README.md) for full Guardian Council documentation.

---

## 🚀 Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/kamehouse.git
cd kamehouse
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3. Set Up Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit .env and configure:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET
# - FRONTEND_URL
```

### 4. Initialize Database

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 5. Start Development Servers

```bash
# Terminal 1: Backend (http://localhost:3000)
cd backend
npm run start:dev

# Terminal 2: Frontend (http://localhost:5173)
cd frontend
npm run dev
```

---

## 🤝 Contribution Workflow

### Step 1: Pick or Create an Issue

- Browse [GitHub Issues](https://github.com/coomunity/kamehouse/issues)
- Look for issues tagged `good first issue` or `help wanted`
- Or create a new issue describing your feature/fix

### Step 2: Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/habit-completion-animation`
- `fix/streak-calculation-bug`
- `docs/api-documentation`
- `refactor/auth-module`

### Step 3: Invoke the Appropriate Guardian

Based on your task, invoke the relevant Guardian agent:

| Task Type | Guardian | Example |
|-----------|----------|---------|
| React component | **ARIA** | "ARIA: Create HabitCard component" |
| API endpoint | **CRONOS** | "CRONOS: Add GET /api/habits endpoint" |
| Write tests | **SAGE** | "SAGE: Test habit completion flow" |
| Documentation | **KIRA** | "KIRA: Document habits API" |
| Design system | **EUNOIA** | "EUNOIA: Create level badge variant" |
| Infrastructure | **ATLAS** | "ATLAS: Set up CI/CD pipeline" |
| Complex feature | **ANA** | "ANA: Implement achievement system" |

See [Guardian Council Guide](./.claude/agents/README.md) for detailed agent documentation.

### Step 4: Implement with Tests

**All contributions must include tests:**

```bash
# Frontend component example
src/features/habits/components/HabitCard.tsx
src/features/habits/components/__tests__/HabitCard.test.tsx

# Backend service example
src/modules/habits/habits.service.ts
src/modules/habits/habits.service.spec.ts
```

**Coverage requirements:**
- New code: >80% coverage
- Critical paths (auth, gamification): >95% coverage

Run tests:
```bash
# Frontend
cd frontend
npm run test
npm run test:coverage

# Backend
cd backend
npm run test:cov
```

### Step 5: Follow Code Style

**Frontend (React + TypeScript):**
```typescript
// Components: PascalCase
const HabitCard: React.FC<HabitCardProps> = ({ habit, onComplete }) => {
  // ...
};

// Hooks: camelCase with 'use' prefix
const useHabits = () => {
  // ...
};

// Constants: SCREAMING_SNAKE_CASE
const MAX_HABIT_TITLE_LENGTH = 100;
```

**Backend (NestJS + TypeScript):**
```typescript
// Controllers: PascalCase with suffix
@Controller('habits')
export class HabitsController {
  // ...
}

// Services: PascalCase with suffix
@Injectable()
export class HabitsService {
  // ...
}

// DTOs: PascalCase with suffix
export class CreateHabitDto {
  // ...
}
```

**Run linters:**
```bash
# Frontend
cd frontend
npm run lint

# Backend
cd backend
npm run lint
```

### Step 6: Document Your Changes

**Update relevant documentation:**
- API changes → `docs/api/`
- New features → Update `README.md`
- Complex logic → JSDoc comments in code
- User-facing changes → User guide updates

### Step 7: Commit with Clear Messages

```bash
git add .
git commit -m "feat: Add habit completion animation

- Create pulse animation on habit complete
- Add confetti effect for streaks >7 days
- Update HabitCard component
- Add tests for animation triggers

Implements #42"
```

**Commit message format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

### Step 8: Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Create a PR with:
- **Clear title**: "feat: Add habit completion animation"
- **Description**: What does this PR do? Why?
- **Guardian notes**: Which guardians were involved?
- **Testing**: How was this tested?
- **Screenshots**: If UI changes, include before/after
- **Closes**: Reference issue number (e.g., "Closes #42")

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Guardian Collaboration
Which guardians worked on this?
- [ ] ARIA (Frontend)
- [ ] CRONOS (Backend)
- [ ] SAGE (Testing)
- [ ] KIRA (Docs)
- [ ] Other: _______

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Coverage >80%
- [ ] Manual testing performed

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Builds successfully

## Screenshots (if applicable)
(Before/After screenshots for UI changes)

## Related Issues
Closes #42
```

### Step 9: Address Review Feedback

- Be responsive to review comments
- Make requested changes
- Re-request review when ready
- Be patient and respectful

---

## 📋 Quality Standards

### Code Quality
- ✅ TypeScript strict mode
- ✅ No ESLint errors
- ✅ Meaningful variable names
- ✅ Proper error handling
- ✅ JSDoc comments for public APIs

### Testing
- ✅ >80% code coverage
- ✅ Unit tests for logic
- ✅ Integration tests for API endpoints
- ✅ E2E tests for critical user flows
- ✅ Accessibility tests (a11y)

### Documentation
- ✅ Code comments for complex logic
- ✅ API documentation for new endpoints
- ✅ User guide updates for new features
- ✅ Guardian collaboration notes

### Accessibility
- ✅ WCAG 2.2 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios met
- ✅ Focus indicators visible

### Performance
- ✅ Frontend: Lighthouse score >90
- ✅ Backend: API response <200ms (p95)
- ✅ No memory leaks
- ✅ Optimized database queries

---

## 🎨 Design Guidelines

Follow the **Sacred Geometry** design system:

### Spacing
Use Fibonacci-based spacing:
```typescript
const spacing = { xs: 8, sm: 13, md: 21, lg: 34, xl: 55, xxl: 89 };
```

### Colors
Use theme colors from `src/theme/theme.ts`:
```typescript
theme.palette.primary.main    // Indigo
theme.palette.secondary.main  // Pink
theme.palette.success.main    // Green
theme.palette.warning.main    // Amber
theme.palette.error.main      // Red
```

### Typography
Golden ratio typography scale:
```typescript
h1: 2.618rem
h2: 2rem
h3: 1.618rem
body1: 1rem (line-height: 1.618)
```

See [EUNOIA's design guide](./.claude/agents/eunoia.md) for full details.

---

## 🐛 Reporting Bugs

### Before Reporting
1. Search existing issues
2. Verify it's reproducible
3. Test on latest `main` branch

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- Browser: Chrome 120
- OS: macOS 14
- Node: 20.10
- KameHouse version: 0.1.0

## Screenshots
(If applicable)

## Additional Context
Any other relevant information
```

---

## 💡 Suggesting Features

### Feature Request Template
```markdown
## Feature Description
What feature do you want?

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other solutions did you consider?

## User Stories
- As a [user type], I want to [action] so that [benefit]

## Design Mockups
(If applicable)

## Additional Context
Any other relevant information
```

---

## 🏆 Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Credited in commit history

Significant contributors may be invited to:
- Join the core team
- Help shape product direction
- Participate in architectural decisions

---

## ❓ Questions?

- **General questions**: Open a [GitHub Discussion](https://github.com/coomunity/kamehouse/discussions)
- **Bug reports**: Open an [Issue](https://github.com/coomunity/kamehouse/issues)
- **Security issues**: Email security@coomunity.com (do not open public issue)
- **Guardian Council**: See [.claude/agents/README.md](./.claude/agents/README.md)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to KameHouse! Together, we're making household cooperation fun and rewarding. 🏠✨**
