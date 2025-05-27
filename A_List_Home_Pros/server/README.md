# A-List Home Pros Backend

A comprehensive backend system for the A-List Home Pros platform - connecting homeowners with top-quality home service professionals.

## Overview

This Django-based backend provides a complete API for the A-List Home Pros platform, enabling homeowners to find and book qualified contractors, manage appointments, process payments, and communicate seamlessly with service providers.

## Features

- **User Management**: Complete authentication system with roles for clients, contractors, and administrators
- **A-List Pros Profiles**: Detailed profiles for service providers with portfolio management
- **Scheduling System**: Appointment booking and management
- **Payments Integration**: Secure payment processing with Stripe
- **Messaging**: Real-time communication between clients and contractors
- **Notifications**: Email and in-app notifications for important events
- **Analytics**: Performance tracking and business insights
- **Lead Management**: Tools for tracking and converting potential clients

## Tech Stack

- **Framework**: Django 4.2.7 with Django REST Framework
- **Authentication**: JWT-based authentication with djangorestframework-simplejwt
- **Database**: PostgreSQL (configurable, SQLite for development)
- **Payment Processing**: Stripe API integration
- **Background Tasks**: Celery with Redis
- **API Documentation**: drf-yasg (Swagger/OpenAPI)
- **Testing**: pytest with pytest-django

## Project Structure

The backend is organized into modular Django apps:

- **alistpros**: Core Django project settings
- **alistpros_profiles**: Service provider profiles and portfolios
- **analytics**: Business insights and reporting
- **contractors**: Legacy contractor profiles (being migrated to alistpros_profiles)
- **core**: Shared utilities and base models
- **leads**: Lead tracking and management
- **messaging**: Communication system between users
- **notifications**: Email and in-app notification system
- **payments**: Payment processing and financial transactions
- **scheduling**: Appointment booking and calendar management
- **users**: User authentication and management

## Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL (optional, can use SQLite for development)
- Redis (for Celery background tasks)

### Installation

