module.exports = ( event, eventPlayers, randomFrom, playerList, setEffectedTargets ) => {
  if ( event.targets !== 'all' ) {
    for ( let i = 0; i < event.targets; i++ ) {
      let player = randomFrom(playerList);

      while ( eventPlayers.indexOf(player) !== -1 ) {
        player = randomFrom(playerList);
      }

      eventPlayers.push(player);
    }
  } else {
    let tempEffected = [];

    playerList.forEach((player, idx) => {
      eventPlayers.push(player);
      tempEffected.push(idx);
    })

    setEffectedTargets(tempEffected); // Update effected targets in events.json since there are no effected targets by default because we can't predict the number of players before the game.
  }
}