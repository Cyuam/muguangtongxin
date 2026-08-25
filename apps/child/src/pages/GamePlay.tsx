import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, Modal } from 'antd';
import { fetchScenarios, createSession, submitChoice, type GameChoiceResponse } from '../services/game';
import { extractError } from '../services/api';
import { GAME_MAX_DURATION_MINUTES } from '@muguang/shared';
import type { GameScenario, GameNode } from '@muguang/shared';

const feedbackBubbleClass: Record<string, string> = {
  POSITIVE: 'feedback-bubble',
  WARNING: 'feedback-bubble warning',
  CORRECTIVE: 'feedback-bubble corrective',
};

const GamePlay: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();

  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [currentNode, setCurrentNode] = useState<GameNode | null>(null);
  const [feedback, setFeedback] = useState<GameChoiceResponse | null>(null);
  const [history, setHistory] = useState<{ prompt: string; feedback?: string; feedbackType?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showRestModal, setShowRestModal] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const hasFetched = useRef(false);

  // 检查游戏时长
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedMin = (Date.now() - startTime) / 60000;
      if (elapsedMin >= GAME_MAX_DURATION_MINUTES) {
        setShowRestModal(true);
        clearInterval(timer);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [startTime]);

  // 初始化
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (!scenarioId) return;
    setLoading(true);
    fetchScenarios()
      .then((scenarios) => {
        const found = scenarios.find((s) => s.id === scenarioId);
        if (!found) throw new Error('游戏场景不存在');
        setScenario(found);
        return createSession(scenarioId);
      })
      .then((sess) => {
        sessionIdRef.current = sess.id;
        // 初始节点由第二个 useEffect 在 scenario 设置后负责初始化
      })
      .catch((err) => {
        message.error(extractError(err));
        navigate('/child/game');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  // 当 scenario 设置后，初始化第一个节点
  useEffect(() => {
    if (scenario && !currentNode) {
      const startNode = scenario.script.nodes[scenario.script.startNode];
      setCurrentNode(startNode);
    }
  }, [scenario, currentNode]);

  const handleChoice = (choiceId: string, _choiceText: string) => {
    if (!sessionIdRef.current || !currentNode) return;
    setSubmitting(true);

    // 记录历史
    setHistory((prev) => [...prev, { prompt: currentNode.prompt }]);

    submitChoice(sessionIdRef.current, choiceId)
      .then((res) => {
        setFeedback(res);
        setHistory((prev) => [
          ...prev.slice(0, -1),
          { prompt: currentNode.prompt, feedback: res.feedback, feedbackType: res.feedbackType },
        ]);

        if (res.isTerminal || !res.nextNode) {
          // 游戏结束
          Modal.success({
            title: '游戏完成！',
            content: res.feedback,
            okText: '返回游戏列表',
            onOk: () => navigate('/child/game'),
          });
        } else {
          setCurrentNode(res.nextNode);
        }
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setSubmitting(false));
  };

  if (loading || !scenario || !currentNode) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: 18 }}>正在加载游戏场景...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="child-title" style={{ textAlign: 'center', margin: '20px 0' }}>
        {scenario.title}
      </h1>

      {/* 对话历史 */}
      {history.map((entry, i) => (
        <div key={i}>
          <div
            className="child-card"
            style={{ background: 'white', padding: 16, marginBottom: 12, borderRadius: 20 }}
          >
            <div style={{ fontSize: 18, lineHeight: 1.6 }}>{entry.prompt}</div>
          </div>
          {entry.feedback && (
            <div className={feedbackBubbleClass[entry.feedbackType ?? 'POSITIVE']}>
              <strong>AI 反馈：</strong>{entry.feedback}
            </div>
          )}
        </div>
      ))}

      {/* 当前情景 */}
      <div
        className="child-card"
        style={{ background: 'white', padding: 24, marginBottom: 16, borderRadius: 20 }}
      >
        <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#ff6b6b' }}>
          情景描述
        </div>
        <div style={{ fontSize: 18, lineHeight: 1.8 }}>{currentNode.scenario}</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 16 }}>
          {currentNode.prompt}
        </div>

        {/* 选择按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentNode.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id, choice.text)}
              disabled={submitting}
              style={{
                padding: '16px 24px',
                fontSize: 20,
                borderRadius: 16,
                border: '3px solid #f0f0f0',
                background: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                color: '#333',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>

      <Spin spinning={submitting} />

      {/* 休息提示弹窗 */}
      <Modal
        open={showRestModal}
        title="休息一下吧！"
        okText="返回首页"
        cancelText="继续游戏"
        onOk={() => navigate('/child')}
        onCancel={() => setShowRestModal(false)}
      >
        <div style={{ fontSize: 18 }}>
          你已经连续游戏超过 {GAME_MAX_DURATION_MINUTES} 分钟了，注意休息保护眼睛哦！
        </div>
      </Modal>
    </div>
  );
};

export default GamePlay;
