# FARMWAY - Farm-to-Table Marketplace

<p align="center">
  <img src="farmway-app/logo/logo.png" alt="Farmway Logo" width="150"/>
</p>

<p align="center">
  <em>"From Local Farms to Your Table"</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Flutter-3.38-02569B?logo=flutter" alt="Flutter"/>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite" alt="SQLite"/>
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android" alt="Android"/>
</p>

## Original Authors
This project is created and maintained by:

* **Akmal Hakimi Bin Abd Rashid**

## Introduction
**FARMWAY** is a mobile marketplace application developed as part of the **MPU 3242 - Innovation Management** course at **Universiti Kuala Lumpur (UniKL MIIT)**. The application serves as a farm-to-table marketplace that connects Malaysian farmers directly with buyers, eliminating unnecessary middlemen and ensuring fair prices, transparent trade, and broader market access.

The goal of this project is to provide a fully functional mobile application that allows farmers to showcase and sell their fresh produce, livestock, farm equipment, and agricultural services — while giving buyers easy access to locally grown, quality products. The app is powered by **Flutter** for the mobile frontend and **Node.js (Express)** with **SQLite** for the backend API.

## Problem Statements & Objectives

### Problem Statements

* **Market Access Gap** — Small and medium-sized farmers lack direct access to wholesale markets and are forced to sell through middlemen at lower prices.
* **Digital Divide** — Rural farmers lack the digital skills and tools to expand their customer base and business operations online.
* **Declining Agricultural Workforce** — Lack of modernization discourages younger generations from pursuing farming as a career.
* **Absence of Centralized Platform** — No unified digital marketplace exists that caters specifically to Malaysian farmers' needs for selling, buying, and community engagement.

### Objectives

* Develop a mobile marketplace that allows farmers to **list, manage, and sell** their produce directly to consumers
* Provide buyers with an intuitive platform to **browse, search, and purchase** fresh local produce
* Implement **secure authentication** with role-based access (Farmer, Buyer, Admin)
* Support **multilingual content** (English, Bahasa Malaysia, Chinese, Tamil) to serve Malaysia's diverse community
* Enable **real-time messaging** between buyers and farmers for negotiations and inquiries
* Deliver a **modern, accessible UI/UX** optimized for rural connectivity with longer timeouts and offline-friendly design

---

## Program Scope

The Farmway application allows users to:

* **Browse Marketplace** — View a catalog of fresh produce with category filters, search, and sorting options
* **Register & Login** — Create an account as a Farmer or Buyer with secure JWT authentication
* **Farmer Dashboard** — Manage product listings, view orders, track sales performance
* **Buyer Experience** — Discover products, add to cart, checkout, and track orders
* **Messaging** — Direct chat between buyers and farmers for inquiries and negotiations
* **Order Management** — Full order lifecycle (Pending → Confirmed → Processing → Shipped → Delivered)
* **Payment Options** — Support for FPX, credit/debit cards, e-wallets (TNG, GrabPay, DuitNow), and COD
* **Admin Panel** — Platform oversight, user management, and commission tracking
* **Multilingual Support** — 4 languages (EN, MS, ZH, TA) on both frontend and backend

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| `Mobile App` | Flutter 3.38 (Dart) |
| `Backend API` | Node.js 18+, Express 4.x |
| `Database` | SQLite (via Sequelize ORM) |
| `Authentication` | JWT (Access + Refresh tokens) |
| `State Management` | Provider (Flutter) |
| `HTTP Client` | http package (Flutter) |
| `File Storage` | Local uploads / AWS S3 (optional) |
| `Logging` | Winston |
| `i18n` | i18next (4 languages) |

---

## Prerequisites

