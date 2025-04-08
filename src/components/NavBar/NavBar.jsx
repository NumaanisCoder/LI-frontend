import React, { useState } from 'react';
import style from './NavBarStyle.module.css';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiMusic, FiFileText, FiMenu, FiX } from 'react-icons/fi';

const NavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className={style.mobileMenuButton} onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </div>
      
      <nav className={`${style.navBar} ${mobileMenuOpen ? style.mobileMenuOpen : ''}`}>
        <ul className={style.navList}>
          <li className={`${style.navItem} ${location.pathname === '/' ? style.active : ''}`}>
            <Link to={'/'} onClick={closeMobileMenu}>
              <FiHome className={style.navIcon} />
              <span>Home</span>
            </Link>
          </li>
          <li className={`${style.navItem} ${location.pathname === '/audio' ? style.active : ''}`}>
            <Link to={'/audio'} onClick={closeMobileMenu}>
              <FiMusic className={style.navIcon} />
              <span>Audio Uploader</span>
            </Link>
          </li>
          <li className={`${style.navItem} ${location.pathname === '/pdfviewer' ? style.active : ''}`}>
            <Link to={'/pdfviewer'} onClick={closeMobileMenu}>
              <FiFileText className={style.navIcon} />
              <span>PDF Viewer</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default NavBar;