import { useQuery } from '@tanstack/react-query';
import { statisticsApi, StatisticsItem } from '../api/statistics';

const PROCESSES = ['平车', '三线', '四线', '五线', '坎车', '三针五线'];

export default function StatisticsPage() {
  const { data: statisticsData, isLoading } = useQuery<StatisticsItem[]>({
    queryKey: ['statistics'],
    queryFn: () => statisticsApi.getAll(),
  });

  const statistics: StatisticsItem[] = statisticsData || [];

  // 按服装种类分组
  const groupedByGarmentType = statistics.reduce((acc: Record<string, StatisticsItem[]>, item: StatisticsItem) => {
    if (!acc[item.garmentType]) {
      acc[item.garmentType] = [];
    }
    acc[item.garmentType].push(item);
    return acc;
  }, {} as Record<string, StatisticsItem[]>);

  if (isLoading) {
    return <div className="container">加载中...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>统计数据</h1>

      {Object.keys(groupedByGarmentType).length === 0 ? (
        <div className="card">
          <p>暂无统计数据</p>
        </div>
      ) : (
        Object.entries(groupedByGarmentType).map(([garmentType, items]: [string, StatisticsItem[]]) => (
          <div key={garmentType} className="card" style={{ marginBottom: '24px' }}>
            <h2 className="card-title" style={{ color: '#007bff', marginBottom: '16px' }}>
              {garmentType}
            </h2>
            <div style={{ overflow: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>属性</th>
                    <th>订单数量</th>
                    <th>单件平均线费（元）</th>
                    {PROCESSES.map((process) => (
                      <th key={process}>{process}平均测量数据（米）</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: StatisticsItem, index: number) => (
                    <tr key={index}>
                      <td>{item.attribute}</td>
                      <td>{item.orderCount}</td>
                      <td style={{ fontWeight: 'bold', color: '#007bff' }}>
                        {item.averageSingleCost.toFixed(2)}
                      </td>
                      {PROCESSES.map((process) => (
                        <td key={process}>
                          {item.averageMeasurements[process] !== undefined
                            ? item.averageMeasurements[process].toFixed(2)
                            : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

