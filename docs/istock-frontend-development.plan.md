<!-- cc08825a-5d71-409a-8498-505df2f7a065 d8334341-7991-4eaf-9a03-9274eac7b877 -->
# Enhanced Features & Theme System Implementation Plan

## Phase 1: Theme System (Dark/Light Mode)

### 1.1 Theme Context & Provider

- Create `apps/web/src/contexts/ThemeContext.tsx`:
  - Theme state management ('light' | 'dark' | 'system')
  - localStorage persistence for theme preference
  - System preference detection
  - Theme toggle functions
  - Provide theme state and controls to components

### 1.2 Theme Toggle Component

- Create `apps/web/src/components/theme/ThemeToggle.tsx`:
  - Button/dropdown to switch between light, dark, and system themes
  - Use lucide-react icons (Sun, Moon, Monitor)
  - Smooth theme transitions
  - Integrate into AppLayout header/sidebar

### 1.3 Dark Mode Styling

- Update `apps/web/src/index.css`:
  - Enhance dark mode CSS variables
  - Ensure all components work in both themes
  - Test color contrast and readability
  - Smooth transitions between themes

## Phase 2: Dashboard/Home Page

### 2.1 Dashboard Layout

- Create `apps/web/src/pages/Dashboard.tsx`:
  - Overview cards with key metrics
  - Recent activity feed
  - Quick action buttons
  - Statistics cards (total chats, feed optimizations, etc.)

### 2.2 Dashboard Components

- Create `apps/web/src/components/dashboard/StatsCard.tsx`:
  - Reusable stat card with icon, value, label
  - Trend indicators (up/down arrows)
  - Gradient backgrounds and modern styling

- Create `apps/web/src/components/dashboard/ActivityFeed.tsx`:
  - Recent chatbot queries
  - Recent feed optimizations
  - Clickable items to navigate to details
  - Empty state when no activity

- Create `apps/web/src/components/dashboard/QuickActions.tsx`:
  - Quick links to main features
  - Large, prominent buttons
  - Modern card-based layout

## Phase 3: Health Records Management

### 3.1 Health Records Page

- Create `apps/web/src/pages/HealthRecords.tsx`:
  - List of saved health records/chat history
  - Search and filter functionality
  - Date range filtering
  - Export to PDF/CSV functionality
  - Delete/edit records

### 3.2 Health Record Components

- Create `apps/web/src/components/health/HealthRecordCard.tsx`:
  - Display individual health record
  - Show diagnosis, date, animal type
  - Expandable details view
  - Action buttons (view, edit, delete)

- Create `apps/web/src/components/health/HealthRecordModal.tsx`:
  - Detailed view of health record
  - Full chat history
  - Sources and citations
  - Export functionality

- Create `apps/web/src/components/health/SearchBar.tsx`:
  - Search by keywords
  - Filter by date, animal type, diagnosis
  - Real-time search results

## Phase 4: Ingredient Library

### 4.1 Ingredient Library Page

- Create `apps/web/src/pages/IngredientLibrary.tsx`:
  - Saved ingredients list
  - Add/edit/delete ingredients
  - Categories/tags for ingredients
  - Import/export ingredient lists
  - Search and filter saved ingredients

### 4.2 Ingredient Library Components

- Create `apps/web/src/components/ingredients/IngredientCard.tsx`:
  - Display ingredient details (name, price, nutrition)
  - Quick actions (use, edit, delete)
  - Visual nutrition indicators

- Create `apps/web/src/components/ingredients/IngredientForm.tsx`:
  - Reusable form for adding/editing ingredients
  - Validation with Zod
  - Save to library functionality

- Create `apps/web/src/components/ingredients/IngredientSelector.tsx`:
  - Multi-select component for choosing saved ingredients
  - Quick add to feed optimizer
  - Categories/tags filtering

## Phase 5: Settings Page

### 5.1 Settings Page

- Create `apps/web/src/pages/Settings.tsx`:
  - Profile settings (email, role, preferences)
  - Theme settings (light/dark/system)
  - Notification preferences
  - Data management (export, clear history)
  - About/help section

### 5.2 Settings Components

- Create `apps/web/src/components/settings/SettingsSection.tsx`:
  - Reusable settings section wrapper
  - Consistent styling and layout

- Create `apps/web/src/components/settings/ProfileSettings.tsx`:
  - Edit user profile
  - Change password (if needed)
  - Account preferences

