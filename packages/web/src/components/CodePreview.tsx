import { useState } from 'react';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface GenerationResult {
  files: GeneratedFile[];
  instructions: string;
  nextSteps: string[];
}

interface CodePreviewProps {
  result: GenerationResult;
}

export function CodePreview({ result }: CodePreviewProps) {
  const [selectedFile, setSelectedFile] = useState(0);

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    result.files.forEach(file => downloadFile(file));
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">Generated Code</h2>
        </div>
        <button
          onClick={downloadAll}
          className="btn-secondary flex items-center text-sm"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download All
        </button>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {result.files.map((file, index) => (
            <button
              key={index}
              onClick={() => setSelectedFile(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedFile === index
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center">
                {file.language === 'rust' && '🦀'}
                {file.language === 'typescript' && '📘'}
                {file.language === 'toml' && '⚙️'}
                {file.language === 'json' && '📋'}
                <span className="ml-1.5">{file.path.split('/').pop()}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 text-sm text-gray-500">
          <span className="font-medium">Full path:</span> {result.files[selectedFile].path}
        </div>
      </div>

      <div className="code-block">
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <span className="text-gray-300 text-sm font-mono">
            {result.files[selectedFile].path}
          </span>
          <button
            onClick={() => downloadFile(result.files[selectedFile])}
            className="text-gray-400 hover:text-white text-sm flex items-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Copy
          </button>
        </div>
        <pre className="text-gray-100 text-sm overflow-x-auto">
          <code>{result.files[selectedFile].content}</code>
        </pre>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Next Steps
          </h3>
          <ol className="space-y-2">
            {result.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center font-semibold mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {result.instructions && (
          <div className="card bg-purple-50 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instructions
            </h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
              {result.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

