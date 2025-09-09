"use client"

import React, { useState, useEffect, useCallback } from "react"

import { Eye, EyeOff, User, Mail, Lock, UserPlus, Check, X, AlertCircle, Loader2, Shield, Sparkles } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import Common from "./Common"

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isFormValid, setIsFormValid] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const validateField = useCallback((name, value) => {
    switch (name) {
      case "username":
        if (!value) return "Username is required"
        if (value.length < 3) return "Username must be at least 3 characters"
        if (value.length > 20) return "Username must be less than 20 characters"
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores"
        return ""

      case "email":
        if (!value) return "Email is required"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Please enter a valid email address"
        return ""

      case "password":
        if (!value) return "Password is required"
        if (value.length < 8) return "Password must be at least 8 characters"
        if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter"
        if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter"
        if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number"
        if (!/(?=.*[@$!%*?&])/.test(value)) return "Password must contain at least one special character"
        return ""

      case "confirmPassword":
        if (!value) return "Please confirm your password"
        if (value !== formData.password) return "Passwords do not match"
        return ""

      default:
        return ""
    }
  }, [formData.password]) // Add dependency to avoid stale closure

  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/(?=.*[a-z])/.test(password)) strength += 1
    if (/(?=.*[A-Z])/.test(password)) strength += 1
    if (/(?=.*\d)/.test(password)) strength += 1
    if (/(?=.*[@$!%*?&])/.test(password)) strength += 1
    if (password.length >= 12) strength += 1
    return Math.min(strength, 5)
  }, [])

  useEffect(() => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      if (touched[key]) {
        const error = validateField(key, formData[key])
        if (error) newErrors[key] = error
      }
    })
    setErrors(prevErrors => ({
      ...prevErrors,
      ...newErrors,
      // Keep submit error if it exists
      ...(prevErrors.submit && { submit: prevErrors.submit })
    }))

    // Check if form is valid
    const hasErrors = Object.keys(newErrors).length > 0
    const allFieldsFilled = Object.values(formData).every((value) => value.trim() !== "")
    setIsFormValid(!hasErrors && allFieldsFilled)

    // Update password strength
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password))
    } else {
      setPasswordStrength(0)
    }
  }, [formData, touched, validateField, calculatePasswordStrength])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    
    // Clear server errors when user starts typing
    setErrors(prev => {
      if (prev.submit) {
        const { submit, ...rest } = prev
        return rest
      }
      return prev
    })
  }, [])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))
  }, [])

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    // Validate all fields
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        navigate("/dashboard")
      } else {
        setErrors({ submit: result.message || "Registration failed. Please try again." })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "Registration failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordStrengthIndicator = ({ strength }) => {
    const getStrengthColor = () => {
      if (strength <= 2) return "bg-red-500"
      if (strength <= 3) return "bg-yellow-500"
      if (strength <= 4) return "bg-blue-500"
      return "bg-green-500"
    }

    const getStrengthText = () => {
      if (strength <= 2) return "Weak"
      if (strength <= 3) return "Fair"
      if (strength <= 4) return "Good"
      return "Strong"
    }

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
          <span>Password strength</span>
          <span
            className={`font-medium ${
              strength <= 2 
                ? "text-red-400" 
                : strength <= 3 
                  ? "text-yellow-400" 
                  : strength <= 4 
                    ? "text-blue-400" 
                    : "text-green-400"
            }`}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                level <= strength ? getStrengthColor() : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Common>
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-6">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-gray-400 flex items-center justify-center space-x-1">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Join thousands of users building better habits</span>
            </p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{errors.submit}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-1">
                <div className="relative group">
                  <User
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                      errors.username 
                        ? "text-red-400" 
                        : !errors.username && touched.username && formData.username
                          ? "text-green-400" 
                          : "text-gray-400 group-focus-within:text-indigo-400"
                    }`}
                  />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={`pl-10 pr-10 w-full py-4 border-2 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      errors.username
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : !errors.username && touched.username && formData.username
                          ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-600"
                    }`}
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {!errors.username && touched.username && formData.username && (
                    <Check className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  )}
                  {errors.username && (
                    <X className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400" />
                  )}
                </div>
                {errors.username && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <div className="relative group">
                  <Mail
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                      errors.email 
                        ? "text-red-400" 
                        : !errors.email && touched.email && formData.email
                          ? "text-green-400" 
                          : "text-gray-400 group-focus-within:text-indigo-400"
                    }`}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`pl-10 pr-10 w-full py-4 border-2 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      errors.email
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : !errors.email && touched.email && formData.email
                          ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-600"
                    }`}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {!errors.email && touched.email && formData.email && (
                    <Check className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  )}
                  {errors.email && (
                    <X className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-400" />
                  )}
                </div>
                {errors.email && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="space-y-1">
                  <div className="relative group">
                    <Lock
                      className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                        errors.password 
                          ? "text-red-400" 
                          : !errors.password && touched.password && formData.password
                            ? "text-green-400" 
                            : "text-gray-400 group-focus-within:text-indigo-400"
                      }`}
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className={`pl-10 pr-10 w-full py-4 border-2 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                        errors.password
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : !errors.password && touched.password && formData.password
                            ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                            : "border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-600"
                      }`}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                      onClick={togglePassword}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center space-x-1 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
                {formData.password && <PasswordStrengthIndicator strength={passwordStrength} />}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <div className="relative group">
                  <Shield
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                      errors.confirmPassword 
                        ? "text-red-400" 
                        : !errors.confirmPassword && touched.confirmPassword && formData.confirmPassword
                          ? "text-green-400" 
                          : "text-gray-400 group-focus-within:text-indigo-400"
                    }`}
                  />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`pl-10 pr-10 w-full py-4 border-2 rounded-xl bg-gray-800/50 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20 ${
                      errors.confirmPassword
                        ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                        : !errors.confirmPassword && touched.confirmPassword && formData.confirmPassword
                          ? "border-green-500/50 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20 hover:border-gray-600"
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    onClick={toggleConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center space-x-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  isLoading || !isFormValid
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-0.5"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating your account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Create account</span>
                  </div>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-800">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center space-x-1">
              <Shield className="h-2 w-2" />
              <span>Your data is encrypted and secure</span>
            </p>
          </div>
        </div>
      </div>
    </Common>
  )
}

export default RegisterForm