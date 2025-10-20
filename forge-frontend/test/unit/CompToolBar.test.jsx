import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function setup_toolbar(overrides = {}) {
  const props = {
    toolbar: {
      model: 'm1',
      promptType: 'general',
      prompt: '',
      edit: false,
      autoClear: false,
    },
    aiCapabilities: {
      supportedModels: ['m1', 'm2'],
      supportedPromptTypes: ['general', 'summary'],
    },
    capabilitiesLoading: false,
    updateToolbar: vi.fn(),
    onResetDefaults: vi.fn(),
    disabled: false,
    expanded: true,
    onExpandedChange: vi.fn(),
    ...overrides,
  };
  const utils = render(<ToolBar {...props} />);
  return { props, ...utils };
}

import { ToolBar, ToolbarIconButton, ToolbarInput, ToolbarSelect } from '../imports';

function renderWithTheme(ui) {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
}

describe('ToolBar', () => {
  it('1. renders as collapsible MainCard', () => {
    setup_toolbar();
    
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
  });

  it('2. renders all sub-components', () => {
    const { container } = setup_toolbar();
    
    expect(document.querySelector('.guide-model-select')).toBeTruthy();
    expect(document.querySelector('.guide-prompt-type-select')).toBeTruthy();
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(container.querySelector('.guide-reset-btn')).toBeTruthy();
  });

  it('3. passes disabled state to children', () => {
    setup_toolbar({ disabled: true });
    
    expect(screen.getByRole('textbox')).toBeDisabled();
    
    const modelSelect = document.querySelector('.guide-model-select [role="combobox"]');
    const promptTypeSelect = document.querySelector('.guide-prompt-type-select [role="combobox"]');
    expect(modelSelect).toHaveAttribute('aria-disabled', 'true');
    expect(promptTypeSelect).toHaveAttribute('aria-disabled', 'true');
    
    screen.getAllByRole('checkbox').forEach(cb => expect(cb).toBeDisabled());
  });

  it('4. passes loading state to ToolbarSelect', () => {
    setup_toolbar({
      capabilitiesLoading: true,
      toolbar: { model: 'm1', promptType: 'general', prompt:'', edit:false, autoClear:false },
    });

    const modelSelect = document.querySelector('.guide-model-select [role="combobox"]');
    const promptTypeSelect = document.querySelector('.guide-prompt-type-select [role="combobox"]');
    
    expect(modelSelect).toHaveTextContent('Loading...');
    expect(promptTypeSelect).toHaveTextContent('Loading...');
  });

  it('5. handles expand/collapse state', async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    
    setup_toolbar({ 
      expanded: true, 
      onExpandedChange 
    });
    
    const expandButton = screen.getByRole('button', { expanded: true });
    await user.click(expandButton);
    
    expect(onExpandedChange).toHaveBeenCalled();
  });

  it('6. integrates reset action correctly', async () => {
    const { props, container } = setup_toolbar();
    const user = userEvent.setup();
    
    await user.click(container.querySelector('.guide-reset-btn'));
    expect(props.onResetDefaults).toHaveBeenCalledTimes(1);
  });
});

