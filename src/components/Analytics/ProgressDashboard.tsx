import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  Flame, 
  Droplets, 
  Activity, 
  Weight, 
  Heart,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  TrendingDown,
  ChevronRight,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowUp,
  ArrowDown,
  User,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProgressData {
  date: string;
  weight: number;
  calories: number;
  water: number;
  steps: number;
  workouts: number;
  sleep: number;
  heartRate: number;
}

interface WeightData {
  date: string;
  weight: number;
  change: number;
}

interface WeeklyStats {
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
  avgHeartRate: number;
  weightChange: number;
  streakDays: number;
  fitnessScore: number;
  improvement: number;
}

export const ProgressDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '3months' | 'year'>('week');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get user name from profile or default
  const userName = profile?.name || "Jane Smith";
  
  // Mock weight tracking data (daily for the past 2 weeks)
  const weightData: WeightData[] = [
    { date: '2024-02-26', weight: 162.4, change: 0 },
    { date: '2024-02-27', weight: 162.1, change: -0.3 },
    { date: '2024-02-28', weight: 161.8, change: -0.3 },
    { date: '2024-02-29', weight: 161.5, change: -0.3 },
    { date: '2024-03-01', weight: 161.2, change: -0.3 },
    { date: '2024-03-02', weight: 160.9, change: -0.3 },
    { date: '2024-03-03', weight: 160.6, change: -0.3 },
    { date: '2024-03-04', weight: 160.3, change: -0.3 },
    { date: '2024-03-05', weight: 160.0, change: -0.3 },
    { date: '2024-03-06', weight: 159.7, change: -0.3 },
    { date: '2024-03-07', weight: 159.4, change: -0.3 },
    { date: '2024-03-08', weight: 159.1, change: -0.3 },
    { date: '2024-03-09', weight: 158.8, change: -0.3 },
    { date: '2024-03-10', weight: 158.5, change: -0.3 }
  ];

  // Mock progress data
  const progressData: ProgressData[] = [
    { date: '2024-03-01', weight: 159.8, calories: 1520, water: 2.1, steps: 2581, workouts: 1, sleep: 7.5, heartRate: 72 },
    { date: '2024-03-02', weight: 159.4, calories: 1680, water: 2.3, steps: 3200, workouts: 0, sleep: 8.0, heartRate: 68 },
    { date: '2024-03-03', weight: 158.9, calories: 1750, water: 2.0, steps: 4100, workouts: 1, sleep: 7.2, heartRate: 75 },
    { date: '2024-03-04', weight: 158.5, calories: 1620, water: 2.5, steps: 2800, workouts: 1, sleep: 8.5, heartRate: 70 },
    { date: '2024-03-05', weight: 158.1, calories: 1580, water: 2.2, steps: 3500, workouts: 0, sleep: 7.8, heartRate: 73 },
    { date: '2024-03-06', weight: 157.6, calories: 1720, water: 2.4, steps: 4200, workouts: 1, sleep: 8.2, heartRate: 69 },
    { date: '2024-03-07', weight: 157.2, calories: 1650, water: 2.1, steps: 3800, workouts: 1, sleep: 7.9, heartRate: 71 }
  ];

  const weeklyStats: WeeklyStats = {
    totalWorkouts: 5,
    totalCalories: 11520,
    totalMinutes: 180,
    avgHeartRate: 71,
    weightChange: -2.6,
    streakDays: 7,
    fitnessScore: 67,
    improvement: 12
  };

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const WelcomeCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-teal-400 to-cyan-500 rounded-3xl p-8 text-white mb-8 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <div className="absolute top-8 right-8 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-16 right-16 w-16 h-16 bg-white rounded-full"></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-teal-100 mb-2">{getGreeting()}, {userName}</p>
          <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-teal-100 mb-6 max-w-md">
            Your personalized health dashboard is ready. Track your progress, 
            achieve your goals, and maintain a healthy lifestyle with AI-powered insights.
          </p>
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <div className="text-sm text-teal-100">Current Goal</div>
              <div className="font-semibold">
                {profile?.health_goals?.[0] || 'Weight Loss'}
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
              <div className="text-sm text-teal-100">Activity Level</div>
              <div className="font-semibold capitalize">
                {profile?.activity_level || 'Moderate'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Illustration */}
        <div className="hidden md:block relative">
          <div className="w-48 h-48 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-24 h-24 text-white opacity-80" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    color, 
    trend, 
    trendValue,
    chart 
  }: {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    chart?: React.ReactNode;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-700' :
            trend === 'down' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {trend === 'up' && <ArrowUp className="w-3 h-3" />}
            {trend === 'down' && <ArrowDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-800">{value}</span>
          {unit && <span className="text-gray-600 text-sm">{unit}</span>}
        </div>
        <p className="text-gray-600 text-sm mt-1">{title}</p>
      </div>
      
      {chart && (
        <div className="h-16">
          {chart}
        </div>
      )}
    </motion.div>
  );

  const WeightTrackingChart = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Weight Tracking</h3>
          <p className="text-gray-600 text-sm">Daily weight progress over time</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Weight (lbs)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Goal: 155 lbs</span>
          </div>
        </div>
      </div>
      
      {/* Weight Chart */}
      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
          <span>163</span>
          <span>161</span>
          <span>159</span>
          <span>157</span>
          <span>155</span>
        </div>
        
        {/* Chart area */}
        <div className="h-full flex items-end justify-between space-x-1 ml-4">
          {weightData.map((data, index) => {
            // Calculate position based on weight range (155-163 lbs)
            const minWeight = 155;
            const maxWeight = 163;
            const heightPercentage = ((data.weight - minWeight) / (maxWeight - minWeight)) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center relative group">
                {/* Data point */}
                <div 
                  className="w-full flex justify-center items-end transition-all duration-1000 ease-out"
                  style={{ height: `${heightPercentage}%` }}
                >
                  <div className="w-3 h-3 bg-purple-500 rounded-full relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.weight} lbs
                      {data.change !== 0 && (
                        <div className={`text-xs ${data.change > 0 ? 'text-red-300' : 'text-green-300'}`}>
                          {data.change > 0 ? '+' : ''}{data.change.toFixed(1)} lbs
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Connect points with line */}
                {index < weightData.length - 1 && (
                  <svg 
                    className="absolute top-0 left-1/2 w-full h-full pointer-events-none"
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    <line
                      x1="50%"
                      y1={`${100 - heightPercentage}%`}
                      x2="150%"
                      y2={`${100 - ((weightData[index + 1].weight - minWeight) / (maxWeight - minWeight)) * 100}%`}
                      stroke="#8b5cf6"
                      strokeWidth="2"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                )}
                
                {/* Date label */}
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                  {new Date(data.date).getDate()}/{new Date(data.date).getMonth() + 1}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Goal line */}
        <div 
          className="absolute left-4 right-0 border-t-2 border-dashed border-green-500 opacity-50"
          style={{ bottom: `${((155 - 155) / (163 - 155)) * 100}%` }}
        >
          <span className="absolute right-0 -top-6 text-xs text-green-600 font-medium">Goal: 155 lbs</span>
        </div>
      </div>
      
      {/* Chart summary */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <span className="text-green-600 font-medium">-3.9 lbs total</span>
          </div>
          <div className="text-gray-600">
            Current: {weightData[weightData.length - 1].weight} lbs
          </div>
        </div>
        <div className="text-gray-500">
          Last 14 days
        </div>
      </div>
    </motion.div>
  );

  const ReportsCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Health Reports</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeDasharray={`${weeklyStats.improvement}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-800">{weeklyStats.improvement}%</span>
            <span className="text-xs text-gray-600">Improvement</span>
          </div>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 text-sm mb-2">Great progress this week!</p>
        <p className="text-gray-500 text-xs">Keep up the excellent work</p>
      </div>
    </motion.div>
  );

  const FitnessScoreCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
        <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-full"></div>
        <div className="absolute top-8 right-8 w-8 h-8 bg-white rounded-full"></div>
      </div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <Clock className="w-8 h-8 text-white opacity-80" />
          <span className="text-white text-sm font-medium">Fitness Timer</span>
        </div>
        
        <div className="mb-4">
          <div className="text-3xl font-bold mb-1">{weeklyStats.fitnessScore}%</div>
          <div className="text-orange-100 text-sm">Fitness Score</div>
        </div>
        
        {/* Mini wave chart */}
        <div className="h-8 flex items-end space-x-1">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="w-1 bg-white opacity-60 rounded-full"
              style={{ height: `${Math.random() * 100}%` }}
            ></div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const MiniChart = ({ data, color }: { data: number[], color: string }) => (
    <div className="h-full flex items-end space-x-1">
      {data.map((value, index) => (
        <div
          key={index}
          className={`flex-1 ${color} rounded-t-sm transition-all duration-500`}
          style={{ height: `${value}%` }}
        ></div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Calories"
          value="1520"
          icon={Flame}
          color="bg-gradient-to-r from-orange-500 to-red-500"
          trend="down"
          trendValue="2%"
          chart={<MiniChart data={[60, 80, 40, 90, 70, 85, 65]} color="bg-orange-200" />}
        />
        
        <MetricCard
          title="Walk Rate"
          value="2581"
          unit="Steps"
          icon={Activity}
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
          trend="up"
          trendValue="5%"
          chart={<MiniChart data={[40, 60, 80, 50, 90, 70, 85]} color="bg-blue-200" />}
        />
        
        <FitnessScoreCard />
        
        <MetricCard
          title="Heart Rate"
          value={weeklyStats.avgHeartRate}
          unit="BPM"
          icon={Heart}
          color="bg-gradient-to-r from-pink-500 to-rose-500"
          trend="neutral"
          trendValue="Normal"
          chart={<MiniChart data={[70, 65, 75, 68, 72, 69, 71]} color="bg-pink-200" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeightTrackingChart />
        </div>
        <ReportsCard />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Weight className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">-2.6 lbs</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {profile?.weight || 158.5}
          </div>
          <div className="text-gray-600 text-sm">Current Weight (lbs)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Goal: 8</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">6.2</div>
          <div className="text-gray-600 text-sm">Water (glasses)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-emerald-600 font-medium">🔥</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{weeklyStats.streakDays}</div>
          <div className="text-gray-600 text-sm">Day Streak</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-sm text-yellow-600 font-medium">+2</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">12</div>
          <div className="text-gray-600 text-sm">Achievements</div>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Award className="w-5 h-5 mr-2 text-yellow-500" />
              Recent Achievements
              <Crown className="w-4 h-4 ml-2 text-purple-500" />
            </h3>
            <p className="text-gray-600 text-sm">Your latest milestones and accomplishments</p>
          </div>
          <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">7-Day Streak</p>
              <p className="text-sm text-gray-600">Consistent daily activity</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Weight className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Weight Goal</p>
              <p className="text-sm text-gray-600">Lost 3.9 lbs in 2 weeks</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Step Master</p>
              <p className="text-sm text-gray-600">10k+ steps 3 days</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};