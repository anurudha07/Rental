


Rental


---


   Production grade SaaS real estate rental apartment marketplace.
   Rental v-1 version is published.

   <p><small><a href="https://rental-3psq.onrender.com/" target="_blank" rel="noopener noreferrer">View demo</a></small></p>


```



 [View Demo](https://rental-3psq.onrender.com/)
 

✨ Features -----

   Create an account & sign in quickly.

   Personal dashboard to view saved properties, applications, profile.

   Powerful search with filters (location, price, bedrooms,& many more).

   Interactive map view to browse listings and see neighborhood context.

   Save & compare favorite properties side-by-side.

   One-click apply — submit applications with attachments and track status.

   View contact details of property managers directly.

   Securely upload photos and supporting documents when applying.

   Detailed property pages with images, rent breakdown, lease terms, and neighborhood info.

   Responsive design with mature UI — works smoothly across all devices seamlessly.

   Role-based experience: tenants see their dashboard; managers can manage applications and listings.

   Quick actions for managers: post listings, approve/reject applications, and manage leases.




🛠 ----- Tech Stack -----

       Frontend: Next.js 15 + TypeScript + Shadcn UI

       Backend: Node.js + TypeScript 

       Database: Prisma + PostgreSQL

       Maps: Mapbox

       Deploy: Render 



⚙️ ----- Setup -----

🛠️ Local installation

download the zip file --
cd noted


-------------------------------------------------------------------


Backend (Node) --->
cd backend
npm i
# add .env from the sample below
npm run build
npm run dev      # start dev server 




# server/.env.example

# PostgreSQL 
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@db-host.example.com:5432/DB_NAME?schema=public"

# Allowed frontend origin 
CORS_ORIGIN=http://localhost:3000

# Auth
JWT_SECRET="replace_with_a_random_string"
EXPIRES_IN="2d"

# Cloudinary (or other file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Node env
NODE_ENV=development
PORT=4000



-------------------------------------------------------------------


Frontend (Next.js) --->
cd frontend
npm i
# create .env from the sample below
npm run build
npm run dev       # client dev server 




# client/.env.example

# API URL 
NEXT_PUBLIC_API_URL=http://localhost:4000

# Mapbox public token 
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token_here

# App meta
NEXT_PUBLIC_APP_NAME=Rental
NEXT_PUBLIC_ENV=development

# Mapbox style 
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/yourusername/yourstyleid



-------------------------------------------------------------------




📝 Developed

   --  by Anurudha Sarkar  --

       Email: anurudhs567@gmail.com
  
       Portfolio: https://portfolio-kxhf.onrender.com



Thanks if you stayed till here

Happy Hacking!!




```





