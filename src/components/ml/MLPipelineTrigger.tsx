import React, { useState } from 'react';
import { Brain, Terminal, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * ML Pipeline Integration Component
 * 
 * This component provides a UI for triggering the oil spill detection ML pipeline.
 * 
 * Architecture Note:
 * - The ML pipeline (run-ml-pipeline.ts) runs in Node.js, not the browser
 * - It downloads Sentinel imagery, runs PyTorch inference, and saves results
 * - This component shows instructions for running the pipeline manually
 * 
 * Future Enhancement:
 * - Create a simple Express/Fastify backend endpoint
 * - Call the endpoint from this component
 * - Stream real-time progress updates
 */
const MLPipelineTrigger: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
      >
        <Brain className="w-5 h-5" />
        <span className="font-medium">Run ML Detection Pipeline</span>
      </button>

      {showInstructions && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-purple-900">
                ML Pipeline runs server-side (Node.js + Python)
              </p>
              <p className="text-purple-800">
                The pipeline downloads Sentinel satellite imagery from Copernicus, 
                runs ResNet18 inference, and classifies oil spills automatically.
              </p>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-4 space-y-3 border border-purple-200">
            <div className="flex items-center gap-2 text-purple-900 font-semibold">
              <Terminal className="w-4 h-4" />
              <span>Run Pipeline Manually</span>
            </div>
            
            <div className="space-y-2">
              <div className="font-mono text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                <div># Set Copernicus credentials</div>
                <div>export COPERNICUS_USERNAME="your_username"</div>
                <div>export COPERNICUS_PASSWORD="your_password"</div>
                <div className="mt-2"># Run the pipeline</div>
                <div>npx tsx src/scripts/run-ml-pipeline.ts</div>
              </div>
              
              <div className="flex items-start gap-2 text-xs text-purple-700">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Results are saved to <code className="bg-purple-100 px-1 rounded">temp_inference/output/oil/</code> and <code className="bg-purple-100 px-1 rounded">no_oil/</code>
                </span>
              </div>

              <div className="flex items-start gap-2 text-xs text-purple-700">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  The script can be extended to automatically insert results into Supabase
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="text-sm font-semibold text-blue-900">
              🚀 Future Enhancement: Backend API
            </div>
            <div className="text-xs text-blue-800 space-y-1">
              <p>To run the pipeline from the UI, create a simple backend:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Express/Fastify endpoint: <code className="bg-blue-100 px-1 rounded">POST /api/run-ml-pipeline</code></li>
                <li>Accept parameters: lat, lon, date range, bbox</li>
                <li>Stream progress via Server-Sent Events (SSE)</li>
                <li>Insert results directly into Supabase</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="https://dataspace.copernicus.eu/explore-data/data-collections"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Learn about Copernicus Data <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLPipelineTrigger;
