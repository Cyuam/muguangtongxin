import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message, Modal } from 'antd';
import { fetchScales, createSession, submitAnswer, completeSession } from '../services/assessment';
import { extractError } from '../services/api';
import type { AssessmentScale, AssessmentSession } from '@muguang/shared';

const AssessmentTake: React.FC = () => {
  const { scaleId } = useParams<{ scaleId: string }>();
  const navigate = useNavigate();

  const [scale, setScale] = useState<AssessmentScale | null>(null);
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 初始化：获取量表 + 创建会话
  useEffect(() => {
    if (!scaleId) return;
    setLoading(true);
    fetchScales()
      .then((scales) => {
        const found = scales.find((s) => s.id === scaleId);
        if (!found) throw new Error('量表不存在');
        setScale(found);
        return createSession(scaleId).then((sess) => {
          setSession(sess);
          // 恢复已有作答（断点续测）
          if (sess.answers) {
            setAnswers(sess.answers);
            const answeredCount = Object.keys(sess.answers).length;
            setCurrentIdx(Math.min(answeredCount, found.questions.length - 1));
          }
          return sess;
        });
      })
      .catch((err) => {
        message.error(extractError(err));
        navigate('/child/assessment');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaleId]);

  // 自动保存
  const autoSave = useCallback(
    (newAnswers: Record<string, string>) => {
      if (!session) return;
      submitAnswer(session.id, newAnswers).catch(() => {
        // 静默失败，不打断答题
      });
    },
    [session],
  );

  if (loading || !scale || !session) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: 18 }}>正在准备题目...</div>
      </div>
    );
  }

  const totalQuestions = scale.questions.length;
  const question = scale.questions[currentIdx];
  const progress = ((currentIdx + 1) / totalQuestions) * 100;

  const handleSelectOption = (optionId: string) => {
    const newAnswers = { ...answers, [question.id]: optionId };
    setAnswers(newAnswers);
    autoSave(newAnswers);

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // 最后一题，提示完成
      Modal.confirm({
        title: '确认提交',
        content: '你已完成所有题目，确认提交测评吗？',
        okText: '确认提交',
        cancelText: '再检查一下',
        onOk: () => handleComplete(newAnswers),
      });
    }
  };

  const handleComplete = (finalAnswers: Record<string, string>) => {
    if (!session) return;
    setSubmitting(true);
    // 先保存最终作答
    submitAnswer(session.id, finalAnswers)
      .then(() => completeSession(session.id))
      .then((result) => {
        message.success('测评完成！');
        navigate(`/child/assessment/result/${result.id}`);
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setSubmitting(false));
  };

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  return (
    <div>
      {/* 进度条 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>
            第 {currentIdx + 1} / {totalQuestions} 题
          </span>
          <span style={{ fontSize: 18, color: '#999' }}>{Math.round(progress)}%</span>
        </div>
        <div className="child-progress">
          <div className="child-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 题目 */}
      <div
        className="child-card"
        style={{ background: 'white', padding: 24, marginBottom: 16, borderRadius: 20 }}
      >
        <h2 className="child-title" style={{ marginBottom: 20, lineHeight: 1.6 }}>
          {question.stem}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                style={{
                  padding: '16px 24px',
                  fontSize: 20,
                  borderRadius: 16,
                  border: isSelected ? '3px solid #ff6b6b' : '3px solid #f0f0f0',
                  background: isSelected ? '#fff5f5' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  color: '#333',
                }}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button
          size="large"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          style={{ fontSize: 18, borderRadius: 16, padding: '8px 24px' }}
        >
          上一题
        </Button>
        <Spin spinning={submitting} />
      </div>
    </div>
  );
};

export default AssessmentTake;
