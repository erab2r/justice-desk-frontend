# Justice Desk Frontend

Justice Desk is a legal-services platform frontend built with Next.js. It
connects clients with approved lawyers, supports appointment booking and
payments, and provides shared case-management workspaces.

The application includes public marketing and authentication pages, client
workspaces, lawyer workspaces, and administration tools for managing lawyers,
appointments, payments, cases, and specialization requests.

## Technology

- Next.js `16.3.7`
- React `19`
- TypeScript
- Tailwind CSS `4`
- TanStack React Query
- TanStack React Form
- Zod
- Axios
- Biome
- Lucide React

## Requirements

- Node.js 20 or newer
- npm
- A running Justice Desk backend API

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

`NEXT_PUBLIC_API_URL` should contain the backend origin without the `/api/v1`
suffix. The frontend adds `/api/v1` through its shared API client.

Google authentication is optional. If `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is not
configured, the rest of the application continues to work without Google
login.

Never commit `.env`, `.env.local`, or other environment files containing
credentials or private configuration.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format files with Biome |

## Project structure

```text
justice-desk-frontend/
├── public/                         # Static public assets
├── src/
│   ├── app/                        # Next.js App Router routes
│   │   ├── (public)/
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx        # Public homepage
│   │   │   │   ├── about-us/
│   │   │   │   └── layout.tsx      # Public header and footer
│   │   │   └── (authentication)/
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       ├── apply/          # Lawyer application flow
│   │   │       ├── account-verify/
│   │   │       └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── admin/              # Admin routes
│   │   │   ├── client/             # Client routes
│   │   │   ├── lawyer/             # Lawyer routes
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   └── layout.tsx              # Root providers and metadata
│   │
│   ├── api/                        # Feature-specific API functions
│   │   ├── appointment.api.ts
│   │   ├── auth.api.ts
│   │   ├── case.api.ts
│   │   ├── lawyer.api.ts
│   │   ├── payment.api.ts
│   │   └── schedule.api.ts
│   │
│   ├── components/
│   │   ├── auth/                   # Auth and role guards
│   │   ├── dashboard/              # Shared dashboard shell and pages
│   │   ├── form/                   # Login and application forms
│   │   ├── homepage/               # Public homepage sections
│   │   ├── layout/public/          # Public Header and Footer
│   │   ├── modules/                # Feature-level UI modules
│   │   │   ├── cases/
│   │   │   ├── lawyers/
│   │   │   ├── lawyer-approval/
│   │   │   ├── lawyer-schedule/
│   │   │   ├── my-appointments/
│   │   │   └── payments/
│   │   └── ui/                     # Reusable UI primitives
│   │
│   ├── hooks/                      # React Query and shared hooks
│   ├── lib/                        # API client and shared helpers
│   ├── providers/                  # React Query and Google providers
│   ├── routes/                     # Role-based route definitions
│   ├── services/                   # Shared service-layer API functions
│   ├── types/                      # TypeScript domain and API types
│   ├── utils/                      # Small reusable utilities
│   └── validation/                 # Zod validation schemas
│
├── .env.local                      # Local environment configuration
├── biome.json                      # Biome formatter and linter config
├── next.config.ts                  # Next.js configuration
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## Main application areas

### Public experience

- Homepage with lawyer discovery and legal departments
- About page
- Login and registration
- Email/account verification
- Password recovery
- Lawyer application and verification

### Client workspace

- Lawyer browsing and booking
- Appointment list and details
- Payment history and payment completion
- Case workspaces
- Case documents and activity

### Lawyer workspace

- Appointment management
- Availability and schedules
- Client cases
- Case documents, reports, and activity
- Lawyer profile management

### Admin workspace

- Dashboard overview
- Lawyer management through the Lawyers Panel
- Lawyer application review
- Lawyer profile, status, suspension, and document management
- Appointment and payment administration
- Case administration
- Practice-area/specialization management
- Specialization request review

## Authentication and authorization

The frontend supports these user roles:

- `CLIENT`
- `LAWYER`
- `ADMIN`
- `SUPER_ADMIN`

Authentication tokens are handled by `src/lib/apiClient.ts`. The client
stores the access token in browser session storage and sends it with API
requests. The API client also attempts token refresh for protected requests
that return `401`.

Route protection is implemented through:

- `AuthGuard`
- `RoleGuard`
- Role-specific dashboard layouts
- Role-based route helpers in `src/routes/`

## Backend API integration

The shared Axios client uses:

```text
${NEXT_PUBLIC_API_URL}/api/v1
```

Feature API modules are kept in `src/api/`, while shared appointment,
payment, and specialization service functions are also available through
`src/services/justice.service.ts`.

The backend is a separate project. Backend schema, migrations, database
operations, and server configuration must be managed in that backend
repository.

## Lawyer application flow

The lawyer application sends multipart data containing:

- User information
- Lawyer profile information
- Existing practice-area IDs
- Optional `newPracticeArea`
- Resume
- Additional supporting documents

Existing practice areas are submitted as database IDs through
`specializationIds`. A new practice area is submitted separately and should
be handled by the backend's specialization-request workflow.

## Code conventions

- Use the `@/*` import alias for files under `src/`.
- Keep API calls in feature API modules or the shared service layer.
- Use React Query hooks for server state.
- Use Zod schemas for form validation.
- Reuse components from `src/components/ui/`.
- Keep role-specific behavior behind the existing guards and route helpers.
- Run Biome before opening a pull request:

```bash
npm run lint
npm run format
```

## Production build

Set production environment variables, install dependencies, and build:

```bash
npm ci
npm run build
npm run start
```

The production server listens on the port configured by the hosting
environment, or port `3000` by default.

## Troubleshooting

### API requests fail

Check that:

1. The backend is running.
2. `NEXT_PUBLIC_API_URL` points to the backend origin.
3. The backend exposes the `/api/v1` routes.
4. Browser cookies and CORS settings allow the frontend origin.

### Google login is unavailable

Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and confirm that the frontend origin is
registered in the Google OAuth configuration. Google login is optional when
this variable is absent.

### Environment changes are not visible

Restart the Next.js development server after changing a `NEXT_PUBLIC_*`
variable. Public environment variables are embedded during the build.

## License

This project is private and intended for the Justice Desk application.
