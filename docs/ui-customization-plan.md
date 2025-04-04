# UI Customization System Plan

This document outlines a plan for implementing a UI customization system that allows users to fully personalize their dashboard using ShadcN UI components with a live preview in the settings interface.

## System Overview

The customization system will enable users to:
- Select ShadcN UI components from a component palette
- Drag and drop components onto a grid-based layout
- Configure component properties through a visual interface
- Save and switch between multiple layout configurations
- Preview changes in real-time before applying them

## Technical Architecture

### 1. Component Registry

A centralized registry of all available ShadcN components that users can add to their dashboard:

```typescript
// src/lib/customization/component-registry.ts
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
// Import all configurable components

export const componentRegistry = {
  "card": {
    component: Card,
    defaultProps: {},
    label: "Card",
    description: "A container for content",
    icon: "square",
    configurableProps: ["className", "variant"]
  },
  "calendar": {
    component: Calendar,
    defaultProps: {},
    label: "Calendar",
    description: "Date picker and calendar view",
    icon: "calendar",
    configurableProps: ["mode", "selected", "className"]
  },
  // Add all components...
};
```

### 2. Layout System

A grid-based layout system for component positioning:

```typescript
// src/lib/customization/layout-engine.ts
export type LayoutItem = {
  id: string;
  componentType: string;
  props: Record<string, any>;
  position: {
    x: number; // Grid column
    y: number; // Grid row
    w: number; // Width in grid units
    h: number; // Height in grid units
  };
};

export type UserLayout = {
  id: string;
  name: string;
  userId: string;
  grid: {
    columns: number;
    rows: number;
  };
  items: LayoutItem[];
};
```

### 3. Customization UI

A visual editor with drag-and-drop functionality:

```tsx
// src/components/customization/dashboard-customizer.tsx
"use client";

import { useState } from "react";
import { componentRegistry } from "@/lib/customization/component-registry";
import { UserLayout, LayoutItem } from "@/lib/customization/layout-engine";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

export function DashboardCustomizer({
  initialLayout,
  onSave,
}: {
  initialLayout: UserLayout;
  onSave: (layout: UserLayout) => void;
}) {
  const [layout, setLayout] = useState(initialLayout);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  
  // Implementation of drag-and-drop functionality
  
  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 h-full">
      {/* Component Palette */}
      <div className="border rounded-md p-4 bg-background">
        <h3 className="text-lg font-medium mb-4">Components</h3>
        <div className="grid gap-2">
          {Object.entries(componentRegistry).map(([id, config]) => (
            <div 
              key={id}
              className="p-2 border rounded cursor-move hover:bg-accent"
              // Drag handlers
            >
              {config.label}
            </div>
          ))}
        </div>
      </div>
      
      {/* Preview Area */}
      <div className="border rounded-md bg-background p-4">
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium">Preview</h3>
          <button onClick={() => onSave(layout)} className="px-4 py-2 bg-primary text-primary-foreground rounded">
            Save Layout
          </button>
        </div>
        
        <div 
          className="grid gap-4" 
          style={{ 
            gridTemplateColumns: `repeat(${layout.grid.columns}, 1fr)`,
            gridTemplateRows: `repeat(${layout.grid.rows}, minmax(100px, auto))`
          }}
        >
          {/* Render each component based on layout */}
          {layout.items.map((item) => renderLayoutItem(item))}
        </div>
      </div>
    </div>
  );
  
  function renderLayoutItem(item: LayoutItem) {
    const ComponentToRender = componentRegistry[item.componentType]?.component;
    if (!ComponentToRender) return null;
    
    return (
      <div 
        key={item.id}
        className="border border-dashed rounded-md relative"
        style={{
          gridColumn: `span ${item.position.w} / span ${item.position.w}`,
          gridRow: `span ${item.position.h} / span ${item.position.h}`,
        }}
      >
        <ComponentToRender {...item.props} />
        {/* Component controls (resize/remove) */}
      </div>
    );
  }
}
```

### 4. Component Property Editor

A UI for configuring component properties:

