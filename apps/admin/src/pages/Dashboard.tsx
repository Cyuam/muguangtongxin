import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message, Progress, Tag, Select, DatePicker, Button, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TeamOutlined,
  FileSearchOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  fetchDashboardOverview,
  fetchCollabStatus,
  type CollabStatus,
  type DashboardFilter,
} from '../services/admin';
import { extractError } from '../services/api';
import {
  RiskLevel,
  RISK_LEVEL_LABELS,
  RISK_LEVEL_COLORS,
} from '@muguang/shared';
import type { DashboardOverview as OverviewType } from '@muguang/shared';

const { RangePicker } = DatePicker;

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<OverviewType | null>(null);
  const [collab, setCollab] = useState<CollabStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<DashboardFilter>({});

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetchDashboardOverview(filter).catch(() => null),
      fetchCollabStatus(filter).catch(() => null),
    ])
      .then(([o, c]) => {
        setOverview(o);
        setCollab(c);
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const riskDist = overview?.riskDistribution ?? {
    [RiskLevel.NONE]: 0,
    [RiskLevel.LOW]: 0,
    [RiskLevel.MEDIUM]: 0,
    [RiskLevel.HIGH]: 0,
    [RiskLevel.CRITICAL]: 0,
  };

  const interventionProgress = overview?.interventionProgress ?? {
    total: 0,
    pending: 0,
    delivered: 0,
    acted: 0,
    completed: 0,
  };

  const interventionColumns: ColumnsType<{ stage: string; count: number; percent: number }> = [
    { title: '阶段', dataIndex: 'stage', key: 'stage' },
    { title: '数量', dataIndex: 'count', key: 'count' },
    {
      title: '占比',
      dataIndex: 'percent',
      key: 'percent',
      render: (v: number) => <Progress percent={v} size="small" />,
    },
  ];

  const interventionData = [
    { stage: '待推送', count: interventionProgress.pending, percent: interventionProgress.total ? Math.round((interventionProgress.pending / interventionProgress.total) * 100) : 0 },
    { stage: '已推送', count: interventionProgress.delivered, percent: interventionProgress.total ? Math.round((interventionProgress.delivered / interventionProgress.total) * 100) : 0 },
    { stage: '已行动', count: interventionProgress.acted, percent: interventionProgress.total ? Math.round((interventionProgress.acted / interventionProgress.total) * 100) : 0 },
    { stage: '已完成', count: interventionProgress.completed, percent: interventionProgress.total ? Math.round((interventionProgress.completed / interventionProgress.total) * 100) : 0 },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">完整数据看板</div>
        <Space>
          <RangePicker
            onChange={(_, dateStrings) => {
              if (dateStrings[0] && dateStrings[1]) {
                setFilter({ ...filter, startDate: dateStrings[0], endDate: dateStrings[1] });
              } else {
                const { startDate, endDate, ...rest } = filter;
                setFilter(rest);
              }
            }}
          />
          <Select
            allowClear
            placeholder="选择辖区"
            style={{ width: 150 }}
            onChange={(v) => setFilter({ ...filter, jurisdiction: v })}
            options={[
              { label: '北滘镇', value: 'beijiao' },
              { label: '碧江村', value: 'bijiao_village' },
              { label: '沙墩村', value: 'shadun_village' },
            ]}
          />
          <Select
            allowClear
            placeholder="年龄段"
            style={{ width: 120 }}
            onChange={(v) => setFilter({ ...filter, ageGroup: v })}
            options={[
              { label: '低年级', value: 'LOWER' },
              { label: '中年级', value: 'MIDDLE' },
              { label: '高年级', value: 'UPPER' },
            ]}
          />
          <Button onClick={loadData}>刷新</Button>
        </Space>
      </div>

      {/* 核心指标 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="辖区儿童总数"
              value={overview?.totalChildren ?? 0}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="测评参与率"
              value={overview ? Math.round(overview.assessmentParticipationRate * 100) : 0}
              suffix="%"
              prefix={<FileSearchOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="协同覆盖率"
              value={overview ? Math.round(overview.collabCoverage * 100) : 0}
              suffix="%"
              prefix={<SyncOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="干预总数"
              value={interventionProgress.total}
              prefix={<CheckCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 风险分布 */}
      <Card title="风险分布" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {(Object.keys(riskDist) as RiskLevel[]).map((level) => {
            const count = riskDist[level] ?? 0;
            const total = Object.values(riskDist).reduce((a, b) => a + b, 0) || 1;
            const percent = Math.round((count / total) * 100);
            return (
              <Col xs={24} sm={12} md={8} key={level} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag color={RISK_LEVEL_COLORS[level]}>{RISK_LEVEL_LABELS[level]}</Tag>
                  <span style={{ fontWeight: 'bold' }}>{count} 人</span>
                  <span style={{ color: '#999' }}>({percent}%)</span>
                </div>
                <Progress percent={percent} strokeColor={RISK_LEVEL_COLORS[level]} />
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 干预进展 */}
      <Card title="干预进展" style={{ marginBottom: 24 }}>
        <Table
          columns={interventionColumns}
          dataSource={interventionData}
          rowKey="stage"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 协同状态 */}
      {collab && (
        <Card title="家校社协同状态">
          <Row gutter={16}>
            <Col xs={24} sm={6}>
              <Statistic title="家长端活跃率" value={Math.round(collab.parentActiveRate * 100)} suffix="%" />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="教师端活跃率" value={Math.round(collab.teacherActiveRate * 100)} suffix="%" />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="协同任务总数" value={collab.totalCollabTasks} />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic title="已完成协同任务" value={collab.completedCollabTasks} />
            </Col>
          </Row>
        </Card>
      )}
    </Spin>
  );
};

export default Dashboard;
