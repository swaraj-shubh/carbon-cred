import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  Coins, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Calendar,
  TrendingUp,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';


// TypeScript interfaces
interface MintEvent {
  _id: string;
  id: number;
  type: string;
  message: string;
  hash: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WalletStatus {
  connected: boolean;
  address: string;
  isAdmin: boolean;
}



interface FilterState {
  addressFilter: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

// Mock contract ABI for TokensMinted event
const TOKEN_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TokensMinted",
    "type": "event"
  }
];

const CONTRACT_ADDRESS = "0xdA485fEFE249bAD5D3c4CE7b1DA8Ae7F4A4BA70F"; // Replace with actual contract

const Dashboard: React.FC = () => {
  // State management
  const [walletStatus, setWalletStatus] = useState<WalletStatus>({
    connected: false,
    address: '',
    isAdmin: false
  });``
  
  const [mintEvents, setMintEvents] = useState<MintEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<MintEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    addressFilter: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper functions
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const formatAmount = (amount: number): string => {
    return amount.toFixed(2);
  };
  
  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // const formatAddress = (address: string): string => {
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

  // const formatAmount = (amount: number): string => {
  //   return new Intl.NumberFormat('en-US').format(amount);
  // };

  // const formatDate = (timestamp: string): string => {
  //   return new Date(timestamp).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  const getEtherscanLink = (txHash: string): string => {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  };

  // Check if wallet is already connected on page load
  const checkWalletConnection = async (): Promise<void> => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      if (accounts.length > 0) {
        setWalletStatus({
          connected: true,
          address: accounts[0],
          isAdmin: true // In real implementation, check against admin list
        });
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  // Blockchain interaction functions
  const connectWallet = async (): Promise<void> => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask to use this dashboard');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setWalletStatus({
          connected: true,
          address: accounts[0],
          isAdmin: true // In real implementation, check against admin list
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Handle specific error cases
      if (error.code === 4001) {
        alert('Please connect to MetaMask to use this dashboard');
      } else if (error.code === -32002) {
        alert('MetaMask connection request is already pending');
      }
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      // User disconnected wallet
      setWalletStatus({
        connected: false,
        address: '',
        isAdmin: false
      });
      setMintEvents([]);
      setFilteredEvents([]);
    } else {
      // User switched accounts
      setWalletStatus({
        connected: true,
        address: accounts[0],
        isAdmin: true
      });
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string): void => {
    // Reload the page when chain changes to avoid any issues
    window.location.reload();
  };

  // const fetchMintEvents = useCallback(async (): Promise<void> => {
  //   if (!walletStatus.connected) return;
    
  //   setLoading(true);
    
  //   try {
  //     // In a real implementation, you would:
  //     // 1. Get past events using eth_getLogs
  //     // 2. Decode the event data
  //     // 3. Format the response
      
  //     // Mock implementation with realistic data
  //     const mockEvents: MintEvent[] = [
  //       {
  //         address: "0x742d35Cc6634C0532925a3b8D57D3aE4a3F5e8B5",
  //         amount: 1000,
  //         txHash: "0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  //         timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
  //         blockNumber: 18500000
  //       },
  //       {
  //         address: "0x8ba1f109551bD432803012645Hac136c54c45f",
  //         amount: 2500,
  //         txHash: "0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567",
  //         timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  //         blockNumber: 18499500
  //       },
  //       {
  //         address: "0x147d35Cc6634C0532925a3b8D57D3aE4a3F5e8B5",
  //         amount: 500,
  //         txHash: "0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678",
  //         timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  //         blockNumber: 18499000
  //       },
  //       {
  //         address: "0x9ba1f109551bD432803012645Hac136c54c45f",
  //         amount: 3000,
  //         txHash: "0xd4e5f6789012345678901234567890abcdef1234567890abcdef123456789",
  //         timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  //         blockNumber: 18498000
  //       },
  //       {
  //         address: "0x247d35Cc6634C0532925a3b8D57D3aE4a3F5e8B5",
  //         amount: 750,
  //         txHash: "0xe5f6789012345678901234567890abcdef1234567890abcdef1234567890",
  //         timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
  //         blockNumber: 18497000
  //       }
  //     ];

  //     setMintEvents(mockEvents);
  //     setFilteredEvents(mockEvents);
  //     setLastSync(new Date());
      
  //   } catch (error) {
  //     console.error('Failed to fetch mint events:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [walletStatus.connected]);

  // Filter events based on current filter state
  
  const fetchMintEvents = useCallback(async (): Promise<void> => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setMintEvents(data);
      setFilteredEvents(data);
      setLastSync(new Date());
      
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Optionally show error to user
    } finally {
      setLoading(false);
    }
  }, []);
  
  const applyFilters = useCallback((): void => {
    let filtered = [...mintEvents];

    if (filters.addressFilter) {
      filtered = filtered.filter(event => 
        event.address.toLowerCase().includes(filters.addressFilter.toLowerCase())
      );
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(event => 
        new Date(event.timestamp) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(event => 
        new Date(event.timestamp) <= endDate
      );
    }

    if (filters.minAmount) {
      filtered = filtered.filter(event => 
        event.amount >= parseInt(filters.minAmount)
      );
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(event => 
        event.amount <= parseInt(filters.maxAmount)
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [mintEvents, filters]);



  // Calculate statistics
  // const getStatistics = () => {
  //   const totalMinted = filteredEvents.reduce((sum, event) => sum + event.amount, 0);
  //   const uniqueAddresses = new Set(filteredEvents.map(event => event.address)).size;
  //   const totalTransactions = filteredEvents.length;
  //   const avgMintAmount = totalTransactions > 0 ? totalMinted / totalTransactions : 0;

  //   return {
  //     totalMinted,
  //     uniqueAddresses,
  //     totalTransactions,
  //     avgMintAmount
  //   };
  // };

  const getStatistics = () => {
    // Extract amounts from messages (format: "✅ Minted X.XX tokens to...")
    const amounts = filteredEvents.map(event => {
      const match = event.message.match(/Minted (\d+\.?\d*) tokens/);
      return match ? parseFloat(match[1]) : 0;
    });
  
    const totalMinted = amounts.reduce((sum, amount) => sum + amount, 0);
    const totalTransactions = filteredEvents.length;
    const avgMintAmount = totalTransactions > 0 ? totalMinted / totalTransactions : 0;
  
    // Extract unique addresses from messages (format: "to 0x...")
    const uniqueAddresses = new Set(
      filteredEvents.map(event => {
        const match = event.message.match(/to (0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4})/);
        return match ? match[1] : '';
      })
    ).size;
  
    return {
      totalMinted,
      uniqueAddresses,
      totalTransactions,
      avgMintAmount
    };
  };

  // const getStatistics = () => {
  //   // Extract amounts from messages (assuming format "Minted X.XX tokens to...")
  //   const amounts = filteredEvents.map(event => {
  //     const match = event.message.match(/Minted (\d+\.\d+) tokens/);
  //     return match ? parseFloat(match[1]) : 0;
  //   });
  
  //   const totalMinted = amounts.reduce((sum, amount) => sum + amount, 0);
  //   const totalTransactions = filteredEvents.length;
  //   const avgMintAmount = totalTransactions > 0 ? totalMinted / totalTransactions : 0;
  
  //   // Extract unique addresses (assuming format "Minted ... to 0x7EAe...2b4A")
  //   const uniqueAddresses = new Set(
  //     filteredEvents.map(event => {
  //       const match = event.message.match(/to (0x[a-fA-F0-9]{4}\.\.\.[a-fA-F0-9]{4})/);
  //       return match ? match[1] : '';
  //     })
  //   ).size;
  
  //   return {
  //     totalMinted,
  //     uniqueAddresses,
  //     totalTransactions,
  //     avgMintAmount
  //   };
  // };

  // Pagination
  const getPaginatedEvents = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Placeholder function for future backend integration
  const syncWithBackend = async (): Promise<void> => {
    // TODO: Implement API call to sync with MongoDB
    console.log('Syncing with backend...', mintEvents);
  };

  // Effects
  useEffect(() => {
    // Check wallet connection on component mount
    checkWalletConnection();

    // Set up event listeners for MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  useEffect(() => {
    if (walletStatus.connected) {
      fetchMintEvents();
    }
  }, [walletStatus.connected, fetchMintEvents]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const statistics = getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Token Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Real-time blockchain monitoring</p>
              </div>
            </div>
            
{!walletStatus.connected ? (
              <button 
                onClick={connectWallet}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-lg font-medium transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">{formatAddress(walletStatus.address)}</span>
                </div>
                <button 
                  onClick={fetchMintEvents}
                  disabled={loading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {walletStatus.connected ? (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Minted</p>
                  <p className="text-2xl font-bold">{formatAmount(statistics.totalMinted)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Unique Addresses</p>
                  <p className="text-2xl font-bold">{statistics.uniqueAddresses}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold">{statistics.totalTransactions}</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Amount</p>
                  <p className="text-2xl font-bold">{formatAmount(Math.round(statistics.avgMintAmount))}</p>
                </div>
                <Coins className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-black/20 border border-white/10 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Address</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="0x..."
                    value={filters.addressFilter}
                    onChange={(e) => setFilters({...filters, addressFilter: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Max Amount</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Mint History Table */}
          <div className="bg-black/20 border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Mint History</h3>
                {lastSync && (
                  <p className="text-sm text-gray-400">
                    Last synced: {lastSync.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Transaction ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Details</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Time</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Transaction Hash</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                          <span className="text-gray-400">Loading mint events...</span>
                        </div>
                      </td>
                    </tr>
                  ) : getPaginatedEvents().length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400">No mint events found</p>
                      </td>
                    </tr>
                  ) : (
                    getPaginatedEvents().map((event) => (
                      <tr key={event._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm">
                          {event.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {event.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span>{event.message}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatDate(event.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${event.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <span className="font-mono text-sm">{formatAddress(event.hash)}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-white/10 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} results
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 bg-purple-600 rounded-lg text-sm">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to access the admin dashboard and view mint history.
          </p>
          <button 
            onClick={connectWallet}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg font-medium transition-all"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;