import React from 'react';
import styles from './index.less';
import {Link} from 'umi';
//all from umi,所有的组件都直接从umi里导入
export default function Page() {
  return (
    <div>
      <h1 className={styles.title}>首页</h1>
      <Link to="/profile">个人中心</Link>
    </div>
  );
}
