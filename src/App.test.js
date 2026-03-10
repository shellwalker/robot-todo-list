import { render, screen } from '@testing-library/react';
import App from './App';

test('renders todo list header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Robot Todo List/i);
  expect(headerElement).toBeInTheDocument();
});

test('shows empty state initially', () => {
  render(<App />);
  const emptyState = screen.getByText(/暂无任务/i);
  expect(emptyState).toBeInTheDocument();
});
