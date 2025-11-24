import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Activity, 
  Download, 
  Filter,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useLanguage, t } from "@/lib/i18n";

interface ActivityLog {
  id: number;
  timestamp: Date;
  action: string;
  user: string;
  userRole: string;
  description: string;
  type: 'info' | 'warning' | 'error' | 'success';
  ipAddress: string;
}

const mockLogs: ActivityLog[] = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    action: 'LOGIN',
    user: 'Ahmed Hassan',
    userRole: 'admin',
    description: 'User logged in successfully',
    type: 'success',
    ipAddress: '192.168.1.100',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    action: 'USER_CREATED',
    user: 'Admin',
    userRole: 'admin',
    description: 'Created new user: Mohammed Ali',
    type: 'info',
    ipAddress: '192.168.1.50',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    action: 'SETTINGS_CHANGED',
    user: 'Admin',
    userRole: 'admin',
    description: 'Updated application settings',
    type: 'warning',
    ipAddress: '192.168.1.50',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    action: 'LOGIN_FAILED',
    user: 'Unknown',
    userRole: 'guest',
    description: 'Failed login attempt',
    type: 'error',
    ipAddress: '192.168.1.200',
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    action: 'USER_DELETED',
    user: 'Admin',
    userRole: 'admin',
    description: 'Deleted user: Omar khalid',
    type: 'warning',
    ipAddress: '192.168.1.50',
  },
];

export default function LogsSettingsPage() {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || log.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: ActivityLog['type']) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return variants[type];
  };

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'Action', 'User', 'Role', 'Description', 'IP Address', 'Type'],
      ...filteredLogs.map(log => [
        format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        log.user,
        log.userRole,
        log.description,
        log.ipAddress,
        log.type,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{t('activityLogsTitle', lang)}</h1>
          <p className="text-muted-foreground">
            {t('viewAllSystemActivities', lang)}
          </p>
        </div>
        <Button
          onClick={handleExportLogs}
          variant="outline"
          data-testid="button-export-logs"
        >
          <Download className="h-4 w-4 mr-2" />
          {t('exportCSV', lang)}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">{t('totalActivities', lang)}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('last24Hours', lang)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">{t('loginEvents', lang)}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLogs.filter(l => l.action === 'LOGIN').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('successfulLogins', lang)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">{t('failedAttempts', lang)}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLogs.filter(l => l.type === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('failedActions', lang)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
            <CardTitle className="text-sm font-medium">{t('warnings', lang)}</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockLogs.filter(l => l.type === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('suspiciousActivities', lang)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('activityLog', lang)}</CardTitle>
          <CardDescription>
            {filteredLogs.length} {t('of', lang).toLowerCase()} {mockLogs.length} {t('entries', lang)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchByUserActionDescription', lang)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-logs"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]" data-testid="select-log-type-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes', lang)}</SelectItem>
                <SelectItem value="success">{t('successType', lang)}</SelectItem>
                <SelectItem value="error">{t('errorType', lang)}</SelectItem>
                <SelectItem value="warning">{t('warningType', lang)}</SelectItem>
                <SelectItem value="info">{t('infoType', lang)}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table data-testid="table-activity-logs">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('type', lang)}</TableHead>
                    <TableHead>{t('action', lang)}</TableHead>
                    <TableHead>{t('user', lang)}</TableHead>
                    <TableHead>{t('description', lang)}</TableHead>
                    <TableHead>{t('ipAddress', lang)}</TableHead>
                    <TableHead>{t('timestamp', lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} data-testid={`log-row-${log.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <Badge className={getTypeBadge(log.type)}>
                            {log.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{log.user}</p>
                          <p className="text-xs text-muted-foreground">{log.userRole}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.description}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {log.ipAddress}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(log.timestamp, 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">{t('noLogsMatch', lang)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
