# 🎯 ProspectIQ

Your AI-Powered B2B Lead Generation Engine! Transform your sales prospecting with intelligent data enrichment and real-time insights. 🚀
<div align="center">
  <a href="https://youtu.be/_0m_WN30bLk">
    <img src="https://img.youtube.com/vi/_0m_WN30bLk/hqdefault.jpg" alt="AutoML-MLOps Demo" />
  </a>
</div>


## ✨ Features

- **🤖 Automated Lead Generation**
  - Seamless integration with Crunchbase API
  - Continuous company data scraping
  - Fresh leads delivered to your dashboard

- **🧠 AI-Powered Data Enrichment**
  - Powered by Google's Gemini API
  - Smart analysis of company profiles
  - Rich, contextual insights for each prospect

- **🔍 SERP Intelligence**
  - Real-time search engine data integration
  - Comprehensive company digital footprint
  - Latest news and updates about prospects

- **📊 Dynamic Dashboard**
  - Real-time lead generation metrics
  - Interactive data visualizations
  - Key performance indicators at a glance

- **🔄 Always Fresh Data**
  - Automatic updates every 4 hours
  - Historical data tracking
  - Never work with stale information

## 🛠️ Tech Stack

- **Backend**: Flask (Python) 🐍
- **Frontend**: React with Next.js ⚛️
- **Powerful APIs**: 
  - Crunchbase API for company data 📈
  - Google's Gemini API for intelligent enrichment 🤖
  - SerpAPI for search insights 🔍

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prospectiq.git
   ```

2. **Set up the backend**
   ```bash
   pip install flask flask-cors schedule requests
   ```

3. **Set up the frontend**
   ```bash
   npm install
   ```

4. **Configure environment variables**
   - Create `.env` file in root directory
   - Add your API keys:
     ```
     CRUNCHBASE_API_KEY=your_key_here
     GEMINI_API_KEY=your_key_here
     SERPAPI_KEY=your_key_here
     ```

5. **Launch the backend server**
   ```bash
   python app.py
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## 🔌 API Endpoints

### Core Endpoints

- **GET `/api/leads`**
  - Retrieve latest generated leads
  - Returns paginated list of enriched company data

- **GET `/api/stats`**
  - Fetch system performance metrics
  - Includes lead generation statistics

- **GET `/api/errors`**
  - Access system error logs
  - Helpful for troubleshooting

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Support & Feedback

Have questions or suggestions? Feel free to:
- Open an issue
- Start a discussion
- Submit a feature request

---
Built with 💪 for modern sales teams
