import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app with default list', () => {
  render(<App />);
  // 新版本显示"我的清单"
  const headerElement = screen.getByText(/我的清单/i);
  expect(headerElement).toBeInTheDocument();
});
