export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const getDateRange = (range) => {
  const today = new Date()
  const startDate = new Date()

  switch (range) {
    case "today":
      return { start: today, end: today }
    case "week":
      startDate.setDate(today.getDate() - 7)
      return { start: startDate, end: today }
    case "month":
      startDate.setMonth(today.getMonth() - 1)
      return { start: startDate, end: today }
    case "year":
      startDate.setFullYear(today.getFullYear() - 1)
      return { start: startDate, end: today }
    default:
      return { start: null, end: null }
  }
}
