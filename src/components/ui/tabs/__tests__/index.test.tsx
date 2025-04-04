import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../index';

describe('Tabs Component', () => {
  it('renders tabs with triggers and content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>
    );
    
    // Check that the triggers are rendered
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    
    // Check that the active tab content is rendered
    expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
    
    // Check that the inactive tab content is not visible
    expect(screen.queryByText('Tab 2 Content')).not.toBeVisible();
  });

  it('switches tabs when a trigger is clicked', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>
    );
    
    // Initial state
    expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 2 Content')).not.toBeVisible();
    
    // Click the second tab trigger
    fireEvent.click(screen.getByText('Tab 2'));
    
    // Now the second tab content should be visible
    expect(screen.getByText('Tab 2 Content')).toBeVisible();
    
    // And the first tab content should be hidden
    expect(screen.queryByText('Tab 1 Content')).not.toBeVisible();
  });

  it('applies active styling to the active tab trigger', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>
    );
    
    // Check that the first tab has the active state
    const tab1 = screen.getByText('Tab 1');
    expect(tab1).toHaveAttribute('data-state', 'active');
    
    // Click the second tab
    fireEvent.click(screen.getByText('Tab 2'));
    
    // Now the second tab should have the active state
    const tab2 = screen.getByText('Tab 2');
    expect(tab2).toHaveAttribute('data-state', 'active');
    
    // And the first tab should no longer be active
    expect(tab1).not.toHaveAttribute('data-state', 'active');
  });

  it('applies custom classes to tab components', () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs-class">
        <TabsList className="custom-list-class">
          <TabsTrigger value="tab1" className="custom-trigger-class">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content-class">Content</TabsContent>
      </Tabs>
    );
    
    // Check for custom classes
    expect(screen.getByText('Tab 1')).toHaveClass('custom-trigger-class');
    expect(screen.getByText('Content')).toHaveClass('custom-content-class');
    
    // List component
    const list = screen.getByRole('tablist');
    expect(list).toHaveClass('custom-list-class');
  });

  it('renders disabled tab trigger correctly', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2" disabled>Tab 2 (Disabled)</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>
    );
    
    // Check that the disabled tab has the disabled attribute
    const disabledTab = screen.getByText('Tab 2 (Disabled)');
    expect(disabledTab).toBeDisabled();
    expect(disabledTab).toHaveClass('disabled:opacity-50');
    
    // Clicking the disabled tab should not change the active tab
    fireEvent.click(disabledTab);
    
    // Tab 1 content should still be visible
    expect(screen.getByText('Tab 1 Content')).toBeVisible();
    expect(screen.queryByText('Tab 2 Content')).not.toBeVisible();
  });

  it('forwards refs to components', () => {
    const tabsListRef = React.createRef<HTMLDivElement>();
    const tabsTriggerRef = React.createRef<HTMLButtonElement>();
    const tabsContentRef = React.createRef<HTMLDivElement>();
    
    render(
      <Tabs defaultValue="tab1">
        <TabsList ref={tabsListRef}>
          <TabsTrigger value="tab1" ref={tabsTriggerRef}>Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" ref={tabsContentRef}>Content</TabsContent>
      </Tabs>
    );
    
    expect(tabsListRef.current).not.toBeNull();
    expect(tabsTriggerRef.current).not.toBeNull();
    expect(tabsContentRef.current).not.toBeNull();
  });

  it('handles programmatic value changes', () => {
    const { rerender } = render(
      <Tabs value="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>
    );
    
    // Initially, tab1 content should be visible
    expect(screen.getByText('Tab 1 Content')).toBeVisible();
    
    // Change the controlled value
    rerender(
      <Tabs value="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Tab 1 Content</TabsContent>
        <TabsContent value="tab2">Tab 2 Content</TabsContent>
      </Tabs>
    );
    
    // Now tab2 content should be visible
    expect(screen.getByText('Tab 2 Content')).toBeVisible();
    expect(screen.queryByText('Tab 1 Content')).not.toBeVisible();
  });
});