1. Clone the repository
2. Create a virtual environment:
   ```
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create a `.env` file based on `.env.example`
5. Run migrations:
   ```
   python manage.py migrate
   ```
6. Create initial test data (optional):
   ```
   python create_initial_data.py
   ```
7. Start the development server:
   ```
   python manage.py runserver
   ```

## Utility Scripts

The project includes several utility scripts to help with development and maintenance:

### Data Generation and Management
- **create_initial_data.py**: Creates minimal test data for development
- **create_fake_data.py**: Generates comprehensive fake data for testing
- **create_test_data.py**: Creates specific test data for API testing
- **create_users_and_tokens.py**: Creates users with authentication tokens
- **create_verification_tokens.py**: Creates email verification tokens for users

### Database Tools
- **check_db.py**: Verifies database integrity and connections
- **fix_user_model.py**: Repairs user model data inconsistencies 
- **create_verification_table.py**: Creates or updates email verification tables

### Authentication and Security
- **check_passwords.py**: Audits password security and compliance 
- **check_users.py**: Verifies user account status and permissions
- **reset_passwords.py**: Resets user passwords for testing or recovery
- **fix_email_verification.py**: Repairs email verification records
- **get_verification_codes.py**: Retrieves verification codes for testing
- **show_verification_codes.py**: Displays active verification codes

### Testing
- **test_api.py**: Comprehensive API testing suite
- **test_api_endpoints.py**: Tests specific API endpoints
- **test_alistpros_api.py**: Tests A-List Pros specific endpoints
- **test_alistpros_integration.py**: Tests integration with frontend components

## Using Test and Data Generation Scripts

### Running Test Scripts

All test scripts can be run directly from the project root directory. Before running tests, make sure your environment is properly set up:

1. **General API Testing:**
   ```bash
   # Comprehensive API test suite
   python test_api.py
   
   # Test specific API endpoints
   python test_api_endpoints.py
   
   # Test A-List Pros specific API endpoints
   python test_alistpros_api.py
   
   # Test integration with frontend
   python test_alistpros_integration.py
   ```

2. **Using Pytest (with more detailed options):**
   ```bash
   # Run all tests
   pytest
   
   # Run tests with detailed output
   pytest -v
   
   # Run tests for a specific app
   pytest users/
   
   # Run tests matching a pattern
   pytest -k "profile"
   
   # Generate test coverage report
   pytest --cov=.
   ```

### Generating Test Data

The project includes several scripts for generating test data. These scripts should be run in a specific order for best results:

1. **Basic Setup (minimal data):**
   ```bash
   # Creates essential data like admin user, basic categories, etc.
   python create_initial_data.py
   ```

2. **Comprehensive Test Data:**
   ```bash
   # Creates a full set of fake users, profiles, appointments, etc.
   python create_fake_data.py
   
   # Options:
   # --users=50      # Number of users to create (default: 20)
   # --alistpros=15  # Number of A-List Pros to create (default: 10)
   # --clients=30    # Number of clients to create (default: 10)
   # --clean         # Clear existing data before creating new data
   
   # Example with options:
   python create_fake_data.py --users=50 --alistpros=15 --clients=30 --clean
   ```

3. **Specific Test Data for API Testing:**
   ```bash
   # Creates specific data patterns needed for API tests
   python create_test_data.py
   ```

4. **Create Users with Authentication Tokens:**
   ```bash
   # Creates test users and generates authentication tokens
   python create_users_and_tokens.py
   
   # This will output token information that can be used for testing API endpoints
   ```

5. **Create Email Verification Tokens:**
   ```bash
   # Generates verification tokens for user email verification
   python create_verification_tokens.py
   
   # The tokens are displayed on the console and can be used for testing verification
   ```

### Database Maintenance Scripts

These scripts help with database maintenance and troubleshooting:

1. **Check Database Connection and Integrity:**
   ```bash
   python check_db.py
   ```

2. **Fix User Model Issues:**
   ```bash
   python fix_user_model.py
   ```

3. **Create or Update Verification Tables:**
   ```bash
   python create_verification_table.py
   ```

### Authentication and Security Scripts

Use these scripts to manage user authentication and security:

1. **Check User Password Security:**
   ```bash
   python check_passwords.py
   ```

2. **Reset User Passwords:**
   ```bash
   # Reset passwords for test accounts
   python reset_passwords.py
   
   # Reset a specific user password:
   python reset_passwords.py --email=user@example.com --password=newpassword123
   
   # Reset all passwords to a standard test password:
   python reset_passwords.py --all
   ```

3. **Fix Email Verification Issues:**
   ```bash
   python fix_email_verification.py
   ```

4. **View Active Verification Codes:**
   ```bash
   python show_verification_codes.py
   ```

### Important Notes

- Always back up your database before running scripts that modify data
- Most scripts will prompt for confirmation before making changes to the database
- For production environments, be extremely careful with these scripts and use only when necessary
- Some scripts require admin privileges; use them with appropriate credentials

## API Endpoints

The backend provides a comprehensive REST API. Here's an overview of the main endpoints:

### Authentication
- `POST /api/users/token/`: Obtain JWT token
- `POST /api/users/token/refresh/`: Refresh JWT token
- `POST /api/users/register/`: Register a new user
- `POST /api/users/verify-email/`: Verify email address

### User Management
- `GET /api/users/me/`: Get current user profile
- `PUT /api/users/me/`: Update current user profile
- `POST /api/users/password/reset/`: Request password reset
- `POST /api/users/password/reset/confirm/`: Confirm password reset

### A-List Home Pros
- `GET /api/alistpros/profiles/`: List all A-List Pro profiles
- `GET /api/alistpros/profiles/{id}/`: Get specific profile details
- `POST /api/alistpros/profiles/`: Create a new profile (authenticated A-List Pro)
- `PUT /api/alistpros/profiles/{id}/`: Update profile (owner only)
- `GET /api/alistpros/categories/`: List all service categories
- `GET /api/alistpros/reviews/`: List reviews for A-List Pros

### Scheduling
- `GET /api/scheduling/appointments/`: List user's appointments
- `POST /api/scheduling/appointments/`: Create a new appointment
- `GET /api/scheduling/appointments/{id}/`: Get appointment details
- `PUT /api/scheduling/appointments/{id}/`: Update appointment
- `POST /api/scheduling/appointments/{id}/confirm/`: Confirm appointment
- `POST /api/scheduling/appointments/{id}/cancel/`: Cancel appointment
- `GET /api/scheduling/availability/{alistpro_id}/`: Get A-List Pro availability

### Payments
- `POST /api/payments/payment-intent/`: Create a payment intent
- `GET /api/payments/payment-methods/`: List saved payment methods
- `GET /api/payments/transactions/`: List payment transactions
- `GET /api/payments/dashboard-link/`: Get Stripe dashboard link (A-List Pros)
- `POST /api/payments/onboarding/`: Start Stripe onboarding (A-List Pros)
- `POST /api/payments/webhook/`: Stripe webhook endpoint

### Messaging
- `GET /api/messaging/conversations/`: List user's conversations
- `POST /api/messaging/conversations/`: Start a new conversation
- `GET /api/messaging/conversations/{id}/messages/`: Get messages in conversation
- `POST /api/messaging/conversations/{id}/messages/`: Send a message

### Notifications
- `GET /api/notifications/notifications/`: List user's notifications
- `PUT /api/notifications/notifications/{id}/read/`: Mark notification as read
- `PUT /api/notifications/notifications/read-all/`: Mark all notifications as read
- `GET /api/notifications/settings/`: Get notification settings
- `PUT /api/notifications/settings/`: Update notification settings

## API Documentation

Once the server is running, API documentation is available at:
- Swagger UI: `http://localhost:8000/api/swagger/`
- ReDoc: `http://localhost:8000/api/redoc/`

