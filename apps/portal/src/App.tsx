import { useState } from 'react';
import { Card, Form, Input, Button, Radio, message, Typography, Space } from 'antd';
import { SafetyCertificateOutlined, TeamOutlined, BankOutlined, HomeOutlined } from '@ant-design/icons';
import { Role } from '@muguang/shared';
import { authService } from './services/auth';
import './App.css';

const { Title, Text, Paragraph } = Typography;

/** 角色配置 */
const ROLE_CONFIG: Record<Role, { label: string; icon: React.ReactNode; color: string; redirect: string }> = {
  [Role.CHILD]: { label: '儿童端', icon: <SafetyCertificateOutlined />, color: '#f2811f', redirect: '/child/' },
  [Role.PARENT]: { label: '家长端', icon: <HomeOutlined />, color: '#e8b339', redirect: '/parent/' },
  [Role.TEACHER]: { label: '教师端', icon: <TeamOutlined />, color: '#52c41a', redirect: '/teacher/' },
  [Role.COMMUNITY_ADMIN]: { label: '社区后台', icon: <BankOutlined />, color: '#1890ff', redirect: '/admin/' },
  [Role.SYSTEM_ADMIN]: { label: '系统管理', icon: <BankOutlined />, color: '#722ed1', redirect: '/admin/' },
};

export default function App() {
  const [selectedRole, setSelectedRole] = useState<Role>(Role.CHILD);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authService.login({
        phone: values.phone,
        password: values.password,
        role: selectedRole,
      });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      message.success(`欢迎回来，${res.user.name}！`);
      const config = ROLE_CONFIG[selectedRole];
      window.location.href = config.redirect;
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? '登录失败，请检查手机号与密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-app">
      <div className="portal-hero">
        <div className="container">
          <div className="tag">三下乡 · 2026 · 北滘镇</div>
          <h1>沐光童心</h1>
          <div className="subtitle">以法为光，照亮童心</div>
          <p>测评—诊断—干预—追踪闭环 · 家校社协同治理数据中台</p>
        </div>
      </div>

      <div className="container portal-content">
        <Card className="login-card" bordered={false}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
            统一身份登录
          </Title>

          <div className="role-selector">
            <Text strong>请选择身份：</Text>
            <Radio.Group
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ marginTop: 12, width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {([Role.CHILD, Role.PARENT, Role.TEACHER, Role.COMMUNITY_ADMIN] as Role[]).map((role) => {
                  const config = ROLE_CONFIG[role];
                  return (
                    <Radio key={role} value={role} className="role-radio">
                      <span style={{ color: config.color, marginRight: 8 }}>{config.icon}</span>
                      {config.label}
                    </Radio>
                  );
                })}
              </Space>
            </Radio.Group>
          </div>

          <Form form={form} layout="vertical" onFinish={handleLogin} style={{ marginTop: 24 }}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
              ]}
            >
              <Input placeholder="请输入手机号" size="large" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少 6 位' }]}
            >
              <Input.Password placeholder="请输入密码" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                登录
              </Button>
            </Form.Item>
          </Form>

          <Paragraph type="secondary" style={{ textAlign: 'center', fontSize: 13, marginTop: 16 }}>
            首次使用请联系教师或社区管理员创建账号
          </Paragraph>
        </Card>

        <div className="portal-features">
          <Card title="儿童端" size="small">
            <Text type="secondary">分龄测评 · AI 情景模拟游戏 · 积分激励</Text>
          </Card>
          <Card title="家长端" size="small">
            <Text type="secondary">风险预警报告 · 远程监护建议 · 亲子任务</Text>
          </Card>
          <Card title="教师端" size="small">
            <Text type="secondary">班级知识薄弱点诊断 · 精准教学建议生成</Text>
          </Card>
          <Card title="社区后台" size="small">
            <Text type="secondary">数据看板 · 治理报告输出 · 家校社协同</Text>
          </Card>
        </div>
      </div>

      <footer className="portal-footer">
        <div className="container">
          沐光童心 · 以法为光，照亮童心 · 2026 三下乡社会实践 · 北滘镇
        </div>
      </footer>
    </div>
  );
}
