import { NavLink } from "react-router-dom"
import { FiHome, FiTrendingUp, FiTrendingDown, FiTarget, FiSettings, FiLogOut } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const Sidebar = ({ showMobileMenu, setShowMobileMenu }) => {
  const { logout } = useAuth()

  const navItems = [
    { to: "/transactions", icon: FiHome, label: "Transactions", color: "blue" },
    { to: "/income", icon: FiTrendingUp, label: "Income", color: "green" },
    { to: "/expenses", icon: FiTrendingDown, label: "Expenses", color: "red" },
    { to: "/goals", icon: FiTarget, label: "Goals", color: "purple" },
    { to: "/settings", icon: FiSettings, label: "Settings", color: "gray" },
  ]

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive
        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500"
        : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400",
      green: isActive
        ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-r-2 border-green-500"
        : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400",
      red: isActive
        ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-r-2 border-red-500"
        : "text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",
      purple: isActive
        ? "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-r-2 border-purple-500"
        : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400",
      gray: isActive
        ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-r-2 border-gray-500"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
    }
    return colors[color] || colors.gray
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:z-40">
        <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16 shadow-lg transition-colors duration-200">
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-md ${getColorClasses(item.color, isActive)}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                      />
                      <span className="transition-all duration-200">{item.label}</span>
                      {isActive && <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-105"
              >
                <FiLogOut className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 shadow-lg">
        <nav className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 text-xs font-medium transition-all duration-200 transform hover:scale-110 ${
                  isActive
                    ? `text-${item.color}-600 dark:text-${item.color}-400`
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 mb-1 transition-all duration-200 ${isActive ? "scale-110" : ""}`} />
                  <span className="transition-all duration-200">{item.label}</span>
                  {isActive && <div className="absolute -top-1 w-1 h-1 bg-current rounded-full animate-pulse" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
