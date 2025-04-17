# Bidding System

A full-stack bidding system built with Next.js, Shadcn/UI, and Prisma (PostgreSQL).

## Features

- User authentication (mock implementation)
- Collection management (create, read, update, delete)
- Bid management (create, read, update, delete)
- Bid acceptance workflow with automatic rejection of competing bids
- Responsive UI with Shadcn/UI components

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Shadcn/UI, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/surfercoder/bidding-system.git
cd bidding-system
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
DATABASE_URL="postgresql://username:password@localhost:5432/bidding_system?schema=public"
```
Replace `username`, `password`, and other details as per your PostgreSQL setup.

4. Run database migrations:
```bash
npx prisma migrate dev --name init
```

5. Seed the database:
```bash
npx prisma db seed
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select a user from the mock login dropdown to authenticate.
2. Browse the list of collections.
3. As a collection owner:
   - Edit or delete your collections
   - Accept bids on your collections
4. As a non-owner:
   - Place bids on collections
   - Edit or cancel your bids

## System Architecture

The application follows a standard Next.js architecture:

- **Frontend**: React components with TailwindCSS and Shadcn/UI for styling
- **API**: Next.js API routes for handling data operations
- **Database**: PostgreSQL with Prisma ORM for data management

## Explanatory video

You can see the app up and running with an explanation of how to use it here: [Explanatory Video](https://www.loom.com/share/93e26338d43040c188e07fcb88e4eb37?sid=34ae0f6e-f732-42a5-af57-e31c2ddb1997)

## Live demo

You can see the app up and running here: [Live Demo](https://bidding-system-sigma.vercel.app/)

## Monitoring and Performance

### How would you monitor the application to ensure it is running smoothly?

1. **Application Performance Monitoring (APM):**
   - Implement Sentry or New Relic for real-time error tracking and performance monitoring
   - Set up Prometheus and Grafana for metrics visualization and alerting
   - Use Next.js Analytics for page load times and Core Web Vitals

2. **Log Management:**
   - Centralize logs using ELK stack (Elasticsearch, Logstash, Kibana) or Datadog
   - Set up alerts for error spikes or unusual patterns

3. **Database Monitoring:**
   - Monitor query performance using Prisma Studio or pgAdmin
   - Track slow queries and optimize them
   - Monitor database connections and resource usage

4. **User Experience Monitoring:**
   - Implement client-side error tracking
   - Set up user session recording tools like Hotjar
   - Create custom events tracking for critical user journeys

5. **Health Checks and Alerting:**
   - Implement API health endpoints
   - Set up uptime monitoring with services like Uptime Robot
   - Configure alerts for system failures or degradation

### How would you address scalability and performance?

1. **Database Optimization:**
   - Add appropriate indexes to frequently queried fields
   - Implement database connection pooling
   - Consider read replicas for read-heavy workloads
   - Implement data partitioning for large tables

2. **API Performance:**
   - Implement caching strategies (Redis, Vercel Edge Cache)
   - Optimize database queries with proper indexing
   - Use pagination for large data sets
   - Implement rate limiting to prevent abuse

3. **Frontend Performance:**
   - Implement code splitting and lazy loading
   - Optimize images and static assets
   - Use ISR (Incremental Static Regeneration) for semi-dynamic content
   - Implement client-side caching strategies

4. **Infrastructure Scaling:**
   - Use serverless deployments with Vercel or similar platforms
   - Implement horizontal scaling for API routes
   - Consider edge computing for global performance
   - Use CDN for static assets

5. **Future Considerations:**
   - Implement WebSockets for real-time bid updates
   - Consider microservices architecture for specific high-load features
   - Implement queue systems for handling bid processing

## Trade-offs Made During Development

1. **Authentication:**
   - Used a simple mock authentication system instead of implementing a full OAuth flow or JWT-based auth
   - In a production environment, we would implement proper authentication with Next-Auth or a similar solution

2. **Real-time Updates:**
   - Current implementation relies on polling or manual refreshes to see new bids
   - In a production environment, WebSockets or Server-Sent Events would provide real-time updates

3. **Error Handling:**
   - Implemented basic error handling and feedback
   - A production system would need more robust error handling, retry mechanisms, and detailed error reporting

4. **Data Validation:**
   - Implemented basic frontend validation with Zod
   - A production system would need more comprehensive validation on both client and server sides

5. **Testing:**
   - Did not implement automated tests due to time constraints
   - A production system would require unit, integration, and end-to-end tests

6. **UI/UX:**
   - Focused on functionality over advanced UI features
   - A production system would benefit from more refined UI/UX, animations, and responsive design

7. **SEO and Accessibility:**
   - Basic implementation without advanced SEO or accessibility features
   - A production system would need proper meta tags, semantic HTML, and ARIA attributes

## License

MIT