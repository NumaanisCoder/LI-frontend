import React from 'react'
import style from './NavBarStyle.module.css';
import { Link } from 'react-router-dom';


const NavBar = () => {
  return (
    <nav className={style.navBar}>
        <li className={style.li}><Link to={'/'}>Home</Link></li>
        <li className={style.li}><Link to={'/audio'}>Audio Uploader</Link></li>
        <li className={style.li}><Link></Link>Pdf Viewer</li>
    </nav>
  )
}

export default NavBar