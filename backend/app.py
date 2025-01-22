from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import threading
import schedule
import time
import logging
import requests
from dataclasses import dataclass
from typing import List, Dict
import os
import json
from serpapi.google_search import GoogleSearch
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
CRUNCHBASE_API_KEY = os.getenv('CRUNCHBASE_API_KEY')
CRUNCHBASE_API_URL = os.getenv('CRUNCHBASE_API_URL')
SERPAPI_API_KEY = os.getenv('SERPAPI_API_KEY')


@dataclass
class Lead:
    company_name: str
    email: str
    website: str
    timestamp: str
    description: str = ""
    industry: str = ""
    enriched: bool = False
    serp_data: Dict = None

class LeadGenerationSystem:
    def __init__(self):
        self.leads: List[Lead] = []
        self.errors: List[str] = []
        self.last_update = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        self.model_name = "gemini-1.5-flash"
        self.model_config = {
            'temperature': 0.9,
            'top_p': 1,
            'top_k': 1,
            'max_output_tokens': 2048
        }
        logging.info("Configured to use direct API calls for Gemini model")


    def scrape_crunchbase_data(self) -> List[Dict]:
    
        try:
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "x-cb-user-key": CRUNCHBASE_API_KEY
            }
            
            payload = {
                "field_ids": [
                    "name",
                    "website_url",
                    "short_description"
                ],
                "order": [
                    {
                        "field_id": "created_at",
                        "sort": "desc"
                    }
                ],
                "limit": 5
            }

            logging.info(f"Sending request to Crunchbase API with payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                CRUNCHBASE_API_URL,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            logging.info(f"Crunchbase API Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                entities = data.get('entities', [])
                logging.info(f"Successfully retrieved {len(entities)} organizations from Crunchbase")
                return entities
            else:
                error_msg = f"Crunchbase API error: {response.status_code}. Response: {response.text}"
                self.errors.append(error_msg)
                logging.error(error_msg)
                return []
                
        except Exception as e:
            error_msg = f"Crunchbase scraping error: {str(e)}"
            self.errors.append(error_msg)
            logging.error(error_msg)
            return []

    def generate_company_domain(self, company_name: str) -> str:
    
    
        domain_name = ''.join(e.lower() for e in company_name if e.isalnum() or e.isspace())
        domain_name = domain_name.replace(' ', '')
        return f"{domain_name}.com"

    def generate_content(self, prompt):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": self.model_config
        }
        
        try:
            response = requests.post(url, json=payload)
        
            logging.info(f"Gemini API Response: {response.text}")
            response.raise_for_status() 
            return response.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        except requests.RequestException as e:
            logging.error(f"Error calling Gemini API: {str(e)}")
            return None
    def enrich_with_gemini(self, lead: Lead) -> Lead:
        if not lead.company_name:
            return self.fallback_enrichment(lead)
        
        try:
            prompt = f"""
            Based on this company's name and description, provide industry analysis in JSON format:
            Company: {lead.company_name}
            Description: {lead.description}
            
            Response format:
            {{
                "description": "Brief 100-word description of what the company does",
                "industry": "Primary industry category"
            }}
            """
            
            response_text = self.generate_content(prompt)
            
            if response_text:
                try:
            
                    json_str = response_text.split('```json\n')[1].split('\n```')[0]
                    enrichment_data = json.loads(json_str)
                    
                    lead.description = enrichment_data.get('description', '')[:100]
                    lead.industry = enrichment_data.get('industry', '')
                    domain = self.generate_company_domain(lead.company_name)
                    lead.email = f"contact@{domain}"
                    lead.enriched = True
                    logging.info(f"Successfully enriched lead: {lead.company_name}")
                except (json.JSONDecodeError, IndexError) as e:
                    logging.error(f"Error parsing response for {lead.company_name}: {str(e)}")
                    logging.error(f"Raw response: {response_text}")
                    lead.description = response_text[:100]
                    lead.industry = "Unknown"
                    domain = self.generate_company_domain(lead.company_name)
                    lead.email = f"contact@{domain}"
                    lead.enriched = True
                    logging.warning(f"Fallback enrichment for {lead.company_name}: Used raw response")
            return lead
        except Exception as e:
            error_msg = f"Enrichment error for {lead.company_name}: {str(e)}"
            self.errors.append(error_msg)
            logging.error(error_msg)
            return self.fallback_enrichment(lead)

    def fallback_enrichment(self, lead: Lead) -> Lead:
    
        lead.description = lead.description[:100] if lead.description else f"Company specializing in {lead.industry}"
        domain = self.generate_company_domain(lead.company_name)
        lead.email = f"contact@{domain}"
        lead.enriched = True
        logging.warning(f"Used fallback enrichment for {lead.company_name}")
        return lead

    def get_serp_data(self, company_name: str) -> Dict:
        try:
            params = {
                "engine": "google",
                "q": company_name,
                "api_key": SERPAPI_API_KEY
            }
            search = GoogleSearch(params)
            results = search.get_dict()
            return {
                "organic_results": results.get("organic_results", [])[:3],
                "knowledge_graph": results.get("knowledge_graph", {})
            }
        except Exception as e:
            logging.error(f"Error fetching SERP data for {company_name}: {str(e)}")
            return {}

    def update_leads(self):
        try:
            logging.info("Starting lead update process")
            new_data = self.scrape_crunchbase_data()
        
            if not new_data:
                error_msg = "No new data retrieved from Crunchbase"
                self.errors.append(error_msg)
                logging.warning(error_msg)
                return
        
            new_leads = []
            for item in new_data:
                properties = item.get('properties', {})
                
                lead = Lead(
                    company_name=properties.get('name', ''),
                    email='',
                    website=properties.get('website_url', ''),
                    timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    description=properties.get('short_description', '')
                )
                
                if lead.company_name:
                    new_leads.append(lead)
            
            logging.info(f"Created {len(new_leads)} new lead objects")
            
        
            enriched_leads = []
            for lead in new_leads:
                enriched_lead = self.enrich_with_gemini(lead)
                enriched_lead.serp_data = self.get_serp_data(enriched_lead.company_name)
                enriched_leads.append(enriched_lead)
                time.sleep(2)  
            
            self.leads.extend(enriched_leads)
            self.last_update = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logging.info(f"Successfully added {len(enriched_leads)} new leads")
            
        except Exception as e:
            error_msg = f"Unexpected error during lead update: {str(e)}"
            self.errors.append(error_msg)
            logging.error(error_msg)


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.FileHandler('lead_generation.log'),
        logging.StreamHandler()
    ]
)


app = Flask(__name__)
CORS(app)
lead_system = LeadGenerationSystem()

@app.route('/api/leads', methods=['GET'])
def get_leads():
    return jsonify({
        'leads': [vars(lead) for lead in lead_system.leads[-100:]],
        'total_leads': len(lead_system.leads),
        'enriched_leads': len([lead for lead in lead_system.leads if lead.enriched]),
        'last_update': lead_system.last_update
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    return jsonify({
        'total_leads': len(lead_system.leads),
        'enriched_leads': len([lead for lead in lead_system.leads if lead.enriched]),
        'last_update': lead_system.last_update,
        'errors': lead_system.errors[-5:],
        'status': 'active' if len(lead_system.errors) < 5 else 'warning'
    })

@app.route('/api/errors', methods=['GET'])
def get_errors():
    return jsonify({
        'errors': lead_system.errors[-50:],
        'total_errors': len(lead_system.errors)
    })

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == '__main__':
    
    schedule.every(4).hours.do(lead_system.update_leads)


    logging.info("Performing initial lead update")
    lead_system.update_leads()


    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = True
    scheduler_thread.start()
    logging.info("Scheduler started")

    
    app.run(debug=True, port=5000)