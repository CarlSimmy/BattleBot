module.exports = ( event, eventPlayers ) => {
  let activeTarget = -1; // Increasing counter to replace <player> with first active target, then second etc.

  let replacedEvent = event.description.trim().split(/[ ,.]+/).map(word => {
    if ( word === '<player>' ) {
      activeTarget++; // To be able to check first player[0] against effected (which can be player[2]) and then check second player[1] against effected and so on.

      /* If first player is an effected target type it out with underline */
      for ( let i = 0; i < event.effectedTargets.length; i++ ) {            
        if ( eventPlayers[activeTarget] === eventPlayers[event.effectedTargets[i]] ) return `__**${eventPlayers[activeTarget].name}**__`;
      }
      return `**${eventPlayers[activeTarget].name}**`; // If the first player is not a target
    } else {
      return word;
    }
  });

  return `${replacedEvent.join(' ')}.`;
}