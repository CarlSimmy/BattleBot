module.exports = ( event, eventPlayers, randomUniqueFrom, playerList, setEffectedTargets, eventTargetIdxs ) => {
  if ( event.targets !== 'all' ) {
    for ( let i = 0; i < event.targets; i++ ) {
      eventPlayers.push(randomUniqueFrom(playerList, eventPlayers));
    }
  } else {
    let tempEffected = [];

    playerList.forEach((player, idx) => {
      eventPlayers.push(player);
      tempEffected.push(idx);
    })

    setEffectedTargets(tempEffected);
  }

  /* Pushing the playerList index/ices of the targeted player(s) to map correctly between eventPlayers and playerList */
  event.effectedTargets.forEach(target => eventTargetIdxs.push(playerList.indexOf(eventPlayers[target])));
}