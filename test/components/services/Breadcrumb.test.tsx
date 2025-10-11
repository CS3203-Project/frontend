import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Breadcrumb from '../../../src/components/services/Breadcrumb';

describe('Breadcrumb Component', () => {
  const renderBreadcrumb = (items: { label: string; href?: string }[]) => {
    return render(
      <BrowserRouter>
        <Breadcrumb items={items} />
      </BrowserRouter>
    );
  };

  it('should render home link', () => {
    renderBreadcrumb([]);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render breadcrumb items', () => {
    const items = [
      { label: 'Services', href: '/services' },
      { label: 'Web Development' }
    ];
    
    renderBreadcrumb(items);
    
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Web Development')).toBeInTheDocument();
  });

  it('should render items with links correctly', () => {
    const items = [
      { label: 'Services', href: '/services' }
    ];
    
    renderBreadcrumb(items);
    
    const link = screen.getByRole('link', { name: 'Services' });
    expect(link).toHaveAttribute('href', '/services');
  });

  it('should render final item without link', () => {
    const items = [
      { label: 'Services', href: '/services' },
      { label: 'Web Development' }
    ];
    
    renderBreadcrumb(items);
    
    const finalItem = screen.getByText('Web Development');
    expect(finalItem.tagName).toBe('SPAN');
  });

  it('should render multiple breadcrumb items', () => {
    const items = [
      { label: 'Category', href: '/category' },
      { label: 'Subcategory', href: '/category/subcategory' },
      { label: 'Item' }
    ];
    
    renderBreadcrumb(items);
    
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Subcategory')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
  });

  it('should have proper aria-label', () => {
    renderBreadcrumb([]);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});