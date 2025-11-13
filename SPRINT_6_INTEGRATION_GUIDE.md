# Sprint 6: Frontend Integration Guide

**Purpose:** Step-by-step guide to integrate all 6 Sprint 6 frontend components into the KameHouse application.

**Date:** November 12, 2025
**Status:** Components Ready - Integration Pending

---

## 📋 Component Integration Checklist

- [ ] CategoryManager - Add to Household Settings
- [ ] TagInput - Add to Task Editor
- [ ] TagFilter - Add to Task List
- [ ] RoomTemplatesLibrary - Add to Room Dashboard
- [ ] TaskHistoryTimeline - Add to Task Details
- [ ] BulkOperationsDialog - Add to Room Dashboard

---

## 1. CategoryManager Integration

### Location
**File:** `frontend/src/pages/HouseholdSettings.tsx` (create if doesn't exist)
**Alternative:** Add new tab in Room Dashboard

### Implementation

```typescript
// Import
import { CategoryManager } from '../components/Categories/CategoryManager';

// Add state
const [currentTab, setCurrentTab] = useState(0);

// In render (inside Tabs component)
<Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
  <Tab label="General" />
  <Tab label="Members" />
  <Tab label="Categories" /> {/* NEW */}
</Tabs>

{currentTab === 2 && (
  <Box sx={{ mt: 3 }}>
    <CategoryManager householdId={household.id} />
  </Box>
)}
```

### Features Enabled
- Create/edit/delete categories
- Visual icon and color selection
- Category ordering
- Task count display
- Category statistics

---

## 2. TagInput Integration

### Location
**File:** `frontend/src/components/TaskEditor.tsx`

### Implementation

```typescript
// Import
import { TagInput } from './Tags/TagInput';

// Add state
const [selectedTags, setSelectedTags] = useState<string[]>([]);

// In form (after description field)
<TagInput
  householdId={householdId}
  selectedTags={selectedTags}
  onChange={setSelectedTags}
/>

// In submit handler
const taskData = {
  ...formData,
  tagIds: selectedTags, // Add tags to submission
};
```

### Features Enabled
- Autocomplete tag selection
- Inline tag creation
- Color-coded tag chips
- Multi-select functionality

---

## 3. TagFilter Integration

### Location
**File:** `frontend/src/components/TaskList.tsx`

### Implementation

```typescript
// Import
import { TagFilter } from './Tags/TagFilter';

// Add state
const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

// Filter tasks by tags
const filteredTasks = tasks.filter(task => {
  if (selectedTagIds.length === 0) return true;
  return task.tags?.some(t => selectedTagIds.includes(t.tagId));
});

// In render (above task list)
<TagFilter
  householdId={householdId}
  selectedTagIds={selectedTagIds}
  onChange={setSelectedTagIds}
  showHeader={true}
/>

<TaskList tasks={filteredTasks} />
```

### Features Enabled
- Visual tag filtering
- Multi-select tags
- Color-coded chips
- Clear all button
- Collapsible interface

---

## 4. RoomTemplatesLibrary Integration

### Location
**File:** `frontend/src/pages/RoomDashboard.tsx`

### Implementation

```typescript
// Import
import { RoomTemplatesLibrary } from '../components/RoomTemplates/RoomTemplatesLibrary';
import { LibraryBooks as TemplateIcon } from '@mui/icons-material';

// Add state
const [showTemplates, setShowTemplates] = useState(false);

// Add button to header
<Button
  variant="outlined"
  startIcon={<TemplateIcon />}
  onClick={() => setShowTemplates(true)}
>
  Room Templates
</Button>

// Add dialog/drawer
<Dialog
  open={showTemplates}
  onClose={() => setShowTemplates(false)}
  maxWidth="lg"
  fullWidth
>
  <DialogContent>
    <RoomTemplatesLibrary
      householdId={room.householdId}
      onTemplateApplied={(roomId) => {
        setShowTemplates(false);
        navigate(`/kamehouse/rooms/${roomId}`);
      }}
    />
  </DialogContent>
</Dialog>
```

### Alternative: Add to Main Rooms Page

```typescript
// In Rooms.tsx (list of all rooms)
<Box sx={{ mb: 3 }}>
  <Button
    variant="contained"
    startIcon={<TemplateIcon />}
    onClick={() => setShowTemplates(true)}
  >
    Browse Room Templates
  </Button>
</Box>

<RoomTemplatesLibrary
  householdId={householdId}
  onTemplateApplied={handleRefresh}
/>
```

### Features Enabled
- Browse system and user templates
- Search templates
- Preview template details
- One-click room creation
- Save current room as template

---

## 5. TaskHistoryTimeline Integration

### Location
**File:** `frontend/src/components/TaskDetails.tsx` (or create modal/drawer)

### Implementation

#### Option A: As Tab in Task Details

```typescript
// Import
import { TaskHistoryTimeline } from './TaskHistory/TaskHistoryTimeline';
import { History as HistoryIcon } from '@mui/icons-material';

// Add state
const [currentTab, setCurrentTab] = useState(0);

// In render
<Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
  <Tab label="Details" icon={<InfoIcon />} />
  <Tab label="History" icon={<HistoryIcon />} />
</Tabs>

{currentTab === 1 && (
  <TaskHistoryTimeline
    taskId={task.id}
    showTaskTitle={false}
  />
)}
```

#### Option B: As Expandable Section

```typescript
// Import
import { TaskHistoryTimeline } from './TaskHistory/TaskHistoryTimeline';
import { ExpandMore as ExpandIcon } from '@mui/icons-material';

// Add state
const [showHistory, setShowHistory] = useState(false);

// In render (after task details)
<Accordion
  expanded={showHistory}
  onChange={() => setShowHistory(!showHistory)}
>
  <AccordionSummary expandIcon={<ExpandIcon />}>
    <Typography>Task History</Typography>
  </AccordionSummary>
  <AccordionSummary>
    <TaskHistoryTimeline
      taskId={task.id}
      showTaskTitle={false}
      limit={20}
    />
  </AccordionSummary>
</Accordion>
```

### Features Enabled
- Complete audit trail
- Visual timeline with icons
- User attribution
- Change visualization
- Relative timestamps

---

## 6. BulkOperationsDialog Integration

### Location
**File:** `frontend/src/pages/RoomDashboard.tsx`

### Implementation

```typescript
// Import
import { BulkOperationsDialog } from '../components/BulkOperations/BulkOperationsDialog';
import { LibraryAddCheck as BulkIcon } from '@mui/icons-material';

// Add state
const [showBulkOps, setShowBulkOps] = useState(false);
const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

// Add selection to TaskList
<TaskList
  tasks={tasks}
  onSelectionChange={setSelectedTaskIds}
  selectionMode={true}
/>

// Add button to header (show when tasks selected)
{selectedTaskIds.length > 0 && (
  <Button
    variant="contained"
    startIcon={<BulkIcon />}
    onClick={() => setShowBulkOps(true)}
  >
    Bulk Actions ({selectedTaskIds.length})
  </Button>
)}

// Add dialog
<BulkOperationsDialog
  open={showBulkOps}
  onClose={() => setShowBulkOps(false)}
  householdId={room.householdId}
  selectedTaskIds={selectedTaskIds}
  onComplete={() => {
    setShowBulkOps(false);
    setSelectedTaskIds([]);
    loadRoomData(); // Refresh
  }}
/>
```

### Features Enabled
- Multi-task selection
- Bulk status updates
- Bulk assignment
- Bulk rescheduling
- Bulk tag operations
- Bulk category changes
- Progress tracking
- Error reporting

---

## 🔧 Additional Modifications

### 1. Update TaskList Component

Add selection mode support:

```typescript
// In TaskList.tsx
interface TaskListProps {
  tasks: Task[];
  onSelectionChange?: (ids: string[]) => void;
  selectionMode?: boolean;
}

// Add state
const [selected, setSelected] = useState<string[]>([]);

// Add selection handler
const handleToggleSelect = (taskId: string) => {
  const newSelected = selected.includes(taskId)
    ? selected.filter(id => id !== taskId)
    : [...selected, taskId];

  setSelected(newSelected);
  onSelectionChange?.(newSelected);
};

// Add checkbox to each task card
{selectionMode && (
  <Checkbox
    checked={selected.includes(task.id)}
    onChange={() => handleToggleSelect(task.id)}
  />
)}
```

### 2. Update TaskEditor Component

Add tag support to form:

```typescript
// Add to form data interface
interface TaskFormData {
  // ... existing fields
  tagIds?: string[];
  categoryId?: string;
}

// Update API call
const createTask = async (data: TaskFormData) => {
  const response = await api.post(`/rooms/${roomId}/tasks`, data);

  // Add tags if selected
  if (data.tagIds && data.tagIds.length > 0) {
    await Promise.all(
      data.tagIds.map(tagId =>
        api.post(`/tags/task/${response.data.id}/add`, { tagId })
      )
    );
  }

  return response.data;
};
```

### 3. Add Category Selection

```typescript
// Import
import { MenuItem, Select } from '@mui/material';

// Fetch categories
const [categories, setCategories] = useState([]);

useEffect(() => {
  const loadCategories = async () => {
    const response = await api.get(`/categories?householdId=${householdId}`);
    setCategories(response.data);
  };
  loadCategories();
}, [householdId]);

// In form
<FormControl fullWidth>
  <InputLabel>Category</InputLabel>
  <Select
    value={formData.categoryId || ''}
    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
  >
    <MenuItem value="">
      <em>None</em>
    </MenuItem>
    {categories.map(cat => (
      <MenuItem key={cat.id} value={cat.id}>
        {cat.icon} {cat.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

---

## 📱 Responsive Considerations

### Mobile Optimization

1. **CategoryManager**
   - Grid: 1 column on mobile
   - Dialogs: Full screen

2. **TagFilter**
   - Collapsible by default on mobile
   - Horizontal scroll for tags

3. **RoomTemplatesLibrary**
   - Full screen dialog on mobile
   - Stack cards vertically

4. **TaskHistoryTimeline**
   - Compact timeline dots
   - Shorter date formats

5. **BulkOperationsDialog**
   - Stepper with mobile-friendly navigation
   - Larger touch targets

---

## 🎨 Theme Integration

All components use Material-UI's `useTheme()` and will automatically adapt to:
- Light/Dark mode
- Custom color palettes
- Typography scales
- Spacing system

Ensure your theme includes Sprint 6 color definitions:

```typescript
// In theme.ts
const theme = createTheme({
  palette: {
    // Sprint 6 uses these standard palette colors
    primary: { ... },
    success: { ... },
    error: { ... },
    warning: { ... },
  },
});
```

---

## 🔐 Authentication

All components require:
1. `useAuth()` hook for JWT token
2. Household membership verification
3. Error handling for 401/403 responses

Components handle authentication internally, but ensure:

```typescript
// In AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 📊 Analytics Integration (Optional)

Track Sprint 6 feature usage:

```typescript
// Example analytics events
analytics.track('category_created', { householdId, categoryName });
analytics.track('tag_applied', { taskId, tagId });
analytics.track('bulk_operation_executed', { operation, taskCount });
analytics.track('template_applied', { templateId, roomType });
analytics.track('history_viewed', { taskId });
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Create category with icon and color
- [ ] Reorder categories
- [ ] Create tag and assign to task
- [ ] Filter tasks by tag
- [ ] Create room from template
- [ ] View task history timeline
- [ ] Execute bulk operation on multiple tasks
- [ ] Verify all changes reflect in database

### Integration Testing

- [ ] Category assignment to tasks persists
- [ ] Tag filtering works across rooms
- [ ] Template application creates all tasks
- [ ] History entries created for all actions
- [ ] Bulk operations handle errors gracefully

### Edge Cases

- [ ] Empty states for all components
- [ ] Error handling for API failures
- [ ] Loading states during async operations
- [ ] Permission checks work correctly
- [ ] Mobile responsiveness

---

## 🚀 Deployment Steps

1. **Verify Backend**
   ```bash
   curl http://localhost:3000/api/categories
   ```
   Should return status 200 (even if empty array)

2. **Install Dependencies** (if any new)
   ```bash
   cd frontend
   npm install
   ```

3. **Build Frontend**
   ```bash
   npm run build
   ```

4. **Test Production Build**
   ```bash
   npm run preview
   ```

5. **Deploy**
   Follow your normal deployment process

---

## 📝 Documentation Updates Needed

1. **User Guide**
   - Add section on Categories
   - Add section on Tags
   - Add section on Room Templates
   - Add section on Bulk Operations
   - Add section on Task History

2. **Developer Docs**
   - API endpoints documentation
   - Component API documentation
   - Integration examples

3. **Changelog**
   ```markdown
   ## Sprint 6: Advanced Room Features (v2.0.0)

   ### New Features
   - Task Categories system for organization
   - Tag system for flexible labeling
   - Task History with complete audit trail
   - Room Templates for quick setup
   - Bulk Operations for efficiency
   - Room Analytics dashboard
   - Room Archiving functionality

   ### API Changes
   - Added 37 new endpoints
   - All endpoints require JWT authentication
   - Added household membership verification
   ```

---

## 💡 Best Practices

1. **Error Handling**
   ```typescript
   try {
     await api.post('/categories', data);
   } catch (error) {
     if (error.response?.status === 403) {
       showError('You don\'t have permission to perform this action');
     } else {
       showError('Failed to create category. Please try again.');
     }
   }
   ```

2. **Loading States**
   ```typescript
   const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
     setLoading(true);
     try {
       await performAction();
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Optimistic Updates**
   ```typescript
   // Update UI immediately
   setTasks([...tasks, newTask]);

   // Then sync with server
   try {
     await api.post('/tasks', newTask);
   } catch (error) {
     // Revert on failure
     setTasks(tasks);
     showError('Failed to create task');
   }
   ```

---

## 🔄 Migration Path

If you have existing data without Sprint 6 features:

1. **Categories**: Existing tasks will have `categoryId: null`
2. **Tags**: Tasks will have empty `tags[]` array
3. **History**: Start recording from integration date
4. **Templates**: No migration needed (start fresh)

No breaking changes to existing functionality.

---

## 🎯 Success Metrics

Track these KPIs post-integration:

- Category usage rate
- Average tags per task
- Template application rate
- Bulk operation usage
- History view frequency

---

## 🆘 Troubleshooting

### Component not rendering
- Check import path is correct
- Verify component is exported
- Check for TypeScript errors

### API errors
- Verify backend is running
- Check JWT token is valid
- Confirm household membership

### State not updating
- Check state setter is called
- Verify useEffect dependencies
- Check for console errors

---

## 📞 Support

For issues or questions:
1. Check `SPRINT_6_TEST_REPORT.md` for API examples
2. Review component source code for props/usage
3. Check backend logs for errors
4. Verify database schema is up to date

---

**Last Updated:** November 12, 2025
**Status:** Ready for Integration
**Components:** 6/6 Ready
**Backend:** 37/37 Endpoints Operational
