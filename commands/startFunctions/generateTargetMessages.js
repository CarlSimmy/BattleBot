module.exports = ( bot, event, playerList, eventTargetIdxs, effectedTargetsMessages ) => {
  const health0 = bot.emojis.find(emoji => emoji.name === 'health0');
  const health5 = bot.emojis.find(emoji => emoji.name === 'health5');
  const health10 = bot.emojis.find(emoji => emoji.name === 'health10');
  const health15 = bot.emojis.find(emoji => emoji.name === 'health15');
  const health20 = bot.emojis.find(emoji => emoji.name === 'health20');
  const health25 = bot.emojis.find(emoji => emoji.name === 'health25');
  // TODO: Lägg till röda bars med HP 5->25 för att kunna visa typ 125/130hp <- 5 extra hp max

  const armor0 = ''; // Don't need to show anything for armor0, just define it.
  const armor5 = bot.emojis.find(emoji => emoji.name === 'armor5');
  const armor10 = bot.emojis.find(emoji => emoji.name === 'armor10');
  const armor15 = bot.emojis.find(emoji => emoji.name === 'armor15');
  const armor20 = bot.emojis.find(emoji => emoji.name === 'armor20');
  const armor25 = bot.emojis.find(emoji => emoji.name === 'armor25');

  event.effectedTargets.forEach((target, idx) => {
    let targetHealth = playerList[eventTargetIdxs[target]].health;
    let targetMaxHealth = playerList[eventTargetIdxs[target]].maxHealth;
    let targetName = playerList[eventTargetIdxs[target]].name;
    let targetArmor = playerList[eventTargetIdxs[target]].equipment.armor.value;

    /* Ticks for health to display a health bar based on 5's  */
    let healthTicks = Math.round(targetHealth / 5) * 5;
    if ( healthTicks === 0 && targetHealth > 0 ) healthTicks = 5;

    let armorTicks = Math.round(targetArmor / 5) * 5;
    if ( armorTicks <= 0 && targetArmor > 0 ) armorTicks = 5;

    /* Health bar made up of emojis consisting of 25hp each to display the HP correctly */
    let healthBar = '';
    let numFullBars = Math.floor(healthTicks / 25); // Number of full healthBars.
    let numEmptyBars = Math.floor((targetMaxHealth / 25) - (healthTicks / 25)); // Number of bars possible to fill up.
    let overflowHealth = healthTicks - (numFullBars * 25);

    // TODO: Lägg till tomma healthbars med mindre än 25hp i slutet.
    for ( let i = 0; i < numFullBars; i++ ) {
      healthBar += health25;
    }

    if ( overflowHealth > 0 ) {
      healthBar += `${eval('health' + overflowHealth)}`;
    }

    for ( let i = 0; i < numEmptyBars; i++ ) {
      healthBar += health0;
    }

    let armorBar = '';
    if ( targetArmor > 0 ) {
      let armorPart = `${armor25}`;
      let numArmorBars = Math.ceil(targetArmor / 25);
      armorBar = armorPart.repeat(numArmorBars - 1) + `${eval('armor' + (armorTicks - ((numArmorBars - 1) * 25)))}`; // Number of complete armor bars + partial, e.g. ${armor25}${armor25}${armor5}.
    }

    /* Push a message for each effected target so we can loop through and output all of them later */
    if ( event.targets !== 'all' ) {
      // Should include more cases later. Maybe add this to all aswell if everyone should be able to get armor from an event?
      switch( event.itemType ) {
        case 'armor':
          effectedTargetsMessages.push(`${targetName}  \u21E7*${Math.abs(targetArmor)} ARMOR*   ${healthBar} ${armorBar}`);
          break;
        default:
          effectedTargetsMessages.push(`${targetName}  ${event.healthChange[idx] > 0 ? '\u21E7' : '\u21E9'}*${Math.abs(event.healthChange[idx])}${event.type === 'persistent' ? ' MAX ' : ''}HP*   ${healthBar} ${armorBar}`);
          break;
      }
    } else {
      effectedTargetsMessages.push(`${targetName}  ${event.healthChange[0] > 0 ? '\u21E7' : '\u21E9'}*${Math.abs(event.healthChange[0])}${event.type === 'persistent' ? ' MAX ' : ''}HP*   ${healthBar} ${armorBar}`);
    }    
  })
}