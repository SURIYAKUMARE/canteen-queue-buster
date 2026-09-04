# Smart Canteen Pre-Order & Queue Management System

A working prototype web application designed for college canteens to solve the serial token counter bottleneck.

---

## 💡 The Core Problem Solved
In traditional college canteens, students wait **15–20 minutes** in a single physical queue because a single cashier performs three sequential actions for every order:
1. **Taking the oral order**
2. **Handling cash / POS payment**
3. **Printing and issuing a paper token**

After receiving their token, students crowd the delivery counter because the kitchen has **no advance visibility** into pending demand and prepares dishes reactively.

### The Decoupled Architecture
This application decouples the ordering workflow into three distinct stages:
1. **Stage 1 — Remote Pre-Ordering & Digital Payment**: Placed asynchronously by students from classrooms or hostels (using Campus RFID, UPI, or Cash-on-Pickup).
2. **Stage 2 — Capacity-Aware 5-Minute Slot Scheduling**: Orders are assigned to the earliest 5-minute pickup slot that respects kitchen capacity (e.g., maximum 6 items per slot). When a slot is full, the system automatically rolls over to subsequent slots.
3. **Stage 3 — Staggered Express Counter Pickup**: Students arrive only during their assigned 5-minute window or when notified, reducing physical counter wait times to **< 1 minute**.

---

## 🚀 Key Features & Demo Modules

### 1. 🎓 Student Pre-Order Experience (Mobile-First)
- **10 Authentic Canteen Dishes** with categories (*Meals, Quick Bites, South Indian, North Indian, Beverages*), vegetarian indicators, price, and prep-time badges.
- **Cart Drawer & Modifiers**: Add items, adjust quantities, specify dietary notes.
- **Simulated Instant Payment**: Campus RFID card wallet, UPI QR, or Cash on Pickup.
- **Digital Token Pass**: Generates unique token (e.g. `#TK-104`), pickup bay designation, and counter QR code.
- **Live Order Status Stepper**: Real-time transitions:
  - `Confirmed` $\rightarrow$ `Being Prepared` $\rightarrow$ `Ready for Pickup` $\rightarrow$ `Completed`
- **Simulated SMS / WhatsApp Alert**: Push popup simulating message delivery to the student's phone when ready.
- **Order History**: Review previous tokens and receipts.

### 2. 👨‍🍳 Kitchen Operations Hub (Key Demo Screen)
- **5-Minute Slot Aggregation Pipeline**: Incoming orders grouped into 5-minute slots (`12:00`, `12:05`, `12:10`, `12:15`, `12:20`...).
- **Aggregated Batch Item Totals**: Displays total items required per slot (e.g., *"12:10 Slot: 4x Veg Thali Deluxe, 2x Kulhad Chai"*), allowing cooks to batch-prep ahead of time.
- **Slot Capacity Progress Bar**: Visual gauge showing item load vs. capacity (e.g., `5/6 items - 83% full`). Full slots are highlighted in red.
- **Interactive Capacity Slider**: Dynamically adjust kitchen capacity (3 to 12 items/slot) to demonstrate how slot throttling rolls orders to later slots.
- **One-Click State Transitions**: Staff can click *"Start Prep"* and *"Mark Ready for Pickup"*, triggering an audio chime and real-time student screen update.

### 3. 📈 Lunch Demand Forecasting Panel
- **Moving Average Bar Chart**: Visual comparison of **Predicted vs. Actual Orders** per 5-minute bucket across the lunch rush (11:45 AM – 1:20 PM).
- **Viva-Ready Methodology**:
  $$\text{Predicted}_t = 0.50 \times D_{1,t} + 0.30 \times D_{2,t} + 0.20 \times D_{3,t}$$
  A weighted 3-day moving average that captures lecture-dismissal surges without the overhead of heavy deep learning models.
- **Operational Kitchen Advice**: Dynamic recommendation box (e.g. *"Surge alert for 12:15 PM — pre-prep 20x Veg Thali gravies 15 minutes prior"*).

### 4. 🗣️ Walk-In Order NLP Terminal (Free-Text Extraction Demo)
- Natural language text field accepting casual walk-in spoken phrases (e.g., *"veg thali no onion and a chai"*).
- Rule-based entity extraction pipeline:
  - Detects menu items via alias matching.
  - Detects quantities (`2`, `two`, `a`, `couple`).
  - Extracts modifiers and dietary flags (`No Onion/Garlic`, `Less / No Sugar`, `Extra Chutney`).
- Pre-loaded prompt chips for one-click demo testing.
- **Direct Injection**: Click *"Place Order & Assign Earliest Pickup Slot"* to push parsed walk-in orders directly into the live kitchen queue.

### 5. 💡 Project Showcase / Viva Presentation Screen
- Side-by-side comparison table of the traditional single queue vs. decoupled pre-order system.
- Recommended 3-minute viva walkthrough script.
- *"⚡ Simulate Rush"* button to inject multiple student orders simultaneously and watch slot overflow live.

---

## 🛠️ Tech Stack & Architecture
- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Canvas-Confetti, Web Audio API Sound Synthesizer.
- **Backend**: Node.js, Express, Server-Sent Events (SSE) for real-time live synchronization.
- **Algorithms**:
  - `assignPickupSlot()`: Earliest-slot assignment with capacity-bounded lookahead.
  - `parseNaturalLanguageOrder()`: Entity & modifier extraction.
  - `computeForecastMetrics()`: Weighted moving average demand prediction.

---

## 🏃 How to Run Locally

### Start the Server (Serves both Backend API + Built Frontend):
```bash
node server/index.js
```
Open **`http://localhost:3001`** in your browser.

### Development Mode (with Hot Reloading):
```bash
npm run dev
```
- Frontend runs on: `http://localhost:5173`
- Backend API runs on: `http://localhost:3001`
