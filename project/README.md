# Student Notes Management System

A web application for students to manage, organize, and share their course notes.

## Features

- Upload PDF and TXT files for your course notes
- Organize notes by subjects
- Search functionality to find notes quickly
- Share notes with other students
- Dark/light theme support
- Responsive design for all devices

## Tech Stack

- **Frontend**: Angular
- **Backend Services** (using LocalStack):
  - Amazon S3 for file storage
  - DynamoDB for metadata storage
  - Lambda for processing

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker (for running LocalStack)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the LocalStack container:
   ```
   npm run localstack
   ```
4. Setup the LocalStack resources:
   ```
   node backend/localstack-setup.js
   ```
5. Start the Angular application:
   ```
   npm start
   ```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/        # Reusable UI components
│   │   ├── models/            # TypeScript interfaces
│   │   ├── pages/             # Page components
│   │   ├── services/          # Angular services for data operations
│   │   ├── app.component.ts   # Root component
│   │   └── app.routes.ts      # Angular routes
│   ├── global_styles.css      # Global styles
│   ├── index.html             # HTML entry point
│   └── main.ts                # Entry point
└── backend/
    └── localstack-setup.js    # Script to set up LocalStack resources
```

## AWS Integration

This application uses LocalStack to emulate AWS services:

- **S3**: Stores the uploaded PDF and TXT files
- **DynamoDB**: Stores metadata about notes and subjects
- **Lambda**: Processes advanced search requests and file operations

## License

This project is licensed under the MIT License.