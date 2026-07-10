# Laser Point — Premium Printing & Engraving

<p align="center">
  <img src="./logo.png" alt="Laser Point Logo" width="220" />
</p>

<p align="center">
  A modern, full-featured business website for <strong>Laser Point</strong> — a precision printing & engraving studio offering UV Printing, UV DTF Stickers, MDF Cutting, and Laser Engraving services.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-black?logo=express" />
  <img src="https://img.shields.io/badge/Nodemailer-6.x-blue?logo=gmail" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## ✨ Features

- 🎨 **Premium dark-mode UI** with gold accents, glassmorphism & smooth animations
- 📱 **Fully responsive** — mobile, tablet & desktop
- 🖨️ **Services section** with real machine background images
- 🖼️ **Our Work gallery** with hover overlays
- 💬 **WhatsApp floating button** pre-filled with order message
- 📋 **Live order form** with:
  - File upload (PDF / AI / PNG / JPG / SVG / EPS — up to 20 MB)
  - Real-time price calculator
  - Sends email to **owner** (with design file attached) and **customer** (order confirmation)
- 🌙 **Light / Dark theme** toggle
- 🔔 **Toast notifications** on form submission
- 🗺️ **Google Maps** embed in contact section
- 🏷️ **Custom favicon** matching the brand

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | HTML5, Vanilla CSS, Vanilla JS      |
| Animations  | AOS (Animate on Scroll)             |
| Icons       | Font Awesome 6                      |
| Fonts       | Google Fonts (Playfair Display + Inter) |
| Backend     | Node.js + Express                   |
| Email       | Nodemailer (Gmail SMTP)             |
| File Upload | Multer (memory storage)             |
| Config      | dotenv                              |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/laserpoint.git
cd laserpoint
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-gmail@gmail.com
MAIL_PASS=your-16-char-app-password
OWNER_EMAIL=your-gmail@gmail.com
PORT=3000
```

> **⚠️ Important:** Use a **Gmail App Password**, not your regular password.  
> Generate one at: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)  
> (Requires 2-Step Verification to be enabled on your Google account.)

### 4. Run the server

**Development (with auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Then open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
laserpoint/
├── index.html          # Main website (single-page)
├── server.js           # Express backend — handles order form & email
├── logo.png            # Brand logo (navbar + footer)
├── favicon.png         # Browser tab favicon
├── package.json        # Node.js project config
├── .env                # 🔒 Secret credentials (never commit!)
├── .env.example        # Safe template for .env
└── .gitignore          # Git exclusion rules
```

---

## 📧 How the Order Form Works

1. Customer fills in name, email, order type, quantity, notes & uploads design file
2. On submit → `POST /send-order` is called on the Express backend
3. Server sends **two emails** via Gmail SMTP:
   - 📬 **Owner email** — full order details + design file as attachment
   - 📩 **Customer email** — order confirmation with summary
4. A toast notification confirms success or shows an error

---

## 🔑 Gmail App Password Setup

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (if not already)
3. Search for **"App passwords"**
4. Create a new app password for **Mail**
5. Copy the 16-character password into `MAIL_PASS` in your `.env`

---

## 📞 Contact

| Channel  | Details                          |
|----------|----------------------------------|
| 📱 Phone  | +91 98929 39320                  |
| 💬 WhatsApp | +91 98929 39320                |
| 📧 Email  | order.laserpoint@gmail.com       |
| 🕘 Hours  | Mon–Sat: 9:00 AM – 7:00 PM IST  |

---

## 📄 License

MIT © 2026 Laser Point. All rights reserved.
