import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, Tag, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { fetchScales } from '../services/assessment';
import { extractError } from '../services/api';
import { AGE_GROUP_LABELS, AgeGroup } from '@muguang/shared';
import type { AssessmentScale } from '@muguang/shared';

const categoryLabels: Record<string, string> = {
  LAW_AWARENESS: '法治认知',
  PSYCHOLOGY: '心理状态',
};

const categoryColors: Record<string, string> = {
  LAW_AWARENESS: '#ff6b6b',
  PSYCHOLOGY: '#4ecdc4',
};

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const [scales, setScales] = useState<AssessmentScale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchScales()
      .then(setScales)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  // 按年龄段分组
  const groupedScales = scales.reduce<Record<string, AssessmentScale[]>>((acc, scale) => {
    const key = scale.ageGroup;
    if (!acc[key]) acc[key] = [];
    acc[key].push(scale);
    return acc;
  }, {});

  const ageGroupOrder: AgeGroup[] = [AgeGroup.LOWER, AgeGroup.MIDDLE, AgeGroup.UPPER];

  return (
    <div>
      <h1 className="child-title" style={{ textAlign: 'center', margin: '20px 0' }}>
        选择测评量表
      </h1>
      <Spin spinning={loading}>
        {ageGroupOrder.map((ag) => {
          const groupScales = groupedScales[ag];
          if (!groupScales || groupScales.length === 0) return null;
          return (
            <div key={ag} style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, color: '#666', marginBottom: 12 }}>
                {AGE_GROUP_LABELS[ag]}
              </h2>
              <Row gutter={[16, 16]}>
                {groupScales.map((scale) => (
                  <Col xs={24} sm={12} key={scale.id}>
                    <Card
                      className="child-card"
                      style={{ textAlign: 'center', padding: '12px 0' }}
                      onClick={() => navigate(`/child/assessment/take/${scale.id}`)}
                    >
                      <FileTextOutlined style={{ fontSize: 40, color: categoryColors[scale.category], marginBottom: 12 }} />
                      <div className="child-title" style={{ marginBottom: 8 }}>{scale.title}</div>
                      <Tag color={categoryColors[scale.category]} style={{ fontSize: 14, padding: '4px 12px' }}>
                        {categoryLabels[scale.category] ?? scale.category}
                      </Tag>
                      <div style={{ fontSize: 16, color: '#999', marginTop: 8 }}>
                        共 {scale.questions.length} 题
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}
        {!loading && scales.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', fontSize: 18, marginTop: 40 }}>
            暂无可用的测评量表
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Assessment;
