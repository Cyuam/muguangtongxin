import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Spin, message, Select, Table, Tag, List, Alert, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fetchClassDiagnosis, type ClassDiagnosis, type StudentDiagnosisSummary } from '../services/teacher';
import { extractError } from '../services/api';
import { RiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@muguang/shared';

const ClassDiagnosis: React.FC = () => {
  const navigate = useNavigate();
  const [diagnosis, setDiagnosis] = useState<ClassDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState('demo-class-1');

  useEffect(() => {
    setLoading(true);
    fetchClassDiagnosis(classId)
      .then(setDiagnosis)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [classId]);

  const columns: ColumnsType<StudentDiagnosisSummary> = [
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      sorter: (a, b) => a.totalScore - b.totalScore,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level: string) => (
        <Tag color={RISK_LEVEL_COLORS[level as RiskLevel]}>
          {RISK_LEVEL_LABELS[level as RiskLevel] ?? level}
        </Tag>
      ),
      sorter: (a, b) => {
        const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, NONE: 4 };
        return (order[a.riskLevel] ?? 5) - (order[b.riskLevel] ?? 5);
      },
    },
    {
      title: '薄弱维度',
      dataIndex: 'weakDimensions',
      key: 'weakDimensions',
      render: (dims: string[]) => (
        <Space wrap>
          {dims.map((d) => (
            <Tag key={d} color="orange">{d}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <a onClick={() => navigate(`/teacher/diagnosis/student/${record.studentId}`)}>
          查看详情
        </a>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">班级诊断</div>
        <Select
          value={classId}
          onChange={setClassId}
          style={{ width: 200 }}
          options={[
            { label: '三年级一班', value: 'demo-class-1' },
            { label: '三年级二班', value: 'demo-class-2' },
          ]}
        />
      </div>

      {diagnosis && (
        <>
          {/* 整体画像 */}
          <Card title="班级整体画像" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#999' }}>整体风险：</span>
                <Tag color={RISK_LEVEL_COLORS[diagnosis.overallProfile.overallRisk as RiskLevel]}>
                  {RISK_LEVEL_LABELS[diagnosis.overallProfile.overallRisk as RiskLevel]}
                </Tag>
              </div>
              <div>
                <span style={{ color: '#999' }}>法治认知风险：</span>
                <Tag color={RISK_LEVEL_COLORS[diagnosis.overallProfile.lawRisk as RiskLevel]}>
                  {RISK_LEVEL_LABELS[diagnosis.overallProfile.lawRisk as RiskLevel]}
                </Tag>
              </div>
              <div>
                <span style={{ color: '#999' }}>心理状态风险：</span>
                <Tag color={RISK_LEVEL_COLORS[diagnosis.overallProfile.psychologyRisk as RiskLevel]}>
                  {RISK_LEVEL_LABELS[diagnosis.overallProfile.psychologyRisk as RiskLevel]}
                </Tag>
              </div>
              <div>
                <span style={{ color: '#999' }}>测评参与率：</span>
                <span style={{ fontWeight: 'bold' }}>
                  {diagnosis.totalStudents > 0
                    ? `${Math.round((diagnosis.assessedStudents / diagnosis.totalStudents) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
            {diagnosis.overallProfile.factors.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <strong>风险因素：</strong>
                <Space wrap style={{ marginTop: 4 }}>
                  {diagnosis.overallProfile.factors.map((f) => (
                    <Tag key={f} color="red">{f}</Tag>
                  ))}
                </Space>
              </div>
            )}
          </Card>

          {/* 薄弱点列表 */}
          <Card title="班级薄弱点" style={{ marginBottom: 16 }}>
            {diagnosis.weakPoints.length > 0 ? (
              <List
                dataSource={diagnosis.weakPoints}
                renderItem={(wp, idx) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {idx + 1}. {wp.dimension}
                        </span>
                        <Tag color={wp.score < wp.threshold ? 'red' : 'green'}>
                          得分：{wp.score} / 阈值：{wp.threshold}
                        </Tag>
                      </div>
                      <div style={{ color: '#666', marginTop: 4 }}>{wp.description}</div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>暂无薄弱点数据</div>
            )}
          </Card>

          {/* 共性高风险提示 */}
          {diagnosis.weakPoints.some((wp) => wp.score < wp.threshold) && (
            <Alert
              type="warning"
              message="重点关注提示"
              description="班级中存在共性高风险薄弱点，建议查看教学建议并采取针对性教学措施。"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 学生列表 */}
          <Card title="学生列表">
            <Table
              columns={columns}
              dataSource={diagnosis.students}
              rowKey="studentId"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: '暂无学生数据' }}
            />
          </Card>
        </>
      )}
    </Spin>
  );
};

export default ClassDiagnosis;
