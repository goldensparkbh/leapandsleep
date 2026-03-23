# LeapAndSleep

A modern affiliate content platform focused on passive income, online business, AI tools, and automation.

## Features

- **Content-First Architecture**: Blog posts, tool reviews, comparisons, and guides
- **Five Core Sections**: Learn & Earn, Tools & Rules, Build & Yield, Click & Pick, Guide & Ride
- **Admin Dashboard**: Full CMS for managing content, tools, affiliate links, and leads
- **SEO-Ready**: Dynamic meta tags, structured data, sitemap architecture
- **Responsive Design**: Mobile-first, works on all devices
- **Firebase Backend**: Authentication, Firestore database, storage, and hosting

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animation**: GSAP + ScrollTrigger
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase CLI (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leapandsleep.git
cd leapandsleep
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your Firebase configuration to `.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Firebase Setup

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase (if not already done):
```bash
firebase init
```

4. Deploy to Firebase:
```bash
firebase deploy
```

## Project Structure

```
leapandsleep/
├── src/
│   ├── components/
│   │   ├── public/       # Public-facing components
│   │   ├── admin/        # Admin dashboard components
│   │   ├── shared/       # Shared components (SEO, Newsletter, etc.)
│   │   └── ui/           # shadcn/ui components
│   ├── contexts/         # React contexts (Auth, Data)
│   ├── data/             # Sample data
│   ├── hooks/            # Custom React hooks
│   ├── pages/
│   │   ├── public/       # Public pages
│   │   └── admin/        # Admin pages
│   ├── sections/         # Homepage sections
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
├── firebase.json         # Firebase configuration
└── package.json
```

## Content Sections

### Learn & Earn
Educational content for beginners: passive income concepts, tactics, and first steps.

### Tools & Rules
Tool directories, reviews, and recommendations with usage guidelines.

### Build & Yield
System-building content: monetization systems, automations, funnels.

### Click & Pick
Comparison pages, curated lists, "best of" pages, buyer-intent content.

### Guide & Ride
Step-by-step guides, roadmaps, walkthroughs, and strategy playbooks.

## Admin Features

- **Dashboard**: Overview of posts, tools, subscribers, and analytics
- **Content Management**: Create, edit, and publish blog posts
- **Tool Management**: Add and manage affiliate tools
- **Comparison Builder**: Create side-by-side tool comparisons
- **Affiliate Links**: Central management of all affiliate links
- **Categories**: Organize content with categories and tags
- **Leads CRM**: Manage newsletter subscribers and contact forms
- **Media Library**: Upload and manage images and files
- **Site Settings**: Configure site-wide settings

## SEO Features

- Dynamic meta tags for each page
- JSON-LD structured data
- Open Graph / Twitter Cards
- Canonical URLs
- Sitemap-ready architecture
- Clean URL structure

## Customization

### Colors
Edit the colors in `tailwind.config.js` and `src/index.css`:

- Primary: `#0B0D10` (dark navy)
- Accent: `#B8B1F5` (lavender)
- Background: `#F6F7F9` (off-white)

### Fonts
The default fonts are:
- Headings: Space Grotesk
- Body: Inter
- Labels/Mono: IBM Plex Mono

## Deployment

### Firebase Hosting

1. Build the project:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

### Other Hosting

The `dist` folder contains the static build that can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or support, contact us at hello@leapandsleep.com
"# leapandsleep" 
