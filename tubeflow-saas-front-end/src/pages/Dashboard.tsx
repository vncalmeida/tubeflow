import React, { useState, useEffect } from 'react';
import { Video, CheckCircle, Users, Youtube, Bell, Activity, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { API_URL } from '../config';

interface RecentActivity {
  id: number;
  message: string;
  time: string;
}

function Dashboard() {
  const [stats, setStats] = useState({
    videosInProgress: 0,
    videosCompleted: 0,
    activeFreelancers: 0,
    managedChannels: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isUser, setIsUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
        const userId = localStorage.getItem(isFreelancer ? 'userId' : 'userIdA');
        const isAdmin = !isFreelancer;
        const companyId = localStorage.getItem('companyId');
        setIsUser(isAdmin);
        const response = await fetch(`${API_URL}/api/dashboard?userId=${userId}&isUser=${isAdmin ? 1 : 0}&companyId=${companyId}`);
        const data = await response.json();
        setStats(data.stats);
        setRecentActivities(data.recentActivities);
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Vídeos em Andamento', value: stats.videosInProgress, icon: Video, iconBg: 'bg-red-600', bgColor: 'bg-white dark:bg-black' },
    { title: 'Vídeos Concluídos', value: stats.videosCompleted, icon: CheckCircle, iconBg: 'bg-red-500', bgColor: 'bg-white dark:bg-black' }
  ];

  if (isUser) {
    statCards.push(
      { title: 'Freelancers Ativos', value: stats.activeFreelancers, icon: Users, iconBg: 'bg-red-600', bgColor: 'bg-white dark:bg-black' },
      { title: 'Canais Gerenciados', value: stats.managedChannels, icon: Youtube, iconBg: 'bg-red-700', bgColor: 'bg-white dark:bg-black' }
    );
  }

  const gridClasses = isUser ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8' : 'grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8';

  const StatCard = ({ card }: { card: typeof statCards[0] }) => (
    <div className={`${card.bgColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-white/10 p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${card.iconBg} shadow-sm`}>
          <card.icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600 dark:text-white/70">{card.title}</p>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLoading ? <span className="inline-block h-9 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" /> : card.value}
          </p>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }: { activity: RecentActivity }) => (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl">
            <Clock className="w-4 h-4 text-gray-600 dark:text-white/70" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-white">{activity.message}</p>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-white/60 font-medium">{activity.time}</span>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-red-600 rounded-full" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-white/70 ml-5">Acompanhe suas métricas e atividades em tempo real</p>
        </div>
        <div className={gridClasses}>
          {statCards.map((card, index) => (
            <StatCard key={index} card={card} />
          ))}
        </div>
        <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-600 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Atividades Recentes</h2>
                  <p className="text-sm text-gray-500 dark:text-white/60 mt-1">Últimas atualizações do sistema</p>
                </div>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/10 max-h-96 overflow-y-auto">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                      </div>
                      <div className="w-16 h-6 bg-gray-200 dark:bg-white/10 rounded-full" />
                    </div>
                  </div>
                ))
              : recentActivities.length > 0
              ? recentActivities.map((activity) => <ActivityItem key={activity.id} activity={activity} />)
              : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-gray-400 dark:text-white/60" />
                  </div>
                  <p className="text-gray-500 dark:text-white/70 font-medium">Nenhuma atividade recente</p>
                  <p className="text-sm text-gray-400 dark:text-white/60 mt-1">As atividades aparecerão aqui quando disponíveis</p>
                </div>
              )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
