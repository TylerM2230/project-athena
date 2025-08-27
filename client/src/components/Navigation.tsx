import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Settings } from 'lucide-react';
import clsx from 'clsx';
import { SettingsModal } from './SettingsModal';
import { AthenaLogo } from './AthenaLogo';

export function Navigation() {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [blobStyle, setBlobStyle] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const navItems = [
    { path: '/', label: 'dashboard' },
    { path: '/tasks', label: 'tasks' },
    { path: '/notes', label: 'notes' },
  ];

  const updateBlobPosition = () => {
    if (activeRef.current && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const activeRect = activeRef.current.getBoundingClientRect();
      
      const left = activeRect.left - navRect.left - 8;
      const width = activeRect.width + 16;
      const height = activeRect.height + 8;
      
      setBlobStyle({
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        top: `${-4}px`,
      });
    }
  };

  useEffect(() => {
    setIsAnimating(true);
    updateBlobPosition();
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  useEffect(() => {
    updateBlobPosition();
    window.addEventListener('resize', updateBlobPosition);
    return () => window.removeEventListener('resize', updateBlobPosition);
  }, []);

  return (
    <>
      <nav className="nav-terminal">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center justify-between py-6">
            <Link to="/" className="flex items-center space-x-1 terminal-prompt font-mono text-xl font-semibold hover:text-term-text transition-colors">
              <AthenaLogo className="h-8 w-8 text-term-text-dim" />
              <span>athena</span>
            </Link>
            
            <div className="flex items-center space-x-2 relative" ref={navRef}>
              <div 
                className={clsx('nav-blob', isAnimating && 'animating')}
                style={blobStyle}
              />
              
              {navItems.map(({ path, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    ref={isActive ? activeRef : null}
                    className={clsx(
                      'nav-link',
                      isActive && 'active'
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
              
              <button
                onClick={() => setShowSettings(true)}
                className="nav-link flex items-center ml-4"
                title="Settings"
              >
                <Settings className="h-4 w-4 mr-1" />
                settings
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}