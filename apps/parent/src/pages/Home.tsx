import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { AlertOutlined, BulbOutlined, TeamOutlined } from '@ant-design/icons';
import { fetchWarnings, fetchCareAdvices, fetchTasks } from '../services/parent';
import { extractError } from '../services/api';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ warnings: 0, advices: 0, tasks: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWarnings({ page: 1, pageSize: 1 }).catch(() => ({ total: 0, items: [], page: 1, pageSize: 1 })),
      fetchCareAdvices({ page: 1, pageSize: 1 }).catch(() => ({ total: 0, items: [], page: 1, pageSize: 1 })),
      fetchTasks({ page: 1, pageSize: 1 }).catch(() => ({ total: 0, items: [], page: 1, pageSize: 1 })),
    ])
      .then(([w, a, t]) => {
        setStats({ warnings: w.total, advices: a.total, tasks: t.total });
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading}>
      <div className="section-title">概览</div>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card hoverable onClick={() => navigate('/parent/warnings')}>
            <Statistic
              title="风险预警"
              value={stats.warnings}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable onClick={() => navigate('/parent/advices')}>
            <Statistic
              title="监护建议"
              value={stats.advices}
              prefix={<BulbOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable onClick={() => navigate('/parent/tasks')}>
            <Statistic
              title="亲子任务"
              value={stats.tasks}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <div className="section-title">快速操作</div>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card hoverable onClick={() => navigate('/parent/warnings')} style={{ textAlign: 'center' }}>
              <AlertOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
              <div style={{ marginTop: 8 }}>查看预警</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable onClick={() => navigate('/parent/advices')} style={{ textAlign: 'center' }}>
              <BulbOutlined style={{ fontSize: 32, color: '#faad14' }} />
              <div style={{ marginTop: 8 }}>查看建议</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable onClick={() => navigate('/parent/tasks/create')} style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <div style={{ marginTop: 8 }}>发起任务</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  );
};

export default Home;
