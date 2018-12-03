module.exports = ( event, playerList, eventTargetIdxs, obtainedItem ) => {

  let replacedEvent = event.description.trim().split(/[ ]+/).map(word => {
    if ( word.includes('[') && word.includes(']') ) {
      let targetIdx = parseInt(word.replace(/[\[\]']+/g,''))
      
      if ( event.effectedTargets.includes(targetIdx) ) { // If the player is an effected target, add underline.
        return `__**${playerList[eventTargetIdxs[targetIdx]].name}**__`
      }
      return `**${playerList[eventTargetIdxs[targetIdx]].name}**`
    } else if ( word === '<item>' ) {
      return `**${obtainedItem.name}**`;
    } else {
      return word;
    }
  });

  return `${replacedEvent.join(' ')}.`;
}