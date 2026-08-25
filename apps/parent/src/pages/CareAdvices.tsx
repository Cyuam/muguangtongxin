import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Spin, Button, message, Space } from 'antd';
import { LikeOutlined, DislikeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatDate } from '@muguang/shared';
import { fetchCareAdvices, submitAdviceFeedback } from '../services/parent';
import { extractError } from '../services/api';
import type { CareAdvice, AdviceFeedback } from '@muguang/shared';

const feedbackLabels: Record<string, { text: string; color: string }> = {
  USEFUL: { text: '有用', color: 'green' },
  USELESS: { text: '无用', color: 'red' },
  PRACTICED: { text: '已实践', color: 'blue' },
};

const CareAdvices: React.FC = () => {
  const [advices, setAdvices] = useState<CareAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadAdvices = () => {
    setLoading(true);
    fetchCareAdvices({ page: 1, pageSize: 50 })
      .then((res) => setAdvices(res.items))
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdvices();
  }, []);

  const handleFeedback = (adviceId: string, feedback: AdviceFeedback) => {
    setFeedbackLoading(true);
    submitAdviceFeedback(adviceId, feedback)
      .then(() => {
        message.success('反馈已提交');
        loadAdvices();
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setFeedbackLoading(false));
  };

  return (
    <Spin spinning={loading}>
      <div className="section-title">监护建议</div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2 }}
        dataSource={advices}
        locale={{ emptyText: '暂无监护建议' }}
        renderItem={(advice) => (
          <List.Item>
            <Card
              title={
                <Space>
                  <span>{advice.content.title}</span>
                  {advice.content.isLeftBehindSpecific && (
                    <Tag color="orange">留守儿童专项</Tag>
                  )}
                </Space>
              }
              extra={
                advice.feedback ? (
                  <Tag color={feedbackLabels[advice.feedback]?.color}>
                    {feedbackLabels[advice.feedback]?.text}
                  </Tag>
                ) : null
              }
            >
              <p style={{ color: '#666', marginBottom: 12 }}>{advice.content.body}</p>

              <div style={{ marginBottom: 12 }}>
                <strong>可操作步骤：</strong>
                <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                  {advice.content.actionableSteps.map((step, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{step}</li>
                  ))}
                </ol>
              </div>

              <div style={{ color: '#999', fontSize: 12, marginBottom: 12 }}>
                推送时间：{formatDate(advice.pushedAt)}
              </div>

              {!advice.feedback && (
                <Space>
                  <Button
                    size="small"
                    icon={<LikeOutlined />}
                    loading={feedbackLoading}
                    onClick={() => handleFeedback(advice.id, 'USEFUL')}
                  >
                    有用
                  </Button>
                  <Button
                    size="small"
                    icon={<DislikeOutlined />}
                    loading={feedbackLoading}
                    onClick={() => handleFeedback(advice.id, 'USELESS')}
                  >
                    无用
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={feedbackLoading}
                    onClick={() => handleFeedback(advice.id, 'PRACTICED')}
                  >
                    已实践
                  </Button>
                </Space>
              )}
            </Card>
          </List.Item>
        )}
      />
    </Spin>
  );
};

export default CareAdvices;
