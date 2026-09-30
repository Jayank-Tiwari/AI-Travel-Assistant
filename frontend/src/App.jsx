import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Plane, MapPin, Sparkles, Navigation, Compass, Loader2 } from 'lucide-react'
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
      const data = await response.json()
      setOutput(data.output)
    } catch (err) {
      setOutput('Error generating itinerary. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Header */}
      <header className="pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl">
            <Compass className="w-12 h-12 text-teal-300 animate-[spin_10s_linear_infinite]" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300 mb-4 drop-shadow-sm">
          Wanderlust AI
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-indigo-200/80 font-light">
          Your personal AI travel concierge. Turn your wildest dreams into a fully grounded, priced reality.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Input Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8">
          
          <div className="mb-8">
            <h2 className="flex items-center text-2xl font-bold text-white mb-6">
              <MapPin className="w-6 h-6 mr-3 text-teal-400" />
              Test Scenarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedReq(r)
                    handleGenerate(r)
                  }}
                  className="group relative overflow-hidden text-left p-5 rounded-2xl transition-all duration-300 bg-white/5 border border-white/10 hover:bg-white/15 hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Navigation className="w-5 h-5 text-teal-400 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300" />
                  </div>
                  <div className="font-semibold text-teal-300 mb-2">{r.id}</div>
                  <div className="text-sm text-indigo-100/70 leading-relaxed">{r.text}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-3 text-sm text-indigo-300 font-medium tracking-widest uppercase">Or craft your own</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Sparkles className="h-5 w-5 text-teal-400" />
                </div>
                <input 
                  type="text" 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="E.g., 5 days in Paris for a honeymoon on a $3000 budget"
                  className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-indigo-200/50 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white/10 transition-all shadow-inner"
                />
              </div>
              <button 
                onClick={() => handleGenerate({ id: 'CUSTOM', text: customText })}
                disabled={!customText || loading}
                className="flex items-center justify-center px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)] transform hover:-translate-y-0.5"
              >
                <Plane className="w-5 h-5 mr-2" />
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="w-16 h-16 text-teal-400 animate-spin mb-6" />
            <p className="text-xl text-teal-200 font-medium">Curating your perfect itinerary...</p>
          </div>
        )}

        {output && !loading && (
          <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border-0 transform transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 px-8 py-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                <Sparkles className="w-6 h-6 mr-3" />
                Your Tailored Experience
              </h3>
            </div>
            <div className="p-8 md:p-12 prose prose-lg prose-slate max-w-none prose-headings:text-indigo-900 prose-a:text-teal-600 hover:prose-a:text-teal-500 prose-strong:text-slate-800 prose-table:border-collapse prose-th:bg-indigo-50 prose-th:text-indigo-900 prose-th:p-4 prose-td:p-4 prose-td:border-b prose-td:border-slate-200 prose-tr:hover:bg-slate-50 transition-colors">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
