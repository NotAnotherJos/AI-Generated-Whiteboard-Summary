import { describe, it, expect, vi, beforeEach,afterEach} from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent, AppHeader, CustomTooltip, AppBackground, CardButtons, FloatingExit, MainCard, ConfirmDeleteDialog, HistoryCard } from '../imports';
import { router } from '@forge/bridge';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function getCSSForClass(className) {
  const styles = Array.from(document.querySelectorAll('style[data-emotion]'));
  const needle = `.${className}`;
  return styles
    .map(el => el.textContent || '')
    .filter(css => css.includes(needle))
    .join('\n');
}

function renderWithTheme(ui) {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('AppBackground', () => {
  it('1.renders children', () => {
    renderWithTheme(
      <AppBackground>
        <div data-testid="child">Hello</div>
      </AppBackground>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('2.renders 20 particles', () => {
    const { container } = renderWithTheme(<AppBackground />);
    const particleLayer = container.firstElementChild.children[1];
    expect(particleLayer.children.length).toBe(20);
  });
});

describe('AppHeader', () => {
  it('1. Renders title and description', () => {
    renderWithTheme(<AppHeader />);
    const heading = screen.getByRole('heading', { level: 1, name: /app\.title/i });
    expect(heading).toBeInTheDocument();
    const desc = screen.getByText(/app\.description/i);
    expect(desc).toBeInTheDocument();
  });

  it('2.Display: hidden on xs, visible on md+', () => {
    const { container } = renderWithTheme(<AppHeader />);
    const root = container.firstChild;
    const className = [...(root.classList || [])].find(c => c.includes('css-'));
    expect(className).toBeTruthy();
    const css = getCSSForClass(className);
    expect(css).toMatch(new RegExp(`\\.${className}[^}]*display:\\s*none`, 'i'));
    expect(css).toMatch(/@media\s*\(min-width:\s*900px\)/i);
    expect(css).toMatch(
      new RegExp(
        `@media\\s*\\(min-width:\\s*900px\\)[\\s\\S]*\\.${className}[^{]*{[^}]*display:\\s*block`,
        'i'
      )
    );
  });
});

describe('CardButtons', () => {
  it('1. renders nothing', () => {
    render(<CardButtons />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('2. shows Retry button and calls onRetry when clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderWithTheme(<CardButtons onRetry={onRetry} />);

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await user.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('3. shows Publish button and calls onSubmit when clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<CardButtons onSubmit={onSubmit} />);

    const publishBtn = screen.getByRole('button', { name: /publish/i });
    expect(publishBtn).toBeInTheDocument();

    await user.click(publishBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('4. shows Go button and go absolute URL', async () => {
    const user = userEvent.setup();

    renderWithTheme(<CardButtons pageUrl="/spaces/ABC/pages/123" />);

    const goBtn = screen.getByRole('button', { name: /go/i });
    await user.click(goBtn);

    expect(router.navigate).toHaveBeenCalledWith(
      'https://ai-whiteboard.atlassian.net/wiki/spaces/ABC/pages/123'
    );
  });

  it('5. uses absolute URL as-is when pageUrl starts with http', async () => {
    const user = userEvent.setup();
    vi.spyOn(router, 'navigate').mockClear?.();

    render(<CardButtons pageUrl="https://example.com/foo" />);

    const goBtn = screen.getByRole('button', { name: /go/i });
    await user.click(goBtn);
    expect(router.navigate).toHaveBeenCalledWith('https://example.com/foo');
  });

  it('6. disables buttons when loading=true', async () => {
    const onRetry = vi.fn();
    const onSubmit = vi.fn();

    render(<CardButtons onRetry={onRetry} onSubmit={onSubmit} pageUrl="/x" loading />);

    const retryBtn   = screen.getByRole('button', { name: /retry/i });
    const publishBtn = screen.getByRole('button', { name: /publish/i });
    const goBtn      = screen.getByRole('button', { name: /go/i });
    
    expect(retryBtn).toBeDisabled();
    expect(publishBtn).toBeDisabled();
    expect(goBtn).toBeDisabled();
  });
});

describe('FloatingExit', () => {
  let mockGetBoundingClientRect;

  beforeEach(() => {
    mockGetBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 200,
      width: 300,
      height: 150
    }));
    
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
      configurable: true,
      writable: true,
      value: mockGetBoundingClientRect
    });
    
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      writable: true,
      value: mockGetBoundingClientRect
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. renders children when visible=true', () => {
    render(
      <FloatingExit visible>
        <div data-testid="content">Hello</div>
      </FloatingExit>
    );
    expect(screen.getByTestId('content')).toHaveTextContent('Hello');
  });

  it('2. renders nothing when visible=false (initial)', () => {
    render(
      <FloatingExit visible={false}>
        <div data-testid="content">Hidden</div>
      </FloatingExit>
    );
    
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('3. transitions from visible to hidden state', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
  });

  it('4. handles floating animation state changes', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
  });

  it('5. renders correctly during animation phases', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
  });

  it('6. handles multiple visibility state transitions', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
    
    rerender(
      <FloatingExit visible={true}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="content">Test Content</div>
      </FloatingExit>
    );
  });

  it('7. works with different types of children', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <button data-testid="button">Click Me</button>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('button')).toBeInTheDocument();
    
    rerender(
      <FloatingExit visible={false}>
        <button data-testid="button">Click Me</button>
      </FloatingExit>
    );
  });

  it('8. handles complex nested children structures', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <div data-testid="complex">
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('complex')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="complex">
          <h1>Title</h1>
          <p>Description</p>
          <button>Action</button>
        </div>
      </FloatingExit>
    );
  });

  it('9. does not call getBoundingClientRect when visible remains false', () => {
    const { rerender } = render(
      <FloatingExit visible={false}>
        <div data-testid="content">Hidden</div>
      </FloatingExit>
    );
    
    expect(mockGetBoundingClientRect).not.toHaveBeenCalled();
    
    rerender(
      <FloatingExit visible={false}>
        <div data-testid="content">Still Hidden</div>
      </FloatingExit>
    );
    
    expect(mockGetBoundingClientRect).not.toHaveBeenCalled();
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('10. does not call getBoundingClientRect when visible remains true', () => {
    const { rerender } = render(
      <FloatingExit visible={true}>
        <div data-testid="content">Visible</div>
      </FloatingExit>
    );
    
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(mockGetBoundingClientRect).not.toHaveBeenCalled();
    
    rerender(
      <FloatingExit visible={true}>
        <div data-testid="content">Still Visible</div>
      </FloatingExit>
    );
    
    expect(mockGetBoundingClientRect).not.toHaveBeenCalled();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });
});

describe('MainCard', () => {
  it('1. renders title, description and children', () => {
    render(
      <MainCard title="card.title" description="card.desc">
        <div data-testid="content">Hello</div>
      </MainCard>
    );

    expect(screen.getByRole('heading', { level: 6, name: /card\.title/i })).toBeInTheDocument();
    expect(screen.getByText(/card\.desc/i)).toBeInTheDocument();
    expect(screen.getByTestId('content')).toHaveTextContent('Hello');
  });

  it('2. collapsible: toggles expanded state on click', async () => {
    const user = userEvent.setup();

    render(
      <MainCard title="card.title" collapsible>
        <div data-testid="content">Body</div>
      </MainCard>
    );

    const headerButton = screen.getByRole('button', { name: /card\.title/i });
    expect(headerButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByTestId('content')).toBeInTheDocument();

    await user.click(headerButton);
    expect(headerButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('content')).toBeNull();
  });

  it('3. non-collapsible: always shows content and header is not a button', () => {
    render(
      <MainCard title="card.title">
        <div data-testid="content">Body</div>
      </MainCard>
    );

    expect(screen.queryByRole('button', { name: /card\.title/i })).toBeNull();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('4. controlled mode: uses external expanded state and calls onExpandedChange', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();

    const { rerender } = render(
      <MainCard title="card.title" collapsible expanded={false} onExpandedChange={onExpandedChange}>
        <div data-testid="content">Body</div>
      </MainCard>
    );
    expect(screen.queryByTestId('content')).toBeNull();

    const headerButton = screen.getByRole('button', { name: /card\.title/i });
    await user.click(headerButton);

    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    const [updater] = onExpandedChange.mock.calls[0];
    expect(typeof updater).toBe('function');
    expect(updater(false)).toBe(true);

    rerender(
      <MainCard title="card.title" collapsible expanded={true} onExpandedChange={onExpandedChange}>
        <div data-testid="content">Body</div>
      </MainCard>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('5. renders headerActions when provided', () => {
    render(
      <MainCard title="card.title" headerActions={<button>Action</button>}>
        <div>Body</div>
      </MainCard>
    );
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });
});

describe('CustomTooltip', () => {
  it('1.should render children correctly', () => {
    render(
      <CustomTooltip title="Test tooltip">
        <button>Hover me</button>
      </CustomTooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('2.should render with custom title', () => {
    render(
      <CustomTooltip title="Custom tooltip text">
        <span>Test element</span>
      </CustomTooltip>
    );

    expect(screen.getByText('Test element')).toBeInTheDocument();
  });

  it('3.should render complex children', () => {
    render(
      <CustomTooltip title="Complex tooltip">
        <div>
          <h1>Title</h1>
          <p>Description</p>
        </div>
      </CustomTooltip>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('4.should render without title prop', () => {
    render(
      <CustomTooltip>
        <button>No title</button>
      </CustomTooltip>
    );

    expect(screen.getByText('No title')).toBeInTheDocument();
  });
});

describe('ConfirmDeleteDialog', () => {
  it('1. renders in controlled mode with basic props', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    renderWithTheme(
      <ConfirmDeleteDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        type="single"
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/confirmDeleteSingleTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmDeleteSingleContent/i)).toBeInTheDocument();
  });

  it('2. calls onConfirm and onClose when confirm button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    renderWithTheme(
      <ConfirmDeleteDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        type="single"
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('3. calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    renderWithTheme(
      <ConfirmDeleteDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        type="single"
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('4. shows different content for "all" type', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    renderWithTheme(
      <ConfirmDeleteDialog
        open={true}
        onClose={onClose}
        onConfirm={onConfirm}
        type="all"
      />
    );

    expect(screen.getByText(/confirmDeleteAllTitle/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmDeleteAllContent/i)).toBeInTheDocument();
  });
});

describe('HistoryCard', () => {
  const mockItem = {
    image_id: 'test-123',
    image_url: 'https://example.com/image.jpg',
    model_name: 'Test Model',
    created_at: '2024-01-01T12:00:00Z'
  };

  it('1. renders item information correctly', () => {
    const onRestore = vi.fn();
    const onReGenerate = vi.fn();
    const onDelete = vi.fn();

    renderWithTheme(
      <HistoryCard
        item={mockItem}
        onRestore={onRestore}
        onReGenerate={onReGenerate}
        onDelete={onDelete}
      />
    );

    const image = screen.getByRole('img', { name: /history preview/i });
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');

    expect(screen.getByText(/Test Model/)).toBeInTheDocument();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('2. calls onRestore when image area is clicked', async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn();
    const onReGenerate = vi.fn();
    const onDelete = vi.fn();

    renderWithTheme(
      <HistoryCard
        item={mockItem}
        onRestore={onRestore}
        onReGenerate={onReGenerate}
        onDelete={onDelete}
      />
    );

    const image = screen.getByRole('img', { name: /history preview/i });
    await user.click(image.parentElement);

    expect(onRestore).toHaveBeenCalledTimes(1);
    expect(onRestore).toHaveBeenCalledWith(mockItem);
  });

  it('3. calls onDelete when bottom content area is clicked', async () => {
    const user = userEvent.setup();
    const onRestore = vi.fn();
    const onReGenerate = vi.fn();
    const onDelete = vi.fn();

    renderWithTheme(
      <HistoryCard
        item={mockItem}
        onRestore={onRestore}
        onReGenerate={onReGenerate}
        onDelete={onDelete}
      />
    );

    const modelText = screen.getByText(/Test Model/);
    await user.click(modelText.closest('[role="presentation"]') || modelText.parentElement);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('test-123');
  });

  it('4. renders without crashing with minimal props', () => {
    const onRestore = vi.fn();
    const onReGenerate = vi.fn();
    const onDelete = vi.fn();

    expect(() => {
      renderWithTheme(
        <HistoryCard
          item={mockItem}
          onRestore={onRestore}
          onReGenerate={onReGenerate}
          onDelete={onDelete}
        />
      );
    }).not.toThrow();
  });
});

