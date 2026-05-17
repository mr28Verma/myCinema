# 🎬 Movie Ticket & OTT Streaming Platform

A modern React + Vite entertainment platform that combines:

- 🎟 Movie ticket booking
- 🍿 OTT streaming experience
- 📺 Web series browsing
- 📍 Nearby theater discovery
- 🌙 Netflix / BookMyShow inspired UI

---

# 🚀 Features

## 🎟 Cinema Booking System

- Browse movies from TMDB
- Dynamic movie posters & ratings
- Theater selection
- Seat booking UI
- Payment flow UI
- Booking confirmation
- Google Maps nearby theaters
- User geolocation support

---

## 📺 OTT Streaming Platform

- Stream mode navigation
- Movies section
- Web series section
- Live TV section
- Hero banner carousel
- Auto-sliding featured content
- Netflix-style interface
- TMDB powered dynamic content

---


## 🎨 UI/UX Features

- Fully responsive design
- Dark cinematic theme
- Animated transitions
- Mobile optimized layouts
- Dynamic navigation states
- Modern card-based UI

---

# 🛠 Tech Stack

| Technology | Usage |
|---|---|
| React | Frontend framework |
| TypeScript | Type safety |
| Vite | Build tool |
| React Router DOM | Routing |
| TMDB API | Movies & web series |
| Google Maps API | Nearby theaters |
| CricAPI | Sports data |
| Lucide React | Icons |
| Tailwind CSS / Custom CSS | Styling |
| Vercel | Deployment |

---

# 📂 Project Structure

```txt
src/
├── components/
│   ├── Navbar.tsx
│   └── Movies.tsx
│   └── homePage.tsx
│   └── BookingPage.tsx
│   └── MovieSection.tsx
│   └── SignInModal.tsx
│   └── StreamPage.tsx
│
│
├── App.tsx
└── main.tsx
```
```txt
backend/
├── config
│   ├── db.js
├── controllers
│   ├── authController.js
├── routes
│   ├── authRoute.js
│
│
├── server.js
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

```env
VITE_TMDB_KEY=your_tmdb_api_key
VITE_GOOGLE_API_KEY=your_google_maps_key
VITE_EVENT_API=your_event_api_key
```

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/mr28Verma/myCinema.git
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Development Server

```bash
npm run dev
```

---

# 🌐 APIs Used

## TMDB API

Used for:
- Movies
- Web series
- Posters
- Ratings
- Trending content

🔗 https://www.themoviedb.org/

---

## Google Maps API

Used for:
- Nearby theaters
- Places API
- User geolocation

🔗 https://developers.google.com/maps

---


# 🧭 Routing

| Route | Page |
|---|---|
| `/` | Cinema Homepage |
| `/booking` | Booking Page |
| `/stream` | OTT Homepage |
| `/stream/movies` | Movies |
| `/stream/webseries` | Web Series |
| `/stream/live` | Live TV |

---

# ☁ Deployment

This project is deployed on:

## Vercel

### Add Environment Variables In Vercel

- Open Project Settings
- Go to Environment Variables
- Add all `VITE_` variables
- Redeploy project

---

# 📸 Screens Included

- Cinema Homepage
- OTT Stream Page
- Movie Booking UI
- Theater Selection
- Sports Section
- Mobile Responsive Views

---

# 🔮 Future Improvements

- Firebase Authentication
- Razorpay Integration
- Real Video Streaming
- Watchlist System
- User Profiles
- AI Recommendations
- QR Ticket Generation
- Subscription Plans
- Admin Dashboard

---

# 👨‍💻 Author

Built with ❤️ using React + TypeScript + Vite.

---

# ⭐ Support

If you like this project:

- Star the repository
- Fork the project
- Share feedback

---

# 📜 License

This project is for educational and portfolio purposes.
