import { useState, useEffect } from "react"
import { FiX, FiPlus, FiSave, FiAlertCircle } from "react-icons/fi"

const AddTransactionModal = ({ isOpen, onClose, onSubmit, editTransaction = null ,page="transactions" }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense",
    tags: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        title: editTransaction.title,
        amount: editTransaction.amount.toString(),
        date: editTransaction.date,
        type: editTransaction.type,
        tags: editTransaction.tags.join(", "),
        notes: editTransaction.notes || "",
      })
    } else {
      setFormData({
        title: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        type: "expense",
        tags: "",
        notes: "",
      })
    }
    setErrors({})
    setShowConfirmation(false)
  }, [editTransaction, isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
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

    if (editTransaction) {
      setShowConfirmation(true)
      return
    }

    await submitTransaction()
  }

  const submitTransaction = async () => {
    setLoading(true)

    const transactionData = {
      ...formData,
      amount: Number.parseFloat(formData.amount),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    const result = await onSubmit(transactionData)

    if (result.success) {
      onClose()
    }

    setLoading(false)
    setShowConfirmation(false)
  }

  const handleConfirmUpdate = () => {
    submitTransaction()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editTransaction ? "Edit Transaction" : "Add Transaction"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Transaction Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className={`input-field transition-all duration-200 ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                placeholder="e.g., Grocery shopping, Salary, Coffee"
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && (
                <p className="text-red-500 text-xs flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                  <FiAlertCircle className="h-3 w-3" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Amount and Type */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="0"
                  step="0.01"
                  className={`input-field ${
                    errors.amount
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs flex items-center space-x-1">
                    <FiAlertCircle className="h-3 w-3" />
                    <span>{errors.amount}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type *
                </label>
                <select
                  id="type"
                  name="type"
                  className="input-field focus:ring-blue-500 focus:border-blue-500"
                  value={formData.type}
                  onChange={handleChange}
                >
                  { (page==="transactions" || page==="incomes" ) && <option value="income">💰 Income</option>}
                  { (page==="transactions" || page==="expenses" ) && <option value="expense">💸 Expense</option>}
          
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className={`input-field transition-all duration-200 ${
                  errors.date
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "focus:ring-blue-500 focus:border-blue-500"
                }`}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && (
                <p className="text-red-500 text-xs flex items-center space-x-1 animate-in slide-in-from-top duration-200">
                  <FiAlertCircle className="h-3 w-3" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="input-field focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="food, groceries, essentials (comma-separated)"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                className="input-field resize-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Add any additional details about this transaction..."
                value={formData.notes}
                onChange={handleChange}
              />
            </div>

            {/* Action Buttons */}
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
                    {editTransaction ? <FiSave className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
                    <span>{editTransaction ? "Update Transaction" : "Add Transaction"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal for Updates */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[110] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <FiAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Update</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to update this transaction?
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Title:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span
                      className={`font-bold ${
                        formData.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formData.type === "income" ? "+" : "-"}₹{formData.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{formData.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 btn-secondary transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="flex-1 btn-primary transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Confirm Update"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AddTransactionModal
