import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Tag, Button, message } from 'antd';
import { fetchResult } from '../services/assessment';
import { extractError } from '../services/api';
import { RISK_LEVEL_LABELS, RISK_LEVEL_COLORS, RiskLevel } from '@muguang/shared';
import type { AssessmentResult as AssessmentResultType } from '@muguang/shared';

/** 简易雷达图（SVG 实现，无额外依赖） */
const RadarChart: React.FC<{ data: { label: string; value: number; max: number }[] }> = ({ data }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const angleStep = (2 * Math.PI) / data.length;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (d.value / d.max) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const labelPoints = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      x: center + (radius + 30) * Math.cos(angle),
      y: center + (radius + 30) * Math.sin(angle),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {/* 网格圆 */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <circle
          key={ratio}
          cx={center}
          cy={center}
          r={radius * ratio}
          fill="none"
          stroke="#e8e8e8"
          strokeWidth={1}
        />
      ))}
      {/* 轴线 */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="#e8e8e8"
            strokeWidth={1}
          />
        );
      })}
      {/* 数据多边形 */}
      <polygon
        points={polygonPoints}
        fill="rgba(255, 107, 107, 0.3)"
        stroke="#ff6b6b"
        strokeWidth={2}
      />
      {/* 数据点 */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#ff6b6b" />
      ))}
      {/* 标签 */}
      {data.map((d, i) => (
        <text
          key={i}
          x={labelPoints[i].x}
          y={labelPoints[i].y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={14}
          fill="#666"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
};

const AssessmentResult: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AssessmentResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    if (!resultId) return;
    setLoading(true);
    fetchResult(resultId)
      .then(setResult)
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading || !result) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, fontSize: 18 }}>正在生成结果...</div>
      </div>
    );
  }

  const riskColor = RISK_LEVEL_COLORS[result.riskLevel as RiskLevel] ?? '#999';
  const riskLabel = RISK_LEVEL_LABELS[result.riskLevel as RiskLevel] ?? result.riskLevel;

  // 维度雷达图数据
  const radarData = Object.entries(result.dimensionScores).map(([label, value]) => ({
    label,
    value,
    max: 100,
  }));

  return (
    <div>
      <h1 className="child-title" style={{ textAlign: 'center', margin: '20px 0' }}>
        测评结果
      </h1>

      {/* 总分卡片 */}
      <Card className="child-card" style={{ textAlign: 'center', marginBottom: 16, borderRadius: 20 }}>
        <div style={{ fontSize: 20, color: '#666', marginBottom: 8 }}>总分</div>
        <div style={{ fontSize: 48, fontWeight: 'bold', color: '#ff6b6b' }}>
          {result.totalScore}
        </div>
      </Card>

      {/* 风险等级 */}
      <Card className="child-card" style={{ textAlign: 'center', marginBottom: 16, borderRadius: 20 }}>
        <div style={{ fontSize: 20, color: '#666', marginBottom: 12 }}>风险等级</div>
        <Tag
          color={riskColor}
          style={{ fontSize: 24, padding: '8px 24px', borderRadius: 12 }}
        >
          {riskLabel}
        </Tag>
      </Card>

      {/* 分项得分 */}
      <Card className="child-card" style={{ marginBottom: 16, borderRadius: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>分项得分</div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#666' }}>法治认知</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff6b6b' }}>
              {result.lawScore}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#666' }}>心理状态</div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#4ecdc4' }}>
              {result.psychologyScore}
            </div>
          </div>
        </div>
      </Card>

      {/* 维度雷达图 */}
      {radarData.length > 0 && (
        <Card className="child-card" style={{ marginBottom: 16, borderRadius: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
            各维度得分
          </div>
          <RadarChart data={radarData} />
        </Card>
      )}

      {/* 薄弱维度提示 */}
      {result.detail.weakDimensions.length > 0 && (
        <Card className="child-card" style={{ marginBottom: 16, borderRadius: 20, background: '#fff7e6' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>需要加强的方面</div>
          {result.detail.weakDimensions.map((dim) => (
            <Tag key={dim} color="orange" style={{ fontSize: 16, padding: '4px 12px', marginBottom: 8 }}>
              {dim}
            </Tag>
          ))}
        </Card>
      )}

      {/* 擅长维度 */}
      {result.detail.strongDimensions.length > 0 && (
        <Card className="child-card" style={{ marginBottom: 16, borderRadius: 20, background: '#f6ffed' }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>做得好的方面</div>
          {result.detail.strongDimensions.map((dim) => (
            <Tag key={dim} color="green" style={{ fontSize: 16, padding: '4px 12px', marginBottom: 8 }}>
              {dim}
            </Tag>
          ))}
        </Card>
      )}

      <Button
        type="primary"
        size="large"
        block
        style={{ fontSize: 20, borderRadius: 16, height: 56 }}
        onClick={() => navigate('/child/assessment')}
      >
        返回测评列表
      </Button>
    </div>
  );
};

export default AssessmentResult;
