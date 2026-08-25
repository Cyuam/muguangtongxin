import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Select, InputNumber, Button, message, Space } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { createTask } from '../services/parent';
import { extractError } from '../services/api';
import type { ParentTaskCategory } from '@muguang/shared';

const { TextArea } = Input;

const categoryOptions: { label: string; value: ParentTaskCategory }[] = [
  { label: '法治共学', value: 'LAW_STUDY' },
  { label: '情感交流', value: 'EMOTION' },
  { label: '生活实践', value: 'LIFE_PRACTICE' },
];

const TaskCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await createTask(values);
      message.success('亲子任务发起成功！');
      navigate('/parent/tasks');
    } catch (err) {
      if (err instanceof Error && err.message.includes('validate')) return;
      message.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/parent/tasks')}>
          返回列表
        </Button>
      </Space>

      <Card title="发起亲子任务">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ pointsReward: 30, category: 'LAW_STUDY' }}
        >
          <Form.Item
            name="studentId"
            label="孩子"
            rules={[{ required: true, message: '请选择孩子' }]}
          >
            <Select placeholder="请选择关联的孩子">
              <Select.Option value="demo-student-1">孩子一</Select.Option>
              <Select.Option value="demo-student-2">孩子二</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="如：一起学习未成年人保护法" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea
              placeholder="详细描述任务内容与完成要求"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="任务类别"
            rules={[{ required: true, message: '请选择任务类别' }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>

          <Form.Item
            name="pointsReward"
            label="积分奖励"
            rules={[{ required: true, message: '请输入积分奖励' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={handleSubmit}
              >
                发起任务
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default TaskCreate;
