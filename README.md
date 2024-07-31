# FamSnap - Capstone Project

## Summary
- **Grade:** A+
- **Description:** Developed a family heritage and photo management platform for my capstone project.

## Key Features
- **Family Tree:** Interactive visualization using Balkan JS and a custom API for CRUD operations.
- **Photo Management:** Utilized Cloudinary’s API to upload, tag, and categorize photos with personalized galleries.
- **Restoration Section:** Integrated Replicate AI API for image enhancement and colorization.

## Documentation
For detailed documentation, please refer to [FamSnap Documentation](https://docs.google.com/document/d/1eNBkZewtWFhQ0xSHkx4HKSGERVqOGhCJ/edit?usp=sharing&ouid=104952688204549483688&rtpof=true&sd=true).

## Software Requirements

### Operating System
- The application is platform-independent at the development stage and can be run on Windows, macOS, or Linux. For production, a Linux-based server (e.g., Ubuntu 20.04 LTS) is recommended for its stability and scalability.

### Backend
- **Node.js:** Serves as the runtime environment for the backend.
- **MongoDB:** Used as the primary database for storing user data, images metadata, and other application data.

### Frontend
- **React:** Used for building the user interface, providing a responsive and dynamic experience.
- **JavaScript/HTML/TailwindCSS:** Standard technologies for web development are used for additional scripting, markup, and styling.

### Cloud Services and APIs
- **Cloudinary:** Manages image uploads, storage, and optimizations. This service simplifies media management across different devices and network conditions.
- **Balkan JS Family Tree Library:** Integrates a visual tool for creating and managing interactive family trees.
- **Replicate API:** Provides access to machine learning models for image processing tasks like enhancement and colorization.

## System Architecture

### Frontend
- The frontend is built with React, creating a single-page application (SPA) that interacts with the backend via RESTful APIs.
- Static assets are served from Cloudinary to reduce load times and bandwidth usage.

### Backend
- The backend is developed using Node.js with an Express framework, handling API requests, database operations, and integration with external services like Cloudinary and Replicate API.

### Database
- MongoDB is used for data storage, hosting a variety of collections including user profiles, family trees, image metadata, and artist portfolios.
- The database is hosted on MongoDB Atlas, providing reliable, scalable cloud database service.

## Contact
If you have any questions or need further information, feel free to reach out.

**Kenneth Leano**
- Email: [kenleano@gmail.com](mailto:kenleano@gmail.com)
- LinkedIn: [Kenneth Leano](https://www.linkedin.com/in/kennethleano/)
- Website: [kenleano.com](https://kenleano.com)
