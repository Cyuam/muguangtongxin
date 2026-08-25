import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Spin, message, Progress, Tag, Button } from 'antd';
import {
  TeamOutlined,
  FileSearchOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  fetchDashboardOverview,
  fetchCollabStatus,
  type CollabStatus,
} from '../services/admin';
import { extractError } from '../services/api';
import {
  RiskLevel,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_COLORS,
} from '@muguang/shared';
import type { DashboardOverview as OverviewType } from '@muguang/shared';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewType | null>(null);
  const [collab, setCollab] = useState<CollabStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDashboardOverview().catch(() => null),
      fetchCollabStatus().catch(() => null),
    ])
      .then(([o, c]) => {
        setOverview(o);
        setCollab(c);
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const riskDist = overview?.riskDistribution ?? {
    [RiskLevel.NONE]: 0,
    [RiskLevel.LOW]: 0,
    [RiskLevel.MEDIUM]: 0,
    [RiskLevel.HIGH]: 0,
    [RiskLevel.CRITICAL]: 0,
  };

  const totalRisk = Object.values(riskDist).reduce((a, b) => a + b, 0) || 1;

  return (
    <Spin spinning={loading}>
      <div className="section-title">数据看板总览</div>

      {/* 核心指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/admin/dashboard')}>
            <Statistic
              title="辖区儿童总数"
              value={overview?.totalChildren ?? 0}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/admin/dashboard')}>
            <Statistic
              title="测评参与率"
              value={overview ? Math.round(overview.assessmentParticipationRate * 100) : 0}
              suffix="%"
              prefix={<FileSearchOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/admin/risk-map')}>
            <Statistic
              title="高风险儿童数"
              value={(riskDist[RiskLevel.HIGH] ?? 0) + (riskDist[RiskLevel.CRITICAL] ?? 0)}
              prefix={<AlertOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/admin/dashboard')}>
            <Statistic
              title="协同覆盖率"
              value={overview ? Math.round(overview.collabCoverage * 100) : 0}
              suffix="%"
              prefix={<SyncOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 风险分布 */}
      <Card title="风险分布" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {(Object.keys(riskDist) as RiskLevel[]).map((level) => {
            const count = riskDist[level] ?? 0;
            const percent = Math.round((count / totalRisk) * 100);
            return (
              <Col xs={24} sm={12} md={8} key={level} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag color={RISK_LEVEL_COLORS[level]}>
                    {RISK_LEVEL_LABELS[level]}
                  </Tag>
                  <span style={{ fontWeight: 'bold' }}>{count} 人</span>
                  <span style={{ color: '#999' }}>({percent}%)</span>
                </div>
                <Progress
                  percent={percent}
                  strokeColor={RISK_LEVEL_COLORS[level]}
                  size="small"
                />
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 协同状态 */}
      <Card title="家校社协同状态">
        {collab && (
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic
                title="家长端活跃率"
                value={Math.round(collab.parentActiveRate * 100)}
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="教师端活跃率"
                value={Math.round(collab.teacherActiveRate * 100)}
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#1677ff' }} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="协同任务总数"
                value={collab.totalCollabTasks}
                prefix={<SyncOutlined style={{ color: '#722ed1' }} />}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="已完成协同任务"
                value={collab.completedCollabTasks}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Col>
          </Row>
        )}
      </Card>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button type="primary" size="large" onClick={() => navigate('/admin/dashboard')}>
          查看完整数据看板
        </Button>
      </div>
    </Spin>
  );
};

export default Home;
