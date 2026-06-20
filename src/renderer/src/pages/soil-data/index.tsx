/** 土壤数据管理页面：管理地块土壤属性与检测数据 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Field } from '../../../../shared/types/database'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchFields } from '../../store/slices/fields.slice'

interface SoilDataRecord {
  id: number
  fieldId: number
  fieldName: string
  soilType: string | null
  soilPh: number | null
  soilOrganicMatter: number | null
  samplingDate: string
  notes: string | null
}

export function SoilDataPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const fieldsState = useAppSelector((state) => state.fields)
  const [messageApi, contextHolder] = message.useMessage()
  const [keyword, setKeyword] = useState('')
  const [soilTypeFilter, setSoilTypeFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchFields())
  }, [dispatch])

  const soilDataRecords: SoilDataRecord[] = useMemo(() => {
    return fieldsState.items
      .filter((field) => field.soilType || field.soilPh != null || field.soilOrganicMatter != null)
      .map((field) => ({
        id: field.id,
        fieldId: field.id,
        fieldName: field.name,
        soilType: field.soilType,
        soilPh: field.soilPh,
        soilOrganicMatter: field.soilOrganicMatter,
        samplingDate: field.updatedAt,
        notes: field.notes
      }))
  }, [fieldsState.items])

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return soilDataRecords.filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [item.fieldName, item.soilType, item.notes]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword))

      const matchesSoilType = !soilTypeFilter || item.soilType === soilTypeFilter

      return matchesKeyword && matchesSoilType
    })
  }, [soilDataRecords, keyword, soilTypeFilter])

  const soilTypeOptions = useMemo(
    () =>
      Array.from(new Set(soilDataRecords.map((item) => item.soilType).filter(Boolean))).map(
        (value) => ({ label: value, value })
      ),
    [soilDataRecords]
  )

  const columns: ColumnsType<SoilDataRecord> = useMemo(
    () => [
      {
        title: '地块名称',
        dataIndex: 'fieldName',
        key: 'fieldName',
        render: (text, record) => (
          <Button type="link" onClick={() => navigate(`/fields/${record.fieldId}`)}>
            {text}
          </Button>
        )
      },
      {
        title: '土壤类型',
        dataIndex: 'soilType',
        key: 'soilType',
        render: (v: string | null) => v ?? '-'
      },
      {
        title: '土壤 pH',
        dataIndex: 'soilPh',
        key: 'soilPh',
        render: (v: number | null) => (v != null ? v.toFixed(2) : '-')
      },
      {
        title: '有机质含量 (g/kg)',
        dataIndex: 'soilOrganicMatter',
        key: 'soilOrganicMatter',
        render: (v: number | null) => (v != null ? v.toFixed(2) : '-')
      },
      {
        title: '采样日期',
        dataIndex: 'samplingDate',
        key: 'samplingDate'
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => navigate(`/fields/${record.fieldId}`)}>
              查看详情
            </Button>
          </Space>
        )
      }
    ],
    [navigate]
  )

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      {contextHolder}
      <div className="page-header">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            土壤数据管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            管理地块土壤属性与检测数据,支持土壤类型、pH值、有机质含量等信息维护,为栽培决策提供土壤依据。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">筛选后 {filteredItems.length} / 共 {soilDataRecords.length} 条</Tag>
          <Button type="primary" onClick={() => navigate('/fields')}>
            管理地块
          </Button>
        </Space>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索地块名称、土壤类型、备注"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="按土壤类型筛选"
          value={soilTypeFilter}
          onChange={setSoilTypeFilter}
          options={soilTypeOptions}
          style={{ width: 180 }}
        />
      </div>

      <Table rowKey="id" loading={fieldsState.loading} columns={columns} dataSource={filteredItems} />
    </Space>
  )
}