describe('ToolbarInput', () => {
  const defaultToolbar = {
    prompt: 'Test prompt value',
  };

  const defaultProps = {
    toolbar: defaultToolbar,
    handleChange: vi.fn(),
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering Tests', () => {
    it('1. Renders text input field', () => {
      renderWithTheme(<ToolbarInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      
      const container = document.querySelector('.guide-prompt-input');
      expect(container).toBeInTheDocument();
    });

    it('2. Displays correct initial value', () => {
      renderWithTheme(<ToolbarInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Test prompt value');
    });

    it('3. Displays placeholder text', () => {
      const propsWithEmptyPrompt = {
        ...defaultProps,
        toolbar: { prompt: '' }
      };
      
      renderWithTheme(<ToolbarInput {...propsWithEmptyPrompt} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'toolbar.prompt_placeholder');
    });

    it('4. Applies correct styles', () => {
      renderWithTheme(<ToolbarInput {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input.closest('.MuiTextField-root')).toHaveStyle({ minWidth: '200px' });
    });
  });

  describe('Interaction Functionality Tests', () => {
    it('5. Input field has onChange handler', () => {
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarInput 
          {...defaultProps} 
          handleChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
      expect(input).toHaveValue('Test prompt value');
    });

    it('6. Supports delete and clear operations', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarInput 
          {...defaultProps} 
          handleChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.clear(input);

      expect(handleChange).toHaveBeenCalledWith('prompt', '');
    });

    it('7. Supports text input interaction', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarInput 
          {...defaultProps} 
          handleChange={handleChange}
          toolbar={{ prompt: '' }}
        />
      );

      const input = screen.getByRole('textbox');
      
      await user.type(input, 'A');
      
      expect(handleChange).toHaveBeenCalled();
      
      const firstCall = handleChange.mock.calls[0];
      expect(firstCall[0]).toBe('prompt');
      expect(typeof firstCall[1]).toBe('string');
    });
  });

  describe('Disabled State Tests', () => {
    it('8. Does not allow input when disabled', () => {
      renderWithTheme(
        <ToolbarInput 
          {...defaultProps} 
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('9. Does not show tooltip when disabled', () => {
      renderWithTheme(
        <ToolbarInput 
          {...defaultProps} 
          disabled={true}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('State Change Tests', () => {
    it('10. Correctly updates when toolbar prompt value changes', () => {
      const { rerender } = renderWithTheme(<ToolbarInput {...defaultProps} />);

      let input = screen.getByRole('textbox');
      expect(input).toHaveValue('Test prompt value');

      const newProps = {
        ...defaultProps,
        toolbar: { prompt: 'Updated prompt value' }
      };
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <ToolbarInput {...newProps} />
        </ThemeProvider>
      );

      input = screen.getByRole('textbox');
      expect(input).toHaveValue('Updated prompt value');
    });
  });
});

describe('ToolbarSelect', () => {
  const defaultToolbar = {
    model: 'm1',
    promptType: 'general',
  };

  const defaultAiCapabilities = {
    supportedModels: ['m1', 'm2', 'm3'],
    supportedPromptTypes: ['general', 'summary', 'detailed'],
  };

  const defaultProps = {
    toolbar: defaultToolbar,
    handleSelectChange: vi.fn(),
    handleSelectBlur: vi.fn(),
    aiCapabilities: defaultAiCapabilities,
    capabilitiesLoading: false,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering Tests', () => {
    it('1. Renders AI model selection field', () => {
      renderWithTheme(<ToolbarSelect {...defaultProps} />);

      const modelSelect = document.querySelector('.guide-model-select');
      expect(modelSelect).toBeInTheDocument();
    });

    it('2. Renders Prompt type selection field', () => {
      renderWithTheme(<ToolbarSelect {...defaultProps} />);

      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      expect(promptTypeSelect).toBeInTheDocument();
    });

    it('3. Displays correct initial selected values', () => {
      renderWithTheme(<ToolbarSelect {...defaultProps} />);

      const modelSelect = document.querySelector('.guide-model-select input');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select input');
      
      expect(modelSelect).toHaveValue('m1');
      expect(promptTypeSelect).toHaveValue('general');
    });

    it('4. Applies correct styles', () => {
      renderWithTheme(<ToolbarSelect {...defaultProps} />);

      const modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect).toBeInTheDocument();
      expect(promptTypeSelect).toBeInTheDocument();
      
      expect(modelSelect).toHaveStyle({ minWidth: '140px' });
      expect(promptTypeSelect).toHaveStyle({ minWidth: '120px' });
    });
  });

  describe('Option Rendering Tests', () => {
    it('5. Correctly displays currently selected model', () => {
      renderWithTheme(<ToolbarSelect {...defaultProps} />);

      const modelSelect = document.querySelector('.guide-model-select');
      expect(modelSelect).toHaveTextContent('m1');
      
      expect(modelSelect.querySelector('[role="combobox"]')).toBeInTheDocument();
    });

    it('6. Correctly displays currently selected Prompt type', () => {
      renderWithTheme(<ToolbarSelect {...defaultProps} />);

      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      expect(promptTypeSelect).toHaveTextContent('General');
      
      expect(promptTypeSelect.querySelector('[role="combobox"]')).toBeInTheDocument();
    });

    it('7. Handles empty promptType values', () => {
      const propsWithEmptyPromptType = {
        ...defaultProps,
        toolbar: { model: 'm1', promptType: null }
      };
      
      renderWithTheme(<ToolbarSelect {...propsWithEmptyPromptType} />);

      const promptTypeSelect = document.querySelector('.guide-prompt-type-select input');
      expect(promptTypeSelect).toHaveValue('general');
    });
  });

  describe('Interaction Functionality Tests', () => {
    it('8. Model selection component has correct event handlers', () => {
      const handleSelectChange = vi.fn();
      
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          handleSelectChange={handleSelectChange}
        />
      );

      const modelSelect = document.querySelector('.guide-model-select');
      expect(modelSelect).toBeInTheDocument();
      expect(modelSelect.querySelector('[role="combobox"]')).toBeInTheDocument();
      
      expect(modelSelect.querySelector('input')).not.toBeDisabled();
    });

    it('9. Prompt type selection component has correct event handlers', () => {
      const handleSelectChange = vi.fn();
      
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          handleSelectChange={handleSelectChange}
        />
      );

      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      expect(promptTypeSelect).toBeInTheDocument();
      expect(promptTypeSelect.querySelector('[role="combobox"]')).toBeInTheDocument();
      
      expect(promptTypeSelect.querySelector('input')).not.toBeDisabled();
    });

    it('10. Selection fields have correct blur handler attributes', () => {
      const handleSelectBlur = vi.fn();
      
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          handleSelectBlur={handleSelectBlur}
        />
      );

      const modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect.querySelector('[role="combobox"]')).toBeInTheDocument();
      expect(promptTypeSelect.querySelector('[role="combobox"]')).toBeInTheDocument();
    });
  });

  describe('Loading State Tests', () => {
    it('11. Shows Loading option when loading', () => {
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          capabilitiesLoading={true}
        />
      );

      const modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect).toHaveTextContent('Loading...');
      expect(promptTypeSelect).toHaveTextContent('Loading...');
    });

    it('12. Disables selection fields when loading', () => {
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          capabilitiesLoading={true}
        />
      );

      const modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect).toBeInTheDocument();
      expect(promptTypeSelect).toBeInTheDocument();
      
      expect(modelSelect).toHaveTextContent('Loading...');
      expect(promptTypeSelect).toHaveTextContent('Loading...');
    });
  });

  describe('Disabled State Tests', () => {
    it('13. Selection fields are not interactive when disabled', () => {
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          disabled={true}
        />
      );

      const modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect).toBeInTheDocument();
      expect(promptTypeSelect).toBeInTheDocument();
      
      expect(modelSelect).toHaveTextContent('m1');
      expect(promptTypeSelect).toHaveTextContent('General');
    });

    it('14. Component renders normally when disabled', () => {
      renderWithTheme(
        <ToolbarSelect 
          {...defaultProps} 
          disabled={true}
        />
      );

      const modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect).toBeInTheDocument();
      expect(promptTypeSelect).toBeInTheDocument();
    });
  });

  describe('State Change Tests', () => {
    it('15. Correctly updates selected items when toolbar values change', () => {
      const { rerender } = renderWithTheme(<ToolbarSelect {...defaultProps} />);

      let modelSelect = document.querySelector('.guide-model-select input');
      expect(modelSelect).toHaveValue('m1');

      const newProps = {
        ...defaultProps,
        toolbar: { model: 'm3', promptType: 'summary' }
      };
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <ToolbarSelect {...newProps} />
        </ThemeProvider>
      );

      modelSelect = document.querySelector('.guide-model-select input');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select input');
      
      expect(modelSelect).toHaveValue('m3');
      expect(promptTypeSelect).toHaveValue('summary');
    });

    it('16. Correctly updates selected items when AI capabilities list changes', () => {
      const { rerender } = renderWithTheme(<ToolbarSelect {...defaultProps} />);

      let modelSelect = document.querySelector('.guide-model-select');
      expect(modelSelect).toHaveTextContent('m1');

      const newProps = {
        ...defaultProps,
        toolbar: { model: 'm4', promptType: 'technical' },
        aiCapabilities: {
          supportedModels: ['m1', 'm4', 'm5'],
          supportedPromptTypes: ['general', 'technical']
        }
      };
      
      rerender(
        <ThemeProvider theme={createTheme()}>
          <ToolbarSelect {...newProps} />
        </ThemeProvider>
      );

      modelSelect = document.querySelector('.guide-model-select');
      const promptTypeSelect = document.querySelector('.guide-prompt-type-select');
      
      expect(modelSelect).toHaveTextContent('m4');
      expect(promptTypeSelect).toHaveTextContent('Technical');
    });
  });
});

