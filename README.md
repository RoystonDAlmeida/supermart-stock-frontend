# Supermart Stock Frontend

This is the frontend application for the Supermart Stock Management system. It provides a user interface built with React, Vite, and shadcn/ui to interact with the stock management backend API, allowing users to view, add, edit, and delete stock items.

## Features

*   Role-based access for different types of users(Cashier, Staff, Manager).
*   Different types of operations based on user role enabling robust authorization.
*   Display stock items in a sortable and filterable manner.
*   Add new stock items.
*   Edit existing stock items.
*   Delete stock items with confirmation.
*   User-friendly interface leveraging shadcn/ui components.
*   Responsive design for usability across different screen sizes.
*   Connects to a backend API for data persistence.

## Backend Repository

The backend API that this frontend application consumes is developed and maintained in a separate repository. You can find the backend project here:

*   **Backend Repository:** [https://github.com/RoystonDAlmeida/supermart-stock-backend](https://github.com/RoystonDAlmeida/supermart-stock-backend)

Please refer to the backend repository's `README.md` for instructions on setting up and running the backend server, which is required for the frontend application to function correctly.

## Tech Stack

*   **Framework:** [React](https://reactjs.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI & Tailwind CSS)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** React Context API
*   **Data Fetching:** Native `fetch` API or a library like `axios`
*   **Deployment:** Vercel

## Setup Instructions

Follow these steps to set up and run the project locally for development or testing.

### Prerequisites

*   Node.js (Version 18.x or later recommended)
*   npm (comes with Node.js) or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:RoystonDAlmeida/supermart-stock-frontend.git
    cd supermart_stock_frontend/
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

### Environment Variables

The frontend needs to know the URL of the backend API to communicate with it.

1.  **Create an environment file:**
    In the root directory of the project (`supermart_stock_frontend/`), create a file named `.env`.

2.  **Add the API URL:**
    Open the `.env` file and add the following line, replacing the URL with the appropriate one for your environment (local or deployed backend):

    ```properties
    # Example for connecting to the deployed Railway backend:
    VITE_API_URL = <Deployed_backend_url>

    # Example for connecting to a local backend (replace PORT if different):
    # VITE_API_URL=http://localhost:3001/
    ```
    *   **Important:** Vite requires environment variables exposed to the client-side code to be prefixed with `VITE_`.
    *   Ensure the URL includes the protocol (`http://` or `https://`) and the trailing slash `/` if your backend expects it or if your API calls rely on it.

### Running the Development Server

Once dependencies are installed and the `.env` file is configured, you can start the local development server:

Using npm:
```bash
npm run dev
```