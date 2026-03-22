# Detail Display Components

Shared components for displaying structured detail information consistently across the application.

## Overview

The detail-display component library provides a flexible system for rendering lists of structured information (cast, crew, organizing team, awards, etc.) with consistent styling and behavior.

## Components

### DetailSection

Top-level component that renders a titled card containing a list of detail entries.

```tsx
import {DetailSection} from './components/detail-display';

<DetailSection
  section={{
    title: "Cast",
    items: [
      {text: "John Doe", value: "Lead Actor"},
      {text: "Jane Smith", value: "Supporting Role"}
    ]
  }}
  variant="role"
/>
```

### DetailList

Renders a list of detail entries with variant-based styling.

```tsx
import {DetailList} from './components/detail-display';

<DetailList
  items={[
    {text: "Director", value: "Ahmed Ali"},
    {text: "Producer", value: "Sara Mohamed"}
  ]}
  variant="default"
/>
```

### DetailListItem

Renders individual list items. Usually used internally by DetailList.

```tsx
<DetailListItem
  item={{text: "Award", value: "Best Director", link: "https://..."}}
  variant="default"
  depth={0}
/>
```

## Variants

The components support three display variants:

### `role` - Role Highlighting
- Gold text color (`theatre-gold-500`)
- Bold font weight
- Used for: Cast, Crew, Organizing Team
- Special treatment at depth 0 for primary roles

```tsx
<DetailSection
  section={{title: "Cast", items: cast}}
  variant="role"
/>
```

### `default` - Standard List
- Standard bullet points
- Primary colors
- Used for: Awards, Jury List
- Generic information display

```tsx
<DetailSection
  section={{title: "Awards", items: awards}}
  variant="default"
/>
```

### `text` - Plain Text
- No bullet points
- Minimal styling
- Used for: Descriptions, Additional Info
- Paragraph-style content

```tsx
<DetailSection
  section={{title: "Additional Information", items: extraDetails}}
  variant="text"
/>
```

## Data Structure

### DetailEntry Type

```typescript
type DetailEntry = {
  text: string;                    // Required: Display text/label
  value?: string | string[];       // Optional: Associated value(s)
  children?: DetailEntry[];        // Optional: Nested entries
  link?: string;                   // Optional: External link URL
};
```

### Examples

**Simple Entry**
```typescript
{
  text: "Director",
  value: "Ahmed Ali"
}
```

**Entry with Link**
```typescript
{
  text: "Official Website",
  link: "https://example.com"
}
```

**Entry with Multiple Values**
```typescript
{
  text: "Roles",
  value: ["Director", "Producer", "Writer"]
}
```

**Nested Entry**
```typescript
{
  text: "Production Team",
  children: [
    {text: "Director", value: "Ahmed Ali"},
    {text: "Producer", value: "Sara Mohamed"}
  ]
}
```

## Usage Examples

### Festival Info Tab

```tsx
import {DetailSection} from '../../components/detail-display';

const organizingTeam = [
  {text: "Festival Director", value: "Dr. Ahmed Hassan"},
  {text: "Artistic Director", value: "Mohamed Ali"}
];

const jury = [
  {text: "Dr. Sara Ibrahim"},
  {text: "Prof. Khaled Mahmoud"}
];

return (
  <>
    <DetailSection
      section={{title: "Organizing Team", items: organizingTeam}}
      variant="role"
    />
    <DetailSection
      section={{title: "Jury List", items: jury}}
      variant="default"
    />
  </>
);
```

### Show Info Tab

```tsx
const cast = [
  {text: "Ahmed Ali", value: "Hamlet"},
  {text: "Sara Mohamed", value: "Ophelia"}
];

const crew = [
  {text: "Director", value: "Khaled Hassan"},
  {text: "Set Design", value: "Layla Ibrahim"}
];

return (
  <>
    <DetailSection
      section={{title: "Cast", items: cast}}
      variant="role"
    />
    <DetailSection
      section={{title: "Crew", items: crew}}
      variant="role"
    />
  </>
);
```

## Utility Functions

### renderValue

Renders a value with optional inline or block formatting.

```typescript
renderValue("Simple string", {inline: true})
renderValue(["Item 1", "Item 2"], {inline: false})
```

### renderLinkedText

Renders text with optional link support.

```typescript
renderLinkedText(
  {text: "Website", link: "https://example.com"},
  "text-blue-500"
)
```

### getRoleValue

Extracts and formats role value from a detail entry.

```typescript
getRoleValue({text: "Actor", value: "Lead Role"})
// Returns: "Lead Role"
```

### buildItemKey

Generates unique keys for list items.

```typescript
buildItemKey(item, index)
// Returns: "text-value-link-index"
```

### isDetailEntry

Type guard to check if an item is a DetailEntry.

```typescript
if (isDetailEntry(item)) {
  // TypeScript knows item is DetailEntry
}
```

## Features

- **Responsive**: Mobile-first design with responsive breakpoints
- **Accessible**: ARIA attributes for screen readers
- **Dark Mode**: Full dark mode support
- **Bilingual**: RTL and LTR layout support
- **Nested Lists**: Support for hierarchical data
- **Type Safe**: Full TypeScript support
- **Reusable**: Shared across Festival and Show pages

## Styling

The components use Tailwind CSS with custom colors:

- `theatre-gold-500`: Role highlighting color
- `primary-*`: Standard text colors
- `accent-*`: Section title colors
- `secondary-*`: Link colors

All components support dark mode through Tailwind's `dark:` variants.

## Best Practices

1. **Use appropriate variants**
   - `role` for people/roles (cast, crew, team)
   - `default` for lists (awards, jury)
   - `text` for descriptions and notes

2. **Provide descriptive titles**
   ```tsx
   {title: t('festival.organizingTeam')} // ✅ Good
   {title: "Team"}                       // ❌ Too vague
   ```

3. **Filter empty items**
   ```tsx
   const items = data
     .filter(item => item.text && item.text.trim())
     .map(mapToDetailEntry);
   ```

4. **Use type guards**
   ```tsx
   if (isDetailEntry(item)) {
     // Safe to use item.text, item.value, etc.
   }
   ```

5. **Handle optional sections**
   ```tsx
   const section = items.length > 0
     ? {title: "Awards", items}
     : undefined;
   ```

## File Structure

```
src/components/detail-display/
├── DetailSection.tsx      # Top-level section component
├── DetailList.tsx         # List rendering with variants
├── DetailListItem.tsx     # Individual list item
├── types.ts              # TypeScript type definitions
├── utils.tsx             # Utility functions
├── index.ts              # Barrel export
└── README.md             # This file
```

## Migration Guide

### Before (Duplicated Code)

```tsx
// In ShowInfoTab.tsx - 212 lines
const DetailSection = ({section}) => {
  // 50+ lines of duplicated code
};

// In FestivalInfoTab.tsx - 299 lines
const DetailSection = ({section}) => {
  // 50+ lines of duplicated code
};
```

### After (Shared Components)

```tsx
// In both files - 41-120 lines each
import {DetailSection} from '../../components/detail-display';

<DetailSection section={section} variant="role" />
```

**Result**: 80% reduction in ShowInfoTab, 60% reduction in FestivalInfoTab

## Related Documentation

- [API Hooks Documentation](../../api/hooks.ts) - See JSDoc for mapping functions
- [Type Definitions](../../types/index.ts) - DetailEntry type definition
- [Festival Info Tab](../../pages/festival-detail/FestivalInfoTab.tsx)
- [Show Info Tab](../../pages/show-detail/ShowInfoTab.tsx)
