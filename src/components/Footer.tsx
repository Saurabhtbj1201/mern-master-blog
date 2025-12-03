import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

export const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="NotePath Logo" className="h-10 w-10" />
              <h3 className="font-serif text-xl font-bold">NotePath</h3>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover amazing stories from talented writers on topics you love.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/submit-article" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Article
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              {user ? (
                <li>
                  <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors">
                    Profile Settings
                  </Link>
                </li>
              ) : (
                <li>
                  <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                    Sign In / Sign Up
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="text-muted-foreground">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NotePath. All rights reserved.</p>
          <p>
            Made with ❤️ for writers by{' '}
            <a 
              href="https://www.gu-saurabh.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Saurabh Kumar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
