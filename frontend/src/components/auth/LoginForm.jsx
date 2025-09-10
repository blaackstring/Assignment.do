import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Common from './Common';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitAttempts, setSubmitAttempts] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailInputRef = useRef(null);
  
  // Get intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    return newErrors;
  };

  // Debounced validation for real-time feedback
  const handleFieldValidation = useCallback((fieldName, value) => {
    if (submitAttempts > 0) {
      const newErrors = { ...errors };
      
      if (fieldName === 'email') {
        const emailError = validateEmail(value);
        if (emailError) {
          newErrors.email = emailError;
        } else {
          delete newErrors.email;
        }
      } else if (fieldName === 'password') {
        const passwordError = validatePassword(value);
        if (passwordError) {
          newErrors.password = passwordError;
        } else {
          delete newErrors.password;
        }
      }
      
      setErrors(newErrors);
    }
  }, [errors, submitAttempts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear server errors when user starts typing
    if (errors.server) {
      setErrors(prev => ({ ...prev, server: null }));
    }
    
    // Real-time validation after first submit attempt
    handleFieldValidation(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempts(prev => prev + 1);
    
    // Client-side validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first error field
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField === 'email') {
        emailInputRef.current?.focus();
      } else {
        document.getElementById('password')?.focus();
      }
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        // Clear form data on success
        setFormData({ email: '', password: '' });
        navigate(from, { replace: true });
      } else {
        // Handle different types of errors
        if (result.error === 'invalid_credentials') {
           toast.error('invalid_credentials')
          setErrors({ 
            server: 'Invalid email or password. Please try again.' 
          });
        } else if (result.error === 'account_locked') {
          setErrors({ 
            server: 'Account temporarily locked due to too many failed attempts. Please try again later.' 
          });
        } else if (result.error === 'email_not_verified') {
          setErrors({ 
            server: 'Please verify your email address before signing in.' 
          });
        } else if (result.error === 'network_error') {
          setErrors({ 
            server: 'Network error. Please check your connection and try again.' 
          });
        } else {
          setErrors({ 
            server: result.message || 'An error occurred. Please try again.' 
          });
        }
        
        // Focus email field for retry
        emailInputRef.current?.focus();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        server: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter key
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  };

  return (
    <Common>

<div className="min-h-screen flex items-center justify-center  bg-black px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white z-10">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your habit tracker account
          </p>
        </div>

        {/* Server Error Display */}
        {errors.server && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-700">{errors.server}</p>
            </div>
          </div>
        )}

        <form className="mt-5 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                 required
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`pl-10 appearance-none rounded-lg relative block w-full px-3 py-3 border ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : ' focus:ring-indigo-500 focus:border-indigo-500'
                  } placeholder-gray-500 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors text-white`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`pl-10 pr-10 text-white appearance-none rounded-lg relative block w-full px-3 py-3 border ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } placeholder-gray-500 focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right relative ">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 sticky w-max hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:rounded"
              tabIndex={isLoading ? -1 : 0}
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center absolute">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                state={{ from: location.state?.from }}
                className="font-medium text-indigo-600 z-20 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:rounded"
                tabIndex={isLoading ? -1 : 0}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </Common>
  );
};

export default LoginForm;