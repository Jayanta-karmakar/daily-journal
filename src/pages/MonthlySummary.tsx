import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, TrendingUp, DollarSign, Wallet, PiggyBank, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  getMonthTotalSpend, getMonthTotalInvested, getRemaining, getWorkingDays,
  getGymDays, getDaysOverLimit, getZeroSpendDays, getBiggestExpense,
  getCategoryTotals, formatCurrency, getDailyTrend, getMonthlyTrend
} from '@/data/calculations';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PeriodType = 'monthly' | 'yearly' | 'range';

const SummaryPage = () => {
  const navigate = useNavigate();
  const { entries, config } = useAppContext();

  // Filters State
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(config.month); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Calculate distinct years and months from entries for filters
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    entries.forEach(e => years.add(e.date.split('-')[0]));
    if (years.size === 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    entries.forEach(e => months.add(e.date.slice(0, 7)));
    if (months.size === 0) months.add(format(new Date(), 'yyyy-MM'));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [entries]);

  // Derived Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const entryDate = parseISO(e.date);
      if (periodType === 'monthly') {
        return e.date.slice(0, 7) === selectedMonth;
      }
      if (periodType === 'yearly') {
        return e.date.startsWith(selectedYear);
      }
      if (periodType === 'range' && dateRange.from && dateRange.to) {
        return isWithinInterval(entryDate, { start: dateRange.from, end: dateRange.to });
      }
      return true;
    });
  }, [entries, periodType, selectedMonth, selectedYear, dateRange]);

  // Calculations
  const totalSpend = getMonthTotalSpend(filteredEntries);
  const totalInvested = getMonthTotalInvested(filteredEntries);
  const totalSalary = periodType === 'monthly' ? config.salary : (periodType === 'yearly' ? config.salary * 12 : 0); // Simplified for range
  const remaining = totalSalary > 0 ? getRemaining(totalSalary, totalSpend) : 0;
  
  const workingDays = getWorkingDays(filteredEntries);
  const gymDays = getGymDays(filteredEntries);
  const gymPct = workingDays > 0 ? Math.round((gymDays / workingDays) * 100) : 0;
  const overLimitDays = getDaysOverLimit(filteredEntries, config.dailySpendLimit);
  const zeroSpendDays = getZeroSpendDays(filteredEntries);
  const biggest = getBiggestExpense(filteredEntries);
  const categories = getCategoryTotals(filteredEntries);
  const totalAll = categories.need + categories.want + categories.investment + categories.savings;

  // Chart Data
  const categoryData = [
    { name: "Need", value: categories.need, fill: "hsl(var(--primary))" },
    { name: "Want", value: categories.want, fill: "hsl(var(--warning))" },
    { name: "Investment", value: categories.investment, fill: "hsl(var(--success))" },
    { name: "Savings", value: categories.savings, fill: "hsl(var(--investment))" },
  ].filter(d => d.value > 0);

  const dailyTrendData = getDailyTrend(filteredEntries);
  const monthlyTrendData = getMonthlyTrend(filteredEntries);

  const chartConfig = {
    spend: {
      label: "Spent",
      color: "hsl(var(--destructive))",
    },
    invested: {
      label: "Invested",
      color: "hsl(var(--success))",
    },
    need: { label: "Need", color: "hsl(var(--primary))" },
    want: { label: "Want", color: "hsl(var(--warning))" },
    investment: { label: "Investment", color: "hsl(var(--success))" },
    savings: { label: "Savings", color: "hsl(var(--investment))" },
  } satisfies ChartConfig;

  const formatPeriodLabel = () => {
    if (periodType === 'monthly') return format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy');
    if (periodType === 'yearly') return `Year ${selectedYear}`;
    if (periodType === 'range' && dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
    }
    return 'Summary';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-6 space-y-8 animate-in fade-in duration-500">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full shadow-sm">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Advanced Analytics</h1>
            <p className="text-sm text-muted-foreground font-medium">{formatPeriodLabel()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1.5 rounded-2xl border border-border">
          <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)} className="w-auto">
            <TabsList className="bg-transparent h-9 border-none">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs font-semibold">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs font-semibold">Yearly</TabsTrigger>
              <TabsTrigger value="range" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg text-xs font-semibold">Custom Range</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

          {periodType === 'monthly' && (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 w-[150px] bg-background border-none shadow-none rounded-lg text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(m => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {format(parseISO(`${m}-01`), 'MMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {periodType === 'yearly' && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-9 w-[120px] bg-background border-none shadow-none rounded-lg text-xs font-medium focus:ring-0">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {periodType === 'range' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-[240px] justify-start text-left font-normal bg-background border-none shadow-none rounded-lg text-xs",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-primary/5 hover:bg-primary/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-primary">Budget / Target</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalary, config.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on configuration</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-destructive/5 hover:bg-destructive/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-destructive">Total Spent</CardTitle>
            <Wallet className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend, config.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">{filteredEntries.length} entries recorded</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-success/5 hover:bg-success/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-success">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvested, config.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">Wealth building phase</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-investment/5 hover:bg-investment/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-investment">Remaining</CardTitle>
            <PiggyBank className="h-4 w-4 text-investment" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(remaining, config.currency)}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gym Streak</p>
            <p className="text-lg font-bold mt-1 text-primary">💪 {gymDays} / {workingDays} <span className="text-xs font-medium text-muted-foreground">({gymPct}%)</span></p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zero Spend Days</p>
            <p className="text-lg font-bold mt-1 text-success">✨ {zeroSpendDays} days</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Over Limit Days</p>
            <p className="text-lg font-bold mt-1 text-destructive">🚨 {overLimitDays} days</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Biggest Blowout</p>
            <p className="text-lg font-bold mt-1 text-foreground">{biggest ? formatCurrency(biggest.amount, config.currency) : formatCurrency(0, config.currency)}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-border/50 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {periodType === 'yearly' ? 'Monthly Performance' : 'Daily Spending Trend'}
                </CardTitle>
                <CardDescription className="text-xs">Visualizing your financial flow</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              {periodType === 'yearly' ? (
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => format(parseISO(`${v}-01`), 'MMM')}
                    fontSize={10}
                    fontWeight={600}
                  />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={600} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="spend" fill="var(--color-spend)" radius={[4, 4, 0, 0]} name="Spent" />
                  <Bar dataKey="invested" fill="var(--color-invested)" radius={[4, 4, 0, 0]} name="Invested" />
                </BarChart>
              ) : (
                <AreaChart data={dailyTrendData}>
                  <defs>
                    <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-spend)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-spend)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-invested)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-invested)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => format(parseISO(v), 'dd MMM')}
                    fontSize={10}
                    fontWeight={600}
                  />
                  <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={600} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="var(--color-spend)"
                    fillOpacity={1}
                    fill="url(#fillSpend)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="var(--color-invested)"
                    fillOpacity={1}
                    fill="url(#fillInvested)"
                    strokeWidth={2}
                  />
                </AreaChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category breakdown (Pie Chart) */}
        <Card className="border-border/50 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Category Allocation
            </CardTitle>
            <CardDescription className="text-xs">Where your money goes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            {categoryData.length > 0 ? (
              <>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-xl font-bold"
                                >
                                  {formatCurrency(totalSpend, config.currency)}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-foreground/60 text-[10px] font-medium uppercase"
                                >
                                  Spent
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full mt-4">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                        <span className="text-xs font-bold">{formatCurrency(item.value, config.currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs italic">
                No spending data available for this selection
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zero spend days indicator */}
      {zeroSpendDays > 0 && (
        <Card className="border-success/30 bg-success/5 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-success">Incredible Self-Control!</p>
              <p className="text-xs text-foreground/70 font-medium">You had {zeroSpendDays} days with zero spending in this period. Keep it up!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {biggest && (
        <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg shadow-sm">
                <BarChart3 className="h-4 w-4 text-destructive" />
            </div>
            <div>
                <p className="text-xs font-bold text-foreground/60 uppercase">Top Transaction</p>
                <p className="text-sm font-bold">{biggest.label} <span className="text-foreground/70 font-medium">— {formatCurrency(biggest.amount, config.currency)}</span></p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-primary px-2" onClick={() => navigate('/')}>
            View Entries
          </Button>
        </div>
      )}

      <Button variant="outline" className="w-full h-12 rounded-2xl border-border/50 text-sm font-bold hover:bg-muted transition-all shadow-sm" onClick={() => navigate('/')}>
        Return to Dashboard
      </Button>
    </div>
  );
};

export default SummaryPage;
