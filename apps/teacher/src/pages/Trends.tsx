import React, { useEffect, useState, useMemo } from 'react';
import { Card, Spin, Select, Empty } from 'antd';
import { fetchTrends, type TrendPoint } from '../services/teacher';
import { RiskLevel, RISK_LEVEL_COLORS } from '@muguang/shared';

/** 简易折线图（SVG 实现） */
const LineChart: React.FC<{ data: TrendPoint[] }> = ({ data }) => {
  const width = 800;
  const height = 400;
  const padding = 60;

  const dimensions = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.dimension)));
  }, [data]);

  const dates = useMemo(() => {
    return Array.from(new Set(data.map((d) => d.date)));
  }, [data]);

  if (data.length === 0) return <Empty description="暂无趋势数据" />;

  const maxX = dates.length > 1 ? dates.length - 1 : 1;
  const maxY = 100;

  const xScale = (i: number) => padding + (i / maxX) * (width - 2 * padding);
  const yScale = (v: number) => height - padding - (v / maxY) * (height - 2 * padding);

  const colors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1'];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: width }}>
      {/* Y 轴 */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d9d9d9" />
      {/* X 轴 */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d9d9d9" />

      {/* Y 轴刻度 */}
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={padding}
            y1={yScale(v)}
            x2={width - padding}
            y2={yScale(v)}
            stroke="#f0f0f0"
          />
          <text x={padding - 8} y={yScale(v) + 4} textAnchor="end" fontSize={12} fill="#999">
            {v}
          </text>
        </g>
      ))}

      {/* X 轴刻度 */}
      {dates.map((date, i) => (
        <text key={date} x={xScale(i)} y={height - padding + 20} textAnchor="middle" fontSize={12} fill="#999">
          {date}
        </text>
      ))}

      {/* 折线 */}
      {dimensions.map((dim, dimIdx) => {
        const dimData = data.filter((d) => d.dimension === dim);
        const points = dimData
          .map((d) => {
            const xIdx = dates.indexOf(d.date);
            return `${xScale(xIdx)},${yScale(d.score)}`;
          })
          .join(' ');
        const color = colors[dimIdx % colors.length];
        return (
          <g key={dim}>
            <polyline points={points} fill="none" stroke={color} strokeWidth={2} />
            {dimData.map((d) => {
              const xIdx = dates.indexOf(d.date);
              return (
                <circle
                  key={`${d.date}-${d.dimension}`}
                  cx={xScale(xIdx)}
                  cy={yScale(d.score)}
                  r={4}
                  fill={color}
                />
              );
            })}
          </g>
        );
      })}

      {/* 图例 */}
      {dimensions.map((dim, dimIdx) => (
        <g key={`legend-${dim}`}>
          <rect
            x={width - padding + 10}
            y={padding + dimIdx * 24}
            width={12}
            height={12}
            fill={colors[dimIdx % colors.length]}
          />
          <text x={width - padding + 28} y={padding + dimIdx * 24 + 10} fontSize={12} fill="#666">
            {dim}
          </text>
        </g>
      ))}
    </svg>
  );
};

const Trends: React.FC = () => {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState('demo-class-1');

  useEffect(() => {
    setLoading(true);
    fetchTrends({ classId })
      .then(setTrends)
      .catch(() => setTrends([]))
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">薄弱点变化趋势</div>
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

      <Card title="趋势折线图">
        <LineChart data={trends} />
      </Card>

      {trends.length > 0 && (
        <Card title="趋势数据明细" style={{ marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>日期</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>维度</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>得分</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>风险等级</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((t, i) => (
                <tr key={i}>
                  <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>{t.date}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>{t.dimension}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>{t.score}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ color: RISK_LEVEL_COLORS[t.riskLevel as RiskLevel] }}>
                      {t.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Spin>
  );
};

export default Trends;
