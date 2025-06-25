import { useState } from "react"
import { FiUser, FiLock, FiCamera, FiSave } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"

const Settings = () => {
  const { user, updateProfile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [message, setMessage] = useState({ type: "", text: "" })
  const [selectedImageFile, setSelectedImageFile] = useState(null)

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    const formData = new FormData()
    formData.append("name", profileData.name)
    if (selectedImageFile) {
      formData.append("avatar", selectedImageFile)
    }

    const result = await updateProfile(formData, true)

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" })
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile" })
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
      return
    }

    // Mock password update
    setMessage({ type: "success", text: "Password updated successfully!" })
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          profilePicture: e.target.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: FiUser },
    { id: "password", label: "Password", icon: FiLock },
  ]

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="card p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon className="mr-3 h-4 w-4" />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {message.text && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Profile Information</h2>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {profileData.profilePicture ? (
                        <img
                          src={profileData.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          className="h-20 w-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <FiUser className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                        <FiCamera className="h-4 w-4" />
                        Change Photo
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="input-field"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="input-field"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                      <FiSave className="h-4 w-4" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Change Password</h2>

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="input-field"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      className="input-field"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="input-field"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                      <FiLock className="h-4 w-4" />
                      {loading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
