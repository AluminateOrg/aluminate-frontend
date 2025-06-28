# Alumni Portal System Frontend

A comprehensive alumni management and engagement platform built with Next.js, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

This project follows a clean, modular architecture with clear separation of concerns:

```
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── org/               # Organization-specific routes
│   │   ├── admin/         # Admin dashboard and features
│   │   └── member/        # Member portal and features
├── components/            # Reusable UI components (Atomic Design)
│   ├── atoms/             # Basic building blocks
│   ├── molecules/         # Simple combinations
│   ├── organisms/         # Complex components
│   └── ui/                # shadcn/ui components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── layouts/               # Layout components
├── lib/                   # Utility functions and configurations
└── styles/                # Global styles and Tailwind config
```

## 🚀 Features

### Authentication & Authorization
- **Dual-role system**: Organization Admins and Members
- **Role-based routing**: Separate interfaces for each user type
- **Persistent sessions**: Theme and user preferences saved locally

### Admin Features
- **Subscription Management**: Tier-based member limits with upgrade/downgrade flows
- **Member Onboarding**: Bulk CSV upload and individual member addition
- **Group Management**: Create and manage member groups
- **Event Management**: Create events with RSVP tracking
- **Fundraising Campaigns**: Create and manage donation campaigns
- **Analytics Dashboard**: Member activity and engagement metrics

### Member Features
- **Group Participation**: Join groups and participate in discussions
- **Event RSVP**: Browse and RSVP to organization events
- **Mentorship**: Find mentors and book appointments
- **Donations**: Contribute to fundraising campaigns
- **Profile Management**: Update personal information and view QR codes
- **Real-time Chat**: Organization-wide and group-specific messaging

### Technical Features
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark/Light Mode**: System-aware theme switching
- **Real-time Updates**: WebSocket integration for chat and notifications
- **Type Safety**: Full TypeScript implementation
- **Accessibility**: ARIA attributes and keyboard navigation
- **Performance**: Optimized loading and caching strategies

## 🎨 Design System

### Color Scheme
- **Primary**: Black and white with subtle gray variants
- **Semantic Colors**: Success, warning, and error states
- **Theme Support**: Light and dark mode variants

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Scale**: Responsive typography with proper line heights

### Spacing
- **System**: 8px base unit with consistent spacing scale
- **Breakpoints**: Mobile-first responsive design
- **Containers**: Max-width containers with proper padding

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd alumni-portal-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🧪 Development

### Code Structure
- **Atomic Design**: Components are organized by complexity
- **Custom Hooks**: Business logic separated into reusable hooks
- **Context Providers**: Global state management
- **TypeScript**: Full type coverage for better developer experience

### Key Patterns
- **Server Components**: Used for static content and SEO
- **Client Components**: Interactive components with 'use client' directive
- **Error Boundaries**: Graceful error handling
- **Loading States**: Skeleton loading and suspense boundaries

### Testing Strategy
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📝 API Integration

### Authentication
```typescript
// Login flow
const { login } = useAuth();
await login(email, password, 'admin' | 'member');

// Protected routes
const { user } = useAuth();
if (!user) redirect('/login');
```

### Data Fetching
```typescript
// Organizations
const { organization, updateSubscription } = useOrg();

// Chat messages
const { messages, sendMessage } = useChat(orgId, groupId);

// Events
const { events, rsvpToEvent } = useCalendar(orgId);
```

## 🚀 Deployment

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment-specific Builds
- **Development**: Hot reloading and debug tools
- **Staging**: Production build with staging API
- **Production**: Optimized build with production API

## 🔄 State Management

### Context Providers
- **AuthContext**: User authentication and session management
- **ThemeContext**: Dark/light mode preferences
- **OrgContext**: Organization data and group management

### Custom Hooks
- **useAuth**: Authentication state and methods
- **useOrg**: Organization data and operations
- **useChat**: Real-time messaging functionality
- **useCalendar**: Event management and RSVP

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] **Push Notifications**: Browser and mobile notifications
- [ ] **File Sharing**: Document upload and management
- [ ] **Advanced Search**: Full-text search across all content
- [ ] **Integration APIs**: Third-party service connections
- [ ] **Mobile App**: React Native companion app

### Technical Improvements
- [ ] **Performance**: Code splitting and lazy loading
- [ ] **Monitoring**: Error tracking and analytics
- [ ] **Testing**: Comprehensive test coverage
- [ ] **Documentation**: Storybook component library

## 📚 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Submit pull request with description
4. Code review and testing
5. Merge to main and deploy

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Semantic commit messages

## 🐛 Troubleshooting

### Common Issues
- **Build Errors**: Check TypeScript errors and dependencies
- **Authentication**: Verify API endpoints and JWT configuration
- **Styling**: Ensure Tailwind classes are properly compiled
- **Performance**: Monitor bundle size and loading times

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Analyze bundle
npm run analyze
```

---

For more information, please refer to the [technical documentation](./docs/README.md) or contact the development team.