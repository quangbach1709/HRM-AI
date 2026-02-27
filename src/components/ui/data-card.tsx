import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  avatarColor?: string;
  status?: {
    label: string;
    variant: 'success' | 'warning' | 'destructive' | 'default';
  };
  meta?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const statusStyles = {
  success: 'status-success',
  warning: 'status-warning',
  destructive: 'status-destructive',
  default: 'bg-secondary text-secondary-foreground',
};

export function DataCard({
  title,
  subtitle,
  avatar,
  avatarColor = 'bg-primary text-primary-foreground',
  status,
  meta,
  children,
  onClick,
  className,
}: DataCardProps) {
  return (
    <Card 
      className={cn(
        'card-interactive',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {avatar && (
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className={avatarColor}>{avatar}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
              {status && (
                <Badge className={cn('flex-shrink-0', statusStyles[status.variant])}>
                  {status.label}
                </Badge>
              )}
            </div>
            {meta && <div className="mt-2">{meta}</div>}
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
