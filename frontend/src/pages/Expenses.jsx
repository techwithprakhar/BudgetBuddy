"use client"

import { useState, useMemo } from "react"
import { FiPlus, FiTrendingDown } from "react-icons/fi"
import { useData } from "../context/DataContext"
import TransactionTable from "../components/TransactionTable"
import AddTransactionModal from "../components/AddTransactionModal"
import Filters from "../components/Filters"
import { formatCurrency } from "../utils/formatDate"

const Expenses = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    tags: [],
    amountRange: "",
    dateRange: { start: null, end: null },
  })

  // Filter only expense transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter((transaction) => transaction.type === "expense")
  }, [transactions])

  // Get all unique tags from expense transactions
  const availableTags = useMemo(() => {
    const tagSet = new Set()
    expenseTransactions.forEach((transaction) => {
      transaction.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [expenseTransactions])

  // Apply filters to expense transactions
  const filteredTransactions = useMemo(() => {
    return expenseTransactions.filter((transaction) => {
      // Search filter
      if (filters.search && !transaction.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => transaction.tags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Amount range filter
      if (filters.amountRange) {
        const amount = transaction.amount
        switch (filters.amountRange) {
          case "below-1000":
            if (amount >= 1000) return false
            break
          case "1000-10000":
            if (amount < 1000 || amount > 10000) return false
            break
          case "above-10000":
            if (amount <= 10000) return false
            break
          default:
            break
        }
      }

      // Date range filter
      if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
        const transactionDate = new Date(transaction.date)
        if (filters.dateRange.start && transactionDate < filters.dateRange.start) {
          return false
        }
        if (filters.dateRange.end && transactionDate > filters.dateRange.end) {
          return false
        }
      }

      return true
    })
  }, [expenseTransactions, filters])

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  }, [filteredTransactions])

  const handleAddTransaction = async (transactionData) => {
    // Force type to be expense
    const expenseData = { ...transactionData, type: "expense" }

    if (editTransaction) {
      return await updateTransaction(editTransaction.id, expenseData)
    } else {
      return await addTransaction(expenseData)
    }
  }

  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction)
    setShowModal(true)
  }

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense transaction?")) {
      await deleteTransaction(id)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditTransaction(null)
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <FiTrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Expenses
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor your spending habits</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg border-2 border-red-500"
        >
          <FiPlus className="h-6 w-6" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-6 bg-red-50 dark:bg-red-900/10 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                From {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
              💸
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Filters filters={filters} page="expenses" onFiltersChange={setFilters} availableTags={availableTags} />

      {/* Expense Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Add/Edit Expense Modal */}
      <AddTransactionModal
        page="expenses"
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleAddTransaction}
        editTransaction={editTransaction}
      />
    </div>
  )
}

export default Expenses
