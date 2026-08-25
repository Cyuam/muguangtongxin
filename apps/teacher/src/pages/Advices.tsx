import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Spin, Button, message, Space } from 'antd';
import { LikeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { formatDate } from '@muguang/shared';
import { fetchAdvices, submitAdviceFeedback, type TeachingAdvice } from '../services/teacher';
import { extractError } from '../services/api';
import type { AdviceFeedback } from '@muguang/shared';

const feedbackLabels: Record<string, { text: string; color: string }> = {
  USEFUL: { text: '已采纳', color: 'green' },
  USELESS: { text: '未采纳', color: 'red' },
  PRACTICED: { text: '已实施', color: 'blue' },
};

const Advices: React.FC = () => {
  const [advices, setAdvices] = useState<TeachingAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadAdvices = () => {
    setLoading(true);
    fetchAdvices({ page: 1, pageSize: 50 })
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
      <div className="section-title">教学建议</div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2 }}
        dataSource={advices}
        locale={{ emptyText: '暂无教学建议' }}
        renderItem={(advice) => (
          <List.Item>
            <Card
              title={advice.topic}
              extra={
                advice.feedback ? (
                  <Tag color={feedbackLabels[advice.feedback]?.color}>
                    {feedbackLabels[advice.feedback]?.text}
                  </Tag>
                ) : null
              }
            >
              <div style={{ marginBottom: 12 }}>
                <strong>适用对象：</strong>
                <span style={{ color: '#666' }}>{advice.targetDescription}</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>建议内容：</strong>
                <p style={{ color: '#666', marginTop: 4 }}>{advice.content}</p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>推荐教学活动：</strong>
                <ul style={{ marginTop: 4, paddingLeft: 20, color: '#666' }}>
                  {advice.recommendedActivities.map((act, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>{act}</li>
                  ))}
                </ul>
              </div>

              <div style={{ marginBottom: 12 }}>
                <strong>预期目标：</strong>
                <span style={{ color: '#666' }}>{advice.expectedGoals}</span>
              </div>

              {advice.localCases.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <strong>本地化案例：</strong>
                  <Space wrap style={{ marginTop: 4 }}>
                    {advice.localCases.map((c, i) => (
                      <Tag key={i} color="purple">{c}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              <div style={{ color: '#999', fontSize: 12, marginBottom: 12 }}>
                生成时间：{formatDate(advice.createdAt)}
              </div>

              {!advice.feedback && (
                <Space>
                  <Button
                    size="small"
                    icon={<LikeOutlined />}
                    loading={feedbackLoading}
                    onClick={() => handleFeedback(advice.id, 'USEFUL')}
                  >
                    采纳
                  </Button>
                  <Button
                    size="small"
                    icon={<CloseCircleOutlined />}
                    loading={feedbackLoading}
                    onClick={() => handleFeedback(advice.id, 'USELESS')}
                  >
                    不采纳
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={feedbackLoading}
                    onClick={() => handleFeedback(advice.id, 'PRACTICED')}
                  >
                    已实施
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

export default Advices;
