Digital Gallery

A modern personal digital gallery built with the MERN ecosystem and browser-based local storage.

Digital Gallery is designed more like a private album/gallery application than a traditional file-management system. Users can keep photos, videos, audio recordings, and PDF documents organized inside their personal gallery, with favorites, trash, categories, camera tools, audio recording, and editing utilities.

✨ Features

👤 User Features

User registration and login

Email verification with OTP

Forgot password / reset password flow

Secure logout

Profile management

Settings and change-password

Responsive gallery dashboard

🖼️ Gallery

Upload photos

Upload videos

Upload audio files

Upload PDF files

View files by type

Favorites

Trash / soft delete

Restore or permanently remove gallery items

Categories for organizing gallery content

File metadata such as name, type, MIME type, size, and timestamps

📷 Camera

Camera permission handling

Capture photos

Record videos

Front / back camera switching where supported

🎙️ Audio Recorder

Microphone permission handling

Record audio

Pause and resume recording

Stop recording

Save recordings into the gallery

🛠️ Editors

Photo Editor

Video Editor

Audio Editor

🛡️ Admin Panel

Admin authentication

Admin dashboard

User list

User search and status filtering

User details

Activate / deactivate users

Delete user accounts

Platform statistics

User file statistics

Storage statistics

🏗️ Architecture

The project separates file data from file metadata.

Browser Storage

The browser keeps a local media copy for offline access using:

IndexedDB

Dexie

Chrome persistent storage is requested to reduce automatic eviction. Browser site data can still be removed explicitly by the user.

Backend

Media files are uploaded to Cloudinary so they can be accessed from other signed-in devices. MongoDB stores the file URL and metadata such as:

User

File name

File type

MIME type

File size

Category

Favorite state

Deleted state

Sync state

Timestamps

IndexedDB is an offline cache, not the only copy of media. Files still marked as pending have not completed their server upload and should be allowed to sync before clearing browser data.

🧰 Tech Stack

Frontend

React

Vite

Tailwind CSS

React Router

Axios

React Hook Form

React Hot Toast

Lucide React

Dexie

IndexedDB

Progressive Web App architecture

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT authentication

HTTP-only cookies

Joi validation

Other Services

Cloudinary for profile images and gallery media

Email OTP / verification service

Gemini API can be integrated for AI-based features in future versions

📁 Project Structure

Digital-Gallery/
│
├── client/
│   └── src/
│       ├── api/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       │   ├── auth/
│       │   ├── gallery/
│       │   ├── user/
│       │   └── admin/
│       └── services/
│           ├── api/
│           ├── file/
│           ├── storage/
│           ├── profile/
│           ├── settings/
│           ├── admin/
│           └── category/
│
└── server/
    └── src/
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── services/
        ├── validators/
        └── ...

🔄 File Flow

User selects a file
        ↓
React frontend
        ↓
File type detection
        ↓
IndexedDB / Dexie
        ↓
Blob stored locally
        ↓
Metadata sent to backend
        ↓
MongoDB stores metadata
        ↓
Gallery displays the file

📦 Installation

1. Clone the repository

git clone YOUR_REPOSITORY_URL
cd Digital-Gallery

2. Install frontend dependencies

cd client
npm install

3. Install backend dependencies

cd ../server
npm install

🔐 Environment Variables

Create a `.env` file inside the `server` directory. Use the variable names below; the Cloudinary configuration also accepts the older `CLOUD_NAME`, `CLOUD_KEY`, and `CLOUD_SECRET` names.

Example:

PORT=8080
ATLASDB_URL=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL=your_email
PASS=your_email_password
EMAIL_FROM=your_sender_address
RESEND_API_KEY=your_resend_api_key
ADMIN_SECRET_KEY=your_admin_registration_secret

The client uses `/api` by default. Vite listens on the local network and proxies that path to `http://localhost:8080` during development. In production, route `/api` to the backend on the same domain, or set `VITE_API_URL` to the full backend API URL when building the client. Do not deploy a client build whose API URL points at `localhost`; on another device, localhost refers to that device itself.

▶️ Run the Project

Start backend

cd server
npm run dev

Start frontend

Open another terminal:

cd client
npm run dev

Frontend:

http://localhost:5173

Backend:

http://localhost:5000

🔒 Security

The application is designed with:

Protected routes

Role-based admin access

JWT authentication

HTTP-only authentication cookies

Password hashing

Email verification

OTP-based password reset

Server-side validation

User ownership checks for gallery data

📱 PWA Concept

Digital Gallery is designed as a browser-based personal gallery with PWA support.

The local-storage approach allows gallery files to remain available inside the user's browser storage instead of requiring every gallery asset to be uploaded to a cloud file provider.

🎯 Project Goal

The goal of Digital Gallery is to provide a simple personal space for managing memories and digital content:

Photos
Videos
Audio
PDFs
Categories
Favorites
Trash
Camera
Audio Recorder
Editors

It focuses on a gallery/album experience, not a complex folder-based file manager.

🚀 Future Improvements

Possible future additions include:

Better offline synchronization

Background sync

Improved media preview

Search and filtering

Gallery sharing

Storage usage visualization

More advanced editors

Better PWA caching strategies

AI-powered gallery features

👨‍💻 Developer

Subhadeep Garai

B.Tech CSE (AI Engineering)

📄 License

This project is created for learning, development, and portfolio purposes.
link : https://gallary-lam7.vercel.app
