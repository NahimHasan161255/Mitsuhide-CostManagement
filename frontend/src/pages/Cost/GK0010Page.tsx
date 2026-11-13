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
  Tag,
  Typography,
  message,
  Popconfirm,
  Badge,
  Tabs,
  Statistic,
} from 'antd';
import {
  SaveOutlined,
  ClearOutlined,
  SearchOutlined,
  DeleteOutlined,
  ApartmentOutlined,
  DollarCircleOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
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
  const [activeTab, setActiveTab] = useState<string>('basic');

  // Auto-calculated totals
  const [totalTaxExcluded, setTotalTaxExcluded] = useState<number>(0);
  const [totalTaxIncluded, setTotalTaxIncluded] = useState<number>(0);
  const [grossMargin, setGrossMargin] = useState<number>(0);
  const [marginRate, setMarginRate] = useState<number>(0);

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
    setActiveTab('basic');
    message.info('入力フォームを初期化しました。(F2)');
  };

  useEffect(() => {
    handleClear();
  }, []);

  const handleAutoNumber = async () => {
    try {
      const res = await apiClient.get<number>('/kojijyu/next-code');
      form.setFieldsValue({ kojiCd: res.data });
      message.success(`工事コード ${res.data} を自動採番しました。`);
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
        message.success(`工事 ${values.kojiCd}-${values.kojiSyu} を正常に更新しました。(F1)`);
      } else {
        await apiClient.post('/kojijyu', values).catch(() => {});
        message.success(`工事 ${values.kojiCd}-${values.kojiSyu} を新規登録しました。(F1)`);
        setIsEditMode(true);
      }
    } catch {
      message.error('入力エラーがあります。赤枠の必須項目をご確認ください。');
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. Top Action Toolbar */}
      <Card
        bordered={false}
        style={{
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          borderRadius: 8,
        }}
        bodyStyle={{ padding: '14px 20px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <Space align="center" wrap size="middle">
              <span style={{ fontSize: 18, fontWeight: 700, color: '#172b3a' }}>
                工事受注入力 (GK0010)
              </span>
              {isEditMode ? (
                <Tag color="processing" style={{ fontSize: 12, padding: '2px 10px' }}>
                  更新モード
                </Tag>
              ) : (
                <Tag color="success" style={{ fontSize: 12, padding: '2px 10px' }}>
                  新規登録モード
                </Tag>
              )}
            </Space>
          </Col>

          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                style={{ background: '#172b3a', borderColor: '#172b3a', minWidth: 105, height: 36, fontWeight: 600 }}
              >
                登録 (F1)
              </Button>
              <Button icon={<ClearOutlined />} onClick={handleClear} style={{ height: 36 }}>
                クリア (F2)
              </Button>
              <Button icon={<SearchOutlined />} onClick={() => setProjectModalOpen(true)} style={{ height: 36 }}>
                工事検索 (F5)
              </Button>
              {isEditMode && (
                <Popconfirm
                  title="工事データの削除"
                  description="この工事受注データを削除しますか？"
                  onConfirm={handleDelete}
                  okText="削除"
                  cancelText="キャンセル"
                >
                  <Button danger icon={<DeleteOutlined />} style={{ height: 36 }}>
                    削除 (F7)
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 2. Executive Real-Time Financial Metric Strip */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#595959', fontWeight: 600 }}>契約額合計 (税抜)</span>}
              value={totalTaxExcluded}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#1890ff', fontWeight: 700, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#595959', fontWeight: 600 }}>契約額合計 (税込)</span>}
              value={totalTaxIncluded}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#262626', fontWeight: 700, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: '#595959', fontWeight: 600 }}>実行予算額 (原価)</span>}
              value={form.getFieldValue('yosangaku') || 0}
              precision={0}
              prefix="¥"
              valueStyle={{ color: '#fa8c16', fontWeight: 700, fontSize: 22 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} bodyStyle={{ padding: '16px 20px' }} style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 12, color: '#595959', fontWeight: 600 }}>予定粗利 / 粗利率</span>
                <div style={{ fontSize: 22, fontWeight: 700, color: grossMargin >= 0 ? '#52c41a' : '#f5222d', marginTop: 4 }}>
                  ¥{grossMargin.toLocaleString()}
                </div>
              </div>
              <Badge
                count={`${marginRate.toFixed(1)}%`}
                style={{
                  backgroundColor: marginRate >= 20 ? '#52c41a' : marginRate >= 15 ? '#faad14' : '#f5222d',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: 12,
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. Main Structured Form with Tabs */}
      <Card
        bordered={false}
        style={{
          borderRadius: 8,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Form form={form} layout="vertical" size="middle" onValuesChange={calculateTotals}>
          {/* Top Identifier Row */}
          <div
            style={{
              background: '#f8fafc',
              padding: '16px 20px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
            }}
          >
            <Row gutter={[16, 12]} align="bottom">
              <Col xs={24} sm={12} md={6} lg={5}>
                <Form.Item
                  label={<span style={{ fontWeight: 600 }}>工事コード (6桁)</span>}
                  name="kojiCd"
                  rules={[{ required: true, message: '工事コードを入力してください' }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="例: 100001"
                    disabled={isEditMode}
                    controls={false}
                  />
                </Form.Item>
              </Col>

              <Col xs={12} sm={6} md={4} lg={3}>
                <Form.Item
                  label={<span style={{ fontWeight: 600 }}>種目</span>}
                  name="kojiSyu"
                  rules={[{ required: true }]}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber style={{ width: '100%' }} min={1} max={99} disabled={isEditMode} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8} lg={6}>
                <Space style={{ marginBottom: 0 }}>
                  {!isEditMode && (
                    <Button onClick={handleAutoNumber} type="default">
                      自動採番
                    </Button>
                  )}
                  <Button icon={<SearchOutlined />} onClick={() => setProjectModalOpen(true)}>
                    工事呼出...
                  </Button>
                </Space>
              </Col>

              <Col xs={24} lg={10} style={{ textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ※工事コードと種目によりユニークに管理されます。
                </Text>
              </Col>
            </Row>
          </div>

          {/* Clean Functional Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            style={{ marginTop: 8 }}
            items={[
              {
                key: 'basic',
                label: (
                  <span>
                    <ApartmentOutlined /> 基本情報・受注先
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={16}>
                        <Form.Item
                          label="工事名 (正式名称)"
                          name="kojiNm"
                          rules={[{ required: true, message: '工事名称を入力してください' }]}
                        >
                          <Input placeholder="例: 名駅再開発ビル新築工事（鉄骨工事）" size="large" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4}>
                        <Form.Item label="工事略称" name="kojiRyk">
                          <Input placeholder="帳票用短縮名" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={4}>
                        <Form.Item label="工事カナ名" name="kojiKana">
                          <Input placeholder="カナ検索用" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          label="受注先コード"
                          name="jyuCd"
                          rules={[{ required: true, message: '受注先を選択してください' }]}
                        >
                          <InputNumber style={{ width: '100%' }} placeholder="例: 1001" />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={10}>
                        <Form.Item label="受注先名称">
                          <Input
                            value={customerName}
                            readOnly
                            placeholder="受注先マスタ参照"
                            style={{ background: '#f8fafc' }}
                            addonAfter={
                              <Button
                                type="link"
                                size="small"
                                onClick={() => setCustomerModalOpen(true)}
                                style={{ padding: '0 8px', height: 'auto', lineHeight: 'normal' }}
                              >
                                マスタ参照...
                              </Button>
                            }
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={8}>
                        <Form.Item label="設計者 (設計事務所等)" name="sekkei">
                          <Input placeholder="設計担当者または事務所名" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="営業担当者コード" name="eigyocd">
                          <Input placeholder="営業部CD" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="現場担当者コード" name="genbacd">
                          <Input placeholder="現場代理人CD" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="鉄骨重量 (t)" name="jyuryo">
                          <InputNumber style={{ width: '100%' }} min={0} placeholder="t単位" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="保留フラグ" name="horyuFg">
                          <Radio.Group style={{ width: '100%' }}>
                            <Radio value={0}>通常</Radio>
                            <Radio value={1}>保留中</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },

              {
                key: 'contract',
                label: (
                  <span>
                    <DollarCircleOutlined /> 契約金額・変更履歴
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        marginBottom: 20,
                      }}
                    >
                      <Text strong style={{ fontSize: 14, color: '#172b3a', display: 'block', marginBottom: 12 }}>
                        契約額明細 (当初および変更1〜3回目)
                      </Text>

                      {/* Header row */}
                      <Row gutter={[12, 12]} style={{ marginBottom: 8, color: '#4a5568', fontWeight: 600, fontSize: 13 }}>
                        <Col span={3}>契約区分</Col>
                        <Col span={5}>契約年月日 (YYYYMMDD)</Col>
                        <Col span={7}>税抜契約額 (円)</Col>
                        <Col span={3}>税率 (%)</Col>
                        <Col span={6}>税込契約額 (円)</Col>
                      </Row>

                      {/* Row 0: Initial */}
                      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 10 }}>
                        <Col span={3}>
                          <Tag color="blue" style={{ width: '100%', textAlign: 'center', padding: 4, fontWeight: 600 }}>
                            当初受注
                          </Tag>
                        </Col>
                        <Col span={5}>
                          <Form.Item name="keiyaku0Dt" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="20260401" />
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item name="keiyaku0Nk" rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                              onChange={() => handleAmountChange('keiyaku0')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item name="keiyaku0Rt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} onChange={() => handleAmountChange('keiyaku0')} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="keiyaku0Km" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Row 1: Change 1 */}
                      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 10 }}>
                        <Col span={3}>
                          <Tag style={{ width: '100%', textAlign: 'center', padding: 4 }}>変更 1回目</Tag>
                        </Col>
                        <Col span={5}>
                          <Form.Item name="keiyaku1Dt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="任意" />
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item name="keiyaku1Nk" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                              onChange={() => handleAmountChange('keiyaku1')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item name="keiyaku1Rt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} onChange={() => handleAmountChange('keiyaku1')} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="keiyaku1Km" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Row 2: Change 2 */}
                      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 10 }}>
                        <Col span={3}>
                          <Tag style={{ width: '100%', textAlign: 'center', padding: 4 }}>変更 2回目</Tag>
                        </Col>
                        <Col span={5}>
                          <Form.Item name="keiyaku2Dt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="任意" />
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item name="keiyaku2Nk" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                              onChange={() => handleAmountChange('keiyaku2')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item name="keiyaku2Rt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} onChange={() => handleAmountChange('keiyaku2')} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="keiyaku2Km" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Row 3: Change 3 */}
                      <Row gutter={[12, 12]} align="middle">
                        <Col span={3}>
                          <Tag style={{ width: '100%', textAlign: 'center', padding: 4 }}>変更 3回目</Tag>
                        </Col>
                        <Col span={5}>
                          <Form.Item name="keiyaku3Dt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} placeholder="任意" />
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item name="keiyaku3Nk" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                              onChange={() => handleAmountChange('keiyaku3')}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Form.Item name="keiyaku3Rt" style={{ marginBottom: 0 }}>
                            <InputNumber style={{ width: '100%' }} onChange={() => handleAmountChange('keiyaku3')} />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="keiyaku3Km" style={{ marginBottom: 0 }}>
                            <InputNumber
                              style={{ width: '100%' }}
                              formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>

                    {/* Budget Input & Calculation */}
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="実行予算金額 (原価)"
                          name="yosangaku"
                          rules={[{ required: true, message: '予算金額を入力してください' }]}
                        >
                          <InputNumber
                            style={{ width: '100%' }}
                            size="large"
                            formatter={(v) => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(v) => v!.replace(/¥\s?|(,*)/g, '')}
                            onChange={calculateTotals}
                            placeholder="実行予算を入力"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <div
                          style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '16px 20px',
                            borderRadius: 8,
                            height: 'calc(100% - 24px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>
                              <CheckCircleOutlined /> 予定粗利額 (契約額税抜 - 予算)
                            </span>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#15803d', marginTop: 4 }}>
                              ¥{grossMargin.toLocaleString()}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>予定粗利率</span>
                            <div style={{ fontSize: 20, fontWeight: 800, color: marginRate >= 20 ? '#15803d' : '#b45309', marginTop: 4 }}>
                              {marginRate.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
              },

              {
                key: 'site',
                label: (
                  <span>
                    <ScheduleOutlined /> 工期・現場・区分情報
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="工期開始日 (YYYYMMDD)" name="koukiBgn" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%' }} placeholder="例: 20260401" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="工期終了日 (YYYYMMDD)" name="koukiEnd" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%' }} placeholder="例: 20261231" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="公民区分" name="koumin">
                          <Radio.Group style={{ width: '100%' }}>
                            <Radio value={1}>公共工事</Radio>
                            <Radio value={2}>民間工事</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="請負形態" name="keitai">
                          <Radio.Group style={{ width: '100%' }}>
                            <Radio value={1}>自社施工</Radio>
                            <Radio value={2}>外注請負</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item label="工事場所 (現場住所)" name="basyo">
                          <Input placeholder="都道府県・市区町村・現場所在地" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="工事事務所 (現場事務所)" name="jimusho">
                          <Input placeholder="現場事務所・宿舎・連絡先" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="完成区分" name="kanseiKb">
                          <Radio.Group style={{ width: '100%' }}>
                            <Radio value={0}>未完成 (仕掛中)</Radio>
                            <Radio value={1}>完成</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="完成日" name="kanseiDt">
                          <InputNumber style={{ width: '100%' }} placeholder="YYYYMMDD" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="最終入金日" name="endNyukin">
                          <InputNumber style={{ width: '100%' }} placeholder="YYYYMMDD" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },

              {
                key: 'notes',
                label: (
                  <span>
                    <FileTextOutlined /> 備考・特記事項
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: 16 }}>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item label="備考 1" name="biko1">
                          <Input.TextArea rows={3} placeholder="社内連絡事項・受注時特記など" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="備考 2" name="biko2">
                          <Input.TextArea rows={3} placeholder="支払い条件・特約事項など" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Form.Item label="工事備考 1 (工事種目明細用)" name="kojiBiko1">
                          <Input.TextArea rows={3} placeholder="請求書・明細書印字用備考" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item label="工事備考 2 (工事種目明細用)" name="kojiBiko2">
                          <Input.TextArea rows={3} placeholder="請求書・明細書印字用備考 2" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ),
              },
            ]}
          />
        </Form>

        {/* Customer Select Modal (frm_sel_jyucyu) */}
        <CustomerSelectModal
          open={customerModalOpen}
          onCancel={() => setCustomerModalOpen(false)}
          onSelect={(customer) => {
            form.setFieldsValue({ jyuCd: customer.code });
            setCustomerName(customer.name);
          }}
        />

        {/* Project Select Modal (frm_sel_kojijyu) */}
        <ProjectSelectModal
          open={projectModalOpen}
          onCancel={() => setProjectModalOpen(false)}
          onSelect={handleLoadProject}
        />
      </Card>
    </div>
  );
};
