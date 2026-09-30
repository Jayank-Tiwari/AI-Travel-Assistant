import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MapPin, Send, Compass, Loader2 } from 'lucide-react'
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
      setOutput('Error generating itinerary. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      
      {/* Enterprise Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-lg tracking-tight">AI Travel Platform</span>
          </div>
          <div className="text-sm text-gray-500 font-medium">Internal Assessment</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header Text */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">Itinerary Generator</h1>
          <p className="text-gray-500 max-w-2xl">
            Process incoming traveler requests through the AI reasoning layer to generate grounded, catalog-verified itineraries and priced quotes.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
            {/* Quick Select */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  Pre-configured Tests
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReq(r)
                      handleGenerate(r)
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-50 group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{r.id}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">{r.text}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            {/* Custom Input */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-1">
              <div className="flex flex-col sm:flex-row">
                <input 
                  type="text" 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter a custom traveler request (e.g., 3 days in Paris on a budget)"
                  className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customText && !loading) {
                      handleGenerate({ id: 'CUSTOM', text: customText })
                    }
                  }}
                />
                <button 
                  onClick={() => handleGenerate({ id: 'CUSTOM', text: customText })}
                  disabled={!customText || loading}
                  className="m-1 flex items-center justify-center px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Generate
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col relative overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">AI Output</h3>
                {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
              </div>
              
              <div className="p-6 flex-1 bg-white overflow-auto">
                {!output && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-20">
                    <Compass className="w-12 h-12 text-gray-200" />
                    <p className="text-sm">Select a test request or enter a custom prompt to begin.</p>
                  </div>
                )}
                
                {output && (
                  <div className="prose prose-sm sm:prose-base prose-blue max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-table:border-collapse prose-th:bg-gray-50 prose-th:text-left prose-td:border-b prose-td:border-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default App
