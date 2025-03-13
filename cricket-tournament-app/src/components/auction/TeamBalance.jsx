import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiUsers, FiPieChart, FiActivity, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { GiCricketBat, GiBaseballGlove } from 'react-icons/gi';
import { IoBaseballOutline } from 'react-icons/io5';
import { BsShieldFill } from 'react-icons/bs';
import styles from './TeamBalance.module.css';

const TeamBalance = ({ team, currentBid= [] }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  
  // Return null if team data is not available
  if (!team) return null;
  
  // Calculate budget metrics
  const budgetPercentage = (team.budget / team.initialBudget) * 100;
  const budgetSpent = team.initialBudget - team.budget;
  const budgetSpentPercentage = 100 - budgetPercentage;
  
  // Calculate if team can afford the next bid
  const nextBidAmount = Math.floor(currentBid * 1.05); // 5% increment
  const canAffordNextBid = team.budget >= nextBidAmount;
  
  // Calculate player slots
  const slotsFilled = team.slots.filled || 0;
  const slotsTotal = team.slots.total || 18;
  const slotsRemaining = slotsTotal - slotsFilled;
  const slotsPercentage = (slotsFilled / slotsTotal) * 100;
  
  // Count player types
  const batsmen = team.players?.filter(p => p.role === 'batsman').length || 0;
  const bowlers = team.players?.filter(p => p.role === 'bowler').length || 0;
  const allRounders = team.players?.filter(p => p.role === 'all-rounder').length || 0;
  const wicketKeepers = team.players?.filter(p => p.role === 'wicket-keeper').length || 0;
  
  // Calculate average player cost
  const averageCost = slotsFilled > 0 
    ? Math.round(budgetSpent / slotsFilled) 
    : 0;
  
  // Determine budget status color
  const getBudgetStatusColor = () => {
    if (budgetPercentage > 50) return styles.healthy;
    if (budgetPercentage > 20) return styles.warning;
    return styles.critical;
  };
  
  return (
    <motion.div 
      className={styles.teamBalanceCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Team Header */}
      <div className={styles.teamHeader}>
        <div className={styles.teamIdentity}>
          <motion.div 
            className={styles.teamIconContainer}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <span className={styles.teamIcon}>{team.icon || '🏏'}</span>
          </motion.div>
          <div className={styles.teamDetails}>
            <h3>{team.name}</h3>
            <p className={styles.teamOwner}>{team.owner || 'Team Owner'}</p>
          </div>
        </div>
        <motion.button 
          className={styles.detailsToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? <FiChevronUp /> : <FiChevronDown />}
        </motion.button>
      </div>
      
      {/* Budget Overview */}
      <div className={styles.budgetOverview}>
        <div className={styles.budgetHeader}>
          <div className={styles.budgetLabel}>
            <FiDollarSign />
            <span>Team Budget</span>
          </div>
          <div className={`${styles.budgetAmount} ${getBudgetStatusColor()}`}>
            ₹{team.budget.toLocaleString()}
          </div>
        </div>
        
        <div className={styles.budgetBarContainer}>
          <motion.div 
            className={`${styles.budgetBar} ${getBudgetStatusColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${budgetPercentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        
        <div className={styles.budgetMetrics}>
          <div className={styles.metric}>
            <span>Initial</span>
            <span>₹{team.initialBudget.toLocaleString()}</span>
          </div>
          <div className={styles.metric}>
            <span>Spent</span>
            <span>{budgetSpentPercentage.toFixed(1)}%</span>
          </div>
          <div className={styles.metric}>
            <span>Remaining</span>
            <span>{budgetPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      {/* Quick Stats Row */}
      <div className={styles.quickStats}>
        <div className={styles.statBox}>
          <FiUsers className={styles.statIcon} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{slotsFilled}/{slotsTotal}</span>
            <span className={styles.statLabel}>Players</span>
          </div>
        </div>
        
        <div className={styles.statBox}>
          <FiDollarSign className={styles.statIcon} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>₹{averageCost.toLocaleString()}</span>
            <span className={styles.statLabel}>Avg. Cost</span>
          </div>
        </div>
        
        <div className={styles.statBox}>
          <FiPieChart className={styles.statIcon} />
          <div className={styles.statContent}>
            <span className={styles.statValue}>{slotsRemaining}</span>
            <span className={styles.statLabel}>Remaining</span>
          </div>
        </div>
      </div>
      
      {/* Next Bid Section */}
      <div className={styles.nextBidSection}>
        <div className={styles.nextBidHeader}>
          <span>Next Bid Amount</span>
          <motion.span 
            className={`${styles.nextBidAmount} ${canAffordNextBid ? styles.affordable : styles.unaffordable}`}
            animate={canAffordNextBid ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ₹{nextBidAmount.toLocaleString()}
          </motion.span>
        </div>
        
        {!canAffordNextBid && (
          <div className={styles.bidWarning}>
            <FiActivity className={styles.warningIcon} />
            <span>Insufficient budget for next bid</span>
          </div>
        )}
      </div>
      
      {/* Expanded Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div 
            className={styles.expandedDetails}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Tabs */}
            <div className={styles.detailsTabs}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'players' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('players')}
              >
                Players
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'transactions' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'stats' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                Stats
              </button>
            </div>
            
            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'players' && (
                <div className={styles.playersBreakdown}>
                  <h4>Players by Role</h4>
                  
                  <div className={styles.roleGrid}>
                    <div className={styles.roleItem}>
                      <div className={styles.roleIconContainer}>
                        <GiCricketBat className={styles.roleIcon} />
                      </div>
                      <div className={styles.roleDetails}>
                        <span className={styles.roleName}>Batsmen</span>
                        <span className={styles.roleCount}>{batsmen}</span>
                      </div>
                    </div>
                    
                    <div className={styles.roleItem}>
                      <div className={styles.roleIconContainer}>
                        <GiBaseballGlove className={styles.roleIcon} />
                      </div>
                      <div className={styles.roleDetails}>
                        <span className={styles.roleName}>Bowlers</span>
                        <span className={styles.roleCount}>{bowlers}</span>
                      </div>
                    </div>
                    
                    <div className={styles.roleItem}>
                      <div className={styles.roleIconContainer}>
                        <IoBaseballOutline className={styles.roleIcon} />
                      </div>
                      <div className={styles.roleDetails}>
                        <span className={styles.roleName}>All-Rounders</span>
                        <span className={styles.roleCount}>{allRounders}</span>
                      </div>
                    </div>
                    
                    <div className={styles.roleItem}>
                      <div className={styles.roleIconContainer}>
                        <BsShieldFill className={styles.roleIcon} />
                      </div>
                      <div className={styles.roleDetails}>
                        <span className={styles.roleName}>Wicket-Keepers</span>
                        <span className={styles.roleCount}>{wicketKeepers}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.slotProgress}>
                    <div className={styles.slotHeader}>
                      <span>Squad Completion</span>
                      <span>{slotsFilled}/{slotsTotal} ({Math.round(slotsPercentage)}%)</span>
                    </div>
                    <div className={styles.slotBar}>
                      <motion.div 
                        className={styles.slotFilled}
                        initial={{ width: 0 }}
                        animate={{ width: `${slotsPercentage}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'transactions' && (
                <div className={styles.transactionsTab}>
                  <h4>Recent Acquisitions</h4>
                  
                  {team.players && team.players.length > 0 ? (
                    <div className={styles.transactionsList}>
                      {team.players.slice(-3).reverse().map((player, index) => (
                        <motion.div 
                          key={player.id || index}
                          className={styles.transactionItem}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className={styles.playerBasicInfo}>
                            <span className={styles.playerName}>{player.name}</span>
                            <span className={`${styles.playerRole} ${styles[player.role]}`}>
                              {player.role}
                            </span>
                          </div>
                          <div className={styles.transactionAmount}>
                            ₹{player.price ? player.price.toLocaleString() : 'N/A'}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No players acquired yet</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'stats' && (
                <div className={styles.statsTab}>
                  <h4>Team Analytics</h4>
                  
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statCardLabel}>Max Spent</span>
                      <span className={styles.statCardValue}>
                        ₹{team.players?.length > 0 
                          ? Math.max(...team.players.map(p => p.price || 0)).toLocaleString() 
                          : 0}
                      </span>
                    </div>
                    
                    <div className={styles.statCard}>
                      <span className={styles.statCardLabel}>Min Spent</span>
                      <span className={styles.statCardValue}>
                        ₹{team.players?.length > 0 
                          ? Math.min(...team.players.filter(p => p.price > 0).map(p => p.price || 0)).toLocaleString() 
                          : 0}
                      </span>
                    </div>
                    
                    <div className={styles.statCard}>
                      <span className={styles.statCardLabel}>Budget Efficiency</span>
                      <span className={styles.statCardValue}>
                        {budgetSpentPercentage > 0 && slotsFilled > 0
                          ? `${(slotsFilled / slotsTotal * 100 / budgetSpentPercentage * 100).toFixed(0)}%`
                          : '100%'}
                      </span>
                    </div>
                    
                    <div className={styles.statCard}>
                      <span className={styles.statCardLabel}>Projected Value</span>
                      <span className={styles.statCardValue}>
                        {slotsFilled > 0 ? (slotsFilled * 5).toFixed(1) : 0} pts
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TeamBalance;