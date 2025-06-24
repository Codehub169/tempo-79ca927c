# Codehub Dashboard

## Project Overview

The Codehub Dashboard is an intuitive and efficient visual interface designed to streamline interactions with the Codehub Execution Engine. It empowers developers and operations teams with a centralized control panel to run, monitor, and schedule commands, enhancing operational visibility and automating routine tasks.

## Key Features

*   **Dynamic API Form Generation:** Interact with Codehub API endpoints through automatically generated, user-friendly forms.
*   **Real-time Container Status & Actions:** View live Docker container statuses and perform direct actions like start, stop, and rollback.
*   **Live Log Streaming:** Monitor container logs in real-time with search, pause, and auto-scroll functionalities.
*   **Command Scheduling & Automation:** Define and schedule API calls to run at specific times or recurring intervals.
*   **API Response Visualization:** Clearly view and understand API responses in a pretty-printed JSON format.
*   **Command History & Activity Log:** Keep track of all manual and scheduled API executions.

## Tech Stack

*   **Frontend:** React 18+ (with Vite)
*   **Styling:** Tailwind CSS, Chakra UI
*   **Frontend API Client:** JavaScript Fetch API / Axios
*   **Scheduler Backend:** Node.js (Express.js)
*   **Database:** SQLite (for scheduler data)
*   **Existing Backend:** Codehub Execution Engine (FastAPI - `http://34.28.45.117:8000/`)

## Getting Started

Follow these steps to set up and run the Codehub Dashboard on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
*   [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
*   [Docker](https://www.docker.com/products/docker-desktop) (if you need to run Docker commands locally, though the backend handles this)

### Setup and Run

To launch the entire application, simply execute the `startup.sh` script from the project root:

```bash
bash startup.sh
```

This script will:

1.  Navigate into the `frontend` directory.
2.  Install all required Node.js dependencies for the React application.
3.  Build the React frontend into static files.
4.  Navigate into the `scheduler-backend` directory.
5.  Install all required Node.js dependencies for the scheduler service.
6.  Start the Node.js scheduler backend server. This server will serve the built React frontend files and expose its own API endpoints for task scheduling and history, all accessible via **Port 9000**.

### Accessing the Dashboard

Once the `startup.sh` script completes successfully, open your web browser and navigate to:

[http://localhost:9000](http://localhost:9000)

YouYou will see the Codehub Dashboard, ready for interaction.

### API Endpoints

The dashboard interacts with two main API services:

1.  **Codehub Execution Engine:** The external backend located at `http://34.28.45.117:8000/`. This API provides functionalities for code execution, container management, and logging.
2.  **Codehub Scheduler Backend:** The local Node.js service running on port 9000 (alongside the frontend). This service handles the creation, management, and execution of scheduled tasks.

## Project Structure

```
. # Project Root
├── startup.sh             # Setup and run script
├── README.md              # Project documentation
├── frontend/
│   ├── package.json       # Frontend dependencies and scripts
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   ├── public/            # Static assets
│   │   └── index.html     # Main HTML file
│   └── src/
│       ├── main.jsx       # React entry point
│       ├── App.jsx        # Main App component
│       ├── index.css      # Global CSS
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page-level components (Dashboard, API Explorer, etc.)
│       ├── api/           # API client modules
│       └── ...
└── scheduler-backend/
    ├── package.json       # Backend dependencies and scripts
    ├── server.js          # Express.js server main file
    ├── db/                # Database setup
    │   └── database.js
    ├── models/            # Database models
    │   └── Task.js
    └── routes/            # API routes
        └── tasks.js
    └── utils/
        └── cronScheduler.js # Task scheduling logic
```

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.