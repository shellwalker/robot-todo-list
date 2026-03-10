import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders todo list header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Robot Todo List/i);
  expect(headerElement).toBeInTheDocument();
});

test('can add a new todo', () => {
  render(<App />);
  
  const input = screen.getByPlaceholderText(/添加新任务/i);
  const button = screen.getByText(/添加/i);
  
  fireEvent.change(input, { target: { value: '测试任务' } });
  fireEvent.click(button);
  
  expect(screen.getByText('测试任务')).toBeInTheDocument();
});

test('can delete a todo', () => {
  render(<App />);
  
  const input = screen.getByPlaceholderText(/添加新任务/i);
  const button = screen.getByText(/添加/i);
  
  fireEvent.change(input, { target: { value: '测试任务' } });
  fireEvent.click(button);
  
  const deleteBtn = screen.getByText('🗑️');
  fireEvent.click(deleteBtn);
  
  expect(screen.queryByText('测试任务')).not.toBeInTheDocument();
});
