import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Tag, Button, Descriptions, List, message, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { RiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, formatDateTime } from '@muguang/shared';
import { fetchWarningDetail, markWarningHandled } from '../services/parent';
import { extractError } from '../services/api';
import type { Warning } from '@muguang/shared';

const WarningDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warning, setWarning] = useState<Warning | null>(null);
  const [loading, setLoading] = useState(false);
  const [handling, setHandling] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (!id) return;
    setLoading(true);
    fetchWarningDetail(id)
      .then(setWarning)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkHandled = () => {
    if (!id) return;
    setHandling(true);
    markWarningHandled(id)
      .then((updated) => {
        setWarning(updated);
        message.success('已标记为已处理');
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setHandling(false));
  };

  if (loading || !warning) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/parent/warnings')}>
          返回列表
        </Button>
      </Space>

      <Card title="预警详情" extra={
        warning.status !== 'HANDLED' ? (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={handling}
            onClick={handleMarkHandled}
          >
            标记已处理
          </Button>
        ) : (
          <Tag color="green">已处理</Tag>
        )
      }>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="风险类型">
            {warning.content.riskType}
          </Descriptions.Item>
          <Descriptions.Item label="风险等级">
            <Tag color={RISK_LEVEL_COLORS[warning.riskLevel as RiskLevel]}>
              {RISK_LEVEL_LABELS[warning.riskLevel as RiskLevel]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="学生（脱敏）">
            {warning.content.studentNameMasked}
          </Descriptions.Item>
          <Descriptions.Item label="通知时间">
            {formatDateTime(warning.notifiedAt)}
          </Descriptions.Item>
          {warning.readAt && (
            <Descriptions.Item label="阅读时间">
              {formatDateTime(warning.readAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="具体表现" style={{ marginTop: 16 }}>
        <List
          dataSource={warning.content.manifestations}
          renderItem={(item) => <List.Item>{item}</List.Item>}
          locale={{ emptyText: '暂无' }}
        />
      </Card>

      <Card title="建议措施" style={{ marginTop: 16 }}>
        <List
          dataSource={warning.content.suggestions}
          renderItem={(item, idx) => (
            <List.Item>
              <span style={{ fontWeight: 'bold', color: '#1677ff', marginRight: 8 }}>
                {idx + 1}.
              </span>
              {item}
            </List.Item>
          )}
          locale={{ emptyText: '暂无' }}
        />
      </Card>
    </div>
  );
};

export default WarningDetail;
