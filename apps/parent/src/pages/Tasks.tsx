import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, List, Tag, Spin, Button, message, Space, Modal } from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatDate } from '@muguang/shared';
import { fetchTasks, verifyTask } from '../services/parent';
import { extractError } from '../services/api';
import type { ParentTask } from '@muguang/shared';

const categoryLabels: Record<string, string> = {
  LAW_STUDY: '法治共学',
  EMOTION: '情感交流',
  LIFE_PRACTICE: '生活实践',
};

const categoryColors: Record<string, string> = {
  LAW_STUDY: 'blue',
  EMOTION: 'pink',
  LIFE_PRACTICE: 'green',
};

const statusLabels: Record<string, { text: string; color: string }> = {
  PUBLISHED: { text: '待完成', color: 'orange' },
  COMPLETED: { text: '已完成', color: 'blue' },
  VERIFIED: { text: '已验收', color: 'green' },
};

const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ParentTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const loadTasks = () => {
    setLoading(true);
    fetchTasks({ page: 1, pageSize: 50 })
      .then((res) => setTasks(res.items))
      .catch((err) => message.error(extractError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleVerify = (taskId: string) => {
    Modal.confirm({
      title: '确认验收',
      content: '验收通过后，将向儿童发放对应积分奖励。确认验收吗？',
      okText: '确认验收',
      cancelText: '取消',
      onOk: () => {
        setVerifying(true);
        verifyTask(taskId)
          .then(() => {
            message.success('验收成功，积分已发放');
            loadTasks();
          })
          .catch((err) => message.error(extractError(err)))
          .finally(() => setVerifying(false));
      },
    });
  };

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="section-title">亲子任务</div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/parent/tasks/create')}>
          发起任务
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2 }}
        dataSource={tasks}
        locale={{ emptyText: '暂无亲子任务' }}
        renderItem={(task) => {
          const statusInfo = statusLabels[task.status] ?? { text: task.status, color: 'default' };
          return (
            <List.Item>
              <Card
                title={
                  <Space>
                    <Tag color={categoryColors[task.category]}>
                      {categoryLabels[task.category] ?? task.category}
                    </Tag>
                    {task.title}
                  </Space>
                }
                extra={<Tag color={statusInfo.color}>{statusInfo.text}</Tag>}
              >
                <p style={{ color: '#666', marginBottom: 12 }}>{task.description}</p>
                <div style={{ marginBottom: 8 }}>
                  <Tag color="gold">积分奖励：{task.pointsReward}</Tag>
                </div>
                <div style={{ color: '#999', fontSize: 12, marginBottom: 12 }}>
                  发布时间：{formatDate(task.publishedAt)}
                  {task.completedAt && ` | 完成时间：${formatDate(task.completedAt)}`}
                </div>
                {task.status === 'COMPLETED' && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={verifying}
                    onClick={() => handleVerify(task.id)}
                  >
                    验收
                  </Button>
                )}
              </Card>
            </List.Item>
          );
        }}
      />
    </Spin>
  );
};

export default Tasks;
