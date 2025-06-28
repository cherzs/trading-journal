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
    </div>
  );
}; 