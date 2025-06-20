# 🛒 E-commerce Platform

A modern, full-featured e-commerce platform built with Next.js, TypeScript, and Stripe integration. Features include product catalog, shopping cart, secure checkout, admin dashboard, and customer account management.

## ✨ Features

- **Product Catalog**: Browse and search products with filtering and categorization
- **Shopping Cart**: Add/remove items with real-time updates
- **Secure Checkout**: Stripe-powered payment processing with address collection
- **User Authentication**: Login/register with role-based access
- **Admin Dashboard**: Complete order management, analytics, and product administration
- **Customer Accounts**: Order history, tracking, and account management
- **Responsive Design**: Modern UI with dark/light theme support
- **Real-time Analytics**: Revenue charts and order statistics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecommerce-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)
2. **Get your API keys** from the Stripe Dashboard
3. **Add to environment variables**:
   ```env
   STRIPE_SECRET_KEY=sk_test_...  # Test key for development
   STRIPE_PUBLISHABLE_KEY=pk_test_...  # Optional: for client-side
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | ✅ |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | ✅ |

## 👥 Demo Credentials

The application comes with pre-configured demo users:

### Admin User
- **Email**: `admin@example.com`
- **Password**: `password`
- **Access**: Full admin dashboard with analytics, order management, and product administration

### Customer User
- **Email**: `customer@example.com`
- **Password**: `password`
- **Access**: Customer account with order history and tracking

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Admin dashboard
│   ├── account/           # Customer account
│   ├── products/          # Product catalog
│   ├── cart/              # Shopping cart
│   └── checkout/          # Checkout process
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── ...               # Feature-specific components
├── lib/                   # Utilities and services
├── hooks/                 # Custom React hooks
└── public/                # Static assets
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔒 Security Features

- Environment variables for sensitive data
- Stripe webhook verification (ready for production)
- Role-based access control
- Secure payment processing
- Input validation and sanitization

## 🎨 UI Components

Built with:
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Next Themes** - Dark/light mode support

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your environment details and error messages

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Stripe](https://stripe.com/) - Payment processing
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - UI primitives

---

**Note**: This is a demo application. For production use, ensure proper security measures, database integration, and error handling are implemented. 