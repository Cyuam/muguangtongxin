import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, RocketOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'home', label: '首页', icon: <HomeOutlined />, path: '/child' },
  { key: 'assessment', label: '测评', icon: <FileTextOutlined />, path: '/child/assessment' },
  { key: 'game', label: '游戏', icon: <RocketOutlined />, path: '/child/game' },
  { key: 'points', label: '积分', icon: <TrophyOutlined />, path: '/child/points' },
  { key: 'profile', label: '我的', icon: <UserOutlined />, path: '/child/profile' },
];

const ChildLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const activeKey = navItems.find((item) => location.pathname.startsWith(item.path))?.key ?? 'home';

  return (
    <div className="child-content">
      {children}
      <div className="child-tabbar">
        {navItems.map((item) => (
          <div
            key={item.key}
            className={`child-tabbar-item ${activeKey === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChildLayout;
