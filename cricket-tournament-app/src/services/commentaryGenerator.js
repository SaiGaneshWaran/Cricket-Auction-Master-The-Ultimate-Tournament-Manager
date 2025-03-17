import { getRandomElement } from '../utils/helpers';

// Commentary templates for different events
const commentaryTemplates = {
  wicket: [
    "🔥 BOWLED! The stumps go flying as the ball crashes through the gate!",
    "👐 CAUGHT! Brilliant catch in the deep! The fielder makes it look so easy!",
    "👆 OUT LBW! The umpire raises the finger without hesitation!",
    "🏃 RUN OUT! Brilliant fielding and a direct hit at the stumps!",
    "💥 STUMPED! Lightning-quick work by the wicketkeeper!",
    "🎯 CLEAN BOWLED! The middle stump is uprooted!",
    "🙌 CAUGHT BEHIND! Edged and taken by the keeper!",
    "👏 CAUGHT AND BOWLED! The bowler takes a return catch!",
    "😲 OUT! What a delivery, absolutely unplayable!",
    "👋 GONE! That's a big wicket at a crucial time!"
  ],
  
  boundary: [
    "💨 FOUR! Beautifully timed shot through the covers!",
    "🏏 FOUR RUNS! Sweetly struck through the point region!",
    "👌 BOUNDARY! Elegant drive down the ground!",
    "💯 FOUR! Punched off the back foot for a delightful boundary!",
    "🔄 FOUR! Swept with precision to the square leg boundary!",
    "🎯 FOUR! Expertly guided past the fielder at third man!",
    "🚀 BOUNDARY! Cut away with tremendous power!",
    "⚡ FOUR RUNS! Late cut, played with soft hands for a boundary!",
    "✨ FOUR! The fielder dives but can't stop the ball racing to the boundary!",
    "🏆 BOUNDARY! What a shot, using the pace of the ball perfectly!"
  ],
  
  six: [
    "💥 SIX! That's huge! The ball sails into the crowd!",
    "🚀 MASSIVE SIX! That's disappeared out of the stadium!",
    "🔥 SIX RUNS! Magnificent hit over long-on!",
    "💪 HUGE SIX! Muscled over midwicket with ease!",
    "⚡ SIX! Standing tall and launching it over the bowler's head!",
    "🎆 MAXIMUM! What a shot, right into the top tier!",
    "🌟 SIX! Dancing down the track and clearing the boundary with ease!",
    "🏆 BIG SIX! Picked the length early and deposited it into the crowd!",
    "🔝 SIX RUNS! Brilliant use of the feet to get to the pitch and hit it clean!",
    "🌠 ENORMOUS SIX! That's the biggest hit of the match!"
  ],
  
  run: [
    "Good running between the wickets for a quick single!",
    "Pushed into the gap and they take an easy two runs!",
    "Excellent hustle for a well-judged three runs!",
    "Smart cricket, rotating the strike with a single!",
    "Finds the gap and comfortably takes a couple of runs!",
    "Good placement allows them to scamper through for a single!",
    "Alert running converts a tight single!",
    "Dropped into the outfield and they hurry back for two!",
    "Pushed to deep cover and they race back for a well-run three!",
    "No run there, good fielding prevents any score!"
  ],
  
  wide: [
    "Wide ball! That was well outside the off stump.",
    "Signaled wide by the umpire, straying down the leg side.",
    "That's too wide and the umpire extends his arms.",
    "Wide delivery, the batsman couldn't reach that even with a stretch.",
    "Another wide, the bowler is struggling with his line.",
    "Wide ball! The bowler needs to correct his line.",
    "That's called wide, barely missing the tramline.",
    "Wide delivery, gifting an extra run to the batting side.",
    "Umpire signals wide, bowler looking frustrated.",
    "Wide ball! The captain has a quick word with his bowler."
  ],
  
  noBall: [
    "NO BALL! The bowler has overstepped the line.",
    "Front foot no ball called by the umpire!",
    "Free hit coming up as the bowler delivers a no ball!",
    "No ball signaled! Height was the issue there.",
    "That's a no ball for overstepping! The batsman gets a free hit next ball.",
    "No ball called! The bowler needs to be careful.",
    "Umpire signals no ball! Extra run and a free hit to come.",
    "No ball! The bowler is having trouble with his front foot.",
    "Another no ball! The captain looks concerned.",
    "That's ruled a no ball! Pressure mounting on the bowler."
  ],
  
  legBye: [
    "Leg bye signaled by the umpire as the ball deflects off the pad.",
    "One run added as a leg bye.",
    "Flicked off the pads for a leg bye.",
    "They take a leg bye as the ball strikes the thigh pad.",
    "Umpire signals leg bye, no shot was offered.",
    "Quick leg bye taken after the ball hits the pad.",
    "The fielder misses and they scramble a leg bye.",
    "Ball deflected off the pads and they run a leg bye.",
    "Leg bye signaled, good running between the wickets.",
    "They pick up a leg bye, keeping the scoreboard ticking."
  ],
  
  bye: [
    "Bye signaled as the ball beats everyone!",
    "The keeper misses and they run a bye!",
    "Bye added to the total as the ball races past the keeper.",
    "The ball went through and they get a bye.",
    "A bye is signaled by the umpire.",
    "That beats the keeper and they run a bye.",
    "Quick thinking allows them to take a bye.",
    "Keeper fumbles and they manage a bye.",
    "Good running after the ball beats the keeper for a bye.",
    "They add a bye to the total."
  ],
  
  dot: [
    "Good line and length, no run.",
    "Defended solidly by the batsman.",
    "Played carefully back to the bowler, no run.",
    "A swing and a miss! No run there.",
    "The batsman shoulders arms, letting that one go.",
    "Probing delivery, watchfully played for no run.",
    "Dot ball! Good defensive technique.",
    "Pushed into the covers but there's no run available.",
    "Quick delivery, no run scored.",
    "Played with soft hands but can't find the gap, no run."
  ],
  
  overStart: [
    "New over about to begin.",
    "Fresh over, let's see what happens.",
    "New bowler coming into the attack.",
    "Change of ends for the bowler.",
    "New over, fresh approach needed.",
    "Bowler preparing for the new over.",
    "Let's see what this over brings.",
    "Field changes for the new over.",
    "Captain adjusts the field for the fresh over.",
    "Batsman prepares to face the new over."
  ],
  
  overEnd: [
    "End of the over, [RUNS] runs from it.",
    "That's the over completed, [RUNS] runs and [WICKETS] wicket.",
    "[RUNS] runs came from that over. Good bowling.",
    "A productive over for the batting side, adding [RUNS] runs.",
    "Just [RUNS] runs from the over, bowler keeping it tight.",
    "Over completed, [RUNS] runs and [WICKETS] wickets in that one.",
    "That's the end of a [RUNS]-run over.",
    "A tight over yielding only [RUNS] runs.",
    "Over finished with [RUNS] runs on the board.",
    "[RUNS] runs and [WICKETS] wicket from that over. Match situation changing."
  ],
  
  innings: [
    "End of the innings! The team finishes on [SCORE]/[WICKETS].",
    "Innings complete with a total of [SCORE] for [WICKETS].",
    "That's it for the first innings, target is [SCORE] runs.",
    "Final score: [SCORE]/[WICKETS] from [OVERS] overs.",
    "Innings wrapped up with [SCORE] runs on the board.",
    "The innings concludes at [SCORE]/[WICKETS].",
    "Final total is [SCORE] runs for the loss of [WICKETS] wickets.",
    "End of innings! [SCORE]/[WICKETS] is what the team managed.",
    "The team sets a target of [SCORE] runs to win.",
    "[SCORE]/[WICKETS] is the final score after [OVERS] overs."
  ],
  
  matchStart: [
    "Welcome to this exciting match! The captains are heading out for the toss.",
    "Perfect conditions for cricket today as we get ready for the match to begin.",
    "Players taking the field as we're about to get underway!",
    "Excitement in the air as this crucial match is about to start!",
    "A big match on the cards today, teams looking ready for battle!",
    "We're all set for what promises to be a thrilling encounter!",
    "The atmosphere is electric as the teams prepare to take the field!",
    "Players are finishing their warm-ups as we approach the start time!",
    "A lot at stake in this important fixture that's about to begin!",
    "The stage is set for an enthralling contest between these two sides!"
  ],
  
  matchEnd: [
    "[TEAM] wins by [MARGIN] [UNIT]! What a performance!",
    "It's all over! [TEAM] has triumphed by [MARGIN] [UNIT]!",
    "Match complete! [TEAM] secures a convincing win by [MARGIN] [UNIT]!",
    "That's the end of the match with [TEAM] winning by [MARGIN] [UNIT]!",
    "Victory for [TEAM]! They've won by [MARGIN] [UNIT] in a great display!",
    "[TEAM] claims the match by [MARGIN] [UNIT] after a dominant showing!",
    "It's official! [TEAM] wins by [MARGIN] [UNIT] in this important fixture!",
    "The match is over! [TEAM] celebrates a [MARGIN]-[UNIT] victory!",
    "Final result: [TEAM] wins by [MARGIN] [UNIT]!",
    "And that's it! [TEAM] takes the match with a [MARGIN]-[UNIT] win!"
  ],
  
  milestone: [
    "FIFTY! A well-deserved half-century for the batsman!",
    "CENTURY! Magnificent hundred from the batsman!",
    "DOUBLE CENTURY! What an incredible innings!",
    "FIVE WICKETS! A brilliant five-wicket haul for the bowler!",
    "CENTURY PARTNERSHIP! The pair has added 100 runs together!",
    "HAT-TRICK! Three wickets in three balls! Sensational bowling!",
    "FASTEST FIFTY! That's the quickest half-century of the tournament!",
    "HIGHEST SCORE! A new personal best for the batsman!",
    "MAIDEN OVER! Six dot balls in a row from the bowler!",
    "RECORD PARTNERSHIP! This is now the highest partnership of the tournament!"
  ]
};

