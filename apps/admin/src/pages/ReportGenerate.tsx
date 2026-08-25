import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, DatePicker, Checkbox, Button, message, Space, Divider } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined } from '@ant-design/icons';
import { generateReport } from '../services/admin';
import { extractError } from '../services/api';

const { RangePicker } = DatePicker;

const contentModuleOptions = [
  { label: '辖区儿童法治教育整体情况', value: 'overview' },
  { label: '风险干预进展', value: 'riskIntervention' },
  { label: '家校社协同成效', value: 'collabEffectiveness' },
  { label: '存在问题', value: 'issues' },
  { label: '本地化分析与建议', value: 'localAnalysis' },
];

const ReportGenerate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const { dateRange, ...rest } = values;
      const payload = {
        ...rest,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };
      await generateReport(payload);
      message.success('治理报告生成成功！');
      navigate('/admin/reports');
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/reports')}>
          返回报告列表
        </Button>
      </Space>

      <Card title="生成治理报告">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            period: 'WEEKLY',
            contentModules: ['overview', 'riskIntervention', 'collabEffectiveness', 'issues', 'localAnalysis'],
            jurisdiction: 'beijiao',
          }}
        >
          <Form.Item
            name="period"
            label="报告周期"
            rules={[{ required: true, message: '请选择报告周期' }]}
          >
            <Select
              options={[
                { label: '周报', value: 'WEEKLY' },
                { label: '月报', value: 'MONTHLY' },
                { label: '学期报', value: 'TERM' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="报告时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="jurisdiction"
            label="辖区"
            rules={[{ required: true, message: '请选择辖区' }]}
          >
            <Select
              options={[
                { label: '北滘镇', value: 'beijiao' },
                { label: '碧江村', value: 'bijiao_village' },
                { label: '沙墩村', value: 'shadun_village' },
                { label: '临江村', value: 'linjiang_village' },
                { label: '新城社区', value: 'xincheng_community' },
                { label: '碧波社区', value: 'bibo_community' },
              ]}
            />
          </Form.Item>

          <Divider>报告内容选择</Divider>

          <Form.Item
            name="contentModules"
            label="包含内容模块"
            rules={[{ required: true, message: '请至少选择一个内容模块' }]}
          >
            <Checkbox.Group options={contentModuleOptions} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<FileTextOutlined />}
                loading={submitting}
                onClick={handleSubmit}
              >
                生成报告
              </Button>
              <Button size="large" onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReportGenerate;
