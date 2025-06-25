import React, { useState } from "react"
import { FiEdit2, FiTrash2, FiFileText, FiChevronDown, FiChevronUp, FiEye } from "react-icons/fi"
import { formatDate, formatCurrency } from "../utils/formatDate"

const TransactionTable = ({ transactions, onEdit, onDelete }) => {
  const [expandedNotes, setExpandedNotes] = useState(new Set())
  const [hoveredRow, setHoveredRow] = useState(null)

  const toggleNotes = (id) => {
    const newExpanded = new Set(expandedNotes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNotes(newExpanded)
  }

  if (transactions.length === 0) {
    return (
      <div className="card p-8 text-center animate-in fade-in duration-500">
        <div className="text-gray-400 dark:text-gray-500 mb-4 animate-bounce">
          <FiFileText className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No transactions found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Start by adding your first transaction to track your finances.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-hidden animate-in slide-in-from-bottom duration-500">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction, index) => (
                <React.Fragment key={transaction._id}>
                  <tr
                    className={`transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transform hover:scale-[1.01] ${
                      hoveredRow === transaction._id ? "bg-gray-50 dark:bg-gray-700 shadow-md" : ""
                    }`}
                    onMouseEnter={() => setHoveredRow(transaction._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-4 w-4 rounded-full mr-3 transition-all duration-300 ${
                            transaction.type === "income"
                              ? "bg-gradient-to-r from-green-400 to-green-500 shadow-green-200 dark:shadow-green-800"
                              : "bg-gradient-to-r from-red-400 to-red-500 shadow-red-200 dark:shadow-red-800"
                          } ${hoveredRow === transaction._id ? "shadow-lg scale-110" : "shadow-md"}`}
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                            {transaction.title}
                          </div>
                          <div
                            className={`text-xs font-medium capitalize px-2 py-1 rounded-full transition-all duration-200 ${
                              transaction.type === "income"
                                ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30"
                                : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {transaction.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-bold transition-all duration-200 ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        } ${hoveredRow === transaction._id ? "scale-105" : ""}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {transaction.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 transition-all duration-200 hover:scale-105 hover:shadow-md"
                            style={{ animationDelay: `${tagIndex * 100}ms` }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {transaction.notes && (
                          <button
                            onClick={() => toggleNotes(transaction._id)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 transform hover:scale-110 hover:rotate-180 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Toggle notes"
                          >
                            {expandedNotes.has(transaction._id) ? (
                              <FiChevronUp className="h-4 w-4" />
                            ) : (
                              <FiChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 transform hover:scale-110 p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md"
                          title="Edit transaction"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(transaction._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-all duration-200 transform hover:scale-110 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-md"
                          title="Delete transaction"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedNotes.has(transaction._id) && transaction.notes && (
                    <tr className="animate-in slide-in-from-top duration-300">
                      <td
                        colSpan="5"
                        className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500"
                      >
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-start space-x-2">
                            <FiEye className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong className="text-blue-700 dark:text-blue-300">Notes:</strong>
                              <p className="mt-1">{transaction.notes}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {transactions.map((transaction, index) => (
          <div
            key={transaction._id}
            className="card p-4 transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] animate-in slide-in-from-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    transaction.type === "income"
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-red-400 to-red-500"
                  } shadow-md`}
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{transaction.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{transaction.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-bold ${
                    transaction.type === "income"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(transaction.date)}</div>
              </div>
            </div>

            {/* Tags */}
            {transaction.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {transaction.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Notes */}
            {transaction.notes && (
              <div className="mb-3">
                <button
                  onClick={() => toggleNotes(transaction._id)}
                  className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  {expandedNotes.has(transaction._id) ? (
                    <>
                      <FiChevronUp className="h-4 w-4" />
                      <span>Hide Notes</span>
                    </>
                  ) : (
                    <>
                      <FiChevronDown className="h-4 w-4" />
                      <span>Show Notes</span>
                    </>
                  )}
                </button>
                {expandedNotes.has(transaction._id) && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500 animate-in slide-in-from-top duration-300">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{transaction.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onEdit(transaction)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <FiEdit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onDelete(transaction._id)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <FiTrash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionTable
