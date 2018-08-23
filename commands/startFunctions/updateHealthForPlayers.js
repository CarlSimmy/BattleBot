module.exports = ( event, playerList, eventPlayers, deadPlayers, increasePlayersDied, breakArmor ) => {
  let tempDeadPlayers = []; // For keeping track of dead players before removing them from the playerList.
  let eventTargetIdxs = [];

  /* Pushing the playerList index/ices of the targeted player(s) to map correctly between eventPlayers and playerList */
  event.effectedTargets.forEach(target => eventTargetIdxs.push(playerList.indexOf(eventPlayers[target])));

  function changePlayerHealth(currentTarget, eventChange) {
    let healthChange = eventChange + currentTarget.equipment.armor.value;
    if ( eventChange > 0 ) healthChange = eventChange;
    currentTarget.health += (healthChange > 0 && eventChange < 0) ? 0 : healthChange; // If armor left & event deals damage, remove all damage. Otherwise deal damage or gain health.
    currentTarget.equipment.armor.value += eventChange > 0 ? 0 : eventChange; // If you gain HP, don't add it to armor.
    currentTarget.equipment.armor.value <= 0 && breakArmor(currentTarget); // Remove armor if it takes more damage than its value.
  }

  for ( let i = 0; i < eventTargetIdxs.length; i++ ) {
    let currentTarget = playerList[eventTargetIdxs[i]];
    
    if ( event.targets !== 'all' ) {
      changePlayerHealth(currentTarget, event.healthChange[i]);
    } else {
      changePlayerHealth(currentTarget, event.healthChange[0]);
    }

    if ( currentTarget.health > 100 ) currentTarget.health = 100;        

    /* When a player dies move them from playerList -> deadPlayers and set how many players died this round to send R.I.P messages
        Very important; This means that eventPlayers will still be remaning and can be read to type out data while a player from playerList is removed. */
    if ( currentTarget.health <= 0 ) {
      currentTarget.health = 0;
      tempDeadPlayers.push(currentTarget);
      increasePlayersDied();
    }
  }

  tempDeadPlayers.forEach(player => deadPlayers.push(...playerList.splice(playerList.indexOf(player), 1)));
}