- Create `apps/web/src/components/settings/DataManagement.tsx`:
  - Export all data option
  - Clear chat history
  - Clear saved ingredients
  - Export feed optimization history

## Phase 6: Enhanced Features

### 6.1 Export Functionality

- Create `apps/web/src/lib/export.ts`:
  - Export chat history to PDF
  - Export feed results to CSV/PDF
  - Export ingredient library
  - Utility functions for data formatting

- Add export buttons to relevant pages:
  - Chatbot: Export conversation
  - Feed Optimizer: Export results
  - Health Records: Bulk export

### 6.2 Notifications System

- Create `apps/web/src/contexts/NotificationContext.tsx`:
  - Toast notification system
  - Success, error, warning, info types
  - Auto-dismiss functionality
  - Notification history

- Create `apps/web/src/components/ui/toast.tsx` (shadcn/ui):
  - Toast component for notifications
  - Position options (top-right, bottom-right)
  - Animations

### 6.3 Search & Filter Enhancements

- Global search component
- Search across all records
- Advanced filtering options
- Saved search filters

### 6.4 Statistics & Analytics

- Create `apps/web/src/components/analytics/Chart.tsx`:
  - Simple chart component for feed cost trends
  - Usage statistics visualization
  - Activity graphs

- Add analytics to dashboard:
  - Feed cost trends over time
  - Chat usage patterns
  - Most common health queries

## Phase 7: UI/UX Enhancements

### 7.1 Loading States

- Create skeleton loaders for all pages
- Improve loading indicators
- Smooth transitions between states

### 7.2 Empty States

- Create EmptyState component
- Add helpful messages and actions
- Illustrations/icons for empty states

### 7.3 Tooltips & Help

- Add tooltips to complex features
- Help icons with explanations
- Keyboard shortcuts display

### 7.4 Responsive Improvements

- Enhanced mobile experience
- Tablet-optimized layouts
- Better touch targets

## Phase 8: Integration & Polish

### 8.1 Navigation Updates

- Add new routes to AppLayout navigation
- Update routing in App.tsx
- Add icons for new pages
- Update active state handling

### 8.2 Data Persistence

- Enhance localStorage management
- Add data versioning
- Migration utilities for future updates

### 8.3 Error Handling

- Global error boundary
- Better error messages
- Error recovery suggestions

### 8.4 Performance

- Optimize re-renders
- Lazy loading for heavy components
- Code splitting considerations

## New Routes to Add

- `dashboard` - Home/Overview page
- `health-records` - Health records management
- `ingredients` - Ingredient library
- `settings` - Settings and preferences

## Components to Create

1. ThemeContext & ThemeToggle
2. Dashboard page and components
3. HealthRecords page and components
4. IngredientLibrary page and components
5. Settings page and components
6. Toast/Notification system
7. Export utilities
8. Analytics/Chart components
9. Empty states and loading skeletons

## Files Structure

```
apps/web/src/
  ├── contexts/
  │   ├── ThemeContext.tsx (new)
  │   └── NotificationContext.tsx (new)
  ├── pages/
  │   ├── Dashboard.tsx (new)
  │   ├── HealthRecords.tsx (new)
  │   ├── IngredientLibrary.tsx (new)
  │   └── Settings.tsx (new)
  ├── components/
  │   ├── theme/ (new)
  │   ├── dashboard/ (new)
  │   ├── health/ (new)
  │   ├── ingredients/ (new)
  │   ├── settings/ (new)
  │   ├── analytics/ (new)
  │   └── ui/
  │       └── toast.tsx (new)
  └── lib/
      └── export.ts (new)
```

### To-dos

- [ ] Create ThemeContext with dark/light/system modes, localStorage persistence, and theme toggle component
- [ ] Build Dashboard page with stats cards, activity feed, and quick actions
- [ ] Create HealthRecords page with search, filter, and export functionality
- [ ] Build IngredientLibrary page with save/edit/delete ingredients and categories
- [ ] Create Settings page with profile, theme, notifications, and data management options
- [ ] Implement export utilities for PDF/CSV generation for chats, feed results, and records
- [ ] Create NotificationContext and toast components for user feedback
- [ ] Add analytics components with charts for feed costs, usage statistics, and trends
- [ ] Update AppLayout and App.tsx to include new routes (dashboard, health-records, ingredients, settings)
- [ ] Add loading skeletons, empty states, tooltips, and improve responsive design