/** 地块详情 - 历史种植记录标签页：展示该地块的所有种植记录 */
import { Button, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import type { PlantingRecord } from '../../../../shared/types/database'

interface FieldPlantingRecordsTabProps {
  plantingRecords: PlantingRecord[]
}

export function FieldPlantingRecordsTab({ plantingRecords }: FieldPlantingRecordsTabProps): React.JSX.Element {
  const navigate = useNavigate()

  const columns: ColumnsType<PlantingRecord> = [
    { title: '年份 / 季节', key: 'season', render: (_, record) => `${record.year} / ${record.season}` },
    { title: '播种日期', dataIndex: 'plantingDate', key: 'plantingDate' },
    { title: '预计收获日期', dataIndex: 'expectedHarvestDate', key: 'expectedHarvestDate', render: (v) => v ?? '-' },
    { title: '状态', key: 'status', render: (_, record) => <Tag>{record.status}</Tag> },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/experimental-data/${record.id}`)}>
            查看详情
          </Button>
        </Space>
      )
    }
  ]

  return <Table rowKey="id" columns={columns} dataSource={plantingRecords} pagination={false} />
}
