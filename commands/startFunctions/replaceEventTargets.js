module.exports = ( event, playerList, eventTargetIdxs, obtainedItem ) => {
  let activeTarget = -1; // Increasing counter to replace <player> with first active target, then second etc.

  let replacedEvent = event.description.trim().split(/[ ]+/).map(word => {
    if ( word === '<player>' ) {
      activeTarget++;
      if ( event.effectedTargets[activeTarget] === activeTarget ) { // If the player is an effected target, add underline.
        return `__**${playerList[eventTargetIdxs[activeTarget]].name}**__`
      }
      return `**${playerList[eventTargetIdxs[activeTarget]].name}**`
    } else if ( word === '<item>' ) {
      return `**${obtainedItem.name}**`;
    } else {
      return word;
    }
  });

  return `${replacedEvent.join(' ')}.`;
}