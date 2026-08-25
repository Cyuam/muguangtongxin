import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin } from 'antd';
import {
  FileTextOutlined,
  RocketOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { fetchBalance } from '../services/points';
import { useAuthStore } from '../store/auth';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBalance()
      .then((res) => setBalance(res.balance))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  const entryCards = [
    {
      title: '开始测评',
      desc: '测测你的法治认知与心理状态',
      icon: <FileTextOutlined style={{ fontSize: 48, color: '#ff6b6b' }} />,
      color: '#fff5f5',
      path: '/child/assessment',
    },
    {
      title: '情景游戏',
      desc: '在趣味情景中学习自我保护',
      icon: <RocketOutlined style={{ fontSize: 48, color: '#4ecdc4' }} />,
      color: '#f0fffc',
      path: '/child/game',
    },
    {
      title: '我的积分',
      desc: `当前积分：${balance ?? '...'}`,
      icon: <TrophyOutlined style={{ fontSize: 48, color: '#ffa940' }} />,
      color: '#fff7e6',
      path: '/child/points',
    },
    {
      title: '我的主页',
      desc: user?.name ?? '小朋友',
      icon: <UserOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
      color: '#f9f0ff',
      path: '/child/profile',
    },
  ];

  return (
    <div>
      <h1 className="child-title" style={{ textAlign: 'center', margin: '20px 0' }}>
        欢迎回来，{user?.name ?? '小朋友'}！
      </h1>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {entryCards.map((card) => (
            <Col xs={24} sm={12} key={card.title}>
              <Card
                className="child-card"
                style={{ background: card.color, textAlign: 'center', padding: '12px 0' }}
                onClick={() => navigate(card.path)}
              >
                <div style={{ marginBottom: 12 }}>{card.icon}</div>
                <div className="child-title" style={{ marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 16, color: '#666' }}>{card.desc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
};

export default Home;
