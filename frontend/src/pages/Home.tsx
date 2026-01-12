import { useState, useEffect } from 'react';
import { Leaf, Shield, TrendingUp, Users, Globe, ChevronRight, Menu, X, Play, Zap, Database, Cpu } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StatProps {
  number: string;
  label: string;
}

const Home: React.FC = () => {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => (
    <div className="group relative p-8 bg-gradient-to-br from-purple-900/30 via-slate-800/50 to-indigo-900/30 backdrop-blur-xl rounded-3xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="text-purple-400 mb-6 transform group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">{title}</h3>
        <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{description}</p>
      </div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );

  const Stat: React.FC<StatProps> = ({ number, label }) => (
    <div className="text-center group">
      <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">{number}</div>
      <div className="text-gray-300 group-hover:text-purple-300 transition-colors duration-300">{label}</div>
    </div>
  );

  const Logo = () => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-pulse">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        CarbonCred
      </span>
    </div>
  );

  const FloatingParticle = ({ delay, size, color }: { delay: number; size: number; color: string }) => (
    <div 
      className={`absolute w-${size} h-${size} ${color} rounded-full opacity-20 animate-pulse`}
      style={{
        animationDelay: `${delay}s`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${3 + Math.random() * 2}s`
      }}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {Array.from({ length: 50 }).map((_, i) => (
            <FloatingParticle 
              key={i} 
              delay={i * 0.1} 
              size={Math.random() > 0.5 ? 1 : 2}
              color={Math.random() > 0.5 ? 'bg-purple-500' : 'bg-cyan-500'}
            />
          ))}
        </div>
        
        {/* Mouse-following gradient */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Navigation */}
      {/* <nav className={`fixed w-full z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-purple-500/20 shadow-2xl shadow-purple-500/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="hover:text-purple-400 transition-all duration-300 relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="hover:text-purple-400 transition-all duration-300 relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="hover:text-purple-400 transition-all duration-300 relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <button className="relative group bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-xl hover:shadow-purple-500/30 hover:scale-105 overflow-hidden">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            <button 
              className="md:hidden relative z-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-purple-500/20 backdrop-blur-xl">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
                <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
                <a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a>
                <button className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-2 rounded-full font-semibold w-fit">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav> */}

      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/15 via-emerald-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl animate-bounce" style={{ animationDuration: '6s' }}></div>
          
          {/* Geometric shapes */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-purple-500/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border border-cyan-500/20 rounded-full animate-ping" style={{ animationDuration: '4s' }}></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Futuristic Central Hero Image */}
            <div className="mb-12 flex justify-center">
              <div className="relative group">
                <div className="w-40 h-40 bg-gradient-to-br from-purple-500 via-indigo-500 via-cyan-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-700 shadow-purple-500/40 animate-pulse">
                  <div className="relative">
                    <Globe className="w-20 h-20 text-white animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center animate-pulse">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Orbital rings */}
                <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
                <div className="absolute inset-2 border border-cyan-400/20 rounded-full animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}></div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-cyan-500 to-emerald-500 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700 animate-pulse"></div>
              </div>
            </div>

            <h1 className="text-7xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent leading-tight animate-pulse">
              CarbonCred
            </h1>
            
            <p className="text-2xl md:text-3xl text-transparent bg-gradient-to-r from-purple-300 via-cyan-300 to-emerald-300 bg-clip-text mb-6 font-light">
              Next-Gen Blockchain Carbon Trading
            </p>
            
            <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Experience the future of environmental sustainability with our quantum-secured, AI-powered carbon credit trading platform. Join the revolution that's reshaping climate action through advanced blockchain technology.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20">
              <button className="group relative bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-10 py-5 rounded-full text-lg font-semibold transition-all duration-500 shadow-2xl hover:shadow-purple-500/40 flex items-center space-x-3 transform hover:scale-105 overflow-hidden">
                <span className="relative z-10">Launch Platform</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group relative border-2 border-purple-500/50 px-10 py-5 rounded-full text-lg font-semibold hover:bg-purple-500/20 transition-all duration-500 flex items-center space-x-3 backdrop-blur-xl hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Experience Demo</span>
              </button>
            </div>

            {/* Enhanced Stats with animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <Stat number="100M+" label="Tons CO₂ Secured" />
              <Stat number="2,500+" label="Active Nodes" />
              <Stat number="99.99%" label="Quantum Security" />
              <Stat number="∞" label="Scalability" />
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-purple-400/50 rounded-full flex justify-center backdrop-blur-sm">
            <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Quantum-Enhanced Features
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Harness the power of next-generation blockchain technology with quantum security, AI optimization, and real-time global synchronization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Feature
              icon={<Shield className="w-14 h-14" />}
              title="Quantum Security"
              description="Military-grade quantum encryption protects every transaction with unhackable security protocols and zero-knowledge proofs."
            />
            
            <Feature
              icon={<Cpu className="w-14 h-14" />}
              title="AI-Powered Trading"
              description="Advanced machine learning algorithms optimize trading strategies and predict market trends with unprecedented accuracy."
            />
            
            <Feature
              icon={<Database className="w-14 h-14" />}
              title="Hyperscale Infrastructure"
              description="Process millions of transactions per second with our distributed quantum-resistant blockchain architecture."
            />
            
            <Feature
              icon={<Leaf className="w-14 h-14" />}
              title="Smart Verification"
              description="Automated satellite monitoring and IoT sensors provide real-time verification of carbon offset projects worldwide."
            />
            
            <Feature
              icon={<Globe className="w-14 h-14" />}
              title="Global Synchronization"
              description="Instantaneous settlement across all time zones with our proprietary consensus mechanism and cross-chain compatibility."
            />
            
            <Feature
              icon={<Zap className="w-14 h-14" />}
              title="Lightning Speed"
              description="Sub-second transaction finality with our revolutionary sharding technology and optimistic rollup implementation."
            />
          </div>
        </div>

        {/* Background enhancements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-cyan-900/40 backdrop-blur-sm"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10"></div>
          {/* Animated geometric shapes */}
          <div className="absolute top-10 left-10 w-20 h-20 border border-purple-500/30 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 border border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Shape the Future
            </h2>
            <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join the quantum revolution in carbon trading. Be part of the next generation platform that's redefining environmental sustainability through cutting-edge technology.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <button className="group relative bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 px-12 py-5 rounded-full text-xl font-semibold transition-all duration-500 shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 overflow-hidden">
                <span className="relative z-10">Enter the Future</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button className="group border-2 border-purple-500/50 px-12 py-5 rounded-full text-xl font-semibold hover:bg-purple-500/20 transition-all duration-500 backdrop-blur-xl hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20">
                Explore Technology
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-slate-950/80 backdrop-blur-2xl py-16 px-6 border-t border-purple-500/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-950/50 to-indigo-950/50"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <Logo />
            <div className="flex items-center space-x-8 mt-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">Terms</a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110">Support</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-all duration-300 hover:scale-110">API</a>
            </div>
          </div>
          <div className="border-t border-purple-500/20 pt-8 text-center">
            <p className="text-gray-400 mb-2">&copy; 2025 CarbonCred. Pioneering the quantum age of sustainable technology.</p>
            <p className="text-sm text-purple-400/60">Built with quantum-resistant architecture • Secured by next-gen cryptography</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;