# 🏥 Healthkard Backend

[![Website](https://img.shields.io/badge/Website-healthkard.in-blue?style=flat-square)](https://healthkard.in)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)]()

The backend API service for Healthkard - A healthcare subscription platform revolutionizing doctor consultations by providing zero-fee access to qualified doctors across a network of trusted hospitals.

## 🌐 Live Platform
- **Website**: [healthkard.in](https://healthkard.in)
- **Region Served**: Narasaraopet and Guntur
- **Current Status**: Actively serving 2,000+ users across 25+ hospitals

## 🌟 Features

- 🔐 Authentication & Authorization
- 👨‍⚕️ Doctor/Agent Management
- 🏥 Hospital Integration
- 📱 Mobile User Management
- 💳 Payment Processing
- 📊 Records Management
- 📧 Email Services
- 📱 OTP Verification

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (assumed based on schema structure)
- JSON Web Tokens (JWT)

## 📁 Project Structure

```
healthkard-backend/
├── data/               # Data management and plans
├── helpers/            # Utility functions and templates
│   ├── Payment/       # Payment processing helpers
│   ├── basicFunctions.js
│   ├── emailTemplate.js
│   ├── googleFit.js
│   ├── mobileVerification.js
│   └── ...
├── middleware/         # Express middleware
├── routers/           # API routes
│   ├── agents.js
│   ├── auth.js
│   ├── hospitals.js
│   ├── mobile.js
│   ├── payment.js
│   └── ...
├── schema/            # Database schemas
│   ├── agents.js
│   ├── hospitals.js
│   ├── mobileUser.js
│   ├── records.js
│   └── ...
└── index.js           # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn
- MongoDB instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rohitkumarmanne-442/healthkard-backend.git
cd healthkard-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
PORT=your_port
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

4. Start the development server:
```bash
npm run dev
```

## 🔑 API Endpoints

- 🔐 **Auth**
  - `/auth` - Authentication routes

- 👨‍⚕️ **Agents**
  - `/agents` - Doctor/Agent management

- 🏥 **Hospitals**
  - `/hospitals` - Hospital management

- 📱 **Mobile**
  - `/mobile` - Mobile user operations

- 💳 **Payments**
  - `/payments` - Payment processing

- 📊 **Records**
  - `/records` - Medical records management


## 👥 Contact

For any queries regarding the backend, please contact:
healthkard99@gmail.com
