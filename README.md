# CampusBite – Smart College Canteen Pre-Order & Real-Time QR Verification System

A production-style, mobile-first College Canteen Pre-Order web application built with **React**, **Tailwind CSS**, and **Supabase** (PostgreSQL, Auth, Row Level Security, Realtime subscriptions, and Storage).

---

## 🌟 Overview & Architecture

CampusBite decouples the traditional college canteen token counter bottleneck:
1. **Student Pre-Ordering**: Students browse the live menu, customize meals, place orders, and pay online.
2. **Instant Realtime Kitchen Alert**: Vendors receive instant order popups (`🔔 NEW ORDER`) via Supabase Realtime subscriptions without refreshing.
3. **Dynamic Cryptographic QR Pass**: Upon payment confirmation, the database generates a unique cryptographic token encoded into a scannable QR code.
4. **Camera-Based Vendor Verification**: The canteen staff opens their device camera, scans the student's QR pass, validates it against Supabase, and confirms pickup.
5. **Anti-Fraud One-Time Redemption**: Once redeemed, the QR code is timestamped and marked as `COMPLETED`. Re-scanning any redeemed or expired QR code is immediately flagged and rejected.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React, HTML5-QRCode, Canvas-Confetti, Web Audio API chime generator.
- **Backend & Database**: [Supabase](https://supabase.com) (PostgreSQL 15+, Supabase Auth, Row Level Security, Realtime Websockets).
- **Payment Processing**: Razorpay Standard Checkout SDK + Integrated Test Payment Gateway Mode.
- **QR Engine**: Cryptographic random token generation (`crypto.randomUUID`) + `qrcode` SVG/Canvas rendering + `html5-qrcode` device camera scanner.

---

## 📋 Database Schema & Tables

All database tables, constraints, indexes, triggers, and Row Level Security policies are defined in [`supabase/schema.sql`](./supabase/schema.sql).

### Table Definitions:
1. **`profiles`**: Links directly to Supabase Auth (`auth_user_id`). Stores `full_name`, `email`, `phone`, `role ('student' | 'vendor')`.
2. **`students`**: Foreign key to `profiles`. Stores `student_id` (Roll Number), `college_email`, `phone`.
3. **`vendors`**: Foreign key to `profiles`. Stores `vendor_id` (e.g. `VND-01`), `vendor_name`, `phone`, `is_active`.
4. **`food_items`**: Menu catalog managed by vendors. Stores `vendor_id`, `name`, `description`, `category`, `price`, `image_url`, `is_available`, `stock_quantity`.
5. **`orders`**: Pre-orders placed by students. Stores `order_number`, `student_id`, `vendor_id`, `subtotal`, `total_amount`, `payment_status ('PENDING' | 'PAID' | 'FAILED')`, `order_status ('PENDING_PAYMENT' | 'PAID' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED')`, `qr_token`, `qr_generated_at`, `qr_scanned_at`, `notes`.
6. **`order_items`**: Immutable snapshots of purchased dishes (`food_name_snapshot`, `price_snapshot`, `quantity`, `subtotal`).
7. **`payments`**: Transaction audits (`order_id`, `payment_provider`, `transaction_id`, `amount`, `status`, `paid_at`).
8. **`notifications`**: User-specific alerts (`recipient_profile_id`, `order_id`, `title`, `message`, `type`, `is_read`).

---

## ⚙️ Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the following variables in `.env`:

```env
# 1. Supabase Backend Configuration (From your Supabase project dashboard)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Razorpay Payment Gateway (Optional - falls back to Test Payment Mode if omitted)
VITE_RAZORPAY_KEY_ID=rzp_test_yourKeyHere

# 3. Server Port
PORT=3001
```

> **Note**: If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not configured yet, the app activates its **built-in local database engine** so all features (Auth, DB queries, Realtime pub-sub, Camera QR scanning, and Payment flows) can be tested immediately with zero configuration. You can also connect your live Supabase credentials on the fly directly inside the app using the **Database Settings** button in the top navigation bar!

---

## 🗄️ How to Configure Supabase

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and click **"New Project"**.
2. Name your project (e.g., `CampusBite`) and set a secure database password.

### Step 2: Create Database Tables & Run Schema
1. In the Supabase Dashboard sidebar, click **SQL Editor**.
2. Click **"New Query"**.
3. Copy and paste the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
4. Click **Run** (or `Ctrl + Enter`).
5. All 8 tables, foreign keys, indexes, triggers, and seed data will be created automatically.

### Step 3: Configure Row Level Security (RLS)
The `supabase/schema.sql` script automatically enables RLS on all tables and applies granular policies:
- **Students**: Can select & insert their own orders, payments, and view their own profile and notifications.
- **Vendors**: Can manage their own food items, view orders assigned to their vendor ID, update order statuses, and verify QR tokens.
- **Public**: Authenticated users can read available food items and active canteen vendor bays.

### Step 4: Configure Supabase Realtime
To enable live instant order notifications and status tracking:
1. In Supabase Dashboard, go to **Database** $\rightarrow$ **Replication**.
2. Find the `supabase_realtime` publication.
3. Ensure the toggle is enabled for:
   - `orders`
   - `notifications`
   - `food_items`
*(Note: `supabase/schema.sql` includes the SQL statement `ALTER PUBLICATION supabase_realtime ADD TABLE orders, notifications, food_items;`)*.

### Step 5: Configure Supabase Storage (For Dish Images)
1. Go to **Storage** $\rightarrow$ **New Bucket**.
2. Name the bucket `canteen-food`.
3. Set **Public Bucket** to `ON` and click Save.

---

## 💳 How to Configure Razorpay (Optional)

1. Sign up or log in to the [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** $\rightarrow$ **API Keys** and click **Generate Test Key**.
3. Copy the **Key Id** (starts with `rzp_test_...`).
4. Paste it into your `.env` file as `VITE_RAZORPAY_KEY_ID`.
5. If omitted, CampusBite activates **Test Payment Mode**, allowing full simulation of UPI, Debit/Credit Card, NetBanking, and Campus RFID Wallet with genuine database transactions.

---

## 🚀 How to Run the Application

### 1. Install Dependencies:
```bash
npm install
```

### 2. Start Unified Server & Client:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Express Backend API**: `http://localhost:3001`

### 3. Production Build:
```bash
npm run build
npm run preview
```

---

## 🧪 Complete End-to-End Verification Test Flow

Follow these steps to demonstrate the complete, realistic flow:

### Flow 1: Student Pre-Order & Payment
1. Open the app on `http://localhost:5173` (or the live Vercel URL).
2. Click **User Profile** $\rightarrow$ Click **"🎓 Login as Student"** (or register a new student account with Full Name, Student ID, College Email, Phone, and Password).
3. On the **Home** screen, browse food items across categories (`Breakfast`, `Lunch`, `Snacks`, `Drinks`, `Combos`).
4. Click on any dish (e.g., *Crispy Masala Dosa* or *Veg Thali Deluxe*) to view ingredients and add cooking instructions.
5. Click **"Add to Cart"** $\rightarrow$ Open the **Cart Drawer**.
6. Review your subtotal and click **"Proceed to Checkout"**.
7. In the **Checkout Review**, observe the student credentials and click **"Proceed to Payment"**.
   - Notice: Order is inserted into Supabase with `payment_status = 'PENDING'` and `order_status = 'PENDING_PAYMENT'`.
8. The **Payment Gateway** modal opens. Select a payment method (UPI, Campus RFID Wallet, Card, or NetBanking).
9. Click **"Pay Now"**.
10. Upon verification:
    - Audio chime rings and celebratory confetti fires!
    - Order is updated to `payment_status = 'PAID'`, `order_status = 'PAID'`.
    - Cryptographic unique `qr_token` is generated.
    - Click **"View My Pickup QR Pass"** to see your unique dynamic QR code pass with pickup instructions.

### Flow 2: Vendor Live Order Notification & Kitchen Pipeline
1. Switch to **Vendor** role via the top navigation bar (or use **"Split Demo"** mode to view Student and Vendor side-by-side on one screen).
2. As soon as the student pays, the vendor screen immediately displays:
   ```
   🔔 NEW ORDER
   Order: #CB-10245
   Student: Rahul Sharma
   Student ID: 21BCS042
   Items: 1 × Crispy Masala Dosa, 1 × Thick Cold Coffee
   Total: ₹100.00 | Payment: PAID
   [ACCEPT ORDER] [REJECT ORDER]
   ```
3. Click **"ACCEPT ORDER"** $\rightarrow$ Order transitions to `ACCEPTED`.
4. In the **Orders** tab, click **"Start Preparing"** $\rightarrow$ Order transitions to `PREPARING`.
5. When ready, click **"Mark Ready for Pickup"** $\rightarrow$ Order transitions to `READY`.
6. Switch back to the Student view (or check the left phone in Split Screen): The student's live stepper automatically updates to `Ready for Pickup at Counter Bay!` with audio alert.

### Flow 3: Camera QR Scanner Verification & Redemption
1. In Student view, navigate to the **QR** tab to display the dynamic pass.
2. In Vendor view, navigate to the **Scan QR** tab.
3. Click **"Open Camera & Scan"** to activate your webcam / mobile camera.
4. Point the camera at the student's QR code (or use the one-click **"Test Scan Active Ready Orders"** button).
5. The scanner instantly decodes the payload, validates against Supabase:
   - Order exists: ✓
   - Security token matches: ✓
   - Payment status is PAID: ✓
   - Not already collected: ✓
6. A green verification card displays:
   ```
   ✓ ORDER VERIFIED & VALID
   Student: Rahul Sharma (21BCS042)
   Items: 1x Crispy Masala Dosa, 1x Thick Cold Coffee
   [CONFIRM FOOD COLLECTION & DELIVER]
   ```
7. Click **"CONFIRM FOOD COLLECTION & DELIVER"**.
8. Order status updates in Supabase to `COMPLETED` and stamps `qr_scanned_at`.
9. The student receives a push notification: *"Food Collected Successfully! 🍽️"*.

### Flow 4: Anti-Fraud Anti-Replay Protection
1. Attempt to scan the exact same QR code a second time.
2. The scanner rejects the QR code and displays:
   ```
   ❌ INVALID OR REJECTED QR CODE
   FOOD ALREADY COLLECTED! This QR code was redeemed at [time]. Cannot be reused.
   ⚠️ Anti-fraud protection triggered.
   ```

---

## 🛡️ Security & Best Practices

- **Zero Client Secret Leaks**: Only `VITE_SUPABASE_ANON_KEY` and public client keys are exposed. Service-role secrets are never imported in browser bundles.
- **Snapshot Immutability**: `order_items` stores historical snapshots of food names and unit prices at purchase time, ensuring historic receipts remain accurate even if vendors change prices later.
- **Row Level Security**: Database-level isolation ensures students cannot view other students' private orders, nor can unauthorized users manipulate vendor menus.
