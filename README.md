# CivicLink AI

## 🏛️ Overview

CivicLink AI is an intelligent civic issue reporting platform that automates the process of routing citizen complaints to the appropriate municipal departments using AI. Citizens can submit reports with descriptions and images, and the system automatically identifies the correct department and sends professional complaint emails.

## ✨ Key Features

- **AI-Powered Department Routing** - Automatic issue categorization and department assignment
- **User Authentication** - Secure login/registration system
- **Real-time Processing** - Live updates during report processing
- **Image Upload Support** - Visual evidence for better issue documentation
- **Email Automation** - Professional complaints sent directly to departments
- **Interactive Dashboard** - Track report status and history

## 🚀 Quick Setup

### Prerequisites

- Node.js (v18+)
- Google Cloud Account (for Firebase & Vertex AI)
- Gmail Account (for email automation)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd CivicLink
   ```

2. **Install dependencies**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**

   Create `.env` files in both directories with your own credentials:

   **Backend (.env):**

   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
   USE_REAL_AI=true
   USE_SMART_FILTERING=true
   VERTEX_AI_PROJECT_ID=your-google-cloud-project-id
   VERTEX_AI_LOCATION=us-west1
   VERTEX_AI_MODEL=gemini-2.0-flash-lite-001
   ```

   **Frontend (.env):**

   ```env
   VITE_API_BASE_URL=http://localhost:3001/api
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. **Firebase Setup**

   - Create Firebase project and enable Authentication, Firestore, Storage
   - Download `serviceAccountKey.json` to `backend/` folder
   - Get your Firebase web app configuration from Firebase Console
   - Add Firebase config values to `frontend/.env` file (see Frontend .env section above)
   - Generate Vertex AI credentials as service account key for Google Cloud

5. **Initialize Database**

   ```bash
   cd backend
   node initDatabase.js
   ```

6. **Start the Application**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

7. **Access the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001


## 🔧 Tech Stack

- **Frontend:** React, Vite, Firebase Auth
- **Backend:** Node.js, Express, Firebase Admin
- **AI:** Google Vertex AI (Gemini 2.0)
- **Database:** Cloud Firestore
- **Storage:** Google Cloud Storage
- **Email:** Gmail SMTP

## 📝 License

This project is for educational and demonstration purposes.

---

_Building smarter cities through AI-powered civic engagement_ 🌟
