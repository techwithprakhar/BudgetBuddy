const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send OTP email for email verification
const sendOTPEmail = async (email, otp) => {
  try {
    // Check if SMTP is configured with detailed logging
    const missingVars = [];
    if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
    if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
    if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');
    
    if (missingVars.length > 0) {
      console.warn('📧 SMTP Configuration Issue:');
      console.warn(`Missing variables: ${missingVars.join(', ')}`);
      console.warn(`OTP for ${email}: ${otp}`);
      console.warn('Please configure SMTP environment variables in Render!');
      // Still return success for development purposes
      return { success: true, messageId: 'development-mode' };
    }

    console.log('📧 Attempting to send OTP email to:', email);
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Budget Buddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email - Budget Buddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Budget Buddy!</h2>
          <p>Thank you for signing up. Please verify your email address by entering the OTP below:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6B7280; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully!');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('Error code:', error.code);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send OTP email';
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS. For Gmail, use an App Password!';
      console.error('🔐 Authentication failed. Make sure you\'re using Gmail App Password.');
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'SMTP connection failed. Check SMTP_HOST and SMTP_PORT.';
      console.error('🔌 Connection failed. Check SMTP settings.');
    } else if (error.message?.includes('Invalid login')) {
      errorMessage = 'Invalid SMTP credentials. For Gmail, use an App Password!';
      console.error('❌ Invalid login. Use Gmail App Password.');
    }
    
    console.error('Full error:', error);
    throw new Error(errorMessage);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Default to port 3000 for Create React App (can be overridden with FRONTEND_URL in .env)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Check if SMTP is configured with detailed logging
    const missingVars = [];
    if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
    if (!process.env.SMTP_USER) missingVars.push('SMTP_USER');
    if (!process.env.SMTP_PASS) missingVars.push('SMTP_PASS');
    
    if (missingVars.length > 0) {
      console.warn('📧 SMTP Configuration Issue:');
      console.warn(`Missing variables: ${missingVars.join(', ')}`);
      console.warn('Password reset link (for manual use):', resetUrl);
      console.warn('Please configure SMTP environment variables in Render!');
      // Still return success for development purposes
      return { success: true, messageId: 'development-mode' };
    }

    console.log('📧 Attempting to send password reset email to:', email);
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Budget Buddy" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password - Budget Buddy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6B7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #6B7280; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">This link will expire in 1 hour.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
    console.error('Error code:', error.code);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send password reset email';
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS. For Gmail, use an App Password!';
      console.error('🔐 Authentication failed. Make sure you\'re using Gmail App Password.');
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'SMTP connection failed. Check SMTP_HOST and SMTP_PORT.';
      console.error('🔌 Connection failed. Check SMTP settings.');
    } else if (error.message?.includes('Invalid login')) {
      errorMessage = 'Invalid SMTP credentials. For Gmail, use an App Password!';
      console.error('❌ Invalid login. Use Gmail App Password.');
    }
    
    console.error('Full error:', error);
    throw new Error(errorMessage);
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};

