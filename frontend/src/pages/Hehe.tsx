import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Types
interface Transaction {
  _id: string;
  id: number;
  type: 'success' | 'error';
  message: string;
  pvtkey: string | null;
  hash: string | null;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface WalletState {
  address: string | null;
  ethBalance: string;
  tokenBalance: string;
  isConnected: boolean;
}

interface UserStats {
  totalMinted: number;
  successfulTxs: number;
}

interface StatusMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

// Contract ABIs
const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function mint(address to, uint256 amount)",
  "function burn(uint256 amount)",
  "function burnFrom(address account, uint256 amount)"
];

const MAIN_CONTRACT_ABI = [
  "constructor(address _tokenAddress)",
  "function buyTokens() payable",
  "function depositTokens(uint256 amount)",
  "function owner() view returns (address)",
  "function sellTokens(uint256 tokenAmount)",
  "function token() view returns (address)",
  "function tokensPerEth() view returns (uint256)",
  "function withdrawETH()"
];

// Configuration
const CONFIG = {
  contractAddress: "0x9e3AE2cbcA409D4ec446168950889B00076F9ab5", // Replace with your deployed contract address
  tokenAddress: "0x112A911E546f5E2640DbEA4D156028a740b482eC", // Replace with your token contract address
  apiUrl: "http://localhost:8000/api/transactions"
};

// Custom Hooks
const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    ethBalance: '0',
    tokenBalance: '0',
    isConnected: false
  });
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [mainContract, setMainContract] = useState<ethers.Contract | null>(null);
  const [contractTokenBalance, setContractTokenBalance] = useState<string>('0');

  const connectWallet = async (): Promise<boolean> => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask!');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();

      setProvider(newProvider);
      setSigner(newSigner);

      // Initialize contracts
      let newTokenContract = null;
      let newMainContract = null;

      if (CONFIG.tokenAddress !== "YOUR_TOKEN_ADDRESS") {
        newTokenContract = new ethers.Contract(CONFIG.tokenAddress, TOKEN_ABI, newSigner);
        setTokenContract(newTokenContract);
      }

      if (CONFIG.contractAddress !== "YOUR_CONTRACT_ADDRESS") {
        newMainContract = new ethers.Contract(CONFIG.contractAddress, MAIN_CONTRACT_ABI, newSigner);
        setMainContract(newMainContract);
      }

      setWallet(prev => ({
        ...prev,
        address,
        isConnected: true
      }));

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return false;
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      ethBalance: '0',
      tokenBalance: '0',
      isConnected: false
    });
    setProvider(null);
    setSigner(null);
    setTokenContract(null);
    setMainContract(null);
    setContractTokenBalance('0');
  };

  const updateBalances = useCallback(async () => {
    if (!provider || !wallet.address) return;

    try {
      // Update ETH balance
      const ethBalance = await provider.getBalance(wallet.address);
      const ethBalanceFormatted = parseFloat(ethers.formatEther(ethBalance)).toFixed(4);

      let tokenBalanceFormatted = 'N/A';
      let contractTokenBalanceFormatted = '0';
      
      // Update token balance and contract token balance
      if (tokenContract) {
        try {
          const tokenBalance = await tokenContract.balanceOf(wallet.address);
          const decimals = await tokenContract.decimals();
          tokenBalanceFormatted = parseFloat(ethers.formatUnits(tokenBalance, decimals)).toFixed(2);

          // Get contract's token balance (deposited tokens available for purchase)
          if (CONFIG.contractAddress !== "YOUR_CONTRACT_ADDRESS") {
            const contractBalance = await tokenContract.balanceOf(CONFIG.contractAddress);
            contractTokenBalanceFormatted = parseFloat(ethers.formatUnits(contractBalance, decimals)).toFixed(2);
            setContractTokenBalance(contractTokenBalanceFormatted);
          }
        } catch (error) {
          console.log('Token contract not available');
        }
      }

      setWallet(prev => ({
        ...prev,
        ethBalance: ethBalanceFormatted,
        tokenBalance: tokenBalanceFormatted
      }));
    } catch (error) {
      console.error('Failed to update balances:', error);
    }
  }, [provider, wallet.address, tokenContract]);

  return {
    wallet,
    provider,
    signer,
    tokenContract,
    mainContract,
    contractTokenBalance,
    connectWallet,
    disconnectWallet,
    updateBalances
  };
};

const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(CONFIG.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  return { transactions, loading, fetchTransactions };
};

// Components
const StatusIndicator: React.FC<{ status: StatusMessage }> = ({ status }) => {
  return (
    <div 
      className={`fixed top-5 right-5 px-5 py-3 rounded-lg text-white font-semibold z-50 transition-transform duration-300 ${
        status.show ? 'translate-x-0' : 'translate-x-96'
      } ${
        status.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' :
        status.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
        'bg-gradient-to-r from-blue-500 to-blue-600'
      }`}
    >
      {status.message}
    </div>
  );
};

