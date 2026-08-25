import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, message, Tag, Descriptions, List, Table, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { fetchStudentDiagnosis, type StudentDiagnosisDetail } from '../services/teacher';
import { extractError } from '../services/api';
import { RiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, formatDateTime } from '@muguang/shared';

const StudentDiagnosis: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<StudentDiagnosisDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (!studentId) return;
    setLoading(true);
    fetchStudentDiagnosis(studentId)
      .then(setDetail)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading || !detail) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  const resultColumns: ColumnsType<StudentDiagnosisDetail['recentResults'][0]> = [
    { title: '测评时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => formatDateTime(v) },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore' },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level: string) => (
        <Tag color={RISK_LEVEL_COLORS[level as RiskLevel]}>
          {RISK_LEVEL_LABELS[level as RiskLevel] ?? level}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teacher/diagnosis')}>
          返回班级诊断
        </Button>
      </Space>

      <Card title={`学生诊断 - ${detail.studentName}`} style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="诊断范围">
            {detail.diagnosis.scope}
          </Descriptions.Item>
          <Descriptions.Item label="整体风险">
            <Tag color={RISK_LEVEL_COLORS[detail.diagnosis.riskProfile.overallRisk as RiskLevel]}>
              {RISK_LEVEL_LABELS[detail.diagnosis.riskProfile.overallRisk as RiskLevel]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="法治认知风险">
            <Tag color={RISK_LEVEL_COLORS[detail.diagnosis.riskProfile.lawRisk as RiskLevel]}>
              {RISK_LEVEL_LABELS[detail.diagnosis.riskProfile.lawRisk as RiskLevel]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="心理状态风险">
            <Tag color={RISK_LEVEL_COLORS[detail.diagnosis.riskProfile.psychologyRisk as RiskLevel]}>
              {RISK_LEVEL_LABELS[detail.diagnosis.riskProfile.psychologyRisk as RiskLevel]}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="薄弱点" style={{ marginBottom: 16 }}>
        {detail.diagnosis.weakPoints.length > 0 ? (
          <List
            dataSource={detail.diagnosis.weakPoints}
            renderItem={(wp, idx) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>{idx + 1}. {wp.dimension}</span>
                    <Tag color={wp.score < wp.threshold ? 'red' : 'green'}>
                      {wp.score} / {wp.threshold}
                    </Tag>
                  </div>
                  <div style={{ color: '#666', marginTop: 4 }}>{wp.description}</div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div style={{ color: '#999', textAlign: 'center' }}>暂无薄弱点</div>
        )}
      </Card>

      <Card title="近期测评记录">
        <Table
          columns={resultColumns}
          dataSource={detail.recentResults}
          rowKey="resultId"
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: '暂无测评记录' }}
        />
      </Card>
    </div>
  );
};

export default StudentDiagnosis;
