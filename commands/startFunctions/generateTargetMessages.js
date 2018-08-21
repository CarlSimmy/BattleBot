module.exports = ( bot, event, eventPlayers, effectedTargetsMessages ) => {
  const health0 = bot.emojis.find(emoji => emoji.name === 'health0');
  const health5 = bot.emojis.find(emoji => emoji.name === 'health5');
  const health10 = bot.emojis.find(emoji => emoji.name === 'health10');
  const health15 = bot.emojis.find(emoji => emoji.name === 'health15');
  const health20 = bot.emojis.find(emoji => emoji.name === 'health20');
  const health25 = bot.emojis.find(emoji => emoji.name === 'health25');

  event.effectedTargets.forEach((target, idx) => {
    let targetHealth = eventPlayers[target].health;
    let targetName = eventPlayers[target].name;

    /* Ticks for health to display a health bar based on 5's  */
    let healthTicks = Math.round(targetHealth / 5) * 5;
    if ( healthTicks === 0 && targetHealth > 0 ) healthTicks = 10;

    /* Health bar made up of 4 emojis with 25hp each to diplay HP */
    let healthBar = `${health25}${health25}${health25}${health25}`;
    if ( healthTicks > 100 ) { healthBar = `${health25}${health25}${health25}${health25}${eval('health' + (healthTicks - 100))}`; }
    if ( healthTicks >= 75 && healthTicks <= 100 ) { healthBar = `${health25}${health25}${health25}${eval('health' + (healthTicks - 75))}`; }
    if ( healthTicks >= 50 && healthTicks < 75 ) { healthBar = `${health25}${health25}${eval('health' + (healthTicks - 50))}${health0}`; }
    if ( healthTicks >= 25 && healthTicks < 50 ) { healthBar = `${health25}${eval('health' + (healthTicks - 25))}${health0}${health0}`; }
    if ( healthTicks >= 0 && healthTicks < 25 ) { healthBar = `${eval('health' + healthTicks)}${health0}${health0}${health0}`; }

    /* Push a message for each effected target so we can loop through and output all of them later */
    if ( event.targets !== 'all' ) {
      effectedTargetsMessages.push(`${targetName}  ${event.healthChange[idx] > 0 ? '\u21E7' : '\u21E9'}*${Math.abs(event.healthChange[idx])}HP*   ${healthBar}`);
    } else {
      effectedTargetsMessages.push(`${targetName}  ${event.healthChange[0] > 0 ? '\u21E7' : '\u21E9'}*${Math.abs(event.healthChange[0])}HP*   ${healthBar}`);
    }    
  })
}