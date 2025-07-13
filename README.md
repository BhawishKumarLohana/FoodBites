


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
