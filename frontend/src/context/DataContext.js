// "use client"

// import { createContext, useContext, useState, useEffect } from "react"
// import { mockTransactions, mockGoals } from "../utils/mockData"
// import api from "../utils/api"

// const DataContext = createContext()

// export const useData = () => {
//   const context = useContext(DataContext)
//   if (!context) {
//     throw new Error("useData must be used within a DataProvider")
//   }
//   return context
// }

// export const DataProvider = ({ children }) => {
//   const [transactions, setTransactions] = useState(() => {
//     const saved = localStorage.getItem("transactions")
//     return saved ? JSON.parse(saved) : mockTransactions
//   })

//   const [goals, setGoals] = useState(() => {
//     const saved = localStorage.getItem("goals")
//     return saved ? JSON.parse(saved) : mockGoals
//   })

//   useEffect(() => {
//     localStorage.setItem("transactions", JSON.stringify(transactions))
//   }, [transactions])

//   useEffect(() => {
//     localStorage.setItem("goals", JSON.stringify(goals))
//   }, [goals])

//   const addTransaction = async (transaction) => {
//     try {
      
//       const newTransaction = {
//         ...transaction,
//         id: Date.now().toString(),
//         createdAt: new Date().toISOString(),
//       }

//       console.log('newTransaction', newTransaction)

//       // Mock API call
//       const response = await api.post('/transaction/add-transaction', newTransaction);

//       // console.log('response.data', response.data)
//       setTransactions((prev) => [response.data.transaction, ...prev])
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: "Failed to add transaction" }
//     }
//   }

//   const updateTransaction = async (id, updates) => {
//     try {
//       console.log('id', id)
//       console.log('updates', updates)

//       // Mock API call
//       // const response = await axios.put(`/api/transactions/${id}`, updates);

//       setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: "Failed to update transaction" }
//     }
//   }

//   const deleteTransaction = async (id) => {
//     try {
//       // Mock API call
//       // await axios.delete(`/api/transactions/${id}`);

//       setTransactions((prev) => prev.filter((t) => t.id !== id))
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: "Failed to delete transaction" }
//     }
//   }

//   const addGoal = async (goal) => {
//     try {
//       const newGoal = {
//         ...goal,
//         id: Date.now().toString(),
//         savedAmount: 0,
//         createdAt: new Date().toISOString(),
//       }

//       // Mock API call
//       // const response = await axios.post('/api/goals', newGoal);

//       setGoals((prev) => [newGoal, ...prev])
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: "Failed to add goal" }
//     }
//   }

//   const updateGoal = async (id, updates) => {
//     try {
//       // Mock API call
//       // const response = await axios.put(`/api/goals/${id}`, updates);

//       setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: "Failed to update goal" }
//     }
//   }

//   const deleteGoal = async (id) => {
//     try {
//       // Mock API call
//       // await axios.delete(`/api/goals/${id}`);

//       setGoals((prev) => prev.filter((g) => g.id !== id))
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: "Failed to delete goal" }
//     }
//   }

//   return (
//     <DataContext.Provider
//       value={{
//         transactions,
//         goals,
//         addTransaction,
//         updateTransaction,
//         deleteTransaction,
//         addGoal,
//         updateGoal,
//         deleteGoal,
//       }}
//     >
//       {children}
//     </DataContext.Provider>
//   )
// }


// src/context/DataContext.js
"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../utils/api"
import { useAuth } from "./AuthContext"

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  // const [summary, setSummary] = useState(null)

  // 🎯 Fetch all user data
  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch transactions and goals in parallel
      const [transactionsResponse, goalsResponse] = await Promise.all([
        api.get('/transaction/get-transaction'),
        api.get('/goal/get-goal') // Assuming you have goals API
      ])

      // console.log('transactionResponse.data', transactionResponse.data)
      if (transactionsResponse.data.success) {
        setTransactions(transactionsResponse.data.transactions)
        // setSummary(transactionsResponse.data.data.summary)
      }

      if (goalsResponse.data.success) {
        setGoals(goalsResponse.data.goals)
      }

      setInitialized(true)
      console.log("✅ All user data fetched successfully")

    } catch (error) {
      console.error("❌ Failed to fetch user data:", error)
      // Handle token expiration
      if (error.response?.status === 401) {
        // Token expired, logout user
        // Move logout out of fetchAllData to avoid hook violation
        window.location.href = '/login';
      }
    } finally {
      setLoading(false)
    }
  }

  // 🎯 Auto-fetch data when user logs in
  useEffect(() => {
    if (user && !initialized) {
      console.log("🔄 User logged in, fetching data...")
      fetchAllData()
    }
    if (!user && initialized) {
      // Clear data when user logs out
      setTransactions([])
      setGoals([])
      // setSummary(null)
      setInitialized(false)
    }
  }, [user, initialized])

  // Fetch transactions only
  const fetchTransactions = async () => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {
      const response = await api.get('/transaction/get-transaction')
      
      if (response.data.success) {
        setTransactions(response.data.data.transactions)
        // setSummary(response.data.data.summary)
        return { success: true, data: response.data.data }
      }
    } catch (error) {
      console.error('Fetch transactions error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch transactions' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Add transaction
  const addTransaction = async (transactionData) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {

      // console.log('transactionData', transactionData)

      const response = await api.post('/transaction/add-transaction', {
        transaction: transactionData
      })
      
      if (response.data.success) {
         setTransactions(response.data.transactions)
       return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Add transaction error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add transaction' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {

      
      const response = await api.put(`/transaction/update-transaction/${id}`, {
        transaction: transactionData
      })
      
      if (response.data.success) {
        // 🎯 Update state with ALL transactions from response
        setTransactions(response.data.transactions)
        // setSummary(response.data.summary)
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Update transaction error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update transaction' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete transaction
  const deleteTransaction = async (id) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {
      const response = await api.delete(`/transaction/delete-transaction/${id}`)
      
      if (response.data.success) {
        // 🎯 Update state with remaining transactions from response
        setTransactions(response.data.transactions)
        // setSummary(response.data.summary)
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Delete transaction error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete transaction' 
      }
    } finally {
      setLoading(false)
    }
  }
  const addGoal = async (goalData) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {

      // console.log('transactionData', transactionData)

      const response = await api.post('/goal/add-goal', {
        goal: goalData
      })
      
      if (response.data.success) {
         setGoals(response.data.goals)
       return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Add Goal error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add Goal' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Update transaction
  const updateGoal = async (id, goalData) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {

      
      const response = await api.put(`/goal/update-goal/${id}`, {
        goal: goalData
      })
      
      if (response.data.success) {
        // 🎯 Update state with ALL transactions from response
        setGoals(response.data.goals)
        // setSummary(response.data.summary)
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Update goal error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update goal' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete transaction
  const deleteGoal = async (id) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setLoading(true)
    try {
      const response = await api.delete(`/goal/delete-goal/${id}`)
      
      if (response.data.success) {
        // 🎯 Update state with remaining transactions from response
        setGoals(response.data.goals)
        // setSummary(response.data.summary)
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Delete goal error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete goal' 
      }
    } finally {
      setLoading(false)
    }
  }

  // Refresh all data
  const refreshData = () => {
    setInitialized(false) // This will trigger useEffect to refetch
  }

  return (
    <DataContext.Provider
      value={{
        transactions,
        goals,
        // summary,
        loading,
        initialized,
        addGoal,
        updateGoal,
        deleteGoal,
        fetchAllData,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  )
}