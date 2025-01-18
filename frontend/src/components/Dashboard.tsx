'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, Users, TrendingUp, AlertCircle } from 'lucide-react'
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
        <div className="p-6 mx-auto space-y-6 max-w-7xl">
            <h1 className="mb-6 text-3xl font-bold">AdTask.ai</h1>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-20 h-8" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.total_leads}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Enriched Leads</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-20 h-8" />
                        ) : (
                            <div className="text-2xl font-bold">{stats.enriched_leads}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Last Update</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-32 h-4" />
                        ) : (
                            <div className="text-sm">{stats.last_update}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="w-16 h-4" />
                        ) : (
                            <div className={`text-sm font-medium ${
                                stats.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                                {stats.status === 'active' ? 'Active' : 'Warning'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="chart" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Generation Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-[300px] w-full" />
                            ) : (
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="leads" stroke="#2563eb" name="Total Leads" />
                                            <Line type="monotone" dataKey="enriched" stroke="#16a34a" name="Enriched Leads" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="leads">
                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-[400px] w-full" />
                            ) : (
                                <LeadTable leads={leads} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {errors.length > 0 && (
                <Alert variant="destructive">
                    <AlertDescription>
                        <h3 className="mb-2 font-bold">Errors:</h3>
                        <ul className="pl-5 list-disc">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
