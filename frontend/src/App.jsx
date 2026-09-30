import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Map, Plane, Compass, Loader2, Sparkles, Send, History, Settings, Copy, Download } from 'lucide-react'
import './index.css'

function App() {
  const [requests, setRequests] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [customText, setCustomText] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')

  useEffect(() => {
    fetch(`http://${window.location.hostname}/requests`)
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error("Failed to fetch requests", err))
  }, [])

  const handleGenerate = async (req) => {
    setLoading(true)
    setOutput('')
    try {
      const response = await fetch(`http://${window.location.hostname}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      })
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      setLoading(false)

      let currentOutput = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        currentOutput += text
        setOutput(currentOutput)
      }
    } catch (err) {
      setLoading(false)
      setOutput('Error connecting to AI Reasoning Engine.')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Plane className="w-5 h-5 text-indigo-600 mr-3" />
          <span className="font-semibold text-gray-800 tracking-tight">AI Travel Platform</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2 mt-4">
            Test Scenarios
          </div>
          <nav className="space-y-1">
            {requests.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedReq(r)
                  handleGenerate(r)
                }}
                className={`w-full flex items-center px-3 py-3 text-sm rounded-lg transition-colors text-left ${
                  selectedReq?.id === r.id 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Compass className={`w-4 h-4 mr-3 ${selectedReq?.id === r.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="truncate">{r.id} Request</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer">
            <Settings className="w-4 h-4 mr-3 text-gray-400" />
            Platform Settings
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center text-sm font-medium text-gray-800">
            Itinerary Generation Engine
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              System Online
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <History className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
              JT
            </div>
          </div>
        </header>

        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {!output && !loading && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Ready to plan a trip</h2>
                <p className="text-sm max-w-md text-center">
                  Select a test scenario from the sidebar or enter a custom traveler request below to generate a catalog-verified itinerary.
                </p>
              </div>
            )}
            
            {(output || loading) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-24">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
                    AI Reasoning Output
                  </div>
                  {output && !loading && (
                    <div className="flex space-x-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Copy to clipboard">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-center text-xs text-indigo-600 font-medium animate-pulse">
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Processing Request...
                    </div>
                  )}
                </div>
                
                <div className="p-8 prose prose-indigo max-w-none prose-headings:font-semibold prose-a:text-indigo-600 prose-table:border-collapse prose-th:bg-gray-50 prose-th:text-left prose-td:border-b prose-td:border-gray-200">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area (Sticky Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10 pb-6 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center bg-white border border-gray-300 shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
              <input 
                type="text" 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter a custom traveler request (e.g., '3 days in Paris for a family of 4 on a tight budget')..."
                className="w-full py-4 pl-6 pr-16 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customText && !loading) {
                    setSelectedReq(null)
                    handleGenerate({ id: 'CUSTOM', text: customText })
                  }
                }}
              />
              <button 
                onClick={() => {
                  setSelectedReq(null)
                  handleGenerate({ id: 'CUSTOM', text: customText })
                }}
                disabled={!customText || loading}
                className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-3 text-xs text-gray-400 font-medium">
              Responses are securely generated and verified against the supplier catalog.
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default App