/**
 * Generate commentary for a cricket event
 * @param {string} eventType - Type of event (wicket, boundary, six, etc.)
 * @param {number} [runValue] - Optional run value for run events
 * @param {Object} [data] - Optional additional data for commentary
 * @returns {string} Generated commentary
 */
export const generateCommentary = (eventType, runValue = 0, data = {}) => {
  let commentary = '';
  
  // Select a random commentary template for the event type
  if (commentaryTemplates[eventType]) {
    commentary = getRandomElement(commentaryTemplates[eventType]);
  } else {
    // Default commentary if event type is not recognized
    commentary = `The game continues with a ${eventType} event.`;
  }
  
  // Replace placeholders with actual data
  if (eventType === 'run' && runValue > 0) {
    commentary = commentary.replace(/a quick single|a couple of runs|a well-judged three runs/, `${runValue} run${runValue > 1 ? 's' : ''}`);
  } else if (eventType === 'overEnd') {
    commentary = commentary
      .replace('[RUNS]', data.runs || 0)
      .replace('[WICKETS]', data.wickets || 0);
  } else if (eventType === 'innings') {
    commentary = commentary
      .replace('[SCORE]', data.score || 0)
      .replace('[WICKETS]', data.wickets || 0)
      .replace('[OVERS]', data.overs || 0);
  } else if (eventType === 'matchEnd') {
    commentary = commentary
      .replace('[TEAM]', data.team || 'The team')
      .replace('[MARGIN]', data.margin || 0)
      .replace('[UNIT]', data.unit || 'runs');
  }
  
  return commentary;
};

