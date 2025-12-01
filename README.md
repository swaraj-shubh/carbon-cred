# CarbonCred - Carbon Credit Trading Platform

## 🚀 Overview

CarbonCred is a modern, full-stack platform for carbon credit trading built with blockchain technology. It enables users to track emissions, mint carbon credits as tokens, and trade them in a decentralized marketplace. The platform features role-based access control, real-time transaction monitoring, and a sleek user interface.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Credit-Holder, Validator, Buyer, Issuer)
- Secure password hashing with bcrypt
- Protected API endpoints

### 🌱 Carbon Management
- Carbon emission tracking and calculation
- Emission data submission with real-time CO₂e calculations
- Personal emission history dashboard
- Admin panel for system-wide emission monitoring

### 💰 Token Economy
- ERC-20 compatible carbon credit tokens
- Minting, burning, and transferring tokens
- Integrated MetaMask wallet connectivity
- Transaction history and real-time updates
- Token trading platform (buy/sell/deposit)

### 🏗️ Architecture
- React.js frontend with TypeScript
- Node.js/Express backend with TypeScript
- MongoDB database for user data and transactions
- Separate minting server for transaction processing
- Responsive UI with Tailwind CSS

## 🏗️ Project Structure

```
carbon-cred/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and API clients
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Helper functions
│   ├── public/
│   └── package.json
├── server/                  # Main backend server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Server utilities
│   └── package.json
├── mint/                    # Minting server (transaction processing)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons
- **Radix UI** components

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled for cross-origin requests

### Blockchain
- **Ethers.js** for Ethereum interactions
- **MetaMask** wallet integration
- **ERC-20** token standard
- **Sepolia Testnet** for development

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- MetaMask browser extension
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/swaraj-shubh/carbon-cred.git
cd carbon-cred
```

### 2. Backend Setup (Main Server)
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the server:
```bash
npm run dev
```

### 3. Mint Server Setup
```bash
cd ../mint
npm install
```

Create a `.env` file in the `mint/` directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

Start the mint server:
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional):
```env
VITE_API_URL=http://localhost:3000/api
VITE_MINT_API_URL=http://localhost:8000/api
```

Start the development server:
```bash
npm run dev
```

## 🚀 Usage

### 1. Access the Application
Open your browser and navigate to `http://localhost:5173`

### 2. User Registration/Login
- Click "Register" to create a new account
- Choose your role (Admin, Credit-Holder, etc.)
- Login with your credentials

### 3. Connect Wallet
- Click "Connect Wallet" in the navbar
- Approve the connection in MetaMask
- Ensure you're on the Sepolia testnet

### 4. Submit Emissions
- Navigate to "Emission" page
- Enter fuel, electricity, and waste data
- Submit to calculate your carbon footprint

### 5. Token Management
**As Admin:**
- Navigate to "Mint" page
- Enter recipient address and amount
- Mint new carbon credit tokens

**As User:**
- Check "Dashboard" for token balance
- Buy/Sell tokens in the marketplace
- View transaction history

### 6. Admin Features
- Access "Admin" panel to view all users
- Monitor system-wide emissions
- Manage user roles and permissions

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)

### Emissions (`/api/emissions`)
- `POST /submit` - Submit emission data (protected)
- `GET /my` - Get user's emissions (protected)

### Admin (`/api/admin`)
- `GET /users` - Get all users (admin only)
- `GET /emissions` - Get all emissions (admin only)

### Mint Server (`/api`)
- `POST /mint/submit` - Submit mint transaction
- `GET /mint/all` - Get all mint records
- `POST /transactions` - Create transaction record
- `GET /transactions` - Get all transactions

## 🔧 Smart Contract Integration

### Contract Addresses
- **Token Contract**: `0x112****YOUR_TOKEN_CONTRACT****82eC`
- **Marketplace Contract**: `0x9e3****MARKETPLACE_CONTRACT****9ab5`

### Contract ABIs
The platform uses standard ERC-20 ABI for token operations and a custom marketplace contract for trading.

## 🎨 UI/UX Features

### Dark/Light Mode
- Automatic theme detection
- Smooth transitions
- Consistent color palette

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

### Interactive Elements
- Animated buttons and cards
- Real-time data updates
- Progress indicators
- Toast notifications

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd server
npm test
```

### Test Accounts
- **Admin**: admin@carboncred.com / admin123
- **User**: user@example.com / password123

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload dist/ folder to hosting service
```

### Backend Deployment (Railway/Render)
```bash
cd server
# Configure environment variables
# Deploy using platform CLI
```

### Database Deployment
- Use MongoDB Atlas for production
- Enable database backups
- Configure proper indexing

## 📁 File Descriptions

### Key Frontend Files
- `src/App.tsx` - Main application component
- `src/components/Navbar.tsx` - Navigation bar with wallet integration
- `src/pages/Dashboard.tsx` - User dashboard with token stats
- `src/pages/Hehe.tsx` - Token trading interface
- `src/pages/TokenManager.jsx` - Admin token minting interface

### Key Backend Files
- `server/src/index.ts` - Main server entry point
- `server/src/controllers/authController.ts` - Authentication logic
- `mint/controllers/transactionController.js` - Transaction processing

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token expiration
- CORS configuration
- Input validation
- Rate limiting (to be implemented)
- SQL/NoSQL injection prevention

## 📊 Performance Optimizations

- React lazy loading for routes
- Image optimization
- Code splitting
- MongoDB indexing
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

1. **Metamask Connection Failed**
   - Ensure MetaMask is installed
   - Check if you're on Sepolia testnet
   - Refresh the page and reconnect

2. **MongoDB Connection Error**
   - Verify connection string in .env
   - Check if MongoDB service is running
   - Ensure network permissions

3. **JWT Token Issues**
   - Clear browser storage
   - Login again
   - Check JWT_SECRET in .env

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript version compatibility
   - Verify all environment variables

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
```

## 📚 Documentation Links

- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🙏 Acknowledgments

- Icons by Lucide React
- UI components from Radix UI
- Blockchain interactions via Ethers.js
- Database management with Mongoose

## 📞 Support

For support, email support@carboncred.com or create an issue in the GitHub repository.

---

**Made with ❤️**