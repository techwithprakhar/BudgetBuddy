import { useState, useEffect, useRef } from "react"
import { FiMenu, FiSun, FiMoon, FiUser, FiX } from "react-icons/fi"
import { NavLink } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const userMenuRef = useRef(null)

  const navItems = [
    { to: "/transactions", label: "Transactions", icon: "🏠" },
    { to: "/income", label: "Income", icon: "💰" },
    { to: "/expenses", label: "Expenses", icon: "💸" },
    { to: "/goals", label: "Goals", icon: "🎯" },
    { to: "/settings", label: "Settings", icon: "⚙️" },
  ]

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setShowMobileMenu(false)
  }, [])

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-[90] transition-all duration-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <div className="flex-shrink-0 ml-2 lg:ml-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ExpenseTracker
                </h1>
              </div>
            </div>

            {/* Center - Welcome message (hidden on mobile) */}
            <div className="hidden md:flex items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user?.name}</span>
              </p>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 hover:rotate-12"
                aria-label="Toggle theme"
              >
                {isDark ? <FiSun className="h-5 w-5 animate-pulse" /> : <FiMoon className="h-5 w-5" />}
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="h-8 w-8 rounded-full ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 transition-all duration-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <FiUser className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium truncate max-w-24">{user?.name}</span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[95] lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Navigation</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose a section</p>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 hover:rotate-90"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Menu Navigation */}
            <nav className="flex-1 px-4 py-6">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMobileMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                        isActive
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`
                    }
                  >
                    <span className="text-2xl mr-4">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-4">
                  <div className="flex items-center space-x-3">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg"}
                        alt="Profile"
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{user?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout()
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-105"
                >
                  <span className="text-xl mr-4">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