/**
 * Generate a sequence of commentary for a match
 * @param {number} sequenceLength - Number of commentary items to generate
 * @param {string} matchPhase - Phase of the match (start, middle, end)
 * @returns {Array} Array of commentary objects
 */
export const generateCommentarySequence = (sequenceLength = 5, matchPhase = 'middle') => {
  const sequence = [];
  const eventTypes = ['run', 'dot', 'boundary', 'six', 'wide', 'wicket'];
  const eventWeights = {
    run: 40,
    dot: 30,
    boundary: 15,
    six: 5,
    wide: 5,
    wicket: 5
  };
  
  // Adjust weights based on match phase
  if (matchPhase === 'start') {
    eventWeights.boundary = 10;
    eventWeights.six = 3;
    eventWeights.wicket = 7;
  } else if (matchPhase === 'end') {
    eventWeights.boundary = 20;
    eventWeights.six = 10;
    eventWeights.wicket = 10;
  }
  
  // Generate sequence
  for (let i = 0; i < sequenceLength; i++) {
    // Weighted random selection of event type
    let total = 0;
    const weights = eventTypes.map(type => {
      total += eventWeights[type];
      return total;
    });
    
    const random = Math.random() * total;
    let selectedEventType = eventTypes[0];
    
    for (let j = 0; j < weights.length; j++) {
      if (random <= weights[j]) {
        selectedEventType = eventTypes[j];
        break;
      }
    }
    
    // Generate run value for run events
    let runValue = 0;
    if (selectedEventType === 'run') {
      const runProbabilities = [1, 1, 1, 1, 2, 2, 3];
      runValue = runProbabilities[Math.floor(Math.random() * runProbabilities.length)];
    }
    
    // Generate commentary
    const commentary = generateCommentary(selectedEventType, runValue);
    
    // Add to sequence
    sequence.push({
      id: `commentary_${Date.now()}_${i}`,
      text: commentary,
      type: selectedEventType,
      timestamp: new Date().toISOString()
    });
  }
  
  return sequence;
};

// Export all functions and templates
export default {
  generateCommentary,
  generateCommentarySequence,
  commentaryTemplates
};