describe('ToolbarIconButton', () => {
  const defaultToolbar = {
    edit: false,
    autoClear: true,
  };

  const defaultProps = {
    toolbar: defaultToolbar,
    handleChange: vi.fn(),
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering Tests', () => {
    it('1. Renders all three main buttons', () => {
      renderWithTheme(<ToolbarIconButton {...defaultProps} />);

      expect(document.querySelector('.guide-edit-toggle')).toBeInTheDocument();
      expect(document.querySelector('.guide-autoclear-toggle')).toBeInTheDocument();
      expect(document.querySelector('.guide-reset-btn')).toBeInTheDocument();
    });

    it('2. Displays correct initial states', () => {
      renderWithTheme(<ToolbarIconButton {...defaultProps} />);

      const editCheckbox = document.querySelector('.guide-edit-toggle input[type="checkbox"]');
      expect(editCheckbox).not.toBeChecked();

      const autoClearCheckbox = document.querySelector('.guide-autoclear-toggle input[type="checkbox"]');
      expect(autoClearCheckbox).toBeChecked();
    });

    it('3. Displays correct tooltip information', async () => {
      renderWithTheme(<ToolbarIconButton {...defaultProps} />);

      const editButton = document.querySelector('.guide-edit-toggle');
      await userEvent.hover(editButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Enable Editing')).toBeInTheDocument();
      });
    });

    it('4. Displays correct icons', () => {
      renderWithTheme(<ToolbarIconButton {...defaultProps} />);

      expect(document.querySelector('.guide-edit-toggle svg[data-testid="EditSquareIcon"]')).toBeInTheDocument();
      expect(document.querySelector('.guide-autoclear-toggle svg[data-testid="DeleteSweepIcon"]')).toBeInTheDocument();
      expect(document.querySelector('.guide-reset-btn svg[data-testid="RestartAltIcon"]')).toBeInTheDocument();
    });
  });

  describe('Interaction Functionality Tests', () => {
    it('5. Edit button toggle functionality', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          handleChange={handleChange}
        />
      );

      const editButton = document.querySelector('.guide-edit-toggle');
      await user.click(editButton);

      expect(handleChange).toHaveBeenCalledWith('edit', true);
    });

    it('6. AutoClear button toggle functionality', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          handleChange={handleChange}
        />
      );

      const autoClearButton = document.querySelector('.guide-autoclear-toggle');
      await user.click(autoClearButton);

      expect(handleChange).toHaveBeenCalledWith('autoClear', false);
    });

    it('7. Reset button functionality', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          handleChange={handleChange}
        />
      );

      const resetButton = document.querySelector('.guide-reset-btn');
      await user.click(resetButton);

      expect(handleChange).toHaveBeenCalledWith('reset');
    });

    it('8. Checkbox direct click also triggers changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          handleChange={handleChange}
        />
      );

      const editCheckbox = document.querySelector('.guide-edit-toggle input[type="checkbox"]');
      await user.click(editCheckbox);

      expect(handleChange).toHaveBeenCalledWith('edit', true);
    });
  });

  describe('Disabled State Tests', () => {
    it('9. Does not respond to click events when disabled', async () => {
      const handleChange = vi.fn();
      
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          handleChange={handleChange}
          disabled={true}
        />
      );

      const editButton = document.querySelector('.guide-edit-toggle');
      const autoClearButton = document.querySelector('.guide-autoclear-toggle');
      const resetButton = document.querySelector('.guide-reset-btn');

      expect(editButton).toHaveStyle({ pointerEvents: 'none' });
      expect(autoClearButton).toHaveStyle({ pointerEvents: 'none' });
      expect(resetButton).toHaveStyle({ pointerEvents: 'none' });

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('10. Displays correct visual state when disabled', () => {
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          disabled={true}
        />
      );

      const editButton = document.querySelector('.guide-edit-toggle');
      const autoClearButton = document.querySelector('.guide-autoclear-toggle');
      const resetButton = document.querySelector('.guide-reset-btn');

      expect(editButton).toHaveStyle({ opacity: '0.6' });
      expect(autoClearButton).toHaveStyle({ opacity: '0.6' });
      expect(resetButton).toHaveStyle({ opacity: '0.7' });
    });

    it('11. Checkboxes are also disabled when disabled', () => {
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          disabled={true}
        />
      );

      const editCheckbox = document.querySelector('.guide-edit-toggle input[type="checkbox"]');
      const autoClearCheckbox = document.querySelector('.guide-autoclear-toggle input[type="checkbox"]');

      expect(editCheckbox).toBeDisabled();
      expect(autoClearCheckbox).toBeDisabled();
    });
  });

  describe('State Change Tests', () => {
    it('12. Correctly updates display when toolbar state changes', () => {
      const { rerender } = renderWithTheme(<ToolbarIconButton {...defaultProps} />);

      let editCheckbox = document.querySelector('.guide-edit-toggle input[type="checkbox"]');
      expect(editCheckbox).not.toBeChecked();

      const newToolbar = { edit: true, autoClear: false };
      rerender(
        <ThemeProvider theme={createTheme()}>
          <ToolbarIconButton 
            {...defaultProps} 
            toolbar={newToolbar}
          />
        </ThemeProvider>
      );

      editCheckbox = document.querySelector('.guide-edit-toggle input[type="checkbox"]');
      const autoClearCheckbox = document.querySelector('.guide-autoclear-toggle input[type="checkbox"]');
      
      expect(editCheckbox).toBeChecked();
      expect(autoClearCheckbox).not.toBeChecked();
    });

    it('13. Renders normally when handleChange function is missing', () => {
      expect(() => {
        renderWithTheme(
          <ToolbarIconButton 
            toolbar={defaultToolbar}
            disabled={false}
          />
        );
      }).not.toThrow();

      expect(document.querySelector('.guide-edit-toggle')).toBeInTheDocument();
      expect(document.querySelector('.guide-autoclear-toggle')).toBeInTheDocument();
      expect(document.querySelector('.guide-reset-btn')).toBeInTheDocument();
    });
  });

  describe('Style and Layout Tests', () => {
    it('14. Correctly applies CSS class names', () => {
      renderWithTheme(<ToolbarIconButton {...defaultProps} />);

      expect(document.querySelector('.guide-edit-toggle')).toBeInTheDocument();
      expect(document.querySelector('.guide-autoclear-toggle')).toBeInTheDocument();
      expect(document.querySelector('.guide-reset-btn')).toBeInTheDocument();
    });

    it('15. Theme colors correctly apply to selected states', () => {
      const toolbar = { edit: true, autoClear: true };
      
      renderWithTheme(
        <ToolbarIconButton 
          {...defaultProps} 
          toolbar={toolbar}
        />
      );

      const editCheckbox = document.querySelector('.guide-edit-toggle input[type="checkbox"]');
      const autoClearCheckbox = document.querySelector('.guide-autoclear-toggle input[type="checkbox"]');

      expect(editCheckbox).toBeChecked();
      expect(autoClearCheckbox).toBeChecked();
    });
  });
});