```tsx
// src/components/customization/property-editor.tsx
export function PropertyEditor({ 
  componentType, 
  props, 
  onChange 
}: { 
  componentType: string; 
  props: Record<string, any>;
  onChange: (newProps: Record<string, any>) => void;
}) {
  const config = componentRegistry[componentType];
  if (!config) return null;
  
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="font-medium">{config.label} Properties</h3>
      
      {config.configurableProps.map(propName => (
        <div key={propName} className="space-y-2">
          <label className="text-sm font-medium">{propName}</label>
          {renderPropEditor(propName, props[propName], (value) => {
            onChange({ ...props, [propName]: value });
          })}
        </div>
      ))}
    </div>
  );
  
  // Render different editors based on prop type
  function renderPropEditor(propName: string, value: any, onChangeValue: (val: any) => void) {
    // Implementation of property type editors
  }
}
```

### 5. Storage and Persistence

A system to save and load user layouts:

```typescript
// src/lib/customization/layout-storage.ts
import { supabase } from "@/lib/supabase";
import { UserLayout } from "./layout-engine";

export async function saveUserLayout(layout: UserLayout) {
  const { data, error } = await supabase
    .from('user_layouts')
    .upsert({
      id: layout.id || undefined,
      user_id: layout.userId,
      name: layout.name,
      layout_data: layout,
    });
    
  if (error) throw error;
  return data;
}

export async function getUserLayouts(userId: string) {
  const { data, error } = await supabase
    .from('user_layouts')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data.map(row => row.layout_data as UserLayout);
}
```

### 6. Integration with Settings Page

```tsx
// src/app/(dashboard)/settings/customization/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCustomizer } from "@/components/customization/dashboard-customizer";
import { getUserLayouts, saveUserLayout } from "@/lib/customization/layout-storage";
import { UserLayout } from "@/lib/customization/layout-engine";
import { defaultLayout } from "@/lib/customization/default-layouts";

export default function CustomizationPage() {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<UserLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<UserLayout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Implementation of layout loading and saving logic
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Customization</h1>
      
      <div className="h-[calc(100vh-200px)]">
        <DashboardCustomizer 
          initialLayout={activeLayout}
          onSave={handleSaveLayout}
        />
      </div>
    </div>
  );
}
```

### 7. Applying Custom Layout to Dashboard

```tsx
// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserLayouts } from "@/lib/customization/layout-storage";
import { DashboardRenderer } from "@/components/customization/dashboard-renderer";
import { defaultLayout } from "@/lib/customization/default-layouts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [layout, setLayout] = useState(defaultLayout);
  
  // Implementation of layout loading logic
  
  return <DashboardRenderer layout={layout} />;
}
```

## Database Schema

To support this feature, we'll need to add a new table to the Supabase database:

```sql
CREATE TABLE user_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX user_layouts_user_id_idx ON user_layouts(user_id);
```

## Implementation Timeline

### Phase 1: Foundation (1-2 weeks)
- Set up component registry with basic components
- Implement layout engine and grid system
- Create basic drag-and-drop functionality
- Develop simple property editors for common prop types

### Phase 2: Core Functionality (2-3 weeks)
- Complete component registry with all ShadcN components
- Implement full property editor for all prop types
- Add database integration for saving/loading layouts
- Develop layout renderer for the dashboard

### Phase 3: Polish & Optimization (1-2 weeks)
- Optimize rendering performance for live preview
- Add layout templates and presets
- Implement layout sharing between users
- Add responsive layout adjustments

## Technical Considerations

### Component Adaptation
Some ShadcN components will require adapter components to work properly in the customization system:
- Compound components (Tabs, Dialog) need special handling
- Components with React Context dependencies require context providers
- Interactive components need state management adapters

### Performance Optimization
To ensure smooth performance during customization:
- Implement virtualization for large layouts
- Use React.memo and useMemo for expensive renders
- Implement debouncing for property changes
- Lazy load components in the component palette

### Security Considerations
- Validate all user-provided layout data before rendering
- Implement rate limiting for layout saves
- Add permissions checking for layout sharing

## Future Enhancements

After initial implementation, consider these enhancements:
- Component templates and saved configurations
- Layout versioning and history
- Layout export/import functionality
- Layout sharing and marketplace
- AI-assisted layout recommendations