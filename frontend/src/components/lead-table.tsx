import { motion, AnimatePresence } from 'framer-motion'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion"
import { 
    ExternalLink, 
    Globe, 
    Mail, 
    TrendingUp, 
    ChevronDown, 
    Building2,
    Search,
    RefreshCcw
} from 'lucide-react'
import { Button } from '../components/ui/button'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../components/ui/hover-card"

interface Lead {
    company_name: string
    email: string
    website: string
    description: string
    industry: string
    timestamp: string
    enriched: boolean
    serp_data: {
        organic_results: Array<{
            title: string
            link: string
            snippet: string
        }>
        knowledge_graph: {
            title: string
            type: string
            description: string
        }
    }
}

export function LeadTable({ leads }: { leads: Lead[] }) {
    return (
        <div className="relative overflow-hidden rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-gray-700 bg-gray-800/50">
                        <TableHead className="text-gray-200">Company</TableHead>
                        <TableHead className="text-gray-200">Industry</TableHead>
                        <TableHead className="text-gray-200">Contact</TableHead>
                        <TableHead className="text-gray-200">Status</TableHead>
                        <TableHead className="text-gray-200">Added</TableHead>
                        <TableHead className="text-gray-200">SERP Data</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <AnimatePresence>
                        {leads.map((lead, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                className="transition-colors border-b border-gray-700 bg-gray-800/30 backdrop-blur-sm hover:bg-gray-700/50"
                            >
                                <TableCell>
                                    <HoverCard>
                                        <HoverCardTrigger>
                                            <div className="flex items-center gap-3 cursor-pointer">
                                                <div className="p-2 rounded-full bg-blue-500/10">
                                                    <Building2 className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-blue-400 transition-colors hover:text-blue-300">
                                                        {lead.company_name}
                                                    </span>
                                                    <span className="mt-1 text-sm text-gray-400">
                                                        {lead.description.slice(0, 60)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="text-gray-200 bg-gray-800 border-gray-700 w-80">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">{lead.company_name}</h4>
                                                <p className="text-sm text-gray-400">
                                                    {lead.description}
                                                </p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="secondary" 
                                        className="text-gray-200 bg-gray-700/50 hover:bg-gray-600/50"
                                    >
                                        {lead.industry || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="justify-start w-full text-gray-200 hover:bg-blue-500/10 hover:text-blue-400 group"
                                        >
                                            <Mail className="w-4 h-4 mr-2 text-blue-400 transition-transform group-hover:scale-110" />
                                            <span className="text-sm truncate">{lead.email}</span>
                                        </Button>
                                        {lead.website && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="justify-start w-full text-gray-200 hover:bg-green-500/10 hover:text-green-400 group"
                                                onClick={() => window.open(lead.website, '_blank')}
                                            >
                                                <Globe className="w-4 h-4 mr-2 text-green-400 transition-transform group-hover:scale-110" />
                                                <span className="text-sm truncate">Website</span>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {lead.enriched ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        >
                                            <Badge 
                                                variant="default"
                                                className="text-green-400 bg-green-500/20 hover:bg-green-500/30"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Enriched
                                                </div>
                                            </Badge>
                                        </motion.div>
                                    ) : (
                                        <Badge 
                                            variant="secondary"
                                            className="text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30"
                                        >
                                            <div className="flex items-center gap-1">
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <RefreshCcw className="w-3 h-3" />
                                                </motion.div>
                                                Pending
                                            </div>
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-400">
                                        {new Date(lead.timestamp).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="serp-data" className="border-none">
                                            <AccordionTrigger className="py-2 hover:no-underline">
                                                <span className="flex items-center gap-2 text-sm font-medium text-gray-200 hover:text-gray-100">
                                                    <Search className="w-4 h-4" />
                                                    SERP Data
                                                    <ChevronDown className="w-4 h-4 ml-2 transition-transform duration-200 shrink-0" />
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                {lead.serp_data ? (
                                                    <div className="p-4 space-y-4 rounded-lg bg-gray-700/30">
                                                        {lead.serp_data.organic_results?.length > 0 && (
                                                            <div>
                                                                <h4 className="mb-2 text-sm font-semibold text-gray-200">
                                                                    Top Results:
                                                                </h4>
                                                                <ul className="space-y-3">
                                                                    {lead.serp_data.organic_results.map((result, index) => (
                                                                        <motion.li 
                                                                            key={index}
                                                                            initial={{ opacity: 0, x: -20 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            transition={{ delay: index * 0.1 }}
                                                                            className="text-sm"
                                                                        >
                                                                            <a 
                                                                                href={result.link} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 group"
                                                                            >
                                                                                {result.title}
                                                                                <ExternalLink className="w-3 h-3 transition-transform group-hover:scale-110" />
                                                                            </a>
                                                                            <p className="mt-1 text-gray-400">
                                                                                {result.snippet}
                                                                            </p>
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {lead.serp_data.knowledge_graph && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="pt-3 border-t border-gray-600"
                                                            >
                                                                <h4 className="mb-2 text-sm font-semibold text-gray-200">
                                                                    Knowledge Graph:
                                                                </h4>
                                                                <div className="space-y-2 text-sm text-gray-400">
                                                                    <p><strong className="text-gray-200">Title:</strong> {lead.serp_data.knowledge_graph.title}</p>
                                                                    <p><strong className="text-gray-200">Type:</strong> {lead.serp_data.knowledge_graph.type}</p>
                                                                    <p><strong className="text-gray-200">Description:</strong> {lead.serp_data.knowledge_graph.description}</p>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="p-4 text-sm text-gray-400">
                                                        No SERP data available
                                                    </p>
                                                )}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </TableBody>
            </Table>
        </div>
    )
}