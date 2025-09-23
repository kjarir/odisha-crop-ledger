import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Leaf, User, ShoppingCart, Shield, LogIn } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 transition-smooth hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gradient-primary">AgriTrace</span>
            <span className="text-xs text-muted-foreground">Government of Odisha</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            About
          </Link>
          <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Marketplace
          </Link>
          <Link to="/track" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Track Produce
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-smooth">
            Dashboard
          </Link>
        </nav>

        {/* Desktop Auth & Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button size="sm" className="gradient-primary" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>

          {/* Role Dropdown for Authenticated Users (mockup) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Farmer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingCart className="mr-2 h-4 w-4" />
                My Batches
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container py-4 space-y-3">
            <Link
              to="/about"
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(false)}
            >
              About AgriTrace
            </Link>
            <Link
              to="/marketplace"
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              to="/track"
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(false)}
            >
              Track Produce
            </Link>
            <Link
              to="/dashboard"
              className="block text-sm font-medium text-muted-foreground hover:text-primary transition-smooth"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="pt-3 border-t space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button size="sm" className="w-full gradient-primary" asChild>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};