const WalletSection: React.FC<{
  wallet: WalletState;
  onConnect: () => Promise<boolean>;
  onShowStatus: (message: string, type: 'success' | 'error' | 'info') => void;
}> = ({ wallet, onConnect, onShowStatus }) => {
  
  const handleConnect = async () => {
    const success = await onConnect();
    if (success) {
      onShowStatus('Wallet connected successfully!', 'success');
    } else {
      onShowStatus('Failed to connect wallet', 'error');
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
        <button
          onClick={handleConnect}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          🔗 Connect MetaMask Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-2xl mb-5">
        <h3 className="text-lg font-semibold mb-3">💼 Connected Wallet</h3>
        <div className="bg-white/20 p-2 rounded-lg font-mono text-sm break-all">
          {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/20 p-3 rounded-xl text-center">
            <div className="text-xl font-bold">{wallet.ethBalance}</div>
            <div className="text-sm opacity-90">ETH Balance</div>
          </div>
          <div className="bg-white/20 p-3 rounded-xl text-center">
            <div className="text-xl font-bold">{wallet.tokenBalance}</div>
            <div className="text-sm opacity-90">CCT Balance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DepositedTokensSection: React.FC<{
  contractTokenBalance: string;
  wallet: WalletState;
}> = ({ contractTokenBalance, wallet }) => {
  if (!wallet.isConnected) return null;

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">🏦 Contract Token Pool</h3>
      <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white p-6 rounded-2xl text-center">
        <div className="text-3xl font-bold mb-2">{contractTokenBalance}</div>
        <div className="text-sm opacity-90 mb-2">CCT Available for Purchase</div>
        <div className="text-xs opacity-75 bg-white/20 p-2 rounded-lg">
          These are deposited tokens that users can buy with ETH
        </div>
      </div>
    </div>
  );
};

const UserStatsSection: React.FC<{
  wallet: WalletState;
  transactions: Transaction[];
}> = ({ wallet, transactions }) => {
  const stats: UserStats = React.useMemo(() => {
    if (!wallet.address) return { totalMinted: 0, successfulTxs: 0 };

    const userTransactions = transactions.filter(tx => 
      tx.pvtkey && tx.pvtkey.toLowerCase() === wallet.address!.toLowerCase()
    );

    const successfulTxs = userTransactions.filter(tx => tx.type === 'success');
    const totalMinted = successfulTxs.reduce((sum, tx) => {
      const match = tx.message.match(/Minted ([\d.]+) tokens/);
      return sum + (match ? parseFloat(match[1]) : 0);
    }, 0);

    return {
      totalMinted: Number(totalMinted.toFixed(2)),
      successfulTxs: successfulTxs.length
    };
  }, [wallet.address, transactions]);

  if (!wallet.isConnected) return null;

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">📊 Your Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-4 rounded-2xl text-center">
          <div className="text-2xl font-bold">{stats.totalMinted}</div>
          <div className="text-sm opacity-90">Total Minted</div>
        </div>
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-4 rounded-2xl text-center">
          <div className="text-2xl font-bold">{stats.successfulTxs}</div>
          <div className="text-sm opacity-90">Successful Txs</div>
        </div>
      </div>
    </div>
  );
};

const TokenActionsSection: React.FC<{
  wallet: WalletState;
  tokenContract: ethers.Contract | null;
  mainContract: ethers.Contract | null;
  onUpdateBalances: () => Promise<void>;
  onShowStatus: (message: string, type: 'success' | 'error' | 'info') => void;
}> = ({ wallet, tokenContract, mainContract, onUpdateBalances, onShowStatus }) => {
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (!wallet.isConnected) return null;

  const handleBuyTokens = async () => {
    if (!buyAmount || !mainContract) return;
    
    setIsLoading('buy');
    try {
      onShowStatus('Processing buy transaction...', 'info');
      const tx = await mainContract.buyTokens({
        value: ethers.parseEther(buyAmount)
      });
      await tx.wait();
      onShowStatus('Tokens purchased successfully!', 'success');
      await onUpdateBalances();
      setBuyAmount('');
    } catch (error) {
      console.error('Buy failed:', error);
      onShowStatus('Buy transaction failed', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleSellTokens = async () => {
    if (!sellAmount || !mainContract || !tokenContract) return;
    
    setIsLoading('sell');
    try {
      onShowStatus('Processing sell transaction...', 'info');
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(sellAmount, decimals);
      const tx = await mainContract.sellTokens(tokenAmount);
      await tx.wait();
      onShowStatus('Tokens sold successfully!', 'success');
      await onUpdateBalances();
      setSellAmount('');
    } catch (error) {
      console.error('Sell failed:', error);
      onShowStatus('Sell transaction failed', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDepositTokens = async () => {
    if (!depositAmount || !mainContract || !tokenContract) return;
    
    setIsLoading('deposit');
    try {
      onShowStatus('Processing deposit transaction...', 'info');
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(depositAmount, decimals);
      
      // First approve
      const approveTx = await tokenContract.approve(CONFIG.contractAddress, tokenAmount);
      await approveTx.wait();
      
      // Then deposit
      const depositTx = await mainContract.depositTokens(tokenAmount);
      await depositTx.wait();
      
      onShowStatus('Tokens deposited successfully!', 'success');
      await onUpdateBalances();
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
      onShowStatus('Deposit transaction failed', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleWithdrawETH = async () => {
    if (!mainContract) return;
    
    setIsLoading('withdraw');
    try {
      onShowStatus('Processing withdrawal...', 'info');
      const tx = await mainContract.withdrawETH();
      await tx.wait();
      onShowStatus('ETH withdrawn successfully!', 'success');
      await onUpdateBalances();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      onShowStatus('Withdrawal failed - Owner only function', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">💰 Token Actions</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Buy Tokens (ETH Amount)
          </label>
          <input
            type="number"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            placeholder="0.1"
            step="0.01"
            min="0"
            className="w-full text-black p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleBuyTokens}
            disabled={isLoading === 'buy' || !buyAmount}
            className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading === 'buy' ? '⏳ Processing...' : '💳 Buy Tokens'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Sell Tokens (CCT Amount)
          </label>
          <input
            type="number"
            value={sellAmount}
            onChange={(e) => setSellAmount(e.target.value)}
            placeholder="1"
            step="0.1"
            min="0"
            className="w-full p-3 text-black border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSellTokens}
            disabled={isLoading === 'sell' || !sellAmount}
            className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading === 'sell' ? '⏳ Processing...' : '💸 Sell Tokens'}
          </button>
        </div>

        {(localStorage.getItem("role") === 'admin') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Deposit Tokens (CCT Amount)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="1"
                    step="0.1"
                    min="0"
                    className="w-full p-3 text-black border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleDepositTokens}
                    disabled={isLoading === 'deposit' || !depositAmount}
                    className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading === 'deposit' ? '⏳ Processing...' : '🏦 Deposit Tokens'}
                  </button>
                </div>
              </>
            )}s

        <button
          onClick={handleWithdrawETH}
          disabled={isLoading === 'withdraw'}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading === 'withdraw' ? '⏳ Processing...' : '💰 Withdraw ETH (Owner Only)'}
        </button>
      </div>
    </div>
  );
};

const TransactionsPanel: React.FC<{
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
}> = ({ transactions, loading, onRefresh }) => {
  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions]);

  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20 h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-100">
        <h2 className="text-xl font-bold text-gray-700">📋 Live Transactions</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading && transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <div>Loading transactions...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            📭 No transactions found
          </div>
        ) : (
          sortedTransactions.map((tx) => (
            <div
              key={tx._id}
              className={`p-4 rounded-xl border-l-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md ${
                tx.type === 'success' 
                  ? 'bg-green-50 border-l-green-500' 
                  : 'bg-red-50 border-l-red-500'
              }`}
            >
              <div className={`font-semibold text-sm mb-2 ${
                tx.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.type === 'success' ? '✅' : '❌'} {tx.type.toUpperCase()}
              </div>
              <div className="text-gray-800 mb-2 text-sm leading-relaxed">
                {tx.message}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div><strong>Time:</strong> {tx.timestamp}</div>
                <div><strong>Date:</strong> {new Date(tx.createdAt).toLocaleDateString()}</div>
                {tx.pvtkey && (
                  <div className="col-span-2">
                    <strong>Address:</strong> {tx.pvtkey.slice(0, 6)}...{tx.pvtkey.slice(-4)}
                  </div>
                )}
              </div>
              {tx.hash && (
                <div className="text-xs bg-purple-100 p-2 rounded-lg font-mono break-all">
                  <strong>Hash:</strong> {tx.hash}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main App Component
const CarbonCreditDApp: React.FC = () => {
  const [status, setStatus] = useState<StatusMessage>({
    message: '',
    type: 'info',
    show: false
  });

  const {
    wallet,
    tokenContract,
    mainContract,
    contractTokenBalance,
    connectWallet,
    updateBalances
  } = useWallet();

  const { transactions, loading, fetchTransactions } = useTransactions();

  const showStatus = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setStatus({ message, type, show: true });
    setTimeout(() => {
      setStatus(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Update balances when wallet connects or transactions change
  useEffect(() => {
    if (wallet.isConnected) {
      updateBalances();
    }
  }, [wallet.isConnected, transactions, updateBalances]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <StatusIndicator status={status} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🌱 Carbon Credit Token
          </h1>
          <p className="text-xl text-white/90">
            Decentralized Carbon Credit Trading Platform
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="xl:col-span-2 space-y-6">
            <WalletSection
              wallet={wallet}
              onConnect={connectWallet}
              onShowStatus={showStatus}
            />
            
            <DepositedTokensSection
              contractTokenBalance={contractTokenBalance}
              wallet={wallet}
            />
            
            <UserStatsSection
              wallet={wallet}
              transactions={transactions}
            />
            
            <TokenActionsSection
              wallet={wallet}
              tokenContract={tokenContract}
              mainContract={mainContract}
              onUpdateBalances={updateBalances}
              onShowStatus={showStatus}
            />
          </div>

          {/* Right Column - Transactions */}
          <div className="xl:col-span-1">
            <TransactionsPanel
              transactions={transactions}
              loading={loading}
              onRefresh={fetchTransactions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCreditDApp;