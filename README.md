# Finance Track - Expense Tracking Application

A full-stack expense tracking application built with Next.js, React, TypeScript, and Firebase to help users manage their personal finances.

https://finance-tracker-budgetflow.vercel.app/

Key Features
*   **Add Expenses:** Easily log new expenses with details like amount, currency, description, and category.
*   **Categorization:** Assign each expense to predefined categories (e.g., Housing, Food, Transport) for better organization.
*   **Expense Overview:** View a list of recent expenses with all relevant details, along with a running monthly total.
*   **Spending Statistics:**
    *   A graph visualizing spending over the last 7 days.
    *   A detailed breakdown of spending by category for the current month.
*   **User Profiles:** Users can sign up, log in, and manage their personal profiles.

Technologies:

*   Framework: Next.js 13 (utilizing features like Server-Side Rendering and API Routes).

*   Database:
    *   Cloud Firestore: A NoSQL database used to store all application data, including user expenses, subscriptions, and profiles.

*   Frontend:
    *   React & React Hooks: Built on a component-based architecture with extensive use of custom hooks (`useExpenses`, `useUserPreferences`, etc.) for reusable, stateful logic.
    *   TypeScript: To ensure type safety and improve code quality.
    *   Tailwind CSS: A utility-first CSS framework for rapid and custom styling.
    *   React Hot Toast: For displaying user-friendly notifications.

*   Backend & API:
    *   Next.js API Routes: For creating serverless API endpoints to handle backend logic.
    *   External API Integration:
        *   **ExchangeRate-API:** Integrated to fetch and display real-time currency exchange rates.

*   Authentication & Security:
    *   **Firebase Authentication:** To manage user sign-up, login, and sessions.
    *   **JOSE:** A library used for handling JSON Web Tokens (JWT) to secure API routes and verify user identity.

*   **Image Management:**
    *   **Cloudinary:** For cloud-based storage, management, and deletion of user profile pictures.


## Project Goal

The goal of this project was to build a practical tool for personal finance management while demonstrating proficiency in developing full-stack web applications. Expense tracking apps help users gain better insight into their financial habits and make more informed budgeting decisions.
