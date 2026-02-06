"use client";

import React from "react";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Activity,
  Bell,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
            title="Total Sales"
            value="$24,567"
            change="+12% from last month"
            icon={DollarSign}
            iconBg="bg-amber-100 dark:bg-amber-900/20"
            iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatsCard
            title="Active Users"
            value="1,234"
            change="+5% from last week"
            icon={Users}
            iconBg="bg-green-100 dark:bg-green-900/20"
            iconColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
            title="Orders"
            value="456"
            change="+8% from yesterday"
            icon={ShoppingCart}
            iconBg="bg-purple-100 dark:bg-purple-900/20"
            iconColor="text-purple-600 dark:text-purple-400"
        />
        <StatsCard
             title="Products"
             value="89"
             change="+3 new this week"
             icon={Package}
             iconBg="bg-orange-100 dark:bg-orange-900/20"
             iconColor="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <button className="text-sm text-primary hover:underline font-medium">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {[
                { icon: DollarSign, title: "New sale recorded", desc: "Order #1234 completed", time: "2 min ago", color: "green" },
                { icon: Users, title: "New user registered", desc: "john.doe@example.com joined", time: "5 min ago", color: "amber" },
                { icon: Package, title: "Product updated", desc: "iPhone 15 Pro stock updated", time: "10 min ago", color: "purple" },
                { icon: Activity, title: "System maintenance", desc: "Scheduled backup completed", time: "1 hour ago", color: "orange" },
                { icon: Bell, title: "New notification", desc: "Marketing campaign results", time: "2 hours ago", color: "red" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={cn("p-2 rounded-lg", 
                    activity.color === 'green' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    activity.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
                    activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' :
                    activity.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' :
                    'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  )}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.desc}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <QuickStat label="Conversion Rate" value="3.2%" percentage={32} color="bg-amber-500" />
              <QuickStat label="Bounce Rate" value="45%" percentage={45} color="bg-orange-500" />
              <QuickStat label="Page Views" value="8.7k" percentage={87} color="bg-green-500" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-3">
              {['iPhone 15 Pro', 'MacBook Air M2', 'AirPods Pro', 'iPad Air'].map((product, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">{product}</span>
                  <span className="text-sm font-medium">
                    ${Math.floor(Math.random() * 1000 + 500)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon, iconBg, iconColor }: {
    title: string, value: string, change: string, icon: LucideIcon, iconBg: string, iconColor: string
}) {
    return (
        <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("p-2 rounded-lg", iconBg)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="font-medium text-muted-foreground mb-1">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">{change}</p>
        </div>
    )
}

function QuickStat({ label, value, percentage, color }: { label: string, value: string, percentage: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium">{value}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
                <div className={cn("h-2 rounded-full", color)} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}
