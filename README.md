# Ourflix - Private Couple Streaming Platform

A full-stack, Netflix-inspired private streaming application designed for a couple to securely upload, store, and stream their own personalized media. 

## Features
* **Authentication**: Secure JWT-based login and registration system.
* **Profiles**: "Who's watching?" screen with multiple user profiles per account.
* **Netflix-Style UI**: Dark theme, hover effects, smooth transitions, horizontal scrolling media carousels.
* **Media Uploads**: Built-in support for uploading videos and images.
* **Streaming**: Custom HTML5 video player integration.

## Tech Stack
* **Frontend**: React.js, Tailwind CSS (v4), Vite, Framer Motion
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs

## Local Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Open the `backend/.env` file. You need to provide a valid `MONGO_URI` (from MongoDB Atlas) to establish a database connection. We have provided a placeholder `MONGO_URI`, but it is highly recommended to replace it.
   *(Optional)* Configure your Cloudinary keys in `.env` if you choose to integrate Cloudinary via `multer-storage-cloudinary` inside `backend/routes/media.js`.
4. Start the server:
   ```bash
   node server.js
   ```
   *The backend should now be running on `http://localhost:5000`*

### 2. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local address (e.g., `http://localhost:5173`) in your browser.

## Usage
1. **Register** a new account from the Login page by clicking "Sign up now."
2. **Select a Profile** from the profile selection screen.
3. Click on the **+ Upload Media** button in the Navbar to mock-upload a media item.
4. **Watch** the uploaded videos directly from the beautiful, Netflix-like Home dashboard.

## Deployment Steps

### Frontend Deployment (Vercel)
1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to Vite.
5. Set the **Root Directory** to `frontend`.
6. Click **Deploy**.

### Backend Deployment (Render)
1. Log in to [Render](https://render.com/) and click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Set the **Root Directory** to `backend`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `node server.js`.
6. Add your Environment Variables (from your `.env` file) in Render's Advanced Settings.
7. Click **Create Web Service**.

### Database Deployment (MongoDB Atlas)
1. Your database should ideally be hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Make sure you whitelist all IPs (`0.0.0.0/0`) under Network Access so your Render backend can connect to it.

## Enhancements Included
- Beautiful background hero section.
- Framer Motion used for smooth entrance animations on the Profile Selection.
- Custom stylized scrollbars (`hide-scrollbar`) to replicate native Netflix TV scrolling.
- Responsive design tailored for mobile and web views.
