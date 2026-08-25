import React, { useEffect, useState } from 'react';
import { Card, Spin, Tabs, List, Tag, Avatar, message } from 'antd';
import {
  TrophyOutlined as TrophyIcon,
  CrownOutlined,
  MedalOutlined,
  FireOutlined,
} from '@ant-design/icons';
import {
  fetchBalance,
  fetchLedger,
  fetchLeaderboard,
  fetchAchievements,
  type LeaderboardEntry,
} from '../services/points';
import { extractError } from '../services/api';
import { formatDate } from '@muguang/shared';
import type { PointLedger, Achievement } from '@muguang/shared';

const sourceLabels: Record<string, string> = {
  ASSESSMENT: '测评',
  GAME: '游戏',
  TASK: '亲子任务',
  REDEEM: '兑换',
};

const sourceColors: Record<string, string> = {
  ASSESSMENT: 'blue',
  GAME: 'green',
  TASK: 'orange',
  REDEEM: 'red',
};

const rankIcons: React.ReactNode[] = [
  <CrownOutlined style={{ color: '#faad14', fontSize: 24 }} />,
  <MedalOutlined style={{ color: '#8c8c8c', fontSize: 24 }} />,
  <MedalOutlined style={{ color: '#d48806', fontSize: 24 }} />,
];

const Points: React.FC = () => {
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBalance().catch(() => ({ balance: 0 })),
      fetchLedger().catch(() => ({ items: [] as PointLedger[], total: 0, page: 1, pageSize: 20 })),
      fetchLeaderboard().catch(() => ({ entries: [] as LeaderboardEntry[], myRank: 0, myPoints: 0 })),
      fetchAchievements().catch(() => [] as Achievement[]),
    ])
      .then(([bal, led, lb, ach]) => {
        setBalance(bal.balance);
        setLedger(led.items);
        setLeaderboard(lb.entries);
        setMyRank(lb.myRank);
        setAchievements(ach);
      })
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="child-title" style={{ textAlign: 'center', margin: '20px 0' }}>
        我的积分
      </h1>

      <Spin spinning={loading}>
        {/* 积分余额 */}
        <Card className="child-card" style={{ textAlign: 'center', marginBottom: 16, borderRadius: 20, background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)' }}>
          <TrophyIcon style={{ fontSize: 48, color: '#ffa940', marginBottom: 8 }} />
          <div style={{ fontSize: 20, color: '#666' }}>当前积分</div>
          <div style={{ fontSize: 56, fontWeight: 'bold', color: '#fa8c16' }}>{balance}</div>
          <div style={{ fontSize: 16, color: '#999', marginTop: 8 }}>
            我的排名：第 {myRank} 名
          </div>
        </Card>

        <Tabs
          defaultActiveKey="ledger"
          items={[
            {
              key: 'ledger',
              label: '积分流水',
              children: (
                <List
                  dataSource={ledger}
                  locale={{ emptyText: '暂无积分记录' }}
                  renderItem={(item) => (
                    <List.Item style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <Tag color={sourceColors[item.source]} style={{ fontSize: 14 }}>
                            {sourceLabels[item.source] ?? item.source}
                          </Tag>
                          <span style={{ fontSize: 18, marginLeft: 8 }}>{item.description}</span>
                          <div style={{ fontSize: 14, color: '#999', marginTop: 4 }}>
                            {formatDate(item.createdAt)}
                          </div>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: item.amount > 0 ? '#52c41a' : '#ff4d4f' }}>
                          {item.amount > 0 ? '+' : ''}{item.amount}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'leaderboard',
              label: '排行榜',
              children: (
                <List
                  dataSource={leaderboard}
                  locale={{ emptyText: '暂无排行数据' }}
                  renderItem={(item) => (
                    <List.Item style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                        <div style={{ width: 40, textAlign: 'center' }}>
                          {item.rank <= 3 ? rankIcons[item.rank - 1] : <span style={{ fontSize: 20 }}>{item.rank}</span>}
                        </div>
                        <Avatar src={item.avatarUrl} size={40}>
                          {item.userName[0]}
                        </Avatar>
                        <span style={{ fontSize: 18, flex: 1 }}>{item.userName}</span>
                        <span style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>
                          {item.totalPoints}
                        </span>
                      </div>
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'badges',
              label: '徽章墙',
              children: (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                  {achievements.length === 0 && (
                    <div style={{ color: '#999', fontSize: 18, padding: 40 }}>暂无徽章，继续努力获取吧！</div>
                  )}
                  {achievements.map((ach) => (
                    <Card
                      key={ach.id}
                      className="child-card"
                      style={{ width: 120, textAlign: 'center', borderRadius: 20, background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)' }}
                    >
                      <FireOutlined style={{ fontSize: 40, color: '#722ed1' }} />
                      <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 8 }}>
                        {ach.badgeName}
                      </div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {formatDate(ach.awardedAt)}
                      </div>
                    </Card>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default Points;
