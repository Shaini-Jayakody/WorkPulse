# WorkPulse 

## Overview
WorkPulse is a full-stack web application that allows team members to submit weekly reports while managers monitor team performance through an interactive dashboard.

## Tech Stack
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Cloudinary, Nodemailer, OpenAI API (optional)

**Frontend:** React 19, Material-UI, Formik, Yup, Recharts, jsPDF, html2canvas, Axios

## Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Environment Variables

**Backend**
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_USER=your_email
SMTP_PASS=your_password
OPENAI_API_KEY=your_openai_api_key
```

**Frontend**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Main Features
- JWT Authentication
- Role-based Access (Team Member, Manager, Admin, Super Admin)
- Weekly Report Management
- Project & Category Management
- Manager Dashboard with Charts
- PDF Report Export
- AI-powered Report Summary (Optional)
- Email Notifications
- Profile Picture Uploads
-(Use superadmin@workpulse.local to loged in to hardcoded super admin...)

## API Modules
- `/api/auth` – Authentication
- `/api/reports` – Report Management
- `/api/dashboard` – Dashboard Analytics
- `/api/projects` – Project Management
- `/api/categories` – Category Management
- `/api/ai` – AI Chat & Summary

## Run Application
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- Health Check: `http://localhost:5000/health`

## License
MIT License

## Documents
ER diagram: https://drive.google.com/file/d/1Ckq0xWSmpXJ4A5CwUIGFRWXdQSYQhRV3/view?usp=drive_link
Presentation: https://docs.google.com/presentation/d/1b6AIzkIF0hFLJTkUUOdj9nEOPCbqCTBz7LZv6ZD5pnY/edit?usp=sharing
Demo: https://drive.google.com/file/d/1pcpMUHX7C6kmdSA-Dv-sfg7y1l57m82N/view?usp=sharing

