import { useState } from 'react';
import { Menu, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">LocalBot</h1>
          </div>
          
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="text-slate-600 w-5 h-5" />
            ) : (
              <Menu className="text-slate-600 w-5 h-5" />
            )}
          </button>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-slate-600 hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#" className="text-slate-600 hover:text-primary transition-colors">
              About
            </a>
            <Button className="bg-primary text-white hover:bg-blue-700">
              Get Started
            </Button>
          </nav>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-slate-600 hover:text-primary transition-colors">
                How it works
              </a>
              <a href="#" className="text-slate-600 hover:text-primary transition-colors">
                About
              </a>
              <Button className="bg-primary text-white hover:bg-blue-700 w-fit">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
