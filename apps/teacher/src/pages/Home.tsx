import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Spin, message, Select, Button } from 'antd';
import { TeamOutlined, FileSearchOutlined, AlertOutlined, BulbOutlined } from '@ant-design/icons';
import { fetchClassDiagnosis, type ClassDiagnosis } from '../services/teacher';
import { extractError } from '../services/api';
import { RiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_COLORS } from '@muguang/shared';

const Home: React.FC = () => {
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

  const riskDistribution = diagnosis?.overallProfile ?? {
    overallRisk: RiskLevel.NONE,
    lawRisk: RiskLevel.NONE,
    psychologyRisk: RiskLevel.NONE,
    factors: [],
  };

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">班级概览</div>
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

      <Row gutter={16}>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/teacher/diagnosis')}>
            <Statistic
              title="班级总人数"
              value={diagnosis?.totalStudents ?? 0}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/teacher/diagnosis')}>
            <Statistic
              title="已测评人数"
              value={diagnosis?.assessedStudents ?? 0}
              prefix={<FileSearchOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/teacher/diagnosis')}>
            <Statistic
              title="整体风险等级"
              value={RISK_LEVEL_LABELS[riskDistribution.overallRisk as RiskLevel]}
              prefix={<AlertOutlined style={{ color: RISK_LEVEL_COLORS[riskDistribution.overallRisk as RiskLevel] }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card hoverable onClick={() => navigate('/teacher/advices')}>
            <Statistic
              title="教学建议"
              value={diagnosis?.weakPoints.length ?? 0}
              prefix={<BulbOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="快速操作" style={{ marginTop: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              icon={<FileSearchOutlined />}
              onClick={() => navigate('/teacher/diagnosis')}
              style={{ marginBottom: 8 }}
            >
              查看班级诊断
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              icon={<BulbOutlined />}
              onClick={() => navigate('/teacher/advices')}
              style={{ marginBottom: 8 }}
            >
              查看教学建议
            </Button>
          </Col>
          <Col xs={24} sm={8}>
            <Button
              block
              size="large"
              icon={<AlertOutlined />}
              onClick={() => navigate('/teacher/trends')}
            >
              查看趋势分析
            </Button>
          </Col>
        </Row>
      </Card>
    </Spin>
  );
};

export default Home;
