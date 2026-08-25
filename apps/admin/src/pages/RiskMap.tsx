import React, { useEffect, useState } from 'react';
import { Card, Spin, message, Table, Tag, Statistic, Row, Col, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fetchRiskMap, type RiskMapItem, type DashboardFilter } from '../services/admin';
import { extractError } from '../services/api';
import { RiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@muguang/shared';

/** 简易地图可视化（SVG 网格热力图） */
const RiskHeatMap: React.FC<{ data: RiskMapItem[] }> = ({ data }) => {
  if (data.length === 0) return <div style={{ color: '#999', textAlign: 'center', padding: 40 }}>暂无数据</div>;

  const maxHighRisk = Math.max(...data.map((d) => d.highRiskCount), 1);

  const getColor = (count: number) => {
    const ratio = count / maxHighRisk;
    if (ratio > 0.75) return '#f5222d';
    if (ratio > 0.5) return '#fa8c16';
    if (ratio > 0.25) return '#faad14';
    if (ratio > 0) return '#73d13d';
    return '#52c41a';
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', padding: 24 }}>
      {data.map((item) => {
        const color = getColor(item.highRiskCount);
        return (
          <div
            key={item.jurisdiction}
            style={{
              width: 140,
              height: 140,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
              border: `2px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
              {item.jurisdictionName}
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color, marginTop: 8 }}>
              {item.highRiskCount}
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>高风险人数</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              总计 {item.totalChildren} 人
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RiskMap: React.FC = () => {
  const [data, setData] = useState<RiskMapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<DashboardFilter>({});

  useEffect(() => {
    setLoading(true);
    fetchRiskMap(filter)
      .then(setData)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [filter]);

  const totalChildren = data.reduce((sum, d) => sum + d.totalChildren, 0);
  const totalHighRisk = data.reduce((sum, d) => sum + d.highRiskCount, 0);

  const columns: ColumnsType<RiskMapItem> = [
    { title: '辖区', dataIndex: 'jurisdictionName', key: 'jurisdictionName' },
    { title: '儿童总数', dataIndex: 'totalChildren', key: 'totalChildren', sorter: (a, b) => a.totalChildren - b.totalChildren },
    {
      title: '高风险人数',
      dataIndex: 'highRiskCount',
      key: 'highRiskCount',
      sorter: (a, b) => a.highRiskCount - b.highRiskCount,
      render: (v: number) => <span style={{ color: v > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>{v}</span>,
    },
    {
      title: '风险分布',
      dataIndex: 'riskDistribution',
      key: 'riskDistribution',
      render: (dist: Record<RiskLevel, number>) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(Object.keys(dist) as RiskLevel[]).map((level) => (
            <Tag key={level} color={RISK_LEVEL_COLORS[level]}>
              {RISK_LEVEL_LABELS[level]}: {dist[level] ?? 0}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">风险分布地图</div>
        <Select
          allowClear
          placeholder="选择年龄段"
          style={{ width: 120 }}
          onChange={(v) => setFilter({ ageGroup: v })}
          options={[
            { label: '低年级', value: 'LOWER' },
            { label: '中年级', value: 'MIDDLE' },
            { label: '高年级', value: 'UPPER' },
          ]}
        />
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="辖区总数" value={data.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="儿童总数" value={totalChildren} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="高风险儿童总数"
              value={totalHighRisk}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="辖区风险热力图" style={{ marginBottom: 24 }}>
        <RiskHeatMap data={data} />
      </Card>

      <Card title="辖区风险明细">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="jurisdiction"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Spin>
  );
};

export default RiskMap;
