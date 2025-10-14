import React from 'react';
import styles from './profile.less';
import {history} from 'umi';
export default function Page() {
  return (
    <div>
      <h1 className={styles.title}>Page profile</h1>
      <button onClick={()=>history.back()}>返回</button>
    </div>
  );
}
