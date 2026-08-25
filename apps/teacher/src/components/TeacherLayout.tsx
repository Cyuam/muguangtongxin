import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  HomeOutlined,
  BarChartOutlined,
  LineChartOutlined,
  BulbOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/auth';
import { ROLE_LABELS } from '@muguang/shared';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/teacher', icon: <HomeOutlined />, label: '首页' },
  { key: '/teacher/diagnosis', icon: <BarChartOutlined />, label: '班级诊断' },
  { key: '/teacher/trends', icon: <LineChartOutlined />, label: '趋势分析' },
  { key: '/teacher/advices', icon: <BulbOutlined />, label: '教学建议' },
  { key: '/teacher/profile', icon: <UserOutlined />, label: '我的' },
];

const TeacherLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const activeKey = menuItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '/teacher';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 48,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '沐光' : '沐光童心 · 教师端'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'white',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            欢迎，{user?.name ?? '老师'}
          </span>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'role',
                  label: `角色：${user ? ROLE_LABELS[user.role] : ''}`,
                  disabled: true,
                },
                { type: 'divider' as const },
                {
                  key: 'logout',
                  label: '退出登录',
                  icon: <LogoutOutlined />,
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
              <span>{user?.name ?? '老师'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <div className="page-container" style={{ background: 'white', borderRadius: 8, minHeight: 'calc(100vh - 160px)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherLayout;
