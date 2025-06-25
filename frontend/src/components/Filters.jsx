import { useState } from "react"
import { FiSearch, FiFilter, FiX, FiCalendar } from "react-icons/fi"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const Filters = ({ filters, onFiltersChange, availableTags = [],page="transactions" }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag]

    handleFilterChange("tags", newTags)
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      type: "",
      tags: [],
      amountRange: "",
      dateRange: { start: null, end: null },
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.type ||
    (filters.tags && filters.tags.length > 0) ||
    filters.amountRange ||
    (filters.dateRange && (filters.dateRange.start || filters.dateRange.end))

  return (
    <div className="card p-4 lg:p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            className="input-field min-w-32 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.type || ""}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
          { page==="transactions" && <option value="">All Types</option>}
          { (page==="transactions"|| page==="incomes" ) && <option value="income">💰 Income</option>}
          { (page==="transactions"|| page==="expenses" ) && <option value="expense">💸 Expense</option>}
          </select>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`btn-secondary flex items-center justify-center gap-2 px-4 py-2 transition-all duration-200 transform hover:scale-105 ${
              showAdvanced ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-md" : ""
            }`}
          >
            <FiFilter className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-110"
              title="Clear all filters"
            >
              <FiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Amount Range */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">💰 Amount Range</label>
              <select
                className="input-field transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filters.amountRange || ""}
                onChange={(e) => handleFilterChange("amountRange", e.target.value)}
              >
                <option value="">All Amounts</option>
                <option value="below-1000">Below ₹1,000</option>
                <option value="1000-10000">₹1,000 - ₹10,000</option>
                <option value="above-10000">Above ₹10,000</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">📅 Date Range</label>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="input-field flex items-center justify-between w-full transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span
                    className={`${
                      filters.dateRange?.start && filters.dateRange?.end
                        ? "text-gray-900 dark:text-white font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {filters.dateRange?.start && filters.dateRange?.end
                      ? `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
                      : "Select date range"}
                  </span>
                  <FiCalendar className="h-4 w-4 text-gray-400" />
                </button>

                {showDatePicker && (
                  <div className="absolute top-full left-0 z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 min-w-80 animate-in slide-in-from-top duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <DatePicker
                          selected={filters.dateRange?.start}
                          onChange={(date) =>
                            handleFilterChange("dateRange", {
                              ...filters.dateRange,
                              start: date,
                            })
                          }
                          selectsStart
                          startDate={filters.dateRange?.start}
                          endDate={filters.dateRange?.end}
                          className="input-field text-sm w-full"
                          placeholderText="Start date"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          End Date
                        </label>
                        <DatePicker
                          selected={filters.dateRange?.end}
                          onChange={(date) =>
                            handleFilterChange("dateRange", {
                              ...filters.dateRange,
                              end: date,
                            })
                          }
                          selectsEnd
                          startDate={filters.dateRange?.start}
                          endDate={filters.dateRange?.end}
                          minDate={filters.dateRange?.start}
                          className="input-field text-sm w-full"
                          placeholderText="End date"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          handleFilterChange("dateRange", { start: null, end: null })
                          setShowDatePicker(false)
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="btn-primary text-sm px-4 py-1 transition-all duration-200 transform hover:scale-105"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🏷️ Tags</label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                {availableTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                          filters.tags?.includes(tag)
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No tags available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filters
