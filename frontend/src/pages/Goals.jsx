import React, { useState, useMemo } from "react"
import { FiPlus, FiTarget, FiEdit2, FiTrash2, FiTrendingUp, FiX, FiAlertTriangle } from "react-icons/fi"
import { useData } from "../context/DataContext"
import { formatCurrency, formatDate } from "../utils/formatDate"

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [filter, setFilter] = useState("all")
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [progressAmount, setProgressAmount] = useState("")
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter goals by progress status
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const progress = (goal.savedAmount / goal.targetAmount) * 100

      switch (filter) {
        case "just-started":
          return progress < 33
        case "in-progress":
          return progress >= 33 && progress < 67
        case "almost-there":
          return progress >= 67 && progress < 100
        case "completed":
          return progress >= 100
        default:
          return true
      }
    })
  }, [goals, filter])

  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-blue-500"
    if (progress >= 67) return "bg-green-500"
    if (progress >= 33) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getProgressLabel = (progress) => {
    if (progress >= 100) return "Completed"
    if (progress >= 67) return "Almost There"
    if (progress >= 33) return "In Progress"
    return "Just Started"
  }

  const getProgressTextColor = (progress) => {
    if (progress >= 100) return "text-blue-600 dark:text-blue-400"
    if (progress >= 67) return "text-green-600 dark:text-green-400"
    if (progress >= 33) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const handleAddProgress = async () => {
    if (!selectedGoal || !progressAmount) return

    const amount = Number.parseFloat(progressAmount)
    if (amount <= 0) return

    const newSavedAmount = selectedGoal.savedAmount + amount
    await updateGoal(selectedGoal._id, { savedAmount: newSavedAmount })

    setShowProgressModal(false)
    setSelectedGoal(null)
    setProgressAmount("")
  }

  const handleAddGoal = async (goalData) => {
    if (editGoal) {
      return await updateGoal(editGoal._id, goalData)
    } else {
      return await addGoal(goalData)
    }
  }

  const handleEditGoal = (goal) => {
    setEditGoal(goal)
    setShowModal(true)
  }

  const handleDeleteClick = (goal) => {
    setGoalToDelete(goal)
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return

    setIsDeleting(true)
    await deleteGoal(goalToDelete._id)
    setIsDeleting(false)
    setShowDeleteConfirmation(false)
    setGoalToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
    setGoalToDelete(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditGoal(null)
  }

  return (
    <div className="space-y-6 pb-32 lg:pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-top duration-500">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FiTarget className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Financial Goals
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                Track your savings goals and progress • {filteredGoals.length} goal
                {filteredGoals.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg border-2 border-purple-500"
          >
            <FiPlus className="h-6 w-6" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Total Goals",
            value: goals.length,
            icon: "🎯",
            textColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/10",
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Completed",
            value: goals.filter((g) => (g.savedAmount / g.targetAmount) * 100 >= 100).length,
            icon: "✅",
            textColor: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/10",
            iconBg: "bg-green-100 dark:bg-blue-900/30",
          },
          {
            title: "In Progress",
            value: goals.filter((g) => {
              const p = (g.savedAmount / g.targetAmount) * 100
              return p > 0 && p < 100
            }).length,
            icon: "🚀",
            textColor: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-50 dark:bg-orange-900/10",
            iconBg: "bg-orange-100 dark:bg-blue-900/30",
          },
        ].map((stat, index) => (
          <div
            key={stat.title}
            className={`card p-6 ${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stat.title === "Total Goals"
                    ? `${goals.length} goal${goals.length !== 1 ? "s" : ""} created`
                    : stat.title === "Completed"
                      ? `${stat.value} goal${stat.value !== 1 ? "s" : ""} achieved`
                      : `${stat.value} goal${stat.value !== 1 ? "s" : ""} active`}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="card p-4 animate-in slide-in-from-bottom duration-700" style={{ animationDelay: "300ms" }}>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All Goals", count: goals.length },
            {
              key: "just-started",
              label: "Just Started",
              count: goals.filter((g) => (g.savedAmount / g.targetAmount) * 100 < 33).length,
            },
            {
              key: "in-progress",
              label: "In Progress",
              count: goals.filter((g) => {
                const p = (g.savedAmount / g.targetAmount) * 100
                return p >= 33 && p < 67
              }).length,
            },
            {
              key: "almost-there",
              label: "Almost There",
              count: goals.filter((g) => {
                const p = (g.savedAmount / g.targetAmount) * 100
                return p >= 67 && p < 100
              }).length,
            },
            {
              key: "completed",
              label: "Completed",
              count: goals.filter((g) => (g.savedAmount / g.targetAmount) * 100 >= 100).length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filter === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="card p-8 text-center animate-in fade-in duration-500">
          <div className="text-gray-400 dark:text-gray-500 mb-4 animate-bounce">
            <FiTarget className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter === "all" ? "No goals yet" : `No goals in "${filter.replace("-", " ")}" category`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {filter === "all"
              ? "Start by creating your first financial goal to track your savings progress."
              : `Create goals or check other categories to see your progress.`}
          </p>
          {filter === "all" && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            >
              <FiPlus className="h-5 w-5" />
              Create Your First Goal
            </button>
          )}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-4"></div>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700"
          style={{ animationDelay: "400ms" }}
        >
          {filteredGoals.map((goal, index) => {
            const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
            const isOverdue = new Date(goal.deadline) < new Date() && progress < 100

            return (
              <div
                key={goal._id}
                className="card p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Target: {formatCurrency(goal.targetAmount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Deadline: {formatDate(goal.deadline)}
                      {isOverdue && <span className="text-red-500 ml-1 font-medium">(Overdue)</span>}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal)
                        setShowProgressModal(true)
                      }}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-all duration-200 transform hover:scale-110 p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Add progress"
                    >
                      <FiTrendingUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 transform hover:scale-110 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      title="Edit goal"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(goal)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 transform hover:scale-110 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete goal"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    <span className={`text-sm font-medium ${getProgressTextColor(progress)}`}>
                      {progress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(progress)} shadow-sm`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(goal.savedAmount)}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        progress >= 100
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          : progress >= 67
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : progress >= 33
                              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {getProgressLabel(progress)}
                    </span>
                  </div>
                </div>

                {/* Remaining Amount */}
                {progress < 100 && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <span className="font-medium">Remaining:</span>{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(goal.targetAmount - goal.savedAmount)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showModal && (
        <GoalModal isOpen={showModal} onClose={handleCloseModal} onSubmit={handleAddGoal} editGoal={editGoal} />
      )}

      {/* Add Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedGoal?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowProgressModal(false)
                  setSelectedGoal(null)
                  setProgressAmount("")
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 transform hover:scale-110 hover:rotate-90 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current progress: {formatCurrency(selectedGoal?.savedAmount || 0)} /{" "}
                  {formatCurrency(selectedGoal?.targetAmount || 0)}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(((selectedGoal?.savedAmount || 0) / (selectedGoal?.targetAmount || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount to Add (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter amount"
                  value={progressAmount}
                  onChange={(e) => setProgressAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowProgressModal(false)
                    setSelectedGoal(null)
                    setProgressAmount("")
                  }}
                  className="btn-secondary transition-all duration-200 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProgress}
                  className="btn-primary transition-all duration-200 transform hover:scale-105"
                  disabled={!progressAmount || Number.parseFloat(progressAmount) <= 0}
                >
                  Add Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && goalToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Goal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone. Are you sure?
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Goal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{goalToDelete.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Target:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(goalToDelete.targetAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Saved:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(goalToDelete.savedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(goalToDelete.deadline)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {((goalToDelete.savedAmount / goalToDelete.targetAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 btn-secondary transition-all duration-200 transform hover:scale-105"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    "Delete Goal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Goal Modal Component (unchanged from previous version)
const GoalModal = ({ isOpen, onClose, onSubmit, editGoal }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    savedAmount: "0",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  React.useEffect(() => {
    if (editGoal) {
      setFormData({
        name: editGoal.name,
        targetAmount: editGoal.targetAmount.toString(),
        deadline: editGoal.deadline,
        savedAmount: editGoal.savedAmount.toString(),
      })
    } else {
      setFormData({
        name: "",
        targetAmount: "",
        deadline: "",
        savedAmount: "0",
      })
    }
    setErrors({})
  }, [editGoal, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Goal name is required"
    }

    if (!formData.targetAmount || Number.parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than 0"
    }

    if (!formData.deadline) {
      newErrors.deadline = "Deadline is required"
    } else {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate < today) {
        newErrors.deadline = "Deadline cannot be in the past"
      }
    }

    if (formData.savedAmount && Number.parseFloat(formData.savedAmount) < 0) {
      newErrors.savedAmount = "Saved amount cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    const goalData = {
      ...formData,
      targetAmount: Number.parseFloat(formData.targetAmount),
      savedAmount: Number.parseFloat(formData.savedAmount || 0),
    }

    const result = await onSubmit(goalData)

    if (result.success) {
      onClose()
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editGoal ? "Edit Goal" : "Add Goal"}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Goal Name *</label>
            <input
              type="text"
              name="name"
              className={`input-field transition-all duration-200 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-xs flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                <FiTarget className="h-3 w-3" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Target Amount (₹) *</label>
            <input
              type="number"
              name="targetAmount"
              min="0"
              step="0.01"
              className={`input-field transition-all duration-200 ${
                errors.targetAmount
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="0.00"
              value={formData.targetAmount}
              onChange={handleChange}
            />
            {errors.targetAmount && (
              <p className="text-red-500 text-xs flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                <FiTarget className="h-3 w-3" />
                <span>{errors.targetAmount}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Target Deadline *</label>
            <input
              type="date"
              name="deadline"
              className={`input-field transition-all duration-200 ${
                errors.deadline
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-blue-500 focus:border-blue-500"
              }`}
              value={formData.deadline}
              onChange={handleChange}
            />
            {errors.deadline && (
              <p className="text-red-500 text-xs flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                <FiTarget className="h-3 w-3" />
                <span>{errors.deadline}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Current Saved Amount (₹)
            </label>
            <input
              type="number"
              name="savedAmount"
              min="0"
              step="0.01"
              className={`input-field transition-all duration-200 ${
                errors.savedAmount
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="0.00"
              value={formData.savedAmount}
              onChange={handleChange}
            />
            {errors.savedAmount && (
              <p className="text-red-500 text-xs flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                <FiTarget className="h-3 w-3" />
                <span>{errors.savedAmount}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto transition-all duration-200 transform hover:scale-105"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FiTarget className="h-4 w-4" />
                  <span>{editGoal ? "Update Goal" : "Create Goal"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Goals
