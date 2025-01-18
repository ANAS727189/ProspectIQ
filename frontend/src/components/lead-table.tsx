import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion"

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
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>SERP Data</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leads.map((lead, i) => (
                    <TableRow key={i}>
                        <TableCell className="font-medium">{lead.company_name}</TableCell>
                        <TableCell>{lead.industry || 'N/A'}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>
                            <Badge variant={lead.enriched ? "default" : "secondary"}>
                                {lead.enriched ? "Enriched" : "Pending"}
                            </Badge>
                        </TableCell>
                        <TableCell>{new Date(lead.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="serp-data">
                                    <AccordionTrigger>View SERP Data</AccordionTrigger>
                                    <AccordionContent>
                                        {lead.serp_data ? (
                                            <div>
                                                <h4 className="font-bold">Organic Results:</h4>
                                                <ul>
                                                    {lead.serp_data.organic_results.map((result, index) => (
                                                        <li key={index}>
                                                            <a href={result.link} target="_blank" rel="noopener noreferrer">{result.title}</a>
                                                            <p>{result.snippet}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                                {lead.serp_data.knowledge_graph && (
                                                    <div>
                                                        <h4 className="mt-2 font-bold">Knowledge Graph:</h4>
                                                        <p><strong>Title:</strong> {lead.serp_data.knowledge_graph.title}</p>
                                                        <p><strong>Type:</strong> {lead.serp_data.knowledge_graph.type}</p>
                                                        <p><strong>Description:</strong> {lead.serp_data.knowledge_graph.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p>No SERP data available</p>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}