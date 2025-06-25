"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useGoogleLogin, googleLogout } from '@react-oauth/google'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only check auth once on mount
    let didCancel = false;
    const checkAuth = async () => {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!didCancel) setUser(response.data.user)
        } catch (err) {
          localStorage.removeItem('token')
          if (!didCancel) setUser(null)
        } finally {
          if (!didCancel) setLoading(false)
        }
      } else {
        if (!didCancel) setUser(null)
        if (!didCancel) setLoading(false)
      }
    }
    checkAuth()
    return () => { didCancel = true }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await api.post('/user/login', { email, password })
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Invalid credentials" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setLoading(true)
    try {
      const response = await api.post('/user/signup', { name, email, password })
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed"
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Google OAuth Login Handler
  const handleGoogleLoginSuccess = async (tokenResponse) => {
    setLoading(true)
    try {
      const response = await api.post('/user/google-login', {
        code: tokenResponse.code
      })
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        setUser(response.data.user)
        return { success: true }
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Google login failed"
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Google OAuth Error Handler
  const handleGoogleLoginError = (error) => {
    console.error('Google login error:', error)
    return { 
      success: false, 
      error: "Google login failed. Please try again." 
    }
  }

  // 🎯 Create Google Login Hook
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
    scope: 'openid profile email',
    flow: 'auth-code' // Use authorization code flow for better security
  })

// wherever you manage auth (e.g. AuthContext or a custom hook)

const logout = async () => {
  try {

     if (user?.authProvider === 'google') {
      googleLogout()
    }
    const response = await api.get('/user/logout');
    

    if (response.status === 200) {
     
      setUser(null);
      // Optionally also clear tokens, localStorage, etc.
      localStorage.removeItem('token');
     
      
      return { success: true };
    } else {
      // non‑200 status codes
      console.warn('Logout returned non‑200 status:', response.status);
      return { success: false };
    }
  } catch (err) {
    // 4️⃣ Network / server error
    console.error('Logout failed:', err);
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
};


  const updateProfile = async (updates, isMultipart = false) => {
    setLoading(true)
 
    try {
      let response;
      if (isMultipart) {
        if (updates instanceof FormData) {
          for (let pair of updates.entries()) {
            console.log('FormData:', pair[0], pair[1]);
          }
        }
        response = await api.put('/user/update-profile', updates, {
          headers:{
          'Content-Type': 'multipart/form-data'
              // Optional: for protected APIs
        }, // Let Axios set Content-Type for FormData
          withCredentials: true,
        });
      } else {
        console.log('updateProfile JSON payload:', updates);
        response = await api.put('/user/update-profile', updates, {
          withCredentials: true,
        });
      }
      console.log('response.data.user', response.data.user)
      setUser(response.data.user)
      return { success: true }
    } catch (error) {
      return { success: false, error: "Profile update failed" }
    } finally {
      setLoading(false)
    }
  }

  // For file upload, override the global Content-Type header with multipart/form-data.
  // Axios will set the correct boundary automatically. Do NOT set this globally!
  // const uploadProfilePicture = async (formData) => {
  //   const res = await api.patch('/user/profile-picture', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' }
  //   });
  //   if (res.status === 200) {
  //     // update user state with new profilePicUrl from res.data
  //     setUser(user => ({ ...user, profilePicture: res.data.profilePicUrl }));
  //     return { success: true };
  //   }
  //   return { success: false };
  // };


  // Helper: Only redirect to login if not loading and user is null
  // Use this in your protected route logic, not here in context

  // Example usage in your route (not in this file):
  // if (!loading && !user) navigate('/login')
  // if (!loading && user) show transactions

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        googleLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
