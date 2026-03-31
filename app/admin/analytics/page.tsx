// ============================================================
// Luna Beauty — Admin Analytics Dashboard
// Simple revenue monitoring for the site owner
// ============================================================

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TrendingUp, ShoppingBag, MessageSquare, Eye, BarChart2 } from 'lucide-react'
import { PRODUCTS } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Analytics Dashboard — Luna Beauty Admin',
  robots: { index: false, follow: false },
}

// Verify admin access (simple secret key check)
async function checkAdminAccess(): Promise<boolean> {
  const headersList = await headers()
  const secret = headersList.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

// Mock analytics data for demo purposes
// In production, fetch from Supabase events table
function getMockAnalytics() {
  return {
    last7Days: {
      pageViews: 2847,
      affiliateClicks: 342,
      chatMessages: 891,
      conversionRate: 12.0,
    },
    last30Days: {
      pageViews: 11240,
      affiliateClicks: 1287,
      chatMessages: 3420,
      estimatedRevenue: '$385', // 10% commission on avg $30 purchase, 10% conversion
    },
    topProducts: PRODUCTS.filter((p) => p.isBestseller)
      .slice(0, 5)
      .map((p, i) => ({
        product: p,
        clicks: [234, 187, 156, 134, 98][i],
      })),
    dailyStats: Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pageViews: Math.floor(Math.random() * 200 + 300),
        affiliateClicks: Math.floor(Math.random() * 30 + 30),
        chatMessages: Math.floor(Math.random() * 100 + 80),
      }
    }),
    topCategories: [
      { category: 'Skincare', views: 1840 },
      { category: 'Foundation', views: 1230 },
      { category: 'Haircare', views: 980 },
      { category: 'Lipstick', views: 870 },
      { category: 'Serum', views: 760 },
    ],
  }
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const params = await searchParams
  const providedSecret = params.secret

  // Check admin access
  const adminSecret = process.env.ADMIN_SECRET
  if (adminSecret && providedSecret !== adminSecret) {
    redirect('/')
  }

  const analytics = getMockAnalytics()

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-semibold">Luna Beauty Analytics</h1>
            <p className="text-sm text-muted-foreground">Revenue & engagement dashboard</p>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            Admin View
          </span>
        </div>
      </div>

      <div className="container py-8">
        {/* Important Note */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-8 text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> This shows demo/mock data. Connect Supabase and run the schema.sql to see real analytics from your events table.
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <p className="text-2xl font-bold">{analytics.last7Days.pageViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm text-muted-foreground">Affiliate Clicks</span>
            </div>
            <p className="text-2xl font-bold">{analytics.last7Days.affiliateClicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground">Chat Messages</span>
            </div>
            <p className="text-2xl font-bold">{analytics.last7Days.chatMessages.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>

          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">Click Rate</span>
            </div>
            <p className="text-2xl font-bold">{analytics.last7Days.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Clicks / Views</p>
          </div>
        </div>

        {/* Revenue Estimate */}
        <div className="bg-gradient-to-br from-luna-berry/10 to-luna-gold/10 border border-luna-gold/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 className="w-5 h-5 text-luna-gold" />
            <h2 className="font-semibold">30-Day Revenue Estimate</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-3xl font-bold text-luna-gold">{analytics.last30Days.estimatedRevenue}</p>
              <p className="text-sm text-muted-foreground">Est. commission (10%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.last30Days.affiliateClicks.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total affiliate clicks</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.last30Days.pageViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total page views</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.last30Days.chatMessages.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">AI chat messages</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * Estimate based on 10% Amazon Associates commission on Luxury Beauty category,
            assuming 5% purchase conversion rate from affiliate clicks at avg. $45 order value.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Clicked Products */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold font-display">Top Affiliate Clicked Products</h2>
              <p className="text-sm text-muted-foreground">Last 7 days</p>
            </div>
            <div className="p-4">
              {analytics.topProducts.map(({ product, clicks }, i) => (
                <div key={product.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                  <span className="text-sm font-bold text-muted-foreground w-5 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand} · {product.priceDisplay}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{clicks}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-card rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold font-display">Top Categories by Views</h2>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
            <div className="p-6">
              {analytics.topCategories.map(({ category, views }) => {
                const maxViews = analytics.topCategories[0].views
                const pct = Math.round((views / maxViews) * 100)
                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">{views.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-luna-berry to-luna-rose rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Daily Activity Chart (simplified) */}
        <div className="bg-card rounded-xl border border-border shadow-sm mt-8">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold font-display">Daily Activity — Last 7 Days</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Page Views</th>
                  <th className="pb-3 font-medium text-right">Affiliate Clicks</th>
                  <th className="pb-3 font-medium text-right">Chat Messages</th>
                  <th className="pb-3 font-medium text-right">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.dailyStats.map((day) => (
                  <tr key={day.date} className="border-t border-border">
                    <td className="py-3 font-medium">{day.date}</td>
                    <td className="py-3 text-right">{day.pageViews}</td>
                    <td className="py-3 text-right text-primary font-medium">{day.affiliateClicks}</td>
                    <td className="py-3 text-right">{day.chatMessages}</td>
                    <td className="py-3 text-right">
                      {((day.affiliateClicks / day.pageViews) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 bg-muted/50 rounded-xl p-6 text-sm">
          <h3 className="font-semibold mb-3">Connect Real Analytics</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Create a Supabase project and run <code className="bg-muted px-1 rounded">supabase/schema.sql</code></li>
            <li>Add your Supabase credentials to <code className="bg-muted px-1 rounded">.env.local</code></li>
            <li>Events are automatically tracked when users interact with the site</li>
            <li>Replace the mock data in this component with real Supabase queries</li>
            <li>Access this page at <code className="bg-muted px-1 rounded">/admin/analytics?secret=YOUR_ADMIN_SECRET</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
