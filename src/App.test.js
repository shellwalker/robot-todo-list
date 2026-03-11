import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Supabase
jest.mock('./lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [{ id: '1', name: '我的任务', theme_id: 'purple' }], error: null })),
    })),
  })),
}));

import App from './App';

test('renders app with default list', async () => {
  render(<App />);
  
  // 等待数据加载完成
  await waitFor(() => {
    expect(screen.getByText(/我的任务/i)).toBeInTheDocument();
  });
});
