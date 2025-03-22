import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTournament } from '../../contexts/TournamentContext';

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [tournamentList, setTournamentList] = useState([]);
  const { tournaments, getTournament } = useTournament();

  // Load tournament list
  useEffect(() => {
    if (tournaments) {
      const list = Object.values(tournaments).map(t => ({
        id: t.id,
        name: t.name,
        createdAt: t.createdAt
      }));
      setTournamentList(list);
    }
  }, [tournaments]);

  // Export tournament
  const handleExport = async (id) => {
    try {
      const tournament = await getTournament(id);
      if (!tournament) {
        toast.error('Tournament not found');
        return;
      }
      
      // Convert to base64
      const code = btoa(JSON.stringify(tournament));
      navigator.clipboard.writeText(code);
      toast.success('Tournament code copied! You can paste it in another browser/port');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export tournament');
    }
  };

  // Import tournament
  const handleImport = () => {
    try {
      // Validate input
      if (!importCode.trim()) {
        toast.error('Please paste a tournament code first');
        return;
      }
      
      // Decode from base64
      let tournamentData;
      try {
        tournamentData = JSON.parse(atob(importCode.trim()));
      } catch (e) {
        toast.error('Invalid tournament code format');
        return;
      }
      
      // Validate basic structure
      if (!tournamentData.id || !tournamentData.name) {
        toast.error('Invalid tournament data structure');
        return;
      }
      
      // Get existing tournaments from localStorage
      const storageKey = 'cricket_tournaments';
      let storedItem = localStorage.getItem(storageKey);
      let existingData = {};
      
      if (storedItem) {
        try {
          const storageObj = JSON.parse(storedItem);
          existingData = storageObj.data || {};
        } catch (e) {
          console.error('Error parsing existing tournaments', e);
        }
      }
      
      // Check if tournament already exists
      if (existingData[tournamentData.id]) {
        toast.info(`Tournament "${tournamentData.name}" already exists`);
        return;
      }
      
      // Add new tournament
      existingData[tournamentData.id] = tournamentData;
      
      // Save back to localStorage
      const saveObject = {
        data: existingData,
        timestamp: Date.now()
      };
      
      localStorage.setItem(storageKey, JSON.stringify(saveObject));
      
      // Clear input and show success
      setImportCode('');
      toast.success(`Tournament "${tournamentData.name}" imported successfully!`);
      
      // Reload to update state
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import tournament: ' + (error.message || 'Unknown error'));
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-900 p-2 rounded-full shadow-lg z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-900 border border-blue-800 rounded-lg shadow-lg z-50 p-4 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">Dev Tools</h3>
        <button onClick={() => setIsOpen(false)} className="text-blue-300 hover:text-blue-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Export Tournaments */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-blue-300 mb-2">Export Tournament</h4>
        <div className="bg-slate-800 rounded p-2 max-h-36 overflow-y-auto">
          {tournamentList.length > 0 ? (
            tournamentList.map(t => (
              <div key={t.id} className="flex justify-between items-center py-1">
                <span className="text-white text-sm truncate mr-2">{t.name}</span>
                <button 
                  onClick={() => handleExport(t.id)}
                  className="bg-blue-700 hover:bg-blue-600 text-xs text-white px-2 py-1 rounded"
                >
                  Copy Code
                </button>
              </div>
            ))
          ) : (
            <p className="text-blue-400 text-sm">No tournaments found</p>
          )}
        </div>
      </div>
      
      {/* Import Tournament */}
      <div>
        <h4 className="text-sm font-medium text-blue-300 mb-2">Import Tournament</h4>
        <div className="space-y-2">
          <textarea 
            value={importCode}
            onChange={(e) => setImportCode(e.target.value)}
            placeholder="Paste tournament code here..."
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
            rows={3}
          />
          <button
            onClick={handleImport}
            disabled={!importCode.trim()}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm w-full"
          >
            Import Tournament
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-blue-400">
        <p>To share a tournament between ports:</p>
        <ol className="list-decimal list-inside mt-1">
          <li>Copy the tournament code</li>
          <li>Open your app on another port</li>
          <li>Paste the code here and click Import</li>
        </ol>
      </div>
    </div>
  );
};

export default DevTools;