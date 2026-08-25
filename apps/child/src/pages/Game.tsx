import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spin, Tag, message } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { fetchScenarios } from '../services/game';
import { extractError } from '../services/api';
import type { GameScenario, GameTheme } from '@muguang/shared';

const themeLabels: Record<GameTheme, string> = {
  BULLYING: '校园欺凌',
  CYBERSECURITY: '网络安全',
  SELF_PROTECTION: '自我保护',
  EMOTION: '情绪管理',
};

const themeColors: Record<GameTheme, string> = {
  BULLYING: '#ff6b6b',
  CYBERSECURITY: '#1677ff',
  SELF_PROTECTION: '#52c41a',
  EMOTION: '#ffa940',
};

const Game: React.FC = () => {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<GameScenario[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchScenarios()
      .then(setScenarios)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="child-title" style={{ textAlign: 'center', margin: '20px 0' }}>
        情景游戏
      </h1>
      <div style={{ fontSize: 18, color: '#999', textAlign: 'center', marginBottom: 20 }}>
        在趣味情景中学习自我保护知识
      </div>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {scenarios.map((scenario) => (
            <Col xs={24} sm={12} key={scenario.id}>
              <Card
                className="child-card"
                style={{ textAlign: 'center', padding: '12px 0' }}
                onClick={() => navigate(`/child/game/play/${scenario.id}`)}
              >
                <RocketOutlined
                  style={{
                    fontSize: 48,
                    color: themeColors[scenario.theme],
                    marginBottom: 12,
                  }}
                />
                <div className="child-title" style={{ marginBottom: 8 }}>
                  {scenario.title}
                </div>
                <Tag
                  color={themeColors[scenario.theme]}
                  style={{ fontSize: 14, padding: '4px 12px' }}
                >
                  {themeLabels[scenario.theme]}
                </Tag>
              </Card>
            </Col>
          ))}
        </Row>
        {!loading && scenarios.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', fontSize: 18, marginTop: 40 }}>
            暂无可用游戏场景
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Game;
