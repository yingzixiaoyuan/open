import React, { useState } from 'react';
import styles from './index.scss';
const ChatBot: React.FC = () => {
  const [openSettings] = useState(false);
  return (
    <>
      <div className={styles.container}></div>
      <div className={styles['window-content']}>
        {openSettings ? (
          // <Settings
          //     closeSettings={() => {
          //     setOpenSettings(false);
          //     setShowSideBar(true);
          //     }}
          // />
          <>setttings</>
        ) : (
          <>chat</>
        )}
      </div>
    </>
  );
};
export default ChatBot;
