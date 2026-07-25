import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { Button }
from '../components/common/Button';

describe('Button Component', () => {

  it('renders with correct text', () => {

    render(<Button>Click me</Button>);

    expect(
      screen.getByText('Click me')
    ).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {

    const handleClick = jest.fn();

    render(
      <Button onClick={handleClick}>
        Click
      </Button>
    );

    await userEvent.click(
      screen.getByText('Click')
    );

    expect(handleClick)
      .toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', () => {

    render(
      <Button disabled>
        Click
      </Button>
    );

    expect(
      screen.getByRole('button')
    ).toBeDisabled();
  });
});