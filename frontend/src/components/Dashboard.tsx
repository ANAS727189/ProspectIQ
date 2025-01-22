'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, Users, TrendingUp, AlertCircle, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '../components/ui/alert'
import { LeadTable } from './lead-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Skeleton } from '../components/ui/skeleton'

export default function LeadDashboard() {
    const [data, setData] = useState<{ time: string; leads: number; enriched: number }[]>([])
    const [leads, setLeads] = useState([])
    const [stats, setStats] = useState({
        total_leads: 0,
        enriched_leads: 0,
        last_update: '',
        status: 'active'
    })
    const [errors, setErrors] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [leadsRes, statsRes, errorsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/leads'),
                    fetch('http://localhost:5000/api/stats'),
                    fetch('http://localhost:5000/api/errors')
                ])
                
                const leadsData = await leadsRes.json()
                const statsData = await statsRes.json()
                const errorsData = await errorsRes.json()
                
                setLeads(leadsData.leads)
                setStats(statsData)
                setErrors(errorsData.errors)
                
                const newData = {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    leads: statsData.total_leads,
                    enriched: statsData.enriched_leads,
                }
                setData(prev => [...prev.slice(-5), newData])
            } catch (error) {
                console.error('Error fetching data:', error)
                setErrors(prev => [...prev, 'Error fetching data: ' + (error as any).message])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 14400000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen p-6 mx-auto space-y-6 max-w-7xl bg-gradient-to-b from-gray-900 to-gray-800">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-blue-500" />
                    <h1 className="text-4xl font-bold tracking-tight text-white">ProspectIQ</h1>
                </div>
                <h3 className="text-lg text-gray-400">
                    Your AI-Powered B2B Lead Generation Engine
                </h3>
            </motion.div>

            <motion.div 
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {[
                    {
                        title: "Total Leads",
                        value: stats.total_leads,
                        icon: Users,
                        color: "text-blue-500"
                    },
                    {
                        title: "Enriched Leads",
                        value: stats.enriched_leads,
                        icon: TrendingUp,
                        color: "text-green-500"
                    },
                    {
                        title: "Last Update",
                        value: stats.last_update,
                        icon: Clock,
                        color: "text-purple-500"
                    },
                    {
                        title: "Status",
                        value: stats.status === 'active' ? 'Active' : 'Warning',
                        icon: AlertCircle,
                        color: stats.status === 'active' ? "text-green-500" : "text-yellow-500"
                    }
                ].map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Card className="overflow-hidden border-none bg-gray-800/50 backdrop-blur-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-200">{item.title}</CardTitle>
                                <item.icon className={`w-4 h-4 ${item.color}`} />
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <Skeleton className="w-20 h-8 bg-gray-700" />
                                ) : (
                                    <div className={`text-2xl font-bold ${item.color}`}>
                                        {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <Tabs defaultValue="chart" className="space-y-4">
                    <TabsList className="border-gray-700 bg-gray-800/50">
                        <TabsTrigger value="chart" className="data-[state=active]:bg-gray-700">Chart</TabsTrigger>
                        <TabsTrigger value="leads" className="data-[state=active]:bg-gray-700">Leads</TabsTrigger>
                    </TabsList>
                    <AnimatePresence mode="wait">
                        <TabsContent value="chart">
                            <Card className="border-none bg-gray-800/50 backdrop-blur-lg">
                                <CardHeader>
                                    <CardTitle className="text-gray-200">Lead Generation Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <Skeleton className="h-[300px] w-full bg-gray-700" />
                                    ) : (
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={data}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                    <XAxis dataKey="time" stroke="#9CA3AF" />
                                                    <YAxis stroke="#9CA3AF" />
                                                    <Tooltip 
                                                        contentStyle={{ 
                                                            backgroundColor: '#1F2937',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            color: '#E5E7EB'
                                                        }}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="leads" 
                                                        stroke="#3B82F6" 
                                                        strokeWidth={2}
                                                        dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                                                        name="Total Leads" 
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="enriched" 
                                                        stroke="#10B981" 
                                                        strokeWidth={2}
                                                        dot={{ fill: '#10B981', strokeWidth: 2 }}
                                                        name="Enriched Leads" 
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="leads">
                            <Card className="border-none bg-gray-800/50 backdrop-blur-lg">
                                <CardHeader>
                                    <CardTitle className="text-gray-200">Latest Leads</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <Skeleton className="h-[400px] w-full bg-gray-700" />
                                    ) : (
                                        <LeadTable leads={leads} />
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </motion.div>

            <AnimatePresence>
                {errors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Alert variant="destructive" className="border-red-900 bg-red-950/50 backdrop-blur-lg">
                            <AlertDescription>
                                <h3 className="mb-2 font-bold text-red-200">Errors:</h3>
                                <ul className="pl-5 text-red-200 list-disc">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}