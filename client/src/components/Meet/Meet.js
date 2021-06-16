import { useState,useEffect } from 'react';
import styles from '../Meet/Meet.module.css';
import Sidebar from '../Sidebar/Sidebar';
import Chatbox from '../Chatbox/Chatbox';
import Video from '../Video/Video';


export const Meet = () => {
    
   
    return (
        <div className={styles.mainContainer}>
            <Sidebar />
            <Chatbox />
            <Video />
           
        </div>
    );
}
