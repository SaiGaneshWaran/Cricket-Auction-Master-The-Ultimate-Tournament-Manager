import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';

const TeamStrengthRating = ({ 
  team, 
  teamBalance, 
  players = [], 
  allTeams = [],
  allTeamBalances = {}
}) => {
  // Calculate team strength in different categories
  const strengthRatings = useMemo(() => {
    // Base categories
    const ratings = {
      batting: 0,
      bowling: 0,
      fielding: 0,
      experience: 0,
      balance: 0
    };
    
    if (players.length === 0) return ratings;
    
    // Calculate batting strength
    const batsmen = players.filter(p => p.role === 'batsman' || p.role === 'wicketKeeper');
    const battingAvg = batsmen.reduce((sum, p) => sum + p.stats.battingAverage, 0) / Math.max(1, batsmen.length);
    const strikeRate = batsmen.reduce((sum, p) => sum + p.stats.battingStrikeRate, 0) / Math.max(1, batsmen.length);
    
    // Normalize batting stats to 0-100 scale
    ratings.batting = Math.min(100, (
      (battingAvg / 50) * 50 + // 50% weight for batting average (normalized to 50)
      (strikeRate / 150) * 50   // 50% weight for strike rate (normalized to 150)
    ));
    
    // Calculate bowling strength
    const bowlers = players.filter(p => p.role === 'bowler' || p.role === 'allRounder');
    const wicketsPerMatch = bowlers.reduce((sum, p) => sum + (p.stats.wickets / Math.max(1, p.stats.matches)), 0) / Math.max(1, bowlers.length);
    const economy = bowlers.reduce((sum, p) => sum + p.stats.economyRate, 0) / Math.max(1, bowlers.length);
    
    // Normalize bowling stats to 0-100 scale
    ratings.bowling = Math.min(100, (
      (wicketsPerMatch / 2) * 50 + // 50% weight for wickets per match (normalized to 2 per match)
      ((10 - economy) / 5) * 50    // 50% weight for economy (normalized to ideal economy of 5, reversed scale)
    ));
    
    // Calculate fielding strength (based on presence of wicketkeepers and all-rounders)
    const wicketKeepers = players.filter(p => p.role === 'wicketKeeper').length;
    const allRounders = players.filter(p => p.role === 'allRounder').length;
    
    ratings.fielding = Math.min(100, (
      (wicketKeepers > 0 ? 30 : 0) +            // 30% for having at least one wicketkeeper
      (Math.min(allRounders, 3) / 3) * 30 +     // 30% for having up to 3 all-rounders
      (players.length / 11) * 40                // 40% for team completeness (up to 11 players)
    ));
    
    // Calculate experience rating
    const avgMatches = players.reduce((sum, p) => sum + p.stats.matches, 0) / players.length;
    ratings.experience = Math.min(100, (avgMatches / 100) * 100); // Normalized to 100 matches
    
    // Calculate team balance (proper distribution of roles)
    const roleDistribution = {
      batsman: players.filter(p => p.role === 'batsman').length,
      bowler: players.filter(p => p.role === 'bowler').length,
      allRounder: players.filter(p => p.role === 'allRounder').length,
      wicketKeeper: players.filter(p => p.role === 'wicketKeeper').length,
    };
    
    // Ideal distribution: 4-5 batsmen, 4-5 bowlers, 1-3 all-rounders, 1-2 wicket-keepers
    ratings.balance = Math.min(100, (
      (Math.min(roleDistribution.batsman, 5) / 5) * 25 +               // 25% for batsmen
      (Math.min(roleDistribution.bowler, 5) / 5) * 25 +                // 25% for bowlers
      (Math.min(roleDistribution.allRounder, 3) / 3) * 25 +            // 25% for all-rounders
      (roleDistribution.wicketKeeper > 0 ? 25 : 0)                      // 25% for having a wicket-keeper
    ));
    
    return ratings;
  }, [players]);
  
  // Calculate overall strength
  const overallStrength = useMemo(() => {
    if (players.length === 0) return 0;
    
    // Weighted average of all ratings
    return Math.round(
      (strengthRatings.batting * 0.3) +     // 30% weight for batting
      (strengthRatings.bowling * 0.3) +     // 30% weight for bowling
      (strengthRatings.fielding * 0.15) +   // 15% weight for fielding
      (strengthRatings.experience * 0.1) +  // 10% weight for experience
      (strengthRatings.balance * 0.15)      // 15% weight for team balance
    );
  }, [strengthRatings, players]);
  
  // Calculate team rank among all teams
  const teamRank = useMemo(() => {
    // If there are no other teams, rank is 1
    if (allTeams.length <= 1) return 1;
    
    // Calculate strength ratings for all teams
    const teamStrengths = allTeams.map(t => {
      const teamPlayers = players;
      
      if (t.id === team.id) {
        return { id: t.id, name: t.name, strength: overallStrength };
      }
      
      // Calculate strength for other teams (simplified version)
      // In a real app, you would use the same calculation as above
      const otherTeamPlayers = Object.values(allTeamBalances[t.id]?.players || []);
      const strength = otherTeamPlayers.reduce((sum, p) => sum + p.stats.battingAverage + p.stats.wickets, 0) / Math.max(1, otherTeamPlayers.length);
      
      return { id: t.id, name: t.name, strength: Math.min(100, strength) };
    });
    
    // Sort teams by strength
    const sortedTeams = [...teamStrengths].sort((a, b) => b.strength - a.strength);
    
    // Find the rank of the current team
    return sortedTeams.findIndex(t => t.id === team.id) + 1;
  }, [allTeams, team, overallStrength, players, allTeamBalances]);
  
  // Category labels with descriptions
  const categories = [
    { 
      id: 'batting', 
      label: 'Batting', 
      description: 'Based on batting averages and strike rates',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 19V7L20 4V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 22V17L7 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 22V17L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'bowling', 
      label: 'Bowling', 
      description: 'Based on wickets taken and economy rate',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15L6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'fielding', 
      label: 'Fielding', 
      description: 'Based on team composition and roles',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 12L11 15L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      id: 'experience', 
      label: 'Experience', 
      description: 'Based on average matches played',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'balance', 
      label: 'Team Balance', 
      description: 'Based on role distribution',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      )
    }
  ];
  
  // Get grade based on score
  const getGrade = (score) => {
    if (score >= 90) return { letter: 'A+', color: 'text-green-400' };
    if (score >= 80) return { letter: 'A', color: 'text-green-500' };
    if (score >= 70) return { letter: 'B+', color: 'text-green-600' };
    if (score >= 60) return { letter: 'B', color: 'text-yellow-400' };
    if (score >= 50) return { letter: 'C+', color: 'text-yellow-500' };
    if (score >= 40) return { letter: 'C', color: 'text-yellow-600' };
    if (score >= 30) return { letter: 'D+', color: 'text-orange-400' };
    if (score >= 20) return { letter: 'D', color: 'text-orange-500' };
    return { letter: 'F', color: 'text-red-500' };
  };
  
  // Get bar colors based on score
  const getBarColor = (score) => {
    if (score >= 70) return 'bg-gradient-to-r from-green-500 to-emerald-600';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-400';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const barVariants = {
    hidden: { width: 0 },
    visible: width => ({
      width: `${width}%`,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    })
  };
  
  return (
    <Card variant="glass">
      <div className="p-4 border-b border-blue-800 flex justify-between items-center">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
            style={{ backgroundColor: team.color }}
          >
            {team.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white">{team.name} Strength Analysis</h2>
        </div>
        
        <div className="flex items-center bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full">
          <p className="text-blue-300 text-sm mr-2">Team Rank:</p>
          <p className="text-lg font-bold text-white">{teamRank}/{allTeams.length}</p>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Strength Card */}
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Overall Team Strength</h3>
          
          <div className="flex flex-col items-center justify-center">
            {/* Circular gauge */}
            <div className="relative w-48 h-48 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="transparent" 
                  stroke="#1E293B" 
                  strokeWidth="10" 
                />
                
                {/* Progress circle with gradient */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="transparent" 
                  stroke="url(#strengthGradient)" 
                  strokeWidth="10" 
                  strokeDasharray={`${2 * Math.PI * 45}`} 
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - overallStrength / 100)}`} 
                  transform="rotate(-90 50 50)" 
                  strokeLinecap="round"
                />
                
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="strengthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-white">{overallStrength}</p>
                <p className="text-blue-300 text-sm">out of 100</p>
                <p className={`text-xl font-bold mt-1 ${getGrade(overallStrength).color}`}>
                  Grade: {getGrade(overallStrength).letter}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-white font-medium text-lg mb-1">Team Strength Assessment</p>
              <p className="text-blue-300 text-sm max-w-xs mx-auto">
                {overallStrength >= 80 
                  ? "Outstanding team with exceptional balance and skill in all departments!"
                  : overallStrength >= 60
                  ? "Strong team with good overall balance and few weaknesses."
                  : overallStrength >= 40
                  ? "Average team with some strengths but room for improvement."
                  : "Developing team that needs strengthening in multiple areas."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Strength by Category */}
        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Strength by Category</h3>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {categories.map(category => {
              const score = Math.round(strengthRatings[category.id]);
              const grade = getGrade(score);
              
              return (
                <div key={category.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="text-blue-300 mr-2">{category.icon}</span>
                      <span className="text-white font-medium">{category.label}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white font-medium mr-2">{score}/100</span>
                      <span className={`font-bold ${grade.color}`}>{grade.letter}</span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-blue-900 rounded-full overflow-hidden">
                    <motion.div 
                      className={`absolute top-0 left-0 h-full ${getBarColor(score)}`}
                      custom={score}
                      variants={barVariants}
                    />
                  </div>
                  
                  <p className="text-xs text-blue-300 mt-1">{category.description}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
      
      {/* Team Composition Section */}
      <div className="p-4 bg-blue-900 bg-opacity-20 border-t border-blue-800">
        <h3 className="text-lg font-semibold text-white mb-4">Team Composition</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg text-center">
            <p className="text-blue-300 text-xs mb-1">Batsmen</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'batsman').length}</p>
            <div className="flex items-center justify-center mt-1">
              <span className={`text-xs font-medium ${
                players.filter(p => p.role === 'batsman').length >= 4 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {players.filter(p => p.role === 'batsman').length >= 4 ? 'Optimal' : 'Need more'}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg text-center">
            <p className="text-blue-300 text-xs mb-1">Bowlers</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'bowler').length}</p>
            <div className="flex items-center justify-center mt-1">
              <span className={`text-xs font-medium ${
                players.filter(p => p.role === 'bowler').length >= 4 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {players.filter(p => p.role === 'bowler').length >= 4 ? 'Optimal' : 'Need more'}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg text-center">
            <p className="text-blue-300 text-xs mb-1">All-Rounders</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'allRounder').length}</p>
            <div className="flex items-center justify-center mt-1">
              <span className={`text-xs font-medium ${
                players.filter(p => p.role === 'allRounder').length >= 1 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {players.filter(p => p.role === 'allRounder').length >= 1 ? 'Optimal' : 'Need more'}
              </span>
            </div>
          </div>
          
          <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg text-center">
            <p className="text-blue-300 text-xs mb-1">Wicket-Keepers</p>
            <p className="text-xl font-bold text-white">{players.filter(p => p.role === 'wicketKeeper').length}</p>
            <div className="flex items-center justify-center mt-1">
              <span className={`text-xs font-medium ${
                players.filter(p => p.role === 'wicketKeeper').length >= 1 ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {players.filter(p => p.role === 'wicketKeeper').length >= 1 ? 'Optimal' : 'Need more'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TeamStrengthRating;