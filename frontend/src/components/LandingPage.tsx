import React from 'react';
import { TrendingUp, BarChart3, Shield, Target, Zap, ArrowRight, CheckCircle, Star, Users, Award } from 'lucide-react';

export const LandingPage: React.FC<{ onGetStarted: () => void; onLogin: () => void }> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20 pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TradingJournal</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-blue-200 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-blue-200 hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="text-blue-200 hover:text-white transition-colors">About</a>
            <button
              onClick={onLogin}
              className="text-blue-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-200 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 10,000+ traders worldwide
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Master Your
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"> Trading</span>
              <br />
              Journey
            </h1>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track, analyze, and optimize your trading performance with our comprehensive journal. 
              Get insights that help you make better trading decisions and grow your portfolio.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="text-blue-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-blue-500/30 hover:border-blue-400/50"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-blue-200">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">500K+</div>
              <div className="text-blue-200">Trades Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-200">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 px-6 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Powerful features designed to help you track, analyze, and improve your trading performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-blue-200 leading-relaxed">
                Get detailed insights into your trading performance with comprehensive analytics, 
                including win rate, profit factor, and risk metrics.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Risk Management</h3>
              <p className="text-blue-200 leading-relaxed">
                Set and track risk parameters, monitor drawdowns, and ensure you never risk 
                more than you can afford to lose.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Goal Tracking</h3>
              <p className="text-blue-200 leading-relaxed">
                Set trading goals and track your progress. Stay motivated and focused on 
                achieving your financial objectives.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Trade Templates</h3>
              <p className="text-blue-200 leading-relaxed">
                Create and save trading templates for your favorite strategies. 
                Speed up your trade entry process and maintain consistency.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Performance Tracking</h3>
              <p className="text-blue-200 leading-relaxed">
                Monitor your equity curve, track winning and losing streaks, 
                and identify patterns in your trading behavior.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Community Insights</h3>
              <p className="text-blue-200 leading-relaxed">
                Learn from other traders, share strategies, and get inspired by 
                the success stories of our community members.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20 pb-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-blue-200 mb-8">
            Join thousands of traders who are already improving their performance with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Your Free Trial
            </button>
            <button
              onClick={onLogin}
              className="text-blue-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-blue-500/30 hover:border-blue-400/50"
            >
              Sign In to Your Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-20 w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Branding & Navigasi */}
          <div className="flex flex-col gap-6 md:gap-8 md:flex-row md:items-center w-full">
            {/* Branding */}
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TradingJournal</span>
            </div>
            {/* Navigasi */}
            <nav className="flex flex-wrap gap-6 text-blue-200 text-sm">
              <a href="#" className="hover:text-white transition-colors">Home</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </nav>
          </div>
          {/* Sosial Media */}
          <div className="flex gap-5 items-center justify-center md:justify-end">
            <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="Twitter"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.1.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6-.7-.02-1.36-.21-1.94-.53v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54c-.28 0-.56-.02-.83-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg></a>
            <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="GitHub"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.48 2.87 8.28 6.84 9.63.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.38-2.03 1-2.75-.1-.26-.44-1.3.1-2.7 0 0 .83-.27 2.75 1.02A9.36 9.36 0 0 1 12 7.43c.84.004 1.68.11 2.47.32 1.92-1.29 2.75-1.02 2.75-1.02.54 1.4.2 2.44.1 2.7.62.72 1 1.63 1 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg></a>
            <a href="#" className="text-blue-300 hover:text-white transition-colors" aria-label="LinkedIn"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg></a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-6 pt-4 flex flex-col md:flex-row items-center justify-between border-t border-white/10 mt-6 gap-2">
          <div className="text-blue-200 text-xs text-center md:text-left">&copy; {new Date().getFullYear()} TradingJournal. All rights reserved.</div>
          <div className="flex gap-4 text-xs text-blue-300">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}; 