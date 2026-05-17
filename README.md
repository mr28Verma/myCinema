Movie Ticket Streaming App Readme
🎬 Movie Ticket & OTT Streaming Platform

A modern React + Vite entertainment platform that combines:

🎟 Movie ticket booking
🍿 OTT streaming experience
📺 Web series browsing
🏟 Live sports integration
📍 Nearby theater discovery
🌙 Netflix / BookMyShow inspired UI
🚀 Features
🎟 Cinema Booking System
Browse movies from TMDB
Dynamic movie posters & ratings
Theater selection
Seat booking UI
Payment flow UI
Booking confirmation
Google Maps nearby theaters
User geolocation support
📺 OTT Streaming Platform
Stream mode navigation
Movies section
Web series section
Live TV section
Hero banner carousel
Auto-sliding featured content
Netflix-style interface
TMDB powered dynamic content
🏏 Sports Section
IPL/live sports integration
Dynamic sports data
Match updates
🎨 UI/UX Features
Fully responsive design
Dark cinematic theme
Animated transitions
Mobile optimized layouts
Dynamic navigation states
Modern card-based design
🛠 Tech Stack
Technology	Usage
React	Frontend framework
TypeScript	Type safety
Vite	Build tool
React Router DOM	Routing
TMDB API	Movies & web series
Google Maps API	Nearby theaters
CricAPI	Sports data
Lucide React	Icons
Tailwind CSS / Custom CSS	Styling
Vercel	Deployment
📂 Project Structure
src/
 ├── components/
 │    ├── Navbar.tsx
 │    ├── Sports.tsx
 │    ├── MovieCard.tsx
 │
 ├── pages/
 │    ├── HomePage.tsx
 │    ├── BookingPage.tsx
 │    ├── StreamPage.tsx
 │
 ├── App.tsx
 ├── main.tsx
🔑 Environment Variables

Create a .env file in the project root.

VITE_TMDB_KEY=your_tmdb_api_key
VITE_GOOGLE_API_KEY=your_google_maps_key
VITE_CRICKET_API=your_cricket_api_key
📦 Installation
1. Clone Repository
git clone https://github.com/your-username/your-repo-name.git
2. Install Dependencies
npm install
3. Start Development Server
npm run dev
🌐 APIs Used
TMDB API

Used for:

Movies
Web series
Posters
Ratings
Trending content

🔗 https://www.themoviedb.org/

Google Maps API

Used for:

Nearby theaters
Places API
User geolocation

🔗 https://developers.google.com/maps

CricAPI

Used for:

IPL matches
Live sports updates

🔗 https://www.cricapi.com/

🧭 Routing
Route	Page
/	Cinema Homepage
/booking	Booking Page
/stream	OTT Homepage
/stream/movies	Movies
/stream/webseries	Web Series
/stream/live	Live TV
☁ Deployment

This project is deployed on:

Vercel
Add Environment Variables In Vercel
Open Project Settings
Go to Environment Variables
Add all VITE_ variables
Redeploy project
📸 Screens Included
Cinema Homepage
OTT Stream Page
Movie Booking UI
Theater Selection
Sports Section
Mobile Responsive Views
🔮 Future Improvements
Firebase Authentication
Razorpay Integration
Real Video Streaming
Watchlist System
User Profiles
AI Recommendations
QR Ticket Generation
Subscription Plans
Admin Dashboard
👨‍💻 Author

Built with ❤️ using React + TypeScript + Vite.

⭐ Support

If you like this project:

Star the repository
Fork the project
Share feedback
📜 License

This project is for educational and portfolio purposes.
