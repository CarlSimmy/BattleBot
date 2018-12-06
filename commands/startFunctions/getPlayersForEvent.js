module.exports = ( event, randomUniqueFrom, playerList, setEffectedTargets, eventTargetIdxs, nextPlayer ) => {
  let tempPlayers = [];
  
  if ( event.targets === 'all' ) {
    let tempEffected = [];

    playerList.forEach((player, idx) => {
      tempPlayers.push(player);
      tempEffected.push(idx);
    })

    setEffectedTargets(tempEffected);
  } else if ( nextPlayer ) {
    tempPlayers.push(nextPlayer);
  } else {
    for ( let i = 0; i < event.targets; i++ ) {
      tempPlayers.push(randomUniqueFrom(playerList, tempPlayers));
    }
  }

  /* Pushing the playerList index/ices of the targeted player(s) for correct mapping to the playerList */
  tempPlayers.forEach(target => eventTargetIdxs.push(playerList.indexOf(target)));
}