
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  LineChart, 
  PieChart,
  Pie,
  Cell,
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  Sandwich, 
  Activity, 
  Calendar, 
  Package, 
  Banknote,
  PieChart as PieChartIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getAllOrders, getCurrentUser } from '@/lib/storage';
import { Order } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, addDays, subDays, 
  subWeeks, subMonths, differenceInDays, isSameDay, isWithinInterval } from 'date-fns';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Define a set of colors for the pie chart
const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', '#FBBF24', '#EC4899', '#6366F1'];

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  
  // Statistics
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [averageOrderValue, setAverageOrderValue] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<{name: string, quantity: number, revenue: number}[]>([]);
  const [pieChartData, setPieChartData] = useState<{name: string, value: number}[]>([]);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    
    const allOrders = getAllOrders();
    setOrders(allOrders);
  }, [user, navigate]);
  
  useEffect(() => {
    if (orders.length === 0) return;
    
    // Calculate total revenue and order count
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    setTotalRevenue(revenue);
    setTotalOrders(orders.length);
    setAverageOrderValue(revenue / orders.length);
    
    // Calculate top selling items
    const itemMap = new Map<string, {quantity: number, revenue: number}>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = itemMap.get(item.name) || {quantity: 0, revenue: 0};
        itemMap.set(item.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        });
      });
    });
    
    const topItems = Array.from(itemMap.entries())
      .map(([name, stats]) => ({name, ...stats}))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setTopSellingItems(topItems);
    
    // Create pie chart data for item-wise sales by quantity
    const pieData = Array.from(itemMap.entries())
      .map(([name, stats]) => ({
        name,
        value: stats.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Limit to 8 items for better visualization
    
    setPieChartData(pieData);
    
    // Generate chart data based on time range
    generateChartData(timeRange, orders);
  }, [orders, timeRange]);
  
  const generateChartData = (range: TimeRange, orderData: Order[]) => {
    const now = new Date();
    let data: any[] = [];
    
    if (range === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = startOfDay(addDays(date, 1));
        
        const dayOrders = orderData.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= dayStart && orderDate < dayEnd;
        });
        
        const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = dayOrders.length;
        
        data.push({
          name: format(date, 'EEE'),
          revenue: dayRevenue,
          orders: orderCount,
          date: format(date, 'yyyy-MM-dd'),
        });
      }
    } else if (range === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i));
        const weekEnd = startOfWeek(subWeeks(now, i - 1));
        
        const weekOrders = orderData.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekStart && orderDate < weekEnd;
        });
        
        const weekRevenue = weekOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = weekOrders.length;
        
        data.push({
          name: `Week ${4-i}`,
          revenue: weekRevenue,
          orders: orderCount,
          date: format(weekStart, 'yyyy-MM-dd'),
        });
      }
    } else if (range === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = startOfMonth(subMonths(now, i - 1));
        
        const monthOrders = orderData.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate < monthEnd;
        });
        
        const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = monthOrders.length;
        
        data.push({
          name: format(monthStart, 'MMM'),
          revenue: monthRevenue,
          orders: orderCount,
          date: format(monthStart, 'yyyy-MM'),
        });
      }
    } else if (range === 'yearly') {
      // Last 5 years
      const currentYear = now.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = startOfYear(new Date(year + 1, 0, 1));
        
        const yearOrders = orderData.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= yearStart && orderDate < yearEnd;
        });
        
        const yearRevenue = yearOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = yearOrders.length;
        
        data.push({
          name: year.toString(),
          revenue: yearRevenue,
          orders: orderCount,
          date: year.toString(),
        });
      }
    }
    
    setChartData(data);
  };
  
  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };

  // Custom render function for pie chart labels
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent, 
    index 
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show percentage for segments with at least 5% share
    return percent >= 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="#888"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sweet-50 pb-10">
      <Navbar />
      <div className="pt-20 px-4 container mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Track your business performance</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="btn-secondary flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="btn-secondary flex items-center gap-2"
            >
              <Sandwich className="w-4 h-4" />
              <span>Products</span>
            </button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in">
          <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{totalOrders}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Average Order Value</h3>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(averageOrderValue)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-border mb-6 animate-fade-in">
          <div className="p-4 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-medium">Revenue & Orders</h3>
              
              <div className="flex gap-2">
                <div className="flex border border-border rounded-md overflow-hidden">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 text-sm ${
                      chartType === 'bar' 
                        ? 'bg-muted' 
                        : 'bg-white hover:bg-muted/50'
                    }`}
                  >
                    <BarChartIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 text-sm ${
                      chartType === 'line' 
                        ? 'bg-muted' 
                        : 'bg-white hover:bg-muted/50'
                    }`}
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="border border-border rounded-md p-2 text-sm bg-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-4 h-80">
            <ChartContainer className="h-full" config={{
              revenue: { color: 'hsl(142, 76%, 36%)' },
              orders: { color: 'hsl(221, 83%, 53%)' },
            }}>
              {chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(Number(value)) : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                      />
                    }
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" yAxisId="left" fill="var(--color-revenue)" />
                  <Bar dataKey="orders" name="Orders" yAxisId="right" fill="var(--color-orders)" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === 'revenue' ? formatCurrency(Number(value)) : value,
                          name === 'revenue' ? 'Revenue' : 'Orders'
                        ]}
                      />
                    }
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" yAxisId="left" stroke="var(--color-revenue)" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="orders" name="Orders" yAxisId="right" stroke="var(--color-orders)" />
                </LineChart>
              )}
            </ChartContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Pie Chart for Item-wise Sales */}
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Top Selling Items</h3>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div className="p-4 h-80">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string, props: any) => [
                        `${value} units`, 
                        props.payload.name
                      ]}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      formatter={(value, entry, index) => pieChartData[index!]?.name?.length > 15 
                        ? `${pieChartData[index!]?.name?.substring(0, 15)}...` 
                        : pieChartData[index!]?.name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">Top Selling Items</h3>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSellingItems.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  </TableRow>
                ))}
                {topSellingItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="bg-white rounded-lg border border-border overflow-hidden lg:col-span-2">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium">Recent Orders</h3>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">No orders available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
