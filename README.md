# BudgetBuddy 💰

An Expense Tracker app using MERN Stack with advanced authentication features.

## Features

### 🔐 Authentication & Security
- ✅ **Email Verification** - OTP-based email verification on signup (1-minute resend timer)
- ✅ **Password Reset** - Secure password reset via email link
- ✅ **Password Change** - Change password in settings (requires current password)
- ✅ **Google Sign-In** - OAuth-based authentication
- ✅ **JWT Authentication** - Secure token-based auth

### 💵 Expense Management
- 📊 **Transactions** - Track income and expenses
- 🎯 **Goals** - Set and monitor financial goals


### 🎨 User Experience
- 🌓 **Dark/Light Theme** - Toggle between themes
- 📱 **Responsive Design** - Works on all devices
- 🖼️ **Profile Pictures** - Upload and manage avatar (Cloudinary)

## Tech Stack

### Frontend
- React
- Tailwind CSS
- React Router
- Axios
- React Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT
- Nodemailer (Email)
- Google OAuth
- Cloudinary (Image upload)
- Bcrypt (Password hashing)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- Gmail account (for email features)
- Google Cloud account (for Google Sign-In)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BudgetBuddy
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file and add your environment variables
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file with your API URL
   npm start
   ```

### Environment Variables

See `DEPLOYMENT_CHECKLIST.md` for detailed environment variable setup.

## Deployment

For production deployment instructions, see `DEPLOYMENT_CHECKLIST.md`.

**Key Points:**
- Update all `localhost` URLs to production URLs
- Configure production SMTP for emails
- Set up Google OAuth for production domain
- Use strong JWT secret
- Enable HTTPS

## Project Structure

```
BudgetBuddy/
├── backend/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models (User, Transaction, Goal, OTP, PasswordReset)
│   ├── routes/         # API routes
│   ├── services/       # Business logic (Email, User, Transaction, Goal)
│   ├── middlewares/    # Auth middleware
│   └── config/         # Cloudinary config
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React contexts (Auth, Theme, Data)
│   │   └── utils/      # Helper functions
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
