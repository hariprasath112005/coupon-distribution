# Round-Robin Coupon Distribution System

A full-stack web application that distributes coupons to guest users in a round-robin manner while providing an admin panel to manage coupons and prevent abuse.

![Coupon Distribution System](https://placeholder.svg?height=400&width=800)

## Features

### User Features
- **Guest Access**: Users can claim coupons without logging in
- **Round-Robin Distribution**: Coupons are assigned sequentially without repetition
- **Real-time Feedback**: Clear messages for successful claims or restrictions

### Admin Features
- **Secure Admin Panel**: Password-protected admin interface
- **Coupon Management**: View, add, and toggle coupon availability
- **Claim History**: Track which users claimed which coupons with IP and session data

### Security Features
- **IP Tracking**: Prevents multiple claims from the same IP within a cooldown period
- **Cookie-Based Tracking**: Restricts claims from the same browser session
- **Abuse Prevention**: Comprehensive measures to prevent system abuse

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Next.js API Routes
- **Database**: MongoDB
- **Authentication**: Session-based with HTTP-only cookies
- **Security**: bcrypt for password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/coupon-distribution.git
   cd coupon-distribution
