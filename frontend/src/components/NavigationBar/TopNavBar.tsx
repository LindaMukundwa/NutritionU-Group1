// Enhanced TopNavBar.tsx with click outside handler
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import styles from "./TopNavBar.module.css";

interface TopNavBarProps {
  userEmail?: string;
  onOpenGroceryList?: () => void;
}

export function TopNavBar({ userEmail = "Linda.Mukundwa1@marist.edu", onOpenGroceryList }: TopNavBarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className={styles.navBar}>
      {/* Logo on the left */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <ChefHat className={styles.chefHat} />
        </div>
        <span className={styles.logoText}>
          Nutrition<span className={styles.logoAccent}>U</span>
        </span>
      </div>

      {/* Right side - Grocery List and Hamburger Menu */}
      <div className={styles.rightSection} ref={menuRef}>
        {/* Grocery List Button */}
        <button 
          className={styles.groceryListButton}
          onClick={onOpenGroceryList}
        >
          🛒 Grocery List
        </button>

        {/* Hamburger Menu */}
        <div className={styles.menuContainer}>
          <button 
            className={styles.hamburgerButton}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div className={styles.dropdownMenu}>
                <div className={styles.menuItem}>
                  <span className={styles.menuIcon}>👤</span>
                  Profile
                </div>
                <div 
                  className={styles.menuItem}
                  onClick={() => {
                    navigate('/settings-preview');
                    setIsMenuOpen(false);
                  }}
                >
                  <span className={styles.menuIcon}>⚙️</span>
                  Settings
                </div>
                <div className={styles.menuDivider}></div>
                <div className={styles.userInfo}>
                  Signed in as
                  <div className={styles.userEmail}>{userEmail}</div>
                </div>
              </div>
              {/* Overlay to capture clicks outside */}
              <div 
                className={styles.menuOverlay}
                onClick={() => setIsMenuOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