## Authentication System

The platform uses JWT (JSON Web Tokens) for authentication:

- **Access Tokens**: Short-lived tokens for API access (default: 1 hour)
- **Refresh Tokens**: Longer-lived tokens to obtain new access tokens (default: 7 days)
- **Email Verification**: Required for new user registrations
- **Password Reset**: Secure flow for users to reset passwords

User roles are determined by profile associations:
- Users with `alistpro_profile` are A-List Home Pros (contractors)
- Users with `client_profile` are Clients
- Users with `is_staff=True` are Administrators

## Testing

Run the test suite with:
```
pytest
```

For API endpoint testing, you can use:
```
python test_api_endpoints.py
```

## Migration from Contractors to A-List Pros

The project is transitioning from the legacy `contractors` app to the new `alistpros_profiles` app:

1. **Data Migration**: Using Django migrations to move data between models
2. **API Compatibility**: Supporting both old and new endpoints during transition
3. **Reference Updates**: Updating foreign key relationships across the platform
4. **Testing Strategy**: Comprehensive testing to ensure no functionality is lost

See `migration_plan.md` for detailed migration steps and progress tracking.

## Development Workflow

- The project is in the process of migrating from the legacy `contractors` app to the new `alistpros_profiles` app
- See `migration_plan.md` for details on the migration strategy
- Test data can be generated using the scripts in the root directory

## Deployment

### Production Setup

1. Set up a production PostgreSQL database
2. Configure a web server (Nginx recommended) with Gunicorn
3. Set up Redis for Celery and caching
4. Configure environment variables for production in `.env`
5. Collect static files:
   ```
   python manage.py collectstatic
   ```
6. Run migrations:
   ```
   python manage.py migrate
   ```
7. Start Gunicorn:
   ```
   gunicorn alistpros.wsgi:application
   ```
8. Start Celery worker:
   ```
   celery -A alistpros worker -l info
   ```
9. Start Celery beat (for scheduled tasks):
   ```
   celery -A alistpros beat -l info
   ```

### Docker Deployment

The project can also be deployed using Docker and Docker Compose:

1. Build the Docker image:
   ```
   docker-compose build
   ```
2. Start services:
   ```
   docker-compose up -d
   ```
3. Run migrations in the container:
   ```
   docker-compose exec web python manage.py migrate
   ```

## Integration with External Services

### Stripe Integration

The platform uses Stripe for payment processing:

1. Set up Stripe Connect for A-List Pros (contractors) to receive payments
2. Configure Stripe webhook endpoints for payment event handling
3. Payment flow:
   - Client creates a payment intent
   - Client confirms payment on frontend
   - Stripe processes payment and sends webhook event
   - Platform fees are automatically deducted
   - Remaining amount is transferred to the A-List Pro

### Email Notifications

Email notifications are sent for various events:

1. User registration and verification
2. Appointment booking and updates
3. Payment confirmations
4. New messages in conversations
5. Password reset requests

Configure SMTP settings in the `.env` file to enable email sending.

## Environment Variables

Configure the application by setting environment variables in a `.env` file. See `.env.example` for all available options:

- `DEBUG`: Enable debug mode (True/False)
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `EMAIL_*`: Email server configuration
- And many more

## Security Considerations

- All passwords are securely hashed using Django's password hashing system
- JWT tokens use RS256 signing algorithm
- API rate limiting is enabled to prevent abuse
- CORS settings are configured to allow only specific origins
- Django's security middleware is enabled for protection against common attacks
- Admin interface is protected with strong authentication

## Backup and Recovery

Recommended backup strategy:

1. Database backups:
   ```
   python manage.py dumpdata > backup_$(date +%Y%m%d).json
   ```
2. Media files backup (for user uploads)
3. Environment configuration backup

To restore from backup:
```
python manage.py loaddata backup_file.json
```

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests to ensure everything works correctly
4. Submit a pull request to `develop`
5. Code review and approval
6. Merge to `develop` and eventually to `main` for production

## License

[Proprietary] - A-List Home Pros © 2023 


npx create-react-app frontend
cd frontend
  npm start