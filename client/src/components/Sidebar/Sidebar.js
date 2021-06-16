import { useState,useEffect } from 'react';
import styles from './Sidebar.module.css';


const Sidebar = () => {
    

    return (
        <div className={styles.sidebarBox}>
            <div className={styles.member}>
                <h1>Igloo</h1>
                <p>Sam</p>
                <p>will</p>
                <p>Emily</p> 
            </div>
        </div>
    );
}

export default Sidebar;