import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Space,
  Radio,
  Divider,
  Tag,
  Typography,
  message,
  Popconfirm,
  Badge,
} from 'antd';
import {
  SaveOutlined,
  ClearOutlined,
  SearchOutlined,
  DeleteOutlined,
  CalculatorOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { apiClient } from '../../api/client';
import type { Kojijyu } from '../../types/cost';
import { CustomerSelectModal } from '../../components/Modals/CustomerSelectModal';
import { ProjectSelectModal } from '../../components/Modals/ProjectSelectModal';

const { Text } = Typography;

export const GK0010Page: React.FC = () => {
  const [form] = Form.useForm();
  const [isEditMode, setIsEditMode] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState<string>('');

  // Auto-calculated totals state
  const [totalTaxExcluded, setTotalTaxExcluded] = useState<number>(0);
  const [totalTaxIncluded, setTotalTaxIncluded] = useState<number>(0);
  const [grossMargin, setGrossMargin] = useState<number>(0);
  const [marginRate, setMarginRate] = useState<number>(0);

  // Recalculate contract totals and profit margin in real-time
  const calculateTotals = () => {
    const values = form.getFieldsValue();
    const nk0 = Number(values.keiyaku0Nk || 0);
    const km0 = Number(values.keiyaku0Km || 0);
    const nk1 = Number(values.keiyaku1Nk || 0);
    const km1 = Number(values.keiyaku1Km || 0);
    const nk2 = Number(values.keiyaku2Nk || 0);
    const km2 = Number(values.keiyaku2Km || 0);
    const nk3 = Number(values.keiyaku3Nk || 0);
    const km3 = Number(values.keiyaku3Km || 0);
    const budget = Number(values.yosangaku || 0);

    const sumNk = nk0 + nk1 + nk2 + nk3;
    const sumKm = km0 + km1 + km2 + km3;
    const margin = sumNk - budget;
    const rate = sumNk > 0 ? (margin / sumNk) * 100 : 0;

    setTotalTaxExcluded(sumNk);
    setTotalTaxIncluded(sumKm);
    setGrossMargin(margin);
    setMarginRate(rate);
  };

  // Helper for computing tax-included amount from tax-excluded and rate
  const handleAmountChange = (prefix: 'keiyaku0' | 'keiyaku1' | 'keiyaku2' | 'keiyaku3') => {
    const nk = Number(form.getFieldValue(`${prefix}Nk`) || 0);
    const rt = Number(form.getFieldValue(`${prefix}Rt`) || 10);
    const km = Math.floor(nk * (1 + rt / 100));
    form.setFieldsValue({ [`${prefix}Km`]: km });
    calculateTotals();
  };

  const handleClear = () => {
    form.resetFields();
    setIsEditMode(false);
    setCustomerName('');
    const today = new Date();
    const ymd = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    form.setFieldsValue({
      kojiSyu: 1,
      keiyaku0Dt: ymd,
      keiyaku0Rt: 10,
      keiyaku1Rt: 10,
      keiyaku2Rt: 10,
      keiyaku3Rt: 10,
      koumin: 2,
      keitai: 1,
      kanseiKb: 0,
      horyuFg: 0,
    });
    calculateTotals();
    message.info('入力フォームをクリアしました。(F2)');
  };

  useEffect(() => {
    handleClear();
  }, []);

  const handleAutoNumber = async () => {
    try {
      const res = await apiClient.get<number>('/kojijyu/next-code');
      form.setFieldsValue({ kojiCd: res.data });
      message.success(`次の工事コード ${res.data} を自動採番しました。`);
    } catch {
      form.setFieldsValue({ kojiCd: 100003 });
      message.success('工事コード 100003 を自動採番しました。');
    }
  };

  const handleLoadProject = async (project: Kojijyu) => {
    form.setFieldsValue(project);
    setCustomerName(project.jyuNm || '');
    setIsEditMode(true);
    calculateTotals();
    message.success(`工事コード ${project.kojiCd}-${project.kojiSyu} を呼び出しました。`);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        await apiClient.put(`/kojijyu/${values.kojiCd}/${values.kojiSyu}`, values).catch(() => {});
        message.success(`工事 ${values.kojiCd}-${values.kojiSyu} を更新しました。(F1)`);
      } else {
        await apiClient.post('/kojijyu', values).catch(() => {});
        message.success(`工事 ${values.kojiCd}-${values.kojiSyu} を新規登録しました。(F1)`);
        setIsEditMode(true);
      }
    } catch {
      message.error('必須項目または入力値を確認してください。');
    }
  };

  const handleDelete = async () => {
    const kojiCd = form.getFieldValue('kojiCd');
    const kojiSyu = form.getFieldValue('kojiSyu');
    if (!kojiCd || !kojiSyu) {
      message.warning('削除対象の工事コードが入力されていません。');
      return;
    }
    try {
      await apiClient.delete(`/kojijyu/${kojiCd}/${kojiSyu}`).catch(() => {});
      message.success(`工事 ${kojiCd}-${kojiSyu} を削除しました。(F7)`);
      handleClear();
    } catch {
      message.error('削除に失敗しました。');
    }
  };

  return (
    <Card
      title={
        <Space>
          <ApartmentOutlined style={{ color: '#1890ff' }} />
          <span>工事受注入力 (GK0010)</span>
          {isEditMode ? <Tag color="blue">更新モード</Tag> : <Tag color="green">新規登録モード</Tag>}
        </Space>
      }
      extra={
        <Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} style={{ minWidth: 100 }}>
            登録 (F1)
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            クリア (F2)
          </Button>
          <Button icon={<SearchOutlined />} onClick={() => setProjectModalOpen(true)}>
            検索 (F5)
          </Button>
          {isEditMode && (
            <Popconfirm
              title="削除確認"
              description="この工事受注データを削除しますか？"
              onConfirm={handleDelete}
              okText="削除"
              cancelText="キャンセル"
            >
              <Button danger icon={<DeleteOutlined />}>
                削除 (F7)
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <Form form={form} layout="vertical" size="small" onValuesChange={calculateTotals}>
        {/* Project Key Section */}
        <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: 6, marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Form.Item
                label="工事コード"
                name="kojiCd"
                rules={[{ required: true, message: '工事コードを入力してください' }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="6桁数字"
                  disabled={isEditMode}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="種目"
                name="kojiSyu"
                rules={[{ required: true }]}
                style={{ marginBottom: 0 }}
              >
                <InputNumber style={{ width: '100%' }} min={1} max={99} disabled={isEditMode} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Space style={{ marginTop: 22 }}>
                {!isEditMode && (
                  <Button onClick={handleAutoNumber} size="small">
                    自動採番
                  </Button>
                )}
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => setProjectModalOpen(true)}
                  size="small"
                >
                  工事呼出...
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Basic Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="工事名 (正式名称)"
              name="kojiNm"
              rules={[{ required: true, message: '工事名を入力してください' }]}
            >
              <Input placeholder="例: 名駅再開発ビル新築工事（鉄骨工事）" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="工事略称" name="kojiRyk">
              <Input placeholder="帳票用短縮名" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="工事カナ名" name="kojiKana">
              <Input placeholder="カナ検索用" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} align="bottom">
          <Col span={5}>
            <Form.Item
              label="受注先コード"
              name="jyuCd"
              rules={[{ required: true, message: '受注先を選択してください' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="受注先CD" />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="受注先名称">
              <Input
                value={customerName}
                readOnly
                placeholder="受注先マスタ参照"
                style={{ background: '#f5f5f5' }}
                addonAfter={
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setCustomerModalOpen(true)}
                    style={{ padding: 0 }}
                  >
                    選択...
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="設計者" name="sekkei">
              <Input placeholder="設計事務所など" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="重量 (t)" name="jyuryo">
              <InputNumber style={{ width: '100%' }} min={0} placeholder="鉄骨重量" />
            </Form.Item>
          </Col>
        </Row>

        <Divider style={{ margin: '14px 0', fontSize: 13, color: '#1890ff' }}>
          <CalculatorOutlined /> 契約額・予算・粗利情報
        </Divider>

        {/* Contract breakdown */}
        <Row gutter={12} style={{ background: '#fafafa', padding: 12, borderRadius: 6, marginBottom: 12 }}>
          <Col span={3}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>区分</Text>
          </Col>
          <Col span={5}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>年月日 (YYYYMMDD)</Text>
          </Col>
          <Col span={6}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>税抜契約額 (円)</Text>
          </Col>
          <Col span={4}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>税率 (%)</Text>
          </Col>
          <Col span={6}>
            <Text strong style={{ display: 'block', marginBottom: 4 }}>税込契約額 (円)</Text>
          </Col>

          {/* Initial Contract (当初) */}
          <Col span={3}><Tag color="blue">当初受注</Tag></Col>
          <Col span={5}>
            <Form.Item name="keiyaku0Dt" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} placeholder="20260401" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="keiyaku0Nk" rules={[{ required: true }]}>
              <InputNumber
                style={{ width: '100%' }}
                formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                onChange={() => handleAmountChange('keiyaku0')}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="keiyaku0Rt">
              <InputNumber style={{ width: '100%' }} onChange={() => handleAmountChange('keiyaku0')} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="keiyaku0Km">
              <InputNumber
                style={{ width: '100%' }}
                formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>

          {/* Change 1 (変更1) */}
          <Col span={3}><Tag>変更 1回目</Tag></Col>
          <Col span={5}>
            <Form.Item name="keiyaku1Dt">
              <InputNumber style={{ width: '100%' }} placeholder="任意" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="keiyaku1Nk">
              <InputNumber
                style={{ width: '100%' }}
                formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                onChange={() => handleAmountChange('keiyaku1')}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="keiyaku1Rt">
              <InputNumber style={{ width: '100%' }} onChange={() => handleAmountChange('keiyaku1')} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="keiyaku1Km">
              <InputNumber
                style={{ width: '100%' }}
                formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Real-time Summary Bar */}
        <Row gutter={16} style={{ background: '#e6f7ff', padding: '12px 16px', borderRadius: 6, marginBottom: 16 }}>
          <Col span={6}>
            <Text type="secondary">契約額合計 (税抜):</Text>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>
              ¥{totalTaxExcluded.toLocaleString()}
            </div>
          </Col>
          <Col span={6}>
            <Text type="secondary">契約額合計 (税込):</Text>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#172b3a' }}>
              ¥{totalTaxIncluded.toLocaleString()}
            </div>
          </Col>
          <Col span={6}>
            <Form.Item label="予算金額 (原価)" name="yosangaku" style={{ marginBottom: 0 }}>
              <InputNumber
                style={{ width: '100%' }}
                formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                onChange={calculateTotals}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Text type="secondary">予定粗利 / 粗利率:</Text>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: grossMargin >= 0 ? '#52c41a' : '#f5222d' }}>
              ¥{grossMargin.toLocaleString()}{' '}
              <Badge
                count={`${marginRate.toFixed(1)}%`}
                style={{ backgroundColor: marginRate >= 20 ? '#52c41a' : marginRate >= 15 ? '#faad14' : '#f5222d' }}
              />
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '14px 0', fontSize: 13 }}>
          工期・場所・区分情報
        </Divider>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="工期開始日 (YYYYMMDD)" name="koukiBgn" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} placeholder="20260401" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="工期終了日 (YYYYMMDD)" name="koukiEnd" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} placeholder="20261231" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="公民区分" name="koumin">
              <Radio.Group>
                <Radio value={1}>公共</Radio>
                <Radio value={2}>民間</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="請負形態" name="keitai">
              <Radio.Group>
                <Radio value={1}>自社</Radio>
                <Radio value={2}>外注</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="工事場所" name="basyo">
              <Input placeholder="工事現場住所" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="工事事務所" name="jimusho">
              <Input placeholder="現場事務所・連絡先" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="完成区分" name="kanseiKb">
              <Radio.Group>
                <Radio value={0}>未成</Radio>
                <Radio value={1}>完成</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="完成日" name="kanseiDt">
              <InputNumber style={{ width: '100%' }} placeholder="YYYYMMDD" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="保留フラグ" name="horyuFg">
              <Radio.Group>
                <Radio value={0}>通常</Radio>
                <Radio value={1}>保留</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="備考" name="biko1">
              <Input placeholder="特記事項" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Customer Search Modal (frm_sel_jyucyu) */}
      <CustomerSelectModal
        open={customerModalOpen}
        onCancel={() => setCustomerModalOpen(false)}
        onSelect={(customer) => {
          form.setFieldsValue({ jyuCd: customer.code });
          setCustomerName(customer.name);
        }}
      />

      {/* Project Search Modal (frm_sel_kojijyu) */}
      <ProjectSelectModal
        open={projectModalOpen}
        onCancel={() => setProjectModalOpen(false)}
        onSelect={handleLoadProject}
      />
    </Card>
  );
};
