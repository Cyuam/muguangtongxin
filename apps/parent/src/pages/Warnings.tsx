import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Tag, Card, Spin, message, Button } from 'antd';
import { RiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, formatDate } from '@muguang/shared';
import { fetchWarnings, markWarningRead } from '../services/parent';
import { extractError } from '../services/api';
import type { Warning } from '@muguang/shared';

const riskOrder: Record<RiskLevel, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  NONE: 4,
};

const statusLabels: Record<string, { text: string; color: string }> = {
  UNREAD: { text: '未读', color: 'red' },
  READ: { text: '已读', color: 'blue' },
  HANDLED: { text: '已处理', color: 'green' },
};

const Warnings: React.FC = () => {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWarnings = () => {
    setLoading(true);
    fetchWarnings({ page: 1, pageSize: 50 })
      .then((res) => {
        // 按风险等级排序
        const sorted = [...res.items].sort(
          (a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel],
        );
        setWarnings(sorted);
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWarnings();
  }, []);

  const handleClick = (warning: Warning) => {
    if (warning.status === 'UNREAD') {
      markWarningRead(warning.id).then(() => loadWarnings());
    }
    navigate(`/parent/warnings/${warning.id}`);
  };

  return (
    <Spin spinning={loading}>
      <div className="section-title">风险预警</div>
      <Card>
        <List
          dataSource={warnings}
          locale={{ emptyText: '暂无预警记录' }}
          renderItem={(warning) => {
            const statusInfo = statusLabels[warning.status] ?? { text: warning.status, color: 'default' };
            return (
              <List.Item
                key={warning.id}
                actions={[
                  <Button type="link" onClick={() => handleClick(warning)}>
                    查看详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag
                        color={RISK_LEVEL_COLORS[warning.riskLevel as RiskLevel]}
                        style={{ fontSize: 14 }}
                      >
                        {RISK_LEVEL_LABELS[warning.riskLevel as RiskLevel]}
                      </Tag>
                      <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
                      <span>{warning.content.riskType}</span>
                    </div>
                  }
                  description={
                    <div>
                      <div>学生：{warning.content.studentNameMasked}</div>
                      <div style={{ color: '#999', marginTop: 4 }}>
                        通知时间：{formatDate(warning.notifiedAt)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </Spin>
  );
};

export default Warnings;
