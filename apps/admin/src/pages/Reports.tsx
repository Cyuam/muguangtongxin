import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Spin, message, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchReports, getReportDownloadUrl } from '../services/admin';
import { extractError } from '../services/api';
import { formatDate } from '@muguang/shared';
import type { GovernanceReport } from '@muguang/shared';

const periodLabels: Record<string, { text: string; color: string }> = {
  WEEKLY: { text: '周报', color: 'blue' },
  MONTHLY: { text: '月报', color: 'green' },
  TERM: { text: '学期报', color: 'purple' },
};

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<GovernanceReport[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReports = () => {
    setLoading(true);
    fetchReports({ page: 1, pageSize: 50 })
      .then((res) => setReports(res.items))
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDownload = (id: string) => {
    window.open(getReportDownloadUrl(id), '_blank');
  };

  const columns: ColumnsType<GovernanceReport> = [
    {
      title: '报告周期',
      dataIndex: 'period',
      key: 'period',
      render: (period: string) => (
        <Tag color={periodLabels[period]?.color ?? 'default'}>
          {periodLabels[period]?.text ?? period}
        </Tag>
      ),
    },
    {
      title: '辖区',
      dataIndex: 'jurisdiction',
      key: 'jurisdiction',
    },
    {
      title: '起始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (v: string) => formatDate(v),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (v: string) => formatDate(v),
    },
    {
      title: '生成时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => formatDate(v),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.fileUrl && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.id)}
            >
              下载
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">治理报告</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/reports/generate')}>
          生成报告
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '暂无治理报告' }}
        />
      </Card>
    </Spin>
  );
};

export default Reports;
