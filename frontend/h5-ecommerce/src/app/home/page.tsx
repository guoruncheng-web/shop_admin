'use client';

import { Button, Space } from 'antd-mobile';
import styles from './page.module.scss';

const Home = () => {
    return (
        <div className={styles.home}>
            <div className={styles.title}>首页</div>
            <div className={styles.content}>
                <Space direction='vertical'>
                    <p>H5 电商商城首页</p>
                    <Button color='primary'>主要按钮</Button>
                    <Button color='success'>成功按钮</Button>
                    <Button color='warning'>警告按钮</Button>
                </Space>
            </div>
        </div>
    );
}

export default Home;