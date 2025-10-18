# Frontend Application

A modern React/TypeScript frontend application for the CS3203 service marketplace platform, built with Vite and featuring comprehensive user interfaces for service discovery, provider management, and real-time communication.

## Features

- **User Authentication**: Registration, login, and profile management
- **Service Marketplace**: Browse, search, and book services
- **Provider Management**: Service provider profiles and dashboards
- **Real-time Messaging**: WebSocket-based conversation system
- **Payment Integration**: Stripe-powered secure payments
- **Location Services**: Google Maps integration for location-based features
- **Admin Dashboard**: Administrative controls and analytics
- **Internationalization**: Multi-language support with i18n
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **AI Chatbot**: Intelligent customer support
- **Analytics**: Comprehensive dashboard with charts and metrics
- **Notifications**: Real-time notification system
- **Service Requests**: Customer service booking workflow
- **Rating System**: Customer and service provider reviews

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Payments**: Stripe React SDK
- **Maps**: Google Maps JavaScript API
- **Charts**: Chart.js, Recharts
- **Animations**: Framer Motion
- **Internationalization**: i18next
- **WebSocket**: Socket.io Client
- **3D Graphics**: Three.js
- **PDF Generation**: jsPDF
- **QR Codes**: react-qr-code
- **Icons**: Lucide React, React Icons
- **Testing**: Vitest with Testing Library
- **Linting**: ESLint

## Prerequisites

- Node.js (v18+ recommended)
- npm, pnpm, or yarn package manager
- Backend API server running (default: http://localhost:3000)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CS3203-Project/frontend.git
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
VITE_API_URL=http://localhost:3000/api

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Running the Application

### Development
```bash
pnpm dev
# or
npm run dev
```

### Production Build
```bash
pnpm build
# or
npm run build
```

### Preview Production Build
```bash
pnpm preview
# or
npm run preview
```

### Start Production Server
```bash
pnpm start
# or
npm run start
```

## Testing

### Run Tests
```bash
pnpm test
# or
npm run test
```

### Run Tests with UI
```bash
pnpm test:ui
# or
npm run test:ui
```

### Run Tests Once
```bash
pnpm test:run
# or
npm run test:run
```

### Generate Coverage Report
```bash
pnpm test:coverage
# or
npm run test:coverage
```

## Code Quality

### Linting
```bash
pnpm lint
# or
npm run lint
```

## Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                   # API service functions
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── Chatbot/          # AI chatbot components
│   │   ├── Messaging/        # Messaging components
│   │   ├── Payment/          # Payment components
│   │   └── services/         # Service-related components
│   ├── contexts/             # React contexts for state management
│   ├── data/                 # Static data and constants
│   ├── hooks/                # Custom React hooks
│   ├── locales/              # Internationalization files
│   ├── Pages/                # Page components
│   ├── services/             # Business logic services
│   ├── styles/               # Additional styles
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── i18n.ts               # Internationalization configuration
├── test/                     # Test files and setup
├── coverage/                 # Test coverage reports
└── dist/                     # Production build output
```

## Key Pages and Features

### Public Pages
- **Homepage**: Service marketplace landing page
- **Browse Services**: Service discovery and filtering
- **Service Details**: Individual service information
- **Search Results**: Advanced search functionality
- **Categories**: Service categorization
- **Support**: Customer support page
- **Articles**: Knowledge base articles
- **Success Stories**: Customer testimonials
- **How It Works**: Platform explanation
- **Pricing**: Service pricing information

### Authentication
- **Sign Up**: User registration
- **Sign In**: User login

### User Dashboard
- **Profile**: User profile management
- **Payment History**: Transaction history
- **Notifications**: User notifications
- **Service Requests**: Service booking management

### Provider Dashboard
- **Become Provider**: Provider registration
- **Provider Profile**: Provider information management
- **Create Service**: Service creation and management
- **Provider Earnings**: Revenue tracking
- **Analytics**: Performance metrics

### Communication
- **Messaging**: Real-time messaging system
- **Conversation Hub**: Message management
- **Rate Customer/Service**: Rating system

### Admin Panel
- **Admin Dashboard**: Administrative overview
- **Customer Management**: User administration
- **Analytics Dashboard**: Platform analytics
- **Admin Login**: Administrative access

### Payment Flow
- **Checkout**: Payment processing
- **Secure Payments**: Payment security information

## API Integration

The frontend communicates with the backend API through RESTful endpoints and WebSocket connections:

- **REST API**: HTTP requests for data operations
- **WebSocket**: Real-time messaging and notifications
- **File Upload**: AWS S3 integration for images and documents

## Internationalization

The application supports multiple languages through i18next:

- Language detection based on browser settings
- Manual language switching
- Translation files in `src/locales/`

## Styling and UI

- **Tailwind CSS**: Utility-first CSS framework
- **Component Library**: Custom UI components in `src/components/ui/`
- **Responsive Design**: Mobile-first approach
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React and React Icons

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting (recommended)

### Component Structure
- Functional components with hooks
- TypeScript interfaces for props
- Separation of concerns (UI, logic, data)

### State Management
- React Context for global state
- Local state with useState/useReducer
- Custom hooks for reusable logic

### Testing Strategy
- Unit tests for components and utilities
- Integration tests for user flows
- E2E tests for critical paths
- Test coverage reporting

## Deployment

### Build for Production
```bash
pnpm build
```

### Environment Variables for Production
Ensure all production environment variables are set:
- API endpoints
- Stripe keys
- Google Maps API key
- WebSocket URLs

### Hosting
The application is configured for deployment on:
- DigitalOcean App Platform
- Vercel
- Netlify
- Custom servers with Node.js

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with Vite
- Lazy loading for routes
- Image optimization
- Bundle analysis
- Caching strategies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Run linting
7. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support, please contact the development team or create an issue in the repository.