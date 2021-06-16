import { useState,useEffect } from 'react';
import styles from './Chatbox.module.css';


const Chatbox = () => {
    
    const [message, setMessage] = useState('');

    useEffect(() =>{
        fetch('/users')
        .then((res) => res.json())
        .then((data) => setMessage(data.message));
    },[])

    return (
        <div className={styles.chatbox}>
            <h1>From Chatbox</h1>
            <p>{ message }</p>
        </div>
    );
}

export default Chatbox;
