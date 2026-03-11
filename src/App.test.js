import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock useSupabase hook
jest.mock('./hooks/useSupabase', () => ({
  __esModule: true,
  default: () => ({
    lists: [{ id: '1', name: '我的任务', theme_id: 'purple', tasks: [] }],
    activeListId: '1',
    setActiveListId: jest.fn(),
    activeList: { id: '1', name: '我的任务', theme_id: 'purple', tasks: [] },
    activeTasks: [],
    loading: false,
    error: null,
    addList: jest.fn(),
    deleteList: jest.fn(),
    updateListTheme: jest.fn(),
    addTask: jest.fn(),
    toggleTask: jest.fn(),
    deleteTask: jest.fn(),
    addStep: jest.fn(),
    toggleStep: jest.fn(),
  }),
}));

import App from './App';

test('renders app with default list', () => {
  render(<App />);
  // 验证标题显示
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    /我的任务/i
  );
});
