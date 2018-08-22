module.exports = ( event, playerList, eventPlayers, playersDied, deadPlayers, increasePlayersDied, breakArmor ) => {
  var internalPlayersDied = playersDied; // For tracking internally while looping since the updated data is not imported.
  let eventTargetIdxs = [];

  /* Pushing the playerList index/ices of the targeted player(s) to map correctly between eventPlayers and playerList */
  event.effectedTargets.forEach(target => eventTargetIdxs.push(playerList.indexOf(eventPlayers[target])));

  for ( let i = 0; i < eventTargetIdxs.length; i++ ) {
    let currentTarget = playerList[eventTargetIdxs[i - internalPlayersDied]]; // If a player dies the array gets smaller and therefore we need to adjust our index positioning.
    let excessDamage = 0;
    if ( event.targets !== 'all' ) {
      // Looks pretty ugly with all If/else nesting, clean up?
      if ( currentTarget.equipment.armor.value > 0 && event.healthChange[i] < 0 ) { // If target has armor and event deals damage to prevent adding armor from gaining HP.
        excessDamage = event.healthChange[i] + currentTarget.equipment.armor.value;
        currentTarget.equipment.armor.value += event.healthChange[i];
        if ( currentTarget.equipment.armor.value < 0 ) currentTarget.equipment.armor.value = 0; // Armor can't go below 0

        currentTarget.health += currentTarget.equipment.armor.value > 0 ? 0 : excessDamage; // Targeted player changes health by corresponding healthChange in the event, reduced by armor.
      } else {
        currentTarget.health += event.healthChange[i]; // Changing health normally if target has no armor or gains HP.
      }

      if ( currentTarget.equipment.armor.value <= 0 ) breakArmor(currentTarget); // Remove armor if it takes more damage than its value.
    } else {
      if ( currentTarget.equipment.armor.value > 0 && event.healthChange[0] < 0 ) { // If target has armor and event deals damage to prevent adding armor from gaining HP.
        excessDamage = event.healthChange[0] + currentTarget.equipment.armor.value;
        currentTarget.equipment.armor.value += event.healthChange[0];
        if ( currentTarget.equipment.armor.value < 0 ) currentTarget.equipment.armor.value = 0; // Armor can't go below 0

        currentTarget.health += currentTarget.equipment.armor.value > 0 ? 0 : excessDamage; // Targeted player changes health by corresponding healthChange in the event, reduced by armor.
      } else {
        currentTarget.health += event.healthChange[0]; // Changing health normally if target has no armor or gains HP.
      }

      if ( currentTarget.equipment.armor.value <= 0 ) breakArmor(currentTarget); // Remove armor if it takes more damage than its value.
    }

    if ( currentTarget.health > 100 ) currentTarget.health = 100;        

    /* When a player dies move them from playerList -> deadPlayers and set how many players died this round to send R.I.P messages
        Very important; This means that eventPlayers will still be remaning and can be read to type out data while a player from playerList is removed. */
    if ( currentTarget.health <= 0 ) {
      currentTarget.health = 0;
      deadPlayers.push(...playerList.splice(playerList.indexOf(currentTarget), 1));
      internalPlayersDied++;
      increasePlayersDied();
    }
  }
}