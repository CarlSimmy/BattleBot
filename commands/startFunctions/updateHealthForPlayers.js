module.exports = ( event, playerList, increasePlayersDied, breakArmor, eventTargetIdxs ) => {
  const changePlayerHealth = (currentTarget, eventChange) => {
    let healthChange = eventChange + currentTarget.equipment.armor.value;
    if ( eventChange > 0 ) healthChange = eventChange;
    currentTarget.health += (healthChange > 0 && eventChange < 0) ? 0 : healthChange; // If armor left & event deals damage, remove all damage. Otherwise deal damage or gain health.
    currentTarget.equipment.armor.value += eventChange > 0 ? 0 : eventChange; // If you gain HP, don't add it to armor.
    currentTarget.equipment.armor.value <= 0 && breakArmor(currentTarget); // Remove armor if it takes more damage than its value.
  }

  for ( let i = 0; i < event.effectedTargets.length; i++ ) {
    let currentTarget = playerList[eventTargetIdxs[event.effectedTargets[i]]];
    
    if ( event.targets !== 'all' ) {
      changePlayerHealth(currentTarget, event.healthChange[i]);
    } else {
      changePlayerHealth(currentTarget, event.healthChange[0]);
    }

    if ( currentTarget.health > 100 ) currentTarget.health = 100;        

    /* When a player dies, track it to see how many died for this specific round when outputting R.I.P messages later */
    if ( currentTarget.health <= 0 ) {
      currentTarget.health = 0;
      increasePlayersDied();
    }
  }
}