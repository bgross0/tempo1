import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/test-utils';
import { supabase } from '@/lib/supabase';
import LoginForm from '@/app/(auth)/login/LoginForm';
import SignupForm from '@/app/(auth)/signup/SignupForm';

// The supabase mock is already set up in test-utils

describe('Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      // Mock successful login
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'fake-token' }
        },
        error: null
      });

      // Render login form
      render(<LoginForm />);

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify Supabase was called with correct arguments
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should handle login errors', async () => {
      // Mock login error
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      // Render login form
      render(<LoginForm />);

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Invalid login credentials/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      // Render login form
      render(<LoginForm />);

      // Submit the form without filling it
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Signup Flow', () => {
    it('should handle successful signup', async () => {
      // Mock successful signup
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: { id: 'user-123', email: 'new@example.com' },
          session: { access_token: 'fake-token' }
        },
        error: null
      });

      // Render signup form
      render(<SignupForm />);

      // Fill out the form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'Password123!' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      // Verify Supabase was called with correct arguments
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'Password123!',
          options: expect.any(Object)
        });
      });
    });

    it('should validate password strength', async () => {
      // Render signup form
      render(<SignupForm />);

      // Fill out the form with a weak password
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'weak' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'weak' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      // Render signup form
      render(<SignupForm />);

      // Fill out the form with mismatched passwords
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'DifferentPassword!' }
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      // Check for validation errors
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });
});