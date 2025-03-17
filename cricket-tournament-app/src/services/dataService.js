// Implement cross-device storage using Firebase or a simple REST API
import { nanoid } from 'nanoid';

// For development, simulate a database with localStorage but with validation
const DB_KEY = 'cricket_tournaments_db';

// Initialize database
const initializeDB = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
  }
  return JSON.parse(localStorage.getItem(DB_KEY));
};

export const createTournament = (tournamentData) => {
  const db = initializeDB();
  const id = nanoid(10);
  const captainCode = Math.floor(100000 + Math.random() * 900000).toString();
  const viewerCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const tournament = {
    ...tournamentData,
    id,
    captainCode,
    viewerCode,
    createdAt: new Date().toISOString()
  };
  
  db.push(tournament);
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  
  // For production, this would be an API call
  // return apiClient.post('/tournaments', tournament);
  
  return { id, captainCode, viewerCode };
};

export const validateTournamentCode = (code, type) => {
  const db = initializeDB();
  const tournament = db.find(t => 
    type === 'captain' ? t.captainCode === code : t.viewerCode === code
  );
  
  if (!tournament) {
    return { valid: false };
  }
  
  return { valid: true, tournamentId: tournament.id };
};

export const getTournamentById = (id) => {
  const db = initializeDB();
  return db.find(t => t.id === id) || null;
};