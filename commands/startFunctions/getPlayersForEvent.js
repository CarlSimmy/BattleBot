module.exports = ( event, randomUniqueFrom, playerList, setEffectedTargets, eventTargetIdxs ) => {
  let tempPlayers = [];
  
  if ( event.targets !== 'all' ) {
    for ( let i = 0; i < event.targets; i++ ) {
      tempPlayers.push(randomUniqueFrom(playerList, tempPlayers));
    }
  } else {
    let tempEffected = [];

    playerList.forEach((player, idx) => {
      tempPlayers.push(player);
      tempEffected.push(idx);
    })

    setEffectedTargets(tempEffected);
  }

  /* Pushing the playerList index/ices of the targeted player(s) for correct mapping to the playerList */
  tempPlayers.forEach(target => eventTargetIdxs.push(playerList.indexOf(target)));
}