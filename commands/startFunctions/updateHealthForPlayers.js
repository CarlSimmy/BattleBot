module.exports = ( event, playerList, eventPlayers, playersDied, deadPlayers, increasePlayersDied ) => {
  let eventTargetIdxs = [];

  /* Pushing the playerList index/ices of the targeted player(s) to map correctly between eventPlayers and playerList */
  event.effectedTargets.forEach(target => eventTargetIdxs.push(playerList.indexOf(eventPlayers[target])));
  
  for ( let i = 0; i < eventTargetIdxs.length; i++ ) {
    let currentTarget = playerList[eventTargetIdxs[i - playersDied]]; // If a player dies the array gets smaller and therefore we need to adjust our index positioning.

    if ( event.targets !== 'all' ) {
      currentTarget.health += event.healthChange[i]; // Targeted player changes health by corresponding healthChange in the event.
    } else {
      currentTarget.health += event.healthChange[0] // When all players in the game lose the same amount of health which is the first healthChange value.
    }

    if ( currentTarget.health > 100 ) currentTarget.health = 100; // Health can't go beyond 100 which is max.        

    /* When a player dies move them from playerList -> deadPlayers and set how many players died this round to send R.I.P messages
        Very important; This means that eventPlayers will still be remaning and can be read to type out data while a player from playerList is removed. */
    if ( currentTarget.health <= 0 ) {
      currentTarget.health = 0;
      deadPlayers.push(...playerList.splice(playerList.indexOf(currentTarget), 1));
      increasePlayersDied();
    }
  }
}