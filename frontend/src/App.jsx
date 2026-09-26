import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './index.css'

function App() {
  const [requests, setRequests] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [customText, setCustomText] = useState('')
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/requests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error("Failed to fetch requests", err))
  }, [])

  const handleGenerate = async (req) => {
    setLoading(true)
    setOutput('')
    try {
      const response = await fetch('http://localhost:8000/generate', {
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Travel Assistant</h1>
          <p className="mt-2 text-lg text-gray-600">Select a request or write your own to generate a grounded itinerary.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Test Requests</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedReq(r)
                  handleGenerate(r)
                }}
                className="w-full text-left p-4 border rounded-md hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
              >
                <div className="font-medium text-indigo-600">{r.id}</div>
                <div className="text-gray-700 mt-1">{r.text}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Request</h2>
            <div className="flex space-x-3">
              <input 
                type="text" 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="E.g., 3 days in Paris on a budget"
                className="flex-1 border-gray-300 rounded-md shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button 
                onClick={() => handleGenerate({ id: 'CUSTOM', text: customText })}
                disabled={!customText || loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {output && !loading && (
          <div className="bg-white shadow rounded-lg p-8 prose prose-indigo max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
