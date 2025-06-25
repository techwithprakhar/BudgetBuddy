"use client"

import { useState, useMemo } from "react"
import { FiPlus } from "react-icons/fi"
import { useData } from "../context/DataContext"
import TransactionTable from "../components/TransactionTable"
import AddTransactionModal from "../components/AddTransactionModal"
import Filters from "../components/Filters"
import { formatCurrency } from "../utils/formatDate"

const Transactions = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editTransaction, setEditTransaction] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    tags: [],
    amountRange: "",
    dateRange: { start: null, end: null },
  })

  // Get all unique tags
  const availableTags = useMemo(() => {
    const tagSet = new Set()
    transactions.forEach((transaction) => {
      transaction.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [transactions])

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (filters.search && !transaction.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      // Type filter
      if (filters.type && transaction.type !== filters.type) {
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
  }, [transactions, filters])

  // Calculate totals
  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount
        } else {
          acc.expense += transaction.amount
        }
        return acc
      },
      { income: 0, expense: 0 },
    )
  }, [filteredTransactions])

  const handleAddTransaction = async (transactionData) => {
    if (editTransaction) {
      return await updateTransaction(editTransaction._id, transactionData)
    } else {
      return await addTransaction(transactionData)
    }
  }

  const handleEditTransaction = (transaction) => {
    setEditTransaction(transaction)
    setShowModal(true)
  }

  const handleDeleteTransaction = async (_id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteTransaction(_id)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditTransaction(null)
  }

  return (
    <div className="space-y-6 pb-32 lg:pb-16">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-in slide-in-from-top duration-500">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            All Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
            Manage your income and expenses • {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="w-full lg:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 text-lg border-2 border-blue-500"
          >
            <FiPlus className="h-6 w-6" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Total Income",
            amount: totals.income,
            color: "green",
            icon: "💰",
            textColor: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-50 dark:bg-green-900/10",
            iconBg: "bg-green-100 dark:bg-green-900/30",
          },
          {
            title: "Total Expenses",
            amount: totals.expense,
            color: "red",
            icon: "💸",
            textColor: "text-red-600 dark:text-red-400",
            bgColor: "bg-red-50 dark:bg-red-900/10",
            iconBg: "bg-red-100 dark:bg-red-900/30",
          },
          {
            title: "Net Balance",
            amount: totals.income - totals.expense,
            color: totals.income - totals.expense >= 0 ? "green" : "red",
            icon: totals.income - totals.expense >= 0 ? "📈" : "📉",
            textColor:
              totals.income - totals.expense >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            bgColor:
              totals.income - totals.expense >= 0 ? "bg-green-50 dark:bg-green-900/10" : "bg-red-50 dark:bg-red-900/10",
            iconBg:
              totals.income - totals.expense >= 0
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30",
          },
        ].map((card, index) => (
          <div
            key={card.title}
            className={`card p-6 ${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className={`text-2xl font-bold ${card.textColor}`}>{formatCurrency(card.amount)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  From {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${card.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="animate-in slide-in-from-bottom duration-700" style={{ animationDelay: "300ms" }}>
        <Filters filters={filters} onFiltersChange={setFilters} availableTags={availableTags} />
      </div>

      {/* Transactions Table */}
      <div className="animate-in slide-in-from-bottom duration-700" style={{ animationDelay: "400ms" }}>
        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Add/Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleAddTransaction}
        editTransaction={editTransaction}
      />
    </div>
  )
}

export default Transactions