* **Flutter SDK** 3.x or later — [Install Flutter](https://docs.flutter.dev/get-started/install)
* **Node.js** 18+ — [Download Node.js](https://nodejs.org/)
* **Android Studio** with Android emulator configured
* **Git** (optional, for cloning)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd FARMWAY
```

### 2. Backend Setup

```bash
cd farmway-backend
npm install
npm run db:setup     # Creates SQLite database & seeds demo data
npm run dev          # Starts API server on port 3000
```

### 3. Flutter App Setup

```bash
cd farmway_flutter
flutter pub get
flutter run          # Launches on connected device/emulator
```

### 4. One-Command Start (Bash)

```bash
bash start-local.sh
```

This script automatically sets up the database, starts the backend, and launches the Expo dev server.

### Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@farmway.my` | `admin1234` |
| Farmer | `farmer@farmway.my` | `farmer123` |
| Buyer | `buyer@farmway.my` | `buyer123` |

---

## Project Structure

```
FARMWAY/
├── README.md                       # This file
├── CLAUDE.md                       # AI assistant instructions
├── start-local.sh                  # One-command startup script
│
├── farmway-backend/                # Express.js REST API
│   ├── src/
│   │   ├── server.js               # Entry point
│   │   ├── app.js                  # Express app setup
│   │   ├── config/
│   │   │   ├── database.js         # SQLite connection (Sequelize)
│   │   │   ├── setup-db.js         # DB initialization & seeding
│   │   │   ├── logger.js           # Winston logger
│   │   │   ├── i18n.js             # Internationalization config
│   │   │   └── s3.js               # AWS S3 config (optional)
│   │   ├── models/                 # Sequelize models
│   │   │   ├── index.js            # Model registry & associations
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Payment.js
│   │   │   ├── Commission.js
│   │   │   └── Message.js
│   │   ├── routes/                 # API route definitions
│   │   ├── controllers/            # Business logic
│   │   └── middleware/             # Auth & error handling
│   ├── data/
│   │   └── farmway.sqlite          # SQLite database file
│   ├── uploads/                    # Local file uploads
│   └── package.json
│
├── farmway_flutter/                # Flutter mobile app
│   ├── lib/
│   │   ├── main.dart               # App entry point & routing
│   │   ├── constants/
│   │   │   └── theme.dart          # Design system & colors
│   │   ├── models/
│   │   │   └── user.dart           # User data model
│   │   ├── services/
│   │   │   ├── api_service.dart    # HTTP client & token management
│   │   │   └── auth_service.dart   # Authentication state (Provider)
│   │   └── screens/
│   │       ├── auth/
│   │       │   └── login_screen.dart
│   │       ├── buyer/
│   │       │   └── buyer_home_screen.dart
│   │       └── farmer/
│   │           └── farmer_home_screen.dart
│   ├── assets/
│   │   └── logo.png                # Farmway logo
│   └── pubspec.yaml
│
└── farmway-app/                    # React Native app (legacy)
    └── ...
```

---

## Database Schema

### SQLite Tables (Total: 9)

**`users`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique user identifier |
| `email` | String | User's email (unique) |
| `phone` | String | Phone number (unique) |
| `password_hash` | Text | Bcrypt hashed password |
| `role` | String | FARMER, BUYER, or ADMIN |
| `status` | String | ACTIVE, SUSPENDED, PENDING_VERIFICATION |
| `full_name` | String | User's full name |
| `preferred_lang` | String | en, ms, zh, or ta |
| `is_verified_seller` | Boolean | Seller verification status |

**`categories`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Auto-increment ID |
| `slug` | String | URL-friendly identifier |
| `name` | JSON | Multilingual name `{en, ms, zh, ta}` |
| `parent_id` | Integer (FK) | Self-referential for subcategories |

**`products`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique product identifier |
| `farmer_id` | UUID (FK) | Reference to users |
| `category_id` | Integer (FK) | Reference to categories |
| `name` | JSON | Multilingual product name |
| `price_per_unit` | Decimal | Price per unit |
| `unit` | String | KG, GRAM, UNIT, BUNDLE, BOX, LITRE, DOZEN |
| `stock_quantity` | Decimal | Available stock |
| `status` | String | ACTIVE, INACTIVE, OUT_OF_STOCK, DELETED |
| `tags` | Text | JSON-encoded array of searchable tags |

**`orders`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique order identifier |
| `buyer_id` | UUID (FK) | Reference to buyer |
| `farmer_id` | UUID (FK) | Reference to farmer |
| `status` | String | PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED |
| `total_amount` | Decimal | Total order amount (MYR) |
| `delivery_address` | JSON | Delivery address object |

**`payments`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique payment identifier |
| `order_id` | UUID (FK) | Reference to order |
| `method` | String | FPX, CREDIT_CARD, TNG_EWALLET, GRABPAY, etc. |
| `status` | String | PENDING, SUCCESS, FAILED, REFUNDED |
| `amount` | Decimal | Payment amount (MYR) |

**`messages`**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Unique message identifier |
| `sender_id` | UUID (FK) | Message sender |
| `recipient_id` | UUID (FK) | Message recipient |
| `content` | Text | Message content |
| `is_read` | Boolean | Read status |

*Other tables: `product_images`, `order_items`, `commissions`*

---

## API Endpoints

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login & get tokens | No |
| `POST` | `/api/auth/refresh` | Refresh access token | No |
| `GET` | `/api/auth/me` | Get current user | Yes |
| `PATCH` | `/api/auth/me` | Update profile | Yes |
| `GET` | `/api/categories` | List all categories | No |
| `GET` | `/api/products` | Browse products (with filters) | No |
| `GET` | `/api/products/:id` | Product details | No |
| `POST` | `/api/products` | Create product | Farmer |
| `GET` | `/api/orders` | List user's orders | Yes |
| `POST` | `/api/orders` | Place new order | Buyer |
| `PATCH` | `/api/orders/:id/status` | Update order status | Farmer |
| `GET` | `/api/messages` | List conversations | Yes |
| `POST` | `/api/messages` | Send message | Yes |

---

## Application Flow

```
┌──────────────────┐
│   Login Screen   │
│  (Role Selection)│
└────────┬─────────┘
         │
    ┌────┴────┐
    │  Login  │
    └────┬────┘
         │
    ┌────┴────────────┐
    │   Role Check    │
    └──┬──────────┬───┘
       │          │
   FARMER       BUYER
       │          │
       ▼          ▼
┌─────────────┐  ┌──────────────┐
│  Farmer     │  │  Buyer       │
│  Dashboard  │  │  Marketplace │
│ ┌─────────┐ │  │ ┌──────────┐ │
│ │Dashboard│ │  │ │ Market   │ │
│ │Products │ │  │ │ Orders   │ │
│ │ Orders  │ │  │ │ Chat     │ │
│ │ Profile │ │  │ │ Profile  │ │
│ └─────────┘ │  │ └──────────┘ │
└─────────────┘  └──────────────┘
```

---

## Features

### Buyer Features

* **Marketplace** — Browse fresh produce with category filters, search bar, and sorting
* **Product Grid** — Visual product cards with pricing and farmer info
* **Order Management** — Place orders and track delivery status
* **Messaging** — Chat directly with farmers for inquiries and negotiations
* **Profile** — Manage account details, delivery addresses, and language preferences

### Farmer Features

* **Dashboard** — Overview of products, orders, and performance stats
* **Product Management** — Add, edit, and manage produce listings with images
* **Order Fulfillment** — Accept, process, and ship customer orders
* **Verified Seller Badge** — Build trust with verification status
* **Sales Analytics** — Track revenue, order count, and ratings

### Admin Features

* **User Management** — Oversee all farmer and buyer accounts
* **Commission Tracking** — Monitor platform commissions on sales
* **Platform Overview** — System health, statistics, and reports

### Technical Features

* **JWT Authentication** — Secure token-based auth with automatic refresh
* **Multilingual** — 4 languages (EN, MS, ZH, TA) on frontend and backend
* **SQLite Database** — Zero-config, portable database (no PostgreSQL required)
* **Role-Based Access** — Route protection based on user roles
* **Rate Limiting** — API rate limiting for security (20 req/15min on auth, 300 req/15min global)
* **File Uploads** — Local storage with optional AWS S3 integration
* **Rural Connectivity** — 15-second API timeout for areas with slow internet

---

## Screenshots

### Login Screen
<!-- Add your screenshot here -->
<!-- ![Login Screen](screenshots/login.png) -->
`📸 Add screenshot: screenshots/login.png`

### Buyer - Marketplace
<!-- Add your screenshot here -->
<!-- ![Marketplace](screenshots/marketplace.png) -->
`📸 Add screenshot: screenshots/marketplace.png`

### Buyer - Categories
<!-- Add your screenshot here -->
<!-- ![Categories](screenshots/categories.png) -->
`📸 Add screenshot: screenshots/categories.png`

### Buyer - Orders
<!-- Add your screenshot here -->
<!-- ![Orders](screenshots/buyer_orders.png) -->
`📸 Add screenshot: screenshots/buyer_orders.png`

### Buyer - Profile
<!-- Add your screenshot here -->
<!-- ![Buyer Profile](screenshots/buyer_profile.png) -->
`📸 Add screenshot: screenshots/buyer_profile.png`

### Farmer - Dashboard
<!-- Add your screenshot here -->
<!-- ![Farmer Dashboard](screenshots/farmer_dashboard.png) -->
`📸 Add screenshot: screenshots/farmer_dashboard.png`

### Farmer - Products
<!-- Add your screenshot here -->
<!-- ![Farmer Products](screenshots/farmer_products.png) -->
`📸 Add screenshot: screenshots/farmer_products.png`

### Farmer - Profile
<!-- Add your screenshot here -->
<!-- ![Farmer Profile](screenshots/farmer_profile.png) -->
`📸 Add screenshot: screenshots/farmer_profile.png`

> **How to add screenshots:**
> 1. Create a `screenshots/` folder in the project root
> 2. Take screenshots from the emulator and save them with the filenames above
> 3. Uncomment the `![...]` lines and remove the `📸` placeholder lines

---

## Members Task Distribution

| Member | Tasks |
| :--- | :--- |
| **Akmal Hakimi Bin Abd Rashid** | Backend API development, Authentication system, Database architecture, Cloud deployment |
| **Aziz Bin Mohammad Azman** | UI/UX design, Frontend development, Digital branding, User experience |
| **Amir Haziq Bin Azmira** | System integration, IoT features, Cloud infrastructure, Data management |
| **Aliya Fatihah Binti Abdul Rahman** | Business strategy, Marketing, Project management, Documentation |

---

## Company Information

**FARMWAY SDN. BHD.**

| | |
| :--- | :--- |
| **Address** | 1016, Jalan Sultan Ismail, Bandar Wawasan, 50250 Kuala Lumpur |
| **Showroom** | 5th Floor, Lot 5-31, Quill City Mall, Jln Sultan Ismail, 54250 KL |
| **Email** | Farmway@gmail.com |
| **Phone** | 03-5245-2456 |
| **Office Hours** | 8:00 AM - 5:30 PM |
| **Website** | www.Farmway.com |

---

## License

This project was developed for educational purposes as part of the **MPU 3242 Innovation Management** course at **Universiti Kuala Lumpur (UniKL MIIT)**.

---

<p align="center">
  Made with 💚 by Farmway Sdn. Bhd. — Empowering Malaysian Farmers
</p>
