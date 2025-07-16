# FoodBites – Fighting Food Waste, One Bite at a Time

## Inspiration

In Hong Kong and across the globe, rising income inequality has led to a heartbreaking contrast: countless families struggle to afford daily meals, while large quantities of edible food are discarded into landfills by restaurants and households.

As international students living in Hong Kong, we witnessed this disparity firsthand. We saw perfectly good food being thrown away, even as many people on the streets pleaded for a bowl of rice.

This experience inspired us to build **FoodBites**. A platform designed to bridge this gap by connecting NGOs with donors and restaurants, enabling real-time redistribution of surplus food to those who need it most.

## What It Does

FoodBites offers a simple yet powerful solution to the inefficiencies in food donation and redistribution. 

The platform enables:

**Listing** of surplus food by individuals, restaurants, and businesses  
**Claiming** of food donations by NGOs through a clean, intuitive interface  
**Visualization** of nearby food donations using an interactive, location-aware map  

By connecting supply and demand in real time, FoodBites helps reduce food waste, accelerate impact, and support food security.

## How We Built It

This is a full stack web application built using modern and scalable tools:

**Frontend**: Developed with Next.js for rendering and routing  
**Styling**: Powered by TailwindCSS for responsive, accessible design  
**Backend**: MySQL used for data storage, managed via Prisma ORM  
**Maps Integration**: Google Maps API for real-time geolocation and address-based interaction  

Geospatial queries allow NGOs and donors to connect based on proximity, enabling more efficient food pickups and deliveries.

## Screenshots

Below are a few images showcasing the core features and UI of FoodBites:

![Homepage – Browse Donations](./screenshots/homepage.png)  
*Homepage where NGOs can view available food donations nearby*

![Donation Form](./screenshots/donation-form.png)  
*Form to submit surplus food details*

![Interactive Map View](./screenshots/map-view.png)  
*Google Maps integration showing nearby food sources*

> _Please place screenshots inside a `screenshots/` folder in the repo root._

## Challenges We Faced

**Database schema design** was one of the most demanding tasks. We needed a flexible yet optimized structure that could scale with different user roles and data relationships.

**Time constraints** were also a real challenge. Our idea was ambitious, and building it end-to-end within a short window required careful planning, division of tasks, and execution under pressure.

## Accomplishments We're Proud Of

We successfully built a fully functional, full stack application from scratch in record time.  

Our project is more than just a prototype—it is a thoughtful, mission-driven solution designed with impact in mind. It aligns directly with the following United Nations Sustainable Development Goals (SDGs):

**SDG 2: Zero Hunger** – Enables NGOs to efficiently reach those experiencing food insecurity  
**SDG 12: Responsible Consumption and Production** – Reduces food waste through real-time redistribution  
**SDG 17: Partnerships for the Goals** – Encourages collaboration among restaurants, individuals, and NGOs  

## What We Learned

This was our first hackathon and the fastest we’ve ever built a project together. Through this experience, we learned how to:

Understand real-world problems and design technical solutions around them  
Collaborate under high pressure with limited time  
Build a user-friendly, scalable web app with real-time functionality  

## What’s Next

We aim to take FoodBites beyond the demo stage. Our roadmap includes:

Making the platform production-ready and hosting it publicly  
Adding real-time notifications for food status updates  
Introducing mobile-first design for wider accessibility  
Implementing food freshness indicators, trust ratings, and expiration timers  
Exploring Progressive Web App (PWA) support for low-connectivity regions  

## Built With

Next.js  
TailwindCSS  
MySQL  
Prisma ORM  
Google Maps API  

## Judge Feedback Highlights

> “FoodBites is globally relevant and addresses a tangible problem. The user interface is clean and the system architecture demonstrates sound technical understanding.”

> “Real-time matching, expiry tracking, and user trust metrics would further improve the platform.”

> “Great idea. Consider adding a feature to redirect suitable food to stray animals.”


## Getting Started

To run the project locally, please follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/BhawishKumarLohana UnitedHack-Hackathon-Project
cd into directory
````

### 2. Create the Environment File

* Copy the `.env.example` file and rename it to `.env`.
* Fill in the required environment variables as shown below.

### 3. Set Up MySQL Database

* Start your MySQL server.
* Create a new database named `FoodBridge` (or choose your own name).
* Update the `DATABASE_URL` in your `.env` file accordingly:

```env
DATABASE_URL="mysql://root:root@localhost:3306/FoodBridge"
```

Modify the credentials and database name as needed.

### 4. Generate JWT Secret

Use the following command to generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add the result to your `.env` file:

```env
JWT_SECRET="your-generated-secret"
```

### 5. Add Google Maps API Key

Add your Google Maps API key to your `.env` file:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

---

After completing the steps above, you can start the project with:

```bash
npm install
npm run dev
```

```
```
