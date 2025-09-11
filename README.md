# BakeMate

BakeMate is an open source, web-first SaaS platform that helps solo U.S. bakers manage every part of their business. It is built with a **FastAPI** backend and a **React + TypeScript** frontend served via **Nginx**. Docker Compose orchestrates the stack for local development.

## Features

- Ingredient and recipe management
- Pricing and order tracking with Stripe integration
- Calendar and task management
- Expense and mileage tracking
- Reports and analytics
- Differentiators such as an embeddable mini-shop, real-time inventory tracking and email marketing hooks

## Getting Started

The easiest way to try BakeMate is with Docker Compose:

```bash
docker-compose up --build -d
```

This will start the backend on port `8000`, the frontend on port `3000`, and an Nginx reverse proxy on port `80`.

For a detailed setup guide, see [docs/developer_guide.md](docs/developer_guide.md). User-facing instructions live in [docs/user_guide.md](docs/user_guide.md).

### Running Checks

Backend linting and tests:

```bash
cd backend
make lint
make test unit
```

Frontend linting:

```bash
cd frontend
npm install
npm run lint
```

## Contributing

Contributions are always welcome! Feel free to open issues or submit pull requests if you find bugs or have ideas for improvements.

## License

License information will be added soon.
