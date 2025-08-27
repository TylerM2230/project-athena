import { BarChart3, PieChart, LineChart } from 'lucide-react';

export function Insights() {
  const insightTypes = [
    {
      title: 'Market Analysis',
      description: 'Deep dive into market trends and opportunities',
      icon: BarChart3,
      metrics: { accuracy: '94%', coverage: '87%', freshness: '2h ago' }
    },
    {
      title: 'Competitive Intelligence', 
      description: 'Track competitor activities and strategic moves',
      icon: PieChart,
      metrics: { accuracy: '91%', coverage: '92%', freshness: '4h ago' }
    },
    {
      title: 'Performance Analytics',
      description: 'Monitor KPIs and strategic performance indicators',
      icon: LineChart,
      metrics: { accuracy: '96%', coverage: '89%', freshness: '1h ago' }
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Strategic Insights</h1>
        <p className="text-gray-600 mt-2">
          AI-powered insights to drive your strategic decision making
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insightTypes.map((insight) => {
          const Icon = insight.icon;
          return (
            <div key={insight.title} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <Icon className="h-8 w-8 text-athena-500" />
                <h2 className="text-xl font-semibold text-gray-900 ml-3">{insight.title}</h2>
              </div>
              
              <p className="text-gray-600 mb-6">{insight.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Accuracy</span>
                  <span className="font-medium">{insight.metrics.accuracy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-medium">{insight.metrics.coverage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium">{insight.metrics.freshness}</span>
                </div>
              </div>
              
              <button className="btn-primary w-full mt-6">
                View Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Placeholder for charts/visualizations */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Insight Trends</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Interactive charts and visualizations will be displayed here</p>
        </div>
      </div>
    </div>
  );
}